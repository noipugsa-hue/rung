import { defineStore } from 'pinia'
import type { LedgerEntry } from '~/types/ledger'
import type { Satang } from '~/types/money'
import { generateId } from '~/utils/id-generator'

export const useLedgerStore = defineStore('ledger', () => {
  const entries = ref<LedgerEntry[]>([])
  const loading = ref(false)

  async function recordBookingPayment(
    bookingId: string,
    amountSatang: Satang,
    partnerId: string
  ): Promise<LedgerEntry> {
    const entry: LedgerEntry = {
      id: generateId('ledger'),
      type: 'booking_payment',
      status: 'completed',
      amountSatang,
      bookingId,
      partnerId,
      description: `รับชำระเงินสำหรับการจอง ${bookingId}`,
      metadata: {},
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      createdBy: 'system'
    }

    entries.value.push(entry)
    return entry
  }

  async function recordCommission(
    bookingId: string,
    amountSatang: Satang,
    partnerId: string
  ): Promise<LedgerEntry> {
    const entry: LedgerEntry = {
      id: generateId('ledger'),
      type: 'commission',
      status: 'completed',
      amountSatang,
      bookingId,
      partnerId,
      description: `ค่าคอมมิชชั่นสำหรับการจอง ${bookingId}`,
      metadata: {},
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      createdBy: 'system'
    }

    entries.value.push(entry)
    return entry
  }

  function getPartnerEntries(partnerId: string): LedgerEntry[] {
    return entries.value
      .filter(e => e.partnerId === partnerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  function calculatePartnerBalance(partnerId: string): {
    totalEarned: Satang
    pendingPayout: Satang
    paidOut: Satang
  } {
    const partnerEntries = getPartnerEntries(partnerId)

    const payments = partnerEntries
      .filter(e => e.type === 'booking_payment')
      .reduce((sum, e) => sum + e.amountSatang, 0)

    const commissions = partnerEntries
      .filter(e => e.type === 'commission')
      .reduce((sum, e) => sum + e.amountSatang, 0)

    const payouts = partnerEntries
      .filter(e => e.type === 'payout')
      .reduce((sum, e) => sum + Math.abs(e.amountSatang), 0)

    const totalEarned = payments - commissions
    const paidOut = payouts
    const pendingPayout = totalEarned - paidOut

    return { totalEarned, pendingPayout, paidOut }
  }

  function getPlatformRevenue(): Satang {
    return entries.value
      .filter(e => e.type === 'commission')
      .reduce((sum, e) => sum + e.amountSatang, 0)
  }

  return {
    entries,
    loading,
    recordBookingPayment,
    recordCommission,
    getPartnerEntries,
    calculatePartnerBalance,
    getPlatformRevenue
  }
})
