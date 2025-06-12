import { kv } from '@vercel/kv';
import { AnalysisResult } from './types';

export interface Job {
  id: string;
  jobAccessToken: string;
  status: 'AWAITING_UPLOAD' | 'PENDING_ANALYSIS' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  blobPath: string;
  fileName: string;
  fileSize: number;
  createdAt: number;
  uploadCompletedAt?: number;
  processingStartedAt?: number;
  completedAt?: number;
  retryCount: number;
  errorMessage?: string;
  result?: AnalysisResult;
}

export type JobStatus = Job['status'];

// KV key patterns
const jobKey = (id: string) => `job:${id}`;
const statusIndexKey = (status: JobStatus) => `jobs:status:${status.toLowerCase()}`;

/**
 * Create a new job with secure access token
 */
export async function createJob(
  fileName: string,
  fileSize: number
): Promise<{ jobId: string; jobAccessToken: string }> {
  const jobId = crypto.randomUUID();
  const jobAccessToken = crypto.randomUUID();
  const blobPath = `pending/${jobId}`;
  
  const job: Job = {
    id: jobId,
    jobAccessToken,
    status: 'AWAITING_UPLOAD',
    blobPath,
    fileName,
    fileSize,
    createdAt: Date.now(),
    retryCount: 0
  };

  // Use pipeline for atomic operations
  const pipeline = kv.pipeline();
  
  // Store the job
  pipeline.setex(jobKey(jobId), 86400, job); // 24-hour TTL
  
  // Add to status index
  pipeline.sadd(statusIndexKey('AWAITING_UPLOAD'), jobId);
  
  // Set job expiry in a separate tracking set
  pipeline.zadd('jobs:expiry', Date.now() + 86400000, jobId); // 24-hour expiry
  
  await pipeline.exec();
  
  return { jobId, jobAccessToken };
}

/**
 * Get job by ID with access token validation
 */
export async function getJob(jobId: string, jobAccessToken?: string): Promise<Job | null> {
  const job = await kv.get<Job>(jobKey(jobId));
  
  if (!job) {
    return null;
  }
  
  // Validate access token if provided
  if (jobAccessToken && job.jobAccessToken !== jobAccessToken) {
    throw new Error('Invalid access token');
  }
  
  return job;
}

/**
 * Update job status with secondary index management
 */
export async function updateJobStatus(
  jobId: string,
  newStatus: JobStatus,
  updates: Partial<Job> = {}
): Promise<void> {
  const job = await kv.get<Job>(jobKey(jobId));
  
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  
  const oldStatus = job.status;
  const updatedJob: Job = {
    ...job,
    ...updates,
    status: newStatus
  };
  
  const pipeline = kv.pipeline();
  
  // Update the job record
  pipeline.setex(jobKey(jobId), 86400, updatedJob);
  
  // Update secondary indexes if status changed
  if (oldStatus !== newStatus) {
    pipeline.srem(statusIndexKey(oldStatus), jobId);
    pipeline.sadd(statusIndexKey(newStatus), jobId);
  }
  
  await pipeline.exec();
}

/**
 * Find jobs by status using secondary index
 */
export async function findJobsByStatus(status: JobStatus, limit = 50): Promise<Job[]> {
  // Get job IDs from status index
  const jobIds = await kv.smembers(statusIndexKey(status));
  
  if (jobIds.length === 0) {
    return [];
  }
  
  // Limit the number of jobs to process
  const limitedJobIds = jobIds.slice(0, limit);
  
  // Fetch job details
  const keys = limitedJobIds.map(id => jobKey(id));
  const jobs = await kv.mget<Job[]>(...keys);
  
  // Filter out null values (expired jobs)
  return jobs.filter((job): job is Job => job !== null);
}

/**
 * Find zombie jobs (stuck in PROCESSING for too long)
 */
export async function findZombieJobs(timeoutMs = 10 * 60 * 1000): Promise<Job[]> {
  const processingJobs = await findJobsByStatus('PROCESSING');
  const now = Date.now();
  
  return processingJobs.filter(job => 
    job.processingStartedAt && 
    (now - job.processingStartedAt) > timeoutMs
  );
}

/**
 * Mark job as failed with error message
 */
export async function markJobFailed(jobId: string, errorMessage: string): Promise<void> {
  await updateJobStatus(jobId, 'FAILED', {
    errorMessage,
    completedAt: Date.now()
  });
}

/**
 * Mark job as completed with result
 */
export async function markJobCompleted(jobId: string, result: AnalysisResult): Promise<void> {
  await updateJobStatus(jobId, 'COMPLETED', {
    result,
    completedAt: Date.now()
  });
}

/**
 * Increment retry count for failed job
 */
export async function incrementRetryCount(jobId: string): Promise<number> {
  const job = await kv.get<Job>(jobKey(jobId));
  
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  
  const newRetryCount = job.retryCount + 1;
  
  await updateJobStatus(jobId, 'PENDING_ANALYSIS', {
    retryCount: newRetryCount
  });
  
  return newRetryCount;
}

/**
 * Clean up expired jobs (to be called by cron)
 */
export async function cleanupExpiredJobs(): Promise<number> {
  const now = Date.now();
  
  // Get expired job IDs from sorted set
  const expiredJobIds = await kv.zrangebyscore('jobs:expiry', 0, now);
  
  if (expiredJobIds.length === 0) {
    return 0;
  }
  
  let deletedCount = 0;
  
  for (const jobId of expiredJobIds) {
    try {
      const job = await kv.get<Job>(jobKey(jobId));
      
      if (job) {
        const pipeline = kv.pipeline();
        
        // Remove from all indexes
        pipeline.del(jobKey(jobId));
        pipeline.srem(statusIndexKey(job.status), jobId);
        pipeline.zrem('jobs:expiry', jobId);
        
        await pipeline.exec();
        deletedCount++;
      }
    } catch (error) {
      console.error(`Failed to cleanup job ${jobId}:`, error);
    }
  }
  
  return deletedCount;
}

/**
 * Get job statistics for monitoring
 */
export async function getJobStats(): Promise<Record<JobStatus, number>> {
  const statuses: JobStatus[] = ['AWAITING_UPLOAD', 'PENDING_ANALYSIS', 'PROCESSING', 'COMPLETED', 'FAILED'];
  
  const counts = await Promise.all(
    statuses.map(async status => {
      const count = await kv.scard(statusIndexKey(status));
      return [status, count] as const;
    })
  );
  
  return Object.fromEntries(counts) as Record<JobStatus, number>;
}