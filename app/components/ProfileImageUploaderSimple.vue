<script setup lang="ts">
import { X, Plus, Star } from 'lucide-vue-next'
import type { ProfileImage } from '~/types/application'

const props = defineProps<{
  images: ProfileImage[]
  applicationId: string
  maxImages?: number
}>()

const emit = defineEmits<{
  'update:images': [images: ProfileImage[]]
  'upload': [image: ProfileImage]
  'delete': [storagePath: string]
  'set-primary': [url: string]
}>()

const maxImages = props.maxImages || 10
const imageUrl = ref('')
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const isProcessing = ref(false)

const canUploadMore = computed(() => props.images.length < maxImages)
const imageCount = computed(() => `${props.images.length} / ${maxImages} รูป`)

function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

async function addImageFromUrl() {
  errorMessage.value = ''

  if (!imageUrl.value.trim()) {
    errorMessage.value = 'กรุณาใส่ URL รูปภาพ'
    return
  }

  if (!validateUrl(imageUrl.value)) {
    errorMessage.value = 'URL ไม่ถูกต้อง กรุณาใส่ URL ที่เริ่มต้นด้วย http:// หรือ https://'
    return
  }

  if (!canUploadMore.value) {
    errorMessage.value = `คุณเพิ่มรูปครบ ${maxImages} รูปแล้ว`
    return
  }

  // Create ProfileImage object
  const profileImage: ProfileImage = {
    url: imageUrl.value,
    filename: imageUrl.value.split('/').pop() || 'image.jpg',
    storagePath: '', // Not from Firebase Storage
    uploadedAt: new Date().toISOString(),
    isPrimary: props.images.length === 0, // First image is primary
    order: props.images.length,
    size: 0, // Unknown size for external URLs
    dimensions: { width: 0, height: 0 } // Unknown dimensions
  }

  emit('upload', profileImage)
  imageUrl.value = '' // Clear input
}

function removeImage(storagePath: string) {
  emit('delete', storagePath)
}

function setPrimary(url: string) {
  emit('set-primary', url)
}

function openFilePicker() {
  errorMessage.value = ''
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!canUploadMore.value) {
    errorMessage.value = `คุณเพิ่มรูปครบ ${maxImages} รูปแล้ว`
    return
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ JPG, PNG หรือ WebP'
    return
  }

  // Check file size (limit to 500KB for Data URL to avoid Firestore issues)
  const maxSize = 500 * 1024 // 500KB
  if (file.size > maxSize) {
    const sizeMB = (file.size / 1024).toFixed(0)
    errorMessage.value = `ไฟล์มีขนาดใหญ่เกินไป (${sizeMB} KB) กรุณาเลือกไฟล์ขนาดไม่เกิน 500 KB หรือใช้ URL แทน`
    return
  }

  isProcessing.value = true

  try {
    // Convert to Data URL (Base64)
    const dataUrl = await fileToDataUrl(file)

    // Get image dimensions
    const dimensions = await getImageDimensions(dataUrl)

    // Check if Base64 string is too large (Firestore limit ~1MB per document)
    if (dataUrl.length > 900000) { // ~900KB to be safe
      errorMessage.value = 'รูปนี้มีขนาดใหญ่เกินไปสำหรับการบันทึก กรุณาใช้รูปขนาดเล็กลง หรือใช้วิธี "ใส่ URL" แทน'
      isProcessing.value = false
      return
    }

    // Create ProfileImage object
    const profileImage: ProfileImage = {
      url: dataUrl, // Base64 Data URL
      filename: file.name,
      storagePath: '', // Not from Firebase Storage
      uploadedAt: new Date().toISOString(),
      isPrimary: props.images.length === 0,
      order: props.images.length,
      size: file.size,
      dimensions
    }

    emit('upload', profileImage)

    // Reset input
    if (target) {
      target.value = ''
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'ไม่สามารถประมวลผลไฟล์ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isProcessing.value = false
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'))
    reader.readAsDataURL(file)
  })
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = () => reject(new Error('ไม่สามารถอ่านขนาดรูปภาพได้'))
    img.src = dataUrl
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">รูปภาพโปรไฟล์</h3>
        <p class="text-sm text-gray-600 mt-1">
          เพิ่มรูปภาพจาก URL (เช่น จาก Imgur, Google Photos, Dropbox)
        </p>
      </div>
      <div class="text-sm font-medium text-gray-700">
        {{ imageCount }}
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3"
    >
      <div class="flex-1 text-sm">{{ errorMessage }}</div>
      <button
        type="button"
        @click="errorMessage = ''"
        class="text-red-700 hover:text-red-900 transition-colors"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- Add Image Options -->
    <div v-if="canUploadMore" class="space-y-3">
      <!-- Option 1: Choose File from Computer -->
      <div>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          type="button"
          @click="openFilePicker"
          :disabled="isProcessing"
          class="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus :size="20" />
          {{ isProcessing ? 'กำลังประมวลผล...' : 'เลือกไฟล์จากเครื่อง (แนะนำ)' }}
        </button>
        <p class="text-xs text-gray-500 mt-1 text-center">
          รองรับ JPG, PNG, WebP ขนาดไม่เกิน 500KB (ถ้ารูปใหญ่กว่าให้ใช้ URL)
        </p>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <div class="flex-1 border-t border-gray-300"></div>
        <span class="text-sm text-gray-500">หรือ</span>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>

      <!-- Option 2: Add by URL -->
      <div class="flex gap-2">
        <input
          v-model="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          @keyup.enter="addImageFromUrl"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <button
          type="button"
          @click="addImageFromUrl"
          class="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus :size="20" />
          เพิ่มจาก URL
        </button>
      </div>
    </div>

    <!-- Helper Text -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-800">
        <strong>💡 2 วิธีเพิ่มรูป:</strong>
      </p>
      <div class="text-sm text-blue-700 mt-2 space-y-2">
        <div>
          <strong>1. เลือกไฟล์จากเครื่อง (รูปขนาดเล็ก)</strong>
          <p class="text-xs text-blue-600 mt-0.5">กดปุ่มสีส้มด้านบน → เลือกรูปจากเครื่องของคุณ → เสร็จ!</p>
          <p class="text-xs text-blue-600">⚠️ จำกัดขนาด 500KB - ถ้ารูปใหญ่กว่าให้ใช้วิธีที่ 2</p>
        </div>
        <div>
          <strong>2. ใส่ URL รูปภาพ (รูปขนาดใหญ่ - แนะนำ)</strong>
          <p class="text-xs text-blue-600 mt-0.5">
            อัพโหลดรูปไป <a href="https://imgur.com/upload" target="_blank" class="underline font-semibold">Imgur.com</a> →
            คลิกขวาที่รูป → Copy image address → วาง URL ในช่องด้านล่าง
          </p>
          <p class="text-xs text-blue-600">✅ วิธีนี้ไม่จำกัดขนาด และบันทึกได้แน่นอน 100%</p>
        </div>
      </div>
    </div>

    <!-- Image Grid -->
    <div
      v-if="images.length > 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border-2"
        :class="image.isPrimary ? 'border-yellow-400' : 'border-gray-200'"
      >
        <!-- Image -->
        <img
          :src="image.url"
          :alt="`Profile image ${index + 1}`"
          class="w-full h-full object-cover"
        />

        <!-- Primary Badge -->
        <div
          v-if="image.isPrimary"
          class="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
        >
          <Star :size="12" fill="currentColor" />
          รูปหลัก
        </div>

        <!-- Order Badge -->
        <div
          class="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full"
        >
          {{ index + 1 }}
        </div>

        <!-- Overlay Actions -->
        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <button
            v-if="!image.isPrimary"
            type="button"
            @click="setPrimary(image.url)"
            class="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-medium rounded-lg transition-colors"
          >
            ตั้งเป็นรูปหลัก
          </button>
          <button
            type="button"
            @click="removeImage(image.storagePath)"
            class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="images.length === 0"
      class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
    >
      <p class="text-gray-600">ยังไม่มีรูปภาพ กรุณาเพิ่มรูปภาพของคุณ</p>
    </div>
  </div>
</template>
