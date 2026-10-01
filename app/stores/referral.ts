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
  orderBy
} from 'firebase/firestore'
import type { Referral, ReferralStats, ReferralReward, ReferralSettings } from '~/types/referral'
import { generateId } from '~/utils/id-generator'
import { generateReferralCode } from '~/utils/referral'

// Default settings
const DEFAULT_SETTINGS: ReferralSettings = {
  enabled: true,
  referrerRewardSatang: 10000, // ฿100
  refereeRewardSatang: 10000, // ฿100
  minimumBookingAmountSatang: 50000, // ฿500
  rewardExpiryDays: 90, // 3 เดือน
  codeExpiryDays: undefined // ไม่หมดอายุ
}

export const useReferralStore = defineStore('referral', () => {
  const referrals = ref<Referral[]>([])
  const myReferralCode = ref<string | null>(null)
  const stats = ref<ReferralStats | null>(null)
  const rewards = ref<ReferralReward[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const settings = ref<ReferralSettings>(DEFAULT_SETTINGS)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  /**
   * Get or create referral code for current user
   */
  async function getMyReferralCode(userId: string, userName: string): Promise<string | null> {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const referralsRef = collection(db, 'referrals')

      // Check if user already has a code
      const q = query(referralsRef, where('referrerId', '==', userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const referral = querySnapshot.docs[0].data() as Referral
        myReferralCode.value = referral.code
        return referral.code
      }

      // Create new code
      const code = generateReferralCode(userName)
      const referralId = generateId('REF')
      const now = new Date().toISOString()

      const newReferral: Referral = {
        id: referralId,
        code,
        referrerId: userId,
        referrerName: userName,
        referrerRewardSatang: settings.value.referrerRewardSatang,
        refereeRewardSatang: settings.value.refereeRewardSatang,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      }

      const referralRef = doc(db, 'referrals', referralId)
      await setDoc(referralRef, newReferral)

      myReferralCode.value = code
      return code
    } catch (err: any) {
      console.error('Get referral code error:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Apply referral code when new user registers
   */
  async function applyReferralCode(code: string, newUserId: string, newUserName: string, newUserEmail: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const referralsRef = collection(db, 'referrals')

      // Find referral by code
      const q = query(referralsRef, where('code', '==', code.toUpperCase()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        error.value = 'ไม่พบรหัสแนะนำนี้'
        return false
      }

      const referralDoc = querySnapshot.docs[0]
      const referral = referralDoc.data() as Referral

      // Check if already used
      if (referral.status === 'completed') {
        error.value = 'รหัสนี้ถูกใช้ไปแล้ว'
        return false
      }

      // Check expiry
      if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) {
        error.value = 'รหัสนี้หมดอายุแล้ว'
        return false
      }

      // Update referral with referee info
      await updateDoc(referralDoc.ref, {
        refereeId: newUserId,
        refereeName: newUserName,
        refereeEmail: newUserEmail,
        status: 'pending',
        usedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Store in user profile for later use
      const userRef = doc(db, 'users', newUserId)
      await updateDoc(userRef, {
        referredBy: referral.referrerId,
        referralCode: code
      })

      return true
    } catch (err: any) {
      console.error('Apply referral code error:', err)
      error.value = err.message
      return false
    }
  }

  /**
   * Complete referral when referee makes first booking
   */
  async function completeReferral(refereeId: string, bookingId: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const referralsRef = collection(db, 'referrals')

      // Find pending referral
      const q = query(
        referralsRef,
        where('refereeId', '==', refereeId),
        where('status', '==', 'pending')
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return

      const referralDoc = querySnapshot.docs[0]
      const referral = referralDoc.data() as Referral

      // Update to completed
      await updateDoc(referralDoc.ref, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Create rewards for both parties
      await createReferralRewards(referral, bookingId)

      // Send notifications
      await notifyReferralComplete(referral)
    } catch (err: any) {
      console.error('Complete referral error:', err)
    }
  }

  /**
   * Create reward entries
   */
  async function createReferralRewards(referral: Referral, bookingId: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const now = new Date().toISOString()
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + settings.value.rewardExpiryDays)

      // Reward for referrer
      const referrerReward: ReferralReward = {
        id: generateId('REWARD'),
        userId: referral.referrerId,
        referralId: referral.id,
        amountSatang: referral.referrerRewardSatang,
        type: 'referrer',
        status: 'pending',
        createdAt: now,
        expiresAt: expiryDate.toISOString()
      }

      // Reward for referee
      const refereeReward: ReferralReward = {
        id: generateId('REWARD'),
        userId: referral.refereeId!,
        referralId: referral.id,
        amountSatang: referral.refereeRewardSatang,
        type: 'referee',
        status: 'pending',
        createdAt: now,
        expiresAt: expiryDate.toISOString()
      }

      await setDoc(doc(db, 'referralRewards', referrerReward.id), referrerReward)
      await setDoc(doc(db, 'referralRewards', refereeReward.id), refereeReward)
    } catch (err: any) {
      console.error('Create rewards error:', err)
    }
  }

  /**
   * Get referral stats for user
   */
  async function getReferralStats(userId: string): Promise<ReferralStats | null> {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const referralsRef = collection(db, 'referrals')

      const q = query(referralsRef, where('referrerId', '==', userId))
      const querySnapshot = await getDocs(q)

      let totalReferrals = 0
      let completedReferrals = 0
      let pendingReferrals = 0
      let totalRewardsEarnedSatang = 0

      querySnapshot.forEach((doc) => {
        const referral = doc.data() as Referral
        totalReferrals++

        if (referral.status === 'completed') {
          completedReferrals++
          totalRewardsEarnedSatang += referral.referrerRewardSatang
        } else if (referral.status === 'pending') {
          pendingReferrals++
        }
      })

      const conversionRate = totalReferrals > 0
        ? Math.round((completedReferrals / totalReferrals) * 100)
        : 0

      const statsData: ReferralStats = {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalRewardsEarnedSatang,
        conversionRate
      }

      stats.value = statsData
      return statsData
    } catch (err: any) {
      console.error('Get stats error:', err)
      return null
    }
  }

  /**
   * Get available rewards for user
   */
  async function getMyRewards(userId: string): Promise<ReferralReward[]> {
    if (!process.client) return []

    try {
      const db = getFirestore()
      const rewardsRef = collection(db, 'referralRewards')

      const q = query(
        rewardsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      )

      const querySnapshot = await getDocs(q)
      const results: ReferralReward[] = []

      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as ReferralReward)
      })

      rewards.value = results
      return results
    } catch (err: any) {
      console.error('Get rewards error:', err)
      return []
    }
  }

  /**
   * Send notification when referral is complete
   */
  async function notifyReferralComplete(referral: Referral): Promise<void> {
    try {
      const notificationStore = useNotificationStore()

      // Notify referrer
      await notificationStore.createNotification({
        userId: referral.referrerId,
        type: 'review_received', // reuse existing type or create new
        title: '🎉 คุณได้รางวัลแนะนำเพื่อน!',
        message: `${referral.refereeName} ใช้รหัสของคุณและจองครั้งแรกแล้ว คุณได้รับส่วนลด ฿${referral.referrerRewardSatang / 100}`,
        relatedId: referral.id,
        relatedType: 'booking'
      })

      // Notify referee
      if (referral.refereeId) {
        await notificationStore.createNotification({
          userId: referral.refereeId,
          type: 'review_received',
          title: '🎁 คุณได้รับส่วนลดต้อนรับ!',
          message: `ยินดีต้อนรับสู่ LUNG! คุณได้รับส่วนลด ฿${referral.refereeRewardSatang / 100} สำหรับการจองครั้งถัดไป`,
          relatedId: referral.id,
          relatedType: 'booking'
        })
      }
    } catch (err: any) {
      console.error('Notify referral complete error:', err)
    }
  }

  return {
    referrals,
    myReferralCode,
    stats,
    rewards,
    loading,
    error,
    settings,
    getMyReferralCode,
    applyReferralCode,
    completeReferral,
    getReferralStats,
    getMyRewards
  }
})
