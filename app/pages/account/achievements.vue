<script setup lang="ts">
import AchievementProgress from '~/components/achievement/AchievementProgress.vue'
import AchievementList from '~/components/achievement/AchievementList.vue'
import { ACHIEVEMENTS } from '~/types/achievement'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const achievementStore = useAchievementStore()

const filter = ref<'all' | 'unlocked' | 'locked'>('all')
const loading = ref(true)

onMounted(async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    // Initialize if first time
    await achievementStore.initializeUserAchievements(authStore.user.id)

    // Load achievements and points
    await Promise.all([
      achievementStore.getUserAchievements(authStore.user.id),
      achievementStore.getUserPoints(authStore.user.id)
    ])

    // Check for new unlocks
    const unlocked = await achievementStore.checkAchievements(authStore.user.id)

    // Show notification for new unlocks
    if (unlocked.length > 0) {
      const { showSuccess } = useNotificationToast()
      unlocked.forEach(achievement => {
        showSuccess(
          '🎉 ปลดล็อกความสำเร็จใหม่!',
          `${achievement.name} - ${achievement.description}`
        )
      })
    }
  } catch (err) {
    console.error('Load achievements error:', err)
  } finally {
    loading.value = false
  }
})

const unlockedCount = computed(() => {
  return achievementStore.unlockedAchievements.length
})

const totalCount = computed(() => {
  return ACHIEVEMENTS.length
})
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-custom mx-auto px-4 max-w-6xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">ความสำเร็จ</h1>
        <p class="text-gray-600">ปลดล็อกความสำเร็จและรับแต้มสะสม!</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Progress Card -->
        <AchievementProgress
          :user-points="achievementStore.userPoints"
          :unlocked-count="unlockedCount"
          :total-count="totalCount"
        />

        <!-- Filter Tabs -->
        <div class="bg-white rounded-2xl p-2 inline-flex gap-2">
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
            ทั้งหมด ({{ totalCount }})
          </button>
          <button
            type="button"
            @click="filter = 'unlocked'"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            :class="[
              filter === 'unlocked'
                ? 'bg-primary text-dark'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            ปลดล็อกแล้ว ({{ unlockedCount }})
          </button>
          <button
            type="button"
            @click="filter = 'locked'"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            :class="[
              filter === 'locked'
                ? 'bg-primary text-dark'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            ยังไม่ปลดล็อก ({{ totalCount - unlockedCount }})
          </button>
        </div>

        <!-- Achievement List -->
        <AchievementList
          :user-achievements="achievementStore.userAchievements"
          :filter="filter"
        />

        <!-- How to Earn Points -->
        <div class="bg-white rounded-3xl p-6 border border-gray-200">
          <h3 class="text-lg font-bold text-dark mb-4">💡 วิธีรับแต้ม</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">📅</span>
              </div>
              <div>
                <h4 class="font-semibold text-dark">จองกิจกรรม</h4>
                <p class="text-sm text-gray-600">ทุกครั้งที่จองจะได้ปลดล็อกความสำเร็จใหม่</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">✍️</span>
              </div>
              <div>
                <h4 class="font-semibold text-dark">เขียนรีวิว</h4>
                <p class="text-sm text-gray-600">รีวิวหลังจองเสร็จเพื่อรับแต้มเพิ่ม</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">🤝</span>
              </div>
              <div>
                <h4 class="font-semibold text-dark">แนะนำเพื่อน</h4>
                <p class="text-sm text-gray-600">แนะนำเพื่อนสมัครใช้งานและจอง</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">🎯</span>
              </div>
              <div>
                <h4 class="font-semibold text-dark">ทำภารกิจพิเศษ</h4>
                <p class="text-sm text-gray-600">ปลดล็อกความสำเร็จหายากรับแต้มมหาศาล</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
