import { defineStore } from 'pinia'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore'
import type { UserAchievement, UserPoints, PointTransaction, Achievement } from '~/types/achievement'
import { ACHIEVEMENTS, TIER_THRESHOLDS } from '~/types/achievement'
import { generateId } from '~/utils/id-generator'

export const useAchievementStore = defineStore('achievement', () => {
  const userAchievements = ref<UserAchievement[]>([])
  const userPoints = ref<UserPoints | null>(null)
  const pointHistory = ref<PointTransaction[]>([])
  const loading = ref(false)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  /**
   * Initialize user achievements
   */
  async function initializeUserAchievements(userId: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const batch = writeBatch(db)

      for (const achievement of ACHIEVEMENTS) {
        const userAchievementId = `${userId}_${achievement.id}`
        const userAchievementRef = doc(db, 'userAchievements', userAchievementId)

        const userAchievement: UserAchievement = {
          userId,
          achievementId: achievement.id,
          progress: 0,
          total: achievement.requirement.target,
          unlocked: false,
          notified: false
        }

        batch.set(userAchievementRef, userAchievement, { merge: true })
      }

      await batch.commit()
    } catch (err: any) {
      console.error('Initialize achievements error:', err)
    }
  }

  /**
   * Check and unlock achievements
   */
  async function checkAchievements(userId: string): Promise<Achievement[]> {
    if (!process.client) return []

    try {
      const db = getFirestore()
      const unlocked: Achievement[] = []

      // Get user's current data
      const bookingStore = useBookingStore()
      const reviewStore = useReviewStore()
      const referralStore = useReferralStore()

      const userBookings = await bookingStore.getUserBookings(userId)
      const completedBookings = userBookings.filter(b => b.status === 'completed')

      for (const achievement of ACHIEVEMENTS) {
        const userAchievementId = `${userId}_${achievement.id}`
        const userAchievementRef = doc(db, 'userAchievements', userAchievementId)
        const userAchievementSnap = await getDoc(userAchievementRef)

        if (!userAchievementSnap.exists()) continue

        const userAchievement = userAchievementSnap.data() as UserAchievement

        // Skip if already unlocked
        if (userAchievement.unlocked) continue

        let progress = 0

        // Calculate progress based on type
        switch (achievement.requirement.type) {
          case 'booking_count':
            progress = completedBookings.length
            break

          case 'category_count':
            if (achievement.requirement.category) {
              progress = completedBookings.filter(
                b => b.activity === achievement.requirement.category
              ).length
            }
            break

          case 'lung_count':
            const uniqueLungs = new Set(completedBookings.map(b => b.lungId))
            progress = uniqueLungs.size
            break

          case 'review_count':
            const reviews = await reviewStore.fetchReviews(userId, 'user')
            progress = reviews.length
            break

          case 'referral_count':
            const stats = await referralStore.getReferralStats(userId)
            progress = stats?.completedReferrals || 0
            break
        }

        // Update progress
        await updateDoc(userAchievementRef, {
          progress
        })

        // Check if unlocked
        if (progress >= achievement.requirement.target) {
          await updateDoc(userAchievementRef, {
            unlocked: true,
            unlockedAt: new Date().toISOString()
          })

          // Award points
          if (achievement.rewardPoints) {
            await awardPoints(userId, achievement.rewardPoints, 'achievement', achievement.id)
          }

          unlocked.push(achievement)
        }
      }

      return unlocked
    } catch (err: any) {
      console.error('Check achievements error:', err)
      return []
    }
  }

  /**
   * Get user achievements
   */
  async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
    if (!process.client) return []

    try {
      const db = getFirestore()
      const userAchievementsRef = collection(db, 'userAchievements')

      const q = query(userAchievementsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      const results: UserAchievement[] = []
      querySnapshot.forEach((doc) => {
        results.push(doc.data() as UserAchievement)
      })

      userAchievements.value = results
      return results
    } catch (err: any) {
      console.error('Get user achievements error:', err)
      return []
    }
  }

  /**
   * Award points to user
   */
  async function awardPoints(userId: string, points: number, reason: string, relatedId?: string, relatedType?: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()

      // Get or create user points
      const userPointsRef = doc(db, 'userPoints', userId)
      const userPointsSnap = await getDoc(userPointsRef)

      let currentPoints: UserPoints

      if (userPointsSnap.exists()) {
        currentPoints = userPointsSnap.data() as UserPoints
        currentPoints.totalPoints += points
        currentPoints.currentPoints += points
        currentPoints.earnedPoints += points
      } else {
        currentPoints = {
          userId,
          totalPoints: points,
          currentPoints: points,
          tier: 'Bronze',
          tierProgress: 0,
          earnedPoints: points,
          spentPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      // Update tier
      currentPoints.tier = calculateTier(currentPoints.totalPoints)
      currentPoints.tierProgress = calculateTierProgress(currentPoints.totalPoints)
      currentPoints.updatedAt = new Date().toISOString()

      await setDoc(userPointsRef, currentPoints)

      // Create point transaction
      const transactionId = generateId('POINTS')
      const transaction: PointTransaction = {
        id: transactionId,
        userId,
        points,
        type: 'earn',
        reason,
        relatedId,
        relatedType,
        createdAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'pointTransactions', transactionId), transaction)

      userPoints.value = currentPoints
    } catch (err: any) {
      console.error('Award points error:', err)
    }
  }

  /**
   * Calculate tier based on total points
   */
  function calculateTier(totalPoints: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (totalPoints >= TIER_THRESHOLDS.Platinum) return 'Platinum'
    if (totalPoints >= TIER_THRESHOLDS.Gold) return 'Gold'
    if (totalPoints >= TIER_THRESHOLDS.Silver) return 'Silver'
    return 'Bronze'
  }

  /**
   * Calculate progress to next tier (%)
   */
  function calculateTierProgress(totalPoints: number): number {
    const currentTier = calculateTier(totalPoints)
    const tierKeys = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const
    const currentIndex = tierKeys.indexOf(currentTier)

    if (currentIndex === tierKeys.length - 1) return 100 // Max tier

    const currentThreshold = TIER_THRESHOLDS[currentTier]
    const nextTier = tierKeys[currentIndex + 1]
    const nextThreshold = TIER_THRESHOLDS[nextTier]

    const progress = ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  /**
   * Get user points
   */
  async function getUserPoints(userId: string): Promise<UserPoints | null> {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const userPointsRef = doc(db, 'userPoints', userId)
      const userPointsSnap = await getDoc(userPointsRef)

      if (userPointsSnap.exists()) {
        const points = userPointsSnap.data() as UserPoints
        userPoints.value = points
        return points
      }

      return null
    } catch (err: any) {
      console.error('Get user points error:', err)
      return null
    }
  }

  /**
   * Get unlocked achievements
   */
  const unlockedAchievements = computed(() => {
    return userAchievements.value.filter(ua => ua.unlocked)
  })

  /**
   * Get locked achievements
   */
  const lockedAchievements = computed(() => {
    return userAchievements.value.filter(ua => !ua.unlocked)
  })

  return {
    userAchievements,
    userPoints,
    pointHistory,
    loading,
    unlockedAchievements,
    lockedAchievements,
    initializeUserAchievements,
    checkAchievements,
    getUserAchievements,
    getUserPoints,
    awardPoints
  }
})
