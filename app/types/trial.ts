/**
 * Trial System Types
 *
 * 7-day free trial for new users and partners:
 * - Users: 50% discount on all bookings
 * - Lungs: 0% commission (no platform fee)
 */

export interface TrialStatus {
  isActive: boolean
  startedAt: string
  endsAt: string
  daysRemaining: number
}

export interface UserTrialBenefit {
  discountPercentage: number // 50
  description: string
}

export interface LungTrialBenefit {
  commissionPercentage: number // 0
  description: string
}

export const TRIAL_DURATION_DAYS = 7
export const USER_TRIAL_DISCOUNT = 50 // 50% discount
export const LUNG_TRIAL_COMMISSION = 0 // 0% commission
