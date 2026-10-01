import { defineStore } from 'pinia'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import type { Notification, CreateNotificationInput } from '~/types/notification'
import { generateId } from '~/utils/id-generator'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let unsubscribe: (() => void) | null = null

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  /**
   * Create a new notification
   */
  async function createNotification(input: CreateNotificationInput): Promise<Notification | null> {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const notificationId = generateId('NOTIF')
      const now = new Date().toISOString()

      const notification: Notification = {
        id: notificationId,
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
        actionLabel: input.actionLabel,
        relatedId: input.relatedId,
        relatedType: input.relatedType,
        actorId: input.actorId,
        actorName: input.actorName,
        actorAvatar: input.actorAvatar,
        read: false,
        createdAt: now
      }

      const notificationRef = doc(db, 'notifications', notificationId)
      await setDoc(notificationRef, notification)

      // Add to local state if it's for the current user
      const authStore = useAuthStore()
      if (input.userId === authStore.user?.id) {
        notifications.value.unshift(notification)
        unreadCount.value++
      }

      return notification
    } catch (err: any) {
      console.error('Create notification error:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Fetch all notifications for a user
   */
  async function fetchNotifications(userId: string): Promise<Notification[]> {
    if (!process.client) return []

    try {
      loading.value = true
      error.value = null
      const db = getFirestore()
      const notificationsRef = collection(db, 'notifications')

      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const results: Notification[] = []
      let unread = 0

      querySnapshot.forEach((doc) => {
        const notification = {
          id: doc.id,
          ...doc.data()
        } as Notification
        results.push(notification)
        if (!notification.read) {
          unread++
        }
      })

      notifications.value = results
      unreadCount.value = unread
      return results
    } catch (err: any) {
      console.error('Fetch notifications error:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  function subscribeToNotifications(userId: string): (() => void) | null {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const notificationsRef = collection(db, 'notifications')

      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      // Unsubscribe from previous subscription if exists
      if (unsubscribe) {
        unsubscribe()
      }

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const results: Notification[] = []
          let unread = 0

          querySnapshot.forEach((doc) => {
            const notification = {
              id: doc.id,
              ...doc.data()
            } as Notification
            results.push(notification)
            if (!notification.read) {
              unread++
            }
          })

          notifications.value = results
          unreadCount.value = unread
        },
        (err) => {
          console.error('Subscribe to notifications error:', err)
          error.value = err.message
        }
      )

      return unsubscribe
    } catch (err: any) {
      console.error('Subscribe to notifications error:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Mark a notification as read
   */
  async function markAsRead(notificationId: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const notificationRef = doc(db, 'notifications', notificationId)
      const now = new Date().toISOString()

      await updateDoc(notificationRef, {
        read: true,
        readAt: now
      })

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        notification.read = true
        notification.readAt = now
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err: any) {
      console.error('Mark as read error:', err)
      error.value = err.message
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead(userId: string): Promise<void> {
    if (!process.client) return

    try {
      loading.value = true
      const db = getFirestore()
      const notificationsRef = collection(db, 'notifications')

      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return
      }

      // Use batch write for efficiency
      const batch = writeBatch(db)
      const now = new Date().toISOString()

      querySnapshot.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          read: true,
          readAt: now
        })
      })

      await batch.commit()

      // Update local state
      notifications.value.forEach(notification => {
        if (!notification.read) {
          notification.read = true
          notification.readAt = now
        }
      })
      unreadCount.value = 0
    } catch (err: any) {
      console.error('Mark all as read error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Get unread notifications
   */
  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  /**
   * Get recent notifications (last 5)
   */
  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 5)
  })

  /**
   * Cleanup subscription
   */
  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    unreadNotifications,
    recentNotifications,
    createNotification,
    fetchNotifications,
    subscribeToNotifications,
    markAsRead,
    markAllAsRead,
    cleanup
  }
})
