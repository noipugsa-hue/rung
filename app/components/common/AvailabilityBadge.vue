<script setup lang="ts">
import { Clock } from 'lucide-vue-next'

defineProps<{
  available: boolean
}>()
</script>

<template>
  <div
    v-if="available"
    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary text-dark"
  >
    <Clock :size="14" />
    <span>วันนี้ว่าง</span>
  </div>
  <div
    v-else
    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600"
  >
    <Clock :size="14" />
    <span>ไม่ว่าง</span>
  </div>
</template>
