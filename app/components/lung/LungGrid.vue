<script setup lang="ts">
import type { Lung } from '~/types'

defineProps<{
  lungs: Lung[]
  loading?: boolean
}>()
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="i in 8"
        :key="i"
        class="card animate-pulse"
      >
        <div class="aspect-[4/3] bg-gray-200" />
        <div class="p-4 space-y-3">
          <div class="h-6 bg-gray-200 rounded w-3/4" />
          <div class="h-4 bg-gray-200 rounded w-1/2" />
          <div class="h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>

    <!-- Lungs grid -->
    <div
      v-else-if="lungs.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <LungCard v-for="lung in lungs" :key="lung.id" :lung="lung" />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-2xl font-bold text-dark mb-2">ไม่พบผลลัพธ์</h3>
      <p class="text-gray-600">ลองปรับเปลี่ยนการค้นหาของคุณดู</p>
    </div>
  </div>
</template>
