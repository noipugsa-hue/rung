<script setup lang="ts">
import { CheckCircle2, Clock, FileText, User, Briefcase, Upload, CreditCard, Shield } from 'lucide-vue-next'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const applicationStore = usePartnerApplicationStore()
const authStore = useAuthStore()

const application = ref<any>(null)
const loadingApp = ref(false)

// Load application on mount
onMounted(async () => {
  if (!authStore.user) return

  loadingApp.value = true
  try {
    application.value = await applicationStore.getUserApplication(authStore.user.id)
  } catch (error) {
    console.error('Failed to load application:', error)
  } finally {
    loadingApp.value = false
  }
})

const completionPercentage = computed(() => {
  if (!application.value) return 0
  return applicationStore.getCompletionPercentage(application.value)
})

const steps = [
  {
    number: 1,
    title: 'ข้อมูลส่วนตัว',
    description: 'ข้อมูลพื้นฐานและการติดต่อ',
    icon: User,
    completed: computed(() => application.value?.completedSteps.includes(1))
  },
  {
    number: 2,
    title: 'ข้อมูลอาชีพ',
    description: 'ประสบการณ์และทักษะ',
    icon: Briefcase,
    completed: computed(() => application.value?.completedSteps.includes(2))
  },
  {
    number: 3,
    title: 'เอกสารประกอบ',
    description: 'อัพโหลดเอกสารยืนยันตัวตน',
    icon: Upload,
    completed: computed(() => application.value?.completedSteps.includes(3))
  },
  {
    number: 4,
    title: 'ข้อมูลการเงิน',
    description: 'บัญชีธนาคารสำหรับรับเงิน',
    icon: CreditCard,
    completed: computed(() => application.value?.completedSteps.includes(4))
  },
  {
    number: 5,
    title: 'ตรวจสอบประวัติ',
    description: 'การตรวจสอบและเอกสารอ้างอิง',
    icon: Shield,
    completed: computed(() => application.value?.completedSteps.includes(5))
  }
]

const statusText = computed(() => {
  if (!application.value) return { text: 'เริ่มใบสมัคร', color: 'text-primary' }

  switch (application.value.status) {
    case 'draft':
      return { text: 'ร่าง', color: 'text-gray-600' }
    case 'submitted':
      return { text: 'ส่งแล้ว - รอการตรวจสอบ', color: 'text-blue-600' }
    case 'under_review':
      return { text: 'กำลังตรวจสอบ', color: 'text-yellow-600' }
    case 'approved':
      return { text: 'อนุมัติแล้ว', color: 'text-green-600' }
    case 'rejected':
      return { text: 'ไม่ผ่านการอนุมัติ', color: 'text-red-600' }
    case 'revision_required':
      return { text: 'ต้องแก้ไข', color: 'text-orange-600' }
    default:
      return { text: 'เริ่มใบสมัคร', color: 'text-primary' }
  }
})

async function startApplication() {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    const app = await applicationStore.initializeApplication(authStore.user.id)
    application.value = app
    router.push(`/apply/${app.currentStep}`)
  } catch (error) {
    console.error('Failed to start application:', error)
  }
}

function continueApplication() {
  if (application.value) {
    router.push(`/apply/${application.value.currentStep}`)
  }
}

async function goToStep(stepNumber: number) {
  if (!application.value) {
    await startApplication()
    return
  }
  router.push(`/apply/${stepNumber}`)
}
</script>

<template>
  <div class="py-12">
    <div class="container-lung max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-4">
          สมัครเป็น LUNG
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          เริ่มต้นการเดินทางของคุณในการเป็นพี่เลี้ยงมืออาชีพ
          กรอกข้อมูลในแบบฟอร์ม 5 ขั้นตอนเพื่อเริ่มต้น
        </p>
      </div>

      <!-- Application Status -->
      <div v-if="application" class="card p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-dark">สถานะใบสมัคร</h3>
            <p :class="['text-sm font-semibold', statusText.color]">
              {{ statusText.text }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-primary">{{ completionPercentage }}%</div>
            <div class="text-sm text-gray-600">เสร็จสมบูรณ์</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            class="bg-primary h-3 rounded-full transition-all duration-300"
            :style="{ width: `${completionPercentage}%` }"
          />
        </div>

        <!-- Review notes if any -->
        <div v-if="application.reviewNotes" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p class="text-sm font-semibold text-yellow-800 mb-1">หมายเหตุจากผู้ตรวจสอบ:</p>
          <p class="text-sm text-yellow-700">{{ application.reviewNotes }}</p>
        </div>

        <!-- Action button -->
        <button
          v-if="application.status === 'draft' || application.status === 'revision_required'"
          @click="continueApplication"
          class="btn-primary w-full"
        >
          {{ application.status === 'revision_required' ? 'แก้ไขใบสมัคร' : 'ดำเนินการต่อ' }}
        </button>

        <div v-else-if="application.status === 'approved'" class="text-center">
          <CheckCircle2 :size="48" class="text-green-600 mx-auto mb-2" />
          <p class="text-green-600 font-semibold">ยินดีด้วย! คุณได้รับการอนุมัติแล้ว</p>
          <NuxtLink to="/partner/dashboard" class="btn-primary mt-4 inline-block">
            ไปที่แดชบอร์ด
          </NuxtLink>
        </div>

        <div v-else-if="application.status === 'submitted' || application.status === 'under_review'" class="text-center">
          <Clock :size="48" class="text-blue-600 mx-auto mb-2" />
          <p class="text-blue-600 font-semibold">ใบสมัครของคุณกำลังอยู่ระหว่างการตรวจสอบ</p>
          <p class="text-sm text-gray-600 mt-2">เราจะแจ้งให้คุณทราบผ่านอีเมลภายใน 3-5 วันทำการ</p>
        </div>
      </div>

      <!-- Steps -->
      <div class="space-y-4 mb-8">
        <div
          v-for="step in steps"
          :key="step.number"
          class="card p-6 cursor-pointer transition-all hover:shadow-lg"
          :class="{
            'border-2 border-primary': application?.currentStep === step.number,
            'opacity-60': application && application.status !== 'draft' && application.status !== 'revision_required'
          }"
          @click="goToStep(step.number)"
        >
          <div class="flex items-center gap-4">
            <!-- Step icon -->
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
              :class="step.completed.value ? 'bg-green-100' : 'bg-cream'"
            >
              <CheckCircle2
                v-if="step.completed.value"
                :size="32"
                class="text-green-600"
              />
              <component
                v-else
                :is="step.icon"
                :size="32"
                :class="application?.currentStep === step.number ? 'text-primary' : 'text-gray-600'"
              />
            </div>

            <!-- Step info -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-semibold text-gray-500">ขั้นตอนที่ {{ step.number }}</span>
                <span
                  v-if="step.completed.value"
                  class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
                >
                  เสร็จแล้ว
                </span>
              </div>
              <h3 class="text-lg font-bold text-dark">{{ step.title }}</h3>
              <p class="text-sm text-gray-600">{{ step.description }}</p>
            </div>

            <!-- Arrow -->
            <div class="text-gray-400">
              →
            </div>
          </div>
        </div>
      </div>

      <!-- Start button if no application -->
      <div v-if="!application" class="text-center">
        <button @click="startApplication" class="btn-primary btn-lg">
          <FileText :size="20" class="mr-2" />
          เริ่มใบสมัคร
        </button>
      </div>

      <!-- Requirements -->
      <div class="card p-6 bg-cream mt-8">
        <h3 class="font-bold text-dark mb-4">สิ่งที่คุณต้องเตรียม</h3>
        <ul class="space-y-2 text-sm text-gray-700">
          <li>✓ บัตรประชาชนหรือบัตรประจำตัวที่มีรูปถ่าย</li>
          <li>✓ รูปถ่ายของคุณ (สำหรับโปรไฟล์)</li>
          <li>✓ เลขบัญชีธนาคาร (สำหรับรับเงิน)</li>
          <li>✓ ข้อมูลผู้ติดต่อฉุกเฉิน</li>
          <li>✓ ข้อมูลผู้อ้างอิง (2-3 คน)</li>
          <li>✓ เวลาประมาณ 15-20 นาทีสำหรับกรอกข้อมูล</li>
        </ul>
      </div>
    </div>
  </div>
</template>
