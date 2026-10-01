<script setup lang="ts">
import { TrendingUp, Award, Target } from 'lucide-vue-next'
import type { UserPoints } from '~/types/achievement'

const props = defineProps<{
  userPoints: UserPoints | null
  unlockedCount: number
  totalCount: number
}>()

const tierColors = {
  Bronze: 'from-orange-800 to-orange-600',
  Silver: 'from-gray-400 to-gray-300',
  Gold: 'from-yellow-500 to-yellow-400',
  Platinum: 'from-purple-500 to-purple-400'
}

const nextTierPoints = computed(() => {
  if (!props.userPoints) return 500

  const tierThresholds = {
    Bronze: 500,
    Silver: 2000,
    Gold: 5000,
    Platinum: Infinity
  }

  return tierThresholds[props.userPoints.tier]
})

const pointsToNextTier = computed(() => {
  if (!props.userPoints) return 500
  if (props.userPoints.tier === 'Platinum') return 0
  return nextTierPoints.value - props.userPoints.totalPoints
})
</script>

<template>
  <div class="bg-white rounded-3xl p-6 border border-gray-200">
    <!-- User Tier -->
    <div
      v-if="userPoints"
      class="mb-6 p-6 rounded-2xl bg-gradient-to-br text-white"
      :class="tierColors[userPoints.tier]"
    >
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-white/80 text-sm mb-1">ระดับของคุณ</p>
          <h3 class="text-3xl font-bold">{{ userPoints.tier }}</h3>
        </div>
        <Award :size="48" class="text-white/30" />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span>{{ userPoints.totalPoints }} แต้ม</span>
          <span v-if="userPoints.tier !== 'Platinum'">
            {{ nextTierPoints }} แต้ม
          </span>
        </div>
        <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-white transition-all duration-500"
            :style="{ width: `${userPoints.tierProgress}%` }"
          />
        </div>
        <p v-if="userPoints.tier !== 'Platinum'" class="text-xs text-white/80">
          อีก {{ pointsToNextTier }} แต้มถึงระดับถัดไป
        </p>
        <p v-else class="text-xs text-white/80">
          🎉 คุณอยู่ระดับสูงสุดแล้ว!
        </p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <!-- Total Points -->
      <div class="text-center p-4 bg-primary/10 rounded-2xl">
        <TrendingUp :size="24" class="mx-auto text-primary mb-2" />
        <div class="text-2xl font-bold text-dark">
          {{ userPoints?.totalPoints || 0 }}
        </div>
        <div class="text-xs text-gray-600 mt-1">แต้มทั้งหมด</div>
      </div>

      <!-- Unlocked Achievements -->
      <div class="text-center p-4 bg-green-50 rounded-2xl">
        <Award :size="24" class="mx-auto text-green-600 mb-2" />
        <div class="text-2xl font-bold text-dark">{{ unlockedCount }}</div>
        <div class="text-xs text-gray-600 mt-1">ปลดล็อกแล้ว</div>
      </div>

      <!-- Total Achievements -->
      <div class="text-center p-4 bg-blue-50 rounded-2xl">
        <Target :size="24" class="mx-auto text-blue-600 mb-2" />
        <div class="text-2xl font-bold text-dark">{{ totalCount }}</div>
        <div class="text-xs text-gray-600 mt-1">ความสำเร็จทั้งหมด</div>
      </div>
    </div>

    <!-- Tier Benefits -->
    <div class="bg-cream rounded-2xl p-4">
      <h4 class="font-semibold text-dark mb-3 flex items-center gap-2">
        <Award :size="18} />
        สิทธิพิเศษของระดับคุณ
      </h4>
      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <span class="text-primary">✓</span>
          <span>ส่วนลดพิเศษจากการจอง</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">✓</span>
          <span>แต้มสะสมเพิ่มขึ้น {{ userPoints?.tier === 'Platinum' ? '200%' : userPoints?.tier === 'Gold' ? '150%' : userPoints?.tier === 'Silver' ? '120%' : '100%' }}</span>
        </li>
        <li v-if="userPoints?.tier === 'Gold' || userPoints?.tier === 'Platinum'" class="flex items-start gap-2">
          <span class="text-primary">✓</span>
          <span>Priority Support</span>
        </li>
        <li v-if="userPoints?.tier === 'Platinum'" class="flex items-start gap-2">
          <span class="text-primary">✓</span>
          <span>เข้าถึง Lung พิเศษก่อนใคร</span>
        </li>
      </ul>
    </div>
  </div>
</template>
