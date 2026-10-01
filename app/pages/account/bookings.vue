<script setup lang="ts">
import { Calendar, Clock, MapPin, User, ArrowLeft } from 'lucide-vue-next'
import { useBookingStore } from '~/stores/booking'
import { useAuthStore } from '~/stores/auth'
import { formatBaht } from '~/utils/money'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const bookingStore = useBookingStore()
const authStore = useAuthStore()
const router = useRouter()

const userBookings = computed(() => {
  if (!authStore.user) return []
  return bookingStore.getUserBookings(authStore.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

function getStatusBadge(status: string) {
  const badges: Record<string, { class: string; text: string }> = {
    pending: { class: 'bg-yellow-100 text-yellow-700', text: 'รอยืนยัน' },
    confirmed: { class: 'bg-blue-100 text-blue-700', text: 'ยืนยันแล้ว' },
    completed: { class: 'bg-green-100 text-green-700', text: 'เสร็จสิ้น' },
    cancelled: { class: 'bg-red-100 text-red-700', text: 'ยกเลิก' }
  }
  return badges[status] || badges.pending
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-4"
        >
          <ArrowLeft :size="20" />
          <span>กลับ</span>
        </button>

        <h1 class="text-3xl font-bold text-dark mb-2">
          การจองของฉัน
        </h1>
        <p class="text-gray-600">
          ดูและจัดการการจองทั้งหมดของคุณ
        </p>
      </div>

      <!-- Bookings List -->
      <div v-if="userBookings.length > 0" class="space-y-4">
        <div
          v-for="booking in userBookings"
          :key="booking.id"
          class="card p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="getStatusBadge(booking.status).class"
                >
                  {{ getStatusBadge(booking.status).text }}
                </span>
              </div>
              <h3 class="text-xl font-bold text-dark mb-2">{{ booking.activity }}</h3>
              <div class="space-y-1 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <Calendar :size="16" />
                  <span>{{ booking.date }} เวลา {{ booking.time }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Clock :size="16" />
                  <span>{{ booking.duration }} ชั่วโมง</span>
                </div>
                <div class="flex items-center gap-2">
                  <MapPin :size="16" />
                  <span>{{ booking.location }}</span>
                </div>
              </div>
            </div>

            <div class="text-right">
              <p class="text-2xl font-bold text-primary mb-1">
                {{ formatBaht(booking.totalAmountSatang) }}
              </p>
              <p class="text-xs text-gray-600">
                {{ formatDate(booking.createdAt) }}
              </p>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <NuxtLink
              :to="`/booking/${booking.id}`"
              class="text-primary hover:underline text-sm font-semibold"
            >
              ดูรายละเอียด →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card p-12 text-center">
        <Calendar :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">
          ยังไม่มีการจอง
        </h3>
        <p class="text-gray-600 mb-6">
          เริ่มค้นหาและจองลุงที่คุณต้องการได้เลย
        </p>
        <NuxtLink to="/search" class="btn-primary inline-flex items-center gap-2">
          ค้นหาลุง
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
