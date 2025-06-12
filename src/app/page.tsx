import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Sparkles, FileText, Users, Shield, ArrowRight } from 'lucide-react';

export default function ComingSoon() {
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