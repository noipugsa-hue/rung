<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check } from 'lucide-vue-next'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const applicationStore = usePartnerApplicationStore()
const authStore = useAuthStore()

const currentStep = computed(() => parseInt(route.params.step as string))

const application = ref<any>(null)

// Initialize application if needed
onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    const app = await applicationStore.getUserApplication(authStore.user.id)
    if (!app) {
      application.value = await applicationStore.initializeApplication(authStore.user.id)
    } else {
      application.value = app
    }
  } catch (error) {
    console.error('Failed to load application:', error)
  }
})

const isStepCompleted = computed(() => {
  return application.value?.completedSteps.includes(currentStep.value) || false
})

const canNavigateNext = computed(() => {
  return currentStep.value < 5
})

const canNavigatePrev = computed(() => {
  return currentStep.value > 1
})

function goToStep(step: number) {
  router.push(`/apply/${step}`)
}

function nextStep() {
  if (canNavigateNext.value) {
    goToStep(currentStep.value + 1)
  }
}

function prevStep() {
  if (canNavigatePrev.value) {
    goToStep(currentStep.value - 1)
  }
}

function backToOverview() {
  router.push('/apply')
}

const stepTitle = computed(() => {
  const titles = [
    '', // 0 index
    'ข้อมูลส่วนตัว',
    'ข้อมูลอาชีพ',
    'เอกสารประกอบ',
    'ข้อมูลการเงิน',
    'ตรวจสอบประวัติ'
  ]
  return titles[currentStep.value] || ''
})
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="backToOverview"
          class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-4"
        >
          <ArrowLeft :size="20" />
          <span>กลับไปหน้าภาพรวม</span>
        </button>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">ขั้นตอนที่ {{ currentStep }} จาก 5</p>
            <h1 class="text-2xl md:text-3xl font-bold text-dark">
              {{ stepTitle }}
            </h1>
          </div>
          <div v-if="isStepCompleted" class="flex items-center gap-2 text-green-600">
            <Check :size="20" />
            <span class="text-sm font-semibold">เสร็จแล้ว</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-6 w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / 5) * 100}%` }"
          />
        </div>
      </div>

      <!-- Step content -->
      <div class="mb-8">
        <ApplicationStepOne
          v-if="currentStep === 1"
          :application="application"
          @next="nextStep"
        />
        <ApplicationStepTwo
          v-else-if="currentStep === 2"
          :application="application"
          @next="nextStep"
          @prev="prevStep"
        />
        <ApplicationStepThree
          v-else-if="currentStep === 3"
          :application="application"
          @next="nextStep"
          @prev="prevStep"
        />
        <ApplicationStepFour
          v-else-if="currentStep === 4"
          :application="application"
          @next="nextStep"
          @prev="prevStep"
        />
        <ApplicationStepFive
          v-else-if="currentStep === 5"
          :application="application"
          @prev="prevStep"
        />
      </div>

      <!-- Navigation (fallback if components don't handle it) -->
      <!-- <div class="flex items-center justify-between">
        <button
          v-if="canNavigatePrev"
          @click="prevStep"
          class="btn-outline"
        >
          <ArrowLeft :size="20" class="mr-2" />
          ก่อนหน้า
        </button>
        <div v-else></div>

        <button
          v-if="canNavigateNext"
          @click="nextStep"
          class="btn-primary"
        >
          ถัดไป
          <ArrowRight :size="20" class="ml-2" />
        </button>
      </div> -->
    </div>
  </div>
</template>
