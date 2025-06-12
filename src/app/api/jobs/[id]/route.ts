import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/job-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id;
    
    // Get job access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const jobAccessToken = authHeader?.replace('Bearer ', '');
    
    if (!jobAccessToken) {
      return NextResponse.json({
        error: 'Missing authorization token'
      }, { status: 401 });
    }
    
    // Get and validate job
    let job;
    try {
      job = await getJob(jobId, jobAccessToken);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return NextResponse.json({
        error: 'Unauthorized or invalid token'
      }, { status: 401 });
    }
    
    if (!job) {
      return NextResponse.json({
        error: 'Job not found or expired'
      }, { status: 404 });
    }
    
    // Calculate processing time if completed
    let processingTime: number | undefined;
    if (job.status === 'COMPLETED' && job.processingStartedAt && job.completedAt) {
      processingTime = job.completedAt - job.processingStartedAt;
    }
    
    // Return appropriate response based on status
    const response = {
      jobId: job.id,
      status: job.status,
      createdAt: job.createdAt,
      processingTime,
      // Only include result if completed
      ...(job.status === 'COMPLETED' && { result: job.result }),
      // Only include error if failed
      ...(job.status === 'FAILED' && { error: job.errorMessage })
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Status polling error:', error);
    return NextResponse.json({
      error: 'Could not retrieve job status'
    }, { status: 500 });
  }
}