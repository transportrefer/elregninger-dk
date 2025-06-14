import { z } from 'zod';

// Zod schema for Danish electricity bill analysis
export const billAnalysisSchema = z.object({
  providerName: z.string().nullable(),
  productName: z.string().nullable(),
  priceType: z.enum(['fixed', 'variable', 'unknown']).nullable(),
  isFinalSettlement: z.boolean().nullable(),
  isGreenEnergy: z.boolean().nullable(),
  consumptionPeriod: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }).nullable(),
  totalConsumption_kWh: z.coerce.number().positive().nullable(),
  costBreakdown_DKK: z.object({
    pureElectricity: z.coerce.number().nonnegative().nullable(),
    transportAndGrid: z.coerce.number().nonnegative().nullable(),
    stateTaxes: z.coerce.number().nonnegative().nullable(),
    elafgift: z.coerce.number().nonnegative().nullable(),
    psoAfgift: z.coerce.number().nonnegative().nullable(),
    providerSubscriptions: z.coerce.number().nonnegative().nullable(),
    oneOffFees: z.coerce.number().nonnegative().nullable(),
    vat: z.coerce.number().nonnegative().nullable()
  }).nullable(),
  totalAmountForConsumption_DKK: z.coerce.number().nullable(),
  averagePrice_kr_per_kWh: z.coerce.number().positive().nullable(),
  pricePeriods: z.array(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pricePerKwh: z.coerce.number().positive()
  })).nullable(),
  notes: z.string().nullable()
});

export type BillAnalysis = z.infer<typeof billAnalysisSchema>;

// Validation tiers as defined in PRD
export const validateTier1 = (data: unknown): boolean => {
  try {
    const tier1Schema = z.object({
      totalConsumption_kWh: z.number().positive(),
      totalAmountForConsumption_DKK: z.number()
    });
    tier1Schema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const validateTier2 = (data: unknown): boolean => {
  try {
    const tier2Schema = z.object({
      providerName: z.string(),
      costBreakdown_DKK: z.object({}).passthrough(),
      consumptionPeriod: z.object({
        startDate: z.string(),
        endDate: z.string()
      })
    });
    tier2Schema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const validateTier3 = (data: unknown): boolean => {
  try {
    const tier3Schema = z.object({
      priceType: z.enum(['fixed', 'variable', 'unknown']),
      isGreenEnergy: z.boolean(),
      pricePeriods: z.array(z.object({})).nullable()
    });
    tier3Schema.parse(data);
    return true;
  } catch {
    return false;
  }
};