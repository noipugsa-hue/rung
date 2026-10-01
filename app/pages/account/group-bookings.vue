<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import GroupBookingCard from '~/components/group-booking/GroupBookingCard.vue'
import { useGroupBookingStore } from '~/stores/group-booking'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const authStore = useAuthStore()
const groupBookingStore = useGroupBookingStore()

const filter = ref<'all' | 'active' | 'completed'>('all')
const loading = ref(true)

onMounted(async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    await groupBookingStore.getMyGroupBookings(authStore.user.id)
  } catch (err) {
    console.error('Load group bookings error:', err)
  } finally {
    loading.value = false
  }
})

const filteredBookings = computed(() => {
  let bookings = groupBookingStore.myGroupBookings

  if (filter.value === 'active') {
    bookings = bookings.filter(b => b.status === 'open' || b.status === 'confirmed')
  } else if (filter.value === 'completed') {
    bookings = bookings.filter(b => b.status === 'completed')
  }

  return bookings
})
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-custom mx-auto px-4 max-w-6xl">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <Users :size="32" class="text-primary" />
          <h1 class="text-3xl font-bold text-dark">การจองกรุ๊ป</h1>
        </div>
        <p class="text-gray-600">จัดการการจองกรุ๊ปของคุณ</p>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-2xl p-2 inline-flex gap-2 mb-8">
        <button
          type="button"
          @click="filter = 'all'"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="[
            filter === 'all'
              ? 'bg-primary text-dark'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          ทั้งหมด
        </button>
        <button
          type="button"
          @click="filter = 'active'"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="[
            filter === 'active'
              ? 'bg-primary text-dark'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          กำลังดำเนินการ
        </button>
        <button
          type="button"
          @click="filter = 'completed'"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="[
            filter === 'completed'
              ? 'bg-primary text-dark'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          เสร็จสิ้น
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <!-- Group Bookings Grid -->
      <div v-else-if="filteredBookings.length > 0" class="grid md:grid-cols-2 gap-6">
        <GroupBookingCard
          v-for="booking in filteredBookings"
          :key="booking.id"
          :group-booking="booking"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <Users :size="64" class="mx-auto text-gray-300 mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">ยังไม่มีการจองกรุ๊ป</h3>
        <p class="text-gray-600 mb-6">เริ่มสร้างการจองกรุ๊ปเพื่อชวนเพื่อนไปด้วยกัน</p>
        <NuxtLink to="/group-booking/join" class="btn-primary inline-block">
          เข้าร่วมการจองกรุ๊ป
        </NuxtLink>
      </div>

      <!-- CTA Section -->
      <div class="mt-12 bg-gradient-to-br from-primary to-orange rounded-3xl p-8 text-center">
        <h2 class="text-2xl font-bold text-dark mb-2">ไม่อยากไปคนเดียว?</h2>
        <p class="text-dark/80 mb-6">เข้าร่วมการจองกรุ๊ปกับคนอื่น หรือสร้างกรุ๊ปของคุณเอง!</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink to="/group-booking/join" class="btn-outline bg-white border-white text-dark hover:bg-cream">
            ดูกรุ๊ปที่เปิดรับสมาชิก
          </NuxtLink>
          <NuxtLink to="/search" class="btn-outline bg-white border-white text-dark hover:bg-cream">
            สร้างกรุ๊ปใหม่
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
