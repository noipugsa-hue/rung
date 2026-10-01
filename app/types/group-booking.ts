/**
 * Group Booking Types
 * Multi-person bookings with split payment
 */

import type { Satang } from './money'

export type GroupBookingStatus = 'open' | 'confirmed' | 'cancelled' | 'completed'

export type ParticipantStatus = 'pending' | 'confirmed' | 'cancelled'

export type SplitType = 'equal' | 'custom' | 'organizer_pays'

export interface GroupParticipant {
  userId: string
  userName: string
  userAvatar: string
  userEmail: string
  status: ParticipantStatus
  shareSatang: Satang
  paidAt?: string
  joinedAt: string
}

export interface GroupBooking {
  id: string
  bookingId: string
  organizerId: string
  organizerName: string
  lungId: string
  lungName: string
  activity: string
  date: string
  time: string
  duration: number
  location: string
  maxParticipants: number
  currentParticipants: number
  totalAmountSatang: Satang
  splitType: SplitType
  participants: GroupParticipant[]
  participantIds: string[] // For security rules - list of all participant userIds
  status: GroupBookingStatus
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  isPublic: boolean
  inviteCode: string
  createdAt: string
  updatedAt: string
}

export interface CreateGroupBookingInput {
  bookingId: string
  organizerId: string
  organizerName: string
  organizerAvatar: string
  organizerEmail: string
  lungId: string
  lungName: string
  activity: string
  date: string
  time: string
  duration: number
  location: string
  maxParticipants: number
  totalAmountSatang: Satang
  splitType: SplitType
  isPublic: boolean
}
