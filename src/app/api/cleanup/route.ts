import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredJobs } from '@/lib/job-manager';
import { cleanupOldBlobs } from '@/lib/blob-storage';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  console.log('🧹 Cleanup started at:', new Date().toISOString());
  
  try {
    // Run cleanup operations in parallel
    const [expiredJobsDeleted, oldBlobsDeleted] = await Promise.all([
      cleanupExpiredJobs(),
      cleanupOldBlobs(24 * 60 * 60 * 1000) // 24 hours
    ]);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Cleanup completed: ${expiredJobsDeleted} jobs, ${oldBlobsDeleted} blobs deleted in ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      expiredJobsDeleted,
      oldBlobsDeleted,
      executionTime: totalTime
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json({
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}