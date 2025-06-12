'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function TechnicalSpike() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Vælg venligst en fil');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Ukendt fejl');
      }
    } catch {
      setError('Netværksfejl. Prøv venligst igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elregninger.dk
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Analyser danske elregninger med AI
          </p>
          <Badge variant="secondary" className="text-xs">
            Technical Spike - Test Phase
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Elregning
            </CardTitle>
            <CardDescription>
              Upload din elregning for automatisk analyse med Gemini AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vælg fil (PDF, PNG, JPG - max 10MB)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Klik for at uploade</span> eller træk og slip
                      </p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Valgt: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Din fil slettes straks efter analyse. Vi sælger aldrig dine data.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={!file || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyserer...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Analyser regning
                  </>
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Analyse Resultat
                </span>
                <Badge 
                  variant={
                    result.tier === 'full' ? 'default' :
                    result.tier === 'partial' ? 'secondary' :
                    result.tier === 'basic' ? 'outline' : 'destructive'
                  }
                  className="ml-2"
                >
                  {result.tier === 'full' ? '✅ Fuld analyse' :
                   result.tier === 'partial' ? '⚠️ Delvis analyse' :
                   result.tier === 'basic' ? '📊 Grundlæggende analyse' :
                   '❌ Fejlet'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.warning && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.warning}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Kritiske data (Tier 1)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Forbrug:</span>
                      <span className="font-medium">{result.data?.totalConsumption_kWh || '—'} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Samlet beløb:</span>
                      <span className="font-medium">{result.data?.totalAmountForConsumption_DKK || '—'} DKK</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Vigtige data (Tier 2)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Leverandør:</span>
                      <span className="font-medium">{result.data?.providerName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Periode start:</span>
                      <span className="font-medium">{result.data?.consumptionPeriod?.startDate || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Periode slut:</span>
                      <span className="font-medium">{result.data?.consumptionPeriod?.endDate || '—'}</span>
                    </div>
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

              <details className="border rounded-lg">
                <summary className="cursor-pointer p-4 font-medium hover:bg-gray-50 rounded-lg">
                  🔧 Raw API Response (Debug)
                </summary>
                <pre className="p-4 bg-gray-50 text-xs overflow-auto border-t">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
