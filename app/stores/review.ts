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
import type { Review, CreateReviewInput, ReviewStats } from '~/types/review'
import type { Booking } from '~/types'
import { generateId } from '~/utils/id-generator'

export const useReviewStore = defineStore('review', () => {
  const reviews = ref<Review[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  /**
   * Create a new review
   */
  async function createReview(input: CreateReviewInput): Promise<Review | null> {
    if (!process.client) return null

    loading.value = true
    error.value = null

    try {
      const db = getFirestore()

      // Verify booking exists and is completed
      const bookingRef = doc(db, 'bookings', input.bookingId)
      const bookingSnap = await getDoc(bookingRef)

      if (!bookingSnap.exists()) {
        throw new Error('การจองไม่พบในระบบ')
      }

      const booking = bookingSnap.data() as Booking
      if (booking.status !== 'completed') {
        throw new Error('สามารถรีวิวได้เฉพาะการจองที่สำเร็จแล้วเท่านั้น')
      }

      // Check if user already reviewed this booking
      const existingReview = await canReviewBooking(input.bookingId, input.reviewerId)
      if (!existingReview) {
        throw new Error('คุณได้รีวิวการจองนี้ไปแล้ว')
      }

      // Create review
      const reviewId = generateId('REV')
      const now = new Date().toISOString()

      const review: Review = {
        id: reviewId,
        bookingId: input.bookingId,
        reviewerId: input.reviewerId,
        reviewerType: input.reviewerType,
        reviewerName: input.reviewerName,
        reviewerAvatar: input.reviewerAvatar,
        revieweeId: input.revieweeId,
        revieweeType: input.revieweeType,
        rating: input.rating,
        comment: input.comment,
        activity: input.activity,
        createdAt: now,
        updatedAt: now,
        isVisible: true,
        reportedCount: 0
      }

      // Save to Firestore
      const reviewRef = doc(db, 'reviews', reviewId)
      await setDoc(reviewRef, review)

      // Update booking with review link
      const reviewField = input.reviewerType === 'user' ? 'userReviewId' : 'lungReviewId'
      const reviewedAtField = input.reviewerType === 'user' ? 'userReviewedAt' : 'lungReviewedAt'
      await updateDoc(bookingRef, {
        [reviewField]: reviewId,
        [reviewedAtField]: now,
        updatedAt: now
      })

      // Update reviewee's rating
      await updateRevieweeRating(input.revieweeId, input.revieweeType)

      // Create notification for reviewee
      await createReviewNotification(review)

      reviews.value.push(review)
      return review
    } catch (err: any) {
      console.error('Create review error:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch reviews for a specific reviewee (Lung or User)
   */
  async function fetchReviews(revieweeId: string, revieweeType: 'user' | 'lung'): Promise<Review[]> {
    if (!process.client) return []

    try {
      loading.value = true
      error.value = null
      const db = getFirestore()
      const reviewsRef = collection(db, 'reviews')

      const q = query(
        reviewsRef,
        where('revieweeId', '==', revieweeId),
        where('revieweeType', '==', revieweeType),
        where('isVisible', '==', true),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const results: Review[] = []

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as Review)
      })

      reviews.value = results
      return results
    } catch (err: any) {
      console.error('Fetch reviews error:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if a user can review a booking
   * Returns true if they CAN review (haven't reviewed yet)
   */
  async function canReviewBooking(bookingId: string, userId: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const reviewsRef = collection(db, 'reviews')

      const q = query(
        reviewsRef,
        where('bookingId', '==', bookingId),
        where('reviewerId', '==', userId)
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.empty
    } catch (err: any) {
      console.error('Can review booking error:', err)
      return false
    }
  }

  /**
   * Update average rating for reviewee
   */
  async function updateRevieweeRating(revieweeId: string, revieweeType: 'user' | 'lung'): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const reviewsRef = collection(db, 'reviews')

      const q = query(
        reviewsRef,
        where('revieweeId', '==', revieweeId),
        where('revieweeType', '==', revieweeType),
        where('isVisible', '==', true)
      )

      const querySnapshot = await getDocs(q)
      let totalRating = 0
      let count = 0

      querySnapshot.forEach((doc) => {
        const review = doc.data() as Review
        totalRating += review.rating
        count++
      })

      if (count > 0) {
        const averageRating = totalRating / count

        // Update the user or lung document
        const collectionName = revieweeType === 'lung' ? 'lungs' : 'users'
        const revieweeRef = doc(db, collectionName, revieweeId)

        await updateDoc(revieweeRef, {
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: count,
          updatedAt: new Date().toISOString()
        })
      }
    } catch (err: any) {
      console.error('Update reviewee rating error:', err)
    }
  }

  /**
   * Calculate review stats for a reviewee
   */
  async function getReviewStats(revieweeId: string, revieweeType: 'user' | 'lung'): Promise<ReviewStats> {
    if (!process.client) {
      return {
        averageRating: 0,
        totalCount: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    try {
      const db = getFirestore()
      const reviewsRef = collection(db, 'reviews')

      const q = query(
        reviewsRef,
        where('revieweeId', '==', revieweeId),
        where('revieweeType', '==', revieweeType),
        where('isVisible', '==', true)
      )

      const querySnapshot = await getDocs(q)
      let totalRating = 0
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

      querySnapshot.forEach((doc) => {
        const review = doc.data() as Review
        totalRating += review.rating
        distribution[review.rating as 1 | 2 | 3 | 4 | 5]++
      })

      const count = querySnapshot.size
      const averageRating = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 0

      return {
        averageRating,
        totalCount: count,
        distribution
      }
    } catch (err: any) {
      console.error('Get review stats error:', err)
      return {
        averageRating: 0,
        totalCount: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }
  }

  /**
   * Create notification when someone receives a review
   */
  async function createReviewNotification(review: Review): Promise<void> {
    if (!process.client) return

    try {
      // Import notification store dynamically to avoid circular dependency
      const notificationStore = useNotificationStore()

      const title = review.revieweeType === 'lung'
        ? '🌟 คุณได้รับรีวิวใหม่'
        : '🌟 คุณได้รับรีวิวจาก Lung'

      const message = `${review.reviewerName} ให้คะแนน ${review.rating} ดาว`

      await notificationStore.createNotification({
        userId: review.revieweeId,
        type: 'review_received',
        title,
        message,
        actionUrl: review.revieweeType === 'lung'
          ? '/partner/reviews'
          : '/account/reviews',
        actionLabel: 'ดูรีวิว',
        relatedId: review.id,
        relatedType: 'review',
        actorId: review.reviewerId,
        actorName: review.reviewerName,
        actorAvatar: review.reviewerAvatar
      })
    } catch (err: any) {
      console.error('Create review notification error:', err)
    }
  }

  return {
    reviews,
    loading,
    error,
    createReview,
    fetchReviews,
    canReviewBooking,
    updateRevieweeRating,
    getReviewStats
  }
})
