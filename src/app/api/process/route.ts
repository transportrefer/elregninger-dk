import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getJob, updateJobStatus, markJobCompleted, markJobFailed, incrementRetryCount } from '@/lib/job-manager';
import { downloadFromBlob, deleteFromBlob } from '@/lib/blob-storage';
import { billAnalysisSchema, validateTier1, validateTier2, validateTier3 } from '@/lib/schemas';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Reuse the existing analysis prompt
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Security check - only accept internal calls
    const internalSecret = request.headers.get('x-internal-secret');
    const expectedSecret = process.env.INTERNAL_TRIGGER_SECRET || 'dev-secret';
    
    if (internalSecret !== expectedSecret) {
      console.log('❌ Unauthorized processing request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }
    
    console.log(`🔄 Processing job ${jobId} started at:`, new Date().toISOString());
    
    // Get job details
    const job = await getJob(jobId);
    
    if (!job) {
      console.log(`❌ Job ${jobId} not found`);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if job is already completed or failed
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      console.log(`ℹ️ Job ${jobId} already in final state: ${job.status}`);
      return NextResponse.json({ success: true, status: job.status });
    }
    
    // Check if job is stuck (processing for too long)
    if (job.status === 'PROCESSING' && job.processingStartedAt) {
      const processingTime = Date.now() - job.processingStartedAt;
      if (processingTime > 10 * 60 * 1000) { // 10 minutes
        console.log(`🧟 Job ${jobId} appears to be zombie (processing for ${processingTime}ms)`);
        await markJobFailed(jobId, 'Processing timeout - job exceeded maximum execution time');
        return NextResponse.json({ success: true, status: 'FAILED' });
      }
    }
    
    // Mark job as processing if not already
    if (job.status !== 'PROCESSING') {
      await updateJobStatus(jobId, 'PROCESSING', {
        processingStartedAt: Date.now()
      });
    }
    
    try {
      // Attempt to process the job within time budget (8 seconds max)
      const processingResult = await processJobWithTimeLimit(job, 8000);
      
      if (processingResult.completed && processingResult.result) {
        // Job completed successfully
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await markJobCompleted(jobId, processingResult.result as any);
        console.log(`✅ Job ${jobId} completed successfully`);
        
        // Clean up blob storage
        if (job.blobPath) {
          await deleteFromBlob(job.blobPath);
        }
        
      } else if (processingResult.shouldRetry) {
        // Job failed but can be retried
        const newRetryCount = await incrementRetryCount(jobId);
        
        if (newRetryCount >= 3) {
          // Max retries exceeded
          await markJobFailed(jobId, `Analysis failed after ${newRetryCount} attempts: ${processingResult.error}`);
          console.log(`❌ Job ${jobId} failed permanently after ${newRetryCount} attempts`);
          
          // Clean up blob storage for failed jobs
          if (job.blobPath) {
            await deleteFromBlob(job.blobPath);
          }
        } else {
          // Trigger another processing attempt
          console.log(`🔄 Triggering retry ${newRetryCount} for job ${jobId}`);
          await triggerNextProcessing(jobId);
        }
        
      } else {
        // Job timed out but is still processing - trigger continuation
        console.log(`⏱️ Job ${jobId} timed out, triggering continuation`);
        await triggerNextProcessing(jobId);
      }
      
    } catch (error) {
      console.error(`❌ Job ${jobId} processing error:`, error);
      
      // Handle processing error with retry logic
      const newRetryCount = await incrementRetryCount(jobId);
      
      if (newRetryCount >= 3) {
        await markJobFailed(jobId, `Processing error after ${newRetryCount} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        if (job.blobPath) {
          await deleteFromBlob(job.blobPath);
        }
      } else {
        await triggerNextProcessing(jobId);
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`📊 Processing chunk for job ${jobId} took ${totalTime}ms`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Processing endpoint error:', error);
    return NextResponse.json({
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function processJobWithTimeLimit(job: { id: string; fileName?: string; url?: string; status: string; blobPath?: string }, timeLimitMs: number) {
  const startTime = Date.now();
  
  try {
    console.log(`🤖 Starting Gemini analysis for job ${job.id}`);
    
    // Download file from blob storage
    if (!job.blobPath || !job.fileName) {
      throw new Error('Missing blobPath or fileName');
    }
    const fileBuffer = await downloadFromBlob(job.blobPath);
    
    // Determine content type
    const contentType = job.fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'image/jpeg';
    
    // Check time budget
    if (Date.now() - startTime > timeLimitMs - 1000) {
      return { completed: false, shouldRetry: false, error: 'Time budget exceeded before analysis' };
    }
    
    // Run Gemini analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
    
    const imagePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: contentType
      }
    };
    
    const result = await model.generateContent([ANALYSIS_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const processingTime = Date.now() - startTime;
    console.log(`🎯 Gemini analysis completed in ${processingTime}ms`);
    
    // Parse and validate result
    let analysisData;
    try {
      analysisData = JSON.parse(text);
    } catch {
      const jsonString = text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonString) {
        throw new Error('Could not extract JSON from Gemini response');
      }
      analysisData = JSON.parse(jsonString);
    }
    
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
      completed: true,
      result: {
        success: true,
        data: validatedData,
        tier,
        processingTime,
        rawResponse: text
      }
    };
    
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return {
      completed: false,
      shouldRetry: true,
      error: error instanceof Error ? error.message : 'Unknown analysis error'
    };
  }
}

async function triggerNextProcessing(jobId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    // Non-blocking fetch call to continue processing
    fetch(`${baseUrl}/api/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_TRIGGER_SECRET || 'dev-secret'
      },
      body: JSON.stringify({ jobId })
    }).catch(error => {
      console.error('Failed to trigger next processing:', error);
    });
    
    console.log(`🔄 Triggered next processing chunk for job ${jobId}`);
  } catch (error) {
    console.error('Error triggering next processing:', error);
  }
}