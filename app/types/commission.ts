import type { Satang } from './money'

export interface CommissionRate {
  id: string
  percentage: number // 10-25
  effectiveFrom: string
  effectiveTo?: string
  type: 'global' | 'partner-specific'
  partnerId?: string
  createdAt: string
  createdBy: string
}

export interface CommissionSnapshot {
  bookingId: string
  rate: number
  amountSatang: Satang
  calculatedAt: string
}
