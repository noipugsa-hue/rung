import type { TrialStatus } from '~/types/trial'
import { TRIAL_DURATION_DAYS } from '~/types/trial'

/**
 * Check if a trial is still active
 */
export function isTrialActive(trialStartedAt: string | undefined): boolean {
  if (!trialStartedAt) return false

  const startDate = new Date(trialStartedAt)
  const now = new Date()
  const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return daysPassed < TRIAL_DURATION_DAYS
}

/**
 * Get trial status with remaining days
 */
export function getTrialStatus(trialStartedAt: string | undefined): TrialStatus | null {
  if (!trialStartedAt) return null

  const startDate = new Date(trialStartedAt)
  const now = new Date()
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS)

  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  const isActive = daysRemaining > 0

  return {
    isActive,
    startedAt: trialStartedAt,
    endsAt: endDate.toISOString(),
    daysRemaining
  }
}

/**
 * Calculate discount amount for user trial (50% off)
 */
export function calculateUserTrialDiscount(originalAmountSatang: number, userTrialStartedAt: string | undefined): number {
  if (!isTrialActive(userTrialStartedAt)) return 0

  // 50% discount during trial
  return Math.floor(originalAmountSatang * 0.5)
}

/**
 * Get commission percentage for lung (0% during trial, normal after)
 */
export function getLungCommissionPercentage(
  normalCommissionPercentage: number,
  lungTrialStartedAt: string | undefined
): number {
  if (isTrialActive(lungTrialStartedAt)) {
    return 0 // No commission during trial
  }
  return normalCommissionPercentage
}

/**
 * Initialize trial for new user/lung
 */
export function initializeTrial(): string {
  return new Date().toISOString()
}
