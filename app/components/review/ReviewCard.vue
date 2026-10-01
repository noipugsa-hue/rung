<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { Review } from '~/types/review'

const props = defineProps<{
  review: Review
}>()

// Format date to Thai locale
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get relative time (e.g., "2 days ago")
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'วันนี้'
  } else if (diffInDays === 1) {
    return 'เมื่อวาน'
  } else if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} สัปดาห์ที่แล้ว`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} เดือนที่แล้ว`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `${years} ปีที่แล้ว`
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl p-5 border border-gray-200 hover:border-primary/30 transition-colors">
    <!-- Header -->
    <div class="flex items-start gap-3 mb-3">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <img
          v-if="review.reviewerAvatar"
          :src="review.reviewerAvatar"
          :alt="review.reviewerName"
          class="w-12 h-12 rounded-full object-cover"
        />
        <div
          v-else
          class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <span class="text-lg font-semibold text-dark">
            {{ review.reviewerName.charAt(0).toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h4 class="font-semibold text-dark truncate">
            {{ review.reviewerName }}
          </h4>
          <span class="text-xs text-gray-500 whitespace-nowrap">
            {{ getRelativeTime(review.createdAt) }}
          </span>
        </div>

        <!-- Rating -->
        <div class="flex items-center gap-1 mt-1">
          <Star
            v-for="star in 5"
            :key="star"
            :size="16"
            :class="[
              star <= review.rating
                ? 'fill-primary text-primary'
                : 'fill-none text-gray-300'
            ]"
          />
          <span class="ml-1 text-sm font-medium text-dark">
            {{ review.rating }}.0
          </span>
        </div>
      </div>
    </div>

    <!-- Activity Badge -->
    <div class="mb-3">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-soft-green text-dark">
        {{ review.activity }}
      </span>
    </div>

    <!-- Comment -->
    <p class="text-gray-700 text-sm leading-relaxed">
      {{ review.comment }}
    </p>

    <!-- Full Date (on hover) -->
    <div class="mt-3 pt-3 border-t border-gray-100">
      <p class="text-xs text-gray-400">
        {{ formatDate(review.createdAt) }}
      </p>
    </div>
  </div>
</template>
