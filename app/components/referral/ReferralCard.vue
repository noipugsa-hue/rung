<script setup lang="ts">
import { Copy, Check, Share2, Gift } from 'lucide-vue-next'
import { formatBaht } from '~/utils/money'
import { generateReferralLink } from '~/utils/referral'

const props = defineProps<{
  code: string
  stats: {
    totalReferrals: number
    completedReferrals: number
    totalRewardsEarnedSatang: number
  }
}>()

const copied = ref(false)
const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lung.app'
const referralLink = computed(() => generateReferralLink(props.code, baseUrl))

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}
</script>

<template>
  <div class="bg-gradient-to-br from-primary/20 via-primary/10 to-soft-green rounded-3xl p-8 border-2 border-primary/30">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
        <Gift :size="24" class="text-dark" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-dark">แนะนำเพื่อน รับส่วนลด</h3>
        <p class="text-sm text-gray-600">ทั้งคุณและเพื่อนได้ ฿100 ทันที!</p>
      </div>
    </div>

    <!-- Code Display -->
    <div class="bg-white rounded-2xl p-6 mb-6 border-2 border-dashed border-primary/50">
      <p class="text-xs text-gray-600 mb-2 text-center">รหัสแนะนำของคุณ</p>
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 text-center">
          <p class="text-3xl font-bold text-dark tracking-wider">{{ code }}</p>
        </div>
        <button
          type="button"
          @click="copyCode"
          class="p-3 hover:bg-primary/20 rounded-xl transition-colors"
          :title="copied ? 'คัดลอกแล้ว!' : 'คัดลอกรหัส'"
        >
          <Check v-if="copied" :size="24" class="text-green-600" />
          <Copy v-else :size="24" class="text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Link -->
    <div class="bg-white/80 rounded-xl p-4 mb-6">
      <p class="text-xs text-gray-600 mb-2">ลิงก์แนะนำของคุณ</p>
      <div class="flex items-center gap-2">
        <input
          type="text"
          :value="referralLink"
          readonly
          class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
        />
        <button
          type="button"
          @click="copyLink"
          class="px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Copy :size="16" />
          <span class="hidden sm:inline">คัดลอก</span>
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-dark">{{ stats.totalReferrals }}</div>
        <div class="text-xs text-gray-600 mt-1">คนที่ใช้รหัส</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.completedReferrals }}</div>
        <div class="text-xs text-gray-600 mt-1">จองสำเร็จ</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-primary">{{ formatBaht(stats.totalRewardsEarnedSatang) }}</div>
        <div class="text-xs text-gray-600 mt-1">รางวัลที่ได้</div>
      </div>
    </div>

    <!-- How it works -->
    <div class="mt-6 pt-6 border-t border-gray-300">
      <p class="text-sm font-semibold text-dark mb-3">วิธีการแนะนำเพื่อน:</p>
      <ol class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <span class="text-primary font-bold">1.</span>
          <span>แชร์รหัสหรือลิงก์ของคุณให้เพื่อน</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary font-bold">2.</span>
          <span>เพื่อนสมัครสมาชิกด้วยรหัสของคุณ</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary font-bold">3.</span>
          <span>เพื่อนจองครั้งแรกเสร็จสิ้น → ทั้งคู่ได้ส่วนลด ฿100!</span>
        </li>
      </ol>
    </div>
  </div>
</template>
