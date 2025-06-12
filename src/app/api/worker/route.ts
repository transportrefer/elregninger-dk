import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findJobsByStatus, findZombieJobs, markJobFailed, markJobCompleted, updateJobStatus, incrementRetryCount } from '@/lib/job-manager';
import { downloadFromBlob, deleteFromBlob } from '@/lib/blob-storage';
import { billAnalysisSchema, validateTier1, validateTier2, validateTier3 } from '@/lib/schemas';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Reuse the existing analysis prompt from the current implementation
const ANALYSIS_PROMPT = `
Du er en ekspert i analyse af danske elregninger. Analyser det uploadede billede/PDF og udtræk følgende data i JSON format.

VIGTIGT: 
- Returner ALLE tal med punktum som decimal-separator (f.eks. 1234.56, ikke 1234,56)
- Returner ALLE datoer i YYYY-MM-DD format
- Hvis du er usikker på en værdi, returner null i stedet for at gætte
- Dit svar skal være RENT JSON uden forklaringer eller markdown

Retning JSON format:
{
  "providerName": "string eller null",
  "productName": "string eller null", 
  "priceType": "fixed" | "variable" | "unknown" | null,
  "isFinalSettlement": boolean eller null,
  "isGreenEnergy": boolean eller null,
  "consumptionPeriod": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  } eller null,
  "totalConsumption_kWh": number eller null,
  "costBreakdown_DKK": {
    "pureElectricity": number eller null,
    "transportAndGrid": number eller null,
    "stateTaxes": number eller null,
    "elafgift": number eller null,
    "psoAfgift": number eller null,
    "providerSubscriptions": number eller null,
    "oneOffFees": number eller null,
    "vat": number eller null
  } eller null,
  "totalAmountForConsumption_DKK": number eller null,
  "averagePrice_kr_per_kWh": number eller null,
  "pricePeriods": [
    {
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD", 
      "pricePerKwh": number
    }
  ] eller null,
  "notes": "string eller null"
}

Fokuser især på at finde:
1. KRITISK: totalConsumption_kWh og totalAmountForConsumption_DKK
2. VIGTIGT: providerName, costBreakdown_DKK, consumptionPeriod
3. NICE-TO-HAVE: priceType, isGreenEnergy, pricePeriods

Almindelige danske eludbydere: Vindstød, Andel Energi, Norlys, Ørsted, Ewii, E.ON, Energi+, Strømlinet, etc.
Almindelige linjer på danske elregninger: Elafgift, PSO-afgift, Nettarif, Transport, Moms (25%)

Analyser kun billedet og returner gyldig JSON som vist i eksemplerne.
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  console.log('🔄 Worker started at:', new Date().toISOString());
  
  try {
    // Find pending jobs to process
    const pendingJobs = await findJobsByStatus('PENDING_ANALYSIS', 5); // Process max 5 per run
    
    // Find zombie jobs (stuck in PROCESSING > 10 minutes)
    const zombieJobs = await findZombieJobs(10 * 60 * 1000);
    
    console.log(`📋 Found ${pendingJobs.length} pending jobs, ${zombieJobs.length} zombie jobs`);
    
    // Handle zombie jobs first
    for (const zombie of zombieJobs) {
      console.log(`🧟 Marking zombie job ${zombie.id} as failed`);
      await markJobFailed(zombie.id, 'Processing timeout - job exceeded maximum execution time');
      
      // Try to cleanup blob if it exists
      if (zombie.blobPath) {
        await deleteFromBlob(zombie.blobPath);
      }
    }
    
    // Process pending jobs
    let processedCount = 0;
    for (const job of pendingJobs) {
      try {
        await processJob(job);
        processedCount++;
      } catch (error) {
        console.error(`❌ Failed to process job ${job.id}:`, error);
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Worker completed: ${processedCount} processed, ${zombieJobs.length} zombies cleaned, ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      processed: processedCount,
      zombiesCleanedUp: zombieJobs.length,
      executionTime: totalTime
    });
    
  } catch (error) {
    console.error('❌ Worker error:', error);
    return NextResponse.json({
      error: 'Worker execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function processJob(job: { id: string; fileName?: string; url?: string; status: string; blobPath?: string }) {
  const jobStartTime = Date.now();
  console.log(`🚀 Processing job ${job.id}: ${job.fileName}`);
  
  try {
    // Mark job as processing
    await updateJobStatus(job.id, 'PROCESSING', {
      processingStartedAt: jobStartTime
    });
    
    // Download file from blob storage
    if (!job.blobPath || !job.fileName) {
      throw new Error('Missing blobPath or fileName');
    }
    console.log(`📥 Downloading file from: ${job.blobPath}`);
    const fileBuffer = await downloadFromBlob(job.blobPath);
    
    // Determine content type from file name
    const contentType = job.fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'image/jpeg';
    
    // Run Gemini analysis (reusing existing logic)
    console.log(`🤖 Starting Gemini analysis for job ${job.id}`);
    const result = await runGeminiAnalysis(fileBuffer, contentType);
    
    // Store result and mark as completed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await markJobCompleted(job.id, result as any);
    
    // Clean up blob storage
    await deleteFromBlob(job.blobPath);
    
    const processingTime = Date.now() - jobStartTime;
    console.log(`✅ Job ${job.id} completed successfully in ${processingTime}ms`);
    
  } catch (error) {
    console.error(`❌ Job ${job.id} processing failed:`, error);
    
    // Handle retries
    const newRetryCount = await incrementRetryCount(job.id);
    
    if (newRetryCount >= 3) {
      // Max retries exceeded - mark as permanently failed
      await markJobFailed(job.id, `Analysis failed after ${newRetryCount} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clean up blob storage for failed jobs
      if (job.blobPath) {
        await deleteFromBlob(job.blobPath);
      }
    }
    
    throw error; // Re-throw to be caught by caller
  }
}

async function runGeminiAnalysis(fileBuffer: Buffer, contentType: string) {
  const analysisStartTime = Date.now();
  
  // Prepare for Gemini API
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
  
  const imagePart = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType: contentType
    }
  };
  
  console.log(`🤖 Calling Gemini API with payload size: ${fileBuffer.toString('base64').length} chars`);
  
  // Call Gemini API
  const result = await model.generateContent([ANALYSIS_PROMPT, imagePart]);
  const response = await result.response;
  const text = response.text();
  
  const geminiTime = Date.now() - analysisStartTime;
  console.log(`🎯 Gemini API call took: ${geminiTime}ms`);
  
  // Parse JSON response (reusing existing logic)
  let analysisData;
  try {
    analysisData = JSON.parse(text);
  } catch {
    // Fallback: extract JSON from wrapped text
    const jsonString = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonString) {
      throw new Error('Could not extract JSON from Gemini response');
    }
    analysisData = JSON.parse(jsonString);
  }
  
  // Validate with Zod schema
  const validationResult = billAnalysisSchema.safeParse(analysisData);
  if (!validationResult.success) {
    throw new Error(`Schema validation failed: ${JSON.stringify(validationResult.error.flatten())}`);
  }
  
  const validatedData = validationResult.data;
  
  // Determine success tier
  const tier1Success = validateTier1(validatedData);
  const tier2Success = validateTier2(validatedData);
  const tier3Success = validateTier3(validatedData);
  
  let tier = 'failed';
  if (tier1Success && tier2Success && tier3Success) {
    tier = 'full';
  } else if (tier1Success && tier2Success) {
    tier = 'partial';
  } else if (tier1Success) {
    tier = 'basic';
  }
  
  return {
    success: true,
    data: validatedData,
    tier,
    processingTime: geminiTime,
    rawResponse: text
  };
}