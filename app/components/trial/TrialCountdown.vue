<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import type { TrialStatus } from '~/types/trial'

const props = defineProps<{
  trialStatus: TrialStatus
  type: 'user' | 'lung'
}>()

const benefit = computed(() => {
  return props.type === 'user' ? 'ส่วนลด 50%' : 'ไม่มีค่าคอมมิชชั่น'
})

const daysText = computed(() => {
  const days = props.trialStatus.daysRemaining
  if (days === 0) return 'วันนี้วันสุดท้าย!'
  if (days === 1) return 'เหลืออีก 1 วัน'
  return `เหลืออีก ${days} วัน`
})

const urgencyColor = computed(() => {
  const days = props.trialStatus.daysRemaining
  if (days <= 1) return 'text-red-600'
  if (days <= 3) return 'text-orange-600'
  return 'text-green-600'
})
</script>

<template>
  <div v-if="trialStatus.isActive" class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-orange-200">
    <div class="flex items-start gap-3">
      <div class="p-2 bg-white rounded-xl shadow-sm">
        <Clock :size="24" class="text-primary" />
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-dark mb-1">ช่วงทดลองใช้ฟรี 7 วัน</h4>
        <p class="text-sm text-gray-700 mb-2">
          คุณกำลังได้รับ <strong class="text-primary">{{ benefit }}</strong> สำหรับทุกการจอง
        </p>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold" :class="urgencyColor">
            {{ daysText }}
          </span>
          <span class="text-xs text-gray-500">
            (หมดเขต: {{ new Date(trialStatus.endsAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long' }) }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
