<script setup lang="ts">
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-vue-next'
import type { ReferralStats } from '~/types/referral'
import { formatBaht } from '~/utils/money'

const props = defineProps<{
  stats: ReferralStats
}>()
</script>

<template>
  <div class="bg-white rounded-3xl p-6 border border-gray-200">
    <h3 class="text-lg font-bold text-dark mb-6">สถิติการแนะนำเพื่อน</h3>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <!-- Total Referrals -->
      <div class="bg-blue-50 rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <Users :size="20" class="text-blue-600" />
          <span class="text-sm text-gray-600">ทั้งหมด</span>
        </div>
        <div class="text-2xl font-bold text-dark">{{ stats.totalReferrals }}</div>
        <div class="text-xs text-gray-500 mt-1">คนที่ใช้รหัส</div>
      </div>

      <!-- Completed -->
      <div class="bg-green-50 rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <CheckCircle :size="20" class="text-green-600" />
          <span class="text-sm text-gray-600">สำเร็จ</span>
        </div>
        <div class="text-2xl font-bold text-green-600">{{ stats.completedReferrals }}</div>
        <div class="text-xs text-gray-500 mt-1">จองครบแล้ว</div>
      </div>

      <!-- Pending -->
      <div class="bg-yellow-50 rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <Clock :size="20" class="text-yellow-600" />
          <span class="text-sm text-gray-600">รอดำเนินการ</span>
        </div>
        <div class="text-2xl font-bold text-yellow-600">{{ stats.pendingReferrals }}</div>
        <div class="text-xs text-gray-500 mt-1">ยังไม่ได้จอง</div>
      </div>

      <!-- Total Rewards -->
      <div class="bg-primary/20 rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <TrendingUp :size="20" class="text-primary" />
          <span class="text-sm text-gray-600">รางวัล</span>
        </div>
        <div class="text-2xl font-bold text-primary">{{ formatBaht(stats.totalRewardsEarnedSatang) }}</div>
        <div class="text-xs text-gray-500 mt-1">ที่ได้รับแล้ว</div>
      </div>
    </div>

    <!-- Conversion Rate -->
    <div class="bg-gradient-to-r from-primary/10 to-soft-green rounded-2xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">อัตราความสำเร็จ</span>
        <span class="text-xl font-bold text-primary">{{ stats.conversionRate }}%</span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
          :style="{ width: `${stats.conversionRate}%` }"
        />
      </div>
      <p class="text-xs text-gray-500 mt-2">
        {{ stats.completedReferrals }} จาก {{ stats.totalReferrals }} คนที่ใช้รหัสของคุณได้จองสำเร็จ
      </p>
    </div>

    <!-- Tips -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-dark mb-3">💡 เคล็ดลับเพิ่มยอด:</h4>
      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          <span>แชร์รหัสบน Social Media ของคุณ</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          <span>บอกเพื่อนๆ ถึงประสบการณ์ที่ดีของคุณ</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          <span>แชร์รูปภาพกิจกรรมที่สนุกๆ</span>
        </li>
      </ul>
    </div>
  </div>
</template>
