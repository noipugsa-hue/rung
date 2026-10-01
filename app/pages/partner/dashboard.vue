<script setup lang="ts">
import { Calendar, DollarSign, Star, TrendingUp, Users, MessageCircle } from 'lucide-vue-next'
import { useBookingStore } from '~/stores/booking'
import { useAuthStore } from '~/stores/auth'
import { useMessageStore } from '~/stores/message'

definePageMeta({
  middleware: 'auth'
})

const bookingStore = useBookingStore()
const authStore = useAuthStore()
const messageStore = useMessageStore()

const stats = ref([
  { icon: Calendar, label: 'การจองวันนี้', value: '0', color: 'bg-primary' },
  { icon: DollarSign, label: 'รายได้เดือนนี้', value: '฿0', color: 'bg-orange' },
  { icon: Star, label: 'คะแนนเฉลี่ย', value: '0', color: 'bg-soft-green' },
  { icon: Users, label: 'ผู้จองทั้งหมด', value: '0', color: 'bg-cream' },
])

const upcomingBookings = ref<any[]>([])
const loading = ref(true)
const unreadMessageCount = ref(0)

let unsubscribeMessages: (() => void) | null = null

// Load data on mount
onMounted(async () => {
  if (!authStore.user) return

  try {
    loading.value = true

    // Load statistics
    const statsData = await bookingStore.getPartnerStats(authStore.user.id)
    stats.value = [
      { icon: Calendar, label: 'การจองวันนี้', value: statsData.todayBookings.toString(), color: 'bg-primary' },
      { icon: DollarSign, label: 'รายได้เดือนนี้', value: `฿${statsData.thisMonthEarnings.toLocaleString()}`, color: 'bg-orange' },
      { icon: Star, label: 'คะแนนเฉลี่ย', value: statsData.averageRating.toString(), color: 'bg-soft-green' },
      { icon: Users, label: 'ผู้จองทั้งหมด', value: statsData.totalCustomers.toString(), color: 'bg-cream' },
    ]

    // Load upcoming bookings
    const bookings = await bookingStore.getUpcomingPartnerBookings(authStore.user.id, 5)
    upcomingBookings.value = bookings.map((booking: any) => ({
      id: booking.id,
      user: 'คุณ' + (booking.userId?.substring(0, 8) || 'ผู้ใช้'), // Placeholder, should fetch user name
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      activity: booking.activity,
      location: booking.location,
    }))

    // Subscribe to conversations to get unread count
    unsubscribeMessages = messageStore.subscribeToUserConversations(
      authStore.user.id,
      (conversations) => {
        // Calculate total unread messages
        let total = 0
        conversations.forEach(conv => {
          total += conv.unreadCount[authStore.user!.id] || 0
        })
        unreadMessageCount.value = total
      }
    )
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }
})

const userName = computed(() => authStore.user?.name || 'ลุง')
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          Dashboard
        </h1>
        <p class="text-gray-600">ยินดีต้อนรับกลับมา, {{ userName }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>

      <template v-else>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="card p-6"
        >
          <div class="flex items-center gap-4">
            <div :class="[stat.color, 'w-12 h-12 rounded-lung flex items-center justify-center']">
              <component :is="stat.icon" :size="24" class="text-dark" />
            </div>
            <div>
              <div class="text-2xl font-bold text-dark">{{ stat.value }}</div>
              <div class="text-sm text-gray-600">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Upcoming bookings -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-dark">การจองที่จะมาถึง</h2>
              <NuxtLink to="/partner/bookings" class="text-primary hover:underline text-sm">
                ดูทั้งหมด
              </NuxtLink>
            </div>

            <div v-if="upcomingBookings.length > 0" class="space-y-4">
              <div
                v-for="booking in upcomingBookings"
                :key="booking.id"
                class="p-4 bg-cream rounded-lung hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="font-semibold text-dark">{{ booking.user }}</h3>
                    <p class="text-sm text-gray-600">{{ booking.activity }}</p>
                  </div>
                  <span class="px-3 py-1 bg-primary rounded-full text-xs font-medium">
                    {{ booking.duration }}ชม
                  </span>
                </div>
                <div class="text-sm text-gray-600 space-y-1">
                  <p>📅 {{ new Date(booking.date).toLocaleDateString('th-TH') }}</p>
                  <p>🕐 {{ booking.time }}</p>
                  <p>📍 {{ booking.location }}</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <Calendar :size="48" class="text-gray-300 mx-auto mb-4" />
              <p class="text-gray-600">ยังไม่มีการจองที่จะมาถึง</p>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card p-6">
            <h2 class="text-xl font-bold text-dark mb-4">การดำเนินการด่วน</h2>
            <div class="space-y-3">
              <NuxtLink
                to="/partner/availability"
                class="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Calendar :size="18" />
                อัปเดตช่วงเวลาว่าง
              </NuxtLink>
              <NuxtLink
                to="/messages"
                class="btn-outline w-full flex items-center justify-center gap-2"
              >
                <MessageCircle :size="18" />
                <span>ข้อความ</span>
                <span v-if="unreadMessageCount > 0" class="ml-1 px-2 py-0.5 bg-primary rounded-full text-xs font-bold text-dark">
                  {{ unreadMessageCount }}
                </span>
              </NuxtLink>
              <NuxtLink
                to="/partner/profile"
                class="btn-outline w-full flex items-center justify-center gap-2"
              >
                <Users :size="18" />
                แก้ไขโปรไฟล์
              </NuxtLink>
            </div>
          </div>

          <div class="card p-6 bg-soft-green">
            <div class="flex items-center gap-3 mb-3">
              <TrendingUp :size="24" class="text-green-600" />
              <h3 class="font-bold text-dark">เคล็ดลับ</h3>
            </div>
            <p class="text-sm text-gray-700">
              ลุงที่ตอบข้อความภายใน 1 ชั่วโมงมีโอกาสได้รับการจองมากกว่า 3 เท่า
            </p>
          </div>
        </div>
      </div>

      </template>
    </div>
  </div>
</template>
