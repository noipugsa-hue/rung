<script setup lang="ts">
import { Copy, Check, Mail, Share2 } from 'lucide-vue-next'

const props = defineProps<{
  inviteCode: string
  groupBookingId: string
}>()

const copied = ref(false)
const baseUrl = computed(() => {
  if (!process.client) return ''
  return window.location.origin
})

const inviteLink = computed(() => {
  return `${baseUrl.value}/group-booking/${props.inviteCode}`
})

const shareMessage = computed(() => {
  return `มาร่วมจองกรุ๊ปกับเราสิ! 🎉\n\nใช้รหัส: ${props.inviteCode}\nหรือคลิกลิงก์: ${inviteLink.value}`
})

async function copyInviteLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

async function copyInviteCode() {
  try {
    await navigator.clipboard.writeText(props.inviteCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

async function shareViaEmail() {
  const subject = 'คำเชิญเข้าร่วมการจองกรุ๊ป - LUNG'
  const body = encodeURIComponent(shareMessage.value)
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

async function shareViaWeb() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'คำเชิญเข้าร่วมการจองกรุ๊ป',
        text: shareMessage.value,
        url: inviteLink.value
      })
    } catch (err) {
      console.error('Share failed:', err)
    }
  }
}

async function shareViaLINE() {
  const text = encodeURIComponent(shareMessage.value)
  window.open(`https://line.me/R/msg/text/?${text}`, '_blank')
}
</script>

<template>
  <div class="bg-white rounded-3xl p-6 border border-gray-200">
    <h3 class="text-lg font-bold text-dark mb-4">เชิญเพื่อนเข้าร่วม</h3>

    <!-- Invite Code -->
    <div class="mb-4">
      <label class="text-sm text-gray-600 mb-2 block">รหัสเชิญ</label>
      <div class="flex items-center gap-2">
        <div class="flex-1 px-4 py-3 bg-cream rounded-xl">
          <p class="font-mono text-2xl font-bold text-dark text-center tracking-wider">
            {{ inviteCode }}
          </p>
        </div>
        <button
          @click="copyInviteCode"
          class="p-3 rounded-xl border-2 border-gray-200 hover:border-primary transition-colors"
          :class="{ 'bg-green-100 border-green-500': copied }"
        >
          <Check v-if="copied" :size="20" class="text-green-600" />
          <Copy v-else :size="20" />
        </button>
      </div>
    </div>

    <!-- Invite Link -->
    <div class="mb-6">
      <label class="text-sm text-gray-600 mb-2 block">ลิงก์เชิญ</label>
      <div class="flex items-center gap-2">
        <div class="flex-1 px-4 py-2 bg-gray-100 rounded-lg">
          <p class="text-sm text-gray-700 truncate">{{ inviteLink }}</p>
        </div>
        <button
          @click="copyInviteLink"
          class="p-2 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors"
          :class="{ 'bg-green-100 border-green-500': copied }"
        >
          <Check v-if="copied" :size="20" class="text-green-600" />
          <Copy v-else :size="20" />
        </button>
      </div>
    </div>

    <!-- Share Buttons -->
    <div class="space-y-2">
      <p class="text-sm font-semibold text-dark mb-3">แชร์ผ่าน</p>

      <button
        @click="shareViaLINE"
        class="w-full flex items-center gap-3 px-4 py-3 bg-[#00B900] hover:bg-[#00A000] text-white rounded-xl transition-colors"
      >
        <span class="text-xl">💬</span>
        <span class="font-medium">แชร์ใน LINE</span>
      </button>

      <button
        @click="shareViaEmail"
        class="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-dark rounded-xl transition-colors"
      >
        <Mail :size="20" />
        <span class="font-medium">ส่งทางอีเมล</span>
      </button>

      <button
        v-if="navigator.share"
        @click="shareViaWeb"
        class="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-dark rounded-xl transition-colors"
      >
        <Share2 :size="20" />
        <span class="font-medium">แชร์ช่องทางอื่น</span>
      </button>
    </div>

    <!-- Instructions -->
    <div class="mt-6 p-4 bg-blue-50 rounded-2xl">
      <p class="text-sm text-blue-900">
        <strong>วิธีใช้:</strong> เพื่อนของคุณสามารถใช้รหัสหรือลิงก์นี้เพื่อเข้าร่วมการจองกรุ๊ป
        และชำระเงินส่วนของตัวเองได้เลย
      </p>
    </div>
  </div>
</template>
