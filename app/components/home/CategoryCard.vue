<script setup lang="ts">
import type { Category } from '~/types'

defineProps<{
  category: Category
}>()
</script>

<template>
  <NuxtLink
    :to="`/search?category=${category.id}`"
    class="bg-white rounded-lung-lg p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer group border-2 border-gray-100 hover:border-primary hover:shadow-lung-lg transition-all duration-300 min-h-30 sm:min-h-35"
  >
    <div class="text-4xl sm:text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
      {{ category.emoji }}
    </div>
    <div class="text-sm sm:text-base font-semibold text-dark text-center group-hover:text-primary transition-colors">
      {{ category.name }}
    </div>
  </NuxtLink>
</template>
