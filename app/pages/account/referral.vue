<script setup lang="ts">
import ReferralCard from '~/components/referral/ReferralCard.vue'
import ReferralShareButtons from '~/components/referral/ReferralShareButtons.vue'
import ReferralStats from '~/components/referral/ReferralStats.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const referralStore = useReferralStore()

const loading = ref(true)
const myCode = ref<string | null>(null)

onMounted(async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    // Get or create referral code
    myCode.value = await referralStore.getMyReferralCode(
      authStore.user.id,
      authStore.user.name || authStore.user.email
    )

    // Get stats
    await referralStore.getReferralStats(authStore.user.id)

    // Get available rewards
    await referralStore.getMyRewards(authStore.user.id)
  } catch (err) {
    console.error('Load referral error:', err)
  } finally {
    loading.value = false
  }
})

const defaultStats = {
  totalReferrals: 0,
  completedReferrals: 0,
  pendingReferrals: 0,
  totalRewardsEarnedSatang: 0,
  conversionRate: 0
}
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-custom mx-auto px-4 max-w-5xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">แนะนำเพื่อน</h1>
        <p class="text-gray-600">แชร์รหัสแนะนำ รับส่วนลดทั้งคุณและเพื่อน!</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <!-- Content -->
      <div v-else-if="myCode" class="space-y-6">
        <!-- Referral Card -->
        <ReferralCard
          :code="myCode"
          :stats="referralStore.stats || defaultStats"
        />

        <!-- Share Buttons -->
        <div class="bg-white rounded-3xl p-6 border border-gray-200">
          <ReferralShareButtons :code="myCode" />
        </div>

        <!-- Stats -->
        <ReferralStats :stats="referralStore.stats || defaultStats" />

        <!-- Available Rewards -->
        <div
          v-if="referralStore.rewards.length > 0"
          class="bg-white rounded-3xl p-6 border border-gray-200"
        >
          <h3 class="text-lg font-bold text-dark mb-4">🎁 รางวัลของคุณ</h3>
          <div class="space-y-3">
            <div
              v-for="reward in referralStore.rewards"
              :key="reward.id"
              class="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <p class="font-semibold text-dark">ส่วนลด ฿{{ reward.amountSatang / 100 }}</p>
                <p class="text-sm text-gray-600">ใช้ได้กับการจองครั้งถัดไป</p>
                <p class="text-xs text-gray-500 mt-1">
                  หมดอายุ: {{ new Date(reward.expiresAt!).toLocaleDateString('th-TH') }}
                </p>
              </div>
              <div class="text-2xl">🎉</div>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div class="bg-white rounded-3xl p-6 border border-gray-200">
          <h3 class="text-lg font-bold text-dark mb-4">❓ คำถามที่พบบ่อย</h3>
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-dark mb-1">เพื่อนต้องทำยังไงบ้าง?</h4>
              <p class="text-sm text-gray-700">
                เพื่อนต้องสมัครสมาชิกด้วยรหัสของคุณ และทำการจองครั้งแรกให้เสร็จสิ้น
                เมื่อเสร็จแล้วทั้งคุณและเพื่อนจะได้รับส่วนลด ฿100 ทันที
              </p>
            </div>
            <div>
              <h4 class="font-semibold text-dark mb-1">แนะนำได้กี่คน?</h4>
              <p class="text-sm text-gray-700">
                ไม่จำกัด! แนะนำได้มากเท่าที่ต้องการ คุณจะได้รับส่วนลด ฿100 ทุกครั้งที่เพื่อนจองสำเร็จ
              </p>
            </div>
            <div>
              <h4 class="font-semibold text-dark mb-1">ส่วนลดหมดอายุเมื่อไหร่?</h4>
              <p class="text-sm text-gray-700">
                ส่วนลดมีอายุ 90 วัน (3 เดือน) นับจากวันที่ได้รับ ใช้ได้กับการจองครั้งถัดไป
              </p>
            </div>
            <div>
              <h4 class="font-semibold text-dark mb-1">ต้องจองขั้นต่ำเท่าไหร่?</h4>
              <p class="text-sm text-gray-700">
                เพื่อนต้องจองมูลค่าขั้นต่ำ ฿500 ถึงจะได้รับส่วนลด
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-3xl p-8 text-center">
        <p class="text-red-600 mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <button
          type="button"
          @click="$router.go(0)"
          class="px-6 py-3 bg-primary text-dark rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  </div>
</template>
