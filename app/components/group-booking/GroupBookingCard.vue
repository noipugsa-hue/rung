<script setup lang="ts">
import { Users, MapPin, Calendar, Clock, Copy, Check } from 'lucide-vue-next'
import type { GroupBooking } from '~/types/group-booking'
import { formatBaht } from '~/utils/money'

const props = defineProps<{
  groupBooking: GroupBooking
  showActions?: boolean
}>()

const emit = defineEmits<{
  join: []
  leave: []
  confirm: []
  cancel: []
}>()

const copied = ref(false)
const inviteLink = computed(() => {
  return `${window.location.origin}/group-booking/${props.groupBooking.inviteCode}`
})

const spotsLeft = computed(() => {
  return props.groupBooking.maxParticipants - props.groupBooking.currentParticipants
})

const pricePerPerson = computed(() => {
  return Math.floor(props.groupBooking.totalAmountSatang / props.groupBooking.maxParticipants)
})

const statusColors = {
  open: 'bg-green-100 text-green-700',
  confirmed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700'
}

const statusLabels = {
  open: 'เปิดรับสมาชิก',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิก',
  completed: 'เสร็จสิ้น'
}

async function copyInviteLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl p-6 border border-gray-200 hover:border-primary transition-colors">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-dark mb-1">{{ groupBooking.activity }}</h3>
        <p class="text-sm text-gray-600">จัดโดย {{ groupBooking.organizerName }}</p>
      </div>

      <span
        class="px-3 py-1 rounded-full text-xs font-semibold"
        :class="statusColors[groupBooking.status]"
      >
        {{ statusLabels[groupBooking.status] }}
      </span>
    </div>

    <!-- Details -->
    <div class="space-y-3 mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-700">
        <MapPin :size="16" class="text-primary" />
        <span>{{ groupBooking.location }}</span>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-700">
        <Calendar :size="16" class="text-primary" />
        <span>{{ new Date(groupBooking.date).toLocaleDateString('th-TH') }}</span>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-700">
        <Clock :size="16" class="text-primary" />
        <span>{{ groupBooking.time }} ({{ groupBooking.duration }} ชม.)</span>
      </div>
    </div>

    <!-- Participants Progress -->
    <div class="mb-4">
      <div class="flex items-center justify-between text-sm mb-2">
        <span class="flex items-center gap-1.5 text-gray-700">
          <Users :size="16" class="text-primary" />
          <span>{{ groupBooking.currentParticipants }}/{{ groupBooking.maxParticipants }} คน</span>
        </span>
        <span v-if="spotsLeft > 0" class="text-green-600 font-medium">
          เหลืออีก {{ spotsLeft }} ที่
        </span>
        <span v-else class="text-gray-600 font-medium">เต็มแล้ว</span>
      </div>

      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary to-orange transition-all duration-500"
          :style="{ width: `${(groupBooking.currentParticipants / groupBooking.maxParticipants) * 100}%` }"
        />
      </div>
    </div>

    <!-- Price -->
    <div class="bg-cream rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">ราคาต่อคน</p>
          <p class="text-2xl font-bold text-dark">{{ formatBaht(pricePerPerson) }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600 mb-1">ราคารวม</p>
          <p class="text-lg font-semibold text-gray-700">{{ formatBaht(groupBooking.totalAmountSatang) }}</p>
        </div>
      </div>
    </div>

    <!-- Invite Code (if open) -->
    <div v-if="groupBooking.status === 'open' && showActions" class="mb-4">
      <label class="text-xs text-gray-600 mb-1 block">รหัสเชิญเพื่อน</label>
      <div class="flex items-center gap-2">
        <div class="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-mono text-sm">
          {{ groupBooking.inviteCode }}
        </div>
        <button
          @click="copyInviteLink"
          class="btn-outline p-2"
          :class="{ 'bg-green-100 border-green-500': copied }"
        >
          <Check v-if="copied" :size="20" class="text-green-600" />
          <Copy v-else :size="20" />
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="flex gap-2">
      <button
        v-if="groupBooking.status === 'open' && spotsLeft > 0"
        @click="emit('join')"
        class="btn-primary flex-1"
      >
        เข้าร่วม
      </button>

      <button
        v-if="groupBooking.status === 'open'"
        @click="emit('leave')"
        class="btn-outline flex-1"
      >
        ออกจากกรุ๊ป
      </button>

      <button
        v-if="groupBooking.status === 'open'"
        @click="emit('confirm')"
        class="btn-primary flex-1"
      >
        ยืนยันการจอง
      </button>

      <button
        v-if="groupBooking.status === 'open'"
        @click="emit('cancel')"
        class="btn-outline flex-1 text-red-600 border-red-600"
      >
        ยกเลิก
      </button>
    </div>

    <!-- View Details Link -->
    <NuxtLink
      v-else
      :to="`/account/group-bookings/${groupBooking.id}`"
      class="btn-primary w-full block text-center"
    >
      ดูรายละเอียด
    </NuxtLink>
  </div>
</template>
