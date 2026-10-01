import type { Satang } from './money'

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface PayoutRequest {
  id: string
  partnerId: string
  amountSatang: Satang
  status: PayoutStatus
  requestedAt: string
  processedAt?: string
  completedAt?: string
  failedReason?: string
  bankAccount: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  notes?: string
  processedBy?: string
  createdAt: string
  updatedAt: string
}
