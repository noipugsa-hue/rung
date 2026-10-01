<script setup lang="ts">
import { Share2, MessageCircle, Mail } from 'lucide-vue-next'
import { generateReferralLink } from '~/utils/referral'

const props = defineProps<{
  code: string
}>()

const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lung.app'
const referralLink = computed(() => generateReferralLink(props.code, baseUrl))

const shareMessage = computed(() =>
  `มาเป็นเพื่อนกันใน LUNG (ใครสักคนไปด้วย) กัน! 🎉\n` +
  `ใช้รหัสของฉัน "${props.code}" รับส่วนลด ฿100 เลย!\n\n` +
  `${referralLink.value}`
)

function shareViaLine() {
  const url = `https://line.me/R/msg/text/?${encodeURIComponent(shareMessage.value)}`
  window.open(url, '_blank')
}

function shareViaFacebook() {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink.value)}`
  window.open(url, '_blank', 'width=600,height=400')
}

function shareViaEmail() {
  const subject = 'มาเป็นเพื่อนกันใน LUNG กัน! 🎉'
  const body = shareMessage.value
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = url
}

async function shareViaWebShare() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'LUNG - ใครสักคนไปด้วย',
        text: shareMessage.value,
        url: referralLink.value
      })
    } catch (err) {
      console.error('Share failed:', err)
    }
  }
}

const canUseWebShare = computed(() => {
  return typeof navigator !== 'undefined' && navigator.share
})
</script>

<template>
  <div class="space-y-4">
    <h4 class="font-semibold text-dark">แชร์ให้เพื่อน</h4>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <!-- LINE -->
      <button
        type="button"
        @click="shareViaLine"
        class="flex flex-col items-center gap-2 p-4 bg-[#06C755] hover:bg-[#05b84d] text-white rounded-2xl transition-colors"
      >
        <MessageCircle :size="24" />
        <span class="text-sm font-medium">LINE</span>
      </button>

      <!-- Facebook -->
      <button
        type="button"
        @click="shareViaFacebook"
        class="flex flex-col items-center gap-2 p-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl transition-colors"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span class="text-sm font-medium">Facebook</span>
      </button>

      <!-- Email -->
      <button
        type="button"
        @click="shareViaEmail"
        class="flex flex-col items-center gap-2 p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl transition-colors"
      >
        <Mail :size="24" />
        <span class="text-sm font-medium">Email</span>
      </button>

      <!-- Native Share (Mobile) -->
      <button
        v-if="canUseWebShare"
        type="button"
        @click="shareViaWebShare"
        class="flex flex-col items-center gap-2 p-4 bg-primary hover:bg-primary/90 text-dark rounded-2xl transition-colors"
      >
        <Share2 :size="24" />
        <span class="text-sm font-medium">แชร์</span>
      </button>
    </div>

    <!-- Share text box -->
    <div class="bg-cream rounded-xl p-4">
      <p class="text-xs text-gray-600 mb-2">ข้อความแนะนำ:</p>
      <p class="text-sm text-gray-700 whitespace-pre-line">{{ shareMessage }}</p>
    </div>
  </div>
</template>
