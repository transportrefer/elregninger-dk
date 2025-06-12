'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, XCircle, FileText, TrendingUp } from 'lucide-react';
import BillUpload from '@/components/upload/BillUpload';

export default function ElregningerAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileAnalyzed = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elregninger.dk
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Analyser dine elregninger og sammenlign med andre husstande
          </p>
          <Badge variant="default" className="text-xs">
            🚀 MVP Beta
          </Badge>
        </div>

        <div className="mb-6">
          <BillUpload onFileAnalyzed={handleFileAnalyzed} onError={handleError} />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Din elregning er analyseret
                </span>
                <Badge 
                  variant={
                    result.tier === 'full' ? 'default' :
                    result.tier === 'partial' ? 'secondary' :
                    result.tier === 'basic' ? 'outline' : 'destructive'
                  }
                  className="ml-2"
                >
                  {result.tier === 'full' ? '✅ Komplet analyse' :
                   result.tier === 'partial' ? '⚡ Delvis analyse' :
                   result.tier === 'basic' ? '📊 Grunddata' :
                   '❌ Fejlet'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {result.tier === 'full' ? 'Alle vigtige data blev udtrukket succesfuldt' :
                 result.tier === 'partial' ? 'De vigtigste data blev udtrukket' :
                 result.tier === 'basic' ? 'Grundlæggende forbrugsdata blev fundet' :
                 'Der opstod et problem med analysen'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.warning && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.warning}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Dit forbrug
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700">
                        {result.data?.totalConsumption_kWh || '—'}
                      </div>
                      <div className="text-sm text-green-600 font-medium">kWh forbrugt</div>
                    </div>
                    <div className="text-center border-t border-green-200 pt-3">
                      <div className="text-2xl font-bold text-gray-900">
                        {result.data?.totalAmountForConsumption_DKK || '—'} DKK
                      </div>
                      <div className="text-sm text-gray-600">samlet pris</div>
                    </div>
                    {result.data?.averagePrice_kr_per_kWh && (
                      <div className="text-center text-sm text-gray-600">
                        ≈ {result.data.averagePrice_kr_per_kWh.toFixed(2)} kr/kWh
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Regningsdetaljer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Leverandør:</span>
                      <span className="font-medium">{result.data?.providerName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produkttype:</span>
                      <span className="font-medium">
                        {result.data?.priceType === 'fixed' ? 'Fast pris' :
                         result.data?.priceType === 'variable' ? 'Variabel pris' :
                         result.data?.priceType || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Periode:</span>
                      <span className="font-medium">
                        {result.data?.consumptionPeriod?.startDate && result.data?.consumptionPeriod?.endDate ?
                          `${result.data.consumptionPeriod.startDate} til ${result.data.consumptionPeriod.endDate}` :
                          '—'}
                      </span>
                    </div>
                    {result.data?.isGreenEnergy !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grøn energi:</span>
                        <span className="font-medium">
                          {result.data?.isGreenEnergy ? '🌱 Ja' : '⚡ Standard'}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {result.data?.costBreakdown_DKK && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Omkostningsfordeling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(result.data.costBreakdown_DKK).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600 capitalize">{key}:</span>
                          <span className="text-sm font-medium">{value ?? '—'} DKK</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Future: Add household comparison section here */}
              
              <details className="border rounded-lg">
                <summary className="cursor-pointer p-4 font-medium hover:bg-gray-50 rounded-lg">
                  🔧 Teknisk information (Debug)
                </summary>
                <div className="p-4 bg-gray-50 border-t space-y-2">
                  <p className="text-sm"><strong>Analyse kvalitet:</strong> {result.tier}</p>
                  <p className="text-sm"><strong>API status:</strong> {result.success ? 'Succes' : 'Fejl'}</p>
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer text-gray-600">Vis rådata</summary>
                    <pre className="text-xs mt-2 overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}