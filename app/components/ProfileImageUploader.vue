<script setup lang="ts">
import { Upload, X, Star, Loader2, Image as ImageIcon } from 'lucide-vue-next'
import type { ProfileImage } from '~/types/application'
import { useImageUpload } from '~/composables/useImageUpload'

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
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploadError = ref<string>('')
const uploadingFiles = ref<string[]>([])

const { uploadToFirebase, deleteFromFirebase, validateImage, uploadProgress, isUploading } = useImageUpload()

const canUploadMore = computed(() => props.images.length < maxImages)
const imageCount = computed(() => `${props.images.length} / ${maxImages} รูป`)

function openFileDialog() {
  uploadError.value = ''
  fileInput.value?.click()
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  await processFiles(files)
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  await processFiles(files)

  // Reset input
  if (target) {
    target.value = ''
  }
}

async function processFiles(files: File[]) {
  uploadError.value = ''

  // Check if we can upload more
  const availableSlots = maxImages - props.images.length
  if (availableSlots <= 0) {
    uploadError.value = `คุณอัปโหลดรูปครบ ${maxImages} รูปแล้ว กรุณาลบรูปเก่าก่อนอัปโหลดใหม่`
    return
  }

  // Limit files to available slots
  const filesToUpload = files.slice(0, availableSlots)

  if (files.length > availableSlots) {
    uploadError.value = `สามารถอัปโหลดได้อีกเพียง ${availableSlots} รูปเท่านั้น`
  }

  // Validate and upload each file
  for (const file of filesToUpload) {
    // Validate first
    const validation = await validateImage(file)
    if (!validation.valid) {
      uploadError.value = validation.error || 'ไฟล์ไม่ถูกต้อง'
      continue
    }

    // Start uploading
    const fileId = `${file.name}_${Date.now()}`
    uploadingFiles.value.push(fileId)

    try {
      const order = props.images.length
      const isPrimary = props.images.length === 0 // First image is primary by default

      const result = await uploadToFirebase(file, props.applicationId, order, isPrimary)

      if (result.success && result.image) {
        emit('upload', result.image)
      } else {
        uploadError.value = result.error || 'เกิดข้อผิดพลาดในการอัปโหลด'
      }
    } catch (error) {
      uploadError.value = 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
    } finally {
      uploadingFiles.value = uploadingFiles.value.filter(id => id !== fileId)
    }
  }
}

async function handleDelete(image: ProfileImage) {
  const confirmed = confirm(`คุณต้องการลบรูป "${image.filename}" ใช่หรือไม่?`)
  if (!confirmed) return

  try {
    const result = await deleteFromFirebase(image.storagePath)

    if (result.success) {
      emit('delete', image.storagePath)

      // If deleted image was primary, set first remaining image as primary
      if (image.isPrimary && props.images.length > 1) {
        const remainingImages = props.images.filter(img => img.storagePath !== image.storagePath)
        if (remainingImages.length > 0) {
          emit('set-primary', remainingImages[0].url)
        }
      }
    } else {
      uploadError.value = result.error || 'ไม่สามารถลบรูปได้'
    }
  } catch (error) {
    uploadError.value = 'เกิดข้อผิดพลาดในการลบรูป'
  }
}

function handleSetPrimary(image: ProfileImage) {
  emit('set-primary', image.url)
}

function clearError() {
  uploadError.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">รูปภาพโปรไฟล์</h3>
        <p class="text-sm text-gray-600 mt-1">
          อัปโหลดรูปภาพของคุณ 1-{{ maxImages }} รูป (JPG, PNG, WebP ขนาดไม่เกิน 10MB, ความละเอียดอย่างน้อย 800x800px)
        </p>
      </div>
      <div class="text-sm font-medium text-gray-700">
        {{ imageCount }}
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="uploadError"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3"
    >
      <div class="flex-1 text-sm">{{ uploadError }}</div>
      <button
        type="button"
        @click="clearError"
        class="text-red-700 hover:text-red-900 transition-colors"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- Upload Area -->
    <div
      v-if="canUploadMore"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click="openFileDialog"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
        isDragging
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center gap-3">
        <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center',
            isDragging ? 'bg-orange-100' : 'bg-gray-100'
          ]"
        >
          <Upload :size="24" :class="isDragging ? 'text-orange-600' : 'text-gray-600'" />
        </div>

        <div>
          <p class="text-base font-medium text-gray-900">
            คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวางที่นี่
          </p>
          <p class="text-sm text-gray-600 mt-1">
            รองรับ JPG, PNG, WebP (ขนาดไม่เกิน 10MB)
          </p>
        </div>
      </div>
    </div>

    <!-- Uploading Progress -->
    <div v-if="isUploading || uploadingFiles.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <Loader2 :size="20" class="text-blue-600 animate-spin" />
        <div class="flex-1">
          <p class="text-sm font-medium text-blue-900">กำลังอัปโหลด...</p>
          <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Image Grid -->
    <div
      v-if="images.length > 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="image in images"
        :key="image.url"
        class="relative group aspect-square rounded-lg overflow-hidden border-2 transition-all"
        :class="image.isPrimary ? 'border-orange-500 shadow-md' : 'border-gray-200'"
      >
        <!-- Image -->
        <img
          :src="image.url"
          :alt="image.filename"
          class="w-full h-full object-cover"
        />

        <!-- Primary Badge -->
        <div
          v-if="image.isPrimary"
          class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg"
        >
          <Star :size="14" class="fill-current" />
          <span>รูปหลัก</span>
        </div>

        <!-- Overlay with actions -->
        <div
          class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
        >
          <!-- Set Primary Button -->
          <button
            v-if="!image.isPrimary"
            type="button"
            @click.stop="handleSetPrimary(image)"
            class="bg-white text-gray-900 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
            title="ตั้งเป็นรูปหลัก"
          >
            <Star :size="18" />
          </button>

          <!-- Delete Button -->
          <button
            type="button"
            @click.stop="handleDelete(image)"
            class="bg-white text-gray-900 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-lg"
            title="ลบรูปภาพ"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Image Info -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p class="text-white text-xs truncate">{{ image.filename }}</p>
          <p class="text-white text-xs">{{ (image.size / 1024 / 1024).toFixed(2) }} MB</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="images.length === 0 && !isUploading && uploadingFiles.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <ImageIcon :size="48" class="mx-auto mb-3 opacity-30" />
      <p class="text-sm">ยังไม่มีรูปภาพ กรุณาอัปโหลดรูปภาพของคุณ</p>
    </div>

    <!-- Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-900">
        <strong>หน้าที่ของรูปหลัก:</strong> รูปหลัก (ที่มีดาว ⭐) จะแสดงในหน้าค้นหาและเป็นรูปประจำตัวของคุณ
        รูปอื่นๆ จะแสดงในแกลเลอรี่ของโปรไฟล์
      </p>
    </div>
  </div>
</template>
