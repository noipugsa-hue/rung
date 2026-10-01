<script setup lang="ts">
import ReviewStats from '~/components/review/ReviewStats.vue'
import ReviewList from '~/components/review/ReviewList.vue'
import type { ReviewStats as ReviewStatsType } from '~/types/review'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const authStore = useAuthStore()
const reviewStore = useReviewStore()

const stats = ref<ReviewStatsType>({
  averageRating: 0,
  totalCount: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
})
const loading = ref(true)

// Load reviews and stats
onMounted(async () => {
  if (!authStore.user?.id) return

  try {
    loading.value = true

    // Fetch reviews for this lung
    await reviewStore.fetchReviews(authStore.user.id, 'lung')

    // Fetch stats
    stats.value = await reviewStore.getReviewStats(authStore.user.id, 'lung')
  } catch (err: any) {
    console.error('Load reviews error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-custom mx-auto px-4">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">รีวิวของฉัน</h1>
        <p class="text-gray-600">ดูรีวิวจากลูกค้าที่เคยใช้บริการ</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Stats Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-6">
            <ReviewStats :stats="stats" />
          </div>
        </div>

        <!-- Reviews List -->
        <div class="lg:col-span-2">
          <ReviewList :reviews="reviewStore.reviews" />
        </div>
      </div>
    </div>
  </div>
</template>
