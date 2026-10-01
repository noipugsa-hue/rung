<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import type { Achievement } from '~/types/achievement'
import type { UserAchievement } from '~/types/achievement'
import { ACHIEVEMENTS } from '~/types/achievement'

const props = defineProps<{
  userAchievement: UserAchievement
  showProgress?: boolean
}>()

// Get achievement details
const achievement = computed(() => {
  return ACHIEVEMENTS.find(a => a.id === props.userAchievement.achievementId)
})

// Tier colors
const tierColors = {
  bronze: 'from-orange-800 to-orange-600',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-yellow-400',
  platinum: 'from-purple-500 to-purple-400'
}

// Progress percentage
const progressPercent = computed(() => {
  if (props.userAchievement.unlocked) return 100
  return Math.min(
    Math.round((props.userAchievement.progress / props.userAchievement.total) * 100),
    100
  )
})
</script>

<template>
  <div
    v-if="achievement"
    class="relative group"
    :class="[
      'rounded-2xl p-4 transition-all duration-300',
      userAchievement.unlocked
        ? 'bg-gradient-to-br ' + tierColors[achievement.tier] + ' text-white shadow-lg hover:scale-105'
        : 'bg-gray-100 hover:bg-gray-200'
    ]"
  >
    <!-- Lock overlay for locked achievements -->
    <div
      v-if="!userAchievement.unlocked"
      class="absolute inset-0 flex items-center justify-center bg-gray-900/40 rounded-2xl"
    >
      <Lock :size="32" class="text-white/60" />
    </div>

    <!-- Content -->
    <div class="relative">
      <!-- Icon -->
      <div class="text-4xl mb-2 text-center">
        {{ achievement.icon }}
      </div>

      <!-- Name -->
      <h4
        class="text-center font-bold mb-1"
        :class="[
          userAchievement.unlocked ? 'text-white' : 'text-gray-600'
        ]"
      >
        {{ achievement.name }}
      </h4>

      <!-- Description -->
      <p
        class="text-xs text-center"
        :class="[
          userAchievement.unlocked ? 'text-white/80' : 'text-gray-500'
        ]"
      >
        {{ achievement.description }}
      </p>

      <!-- Progress (if not unlocked and showProgress is true) -->
      <div
        v-if="!userAchievement.unlocked && showProgress"
        class="mt-3"
      >
        <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>{{ userAchievement.progress }}/{{ userAchievement.total }}</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary transition-all duration-500"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>

      <!-- Reward Points -->
      <div
        v-if="achievement.rewardPoints && userAchievement.unlocked"
        class="mt-3 text-center"
      >
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
          +{{ achievement.rewardPoints }} แต้ม
        </span>
      </div>

      <!-- Unlocked Date -->
      <p
        v-if="userAchievement.unlocked && userAchievement.unlockedAt"
        class="mt-2 text-xs text-center text-white/60"
      >
        ปลดล็อก: {{ new Date(userAchievement.unlockedAt).toLocaleDateString('th-TH') }}
      </p>
    </div>
  </div>
</template>
