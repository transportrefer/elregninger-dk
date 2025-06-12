'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, XCircle, FileText, TrendingUp, Zap, Sparkles, Users, Shield, ArrowRight } from 'lucide-react';
import BillUpload from '@/components/upload/BillUpload';

function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Zap className="h-12 w-12 text-emerald-600" />
                <div className="absolute inset-0 animate-pulse">
                  <Zap className="h-12 w-12 text-emerald-400 opacity-50" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                Elregninger.dk
              </span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Analyser dine elregninger nemt og overskueligt
            </p>
            
            <Badge variant="outline" className="text-base font-medium px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Kommer snart
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 relative">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                  <Sparkles className="h-4 w-4 text-blue-500 absolute -top-1 -right-1" />
                </div>
                <CardTitle className="text-lg bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                  AI-drevet analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Upload din regning og få en simpel oversigt
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Sammenlign dit forbrug
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Sammenlign dit forbrug med andre husstande
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  100% privat
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Din fil slettes straks efter analyse. Vi sælger aldrig dine data.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Vi arbejder på noget godt
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Et simpelt værktøj til at forstå dine elregninger bedre.
              </p>
              <div className="flex items-center justify-center text-emerald-600 font-medium">
                <span>Bliver klar inden årets udgang</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12 text-sm text-gray-500">
            <p>
              Har du spørgsmål eller forslag? Kontakt os på{' '}
              <a href="mailto:kontakt@elregninger.dk" className="text-emerald-600 hover:text-emerald-700 font-medium">
                kontakt@elregninger.dk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ElregningerAnalysis() {
  const [isProduction, setIsProduction] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check if we're on the production domain (including www subdomain)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isProductionDomain = hostname.includes('elregninger.dk');
      setIsProduction(isProductionDomain);
      
      // Debug logging (remove after testing)
      console.log('Hostname:', hostname, 'Is Production:', isProductionDomain);
    }
  }, []);

  const handleFileAnalyzed = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
  };

  // Show loading state during hydration
  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4" />;
  }

  // Show coming soon page for production domain
  if (isProduction) {
    return <ComingSoonPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Zap className="h-8 w-8 text-blue-600" />
              <Sparkles className="h-4 w-4 text-emerald-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Elregninger.dk
            </h1>
          </div>
          <p className="text-lg text-slate-600 mb-3 max-w-2xl mx-auto leading-relaxed">
            Analyser dine elregninger med AI og sammenlign med andre husstande
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
              🤖 AI-Powered
            </Badge>
            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
              🚀 MVP Beta
            </Badge>
          </div>
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
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="relative">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <Sparkles className="h-3 w-3 text-blue-500 absolute -top-1 -right-1" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                    Din elregning er analyseret
                  </span>
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
                <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="relative">
                        <Zap className="h-5 w-5 text-emerald-600" />
                        <div className="absolute inset-0 animate-pulse">
                          <Zap className="h-5 w-5 text-emerald-400 opacity-50" />
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                        Dit forbrug
                      </span>
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

                <Card className="bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="relative">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <Sparkles className="h-3 w-3 text-indigo-500 absolute -top-1 -right-1" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                        Regningsdetaljer
                      </span>
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