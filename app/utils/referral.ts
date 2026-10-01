/**
 * Referral Code Generation Utilities
 */

/**
 * Generate a unique referral code
 * Format: USERNAME + RANDOM (e.g., JOHN2024, MARY3K9P)
 */
export function generateReferralCode(userName: string): string {
  // Clean username: uppercase, remove spaces and special chars
  const cleanName = userName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)

  // Generate random suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomSuffix = ''
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return `${cleanName}${randomSuffix}`
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  // Must be 4-12 characters, alphanumeric, uppercase
  const regex = /^[A-Z0-9]{4,12}$/
  return regex.test(code)
}

/**
 * Generate referral link
 */
export function generateReferralLink(code: string, baseUrl: string = 'https://lung.app'): string {
  return `${baseUrl}/register?ref=${code}`
}

/**
 * Parse referral code from URL or query
 */
export function parseReferralCode(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('ref')
  } catch {
    return null
  }
}
