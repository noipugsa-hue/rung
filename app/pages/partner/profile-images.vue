<script setup lang="ts">
import { Upload, X, Star, GripVertical, Save, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { useLungStore } from '~/stores/lung'
import { useAuthStore } from '~/stores/auth'
import { useImageUpload } from '~/composables/useImageUpload'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const authStore = useAuthStore()
const lungStore = useLungStore()
const imageUpload = useImageUpload()

// State
const images = ref<Array<{ url: string; id: string; isPrimary: boolean }>>([])
const loading = ref(false)
const saving = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const uploadingFiles = ref<File[]>([])
const uploadProgress = ref(0)
const draggedIndex = ref<number | null>(null)

// Load current lung's images
onMounted(async () => {
  if (!authStore.user?.lungId) {
    message.value = { type: 'error', text: 'ไม่พบข้อมูลโปรไฟล์ Lung ของคุณ' }
    return
  }

  loading.value = true
  try {
    await lungStore.fetchLungById(authStore.user.lungId)
    const lung = lungStore.currentLung

    if (lung && lung.gallery) {
      const primaryIndex = lung.galleryMetadata?.primaryIndex ?? 0
      images.value = lung.gallery.map((url, index) => ({
        url,
        id: `img-${index}`,
        isPrimary: index === primaryIndex
      }))
    }
  } catch (error) {
    message.value = { type: 'error', text: 'ไม่สามารถโหลดรูปภาพได้' }
  } finally {
    loading.value = false
  }
})

// File input handler
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    uploadFiles(Array.from(target.files))
    target.value = '' // Reset input
  }
}

// Upload files
const uploadFiles = async (files: File[]) => {
  if (!authStore.user?.lungId) return

  uploadingFiles.value = files
  const lungId = authStore.user.lungId

  for (const file of files) {
    // Validate
    const validation = await imageUpload.validateImage(file)
    if (!validation.valid) {
      message.value = { type: 'error', text: validation.error || 'ไฟล์ไม่ถูกต้อง' }
      continue
    }

    try {
      // Upload to Firebase Storage
      const storage = getStorage()
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 9)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}_${randomStr}.${extension}`
      const storagePath = `lungs/${lungId}/gallery/${filename}`

      const fileRef = storageRef(storage, storagePath)
      const uploadTask = uploadBytesResumable(fileRef, file)

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          },
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            images.value.push({
              url: downloadURL,
              id: `img-${Date.now()}-${Math.random()}`,
              isPrimary: images.value.length === 0
            })
            resolve(null)
          }
        )
      })

      message.value = { type: 'success', text: 'อัปโหลดรูปสำเร็จ' }
    } catch (error) {
      message.value = { type: 'error', text: 'ไม่สามารถอัปโหลดรูปได้' }
    }
  }

  uploadingFiles.value = []
  uploadProgress.value = 0
}

// Set primary image
const setPrimary = (index: number) => {
  images.value = images.value.map((img, idx) => ({
    ...img,
    isPrimary: idx === index
  }))
}

// Delete image
const deleteImage = (index: number) => {
  if (confirm('คุณต้องการลบรูปนี้หรือไม่?')) {
    images.value.splice(index, 1)

    // If deleted image was primary, set first image as primary
    if (!images.value.some(img => img.isPrimary) && images.value.length > 0) {
      images.value[0].isPrimary = true
    }
  }
}

// Drag and drop handlers
const onDragStart = (index: number) => {
  draggedIndex.value = index
}

const onDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === index) return

  const draggedItem = images.value[draggedIndex.value]
  const newImages = [...images.value]
  newImages.splice(draggedIndex.value, 1)
  newImages.splice(index, 0, draggedItem)

  images.value = newImages
  draggedIndex.value = index
}

const onDragEnd = () => {
  draggedIndex.value = null
}

// Save changes
const saveChanges = async () => {
  if (!authStore.user?.lungId) return
  if (images.value.length === 0) {
    message.value = { type: 'error', text: 'กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป' }
    return
  }

  saving.value = true
  message.value = null

  try {
    const primaryIndex = images.value.findIndex(img => img.isPrimary)
    const gallery = images.value.map(img => img.url)
    const avatar = images.value[primaryIndex]?.url || gallery[0]

    await lungStore.updateLungImages(authStore.user.lungId, {
      avatar,
      gallery,
      galleryMetadata: {
        primaryIndex: primaryIndex >= 0 ? primaryIndex : 0,
        lastUpdated: new Date().toISOString()
      }
    })

    message.value = { type: 'success', text: 'บันทึกข้อมูลสำเร็จ!' }
  } catch (error) {
    message.value = { type: 'error', text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' }
  } finally {
    saving.value = false
  }
}

// Auto-dismiss messages
watch(message, (newMessage) => {
  if (newMessage) {
    setTimeout(() => {
      message.value = null
    }, 5000)
  }
})
</script>

<template>
  <div class="container-lung py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-dark mb-2">จัดการรูปภาพโปรไฟล์</h1>
      <p class="text-gray-600">อัปโหลด เรียงลำดับ และเลือกรูปหลักของคุณ</p>
    </div>

    <!-- Message -->
    <div
      v-if="message"
      class="mb-6 p-4 rounded-lg flex items-center gap-3"
      :class="[
        message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      ]"
    >
      <CheckCircle v-if="message.type === 'success'" :size="20" />
      <AlertCircle v-else :size="20" />
      <span>{{ message.text }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">กำลังโหลด...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Upload Section -->
      <div class="card p-6 mb-6">
        <h2 class="text-xl font-bold text-dark mb-4">เพิ่มรูปใหม่</h2>

        <label class="block">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            class="hidden"
            @change="handleFileSelect"
            :disabled="uploadingFiles.length > 0"
          />
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-cream/50 transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': uploadingFiles.length > 0 }"
          >
            <Upload :size="48" class="mx-auto mb-4 text-gray-400" />
            <p class="text-gray-700 font-medium mb-2">คลิกเพื่ออัปโหลดรูปภาพ</p>
            <p class="text-sm text-gray-500">รองรับ JPG, PNG, WebP (สูงสุด 10MB, ขนาดอย่างน้อย 800x800px)</p>
          </div>
        </label>

        <!-- Upload Progress -->
        <div v-if="uploadingFiles.length > 0" class="mt-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span class="text-sm text-gray-600">กำลังอัปโหลด... {{ Math.round(uploadProgress) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full transition-all duration-300" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div v-if="images.length > 0" class="card p-6 mb-6">
        <h2 class="text-xl font-bold text-dark mb-4">รูปภาพของคุณ ({{ images.length }})</h2>
        <p class="text-sm text-gray-600 mb-4">ลากเพื่อเรียงลำดับ • คลิกดาวเพื่อตั้งเป็นรูปหลัก • คลิก X เพื่อลบ</p>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="(image, index) in images"
            :key="image.id"
            class="relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move"
            :class="[
              image.isPrimary ? 'border-primary ring-4 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
            ]"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover="(e) => onDragOver(e, index)"
            @dragend="onDragEnd"
          >
            <img
              :src="image.url"
              :alt="`Image ${index + 1}`"
              class="w-full h-full object-cover"
            />

            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

            <!-- Primary Badge -->
            <div
              v-if="image.isPrimary"
              class="absolute top-2 left-2 px-2 py-1 bg-primary text-dark text-xs font-bold rounded-full flex items-center gap-1"
            >
              <Star :size="12" class="fill-current" />
              รูปหลัก
            </div>

            <!-- Controls -->
            <div class="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <!-- Set Primary -->
              <button
                v-if="!image.isPrimary"
                @click="setPrimary(index)"
                class="w-10 h-10 rounded-full bg-white hover:bg-primary hover:text-white text-gray-700 flex items-center justify-center transition-colors shadow-lg"
                title="ตั้งเป็นรูปหลัก"
              >
                <Star :size="18" />
              </button>

              <!-- Delete -->
              <button
                @click="deleteImage(index)"
                class="w-10 h-10 rounded-full bg-white hover:bg-red-500 hover:text-white text-gray-700 flex items-center justify-center transition-colors shadow-lg"
                title="ลบรูป"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Drag Handle -->
            <div class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical :size="16" class="text-gray-600" />
            </div>

            <!-- Order Number -->
            <div class="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold flex items-center justify-center">
              {{ index + 1 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card p-12 text-center">
        <div class="text-6xl mb-4">📷</div>
        <h3 class="text-xl font-bold text-dark mb-2">ยังไม่มีรูปภาพ</h3>
        <p class="text-gray-600">อัปโหลดรูปภาพเพื่อเริ่มสร้างแกลเลอรี่ของคุณ</p>
      </div>

      <!-- Save Button -->
      <div class="flex items-center justify-end gap-4">
        <NuxtLink
          to="/partner/dashboard"
          class="btn-outline"
        >
          ยกเลิก
        </NuxtLink>
        <button
          @click="saveChanges"
          :disabled="saving || images.length === 0"
          class="btn-primary flex items-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': saving || images.length === 0 }"
        >
          <Save :size="20" />
          <span v-if="saving">กำลังบันทึก...</span>
          <span v-else>บันทึกการเปลี่ยนแปลง</span>
        </button>
      </div>
    </div>
  </div>
</template>
