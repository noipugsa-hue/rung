<script setup lang="ts">
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock, Eye } from 'lucide-vue-next'
import { useBookingStore } from '~/stores/booking'
import { useLungStore } from '~/stores/lung'
import { formatBaht } from '~/utils/money'
import type { Booking } from '~/types'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const bookingStore = useBookingStore()
const lungStore = useLungStore()
const router = useRouter()

const searchQuery = ref('')
const statusFilter = ref('all')
const loading = ref(true)

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      bookingStore.fetchBookings(),
      lungStore.fetchLungs()
    ])
  } finally {
    loading.value = false
  }
})

// Get bookings from store
const bookings = computed(() => bookingStore.bookings)

// Get lung name by ID
function getLungName(lungId: string): string {
  const lung = lungStore.lungs.find(l => l.id === lungId)
  return lung?.name || 'ไม่พบข้อมูล'
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get status badge
const getStatusBadge = (status: string) => {
  const badges: Record<string, { label: string; class: string }> = {
    confirmed: { label: 'ยืนยันแล้ว', class: 'bg-green-100 text-green-700' },
    pending: { label: 'รอยืนยัน', class: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'เสร็จสิ้น', class: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'ยกเลิก', class: 'bg-red-100 text-red-700' },
    refunded: { label: 'คืนเงินแล้ว', class: 'bg-purple-100 text-purple-700' }
  }
  return badges[status] || { label: status, class: 'bg-gray-100 text-gray-700' }
}

// Filtered bookings
const filteredBookings = computed(() => {
  return bookings.value.filter(booking => {
    const lungName = getLungName(booking.lungId)
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.userId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      lungName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.activity.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = statusFilter.value === 'all' || booking.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// Statistics
const stats = computed(() => {
  return {
    total: bookings.value.length,
    pending: bookings.value.filter(b => b.status === 'pending').length,
    confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
    completed: bookings.value.filter(b => b.status === 'completed').length,
    cancelled: bookings.value.filter(b => b.status === 'cancelled').length
  }
})

function viewDetails(booking: Booking) {
  // Navigate to booking detail page (to be created)
  // router.push(`/admin/bookings/${booking.id}`)
  alert(`ดูรายละเอียดการจอง: ${booking.id}`)
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          จัดการการจอง
        </h1>
        <p class="text-gray-600">ดูและจัดการการจองทั้งหมดในระบบ</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <Calendar :size="18" class="text-gray-500" />
            <span class="text-sm font-semibold text-gray-600">ทั้งหมด</span>
          </div>
          <p class="text-2xl font-bold text-dark">{{ stats.total }}</p>
        </div>

        <div class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <Clock :size="18" class="text-yellow-500" />
            <span class="text-sm font-semibold text-gray-600">รอยืนยัน</span>
          </div>
          <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
        </div>

        <div class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <CheckCircle :size="18" class="text-green-500" />
            <span class="text-sm font-semibold text-gray-600">ยืนยันแล้ว</span>
          </div>
          <p class="text-2xl font-bold text-green-600">{{ stats.confirmed }}</p>
        </div>

        <div class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <CheckCircle :size="18" class="text-blue-500" />
            <span class="text-sm font-semibold text-gray-600">เสร็จสิ้น</span>
          </div>
          <p class="text-2xl font-bold text-blue-600">{{ stats.completed }}</p>
        </div>

        <div class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <XCircle :size="18" class="text-red-500" />
            <span class="text-sm font-semibold text-gray-600">ยกเลิก</span>
          </div>
          <p class="text-2xl font-bold text-red-600">{{ stats.cancelled }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Search -->
          <div class="relative">
            <Search :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหารหัสจอง, กิจกรรม, ชื่อลุง..."
              class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <!-- Status Filter -->
          <div class="relative">
            <Filter :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              v-model="statusFilter"
              class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none appearance-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอยืนยัน</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
              <option value="refunded">คืนเงินแล้ว</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div class="mb-4 text-gray-600">
        แสดง {{ filteredBookings.length }} รายการจากทั้งหมด {{ bookings.length }} รายการ
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Bookings Table -->
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-cream">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">รหัสจอง</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">ลุง</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">กิจกรรม</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">วันที่</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">ระยะเวลา</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">ยอดเงิน</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">สถานะ</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-dark">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="booking in filteredBookings"
                :key="booking.id"
                class="hover:bg-cream/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <span class="font-medium text-dark text-sm">{{ booking.id }}</span>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ formatDate(booking.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-dark font-medium">{{ getLungName(booking.lungId) }}</div>
                  <div class="text-xs text-gray-500">{{ booking.lungId }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">{{ booking.activity }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-dark font-medium">
                    {{ formatDate(booking.date) }}
                  </div>
                  <div class="text-xs text-gray-500">{{ booking.time }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">{{ booking.duration }} ชม.</span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-semibold text-dark">
                    {{ formatBaht(booking.totalAmountSatang) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    ลุงได้: {{ formatBaht(booking.partnerEarningSatang) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[getStatusBadge(booking.status).class, 'px-3 py-1 rounded-full text-xs font-medium inline-block']"
                  >
                    {{ getStatusBadge(booking.status).label }}
                  </span>
                  <div v-if="booking.paymentStatus === 'paid'" class="text-xs text-green-600 mt-1">
                    ✓ ชำระแล้ว
                  </div>
                  <div v-else class="text-xs text-gray-500 mt-1">
                    ยังไม่ชำระ
                  </div>
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="viewDetails(booking)"
                    class="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    <Eye :size="16" />
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredBookings.length === 0" class="p-12 text-center">
          <Calendar :size="48" class="text-gray-300 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-dark mb-2">ไม่พบการจอง</h3>
          <p class="text-gray-600">
            {{ searchQuery || statusFilter !== 'all' ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' : 'ยังไม่มีการจองในระบบ' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
