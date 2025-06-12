import { BillAnalysis } from './schemas';

export interface AnalysisResult {
  success: boolean;
  data?: BillAnalysis;
  tier: 'full' | 'partial' | 'basic' | 'failed';
  warning?: string;
  error?: string;
  rawResponse?: string;
}