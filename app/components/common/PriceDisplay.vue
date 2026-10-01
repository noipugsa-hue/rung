<script setup lang="ts">
defineProps<{
  price: number
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div class="inline-flex items-baseline gap-1">
    <span
      class="font-bold text-dark"
      :class="{
        'text-base': size === 'sm' || !size,
        'text-xl': size === 'md',
        'text-2xl': size === 'lg',
      }"
    >
      ฿{{ price.toLocaleString() }}
    </span>
    <span
      class="text-gray-600"
      :class="{
        'text-xs': size === 'sm' || !size,
        'text-sm': size === 'md',
        'text-base': size === 'lg',
      }"
    >
      / ชั่วโมง
    </span>
  </div>
</template>
