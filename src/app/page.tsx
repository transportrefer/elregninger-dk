'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, XCircle, FileText, TrendingUp, Zap, Sparkles, Shield, ArrowRight, CheckCircle, BarChart3 } from 'lucide-react';
import BillUpload from '@/components/upload/BillUpload';

// Navigation Component
function Navigation() {
  const scrollToAbout = () => {
    document.getElementById('om-beregneren')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-6 w-6 text-primary" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Elregninger.dk
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Forside
            </a>
            <button 
              onClick={scrollToAbout}
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Om beregneren
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function ElregningerAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileAnalyzed = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
    setError(null);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
  };

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Navigation />
      
      {/* Hero Section with Prominent Upload */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Zap className="h-16 w-16 text-primary" />
                <div className="absolute inset-0 animate-pulse">
                  <Zap className="h-16 w-16 text-accent opacity-50" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Forstå din elregning
              </span>
              <br />
              <span className="text-3xl sm:text-4xl text-gray-700">
                på 30 sekunder
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload din regning og få klarhed over forbrug, priser og skjulte gebyrer. 
              <br className="hidden sm:block" />
              Sammenlign med andre danske husstande.
            </p>
            
            <div className="flex items-center justify-center gap-3 mb-12">
              <Badge variant="default" className="bg-primary text-white border-0 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                94% præcision
              </Badge>
              <Badge variant="outline" className="border-primary text-primary px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                100% privat
              </Badge>
            </div>

            <Button 
              onClick={scrollToUpload}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 h-auto"
            >
              <Zap className="h-5 w-5 mr-3" />
              Analyser din regning nu
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hvad får du ud af det?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Få indsigt i din elregning på en måde, du aldrig har set før
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
                </div>
                <CardTitle className="text-xl text-primary">
                  Find skjulte gebyrer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Se præcist hvad du betaler for - fra elafgift til nettarif. 
                  Ingen skjulte omkostninger.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <CardTitle className="text-xl text-accent">
                  Sammenlign dit forbrug
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Se hvor du står i forhold til andre danske husstande med 
                  lignende størrelse og beliggenhed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-emerald-600">
                  Fuldstændig privat
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Din fil krypteres og slettes automatisk efter analyse. 
                  Vi sælger aldrig dine data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kom i gang
            </h2>
            <p className="text-lg text-gray-600">
              Tag et billede eller upload din elregning
            </p>
          </div>

          <BillUpload onFileAnalyzed={handleFileAnalyzed} onError={handleError} />

          {error && (
            <Alert variant="destructive" className="mt-6">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section id="results" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="relative">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                  <Card className="bg-gradient-to-br from-primary/5 via-emerald-50 to-accent/5 border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="relative">
                          <Zap className="h-5 w-5 text-primary" />
                          <div className="absolute inset-0 animate-pulse">
                            <Zap className="h-5 w-5 text-accent opacity-50" />
                          </div>
                        </div>
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          Dit forbrug
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {result.data?.totalConsumption_kWh || '—'}
                        </div>
                        <div className="text-sm text-primary/70 font-medium">kWh forbrugt</div>
                      </div>
                      <div className="text-center border-t border-primary/20 pt-3">
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
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="om-beregneren" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Om beregneren
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simpel, pålidelig analyse af danske elregninger med kunstig intelligens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Hvordan det virker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Upload din regning</p>
                    <p className="text-sm text-gray-600">Tag et billede eller upload PDF/billede</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">AI analyserer data</p>
                    <p className="text-sm text-gray-600">Udtrækker forbrug, priser og gebyrer automatisk</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Få dit resultat</p>
                    <p className="text-sm text-gray-600">Se oversigt og sammenligning på under 1 minut</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Privatliv & sikkerhed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">Automatisk sletning efter 24 timer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">Krypteret databehandling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">Ingen salg af persondata</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">94% analysepræcision</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    <strong>Udviklet i Danmark</strong> med fokus på dansk elmarked og GDPR-compliance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Elregninger.dk</span>
          </div>
          <p className="text-gray-400 mb-6">
            Simpel analyse af danske elregninger
          </p>
          <div className="text-sm text-gray-500">
            <p>
              Har du spørgsmål eller forslag? Kontakt os på{' '}
              <a href="mailto:kontakt@elregninger.dk" className="text-primary hover:text-accent">
                kontakt@elregninger.dk
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}