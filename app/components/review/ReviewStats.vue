<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { ReviewStats } from '~/types/review'

const props = defineProps<{
  stats: ReviewStats
}>()

// Calculate percentage for each rating
function getPercentage(count: number): number {
  if (props.stats.totalCount === 0) return 0
  return Math.round((count / props.stats.totalCount) * 100)
}

// Get width style for progress bar
function getBarWidth(count: number): string {
  return `${getPercentage(count)}%`
}
</script>

<template>
  <div class="bg-white rounded-3xl p-6 border border-gray-200">
    <!-- Overall Rating -->
    <div class="text-center pb-6 border-b border-gray-200">
      <div class="flex items-center justify-center gap-2 mb-2">
        <Star :size="32" class="fill-primary text-primary" />
        <span class="text-5xl font-bold text-dark">
          {{ stats.averageRating.toFixed(1) }}
        </span>
      </div>
      <p class="text-gray-600">
        จาก {{ stats.totalCount }} รีวิว
      </p>
    </div>

    <!-- Rating Distribution -->
    <div class="pt-6 space-y-3">
      <div
        v-for="rating in [5, 4, 3, 2, 1]"
        :key="rating"
        class="flex items-center gap-3"
      >
        <!-- Star Label -->
        <div class="flex items-center gap-1 w-16">
          <Star :size="16" class="fill-primary text-primary" />
          <span class="text-sm font-medium text-dark">{{ rating }}</span>
        </div>

        <!-- Progress Bar -->
        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary transition-all duration-300"
            :style="{ width: getBarWidth(stats.distribution[rating as 1 | 2 | 3 | 4 | 5]) }"
          />
        </div>

        <!-- Count -->
        <div class="w-12 text-right">
          <span class="text-sm text-gray-600">
            {{ stats.distribution[rating as 1 | 2 | 3 | 4 | 5] }}
          </span>
        </div>

        <!-- Percentage -->
        <div class="w-12 text-right">
          <span class="text-xs text-gray-500">
            {{ getPercentage(stats.distribution[rating as 1 | 2 | 3 | 4 | 5]) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="text-2xl font-bold text-dark">
          {{ stats.distribution[5] }}
        </p>
        <p class="text-xs text-gray-500">5 ดาว</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-dark">
          {{ stats.distribution[4] + stats.distribution[5] }}
        </p>
        <p class="text-xs text-gray-500">4+ ดาว</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-dark">
          {{ Math.round((stats.distribution[4] + stats.distribution[5]) / stats.totalCount * 100) || 0 }}%
        </p>
        <p class="text-xs text-gray-500">แนะนำ</p>
      </div>
    </div>
  </div>
</template>
