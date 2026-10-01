<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import type { PartnerApplication, PersonalInfo } from '~/types/application'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'

const props = defineProps<{
  application: PartnerApplication | null
}>()

const emit = defineEmits<{
  next: []
}>()

const applicationStore = usePartnerApplicationStore()

const form = reactive<PersonalInfo>({
  firstName: props.application?.personalInfo?.firstName || '',
  lastName: props.application?.personalInfo?.lastName || '',
  dateOfBirth: props.application?.personalInfo?.dateOfBirth || '',
  gender: props.application?.personalInfo?.gender || 'male',
  phoneNumber: props.application?.personalInfo?.phoneNumber || '',
  email: props.application?.personalInfo?.email || '',
  lineId: props.application?.personalInfo?.lineId || '',
  address: props.application?.personalInfo?.address || '',
  district: props.application?.personalInfo?.district || '',
  province: props.application?.personalInfo?.province || '',
  postalCode: props.application?.personalInfo?.postalCode || '',
  emergencyContact: {
    name: props.application?.personalInfo?.emergencyContact?.name || '',
    relationship: props.application?.personalInfo?.emergencyContact?.relationship || '',
    phoneNumber: props.application?.personalInfo?.emergencyContact?.phoneNumber || ''
  }
})

const isValid = computed(() => {
  return form.firstName && form.lastName && form.dateOfBirth &&
         form.phoneNumber && form.email && form.address &&
         form.district && form.province && form.postalCode &&
         form.emergencyContact.name && form.emergencyContact.phoneNumber
})

async function handleSubmit() {
  if (!isValid.value || !props.application) return

  await applicationStore.savePersonalInfo(props.application.id, form)
  emit('next')
}
</script>

<template>
  <div class="card p-6 md:p-8">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Personal Information -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ข้อมูลส่วนตัว</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ชื่อ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.firstName"
              type="text"
              class="input-lung"
              placeholder="ชื่อ"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              นามสกุล <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.lastName"
              type="text"
              class="input-lung"
              placeholder="นามสกุล"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              วันเกิด <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.dateOfBirth"
              type="date"
              class="input-lung"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              เพศ <span class="text-red-500">*</span>
            </label>
            <select v-model="form.gender" class="input-lung" required>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ข้อมูลการติดต่อ</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              เบอร์โทรศัพท์ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.phoneNumber"
              type="tel"
              class="input-lung"
              placeholder="08X-XXX-XXXX"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              อีเมล <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              class="input-lung"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              LINE ID (ถ้ามี)
            </label>
            <input
              v-model="form.lineId"
              type="text"
              class="input-lung"
              placeholder="@yourlineid"
            />
          </div>
        </div>
      </div>

      <!-- Address -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ที่อยู่</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ที่อยู่ <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.address"
              class="input-lung"
              rows="3"
              placeholder="บ้านเลขที่ ถนน ซอย"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-dark mb-2">
                เขต/อำเภอ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.district"
                type="text"
                class="input-lung"
                placeholder="เขต/อำเภอ"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-dark mb-2">
                จังหวัด <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.province"
                type="text"
                class="input-lung"
                placeholder="จังหวัด"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-dark mb-2">
                รหัสไปรษณีย์ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.postalCode"
                type="text"
                class="input-lung"
                placeholder="10XXX"
                maxlength="5"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ผู้ติดต่อฉุกเฉิน</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ชื่อ-นามสกุล <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.emergencyContact.name"
              type="text"
              class="input-lung"
              placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ความสัมพันธ์ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.emergencyContact.relationship"
              type="text"
              class="input-lung"
              placeholder="เช่น พ่อ แม่ พี่ น้อง"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              เบอร์โทรศัพท์ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.emergencyContact.phoneNumber"
              type="tel"
              class="input-lung"
              placeholder="08X-XXX-XXXX"
              required
            />
          </div>
        </div>
      </div>

      <!-- Submit button -->
      <div class="flex justify-end pt-4 border-t">
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
