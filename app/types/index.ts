export interface Lung {
  id: string
  name: string
  age: number
  avatar: string
  location: string
  bio: string
  rating: number
  reviewCount: number
  price: number
  categories: string[]
  languages: string[]
  experience: string
  verified: boolean
  available: boolean
  instantBook: boolean
  reviews: Review[]
  availability: AvailabilitySlot[]
  gallery: string[]
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  activity: string
}

export interface AvailabilitySlot {
  date: string
  times: string[]
}

export interface Category {
  id: string
  name: string
  icon: string
  emoji: string
}

export interface Booking {
  id: string
  lungId: string
  userId: string
  date: string
  time: string
  duration: number
  location: string
  activity: string

  // Financial fields
  totalAmountSatang: import('./money').Satang
  commissionSnapshot: import('./commission').CommissionSnapshot
  partnerEarningSatang: import('./money').Satang

  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded'

  // Payment tracking
  paymentMethod?: 'promptpay' | 'credit' | 'cash'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  paidAt?: string

  createdAt: string
  updatedAt: string

  // Partner actions
  partnerStatus?: 'pending' | 'accepted' | 'rejected'
  partnerRespondedAt?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  phone: string
  favorites: string[]
  bookings: string[]
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message
  unreadCount: number
}
