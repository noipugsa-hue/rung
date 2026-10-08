<script setup lang="ts">
import { AlertCircle, CheckCircle, Wrench, RefreshCw } from 'lucide-vue-next'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import type { PartnerApplication } from '~/types/application'
import { estimateDocumentSize, formatBytes, optimizeProfileImages } from '~/utils/document-size'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const applicationStore = usePartnerApplicationStore()
const { $firebase } = useNuxtApp()

const loading = ref(false)
const scanning = ref(false)
const fixing = ref(false)
const oversizedApps = ref<Array<{
  id: string
  userId: string
  status: string
  size: number
  imageCount: number
}>>([])
const fixResults = ref<Array<{
  id: string
  success: boolean
  beforeSize: number
  afterSize: number
  message: string
}>>([])

// Scan for oversized applications
const scanApplications = async () => {
  scanning.value = true
  oversizedApps.value = []

  try {
    await applicationStore.fetchAllApplications()
    const apps = applicationStore.getAllApplications()

    console.log(`🔍 Scanning ${apps.length} applications...`)

    for (const app of apps) {
      const size = estimateDocumentSize(app)

      // Flag if over 900KB (safe limit)
      if (size > 900000) {
        oversizedApps.value.push({
          id: app.id,
          userId: app.userId,
          status: app.status,
          size,
          imageCount: app.profileImages?.length || 0
        })
      }
    }

    console.log(`✅ Found ${oversizedApps.value.length} oversized applications`)
  } catch (error: any) {
    console.error('Error scanning applications:', error)
  } finally {
    scanning.value = false
  }
}

// Fix a single application
const fixApplication = async (appId: string) => {
  try {
    const db = $firebase.db
    const appRef = doc(db, 'partnerApplications', appId)
    const appSnap = await getDoc(appRef)

    if (!appSnap.exists()) {
      throw new Error('Application not found')
    }

    const currentData = appSnap.data() as PartnerApplication
    const beforeSize = estimateDocumentSize(currentData)

    // Optimize profile images
    let optimizedImages = []
    if (currentData.profileImages && currentData.profileImages.length > 0) {
      optimizedImages = optimizeProfileImages(currentData.profileImages)

      // Limit to 8 images max
      if (optimizedImages.length > 8) {
        optimizedImages = optimizedImages.slice(0, 8)
      }
    }

    // Update document
    await updateDoc(appRef, {
      profileImages: optimizedImages,
      updatedAt: new Date().toISOString()
    })

    // Check new size
    const newData = { ...currentData, profileImages: optimizedImages }
    const afterSize = estimateDocumentSize(newData)

    return {
      id: appId,
      success: true,
      beforeSize,
      afterSize,
      message: `ลดขนาดจาก ${formatBytes(beforeSize)} เป็น ${formatBytes(afterSize)}`
    }
  } catch (error: any) {
    return {
      id: appId,
      success: false,
      beforeSize: 0,
      afterSize: 0,
      message: `เกิดข้อผิดพลาด: ${error.message}`
    }
  }
}

// Fix all oversized applications
const fixAllApplications = async () => {
  fixing.value = true
  fixResults.value = []

  try {
    for (const app of oversizedApps.value) {
      console.log(`🔧 Fixing ${app.id}...`)
      const result = await fixApplication(app.id)
      fixResults.value.push(result)
    }

    // Rescan after fixing
    await scanApplications()
  } finally {
    fixing.value = false
  }
}

// Auto-scan on mount
onMounted(() => {
  scanApplications()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-dark mb-2">แก้ไขเอกสารที่มีปัญหา</h1>
      <p class="text-gray-600">ตรวจสอบและแก้ไขใบสมัครที่มีขนาดเกิน 900KB</p>
    </div>

    <!-- Scan Status -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-dark">สถานะการสแกน</h2>
        <button
          @click="scanApplications"
          :disabled="scanning"
          class="btn-primary flex items-center gap-2"
        >
          <RefreshCw :size="18" :class="{ 'animate-spin': scanning }" />
          {{ scanning ? 'กำลังสแกน...' : 'สแกนอีกครั้ง' }}
        </button>
      </div>

      <div v-if="scanning" class="text-center py-8">
        <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังตรวจสอบเอกสาร...</p>
      </div>

      <div v-else-if="oversizedApps.length === 0" class="text-center py-8">
        <CheckCircle :size="48" class="text-green-500 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">ไม่พบปัญหา!</h3>
        <p class="text-gray-600">ไม่มีเอกสารที่มีขนาดเกินกำหนด</p>
      </div>

      <div v-else>
        <!-- Problem Summary -->
        <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-3">
            <AlertCircle :size="24" class="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-bold text-red-800 mb-1">พบปัญหา {{ oversizedApps.length }} เอกสาร</h3>
              <p class="text-red-700 text-sm">เอกสารเหล่านี้มีขนาดเกิน 900KB ซึ่งอาจทำให้เกิดข้อผิดพลาดเมื่อบันทึกข้อมูล</p>
            </div>
          </div>
        </div>

        <!-- Fix All Button -->
        <div class="mb-6 flex justify-end">
          <button
            @click="fixAllApplications"
            :disabled="fixing"
            class="btn-primary flex items-center gap-2"
          >
            <Wrench :size="18" />
            {{ fixing ? 'กำลังแก้ไข...' : `แก้ไขทั้งหมด (${oversizedApps.length})` }}
          </button>
        </div>

        <!-- Problem List -->
        <div class="space-y-3">
          <div
            v-for="app in oversizedApps"
            :key="app.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="font-medium text-dark mb-1">{{ app.id }}</div>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span>User: {{ app.userId.substring(0, 8) }}...</span>
                  <span>สถานะ: {{ app.status }}</span>
                  <span class="font-bold text-red-600">{{ formatBytes(app.size) }}</span>
                  <span>รูปภาพ: {{ app.imageCount }} รูป</span>
                </div>
              </div>

              <button
                @click="fixApplication(app.id).then(result => fixResults.push(result))"
                :disabled="fixing"
                class="btn-outline text-sm px-3 py-1.5"
              >
                แก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fix Results -->
    <div v-if="fixResults.length > 0" class="card p-6">
      <h2 class="text-xl font-bold text-dark mb-4">ผลลัพธ์การแก้ไข</h2>

      <div class="space-y-3">
        <div
          v-for="result in fixResults"
          :key="result.id"
          class="border rounded-lg p-4"
          :class="[
            result.success
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          ]"
        >
          <div class="flex items-start gap-3">
            <CheckCircle v-if="result.success" :size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
            <AlertCircle v-else :size="20" class="text-red-600 flex-shrink-0 mt-0.5" />

            <div class="flex-1">
              <div class="font-medium mb-1" :class="result.success ? 'text-green-800' : 'text-red-800'">
                {{ result.id }}
              </div>
              <div class="text-sm" :class="result.success ? 'text-green-700' : 'text-red-700'">
                {{ result.message }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center">
        <button
          @click="fixResults = []"
          class="btn-outline"
        >
          ล้างผลลัพธ์
        </button>
      </div>
    </div>

    <!-- Instructions -->
    <div class="card p-6">
      <h2 class="text-xl font-bold text-dark mb-4">วิธีแก้ไข</h2>
      <div class="space-y-3 text-gray-700">
        <p>เครื่องมือนี้จะทำการ:</p>
        <ol class="list-decimal list-inside space-y-2 ml-4">
          <li>ลบ metadata ที่ไม่จำเป็นออกจากรูปภาพ (filename, storagePath, uploadedAt, size, dimensions)</li>
          <li>เก็บเฉพาะ url, isPrimary, และ order</li>
          <li>จำกัดจำนวนรูปสูงสุด 8 รูป</li>
          <li>ลดขนาดเอกสารให้อยู่ในขอบเขตที่ปลอดภัย</li>
        </ol>
        <p class="mt-4 text-sm text-gray-600">
          <strong>หมายเหตุ:</strong> การแก้ไขจะไม่ลบรูปจาก Firebase Storage เพียงแต่ลด metadata ที่เก็บใน Firestore
        </p>
      </div>
    </div>
  </div>
</template>
