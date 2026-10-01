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
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore'
import type { GroupBooking, GroupParticipant, CreateGroupBookingInput } from '~/types/group-booking'
import { generateId } from '~/utils/id-generator'
import { useNotificationStore } from './notification'

export const useGroupBookingStore = defineStore('groupBooking', () => {
  const groupBookings = ref<GroupBooking[]>([])
  const myGroupBookings = ref<GroupBooking[]>([])
  const loading = ref(false)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  /**
   * Create a new group booking
   */
  async function createGroupBooking(input: CreateGroupBookingInput): Promise<GroupBooking | null> {
    if (!process.client) return null

    try {
      loading.value = true
      const db = getFirestore()

      const groupBookingId = generateId('GROUP')
      const now = new Date().toISOString()

      // Create organizer participant
      const organizerParticipant: GroupParticipant = {
        userId: input.organizerId,
        userName: input.organizerName,
        userAvatar: input.organizerAvatar,
        userEmail: input.organizerEmail,
        status: 'confirmed',
        shareSatang: Math.floor(input.totalAmountSatang / input.maxParticipants),
        paidAt: undefined,
        joinedAt: now
      }

      const groupBooking: GroupBooking = {
        id: groupBookingId,
        bookingId: input.bookingId,
        organizerId: input.organizerId,
        organizerName: input.organizerName,
        lungId: input.lungId,
        lungName: input.lungName,
        activity: input.activity,
        date: input.date,
        time: input.time,
        duration: input.duration,
        location: input.location,
        maxParticipants: input.maxParticipants,
        currentParticipants: 1,
        totalAmountSatang: input.totalAmountSatang,
        splitType: input.splitType,
        participants: [organizerParticipant],
        participantIds: [input.organizerId], // For security rules
        status: 'open',
        bookingStatus: 'pending',
        isPublic: input.isPublic,
        inviteCode: generateInviteCode(),
        createdAt: now,
        updatedAt: now
      }

      await setDoc(doc(db, 'groupBookings', groupBookingId), groupBooking)

      groupBookings.value.push(groupBooking)
      return groupBooking
    } catch (err: any) {
      console.error('Create group booking error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Join a group booking
   */
  async function joinGroupBooking(
    groupBookingId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    userEmail: string
  ): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const groupBookingRef = doc(db, 'groupBookings', groupBookingId)
      const groupBookingSnap = await getDoc(groupBookingRef)

      if (!groupBookingSnap.exists()) {
        throw new Error('Group booking not found')
      }

      const groupBooking = groupBookingSnap.data() as GroupBooking

      // Check if user already joined
      if (groupBooking.participants.some(p => p.userId === userId)) {
        throw new Error('Already joined')
      }

      // Check if group is full
      if (groupBooking.currentParticipants >= groupBooking.maxParticipants) {
        throw new Error('Group is full')
      }

      // Check if group is still open
      if (groupBooking.status !== 'open') {
        throw new Error('Group is not accepting new members')
      }

      const participant: GroupParticipant = {
        userId,
        userName,
        userAvatar,
        userEmail,
        status: 'pending',
        shareSatang: Math.floor(groupBooking.totalAmountSatang / groupBooking.maxParticipants),
        paidAt: undefined,
        joinedAt: new Date().toISOString()
      }

      await updateDoc(groupBookingRef, {
        participants: [...groupBooking.participants, participant],
        participantIds: [...groupBooking.participantIds, userId], // For security rules
        currentParticipants: groupBooking.currentParticipants + 1,
        updatedAt: new Date().toISOString()
      })

      // Send notification to organizer
      const notificationStore = useNotificationStore()
      await notificationStore.createNotification({
        userId: groupBooking.organizerId,
        type: 'booking_request',
        title: '🎉 มีคนเข้าร่วมกรุ๊ปของคุณ',
        message: `${userName} เข้าร่วมการจองกรุ๊ป "${groupBooking.activity}"`,
        actionUrl: `/account/group-bookings/${groupBookingId}`,
        relatedId: groupBookingId,
        relatedType: 'booking',
        actorId: userId,
        actorName: userName,
        actorAvatar: userAvatar
      })

      return true
    } catch (err: any) {
      console.error('Join group booking error:', err)
      return false
    }
  }

  /**
   * Leave a group booking
   */
  async function leaveGroupBooking(groupBookingId: string, userId: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const groupBookingRef = doc(db, 'groupBookings', groupBookingId)
      const groupBookingSnap = await getDoc(groupBookingRef)

      if (!groupBookingSnap.exists()) {
        throw new Error('Group booking not found')
      }

      const groupBooking = groupBookingSnap.data() as GroupBooking

      // Can't leave if you're the organizer
      if (groupBooking.organizerId === userId) {
        throw new Error('Organizer cannot leave')
      }

      const updatedParticipants = groupBooking.participants.filter(p => p.userId !== userId)
      const updatedParticipantIds = updatedParticipants.map(p => p.userId)

      await updateDoc(groupBookingRef, {
        participants: updatedParticipants,
        participantIds: updatedParticipantIds, // For security rules
        currentParticipants: updatedParticipants.length,
        updatedAt: new Date().toISOString()
      })

      return true
    } catch (err: any) {
      console.error('Leave group booking error:', err)
      return false
    }
  }

  /**
   * Confirm group booking (when full or organizer decides)
   */
  async function confirmGroupBooking(groupBookingId: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const groupBookingRef = doc(db, 'groupBookings', groupBookingId)

      await updateDoc(groupBookingRef, {
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      })

      // TODO: Create actual booking in bookings collection
      // TODO: Send notifications to all participants

      return true
    } catch (err: any) {
      console.error('Confirm group booking error:', err)
      return false
    }
  }

  /**
   * Cancel group booking
   */
  async function cancelGroupBooking(groupBookingId: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const groupBookingRef = doc(db, 'groupBookings', groupBookingId)

      await updateDoc(groupBookingRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })

      // TODO: Send notifications to all participants

      return true
    } catch (err: any) {
      console.error('Cancel group booking error:', err)
      return false
    }
  }

  /**
   * Get group booking by ID
   */
  async function getGroupBooking(groupBookingId: string): Promise<GroupBooking | null> {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const groupBookingRef = doc(db, 'groupBookings', groupBookingId)
      const groupBookingSnap = await getDoc(groupBookingRef)

      if (!groupBookingSnap.exists()) {
        return null
      }

      return groupBookingSnap.data() as GroupBooking
    } catch (err: any) {
      console.error('Get group booking error:', err)
      return null
    }
  }

  /**
   * Get group booking by invite code
   */
  async function getGroupBookingByInviteCode(inviteCode: string): Promise<GroupBooking | null> {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const groupBookingsRef = collection(db, 'groupBookings')
      const q = query(groupBookingsRef, where('inviteCode', '==', inviteCode))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      return querySnapshot.docs[0].data() as GroupBooking
    } catch (err: any) {
      console.error('Get group booking by invite code error:', err)
      return null
    }
  }

  /**
   * Get user's group bookings
   */
  async function getMyGroupBookings(userId: string): Promise<GroupBooking[]> {
    if (!process.client) return []

    try {
      loading.value = true
      const db = getFirestore()
      const groupBookingsRef = collection(db, 'groupBookings')

      // Get bookings where user is organizer
      const organizerQuery = query(
        groupBookingsRef,
        where('organizerId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const organizerSnapshot = await getDocs(organizerQuery)
      const results: GroupBooking[] = []

      organizerSnapshot.forEach((doc) => {
        results.push(doc.data() as GroupBooking)
      })

      // Get bookings where user is a participant (client-side filter)
      const allBookingsQuery = query(
        groupBookingsRef,
        orderBy('createdAt', 'desc')
      )

      const allBookingsSnapshot = await getDocs(allBookingsQuery)

      allBookingsSnapshot.forEach((doc) => {
        const booking = doc.data() as GroupBooking
        if (booking.organizerId !== userId && booking.participants.some(p => p.userId === userId)) {
          results.push(booking)
        }
      })

      myGroupBookings.value = results
      return results
    } catch (err: any) {
      console.error('Get my group bookings error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get public group bookings
   */
  async function getPublicGroupBookings(): Promise<GroupBooking[]> {
    if (!process.client) return []

    try {
      loading.value = true
      const db = getFirestore()
      const groupBookingsRef = collection(db, 'groupBookings')

      const q = query(
        groupBookingsRef,
        where('isPublic', '==', true),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const results: GroupBooking[] = []

      querySnapshot.forEach((doc) => {
        results.push(doc.data() as GroupBooking)
      })

      groupBookings.value = results
      return results
    } catch (err: any) {
      console.error('Get public group bookings error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Update participant payment status
   */
  async function markParticipantAsPaid(
    groupBookingId: string,
    userId: string
  ): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const groupBookingRef = doc(db, 'groupBookings', groupBookingId)
      const groupBookingSnap = await getDoc(groupBookingRef)

      if (!groupBookingSnap.exists()) {
        throw new Error('Group booking not found')
      }

      const groupBooking = groupBookingSnap.data() as GroupBooking

      const updatedParticipants = groupBooking.participants.map(p => {
        if (p.userId === userId) {
          return {
            ...p,
            status: 'confirmed' as const,
            paidAt: new Date().toISOString()
          }
        }
        return p
      })

      await updateDoc(groupBookingRef, {
        participants: updatedParticipants,
        updatedAt: new Date().toISOString()
      })

      return true
    } catch (err: any) {
      console.error('Mark participant as paid error:', err)
      return false
    }
  }

  return {
    groupBookings,
    myGroupBookings,
    loading,
    createGroupBooking,
    joinGroupBooking,
    leaveGroupBooking,
    confirmGroupBooking,
    cancelGroupBooking,
    getGroupBooking,
    getGroupBookingByInviteCode,
    getMyGroupBookings,
    getPublicGroupBookings,
    markParticipantAsPaid
  }
})

/**
 * Generate random invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
