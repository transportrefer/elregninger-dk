import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getJob, updateJobStatus } from '@/lib/job-manager';
import { validateUploadFile } from '@/lib/blob-storage';

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
      onBeforeGenerateToken: async (pathname: string, clientPayload?: string) => {
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