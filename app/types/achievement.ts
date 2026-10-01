/**
 * Achievement & Badges Types
 * ระบบ Gamification - ตราสัญลักษณ์และความสำเร็จ
 */

export type AchievementCategory =
  | 'booking'
  | 'social'
  | 'review'
  | 'milestone'
  | 'special'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Achievement {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string // emoji or icon name
  category: AchievementCategory
  tier: AchievementTier

  // Unlock criteria
  requirement: {
    type: 'booking_count' | 'review_count' | 'referral_count' | 'category_count' | 'lung_count' | 'spending' | 'custom'
    target: number
    category?: string // สำหรับ category-specific achievements
  }

  // Rewards
  rewardPoints?: number
  rewardBadge: boolean

  // Display
  order: number
  isVisible: boolean
  isSecret: boolean // hidden until unlocked
}

export interface UserAchievement {
  userId: string
  achievementId: string
  progress: number
  total: number
  unlocked: boolean
  unlockedAt?: string
  notified: boolean
}

export interface UserPoints {
  userId: string
  totalPoints: number
  currentPoints: number // หลังหักใช้ไปแล้ว
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  tierProgress: number // % ไปยัง tier ถัดไป

  // History
  earnedPoints: number
  spentPoints: number

  createdAt: string
  updatedAt: string
}

export interface PointTransaction {
  id: string
  userId: string
  points: number // บวก = ได้, ลบ = ใช้
  type: 'earn' | 'spend'
  reason: string
  relatedId?: string // booking/review/referral ID
  relatedType?: 'booking' | 'review' | 'referral' | 'achievement'
  createdAt: string
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Booking milestones
  {
    id: 'first_booking',
    name: 'ผู้บุกเบิก',
    nameEn: 'First Timer',
    description: 'จองครั้งแรกสำเร็จ',
    icon: '🎉',
    category: 'milestone',
    tier: 'bronze',
    requirement: { type: 'booking_count', target: 1 },
    rewardPoints: 50,
    rewardBadge: true,
    order: 1,
    isVisible: true,
    isSecret: false
  },
  {
    id: 'booking_5',
    name: 'คนคุ้นเคย',
    nameEn: 'Regular',
    description: 'จองครบ 5 ครั้ง',
    icon: '🌟',
    category: 'booking',
    tier: 'silver',
    requirement: { type: 'booking_count', target: 5 },
    rewardPoints: 100,
    rewardBadge: true,
    order: 2,
    isVisible: true,
    isSecret: false
  },
  {
    id: 'booking_10',
    name: 'ลูกค้าประจำ',
    nameEn: 'VIP',
    description: 'จองครบ 10 ครั้ง',
    icon: '💎',
    category: 'booking',
    tier: 'gold',
    requirement: { type: 'booking_count', target: 10 },
    rewardPoints: 200,
    rewardBadge: true,
    order: 3,
    isVisible: true,
    isSecret: false
  },
  {
    id: 'booking_50',
    name: 'ตำนานลุง',
    nameEn: 'Legend',
    description: 'จองครบ 50 ครั้ง',
    icon: '👑',
    category: 'booking',
    tier: 'platinum',
    requirement: { type: 'booking_count', target: 50 },
    rewardPoints: 500,
    rewardBadge: true,
    order: 4,
    isVisible: true,
    isSecret: false
  },

  // Category achievements
  {
    id: 'foodie',
    name: 'นักชิม',
    nameEn: 'Foodie',
    description: 'ไปกินมา 10 ครั้ง',
    icon: '🍜',
    category: 'social',
    tier: 'silver',
    requirement: { type: 'category_count', target: 10, category: 'กินข้าว' },
    rewardPoints: 100,
    rewardBadge: true,
    order: 10,
    isVisible: true,
    isSecret: false
  },
  {
    id: 'cafe_hopper',
    name: 'นักล่าคาเฟ่',
    nameEn: 'Cafe Hopper',
    description: 'ไปคาเฟ่ 5 ร้าน',
    icon: '☕',
    category: 'social',
    tier: 'silver',
    requirement: { type: 'category_count', target: 5, category: 'คาเฟ่' },
    rewardPoints: 75,
    rewardBadge: true,
    order: 11,
    isVisible: true,
    isSecret: false
  },
  {
    id: 'traveler',
    name: 'นักเดินทาง',
    nameEn: 'Traveler',
    description: 'ท่องเที่ยวมา 5 ครั้ง',
    icon: '✈️',
    category: 'social',
    tier: 'gold',
    requirement: { type: 'category_count', target: 5, category: 'ท่องเที่ยว' },
    rewardPoints: 150,
    rewardBadge: true,
    order: 12,
    isVisible: true,
    isSecret: false
  },

  // Social achievements
  {
    id: 'social_butterfly',
    name: 'ผีเสื้อสังคม',
    nameEn: 'Social Butterfly',
    description: 'จองกับลุงต่างคนกัน 10 คน',
    icon: '🦋',
    category: 'social',
    tier: 'gold',
    requirement: { type: 'lung_count', target: 10 },
    rewardPoints: 150,
    rewardBadge: true,
    order: 20,
    isVisible: true,
    isSecret: false
  },

  // Review achievements
  {
    id: 'reviewer',
    name: 'นักเขียนรีวิว',
    nameEn: 'Reviewer',
    description: 'เขียนรีวิว 5 ครั้ง',
    icon: '✍️',
    category: 'review',
    tier: 'silver',
    requirement: { type: 'review_count', target: 5 },
    rewardPoints: 75,
    rewardBadge: true,
    order: 30,
    isVisible: true,
    isSecret: false
  },
  {
    id: 'critic',
    name: 'นักวิจารณ์',
    nameEn: 'Critic',
    description: 'เขียนรีวิว 20 ครั้ง',
    icon: '📝',
    category: 'review',
    tier: 'gold',
    requirement: { type: 'review_count', target: 20 },
    rewardPoints: 200,
    rewardBadge: true,
    order: 31,
    isVisible: true,
    isSecret: false
  },

  // Referral achievements
  {
    id: 'recruiter',
    name: 'นักชวน',
    nameEn: 'Recruiter',
    description: 'แนะนำเพื่อน 3 คน',
    icon: '🤝',
    category: 'social',
    tier: 'silver',
    requirement: { type: 'referral_count', target: 3 },
    rewardPoints: 150,
    rewardBadge: true,
    order: 40,
    isVisible: true,
    isSecret: false
  },
  {
    id: 'ambassador',
    name: 'ทูตลุง',
    nameEn: 'Ambassador',
    description: 'แนะนำเพื่อน 10 คน',
    icon: '🎖️',
    category: 'social',
    tier: 'gold',
    requirement: { type: 'referral_count', target: 10 },
    rewardPoints: 500,
    rewardBadge: true,
    order: 41,
    isVisible: true,
    isSecret: false
  }
]

// Tier thresholds
export const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 500,
  Gold: 2000,
  Platinum: 5000
}
