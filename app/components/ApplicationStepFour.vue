<script setup lang="ts">
import { ArrowLeft, ArrowRight, Lock } from 'lucide-vue-next'
import type { PartnerApplication, FinancialInfo } from '~/types/application'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'

const props = defineProps<{
  application: PartnerApplication | null
}>()

const emit = defineEmits<{
  next: []
  prev: []
}>()

const applicationStore = usePartnerApplicationStore()

const form = reactive<FinancialInfo>({
  bankName: props.application?.financialInfo?.bankName || '',
  accountNumber: props.application?.financialInfo?.accountNumber || '',
  accountName: props.application?.financialInfo?.accountName || '',
  taxId: props.application?.financialInfo?.taxId || '',
  preferredPayoutFrequency: props.application?.financialInfo?.preferredPayoutFrequency || 'monthly'
})

const bankOptions = [
  'ธนาคารกรุงเทพ',
  'ธนาคารกสิกรไทย',
  'ธนาคารกรุงไทย',
  'ธนาคารทหารไทยธนชาต',
  'ธนาคารไทยพาณิชย์',
  'ธนาคารกรุงศรีอยุธยา',
  'ธนาคารเกียรตินาคินภัทร',
  'ธนาคารซีไอเอ็มบีไทย',
  'ธนาคารทิสโก้',
  'ธนาคารยูโอบี',
  'ธนาคารธนชาต',
  'ธนาคารแลนด์ แอนด์ เฮ้าส์',
  'ธนาคารไอซีบีซี (ไทย)',
  'ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร',
  'ธนาคารออมสิน',
  'ธนาคารอาคารสงเคราะห์'
]

const isValid = computed(() => {
  return form.bankName && form.accountNumber && form.accountName &&
         form.accountNumber.length >= 10
})

async function handleSubmit() {
  if (!isValid.value || !props.application) return

  await applicationStore.saveFinancialInfo(props.application.id, form)
  emit('next')
}
</script>

<template>
  <div class="card p-6 md:p-8">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Security notice -->
      <div class="bg-green-50 border-l-4 border-green-400 p-4">
        <div class="flex items-start gap-3">
          <Lock :size="20" class="text-green-600 mt-0.5" />
          <div class="text-sm text-green-800">
            <p class="font-semibold mb-1">ข้อมูลของคุณปลอดภัย</p>
            <p>ข้อมูลการเงินของคุณจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย ใช้เพื่อการโอนเงินค่าบริการเท่านั้น</p>
          </div>
        </div>
      </div>

      <!-- Bank Information -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ข้อมูลบัญชีธนาคาร</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ธนาคาร <span class="text-red-500">*</span>
            </label>
            <select v-model="form.bankName" class="input-lung" required>
              <option value="">เลือกธนาคาร</option>
              <option v-for="bank in bankOptions" :key="bank" :value="bank">
                {{ bank }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              เลขที่บัญชี <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.accountNumber"
              type="text"
              class="input-lung"
              placeholder="XXX-X-XXXXX-X"
              maxlength="15"
              required
            />
            <p class="text-xs text-gray-600 mt-1">
              กรุณากรอกเลขที่บัญชีโดยไม่ต้องมีขีด (-)
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ชื่อบัญชี <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.accountName"
              type="text"
              class="input-lung"
              placeholder="ชื่อ-นามสกุล ตามบัญชีธนาคาร"
              required
            />
            <p class="text-xs text-gray-600 mt-1">
              ต้องตรงกับชื่อในบัตรประชาชน
            </p>
          </div>
        </div>
      </div>

      <!-- Tax Information (Optional) -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ข้อมูลภาษี (ถ้ามี)</h3>
        <div>
          <label class="block text-sm font-semibold text-dark mb-2">
            เลขประจำตัวผู้เสียภาษี
          </label>
          <input
            v-model="form.taxId"
            type="text"
            class="input-lung"
            placeholder="X-XXXX-XXXXX-XX-X"
            maxlength="13"
          />
          <p class="text-xs text-gray-600 mt-1">
            สำหรับออกใบเสร็จรับเงิน/ใบกำกับภาษี (ถ้าต้องการ)
          </p>
        </div>
      </div>

      <!-- Payout Frequency -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ความถี่ในการรับเงิน</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lung transition-colors"
            :class="form.preferredPayoutFrequency === 'weekly' ? 'border-primary bg-cream' : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              v-model="form.preferredPayoutFrequency"
              type="radio"
              value="weekly"
              class="w-5 h-5"
            />
            <div>
              <div class="font-semibold text-dark">รายสัปดาห์</div>
              <div class="text-sm text-gray-600">รับเงินทุกวันจันทร์</div>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lung transition-colors"
            :class="form.preferredPayoutFrequency === 'biweekly' ? 'border-primary bg-cream' : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              v-model="form.preferredPayoutFrequency"
              type="radio"
              value="biweekly"
              class="w-5 h-5"
            />
            <div>
              <div class="font-semibold text-dark">2 สัปดาห์ครั้ง</div>
              <div class="text-sm text-gray-600">รับเงินทุก 2 สัปดาห์</div>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lung transition-colors"
            :class="form.preferredPayoutFrequency === 'monthly' ? 'border-primary bg-cream' : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              v-model="form.preferredPayoutFrequency"
              type="radio"
              value="monthly"
              class="w-5 h-5"
            />
            <div>
              <div class="font-semibold text-dark">รายเดือน</div>
              <div class="text-sm text-gray-600">รับเงินวันที่ 1 ของทุกเดือน</div>
            </div>
          </label>
        </div>
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
          type="submit"
          :disabled="!isValid"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !isValid }"
        >
          บันทึกและไปขั้นตอนถัดไป
          <ArrowRight :size="20" class="ml-2" />
        </button>
      </div>
    </form>
  </div>
</template>
