/**
 * Notification Types
 * In-app notification system for user engagement
 */

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_request'
  | 'booking_completed'
  | 'message_received'
  | 'review_received'
  | 'payout_approved'
  | 'payout_rejected'
  | 'application_approved'
  | 'application_rejected'

export type NotificationRelatedType = 'booking' | 'message' | 'review' | 'payout' | 'application'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  relatedId?: string
  relatedType?: NotificationRelatedType
  actorId?: string
  actorName?: string
  actorAvatar?: string
  read: boolean
  readAt?: string
  createdAt: string
}

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  relatedId?: string
  relatedType?: NotificationRelatedType
  actorId?: string
  actorName?: string
  actorAvatar?: string
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastNotification {
  id: string
  type: ToastType
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  duration?: number
}
