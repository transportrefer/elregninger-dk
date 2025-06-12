import { put, del, list, type PutBlobResult } from '@vercel/blob';

/**
 * Generate a secure pre-signed URL for direct client upload
 */
export async function generateUploadUrl(
  blobPath: string,
  fileName: string,
  contentType: string
): Promise<string> {
  // For direct client uploads, we'll use the blob path as the key
  // The actual upload will be handled by the client using @vercel/blob/client
  
  // Note: This is a placeholder - the actual implementation will use
  // the handleUpload pattern in the API route
  return `/api/upload?path=${encodeURIComponent(blobPath)}&fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`;
}

/**
 * Upload file directly to blob storage (server-side)
 */
export async function uploadToBlob(
  blobPath: string,
  file: Buffer,
  contentType: string
): Promise<PutBlobResult> {
  return await put(blobPath, file, {
    access: 'private',
    contentType
  });
}

/**
 * Download file from blob storage
 */
export async function downloadFromBlob(blobPath: string): Promise<Buffer> {
  const response = await fetch(blobPath);
  
  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Delete file from blob storage
 */
export async function deleteFromBlob(blobUrl: string): Promise<void> {
  try {
    await del(blobUrl);
  } catch (error) {
    // Log error but don't throw - deletion failures shouldn't break the flow
    console.error('Failed to delete blob:', blobUrl, error);
  }
}

/**
 * Delete multiple files from blob storage
 */
export async function deleteManyFromBlob(blobUrls: string[]): Promise<void> {
  if (blobUrls.length === 0) return;
  
  try {
    await del(blobUrls);
  } catch (error) {
    console.error('Failed to delete blobs:', blobUrls, error);
  }
}

/**
 * List old blobs for cleanup (to be called by cron)
 */
export async function findOldBlobs(maxAgeMs = 24 * 60 * 60 * 1000): Promise<string[]> {
  const { blobs } = await list({
    prefix: 'pending/', // Only check our temporary upload folder
    limit: 1000
  });
  
  const now = Date.now();
  const oldBlobUrls: string[] = [];
  
  for (const blob of blobs) {
    const uploadedAt = new Date(blob.uploadedAt).getTime();
    if (now - uploadedAt > maxAgeMs) {
      oldBlobUrls.push(blob.url);
    }
  }
  
  return oldBlobUrls;
}

/**
 * Clean up old blobs (to be called by cron)
 */
export async function cleanupOldBlobs(maxAgeMs = 24 * 60 * 60 * 1000): Promise<number> {
  const oldBlobUrls = await findOldBlobs(maxAgeMs);
  
  if (oldBlobUrls.length > 0) {
    await deleteManyFromBlob(oldBlobUrls);
  }
  
  return oldBlobUrls.length;
}

/**
 * Validate file type and size for uploads
 */
export function validateUploadFile(contentType: string, fileSize: number): void {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(contentType)) {
    throw new Error('Ikke-understøttet filtype. Vælg PDF, PNG eller JPG.');
  }
  
  if (fileSize > maxSize) {
    throw new Error('Filen er for stor. Maksimal størrelse er 10MB.');
  }
}