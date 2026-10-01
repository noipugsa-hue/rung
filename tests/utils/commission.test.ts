import { describe, test, expect } from 'vitest'
import { calculateBookingCommission, createCommissionSnapshot } from '~/utils/commission'
import { bahtToSatang } from '~/utils/money'

describe('Commission Calculations', () => {
  test('calculateBookingCommission for 2 hours at 299 baht', () => {
    const result = calculateBookingCommission(
      bahtToSatang(299),
      2,
      15
    )

    expect(result.totalSatang).toBe(59800)
    expect(result.commissionSatang).toBe(8970)
    expect(result.partnerEarningSatang).toBe(50830)
    expect(result.commissionPercent).toBe(15)
  })

  test('calculateBookingCommission for 1 hour at 300 baht', () => {
    const result = calculateBookingCommission(
      bahtToSatang(300),
      1,
      10
    )

    expect(result.totalSatang).toBe(30000)
    expect(result.commissionSatang).toBe(3000)
    expect(result.partnerEarningSatang).toBe(27000)
    expect(result.commissionPercent).toBe(10)
  })

  test('commission snapshot is created correctly', () => {
    const calculation = calculateBookingCommission(
      bahtToSatang(300),
      1,
      10
    )
    const snapshot = createCommissionSnapshot('booking-123', calculation)

    expect(snapshot.bookingId).toBe('booking-123')
    expect(snapshot.rate).toBe(10)
    expect(snapshot.amountSatang).toBe(3000)
    expect(snapshot.calculatedAt).toBeTruthy()
  })
})
