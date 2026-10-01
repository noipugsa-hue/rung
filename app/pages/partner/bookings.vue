<script setup lang="ts">
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, MessageCircle } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth'
})

const activeTab = ref('upcoming')

const bookings = {
  upcoming: [
    {
      id: 'BK-001',
      user: {
        name: 'คุณสมชาย ใจดี',
        avatar: 'https://i.pravatar.cc/150?img=11'
      },
      activity: 'กินข้าว',
      date: '2026-10-01',
      time: '14:00',
      duration: 2,
      location: 'สยามพารากอน',
      price: 600,
      status: 'confirmed',
      note: 'อยากไปกินอาหารญี่ปุ่น'
    },
    {
      id: 'BK-002',
      user: {
        name: 'คุณสมหญิง รักษา',
        avatar: 'https://i.pravatar.cc/150?img=5'
      },
      activity: 'คาเฟ่',
      date: '2026-10-02',
      time: '10:00',
      duration: 1,
      location: 'ทองหล่อ',
      price: 300,
      status: 'confirmed'
    },
  ],
  pending: [
    {
      id: 'BK-003',
      user: {
        name: 'คุณโจ สุขใจ',
        avatar: 'https://i.pravatar.cc/150?img=33'
      },
      activity: 'เที่ยว',
      date: '2026-10-05',
      time: '09:00',
      duration: 3,
      location: 'เจ้าพระยา',
      price: 900,
      status: 'pending'
    },
  ],
  completed: [
    {
      id: 'BK-004',
      user: {
        name: 'คุณมานี มีสุข',
        avatar: 'https://i.pravatar.cc/150?img=44'
      },
      activity: 'ช้อปปิ้ง',
      date: '2026-09-25',
      time: '13:00',
      duration: 2,
      location: 'เซ็นทรัล',
      price: 600,
      status: 'completed',
      reviewed: true
    },
  ]
}

const currentBookings = computed(() => {
  return bookings[activeTab.value as keyof typeof bookings] || []
})

const acceptBooking = (bookingId: string) => {
  console.log('Accept booking:', bookingId)
  // Implement accept logic
}

const rejectBooking = (bookingId: string) => {
  console.log('Reject booking:', bookingId)
  // Implement reject logic
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          การจอง
        </h1>
        <p class="text-gray-600">จัดการการจองของคุณ</p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <div class="flex gap-6">
          <button
            @click="activeTab = 'upcoming'"
            :class="[
              'pb-4 px-2 font-semibold transition-colors border-b-2',
              activeTab === 'upcoming'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-dark'
            ]"
          >
            กำลังจะมาถึง ({{ bookings.upcoming.length }})
          </button>
          <button
            @click="activeTab = 'pending'"
            :class="[
              'pb-4 px-2 font-semibold transition-colors border-b-2',
              activeTab === 'pending'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-dark'
            ]"
          >
            รอยืนยัน ({{ bookings.pending.length }})
          </button>
          <button
            @click="activeTab = 'completed'"
            :class="[
              'pb-4 px-2 font-semibold transition-colors border-b-2',
              activeTab === 'completed'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-dark'
            ]"
          >
            เสร็จสิ้น ({{ bookings.completed.length }})
          </button>
        </div>
      </div>

      <!-- Bookings List -->
      <div class="space-y-4">
        <div
          v-for="booking in currentBookings"
          :key="booking.id"
          class="card p-6"
        >
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <!-- Main Info -->
            <div class="flex-1 space-y-4">
              <!-- User -->
              <div class="flex items-center gap-3">
                <img
                  :src="booking.user.avatar"
                  :alt="booking.user.name"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 class="font-bold text-dark">{{ booking.user.name }}</h3>
                  <span class="text-sm px-3 py-1 bg-cream rounded-full">{{ booking.activity }}</span>
                </div>
              </div>

              <!-- Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-center gap-2 text-gray-600">
                  <Calendar :size="16" />
                  <span>{{ new Date(booking.date).toLocaleDateString('th-TH') }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <Clock :size="16" />
                  <span>{{ booking.time }} ({{ booking.duration }} ชั่วโมง)</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <MapPin :size="16" />
                  <span>{{ booking.location }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold text-dark">฿{{ booking.price }}</span>
                </div>
              </div>

              <!-- Note -->
              <div v-if="booking.note" class="p-3 bg-cream rounded-lung text-sm text-gray-700">
                <strong>หมายเหตุ:</strong> {{ booking.note }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 md:min-w-[200px]">
              <span
                v-if="activeTab === 'upcoming'"
                class="px-4 py-2 bg-green-100 text-green-700 rounded-lung text-center text-sm font-medium"
              >
                ยืนยันแล้ว
              </span>

              <template v-if="activeTab === 'pending'">
                <button
                  @click="acceptBooking(booking.id)"
                  class="btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle :size="18" />
                  ยืนยัน
                </button>
                <button
                  @click="rejectBooking(booking.id)"
                  class="btn-outline border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <XCircle :size="18" />
                  ปฏิเสธ
                </button>
              </template>

              <template v-if="activeTab === 'completed'">
                <span
                  class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lung text-center text-sm font-medium"
                >
                  เสร็จสิ้น
                </span>
                <span
                  v-if="booking.reviewed"
                  class="text-xs text-gray-500 text-center"
                >
                  ได้รับรีวิวแล้ว
                </span>
              </template>

              <button
                class="btn-outline flex items-center justify-center gap-2"
              >
                <MessageCircle :size="18" />
                ส่งข้อความ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="currentBookings.length === 0" class="card p-12 text-center">
        <Calendar :size="48" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">ไม่มีการจอง</h3>
        <p class="text-gray-600">
          {{ activeTab === 'pending' ? 'ไม่มีการจองที่รอยืนยัน' :
             activeTab === 'completed' ? 'ยังไม่มีการจองที่เสร็จสิ้น' :
             'ไม่มีการจองที่จะมาถึง' }}
        </p>
      </div>
    </div>
  </div>
</template>
