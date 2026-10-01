<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import type { Review } from '~/types/review'
import ReviewCard from './ReviewCard.vue'

const props = defineProps<{
  reviews: Review[]
}>()

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest'

const sortBy = ref<SortOption>('newest')
const showSortMenu = ref(false)

const sortOptions = [
  { value: 'newest' as SortOption, label: 'ล่าสุด' },
  { value: 'oldest' as SortOption, label: 'เก่าที่สุด' },
  { value: 'highest' as SortOption, label: 'คะแนนสูงสุด' },
  { value: 'lowest' as SortOption, label: 'คะแนนต่ำสุด' }
]

const sortedReviews = computed(() => {
  const sorted = [...props.reviews]

  switch (sortBy.value) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating)
    default:
      return sorted
  }
})

function handleSortChange(option: SortOption) {
  sortBy.value = option
  showSortMenu.value = false
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.sort-dropdown')) {
      showSortMenu.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header with Sort -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-dark">
        รีวิวทั้งหมด ({{ reviews.length }})
      </h3>

      <!-- Sort Dropdown -->
      <div class="relative sort-dropdown">
        <button
          type="button"
          @click="showSortMenu = !showSortMenu"
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
        >
          <span>{{ sortOptions.find(opt => opt.value === sortBy)?.label }}</span>
          <ChevronDown :size="16" :class="{ 'rotate-180': showSortMenu }" class="transition-transform" />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showSortMenu"
          class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-10"
        >
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            @click="handleSortChange(option.value)"
            class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
            :class="{ 'bg-primary/10 font-medium': sortBy === option.value }"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="reviews.length === 0"
      class="text-center py-12 bg-cream rounded-3xl"
    >
      <p class="text-gray-500 mb-2">ยังไม่มีรีวิว</p>
      <p class="text-sm text-gray-400">เป็นคนแรกที่ให้รีวิว!</p>
    </div>

    <!-- Review Cards -->
    <div v-else class="space-y-4">
      <ReviewCard
        v-for="review in sortedReviews"
        :key="review.id"
        :review="review"
      />
    </div>
  </div>
</template>
