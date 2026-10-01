<script setup lang="ts">
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, User, Briefcase, Upload, CreditCard, Shield, Image as ImageIcon, Trash2 } from 'lucide-vue-next'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import { useLungStore } from '~/stores/lung'
import { useAuthStore } from '~/stores/auth'
import type { ApplicationStatus, PartnerApplication } from '~/types/application'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const applicationStore = usePartnerApplicationStore()
const lungStore = useLungStore()
const authStore = useAuthStore()

const applicationId = route.params.id as string
const application = ref<PartnerApplication | null>(null)
const loading = ref(true)

// Load application on mount
onMounted(async () => {
  try {
    application.value = await applicationStore.getApplicationById(applicationId)
  } catch (error) {
    console.error('Error loading application:', error)
  } finally {
    loading.value = false
  }
})

const reviewing = ref(false)
const showReviewModal = ref(false)
const reviewForm = reactive({
  status: 'approved' as 'approved' | 'rejected' | 'revision_required',
  notes: '',
  checklist: {
    personalInfoVerified: false,
    documentsVerified: false,
    backgroundCheckPassed: false,
    referencesContacted: false
  }
})

function goBack() {
  router.push('/admin/applications')
}

function getStatusBadge(status: ApplicationStatus) {
  const badges = {
    draft: { class: 'bg-gray-100 text-gray-700', text: 'ร่าง' },
    submitted: { class: 'bg-blue-100 text-blue-700', text: 'ส่งแล้ว' },
    under_review: { class: 'bg-yellow-100 text-yellow-700', text: 'กำลังตรวจสอบ' },
    approved: { class: 'bg-green-100 text-green-700', text: 'อนุมัติ' },
    rejected: { class: 'bg-red-100 text-red-700', text: 'ไม่อนุมัติ' },
    revision_required: { class: 'bg-orange-100 text-orange-700', text: 'ต้องแก้ไข' }
  }
  return badges[status] || badges.draft
}

function openReviewModal() {
  showReviewModal.value = true
}

async function submitReview() {
  if (!application.value || !authStore.user || reviewing.value) return

  reviewing.value = true

  try {
    await applicationStore.reviewApplication(application.value.id, {
      reviewerId: authStore.user.id,
      reviewerName: authStore.user.name,
      status: reviewForm.status,
      notes: reviewForm.notes,
      checklist: reviewForm.checklist
    })

    // If approved, create lung profile automatically
    if (reviewForm.status === 'approved') {
      // Validate application data before creating profile
      if (!application.value.personalInfo) {
        alert('❌ ไม่สามารถอนุมัติได้: Application ขาดข้อมูล Personal Info\n\nกรุณาให้ผู้สมัครกรอกข้อมูลส่วนตัวให้ครบก่อน')
        reviewing.value = false
        return
      }

      if (!application.value.professionalInfo) {
        alert('❌ ไม่สามารถอนุมัติได้: Application ขาดข้อมูล Professional Info\n\nกรุณาให้ผู้สมัครกรอกข้อมูลประสบการณ์ให้ครบก่อน')
        reviewing.value = false
        return
      }

      if (!application.value.profileImages || application.value.profileImages.length === 0) {
        alert('❌ ไม่สามารถอนุมัติได้: Application ขาดรูปโปรไฟล์\n\nกรุณาให้ผู้สมัครอัพโหลดรูปภาพอย่างน้อย 1 รูป')
        reviewing.value = false
        return
      }

      try {
        console.log('✅ Validation passed, creating lung profile...')
        console.log('📋 Application data being sent:', {
          hasPersonalInfo: !!application.value.personalInfo,
          hasProfessionalInfo: !!application.value.professionalInfo,
          hasProfileImages: !!application.value.profileImages,
          profileImagesCount: application.value.profileImages?.length || 0,
          personalInfo: application.value.personalInfo,
          professionalInfo: application.value.professionalInfo,
          fullApplication: application.value
        })
        await lungStore.createLungFromApplication(application.value)
        alert('อนุมัติสำเร็จและสร้างโปรไฟล์ลุงเรียบร้อยแล้ว')
      } catch (error: any) {
        console.error('Create lung profile error:', error)
        console.error('📋 Full error details:', {
          message: error.message,
          stack: error.stack,
          application: application.value
        })
        alert(`อนุมัติสำเร็จ แต่เกิดข้อผิดพลาดในการสร้างโปรไฟล์:\n\n${error.message}\n\nกรุณาติดต่อผู้ดูแลระบบ`)
      }
    } else {
      alert('บันทึกการตรวจสอบสำเร็จ')
    }

    showReviewModal.value = false
    router.push('/admin/applications')

  } catch (error) {
    console.error('Review error:', error)
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
  } finally {
    reviewing.value = false
  }
}

const sections = [
  { id: 'personal', title: 'ข้อมูลส่วนตัว', icon: User },
  { id: 'professional', title: 'ข้อมูลอาชีพ', icon: Briefcase },
  { id: 'profile-images', title: 'รูปภาพโปรไฟล์', icon: ImageIcon },
  { id: 'documents', title: 'เอกสารประกอบ', icon: Upload },
  { id: 'financial', title: 'ข้อมูลการเงิน', icon: CreditCard },
  { id: 'background', title: 'ตรวจสอบประวัติ', icon: Shield }
]

function handleImageError(event: Event, image: any) {
  console.error('Image failed to load:', image)
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3EError%3C/text%3E%3C/svg%3E'
}

const deleting = ref(false)

async function handleDeleteApplication() {
  if (!application.value) return

  const applicationName = `${application.value.personalInfo?.firstName} ${application.value.personalInfo?.lastName}`

  const confirmed = confirm(
    `คุณต้องการลบใบสมัครของ "${applicationName}" ใช่หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`
  )

  if (!confirmed) return

  deleting.value = true

  try {
    await applicationStore.deleteApplication(application.value.id)
    alert('ลบใบสมัครสำเร็จ')
    router.push('/admin/applications')
  } catch (error: any) {
    console.error('Delete error:', error)
    alert(`เกิดข้อผิดพลาด: ${error.message}`)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="py-12 text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
    <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
  </div>

  <!-- Application Content -->
  <div v-else-if="application" class="py-8">
    <div class="container-lung max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-4"
        >
          <ArrowLeft :size="20" />
          <span>กลับ</span>
        </button>

        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-dark mb-2">
              {{ application.personalInfo?.firstName }} {{ application.personalInfo?.lastName }}
            </h1>
            <div class="flex items-center gap-3">
              <span
                class="px-3 py-1 rounded-full text-sm font-semibold"
                :class="getStatusBadge(application.status).class"
              >
                {{ getStatusBadge(application.status).text }}
              </span>
              <span class="text-sm text-gray-600">
                รหัส: {{ application.id }}
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <!-- Review buttons (only for submitted status) -->
            <template v-if="application.status === 'submitted'">
              <button
                @click="reviewForm.status = 'approved'; openReviewModal()"
                class="btn-primary"
              >
                <CheckCircle2 :size="20" class="mr-2" />
                อนุมัติ
              </button>
              <button
                @click="reviewForm.status = 'rejected'; openReviewModal()"
                class="btn-outline text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle :size="20" class="mr-2" />
                ไม่อนุมัติ
              </button>
            </template>

            <!-- Delete button (always visible) -->
            <button
              @click="handleDeleteApplication"
              :disabled="deleting"
              class="px-4 py-2 rounded-lung font-semibold border-2 border-red-600 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="ลบใบสมัคร"
            >
              <Trash2 :size="20" />
              {{ deleting ? 'กำลังลบ...' : 'ลบใบสมัคร' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          class="px-4 py-2 bg-white rounded-lung font-semibold whitespace-nowrap transition-colors flex items-center gap-2 hover:bg-gray-50"
        >
          <component :is="section.icon" :size="18" />
          {{ section.title }}
        </a>
      </div>

      <!-- Personal Information -->
      <div id="personal" class="card p-6 md:p-8 mb-6">
        <h2 class="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
          <User :size="24" />
          ข้อมูลส่วนตัว
        </h2>

        <div v-if="!application.personalInfo" class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p class="text-yellow-800 font-semibold flex items-center gap-2">
            <AlertCircle :size="20" />
            ⚠️ ยังไม่มีข้อมูลส่วนตัว - กรุณาให้ผู้สมัครกรอกข้อมูลให้ครบก่อนอนุมัติ
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">ชื่อ-นามสกุล</label>
            <p class="text-dark">{{ application.personalInfo.firstName }} {{ application.personalInfo.lastName }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">วันเกิด</label>
            <p class="text-dark">{{ new Date(application.personalInfo.dateOfBirth).toLocaleDateString('th-TH') }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">เพศ</label>
            <p class="text-dark">{{ application.personalInfo.gender === 'male' ? 'ชาย' : application.personalInfo.gender === 'female' ? 'หญิง' : 'อื่นๆ' }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">เบอร์โทรศัพท์</label>
            <p class="text-dark">{{ application.personalInfo.phoneNumber }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">อีเมล</label>
            <p class="text-dark">{{ application.personalInfo.email }}</p>
          </div>

          <div v-if="application.personalInfo.lineId">
            <label class="block text-sm font-semibold text-gray-600 mb-1">LINE ID</label>
            <p class="text-dark">{{ application.personalInfo.lineId }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-600 mb-1">ที่อยู่</label>
            <p class="text-dark">
              {{ application.personalInfo.address }}<br>
              {{ application.personalInfo.district }} {{ application.personalInfo.province }} {{ application.personalInfo.postalCode }}
            </p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-600 mb-2">ผู้ติดต่อฉุกเฉิน</label>
            <p class="text-dark">
              {{ application.personalInfo.emergencyContact.name }} ({{ application.personalInfo.emergencyContact.relationship }})<br>
              {{ application.personalInfo.emergencyContact.phoneNumber }}
            </p>
          </div>
        </div>
      </div>

      <!-- Professional Information -->
      <div id="professional" class="card p-6 md:p-8 mb-6">
        <h2 class="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
          <Briefcase :size="24" />
          ข้อมูลอาชีพ
        </h2>

        <div v-if="!application.professionalInfo" class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p class="text-yellow-800 font-semibold flex items-center gap-2">
            <AlertCircle :size="20" />
            ⚠️ ยังไม่มีข้อมูลอาชีพ - กรุณาให้ผู้สมัครกรอกข้อมูลให้ครบก่อนอนุมัติ
          </p>
        </div>

        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1">อาชีพ</label>
              <p class="text-dark">{{ application.professionalInfo.occupation }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1">การศึกษา</label>
              <p class="text-dark">{{ application.professionalInfo.education }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-2">ประสบการณ์</label>
            <p class="text-dark whitespace-pre-wrap">{{ application.professionalInfo.experience }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-2">ภาษา</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="lang in application.professionalInfo.languages"
                :key="lang"
                class="px-3 py-1 bg-primary rounded-full text-sm font-semibold"
              >
                {{ lang }}
              </span>
            </div>
          </div>

          <div v-if="application.professionalInfo.specialSkills.length > 0">
            <label class="block text-sm font-semibold text-gray-600 mb-2">ทักษะพิเศษ</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in application.professionalInfo.specialSkills"
                :key="skill"
                class="px-3 py-1 bg-cream rounded-full text-sm"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-2">กิจกรรมที่ถนัด</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="activity in application.professionalInfo.preferredActivities"
                :key="activity"
                class="px-3 py-1 bg-cream rounded-full text-sm"
              >
                {{ activity }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Images -->
      <div id="profile-images" class="card p-6 md:p-8 mb-6">
        <h2 class="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
          <ImageIcon :size="24" />
          รูปภาพโปรไฟล์
        </h2>

        <div v-if="!application.profileImages || application.profileImages.length === 0" class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p class="text-yellow-800 font-semibold flex items-center gap-2">
            <AlertCircle :size="20" />
            ⚠️ ยังไม่มีรูปภาพโปรไฟล์ - กรุณาให้ผู้สมัครอัพโหลดรูปภาพอย่างน้อย 1 รูปก่อนอนุมัติ
          </p>
        </div>

        <div v-else>
          <p class="text-sm text-gray-600 mb-4">
            จำนวน: {{ application.profileImages.length }} รูป
          </p>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="(image, index) in application.profileImages"
              :key="index"
              class="relative aspect-square rounded-lg overflow-hidden border-2"
              :class="image.isPrimary ? 'border-orange-500 shadow-md' : 'border-gray-200'"
            >
              <img
                :src="image.url"
                :alt="image.filename || `Image ${index + 1}`"
                class="w-full h-full object-cover"
                @error="handleImageError($event, image)"
              />
              <div
                v-if="image.isPrimary"
                class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1"
              >
                ⭐ รูปหลัก
              </div>
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p class="text-white text-xs truncate">{{ image.filename || 'No filename' }}</p>
                <p v-if="image.dimensions" class="text-white text-xs">{{ image.dimensions.width }}x{{ image.dimensions.height }}px</p>
                <p v-else class="text-white text-xs">{{ image.url?.startsWith('data:') ? 'Base64 Image' : 'URL Image' }}</p>
              </div>
            </div>
          </div>

          <!-- Debug Info -->
          <details class="mt-4 text-xs">
            <summary class="cursor-pointer text-gray-500">🐛 Debug: ดูข้อมูลรูปภาพ</summary>
            <pre class="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">{{ JSON.stringify(application.profileImages, null, 2) }}</pre>
          </details>
        </div>
      </div>

      <!-- Documents -->
      <div id="documents" class="card p-6 md:p-8 mb-6">
        <h2 class="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
          <Upload :size="24" />
          เอกสารประกอบ
        </h2>

        <div v-if="!application.documents || application.documents.length === 0" class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p class="text-yellow-800 font-semibold flex items-center gap-2">
            <AlertCircle :size="20" />
            ⚠️ ยังไม่มีเอกสารประกอบ - กรุณาให้ผู้สมัครอัพโหลดเอกสาร (บัตรประชาชน, รูปถ่าย Selfie) ก่อนอนุมัติ
          </p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="doc in application.documents" :key="doc.type" class="border-2 border-gray-200 rounded-lung p-4">
            <img
              :src="doc.url"
              :alt="doc.type"
              class="w-full h-32 object-cover rounded-lg mb-2"
            />
            <p class="text-sm font-semibold text-dark">{{ doc.type }}</p>
            <p class="text-xs text-gray-600">{{ doc.filename }}</p>
          </div>
        </div>
      </div>

      <!-- Financial Information -->
      <div id="financial" class="card p-6 md:p-8 mb-6">
        <h2 class="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
          <CreditCard :size="24" />
          ข้อมูลการเงิน
        </h2>

        <div v-if="!application.financialInfo" class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p class="text-yellow-800 font-semibold flex items-center gap-2">
            <AlertCircle :size="20" />
            ⚠️ ยังไม่มีข้อมูลการเงิน - กรุณาให้ผู้สมัครกรอกข้อมูลบัญชีธนาคารก่อนอนุมัติ
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">ธนาคาร</label>
            <p class="text-dark">{{ application.financialInfo.bankName }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">เลขที่บัญชี</label>
            <p class="text-dark font-mono">{{ application.financialInfo.accountNumber }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">ชื่อบัญชี</label>
            <p class="text-dark">{{ application.financialInfo.accountName }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">ความถี่การรับเงิน</label>
            <p class="text-dark">
              {{ application.financialInfo.preferredPayoutFrequency === 'weekly' ? 'รายสัปดาห์' :
                 application.financialInfo.preferredPayoutFrequency === 'biweekly' ? '2 สัปดาห์ครั้ง' : 'รายเดือน' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Background Check -->
      <div id="background" class="card p-6 md:p-8 mb-6">
        <h2 class="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
          <Shield :size="24" />
          ตรวจสอบประวัติ
        </h2>

        <div v-if="!application.backgroundCheck" class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p class="text-yellow-800 font-semibold flex items-center gap-2">
            <AlertCircle :size="20" />
            ⚠️ ยังไม่มีข้อมูลการตรวจสอบประวัติ - กรุณาให้ผู้สมัครกรอกข้อมูลผู้อ้างอิงและประวัติก่อนอนุมัติ
          </p>
        </div>

        <div v-else class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">ประวัติคดีอาญา</label>
            <p class="text-dark">{{ application.backgroundCheck.hasConvictions ? 'มี' : 'ไม่มี' }}</p>
            <p v-if="application.backgroundCheck.convictionDetails" class="text-sm text-gray-600 mt-1">
              {{ application.backgroundCheck.convictionDetails }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">โรคประจำตัว</label>
            <p class="text-dark">{{ application.backgroundCheck.hasMedicalConditions ? 'มี' : 'ไม่มี' }}</p>
            <p v-if="application.backgroundCheck.medicalConditionDetails" class="text-sm text-gray-600 mt-1">
              {{ application.backgroundCheck.medicalConditionDetails }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-2">ผู้อ้างอิง</label>
            <div class="space-y-3">
              <div
                v-for="(ref, index) in application.backgroundCheck.references"
                :key="index"
                class="p-4 bg-gray-50 rounded-lung"
              >
                <p class="font-semibold text-dark">{{ ref.name }} ({{ ref.relationship }})</p>
                <p class="text-sm text-gray-600">{{ ref.phoneNumber }}</p>
                <p v-if="ref.email" class="text-sm text-gray-600">{{ ref.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div
      v-if="showReviewModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showReviewModal = false"
    >
      <div class="bg-white rounded-lung max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold text-dark mb-6">
          {{ reviewForm.status === 'approved' ? 'อนุมัติใบสมัคร' : 'ไม่อนุมัติใบสมัคร' }}
        </h3>

        <form @submit.prevent="submitReview" class="space-y-6">
          <!-- Checklist -->
          <div>
            <label class="block text-sm font-semibold text-dark mb-3">รายการตรวจสอบ</label>
            <div class="space-y-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="reviewForm.checklist.personalInfoVerified"
                  type="checkbox"
                  class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>ตรวจสอบข้อมูลส่วนตัวแล้ว</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="reviewForm.checklist.documentsVerified"
                  type="checkbox"
                  class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>ตรวจสอบเอกสารแล้ว</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="reviewForm.checklist.backgroundCheckPassed"
                  type="checkbox"
                  class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>ผ่านการตรวจสอบประวัติ</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="reviewForm.checklist.referencesContacted"
                  type="checkbox"
                  class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>ติดต่อผู้อ้างอิงแล้ว</span>
              </label>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              หมายเหตุ {{ reviewForm.status === 'rejected' ? '(โปรดระบุเหตุผล)' : '' }}
            </label>
            <textarea
              v-model="reviewForm.notes"
              class="input-lung"
              rows="4"
              :placeholder="reviewForm.status === 'rejected' ? 'เหตุผลที่ไม่อนุมัติ...' : 'หมายเหตุเพิ่มเติม (ถ้ามี)'"
              :required="reviewForm.status === 'rejected'"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="showReviewModal = false"
              class="btn-outline"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="reviewing"
              class="btn-primary"
              :class="{ 'opacity-50 cursor-wait': reviewing }"
            >
              {{ reviewing ? 'กำลังบันทึก...' : 'ยืนยัน' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div v-else class="py-12 text-center">
    <AlertCircle :size="64" class="text-gray-300 mx-auto mb-4" />
    <h2 class="text-2xl font-bold text-dark mb-2">ไม่พบใบสมัคร</h2>
    <button @click="goBack" class="btn-outline mt-4">
      กลับไปหน้ารายการ
    </button>
  </div>
</template>
