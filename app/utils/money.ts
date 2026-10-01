import type { Satang } from '~/types/money'

export const SATANG_PER_BAHT = 100

export function bahtToSatang(baht: number): Satang {
  return Math.round(baht * SATANG_PER_BAHT)
}

export function satangToBaht(satang: Satang): number {
  return satang / SATANG_PER_BAHT
}

export function formatBaht(satang: Satang): string {
  const baht = satangToBaht(satang)
  return `฿${baht.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export function calculateCommission(
  totalSatang: Satang,
  commissionPercent: number
): Satang {
  return Math.floor((totalSatang * commissionPercent) / 100)
}

export function calculatePartnerEarning(
  totalSatang: Satang,
  commissionPercent: number
): Satang {
  const commission = calculateCommission(totalSatang, commissionPercent)
  return totalSatang - commission
}

export function isValidSatang(value: number): value is Satang {
  return Number.isInteger(value) && value >= 0
}
