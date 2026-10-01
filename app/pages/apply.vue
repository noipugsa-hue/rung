<script setup lang="ts">
import { CheckCircle2, Circle } from 'lucide-vue-next'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import { useAuthStore } from '~/stores/auth'
import ApplicationStepOne from '~/components/ApplicationStepOne.vue'
import ApplicationStepTwo from '~/components/ApplicationStepTwo.vue'
import ApplicationStepThree from '~/components/ApplicationStepThree.vue'
import ApplicationStepFour from '~/components/ApplicationStepFour.vue'
import ApplicationStepFive from '~/components/ApplicationStepFive.vue'

definePageMeta({
  middleware: 'auth'
})

const applicationStore = usePartnerApplicationStore()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const currentStep = ref(1)

const steps = [
  { number: 1, title: 'ข้อมูลส่วนตัว', component: ApplicationStepOne },
  { number: 2, title: 'ข้อมูลอาชีพและรูปภาพ', component: ApplicationStepTwo },
  { number: 3, title: 'เอกสารประกอบ', component: ApplicationStepThree },
  { number: 4, title: 'ข้อมูลการเงิน', component: ApplicationStepFour },
  { number: 5, title: 'ตรวจสอบประวัติ', component: ApplicationStepFive }
]

// Initialize application on mount
onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    // Initialize or get existing draft application
    const app = await applicationStore.initializeApplication(authStore.user.id)
    currentStep.value = app.currentStep
    console.log('✅ Application initialized:', app.id)
  } catch (error) {
    console.error('❌ Failed to initialize application:', error)
    alert('เกิดข้อผิดพลาดในการโหลดใบสมัคร กรุณาลองใหม่อีกครั้ง')
  } finally {
    loading.value = false
  }
})

const application = computed(() => applicationStore.currentApplication)

// Sync currentStep with application's currentStep
watch(() => application.value?.currentStep, (newStep) => {
  if (newStep && newStep > currentStep.value) {
    currentStep.value = newStep
  }
})

function goToStep(step: number) {
  if (!application.value) return

  // Can only go to completed steps or the next step
  if (step <= application.value.currentStep) {
    currentStep.value = step
  }
}

function nextStep() {
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function handleSubmit() {
  if (!application.value) return

  const confirmed = confirm('ยืนยันการส่งใบสมัคร?\nเมื่อส่งแล้วจะไม่สามารถแก้ไขได้')
  if (!confirmed) return

  try {
    await applicationStore.submitApplication(application.value.id)
    alert('ส่งใบสมัครสำเร็จ!\nทีมงานจะตรวจสอบและติดต่อกลับภายใน 3-5 วันทำการ')
    router.push('/partner/dashboard')
  } catch (error: any) {
    alert(error.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร')
  }
}

const canSubmit = computed(() => {
  return application.value?.completedSteps.length === 5
})
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-lung max-w-4xl">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังโหลด...</p>
      </div>

      <!-- Application Form -->
      <div v-else-if="application">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
            สมัครเป็นพาร์ทเนอร์ลุง
          </h1>
          <p class="text-gray-600">
            กรอกข้อมูลให้ครบทั้ง 5 ขั้นตอนเพื่อสมัครเป็นพาร์ทเนอร์
          </p>
        </div>

        <!-- Progress Steps -->
        <div class="card p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div
              v-for="(step, index) in steps"
              :key="step.number"
              class="flex-1 flex items-center"
            >
              <!-- Step Circle -->
              <button
                @click="goToStep(step.number)"
                class="flex flex-col items-center flex-shrink-0"
                :class="step.number <= application.currentStep ? 'cursor-pointer' : 'cursor-not-allowed'"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors"
                  :class="[
                    application.completedSteps.includes(step.number)
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-primary text-dark'
                      : step.number <= application.currentStep
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
                  ]"
                >
                  <CheckCircle2 v-if="application.completedSteps.includes(step.number)" :size="20" />
                  <span v-else>{{ step.number }}</span>
                </div>
                <span
                  class="text-xs font-medium text-center hidden md:block"
                  :class="currentStep === step.number ? 'text-dark' : 'text-gray-600'"
                >
                  {{ step.title }}
                </span>
              </button>

              <!-- Connector Line -->
              <div
                v-if="index < steps.length - 1"
                class="flex-1 h-1 mx-2"
                :class="application.completedSteps.includes(step.number) ? 'bg-green-500' : 'bg-gray-200'"
              />
            </div>
          </div>

          <!-- Current Step Title (Mobile) -->
          <div class="md:hidden text-center">
            <p class="font-semibold text-dark">
              {{ steps[currentStep - 1].title }}
            </p>
          </div>
        </div>

        <!-- Step Content -->
        <div class="card p-6 md:p-8 mb-6">
          <component
            :is="steps[currentStep - 1].component"
            :application="application"
            @next="nextStep"
            @previous="previousStep"
          />
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between gap-4">
          <button
            v-if="currentStep > 1"
            @click="previousStep"
            class="btn-outline"
          >
            ← ย้อนกลับ
          </button>
          <div v-else />

          <div class="flex gap-4">
            <button
              v-if="currentStep < 5"
              @click="nextStep"
              class="btn-primary"
            >
              ถัดไป →
            </button>

            <button
              v-else
              @click="handleSubmit"
              :disabled="!canSubmit || applicationStore.loading"
              class="btn-primary"
              :class="{ 'opacity-50 cursor-not-allowed': !canSubmit || applicationStore.loading }"
            >
              {{ applicationStore.loading ? 'กำลังส่ง...' : 'ส่งใบสมัคร ✓' }}
            </button>
          </div>
        </div>

        <!-- Completion Message -->
        <div v-if="canSubmit && currentStep === 5" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lung">
          <p class="text-green-800 font-semibold text-center">
            ✓ กรอกข้อมูลครบทุกขั้นตอนแล้ว พร้อมส่งใบสมัคร!
          </p>
        </div>

        <!-- Warning Message -->
        <div v-else-if="currentStep === 5" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lung">
          <p class="text-yellow-800 font-semibold text-center">
            ⚠️ กรุณากรอกข้อมูลให้ครบทุกขั้นตอนก่อนส่งใบสมัคร
          </p>
          <p class="text-yellow-700 text-sm text-center mt-2">
            เสร็จสิ้น: {{ application.completedSteps.length }} / 5 ขั้นตอน
          </p>
        </div>

        <!-- Application ID -->
        <div class="mt-6 text-center text-sm text-gray-500">
          รหัสใบสมัคร: {{ application.id }}
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-red-600 mb-4">ไม่สามารถโหลดใบสมัครได้</p>
        <button @click="router.push('/')" class="btn-outline">
          กลับหน้าแรก
        </button>
      </div>
    </div>
  </div>
</template>
