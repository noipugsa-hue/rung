<script setup lang="ts">
import { ArrowLeft, ArrowRight, Upload, FileCheck, AlertCircle } from 'lucide-vue-next'
import type { PartnerApplication, DocumentType, DocumentUpload } from '~/types/application'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'

const props = defineProps<{
  application: PartnerApplication | null
}>()

const emit = defineEmits<{
  next: []
  prev: []
}>()

const applicationStore = usePartnerApplicationStore()

const requiredDocuments: Array<{
  type: DocumentType
  title: string
  description: string
  required: boolean
}> = [
  {
    type: 'id_card',
    title: 'บัตรประชาชนหรือบัตรประจำตัว',
    description: 'รูปถ่ายหน้าบัตรที่ชัดเจน',
    required: true
  },
  {
    type: 'selfie',
    title: 'รูปถ่ายตนเอง',
    description: 'รูปถ่ายใบหน้าปัจจุบัน สำหรับโปรไฟล์',
    required: true
  },
  {
    type: 'police_check',
    title: 'ใบรับรองความประพฤติ (ถ้ามี)',
    description: 'ออกจากสถานีตำรวจภายใน 3 เดือน',
    required: false
  }
]

const uploadedDocs = computed(() => {
  return props.application?.documents || []
})

function hasDocument(type: DocumentType): boolean {
  return uploadedDocs.value.some(doc => doc.type === type)
}

function getDocumentUrl(type: DocumentType): string | undefined {
  return uploadedDocs.value.find(doc => doc.type === type)?.url
}

// Mock file upload - in real app, upload to cloud storage
async function handleFileUpload(type: DocumentType, event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file || !props.application) return

  // Simulate file upload
  const mockUrl = URL.createObjectURL(file)

  const document: DocumentUpload = {
    type,
    url: mockUrl,
    filename: file.name,
    uploadedAt: new Date().toISOString()
  }

  await applicationStore.uploadDocument(props.application.id, document)
}

const hasRequiredDocuments = computed(() => {
  return requiredDocuments
    .filter(doc => doc.required)
    .every(doc => hasDocument(doc.type))
})

async function handleSubmit() {
  if (!hasRequiredDocuments.value || !props.application) return

  await applicationStore.completeDocumentStep(props.application.id)
  emit('next')
}
</script>

<template>
  <div class="card p-6 md:p-8">
    <div class="space-y-6">
      <!-- Instructions -->
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div class="flex items-start gap-3">
          <AlertCircle :size="20" class="text-blue-600 mt-0.5" />
          <div class="text-sm text-blue-800">
            <p class="font-semibold mb-1">ข้อมูลสำคัญ:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>ไฟล์รูปภาพควรมีขนาดไม่เกิน 5MB</li>
              <li>รูปถ่ายควรชัดเจน อ่านข้อความได้</li>
              <li>รองรับไฟล์ประเภท: JPG, PNG, PDF</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Document uploads -->
      <div class="space-y-4">
        <div
          v-for="doc in requiredDocuments"
          :key="doc.type"
          class="border-2 border-gray-200 rounded-lung p-6 hover:border-gray-300 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="font-bold text-dark mb-1">
                {{ doc.title }}
                <span v-if="doc.required" class="text-red-500 text-sm">*</span>
              </h4>
              <p class="text-sm text-gray-600 mb-3">{{ doc.description }}</p>

              <!-- Upload status -->
              <div v-if="hasDocument(doc.type)" class="flex items-center gap-2 text-green-600 mb-3">
                <FileCheck :size="20" />
                <span class="text-sm font-semibold">อัพโหลดแล้ว</span>
              </div>

              <!-- Upload button -->
              <label
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-dark text-dark hover:text-cream rounded-lung cursor-pointer transition-colors text-sm font-semibold"
              >
                <Upload :size="18" />
                {{ hasDocument(doc.type) ? 'เปลี่ยนไฟล์' : 'อัพโหลด' }}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  class="hidden"
                  @change="handleFileUpload(doc.type, $event)"
                />
              </label>
            </div>

            <!-- Preview -->
            <div v-if="hasDocument(doc.type)" class="flex-shrink-0">
              <img
                v-if="getDocumentUrl(doc.type)"
                :src="getDocumentUrl(doc.type)"
                alt="Document preview"
                class="w-24 h-24 object-cover rounded-lg border-2 border-green-200"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Warning if missing required docs -->
      <div
        v-if="!hasRequiredDocuments"
        class="bg-yellow-50 border-l-4 border-yellow-400 p-4"
      >
        <p class="text-sm text-yellow-800">
          กรุณาอัพโหลดเอกสารที่จำเป็นทั้งหมดก่อนดำเนินการต่อ
        </p>
      </div>

      <!-- Navigation buttons -->
      <div class="flex items-center justify-between pt-4 border-t">
        <button
          type="button"
          @click="emit('prev')"
          class="btn-outline"
        >
          <ArrowLeft :size="20" class="mr-2" />
          ก่อนหน้า
        </button>

        <button
          type="button"
          @click="handleSubmit"
          :disabled="!hasRequiredDocuments"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !hasRequiredDocuments }"
        >
          บันทึกและไปขั้นตอนถัดไป
          <ArrowRight :size="20" class="ml-2" />
        </button>
      </div>
    </div>
  </div>
</template>
