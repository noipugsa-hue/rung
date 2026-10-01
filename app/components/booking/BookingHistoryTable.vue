<script setup lang="ts">
import { Eye, RotateCcw, Star } from 'lucide-vue-next'
import type { Booking } from '~/types'
import { formatBaht } from '~/utils/money'

const props = defineProps<{
  bookings: Booking[]
  userType?: 'user' | 'lung'
}>()

const router = useRouter()

// Get status badge color
function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700'
    case 'confirmed':
      return 'bg-blue-100 text-blue-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'cancelled':
    case 'refunded':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Get status label
function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'เสร็จสิ้น'
    case 'confirmed':
      return 'ยืนยันแล้ว'
    case 'pending':
      return 'รอดำเนินการ'
    case 'cancelled':
      return 'ยกเลิก'
    case 'refunded':
      return 'คืนเงิน'
    default:
      return status
  }
}

// Format date to Thai
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Check if user can review this booking
async function canReview(booking: Booking): Promise<boolean> {
  if (booking.status !== 'completed') return false

  const reviewStore = useReviewStore()
  const authStore = useAuthStore()

  if (!authStore.user?.id) return false

  return await reviewStore.canReviewBooking(booking.id, authStore.user.id)
}

// Navigate to review page
function handleReview(booking: Booking) {
  router.push(`/account/review-booking?bookingId=${booking.id}`)
}

// Navigate to booking details
function handleViewDetails(booking: Booking) {
  router.push(`/booking/${booking.id}`)
}

// Book again with same details
function handleBookAgain(booking: Booking) {
  router.push(`/lung/${booking.lungId}?activity=${encodeURIComponent(booking.activity)}&duration=${booking.duration}`)
}
</script>

<template>
  <div class="overflow-x-auto">
    <!-- Desktop Table -->
    <table class="hidden md:table w-full bg-white rounded-2xl overflow-hidden">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            สถานะ
          </th>
          <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            กิจกรรม
          </th>
          <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            วันที่
          </th>
          <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            เวลา
          </th>
          <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            สถานที่
          </th>
          <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            ราคา
          </th>
          <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
            การดำเนินการ
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr v-for="booking in bookings" :key="booking.id" class="hover:bg-gray-50">
          <!-- Status -->
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusColor(booking.status)"
            >
              {{ getStatusLabel(booking.status) }}
            </span>
          </td>

          <!-- Activity -->
          <td class="px-6 py-4">
            <div class="text-sm font-medium text-dark">{{ booking.activity }}</div>
            <div class="text-xs text-gray-500">{{ booking.duration }} ชั่วโมง</div>
          </td>

          <!-- Date -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
            {{ formatDate(booking.date) }}
          </td>

          <!-- Time -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
            {{ booking.time }}
          </td>

          <!-- Location -->
          <td class="px-6 py-4 text-sm text-gray-700">
            {{ booking.location }}
          </td>

          <!-- Amount -->
          <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark">
            {{ formatBaht(booking.totalAmountSatang) }}
          </td>

          <!-- Actions -->
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                @click="handleViewDetails(booking)"
                class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="ดูรายละเอียด"
              >
                <Eye :size="18" />
              </button>

              <button
                v-if="booking.status === 'completed'"
                type="button"
                @click="handleReview(booking)"
                class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="เขียนรีวิว"
              >
                <Star :size="18" />
              </button>

              <button
                v-if="booking.status === 'completed'"
                type="button"
                @click="handleBookAgain(booking)"
                class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="จองอีกครั้ง"
              >
                <RotateCcw :size="18" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-4">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="bg-white rounded-2xl p-4 border border-gray-200"
      >
        <!-- Status -->
        <div class="flex items-center justify-between mb-3">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            :class="getStatusColor(booking.status)"
          >
            {{ getStatusLabel(booking.status) }}
          </span>
          <span class="text-sm font-semibold text-dark">
            {{ formatBaht(booking.totalAmountSatang) }}
          </span>
        </div>

        <!-- Info -->
        <div class="space-y-2 mb-4">
          <div>
            <p class="text-sm font-medium text-dark">{{ booking.activity }}</p>
            <p class="text-xs text-gray-500">{{ booking.duration }} ชั่วโมง</p>
          </div>
          <div class="text-sm text-gray-700">
            <p>{{ formatDate(booking.date) }} • {{ booking.time }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ booking.location }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-3 border-t border-gray-200">
          <button
            type="button"
            @click="handleViewDetails(booking)"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
          >
            ดูรายละเอียด
          </button>

          <button
            v-if="booking.status === 'completed'"
            type="button"
            @click="handleReview(booking)"
            class="flex-1 px-4 py-2 bg-primary text-dark rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            เขียนรีวิว
          </button>

          <button
            v-if="booking.status === 'completed'"
            type="button"
            @click="handleBookAgain(booking)"
            class="px-4 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <RotateCcw :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="bookings.length === 0"
      class="text-center py-12 bg-cream rounded-3xl"
    >
      <p class="text-gray-500 mb-2">ไม่พบประวัติการจอง</p>
      <p class="text-sm text-gray-400">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
    </div>
  </div>
</template>
