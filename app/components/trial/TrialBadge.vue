<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  type: 'user' | 'lung'
  size?: 'sm' | 'md' | 'lg'
}>()

const config = computed(() => {
  if (props.type === 'user') {
    return {
      text: 'ทดลองใช้ฟรี - ลด 50%',
      icon: '🎉',
      gradient: 'from-green-500 to-emerald-600'
    }
  } else {
    return {
      text: 'ไม่มีค่าคอมมิชชั่น',
      icon: '🎁',
      gradient: 'from-blue-500 to-purple-600'
    }
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs px-2 py-1'
    case 'lg':
      return 'text-base px-4 py-2'
    default:
      return 'text-sm px-3 py-1.5'
  }
})
</script>

<template>
  <div
    class="inline-flex items-center gap-1.5 rounded-full text-white font-bold shadow-lg animate-pulse"
    :class="[
      `bg-gradient-to-r ${config.gradient}`,
      sizeClasses
    ]"
  >
    <Sparkles :size="size === 'sm' ? 12 : size === 'lg' ? 20 : 16" class="animate-spin" style="animation-duration: 3s;" />
    <span>{{ config.text }}</span>
  </div>
</template>
