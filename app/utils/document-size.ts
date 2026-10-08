/**
 * Utilities for managing Firestore document size limits
 * Firestore has a 1MB (1,048,576 bytes) limit per document
 */

const FIRESTORE_MAX_SIZE = 1048576 // 1MB in bytes
const SAFE_SIZE_LIMIT = 900000 // 900KB - leave buffer for metadata
const MAX_PROFILE_IMAGES = 8 // Recommended maximum

/**
 * Estimate the size of a JSON object in bytes
 */
export function estimateDocumentSize(obj: any): number {
  try {
    const jsonString = JSON.stringify(obj)
    // Use TextEncoder for accurate byte count (handles Unicode)
    const encoder = new TextEncoder()
    return encoder.encode(jsonString).length
  } catch (error) {
    console.error('Error estimating document size:', error)
    return 0
  }
}

/**
 * Check if document size is within safe limits
 */
export function isDocumentSizeSafe(obj: any): { safe: boolean; size: number; maxSize: number } {
  const size = estimateDocumentSize(obj)
  return {
    safe: size < SAFE_SIZE_LIMIT,
    size,
    maxSize: FIRESTORE_MAX_SIZE
  }
}

/**
 * Get human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate profile images count
 */
export function validateProfileImagesCount(images: any[]): { valid: boolean; message?: string } {
  if (images.length > MAX_PROFILE_IMAGES) {
    return {
      valid: false,
      message: `จำนวนรูปภาพเกินกำหนด (สูงสุด ${MAX_PROFILE_IMAGES} รูป)`
    }
  }
  return { valid: true }
}

/**
 * Optimize ProfileImage array by removing unnecessary metadata
 */
export function optimizeProfileImages(images: any[]): any[] {
  return images.map(img => ({
    url: img.url,
    isPrimary: img.isPrimary || false,
    order: img.order || 0
  }))
}
