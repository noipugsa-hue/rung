<script setup lang="ts">
import { BadgeCheck } from 'lucide-vue-next'

defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-soft-green text-dark font-medium cursor-help relative group"
    :class="{
      'text-xs': size === 'sm' || !size,
      'text-sm': size === 'md',
      'text-base': size === 'lg',
    }"
    title="ได้รับการยืนยันจากแอดมิน - ตรวจสอบเอกสารและข้อมูลแล้ว"
  >
    <BadgeCheck
      :size="size === 'lg' ? 18 : size === 'md' ? 16 : 14"
      class="text-green-600"
    />
    <span>ยืนยันแล้ว</span>

    <!-- Tooltip (shown on hover) -->
    <div
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
    >
      ได้รับการยืนยันจากแอดมิน<br />ตรวจสอบเอกสารและข้อมูลแล้ว
      <!-- Arrow -->
      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <div class="border-4 border-transparent border-t-dark" />
      </div>
    </div>
  </div>
</template>
