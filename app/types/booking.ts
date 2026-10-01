export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export interface Booking {
  id: string
  userId: string
  lungId: string
  userName: string
  lungName: string
  userAvatar?: string
  lungAvatar?: string
  activity: string
  date: string
  time: string
  duration: number
  location: string
  price: number
  commission: number
  netAmount: number
  status: BookingStatus
  note?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
  reviewId?: string
}

export interface BookingStats {
  todayBookings: number
  thisMonthEarnings: number
  averageRating: number
  totalCustomers: number
}
