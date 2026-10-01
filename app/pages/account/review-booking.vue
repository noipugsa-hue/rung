<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import ReviewForm from '~/components/review/ReviewForm.vue'
import type { Booking } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const bookingStore = useBookingStore()
const reviewStore = useReviewStore()
const { showSuccess, showError } = useNotificationToast()

const bookingId = computed(() => route.query.bookingId as string)
const booking = ref<Booking | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const canReview = ref(false)

// Load booking
onMounted(async () => {
  if (!bookingId.value) {
    error.value = 'ไม่พบรหัสการจอง'
    loading.value = false
    return
  }

  if (!process.client) return

  try {
    loading.value = true
    const { $firebase } = useNuxtApp()
    const db = $firebase.db
    const { doc, getDoc } = await import('firebase/firestore')

    // Fetch booking
    const bookingRef = doc(db, 'bookings', bookingId.value)
    const bookingSnap = await getDoc(bookingRef)

    if (!bookingSnap.exists()) {
      error.value = 'ไม่พบการจองนี้'
      return
    }

    booking.value = { id: bookingSnap.id, ...bookingSnap.data() } as Booking

    // Check if booking is completed
    if (booking.value.status !== 'completed') {
      error.value = 'สามารถรีวิวได้เฉพาะการจองที่เสร็จสิ้นแล้ว'
      return
    }

    // Check if user can review
    if (!authStore.user?.id) {
      error.value = 'กรุณาเข้าสู่ระบบ'
      return
    }

    // Check if already reviewed
    canReview.value = await reviewStore.canReviewBooking(bookingId.value, authStore.user.id)
    if (!canReview.value) {
      error.value = 'คุณได้รีวิวการจองนี้ไปแล้ว'
    }
  } catch (err: any) {
    console.error('Load booking error:', err)
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง'
  } finally {
    loading.value = false
  }
})

// Handle review submission
async function handleSubmit(rating: number, comment: string) {
  if (!booking.value || !authStore.user) return

  try {
    // Determine reviewer and reviewee
    const isUserReviewer = booking.value.userId === authStore.user.id
    const reviewerType = isUserReviewer ? 'user' : 'lung'
    const revieweeType = isUserReviewer ? 'lung' : 'user'
    const revieweeId = isUserReviewer ? booking.value.lungId : booking.value.userId

    const review = await reviewStore.createReview({
      bookingId: booking.value.id,
      reviewerId: authStore.user.id,
      reviewerType,
      reviewerName: authStore.user.name || authStore.user.email,
      reviewerAvatar: authStore.user.avatar,
      revieweeId,
      revieweeType,
      rating,
      comment,
      activity: booking.value.activity
    })

    if (review) {
      showSuccess('สำเร็จ', 'ส่งรีวิวเรียบร้อยแล้ว')
      setTimeout(() => {
        router.push('/account/reviews')
      }, 1500)
    } else {
      showError('ข้อผิดพลาด', 'ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่อีกครั้ง')
    }
  } catch (err: any) {
    console.error('Submit review error:', err)
    showError('ข้อผิดพลาด', err.message || 'เกิดข้อผิดพลาดในการส่งรีวิว')
  }
}

// Handle cancel
function handleCancel() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-custom mx-auto px-4">
      <!-- Back Button -->
      <button
        type="button"
        @click="router.back()"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-dark mb-6 transition-colors"
      >
        <ArrowLeft :size="20" />
        <span>กลับ</span>
      </button>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">เขียนรีวิว</h1>
        <p class="text-gray-600">แบ่งปันประสบการณ์ของคุณกับผู้อื่น</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-white rounded-3xl p-8 text-center"
      >
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          type="button"
          @click="router.push('/account/bookings')"
          class="px-6 py-3 bg-primary text-dark rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          ดูประวัติการจอง
        </button>
      </div>

      <!-- Review Form -->
      <div v-else-if="booking && canReview" class="max-w-2xl mx-auto">
        <ReviewForm
          :booking="booking"
          :reviewer-type="booking.userId === authStore.user?.id ? 'user' : 'lung'"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>
