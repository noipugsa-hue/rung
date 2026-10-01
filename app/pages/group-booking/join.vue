<script setup lang="ts">
import { Users, Search } from 'lucide-vue-next'
import GroupBookingCard from '~/components/group-booking/GroupBookingCard.vue'
import { useGroupBookingStore } from '~/stores/group-booking'

definePageMeta({
  layout: 'default'
})

const groupBookingStore = useGroupBookingStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const inviteCode = ref('')
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    await groupBookingStore.getPublicGroupBookings()
  } catch (err) {
    console.error('Load public group bookings error:', err)
  } finally {
    loading.value = false
  }
})

const filteredBookings = computed(() => {
  let bookings = groupBookingStore.groupBookings

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    bookings = bookings.filter(
      b =>
        b.activity.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query) ||
        b.organizerName.toLowerCase().includes(query)
    )
  }

  return bookings
})

async function handleJoinByCode() {
  if (!inviteCode.value) return

  const { showError, showSuccess } = useNotificationToast()

  if (!authStore.user?.id) {
    showError('กรุณาเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อนเข้าร่วมกรุ๊ป')
    navigateTo('/login')
    return
  }

  try {
    const groupBooking = await groupBookingStore.getGroupBookingByInviteCode(inviteCode.value)

    if (!groupBooking) {
      showError('ไม่พบกรุ๊ป', 'รหัสเชิญไม่ถูกต้อง')
      return
    }

    const success = await groupBookingStore.joinGroupBooking(
      groupBooking.id,
      authStore.user.id,
      authStore.user.name || authStore.user.email,
      authStore.user.avatar || '',
      authStore.user.email
    )

    if (success) {
      showSuccess('สำเร็จ', 'เข้าร่วมกรุ๊ปเรียบร้อย')
      navigateTo(`/account/group-bookings`)
    } else {
      showError('ไม่สามารถเข้าร่วม', 'กรุณาลองใหม่อีกครั้ง')
    }
  } catch (err) {
    console.error('Join by code error:', err)
    showError('เกิดข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง')
  }
}

async function handleJoin(groupBooking: any) {
  const { showError, showSuccess } = useNotificationToast()

  if (!authStore.user?.id) {
    showError('กรุณาเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อนเข้าร่วมกรุ๊ป')
    navigateTo('/login')
    return
  }

  const success = await groupBookingStore.joinGroupBooking(
    groupBooking.id,
    authStore.user.id,
    authStore.user.name || authStore.user.email,
    authStore.user.avatar || '',
    authStore.user.email
  )

  if (success) {
    showSuccess('สำเร็จ', 'เข้าร่วมกรุ๊ปเรียบร้อย')
    navigateTo(`/account/group-bookings`)
  } else {
    showError('ไม่สามารถเข้าร่วม', 'กรุณาลองใหม่อีกครั้ง')
  }
}
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-custom mx-auto px-4 max-w-6xl">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <Users :size="32" class="text-primary" />
          <h1 class="text-3xl font-bold text-dark">เข้าร่วมการจองกรุ๊ป</h1>
        </div>
        <p class="text-gray-600">ค้นหากรุ๊ปที่เปิดรับสมาชิกและเข้าร่วมได้เลย</p>
      </div>

      <!-- Join by Invite Code -->
      <div class="bg-white rounded-3xl p-6 border-2 border-primary mb-8">
        <h3 class="text-lg font-bold text-dark mb-4">มีรหัสเชิญอยู่แล้ว?</h3>
        <div class="flex gap-3">
          <input
            v-model="inviteCode"
            type="text"
            placeholder="ใส่รหัสเชิญ (8 ตัวอักษร)"
            maxlength="8"
            class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none uppercase font-mono"
            @keyup.enter="handleJoinByCode"
          />
          <button
            @click="handleJoinByCode"
            class="btn-primary whitespace-nowrap"
            :disabled="inviteCode.length !== 8"
          >
            เข้าร่วม
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative">
          <Search :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหากิจกรรม, สถานที่, หรือชื่อผู้จัด"
            class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <!-- Group Bookings Grid -->
      <div v-else-if="filteredBookings.length > 0" class="space-y-4">
        <p class="text-gray-600 mb-4">
          พบ <span class="font-semibold text-dark">{{ filteredBookings.length }}</span> กรุ๊ป
        </p>

        <div class="grid md:grid-cols-2 gap-6">
          <GroupBookingCard
            v-for="booking in filteredBookings"
            :key="booking.id"
            :group-booking="booking"
            :show-actions="false"
            @join="handleJoin(booking)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <Users :size="64" class="mx-auto text-gray-300 mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">ยังไม่มีกรุ๊ปที่เปิดรับสมาชิก</h3>
        <p class="text-gray-600 mb-6">สร้างกรุ๊ปของคุณเองและเชิญเพื่อนมาร่วมสนุกกัน!</p>
        <NuxtLink to="/search" class="btn-primary inline-block">
          สร้างการจองกรุ๊ป
        </NuxtLink>
      </div>

      <!-- How It Works -->
      <div class="mt-12 bg-white rounded-3xl p-8">
        <h2 class="text-2xl font-bold text-dark mb-6">การจองกรุ๊ปคืออะไร?</h2>

        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">1️⃣</span>
            </div>
            <h3 class="font-bold text-dark mb-2">เข้าร่วมกรุ๊ป</h3>
            <p class="text-sm text-gray-600">
              เลือกกรุ๊ปที่สนใจหรือใช้รหัสเชิญจากเพื่อน
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">2️⃣</span>
            </div>
            <h3 class="font-bold text-dark mb-2">แบ่งค่าใช้จ่าย</h3>
            <p class="text-sm text-gray-600">
              ค่าใช้จ่ายจะถูกแบ่งเท่าๆ กันตามจำนวนสมาชิก
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">3️⃣</span>
            </div>
            <h3 class="font-bold text-dark mb-2">ไปด้วยกัน</h3>
            <p class="text-sm text-gray-600">
              เมื่อครบจำนวนจะยืนยันการจองและไปสนุกกัน!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
