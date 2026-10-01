import { describe, test, expect } from 'vitest'
import {
  bahtToSatang,
  satangToBaht,
  calculateCommission,
  calculatePartnerEarning,
  isValidSatang
} from '~/utils/money'

describe('Money Utilities', () => {
  test('bahtToSatang converts correctly', () => {
    expect(bahtToSatang(100)).toBe(10000)
    expect(bahtToSatang(299.99)).toBe(29999)
    expect(bahtToSatang(0)).toBe(0)
  })

  test('satangToBaht converts correctly', () => {
    expect(satangToBaht(10000)).toBe(100)
    expect(satangToBaht(29999)).toBe(299.99)
    expect(satangToBaht(0)).toBe(0)
  })

  test('calculateCommission uses integer math', () => {
    expect(calculateCommission(10000, 15)).toBe(1500)
    expect(calculateCommission(29999, 15)).toBe(4499) // Rounds down
    expect(calculateCommission(10000, 20)).toBe(2000)
  })

  test('calculatePartnerEarning is accurate', () => {
    expect(calculatePartnerEarning(10000, 15)).toBe(8500)
    expect(calculatePartnerEarning(29999, 15)).toBe(25500)
    expect(calculatePartnerEarning(10000, 20)).toBe(8000)
  })

  test('isValidSatang validates integers', () => {
    expect(isValidSatang(100)).toBe(true)
    expect(isValidSatang(0)).toBe(true)
    expect(isValidSatang(99.5)).toBe(false)
    expect(isValidSatang(-100)).toBe(false)
  })
})
