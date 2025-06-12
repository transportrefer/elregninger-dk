import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/lib/job-manager';
import { validateUploadFile } from '@/lib/blob-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileSize, contentType } = body;
    
    // Validate required fields
    if (!fileName || !fileSize || !contentType) {
      return NextResponse.json({
        error: 'Manglende påkrævede felter: fileName, fileSize, contentType'
      }, { status: 400 });
    }
    
    // Validate file type and size
    try {
      validateUploadFile(contentType, fileSize);
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Ugyldig fil'
      }, { status: 400 });
    }
    
    // Create job in KV with secure access token
    const { jobId, jobAccessToken } = await createJob(fileName, fileSize);
    
    // Generate upload URL for client
    const uploadUrl = `/api/upload?jobId=${jobId}&fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`;
    
    console.log(`📝 Created job ${jobId} for file ${fileName} (${fileSize} bytes)`);
    
    return NextResponse.json({
      jobId,
      jobAccessToken,
      uploadUrl,
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    });
    
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json({
      error: 'Kunne ikke oprette analyse-job'
    }, { status: 500 });
  }
}