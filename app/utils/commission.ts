import type { Satang } from '~/types/money'
import type { CommissionSnapshot } from '~/types/commission'
import { calculateCommission } from './money'

export interface CommissionCalculation {
  totalSatang: Satang
  commissionSatang: Satang
  partnerEarningSatang: Satang
  commissionPercent: number
}

export function calculateBookingCommission(
  hourlyRateSatang: Satang,
  durationHours: number,
  commissionPercent: number
): CommissionCalculation {
  const totalSatang = hourlyRateSatang * durationHours
  const commissionSatang = calculateCommission(totalSatang, commissionPercent)
  const partnerEarningSatang = totalSatang - commissionSatang

  return {
    totalSatang,
    commissionSatang,
    partnerEarningSatang,
    commissionPercent
  }
}

export function createCommissionSnapshot(
  bookingId: string,
  calculation: CommissionCalculation
): CommissionSnapshot {
  return {
    bookingId,
    rate: calculation.commissionPercent,
    amountSatang: calculation.commissionSatang,
    calculatedAt: new Date().toISOString()
  }
}
