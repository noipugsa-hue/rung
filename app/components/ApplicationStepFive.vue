<script setup lang="ts">
import { ArrowLeft, Send, Plus, X, CheckCircle2 } from 'lucide-vue-next'
import type { PartnerApplication, BackgroundCheck } from '~/types/application'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'

const props = defineProps<{
  application: PartnerApplication | null
}>()

const emit = defineEmits<{
  prev: []
}>()

const router = useRouter()
const applicationStore = usePartnerApplicationStore()

const form = reactive<BackgroundCheck>({
  hasConvictions: props.application?.backgroundCheck?.hasConvictions ?? false,
  convictionDetails: props.application?.backgroundCheck?.convictionDetails || '',
  hasMedicalConditions: props.application?.backgroundCheck?.hasMedicalConditions ?? false,
  medicalConditionDetails: props.application?.backgroundCheck?.medicalConditionDetails || '',
  references: props.application?.backgroundCheck?.references || [
    { name: '', relationship: '', phoneNumber: '', email: '' },
    { name: '', relationship: '', phoneNumber: '', email: '' }
  ],
  agreedToBackgroundCheck: props.application?.backgroundCheck?.agreedToBackgroundCheck ?? false,
  agreedToTerms: props.application?.backgroundCheck?.agreedToTerms ?? false
})

const submitted = ref(false)
const submitting = ref(false)

function addReference() {
  form.references.push({ name: '', relationship: '', phoneNumber: '', email: '' })
}

function removeReference(index: number) {
  if (form.references.length > 2) {
    form.references.splice(index, 1)
  }
}

const isValid = computed(() => {
  const hasValidReferences = form.references
    .slice(0, 2) // At least first 2 references
    .every(ref => ref.name && ref.phoneNumber)

  return hasValidReferences &&
         form.agreedToBackgroundCheck &&
         form.agreedToTerms &&
         (!form.hasConvictions || form.convictionDetails) &&
         (!form.hasMedicalConditions || form.medicalConditionDetails)
})

async function handleSubmit() {
  if (!isValid.value || !props.application || submitting.value) return

  submitting.value = true

  try {
    // Save background check
    await applicationStore.saveBackgroundCheck(props.application.id, form)

    // Submit application
    await applicationStore.submitApplication(props.application.id)

    submitted.value = true

    // Wait a bit then redirect
    setTimeout(() => {
      router.push('/apply')
    }, 3000)

  } catch (error) {
    console.error('Submission error:', error)
    alert('เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="submitted" class="card p-8 text-center">
    <div class="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 mx-auto">
      <CheckCircle2 :size="48" class="text-green-600" />
    </div>

    <h2 class="text-2xl font-bold text-dark mb-3">
      ส่งใบสมัครสำเร็จ!
    </h2>

    <p class="text-gray-600 mb-6 max-w-md mx-auto">
      ขอบคุณที่สมัครเป็น LUNG เราจะตรวจสอบใบสมัครของคุณและแจ้งผลภายใน 3-5 วันทำการ
      ผ่านทางอีเมลและ SMS
    </p>

    <p class="text-sm text-gray-500">
      กำลังนำคุณกลับไปหน้าภาพรวม...
    </p>
  </div>

  <div v-else class="card p-6 md:p-8">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Background Check -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ตรวจสอบประวัติ</h3>

        <div class="space-y-4">
          <!-- Criminal history -->
          <div class="p-4 border-2 border-gray-200 rounded-lung">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="form.hasConvictions"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="font-semibold text-dark">
                คุณเคยมีประวัติคดีอาญาหรือไม่?
              </span>
            </label>

            <div v-if="form.hasConvictions">
              <label class="block text-sm font-semibold text-dark mb-2">
                โปรดระบุรายละเอียด <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.convictionDetails"
                class="input-lung"
                rows="3"
                placeholder="กรุณาอธิบายรายละเอียดคดี"
                required
              />
            </div>
          </div>

          <!-- Medical conditions -->
          <div class="p-4 border-2 border-gray-200 rounded-lung">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="form.hasMedicalConditions"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="font-semibold text-dark">
                คุณมีโรคประจำตัวหรือภาวะทางสุขภาพที่ควรแจ้งให้ทราบหรือไม่?
              </span>
            </label>

            <div v-if="form.hasMedicalConditions">
              <label class="block text-sm font-semibold text-dark mb-2">
                โปรดระบุรายละเอียด <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.medicalConditionDetails"
                class="input-lung"
                rows="3"
                placeholder="กรุณาอธิบายภาวะทางสุขภาพ"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <!-- References -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-2">
          ผู้อ้างอิง <span class="text-red-500">*</span>
        </h3>
        <p class="text-sm text-gray-600 mb-4">
          กรุณาระบุบุคคลอ้างอิงอย่างน้อย 2 คน (ที่ไม่ใช่สมาชิกในครอบครัว)
        </p>

        <div class="space-y-4">
          <div
            v-for="(reference, index) in form.references"
            :key="index"
            class="p-4 border-2 border-gray-200 rounded-lung"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-dark">ผู้อ้างอิงคนที่ {{ index + 1 }}</h4>
              <button
                v-if="form.references.length > 2"
                type="button"
                @click="removeReference(index)"
                class="text-red-500 hover:text-red-700"
              >
                <X :size="20" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-dark mb-2">
                  ชื่อ-นามสกุล <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="reference.name"
                  type="text"
                  class="input-lung"
                  placeholder="ชื่อ-นามสกุล"
                  :required="index < 2"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-dark mb-2">
                  ความสัมพันธ์ <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="reference.relationship"
                  type="text"
                  class="input-lung"
                  placeholder="เช่น เพื่อน อาจารย์ นายจ้างเก่า"
                  :required="index < 2"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-dark mb-2">
                  เบอร์โทรศัพท์ <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="reference.phoneNumber"
                  type="tel"
                  class="input-lung"
                  placeholder="08X-XXX-XXXX"
                  :required="index < 2"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-dark mb-2">
                  อีเมล
                </label>
                <input
                  v-model="reference.email"
                  type="email"
                  class="input-lung"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          <button
            v-if="form.references.length < 5"
            type="button"
            @click="addReference"
            class="btn-outline w-full"
          >
            <Plus :size="20" class="mr-2" />
            เพิ่มผู้อ้างอิง
          </button>
        </div>
      </div>

      <!-- Agreements -->
      <div class="space-y-4 p-6 bg-cream rounded-lung">
        <h3 class="text-lg font-bold text-dark mb-4">การยินยอมและข้อตกลง</h3>

        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="form.agreedToBackgroundCheck"
            type="checkbox"
            class="w-5 h-5 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            required
          />
          <span class="text-sm text-gray-700">
            <span class="font-semibold text-dark">ฉันยินยอมให้ LUNG ตรวจสอบประวัติของฉัน</span>
            รวมถึงการติดต่อผู้อ้างอิง ตรวจสอบประวัติอาชญากรรม และข้อมูลอื่นๆ ที่จำเป็นสำหรับการพิจารณาใบสมัคร
            <span class="text-red-500">*</span>
          </span>
        </label>

        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="form.agreedToTerms"
            type="checkbox"
            class="w-5 h-5 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            required
          />
          <span class="text-sm text-gray-700">
            <span class="font-semibold text-dark">ฉันยอมรับ</span>
            <a href="/terms" target="_blank" class="text-primary hover:underline">เงื่อนไขการให้บริการ</a>
            และ
            <a href="/privacy" target="_blank" class="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>
            ของ LUNG และรับรองว่าข้อมูลทั้งหมดที่ให้ไว้เป็นความจริง
            <span class="text-red-500">*</span>
          </span>
        </label>
      </div>

      <!-- Important note -->
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p class="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> หลังจากส่งใบสมัคร เราจะตรวจสอบข้อมูลและติดต่อกลับภายใน 3-5 วันทำการ
          คุณสามารถตรวจสอบสถานะใบสมัครได้ทุกเวลาในหน้านี้
        </p>
      </div>

      <!-- Navigation buttons -->
      <div class="flex items-center justify-between pt-4 border-t">
        <button
          type="button"
          @click="emit('prev')"
          class="btn-outline"
          :disabled="submitting"
        >
          <ArrowLeft :size="20" class="mr-2" />
          ก่อนหน้า
        </button>

        <button
          type="submit"
          :disabled="!isValid || submitting"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !isValid || submitting }"
        >
          {{ submitting ? 'กำลังส่ง...' : 'ส่งใบสมัคร' }}
          <Send :size="20" class="ml-2" />
        </button>
      </div>
    </form>
  </div>
</template>
