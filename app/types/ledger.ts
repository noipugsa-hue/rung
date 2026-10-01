import type { Satang } from './money'

export type LedgerEntryType =
  | 'booking_payment'
  | 'commission'
  | 'payout'
  | 'refund'

export type LedgerEntryStatus = 'pending' | 'completed' | 'failed'

export interface LedgerEntry {
  id: string
  type: LedgerEntryType
  status: LedgerEntryStatus
  amountSatang: Satang
  bookingId?: string
  partnerId?: string
  description: string
  metadata: Record<string, unknown>
  createdAt: string
  processedAt?: string
  createdBy: string
}
