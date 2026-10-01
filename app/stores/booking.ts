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
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore'
import type { Booking } from '~/types'
import type { Satang } from '~/types/money'
import { calculateBookingCommission, createCommissionSnapshot } from '~/utils/commission'
import { generateId } from '~/utils/id-generator'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  async function createBooking(params: {
    lungId: string
    userId: string
    date: string
    time: string
    duration: number
    location: string
    activity: string
    hourlyRateSatang: Satang
    commissionPercent: number
    paymentMethod: string
  }): Promise<Booking> {
    loading.value = true
    error.value = null

    try {
      const calculation = calculateBookingCommission(
        params.hourlyRateSatang,
        params.duration,
        params.commissionPercent
      )

      const bookingId = generateId('LUNG')

      const booking: Booking = {
        id: bookingId,
        lungId: params.lungId,
        userId: params.userId,
        date: params.date,
        time: params.time,
        duration: params.duration,
        location: params.location,
        activity: params.activity,
        totalAmountSatang: calculation.totalSatang,
        commissionSnapshot: createCommissionSnapshot(bookingId, calculation),
        partnerEarningSatang: calculation.partnerEarningSatang,
        status: 'pending',
        paymentMethod: params.paymentMethod as 'promptpay' | 'credit' | 'cash',
        paymentStatus: 'unpaid',
        partnerStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to Firestore
      if (process.client) {
        const db = getFirestore()
        const bookingRef = doc(db, 'bookings', bookingId)
        await setDoc(bookingRef, booking)
      }

      bookings.value.push(booking)
      currentBooking.value = booking

      return booking
    } finally {
      loading.value = false
    }
  }

  async function updatePartnerStatus(
    bookingId: string,
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    const booking = bookings.value.find(b => b.id === bookingId)
    if (booking) {
      booking.partnerStatus = status
      booking.partnerRespondedAt = new Date().toISOString()
      booking.updatedAt = new Date().toISOString()

      if (status === 'accepted') {
        booking.status = 'confirmed'
      } else {
        booking.status = 'cancelled'
      }

      // Update Firestore
      if (process.client) {
        const db = getFirestore()
        const bookingRef = doc(db, 'bookings', bookingId)
        await updateDoc(bookingRef, {
          partnerStatus: status,
          partnerRespondedAt: booking.partnerRespondedAt,
          status: booking.status,
          updatedAt: booking.updatedAt
        })
      }
    }
  }

  async function getPartnerBookings(partnerId: string): Promise<Booking[]> {
    if (!process.client) return []

    try {
      loading.value = true
      const db = getFirestore()
      const bookingsRef = collection(db, 'bookings')

      // Simple query without orderBy to avoid index requirement
      const q = query(
        bookingsRef,
        where('lungId', '==', partnerId)
      )

      const querySnapshot = await getDocs(q)
      const results: Booking[] = []

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as Booking)
      })

      // Sort by date in descending order (client-side)
      results.sort((a, b) => b.date.localeCompare(a.date))

      bookings.value = results
      return results
    } catch (err: any) {
      console.error('Get partner bookings error:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function getUserBookings(userId: string): Promise<Booking[]> {
    if (!process.client) return []

    try {
      loading.value = true
      const db = getFirestore()
      const bookingsRef = collection(db, 'bookings')

      // Simple query - orderBy might need index but it's simple enough
      const q = query(
        bookingsRef,
        where('userId', '==', userId)
      )

      const querySnapshot = await getDocs(q)
      const results: Booking[] = []

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as Booking)
      })

      // Sort by date in descending order (client-side)
      results.sort((a, b) => b.date.localeCompare(a.date))

      return results
    } catch (err: any) {
      console.error('Get user bookings error:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Get upcoming bookings for partner dashboard
  async function getUpcomingPartnerBookings(partnerId: string, limitCount = 10): Promise<Booking[]> {
    if (!process.client) return []

    try {
      const db = getFirestore()
      const bookingsRef = collection(db, 'bookings')
      const today = new Date().toISOString().split('T')[0]

      // Simple query to avoid composite index requirement
      const q = query(
        bookingsRef,
        where('lungId', '==', partnerId)
      )

      const querySnapshot = await getDocs(q)
      const results: Booking[] = []

      // Filter and sort in client-side
      querySnapshot.forEach((doc) => {
        const booking = doc.data() as Booking
        // Only include confirmed bookings with date >= today
        if (booking.status === 'confirmed' && booking.date >= today) {
          results.push({
            id: doc.id,
            ...booking
          } as Booking)
        }
      })

      // Sort by date and time
      results.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }
        return (a.time || '').localeCompare(b.time || '')
      })

      // Limit results
      return results.slice(0, limitCount)
    } catch (err: any) {
      console.error('Get upcoming partner bookings error:', err)
      return []
    }
  }

  // Admin: Fetch all bookings
  async function fetchBookings(): Promise<void> {
    if (!process.client) return

    try {
      loading.value = true
      error.value = null
      const db = getFirestore()
      const bookingsRef = collection(db, 'bookings')
      const q = query(bookingsRef, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      bookings.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking))
    } catch (err: any) {
      console.error('Fetch bookings error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Get partner statistics
  async function getPartnerStats(partnerId: string) {
    if (!process.client) {
      return {
        todayBookings: 0,
        thisMonthEarnings: 0,
        averageRating: 0,
        totalCustomers: 0
      }
    }

    try {
      const db = getFirestore()
      const bookingsRef = collection(db, 'bookings')

      // Get today's bookings
      const today = new Date().toISOString().split('T')[0]
      const todayQuery = query(
        bookingsRef,
        where('lungId', '==', partnerId),
        where('date', '==', today)
      )
      const todaySnapshot = await getDocs(todayQuery)
      const todayBookings = todaySnapshot.size

      // Get this month's completed bookings for earnings
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

      // Simple query first - just by lungId
      const monthQuery = query(
        bookingsRef,
        where('lungId', '==', partnerId)
      )
      const monthSnapshot = await getDocs(monthQuery)

      // Filter in client-side to avoid composite index requirement
      let thisMonthEarnings = 0
      monthSnapshot.forEach((doc) => {
        const booking = doc.data() as Booking
        // Filter: status must be confirmed or completed, and date >= firstDayOfMonth
        if (
          (booking.status === 'confirmed' || booking.status === 'completed') &&
          booking.date >= firstDayOfMonth
        ) {
          // Convert Satang to Baht
          thisMonthEarnings += (booking.partnerEarningSatang || 0) / 100
        }
      })

      // Get all completed bookings for total customers
      const completedQuery = query(
        bookingsRef,
        where('lungId', '==', partnerId),
        where('status', '==', 'completed')
      )
      const completedSnapshot = await getDocs(completedQuery)
      const uniqueCustomers = new Set<string>()
      completedSnapshot.forEach((doc) => {
        const booking = doc.data() as Booking
        uniqueCustomers.add(booking.userId)
      })

      // For average rating, placeholder for now
      const averageRating = 4.9

      return {
        todayBookings,
        thisMonthEarnings: Math.round(thisMonthEarnings),
        averageRating,
        totalCustomers: uniqueCustomers.size
      }
    } catch (err: any) {
      console.error('Get partner stats error:', err)
      return {
        todayBookings: 0,
        thisMonthEarnings: 0,
        averageRating: 0,
        totalCustomers: 0
      }
    }
  }

  return {
    bookings,
    currentBooking,
    loading,
    error,
    createBooking,
    updatePartnerStatus,
    fetchBookings,
    getPartnerBookings,
    getUserBookings,
    getUpcomingPartnerBookings,
    getPartnerStats
  }
})
