import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { billAnalysisSchema, validateTier1, validateTier2, validateTier3 } from '@/lib/schemas';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Simple working prompt - will improve incrementally
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

### EKSEMPLER

**Eksempel 1: Vindstød regning**
{
  "providerName": "Vindstød",
  "productName": "Grøn strøm variabel",
  "priceType": "variable",
  "isFinalSettlement": true,
  "isGreenEnergy": true,
  "consumptionPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-31"
  },
  "totalConsumption_kWh": 1205,
  "costBreakdown_DKK": {
    "pureElectricity": 542.75,
    "transportAndGrid": 891.23,
    "stateTaxes": null,
    "elafgift": 107.45,
    "psoAfgift": 45.67,
    "providerSubscriptions": null,
    "oneOffFees": null,
    "vat": 245.45
  },
  "totalAmountForConsumption_DKK": 1832.55,
  "averagePrice_kr_per_kWh": 1.52,
  "pricePeriods": [
    {
      "startDate": "2024-01-01",
      "endDate": "2024-03-31",
      "pricePerKwh": 1.52
    }
  ],
  "notes": null
}

**Eksempel 2: EWII regning**  
{
  "providerName": "EWII",
  "productName": "El Fix 12",
  "priceType": "fixed",
  "isFinalSettlement": false,
  "isGreenEnergy": null,
  "consumptionPeriod": {
    "startDate": "2024-02-01",
    "endDate": "2024-02-29"
  },
  "totalConsumption_kWh": 350,
  "costBreakdown_DKK": {
    "pureElectricity": 280.00,
    "transportAndGrid": 456.30,
    "stateTaxes": null,
    "elafgift": 31.15,
    "psoAfgift": 12.50,
    "providerSubscriptions": 29.00,
    "oneOffFees": null,
    "vat": 202.24
  },
  "totalAmountForConsumption_DKK": 1011.19,
  "averagePrice_kr_per_kWh": 2.89,
  "pricePeriods": [
    {
      "startDate": "2024-02-01",
      "endDate": "2024-02-29",
      "pricePerKwh": 0.80
    }
  ],
  "notes": null
}

Almindelige danske eludbydere: Vindstød, Andel Energi, Norlys, Ørsted, Ewii, E.ON, Energi+, Strømlinet, etc.
Almindelige linjer på danske elregninger: Elafgift, PSO-afgift, Nettarif, Transport, Moms (25%)

Analyser kun billedet og returner gyldig JSON som vist i eksemplerne.
`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    // More robust file validation
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Ingen fil blev uploadet.' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Ikke-understøttet filtype. Vælg PDF, PNG eller JPG.'
      }, { status: 400 });
    }
    
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Filen er for stor. Maksimal størrelse er 10MB.'
      }, { status: 400 });
    }

    // Convert file to buffer for Gemini API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Prepare for Gemini API - Use 2.5 Flash Preview as requested
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
    
    const imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: file.type
      }
    };

    // Call Gemini API with JSON mode to force valid JSON output
    const result = await model.generateContent([ANALYSIS_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // With JSON mode, response should be direct JSON. Add fallback parsing.
    let analysisData;
    try {
      // First, try parsing directly (JSON mode should give clean JSON)
      analysisData = JSON.parse(text);
    } catch {
      // Fallback: extract JSON from wrapped text using regex
      const jsonString = text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonString) {
        console.error("Gemini response did not contain a JSON object. Raw response:", text);
        return NextResponse.json({ 
          error: 'Kunne ikke analysere svaret fra AI-tjenesten. Regningen er muligvis ulæselig.',
          tier: 'failed',
          rawResponse: text
        }, { status: 502 });
      }
      
      try {
        analysisData = JSON.parse(jsonString);
      } catch {
        console.error("Failed to parse JSON from Gemini response. String was:", jsonString);
        return NextResponse.json({ 
          error: 'Modtog et ugyldigt format fra AI-tjenesten.',
          tier: 'failed',
          rawResponse: text
        }, { status: 502 });
      }
    }

    // Safely validate with Zod schema
    const validationResult = billAnalysisSchema.safeParse(analysisData);
    if (!validationResult.success) {
      console.error("Zod validation failed:", validationResult.error.flatten());
      return NextResponse.json({
        error: 'De udtrukne data levede ikke op til kvalitetskravene. Prøv evt. et tydeligere billede.',
        tier: 'failed',
        zodErrors: validationResult.error.flatten(),
        rawResponse: text
      }, { status: 422 });
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

    // Cross-field validation - sanity check totals
    if (validatedData.costBreakdown_DKK && validatedData.totalAmountForConsumption_DKK) {
      const breakdownSum = Object.values(validatedData.costBreakdown_DKK).reduce((acc, val) => (acc ?? 0) + (val ?? 0), 0) ?? 0;
      const total = validatedData.totalAmountForConsumption_DKK ?? 0;
      
      if (Math.abs(breakdownSum - total) > 1) {
        console.warn(`Warning: Cost breakdown sum (${breakdownSum}) does not match total amount (${total})`);
      }
    }

    return NextResponse.json({
      success: true,
      data: validatedData,
      tier,
      rawResponse: text // For debugging during spike
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({
      error: 'En uventet teknisk fejl opstod. Prøv venligst igen.',
      tier: 'failed'
    }, { status: 500 });
  }
}

