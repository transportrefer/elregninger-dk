'use client';

import { useState, useRef, useCallback } from 'react';
import { upload } from '@vercel/blob/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, FileText, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

import { AnalysisResult } from '@/lib/types';

interface BillUploadProps {
  onFileAnalyzed: (result: AnalysisResult) => void;
  onError: (error: string) => void;
}

export default function BillUpload({ onFileAnalyzed, onError }: BillUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (imageFile: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.8, // Reduced from 1MB to 0.8MB
      maxWidthOrHeight: 1200, // Reduced from 1500px to 1200px  
      quality: 0.85, // Added explicit quality setting
      useWebWorker: true,
      fileType: 'image/jpeg', // Force JPEG for better compression
      onProgress: (progress: number) => {
        setCompressionProgress(Math.round(progress));
      }
    };
    
    console.log(`🖼️ Compressing ${imageFile.name}: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`);

    try {
      const compressedFile = await imageCompression(imageFile, options);
      const savings = ((imageFile.size - compressedFile.size) / imageFile.size * 100).toFixed(1);
      console.log(`✅ Compression complete: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (${savings}% reduction)`);
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      return imageFile;
    }
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Ikke-understøttet filtype. Vælg PDF, PNG eller JPG.';
    }

    if (file.size > maxSize) {
      return 'Filen er for stor. Maksimal størrelse er 10MB.';
    }

    return null;
  };

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      onError(validationError);
      return;
    }

    let processedFile = selectedFile;

    // Compress images only
    if (selectedFile.type.startsWith('image/')) {
      setCompressionProgress(0);
      try {
        processedFile = await compressImage(selectedFile);
      } catch {
        onError('Fejl ved billedkomprimering. Prøver med original fil.');
      }
      setCompressionProgress(0);
    }

    setFile(processedFile);
    onError(''); // Clear any previous errors
  }, [onError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCameraDialog = () => {
    cameraInputRef.current?.click();
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError('Vælg venligst en fil');
      return;
    }

    setLoading(true);
    onError('');
    setAnalysisStep('Opretter analyse-job...');

    try {
      const startTime = Date.now();
      
      // Step 1: Create job and get upload URL
      console.log('📝 Creating analysis job...');
      const jobResponse = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type
        })
      });
      
      if (!jobResponse.ok) {
        const error = await jobResponse.json();
        throw new Error(error.error || 'Kunne ikke oprette analyse-job');
      }
      
      const { jobId, jobAccessToken, uploadUrl } = await jobResponse.json();
      console.log(`✅ Job created: ${jobId}`);
      
      // Step 2: Upload file directly to blob storage
      setAnalysisStep('Uploader fil...');
      console.log('📤 Uploading file to blob storage...');
      
      const blob = await upload(file.name, file, {
        access: 'private',
        handleUploadUrl: uploadUrl
      });
      
      console.log(`✅ File uploaded: ${blob.url}`);
      
      // Step 3: Start polling for results
      setAnalysisStep('Analyserer regning...');
      const result = await pollForResults(jobId, jobAccessToken);
      
      const totalTime = Date.now() - startTime;
      console.log(`📊 Total async flow time: ${totalTime}ms`);
      
      setAnalysisStep('Analyse fuldført!');
      onFileAnalyzed(result);
      
      // Clear form
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      
    } catch (error) {
      console.error('❌ Async analysis flow failed:', error);
      onError(error instanceof Error ? error.message : 'Ukendt fejl opstod under analysen');
    } finally {
      setLoading(false);
      setAnalysisStep('');
    }
  };
  
  const pollForResults = async (jobId: string, jobAccessToken: string): Promise<any> => {
    let interval = 2000; // Start with 2 seconds
    const maxInterval = 15000; // Cap at 15 seconds
    const maxPollingTime = 2 * 60 * 1000; // 2 minutes maximum
    const pollingStartTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Check if we've been polling too long
          if (Date.now() - pollingStartTime > maxPollingTime) {
            reject(new Error('Analyse tog for lang tid. Prøv venligst igen.'));
            return;
          }
          
          const response = await fetch(`/api/jobs/${jobId}`, {
            headers: {
              'Authorization': `Bearer ${jobAccessToken}`
            }
          });
          
          if (!response.ok) {
            reject(new Error('Kunne ikke hente analyse status'));
            return;
          }
          
          const job = await response.json();
          console.log(`🔄 Job ${jobId} status: ${job.status}`);
          
          switch (job.status) {
            case 'AWAITING_UPLOAD':
            case 'PENDING_ANALYSIS':
              setAnalysisStep('Venter på analyse...');
              break;
              
            case 'PROCESSING':
              setAnalysisStep('Analyserer regning...');
              // Exponential backoff - increase interval for next poll
              interval = Math.min(interval * 1.5, maxInterval);
              setTimeout(poll, interval);
              break;
              
            case 'COMPLETED':
              console.log(`✅ Job ${jobId} completed successfully`);
              resolve(job.result);
              break;
              
            case 'FAILED':
              console.log(`❌ Job ${jobId} failed: ${job.error}`);
              reject(new Error(job.error || 'Analyse fejlede'));
              break;
              
            default:
              // For pending states, continue polling with current interval
              setTimeout(poll, interval);
              break;
          }
        } catch (error) {
          console.error('Polling error:', error);
          reject(new Error('Netværksfejl under analyse. Prøv venligst igen.'));
        }
      };
      
      // Start polling
      poll();
    });
  };

  const isMobile = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload din elregning
        </CardTitle>
        <CardDescription>
          Tag et billede eller upload en fil for automatisk analyse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile-first camera buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={openCameraDialog}
              className="h-12 touch-target"
              disabled={loading}
            >
              <Camera className="w-5 h-5 mr-2" />
              Tag billede
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={openFileDialog}
              className="h-12 touch-target"
              disabled={loading}
            >
              <Upload className="w-5 h-5 mr-2" />
              Vælg fil
            </Button>
          </div>

          {/* Hidden camera input for mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Hidden regular file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drag & drop area */}
          <div
            className={`border-2 border-dashed rounded-lg transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            } ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-gray-50'}`}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onClick={openFileDialog}
          >
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Upload className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-center text-gray-600">
                <span className="font-medium">Klik her</span> eller træk og slip din elregning
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PDF, PNG, JPG (max 10MB)
              </p>
            </div>
          </div>

          {/* File preview */}
          {file && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compression progress */}
          {compressionProgress > 0 && compressionProgress < 100 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Komprimerer billede... {compressionProgress}%
              </AlertDescription>
            </Alert>
          )}

          {/* Privacy promise */}
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Privatliv garanteret:</strong> Din fil krypteres og slettes automatisk efter analyse. Vi sælger aldrig dine data.
            </AlertDescription>
          </Alert>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={!file || loading || compressionProgress > 0}
            className="w-full h-12 touch-target"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                {analysisStep || 'Analyserer din regning...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Analyser elregning
              </>
            )}
          </Button>
          
          {/* Performance tip for users */}
          {loading && (
            <div className="text-xs text-gray-500 text-center mt-2">
              📊 Analyse kan tage op til 60 sekunder
            </div>
          )}

          {/* Mobile-specific hints */}
          {isMobile && (
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>💡 <strong>Tip:</strong> Sørg for god belysning og at hele regningen er synlig</p>
              <p>📱 Hold telefonen stabilt når du tager billedet</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}