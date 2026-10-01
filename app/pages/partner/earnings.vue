<script setup lang="ts">
import { TrendingUp, Wallet, Clock, DollarSign, Calendar, Eye } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useBookingStore } from '~/stores/booking'
import { useLedgerStore } from '~/stores/ledger'
import { useCommissionStore } from '~/stores/commission'
import { formatBaht } from '~/utils/money'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const bookingStore = useBookingStore()
const ledgerStore = useLedgerStore()
const commissionStore = useCommissionStore()

const partnerId = computed(() => authStore.user?.id || '')

// Financial overview
const balance = computed(() => {
  if (!partnerId.value) return { totalEarned: 0, pendingPayout: 0, paidOut: 0 }
  return ledgerStore.calculatePartnerBalance(partnerId.value)
})

// Recent bookings
const recentBookings = computed(() => {
  if (!partnerId.value) return []
  return bookingStore.getPartnerBookings(partnerId.value)
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .slice(0, 10)
})

// Ledger entries
const recentEntries = computed(() => {
  if (!partnerId.value) return []
  return ledgerStore.getPartnerEntries(partnerId.value).slice(0, 10)
})

// Current commission rate
const currentCommissionRate = computed(() => {
  if (!partnerId.value) return 15
  return commissionStore.getActiveRateForPartner(partnerId.value)
})

// Statistics
const stats = computed(() => {
  const bookings = bookingStore.getPartnerBookings(partnerId.value)
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const totalHours = completedBookings.reduce((sum, b) => sum + b.duration, 0)
  const averageEarning = completedBookings.length > 0
    ? balance.value.totalEarned / completedBookings.length
    : 0

  return {
    totalBookings: completedBookings.length,
    totalHours,
    averageEarning
  }
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getEntryTypeLabel(type: string) {
  const labels: Record<string, string> = {
    booking_payment: 'รับชำระ',
    commission: 'คอมมิชชั่น',
    payout: 'โอนเงิน',
    refund: 'คืนเงิน'
  }
  return labels[type] || type
}

function getEntryTypeColor(type: string) {
  const colors: Record<string, string> = {
    booking_payment: 'text-green-600',
    commission: 'text-red-600',
    payout: 'text-blue-600',
    refund: 'text-orange-600'
  }
  return colors[type] || 'text-gray-600'
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">
          รายได้และยอดเงิน
        </h1>
        <p class="text-gray-600">
          ติดตามรายได้และจัดการการโอนเงินของคุณ
        </p>
      </div>

      <!-- Financial Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Earned -->
        <div class="card p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">รายได้ทั้งหมด</p>
              <p class="text-3xl font-bold text-dark">
                {{ formatBaht(balance.totalEarned) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp :size="24" class="text-green-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500">
            จาก {{ stats.totalBookings }} การจอง
          </p>
        </div>

        <!-- Pending Payout -->
        <div class="card p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">รอโอน</p>
              <p class="text-3xl font-bold text-primary">
                {{ formatBaht(balance.pendingPayout) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Wallet :size="24" class="text-dark" />
            </div>
          </div>
          <NuxtLink to="/partner/payouts" class="text-sm text-primary hover:underline">
            ขอโอนเงิน →
          </NuxtLink>
        </div>

        <!-- Paid Out -->
        <div class="card p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">โอนแล้ว</p>
              <p class="text-3xl font-bold text-dark">
                {{ formatBaht(balance.paidOut) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign :size="24" class="text-blue-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500">
            ยอดที่ได้รับแล้ว
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-4">
          <div class="text-2xl font-bold text-dark mb-1">{{ stats.totalBookings }}</div>
          <div class="text-sm text-gray-600">การจองที่เสร็จสิ้น</div>
        </div>

        <div class="card p-4">
          <div class="text-2xl font-bold text-dark mb-1">{{ stats.totalHours }}h</div>
          <div class="text-sm text-gray-600">ชั่วโมงทั้งหมด</div>
        </div>

        <div class="card p-4">
          <div class="text-2xl font-bold text-dark mb-1">{{ formatBaht(stats.averageEarning) }}</div>
          <div class="text-sm text-gray-600">เฉลี่ยต่อการจอง</div>
        </div>

        <div class="card p-4">
          <div class="text-2xl font-bold text-primary mb-1">{{ currentCommissionRate }}%</div>
          <div class="text-sm text-gray-600">อัตราคอมมิชชั่น</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Bookings -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-dark">การจองล่าสุด</h2>
            <NuxtLink to="/partner/bookings" class="text-sm text-primary hover:underline">
              ดูทั้งหมด →
            </NuxtLink>
          </div>

          <div v-if="recentBookings.length > 0" class="space-y-4">
            <div
              v-for="booking in recentBookings"
              :key="booking.id"
              class="p-4 border border-gray-200 rounded-lung hover:border-primary transition-colors"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-semibold text-dark">{{ booking.activity }}</p>
                  <p class="text-sm text-gray-600">
                    {{ formatDate(booking.date) }} • {{ booking.duration }}h
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-primary">
                    {{ formatBaht(booking.partnerEarningSatang) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    รายได้ของคุณ
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">
                  ค่าคอมมิชชั่น: {{ formatBaht(booking.commissionSnapshot.amountSatang) }}
                  ({{ booking.commissionSnapshot.rate }}%)
                </span>
                <span
                  class="px-2 py-1 rounded-full font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': booking.status === 'completed',
                    'bg-blue-100 text-blue-700': booking.status === 'confirmed'
                  }"
                >
                  {{ booking.status === 'completed' ? 'เสร็จสิ้น' : 'ยืนยันแล้ว' }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <Calendar :size="48" class="text-gray-300 mx-auto mb-3" />
            <p class="text-gray-600">ยังไม่มีการจอง</p>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-dark">ประวัติธุรกรรม</h2>
            <NuxtLink to="/partner/transactions" class="text-sm text-primary hover:underline">
              ดูทั้งหมด →
            </NuxtLink>
          </div>

          <div v-if="recentEntries.length > 0" class="space-y-3">
            <div
              v-for="entry in recentEntries"
              :key="entry.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="text-sm font-semibold"
                    :class="getEntryTypeColor(entry.type)"
                  >
                    {{ getEntryTypeLabel(entry.type) }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-green-100 text-green-700': entry.status === 'completed',
                      'bg-yellow-100 text-yellow-700': entry.status === 'pending',
                      'bg-red-100 text-red-700': entry.status === 'failed'
                    }"
                  >
                    {{ entry.status === 'completed' ? 'สำเร็จ' : entry.status === 'pending' ? 'รอดำเนินการ' : 'ล้มเหลว' }}
                  </span>
                </div>
                <p class="text-xs text-gray-600">
                  {{ formatDate(entry.createdAt) }}
                </p>
              </div>

              <div class="text-right">
                <p
                  class="font-bold"
                  :class="entry.type === 'commission' || entry.type === 'payout' ? 'text-red-600' : 'text-green-600'"
                >
                  {{ entry.type === 'commission' || entry.type === 'payout' ? '-' : '+' }}{{ formatBaht(entry.amountSatang) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <Clock :size="48" class="text-gray-300 mx-auto mb-3" />
            <p class="text-gray-600">ยังไม่มีธุรกรรม</p>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="card p-6 bg-blue-50 border-l-4 border-blue-400 mt-8">
        <h3 class="font-bold text-dark mb-2">ข้อมูลเกี่ยวกับรายได้</h3>
        <ul class="text-sm text-gray-700 space-y-1">
          <li>• รายได้จะถูกคำนวณหลังหักค่าคอมมิชชั่น {{ currentCommissionRate }}% แล้ว</li>
          <li>• คุณสามารถขอโอนเงินได้เมื่อยอดรอโอนมากกว่า ฿500</li>
          <li>• การโอนเงินจะดำเนินการภายใน 3-5 วันทำการ</li>
          <li>• ตรวจสอบข้อมูลบัญชีธนาคารให้ถูกต้องก่อนขอโอนเงิน</li>
        </ul>
      </div>
    </div>
  </div>
</template>
