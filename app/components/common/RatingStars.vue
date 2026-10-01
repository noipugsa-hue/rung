<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const props = defineProps<{
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md' | 'lg'
}>()

const iconSize = computed(() => {
  switch (props.size) {
    case 'lg':
      return 20
    case 'md':
      return 18
    default:
      return 16
  }
})
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <Star :size="iconSize" class="fill-primary text-primary" />
    <span
      class="font-semibold"
      :class="{
        'text-sm': size === 'sm' || !size,
        'text-base': size === 'md',
        'text-lg': size === 'lg',
      }"
    >
      {{ rating.toFixed(1) }}
    </span>
    <span
      v-if="reviewCount"
      class="text-gray-600"
      :class="{
        'text-xs': size === 'sm' || !size,
        'text-sm': size === 'md',
        'text-base': size === 'lg',
      }"
    >
      ({{ reviewCount }})
    </span>
  </div>
</template>
