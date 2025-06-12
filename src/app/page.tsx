'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/lib/types';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Elregninger.dk - Technical Spike
          </h1>
          <p className="text-gray-600">
            Test af Gemini AI til analyse af danske elregninger
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload din elregning (PDF, PNG, JPG)
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🔒 Din fil slettes straks efter analyse. Vi sælger aldrig dine data.
              </p>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors"
            >
              {loading ? 'Analyserer...' : 'Analyser regning'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Analyse resultat</h2>
            
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                result.tier === 'full' ? 'bg-green-100 text-green-800' :
                result.tier === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                result.tier === 'basic' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {result.tier === 'full' ? 'Fuld analyse' :
                 result.tier === 'partial' ? 'Delvis analyse' :
                 result.tier === 'basic' ? 'Grundlæggende analyse' :
                 'Fejlet'}
              </span>
            </div>

            {result.warning && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800">{result.warning}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Kritiske data (Tier 1)</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Forbrug:</strong> {result.data?.totalConsumption_kWh || '—'} kWh</p>
                  <p><strong>Samlet beløb:</strong> {result.data?.totalAmountForConsumption_DKK || '—'} DKK</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Vigtige data (Tier 2)</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Leverandør:</strong> {result.data?.providerName || '—'}</p>
                  <p><strong>Periode start:</strong> {result.data?.consumptionPeriod?.startDate || '—'}</p>
                  <p><strong>Periode slut:</strong> {result.data?.consumptionPeriod?.endDate || '—'}</p>
                </div>
              </div>
            </div>

            {result.data?.costBreakdown_DKK && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Omkostningsfordeling</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {Object.entries(result.data.costBreakdown_DKK).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value ?? '—'}</p>
                  ))}
                </div>
              </div>
            )}

            <details className="mt-6">
              <summary className="cursor-pointer font-medium">Raw API response (debug)</summary>
              <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
