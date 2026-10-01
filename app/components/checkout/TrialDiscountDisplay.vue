<script setup lang="ts">
import { Tag } from 'lucide-vue-next'
import type { Satang } from '~/types/money'
import { formatBaht } from '~/utils/money'

const props = defineProps<{
  discountSatang: Satang
  originalTotalSatang: Satang
  finalTotalSatang: Satang
}>()
</script>

<template>
  <div class="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
    <div class="flex items-start gap-3">
      <div class="p-2 bg-green-100 rounded-xl">
        <Tag :size="20" class="text-green-600" />
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-green-900 mb-1 flex items-center gap-2">
          🎉 ส่วนลดช่วงทดลองใช้ฟรี 50%
        </h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">ราคาเต็ม:</span>
            <span class="text-gray-600 line-through">{{ formatBaht(originalTotalSatang) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-green-700 font-semibold">ส่วนลด 50%:</span>
            <span class="text-green-700 font-semibold">-{{ formatBaht(discountSatang) }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-green-200">
            <span class="text-dark font-bold">ราคาที่ต้องชำระ:</span>
            <span class="text-dark font-bold text-lg">{{ formatBaht(finalTotalSatang) }}</span>
          </div>
        </div>
        <p class="mt-2 text-xs text-green-700">
          💡 คุณประหยัดได้ <strong>{{ formatBaht(discountSatang) }}</strong> จากโปรโมชั่นทดลองใช้ฟรี!
        </p>
      </div>
    </div>
  </div>
</template>
