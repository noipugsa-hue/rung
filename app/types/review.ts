/**
 * Review Types
 * Two-way review system for Users and Lungs
 */

export type ReviewerType = 'user' | 'lung'

export interface Review {
  id: string
  bookingId: string

  // Reviewer (who wrote review)
  reviewerId: string
  reviewerType: ReviewerType
  reviewerName: string
  reviewerAvatar?: string

  // Reviewee (who is being reviewed)
  revieweeId: string
  revieweeType: ReviewerType

  // Content
  rating: number // 1-5
  comment: string
  activity: string

  createdAt: string
  updatedAt: string
  isVisible: boolean
  reportedCount: number
}

export interface CreateReviewInput {
  bookingId: string
  reviewerId: string
  reviewerType: ReviewerType
  reviewerName: string
  reviewerAvatar?: string
  revieweeId: string
  revieweeType: ReviewerType
  rating: number
  comment: string
  activity: string
}

export interface ReviewStats {
  averageRating: number
  totalCount: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}
