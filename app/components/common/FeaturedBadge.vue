<script setup lang="ts">
import { Star } from 'lucide-vue-next'

defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-dark rounded-full font-bold shadow-lg"
    :class="sizeClasses[size || 'md']"
  >
    <Star :size="iconSizes[size || 'md']" class="fill-current" />
    <span>แนะนำ</span>
  </span>
</template>
