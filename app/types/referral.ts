/**
 * Referral Program Types
 * แนะนำเพื่อน - ทั้งคู่ได้ส่วนลด
 */

import type { Satang } from './money'

export type ReferralStatus = 'pending' | 'completed' | 'expired'

export interface Referral {
  id: string
  code: string // รหัสแนะนำ เช่น "JOHN2024"
  referrerId: string // คนแนะนำ
  referrerName: string

  // Referee info (คนที่ถูกแนะนำ)
  refereeId?: string
  refereeName?: string
  refereeEmail?: string

  // Rewards
  referrerRewardSatang: Satang // รางวัลสำหรับคนแนะนำ
  refereeRewardSatang: Satang // รางวัลสำหรับคนที่ถูกแนะนำ

  status: ReferralStatus
  usedAt?: string // วันที่ใช้รหัส
  completedAt?: string // วันที่จองครั้งแรกเสร็จ
  expiresAt?: string // รหัสหมดอายุเมื่อ (optional)

  createdAt: string
  updatedAt: string
}

export interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalRewardsEarnedSatang: Satang
  conversionRate: number // %
}

export interface ReferralReward {
  id: string
  userId: string
  referralId: string
  amountSatang: Satang
  type: 'referrer' | 'referee'
  status: 'pending' | 'applied' | 'expired'
  appliedToBookingId?: string
  createdAt: string
  expiresAt?: string
}

export interface ReferralSettings {
  enabled: boolean
  referrerRewardSatang: Satang // เช่น 10000 = ฿100
  refereeRewardSatang: Satang // เช่น 10000 = ฿100
  minimumBookingAmountSatang: Satang // ต้องจองขั้นต่ำเท่าไร
  rewardExpiryDays: number // รางวัลหมดอายุกี่วัน
  codeExpiryDays?: number // รหัสหมดอายุกี่วัน (optional)
}
