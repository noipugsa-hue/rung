/**
 * Featured Activities & Promotions Types
 * กิจกรรมแนะนำและโปรโมชั่นพิเศษ
 */

import type { Satang } from './money'

export type PromotionType = 'percentage' | 'fixed_amount' | 'bundle'
export type PromotionStatus = 'draft' | 'active' | 'expired' | 'disabled'

export interface FeaturedActivity {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string

  // Visual
  image: string
  icon?: string
  color?: string // hex color for theming

  // Promotion details
  type: PromotionType
  discountPercent?: number // สำหรับ percentage
  discountAmountSatang?: Satang // สำหรับ fixed_amount
  minimumBookingSatang?: Satang // จองขั้นต่ำเท่าไร

  // Targeting
  categories?: string[] // จำกัดเฉพาะ category ไหน
  featuredLungs?: string[] // จำกัดเฉพาะ lung ไหน
  locationTags?: string[] // เช่น ["Bangkok", "Chiang Mai"]

  // Validity
  validFrom: string
  validUntil: string
  maxRedemptions?: number // จำกัดจำนวนคนใช้
  currentRedemptions: number

  // Display
  featured: boolean // แสดงในหน้าแรก
  order: number // ลำดับการแสดง
  status: PromotionStatus

  // Tracking
  views: number
  clicks: number
  conversions: number

  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface PromotionRedemption {
  id: string
  promotionId: string
  userId: string
  bookingId: string
  discountAmountSatang: Satang
  redeemedAt: string
}

export interface SeasonalPromotion {
  id: string
  name: string
  season: 'valentine' | 'songkran' | 'summer' | 'newyear' | 'custom'
  startDate: string
  endDate: string
  discountPercent: number
  categories: string[]
  bannerImage: string
}
