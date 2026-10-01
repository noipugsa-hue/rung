<script setup lang="ts">
import AchievementBadge from './AchievementBadge.vue'
import type { UserAchievement } from '~/types/achievement'
import { ACHIEVEMENTS } from '~/types/achievement'

const props = defineProps<{
  userAchievements: UserAchievement[]
  filter?: 'all' | 'unlocked' | 'locked'
}>()

// Group achievements by category
const groupedAchievements = computed(() => {
  const filtered = props.userAchievements.filter(ua => {
    if (props.filter === 'unlocked') return ua.unlocked
    if (props.filter === 'locked') return !ua.unlocked
    return true
  })

  const groups: Record<string, UserAchievement[]> = {
    milestone: [],
    booking: [],
    social: [],
    review: [],
    special: []
  }

  filtered.forEach(ua => {
    const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId)
    if (achievement) {
      groups[achievement.category].push(ua)
    }
  })

  return groups
})

const categoryLabels: Record<string, string> = {
  milestone: '🎯 ความสำเร็จพิเศษ',
  booking: '📅 การจอง',
  social: '👥 สังคม',
  review: '✍️ รีวิว',
  special: '⭐ พิเศษ'
}
</script>

<template>
  <div class="space-y-8">
    <div
      v-for="(achievements, category) in groupedAchievements"
      :key="category"
    >
      <div v-if="achievements.length > 0">
        <h3 class="text-lg font-bold text-dark mb-4">
          {{ categoryLabels[category] }}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AchievementBadge
            v-for="userAchievement in achievements"
            :key="userAchievement.achievementId"
            :user-achievement="userAchievement"
            :show-progress="true"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="userAchievements.length === 0"
      class="text-center py-12 bg-cream rounded-3xl"
    >
      <p class="text-gray-500 mb-2">ยังไม่มีความสำเร็จ</p>
      <p class="text-sm text-gray-400">เริ่มจองเพื่อปลดล็อกความสำเร็จแรก!</p>
    </div>
  </div>
</template>
