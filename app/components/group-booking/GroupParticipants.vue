<script setup lang="ts">
import { Crown, Check, Clock, X } from 'lucide-vue-next'
import type { GroupParticipant } from '~/types/group-booking'
import { formatBaht } from '~/utils/money'

const props = defineProps<{
  participants: GroupParticipant[]
  organizerId: string
}>()

const statusIcons = {
  confirmed: Check,
  pending: Clock,
  cancelled: X
}

const statusColors = {
  confirmed: 'text-green-600 bg-green-100',
  pending: 'text-orange-600 bg-orange-100',
  cancelled: 'text-red-600 bg-red-100'
}

const statusLabels = {
  confirmed: 'ชำระแล้ว',
  pending: 'รอชำระ',
  cancelled: 'ยกเลิก'
}
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-lg font-bold text-dark mb-4">สมาชิกในกรุ๊ป ({{ participants.length }} คน)</h3>

    <div
      v-for="participant in participants"
      :key="participant.userId"
      class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200"
    >
      <!-- User Info -->
      <div class="flex items-center gap-3 flex-1">
        <div class="relative">
          <img
            :src="participant.userAvatar || '/images/default-avatar.png'"
            :alt="participant.userName"
            class="w-12 h-12 rounded-full object-cover"
          />
          <!-- Organizer Crown -->
          <div
            v-if="participant.userId === organizerId"
            class="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
          >
            <Crown :size="14" class="text-dark" />
          </div>
        </div>

        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-dark">{{ participant.userName }}</p>
            <span
              v-if="participant.userId === organizerId"
              class="px-2 py-0.5 bg-primary rounded-full text-xs font-medium text-dark"
            >
              ผู้จัด
            </span>
          </div>
          <p class="text-sm text-gray-600">{{ formatBaht(participant.shareSatang) }}</p>
        </div>
      </div>

      <!-- Status Badge -->
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          :class="statusColors[participant.status]"
        >
          <component :is="statusIcons[participant.status]" :size="14" />
          <span>{{ statusLabels[participant.status] }}</span>
        </span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="participants.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <p>ยังไม่มีสมาชิกในกรุ๊ป</p>
    </div>
  </div>
</template>
