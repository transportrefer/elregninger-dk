import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getJob, updateJobStatus } from '@/lib/job-manager';
// import { validateUploadFile } from '@/lib/blob-storage';

// Fire-and-forget trigger for processing (Chain-of-Functions pattern)
async function triggerProcessing(jobId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    // Non-blocking fetch call to start processing
    fetch(`${baseUrl}/api/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_TRIGGER_SECRET || 'dev-secret'
      },
      body: JSON.stringify({ jobId })
    }).catch(error => {
      console.error('Failed to trigger processing:', error);
    });
    
    console.log(`🚀 Triggered processing for job ${jobId}`);
  } catch (error) {
    console.error('Error triggering processing:', error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    
    // Extract jobId from the pathname in the upload request
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }
    
    const jsonResponse = await handleUpload({
      body,
      request,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onBeforeGenerateToken: async (_pathname: string, _clientPayload: string | null, _multipart: boolean) => {
        // Validate the job exists and is in correct state
        const job = await getJob(jobId);
        
        if (!job) {
          throw new Error('Job not found');
        }
        
        if (job.status !== 'AWAITING_UPLOAD') {
          throw new Error('Job is not awaiting upload');
        }
        
        // Additional validation based on job constraints
        const allowedContentTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        
        return {
          allowedContentTypes,
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          tokenPayload: JSON.stringify({
            jobId,
            uploadedAt: Date.now()
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This callback runs after successful upload
        const payload = JSON.parse(tokenPayload || '{}');
        const uploadJobId = payload.jobId;
        
        if (uploadJobId) {
          console.log(`📤 Upload completed for job ${uploadJobId}: ${blob.url}`);
          
          // Update job with blob URL and mark as ready for analysis
          await updateJobStatus(uploadJobId, 'PENDING_ANALYSIS', {
            blobPath: blob.url,
            uploadCompletedAt: Date.now()
          });
          
          console.log(`✅ Job ${uploadJobId} marked as PENDING_ANALYSIS`);
          
          // Immediately trigger processing (Chain-of-Functions pattern)
          triggerProcessing(uploadJobId);
        }
      }
    });
    
    return NextResponse.json(jsonResponse);
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}