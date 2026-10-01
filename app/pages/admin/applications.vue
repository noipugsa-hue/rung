<script setup lang="ts">
import { Users, Clock, CheckCircle2, XCircle, AlertCircle, Eye, Trash2 } from 'lucide-vue-next'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import type { ApplicationStatus } from '~/types/application'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const applicationStore = usePartnerApplicationStore()
const router = useRouter()

const selectedStatus = ref<ApplicationStatus | 'all'>('all')

// Load applications on mount
onMounted(async () => {
  console.log('📋 Loading applications list...')
  await applicationStore.fetchAllApplications()
  console.log(`📊 Loaded ${applicationStore.applications.length} applications`)
  if (applicationStore.applications.length > 0) {
    console.log('First application:', applicationStore.applications[0])
  }
})

const applications = computed(() => {
  if (selectedStatus.value === 'all') {
    return applicationStore.getAllApplications()
  }
  return applicationStore.getApplicationsByStatus(selectedStatus.value)
})

const stats = computed(() => {
  const all = applicationStore.getAllApplications()
  return {
    total: all.length,
    submitted: all.filter(a => a.status === 'submitted').length,
    under_review: all.filter(a => a.status === 'under_review').length,
    approved: all.filter(a => a.status === 'approved').length,
    rejected: all.filter(a => a.status === 'rejected').length
  }
})

const statusOptions = [
  { value: 'all', label: 'ทั้งหมด', icon: Users, color: 'text-gray-600' },
  { value: 'submitted', label: 'ส่งใหม่', icon: Clock, color: 'text-blue-600' },
  { value: 'under_review', label: 'กำลังตรวจสอบ', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'approved', label: 'อนุมัติ', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'rejected', label: 'ไม่อนุมัติ', icon: XCircle, color: 'text-red-600' }
]

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

function viewApplication(applicationId: string) {
  router.push(`/admin/application-detail-${applicationId}`)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const deleting = ref<string | null>(null)

async function handleDeleteApplication(applicationId: string, applicationName: string) {
  const confirmed = confirm(
    `คุณต้องการลบใบสมัครของ "${applicationName}" ใช่หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`
  )

  if (!confirmed) return

  deleting.value = applicationId

  try {
    await applicationStore.deleteApplication(applicationId)
    console.log('✅ Application deleted successfully')
  } catch (error: any) {
    console.error('Delete error:', error)
    alert(`เกิดข้อผิดพลาด: ${error.message}`)
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">
          ใบสมัครพาร์ทเนอร์
        </h1>
        <p class="text-gray-600">
          ตรวจสอบและอนุมัติใบสมัครพาร์ทเนอร์ใหม่
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="card p-4">
          <div class="text-2xl font-bold text-dark mb-1">{{ stats.total }}</div>
          <div class="text-sm text-gray-600">ทั้งหมด</div>
        </div>
        <div class="card p-4">
          <div class="text-2xl font-bold text-blue-600 mb-1">{{ stats.submitted }}</div>
          <div class="text-sm text-gray-600">ส่งใหม่</div>
        </div>
        <div class="card p-4">
          <div class="text-2xl font-bold text-yellow-600 mb-1">{{ stats.under_review }}</div>
          <div class="text-sm text-gray-600">กำลังตรวจ</div>
        </div>
        <div class="card p-4">
          <div class="text-2xl font-bold text-green-600 mb-1">{{ stats.approved }}</div>
          <div class="text-sm text-gray-600">อนุมัติ</div>
        </div>
        <div class="card p-4">
          <div class="text-2xl font-bold text-red-600 mb-1">{{ stats.rejected }}</div>
          <div class="text-sm text-gray-600">ไม่อนุมัติ</div>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          @click="selectedStatus = option.value as ApplicationStatus | 'all'"
          class="px-4 py-2 rounded-lung font-semibold whitespace-nowrap transition-colors flex items-center gap-2"
          :class="
            selectedStatus === option.value
              ? 'bg-primary text-dark'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          "
        >
          <component :is="option.icon" :size="18" />
          {{ option.label }}
        </button>
      </div>

      <!-- Applications list -->
      <div v-if="applications.length > 0" class="space-y-4">
        <div
          v-for="app in applications"
          :key="app.id"
          class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewApplication(app.id)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-bold text-dark">
                  {{ app.personalInfo?.firstName }} {{ app.personalInfo?.lastName }}
                </h3>
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="getStatusBadge(app.status).class"
                >
                  {{ getStatusBadge(app.status).text }}
                </span>
              </div>

              <div class="space-y-1 text-sm text-gray-600">
                <p v-if="app.personalInfo?.email">
                  📧 {{ app.personalInfo.email }}
                </p>
                <p v-if="app.personalInfo?.phoneNumber">
                  📱 {{ app.personalInfo.phoneNumber }}
                </p>
                <p v-if="app.professionalInfo?.occupation">
                  💼 {{ app.professionalInfo.occupation }}
                </p>
              </div>

              <div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>รหัส: {{ app.id }}</span>
                <span v-if="app.submittedAt">
                  ส่ง: {{ formatDate(app.submittedAt) }}
                </span>
                <span v-else>
                  สร้าง: {{ formatDate(app.createdAt) }}
                </span>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              <!-- Completion -->
              <div class="text-right">
                <div class="text-2xl font-bold text-primary">
                  {{ applicationStore.getCompletionPercentage(app) }}%
                </div>
                <div class="text-xs text-gray-600">เสร็จสมบูรณ์</div>
              </div>

              <!-- Action buttons -->
              <div class="flex gap-2">
                <!-- View button -->
                <button
                  class="btn-outline btn-sm"
                  @click.stop="viewApplication(app.id)"
                >
                  <Eye :size="16" class="mr-1" />
                  ดูรายละเอียด
                </button>

                <!-- Delete button -->
                <button
                  class="px-3 py-1.5 text-sm font-semibold rounded-lung border-2 border-red-600 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  @click.stop="handleDeleteApplication(app.id, `${app.personalInfo?.firstName} ${app.personalInfo?.lastName}`)"
                  :disabled="deleting === app.id"
                  title="ลบใบสมัคร"
                >
                  <Trash2 :size="16" />
                  {{ deleting === app.id ? 'กำลังลบ...' : 'ลบ' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Review notes if any -->
          <div v-if="app.reviewNotes" class="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p class="text-sm text-yellow-800">
              <strong>หมายเหตุ:</strong> {{ app.reviewNotes }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="card p-12 text-center">
        <Users :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">
          ไม่มีใบสมัคร
        </h3>
        <p class="text-gray-600">
          {{ selectedStatus === 'all' ? 'ยังไม่มีใบสมัครในระบบ' : `ไม่มีใบสมัครที่มีสถานะ "${statusOptions.find(o => o.value === selectedStatus)?.label}"` }}
        </p>
      </div>
    </div>
  </div>
</template>
