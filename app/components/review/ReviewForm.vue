<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { Booking } from '~/types'

const props = defineProps<{
  booking: Booking
  reviewerType: 'user' | 'lung'
}>()

const emit = defineEmits<{
  submit: [rating: number, comment: string]
  cancel: []
}>()

const rating = ref(0)
const comment = ref('')
const hoveredRating = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const isValid = computed(() => {
  return rating.value > 0 && comment.value.trim().length >= 10
})

function handleStarClick(star: number) {
  rating.value = star
}

function handleStarHover(star: number) {
  hoveredRating.value = star
}

function handleMouseLeave() {
  hoveredRating.value = 0
}

async function handleSubmit() {
  if (!isValid.value) {
    error.value = 'กรุณาให้คะแนนและเขียนรีวิวอย่างน้อย 10 ตัวอักษร'
    return
  }

  loading.value = true
  error.value = null

  try {
    emit('submit', rating.value, comment.value.trim())
  } catch (err: any) {
    error.value = err.message || 'เกิดข้อผิดพลาดในการส่งรีวิว'
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="bg-white rounded-3xl p-6 space-y-6">
    <!-- Booking Info -->
    <div class="pb-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-dark mb-2">รีวิวการจอง</h3>
      <div class="space-y-1 text-sm text-gray-600">
        <p><span class="font-medium">กิจกรรม:</span> {{ booking.activity }}</p>
        <p><span class="font-medium">วันที่:</span> {{ new Date(booking.date).toLocaleDateString('th-TH') }}</p>
        <p><span class="font-medium">สถานที่:</span> {{ booking.location }}</p>
      </div>
    </div>

    <!-- Star Rating -->
    <div>
      <label class="block text-sm font-medium text-dark mb-3">
        ให้คะแนน <span class="text-red-500">*</span>
      </label>
      <div class="flex items-center gap-2">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          @click="handleStarClick(star)"
          @mouseenter="handleStarHover(star)"
          @mouseleave="handleMouseLeave"
          class="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            :size="40"
            :class="[
              star <= (hoveredRating || rating)
                ? 'fill-primary text-primary'
                : 'fill-none text-gray-300'
            ]"
          />
        </button>
        <span v-if="rating > 0" class="ml-2 text-lg font-semibold text-dark">
          {{ rating }}/5
        </span>
      </div>
    </div>

    <!-- Comment -->
    <div>
      <label for="comment" class="block text-sm font-medium text-dark mb-2">
        รีวิว <span class="text-red-500">*</span>
        <span class="text-gray-500 font-normal">(อย่างน้อย 10 ตัวอักษร)</span>
      </label>
      <textarea
        id="comment"
        v-model="comment"
        rows="5"
        class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        placeholder="เขียนรีวิวของคุณที่นี่..."
      />
      <p class="mt-1 text-xs text-gray-500 text-right">
        {{ comment.length }} ตัวอักษร
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
      {{ error }}
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="handleCancel"
        class="flex-1 px-6 py-3 border border-gray-300 rounded-full text-dark font-medium hover:bg-gray-50 transition-colors"
        :disabled="loading"
      >
        ยกเลิก
      </button>
      <button
        type="button"
        @click="handleSubmit"
        class="flex-1 px-6 py-3 bg-primary text-dark rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!isValid || loading"
      >
        {{ loading ? 'กำลังส่ง...' : 'ส่งรีวิว' }}
      </button>
    </div>
  </div>
</template>
