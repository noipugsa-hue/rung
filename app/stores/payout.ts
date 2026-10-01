import { defineStore } from 'pinia'
import type { PayoutRequest, PayoutStatus } from '~/types/payout'
import type { Satang } from '~/types/money'
import { generateId } from '~/utils/id-generator'
import { useLedgerStore } from './ledger'

export const usePayoutStore = defineStore('payout', () => {
  const payouts = ref<PayoutRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const MIN_PAYOUT_AMOUNT = 50000 // 500 baht in satang

  // Create payout request
  async function requestPayout(
    partnerId: string,
    amountSatang: Satang,
    bankAccount: PayoutRequest['bankAccount']
  ): Promise<PayoutRequest> {
    loading.value = true
    error.value = null

    try {
      // Validate minimum amount
      if (amountSatang < MIN_PAYOUT_AMOUNT) {
        throw new Error(`ยอดเงินขั้นต่ำสำหรับการโอนคือ ฿${MIN_PAYOUT_AMOUNT / 100}`)
      }

      // Check if partner has enough balance
      const ledgerStore = useLedgerStore()
      const balance = ledgerStore.calculatePartnerBalance(partnerId)

      if (balance.pendingPayout < amountSatang) {
        throw new Error('ยอดเงินคงเหลือไม่เพียงพอ')
      }

      const payout: PayoutRequest = {
        id: generateId('PAYOUT'),
        partnerId,
        amountSatang,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        bankAccount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      payouts.value.push(payout)
      return payout

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get partner payouts
  function getPartnerPayouts(partnerId: string): PayoutRequest[] {
    return payouts.value
      .filter(p => p.partnerId === partnerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  // Get all payouts (admin)
  function getAllPayouts(): PayoutRequest[] {
    return payouts.value.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  // Get payouts by status
  function getPayoutsByStatus(status: PayoutStatus): PayoutRequest[] {
    return payouts.value
      .filter(p => p.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  // Update payout status (admin)
  async function updatePayoutStatus(
    payoutId: string,
    status: PayoutStatus,
    processedBy?: string,
    notes?: string,
    failedReason?: string
  ): Promise<void> {
    const payout = payouts.value.find(p => p.id === payoutId)
    if (!payout) throw new Error('Payout not found')

    payout.status = status
    payout.updatedAt = new Date().toISOString()

    if (processedBy) {
      payout.processedBy = processedBy
    }

    if (notes) {
      payout.notes = notes
    }

    if (status === 'processing' && !payout.processedAt) {
      payout.processedAt = new Date().toISOString()
    }

    if (status === 'completed') {
      payout.completedAt = new Date().toISOString()

      // Record in ledger
      const ledgerStore = useLedgerStore()
      await ledgerStore.entries.push({
        id: generateId('ledger'),
        type: 'payout',
        status: 'completed',
        amountSatang: -payout.amountSatang, // Negative because it's outgoing
        partnerId: payout.partnerId,
        description: `โอนเงินสำหรับคำขอ ${payout.id}`,
        metadata: { payoutId: payout.id },
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        createdBy: processedBy || 'system'
      })
    }

    if (status === 'failed' && failedReason) {
      payout.failedReason = failedReason
    }
  }

  // Cancel payout request (partner)
  async function cancelPayout(payoutId: string, partnerId: string): Promise<void> {
    const payout = payouts.value.find(p => p.id === payoutId && p.partnerId === partnerId)
    if (!payout) throw new Error('Payout not found')

    if (payout.status !== 'pending') {
      throw new Error('ไม่สามารถยกเลิกคำขอที่กำลังดำเนินการหรือเสร็จสิ้นแล้ว')
    }

    payout.status = 'cancelled'
    payout.updatedAt = new Date().toISOString()
  }

  // Get payout by ID
  function getPayoutById(payoutId: string): PayoutRequest | undefined {
    return payouts.value.find(p => p.id === payoutId)
  }

  return {
    payouts,
    loading,
    error,
    MIN_PAYOUT_AMOUNT,
    requestPayout,
    getPartnerPayouts,
    getAllPayouts,
    getPayoutsByStatus,
    updatePayoutStatus,
    cancelPayout,
    getPayoutById
  }
})
