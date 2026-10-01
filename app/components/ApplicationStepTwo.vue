<script setup lang="ts">
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-vue-next'
import type { PartnerApplication, ProfessionalInfo, ProfileImage } from '~/types/application'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import ProfileImageUploader from '~/components/ProfileImageUploader.vue'
import ProfileImageUploaderSimple from '~/components/ProfileImageUploaderSimple.vue'

const props = defineProps<{
  application: PartnerApplication | null
}>()

const emit = defineEmits<{
  next: []
  prev: []
}>()

const applicationStore = usePartnerApplicationStore()
const profileImages = ref<ProfileImage[]>(props.application?.profileImages || [])
const useSimpleUploader = ref(true) // Use URL-based uploader by default
const saveError = ref('')
const isSaving = ref(false)

const form = reactive<ProfessionalInfo>({
  occupation: props.application?.professionalInfo?.occupation || '',
  education: props.application?.professionalInfo?.education || '',
  languages: props.application?.professionalInfo?.languages || ['ไทย'],
  specialSkills: props.application?.professionalInfo?.specialSkills || [],
  experience: props.application?.professionalInfo?.experience || '',
  availability: {
    weekdays: props.application?.professionalInfo?.availability?.weekdays ?? true,
    weekends: props.application?.professionalInfo?.availability?.weekends ?? true,
    evenings: props.application?.professionalInfo?.availability?.evenings ?? false
  },
  preferredActivities: props.application?.professionalInfo?.preferredActivities || [],
  willingToTravel: props.application?.professionalInfo?.willingToTravel ?? false,
  hasVehicle: props.application?.professionalInfo?.hasVehicle ?? false,
  vehicleType: props.application?.professionalInfo?.vehicleType || ''
})

const newLanguage = ref('')
const newSkill = ref('')
const newActivity = ref('')

const languageOptions = ['ไทย', 'อังกฤษ', 'จีน', 'ญี่ปุ่น', 'เกาหลี', 'ฝรั่งเศส', 'เยอรมัน', 'สเปน']
const activityOptions = [
  'เดินเที่ยว',
  'ถ่ายภาพ',
  'ทำอาหาร',
  'กีฬา',
  'ศิลปะและงานฝีมือ',
  'ดนตรี',
  'ช้อปปิ้ง',
  'เกม',
  'ท่องเที่ยวธรรมชาติ',
  'อาหารและร้านอาหาร'
]

function addLanguage() {
  if (newLanguage.value && !form.languages.includes(newLanguage.value)) {
    form.languages.push(newLanguage.value)
    newLanguage.value = ''
  }
}

function removeLanguage(lang: string) {
  form.languages = form.languages.filter(l => l !== lang)
}

function addSkill() {
  if (newSkill.value && !form.specialSkills.includes(newSkill.value)) {
    form.specialSkills.push(newSkill.value)
    newSkill.value = ''
  }
}

function removeSkill(skill: string) {
  form.specialSkills = form.specialSkills.filter(s => s !== skill)
}

function toggleActivity(activity: string) {
  const index = form.preferredActivities.indexOf(activity)
  if (index > -1) {
    form.preferredActivities.splice(index, 1)
  } else {
    form.preferredActivities.push(activity)
  }
}

const isValid = computed(() => {
  const hasRequiredInfo = form.occupation && form.education && form.languages.length > 0 &&
         form.experience && form.preferredActivities.length > 0

  // Must have at least 1 image with a primary image
  const hasImages = profileImages.value.length > 0
  const hasPrimary = profileImages.value.some(img => img.isPrimary)

  return hasRequiredInfo && hasImages && hasPrimary
})

function handleImageUpload(image: ProfileImage) {
  profileImages.value.push(image)
}

function handleImageDelete(storagePath: string) {
  profileImages.value = profileImages.value.filter(img => img.storagePath !== storagePath)
}

function handleSetPrimary(url: string) {
  profileImages.value = profileImages.value.map(img => ({
    ...img,
    isPrimary: img.url === url
  }))
}

async function handleSubmit() {
  if (!isValid.value || !props.application) return

  saveError.value = ''
  isSaving.value = true

  try {
    console.log('📝 Saving professional info with', profileImages.value.length, 'images')
    await applicationStore.saveProfessionalInfo(props.application.id, form, profileImages.value)
    console.log('✅ Professional info saved successfully')
    emit('next')
  } catch (error: any) {
    console.error('❌ Failed to save professional info:', error)
    saveError.value = error.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'

    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="card p-6 md:p-8">
    <!-- Save Error Message -->
    <div
      v-if="saveError"
      class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3"
    >
      <div class="flex-1">
        <p class="font-semibold mb-1">เกิดข้อผิดพลาดในการบันทึก</p>
        <p class="text-sm">{{ saveError }}</p>
      </div>
      <button
        type="button"
        @click="saveError = ''"
        class="text-red-700 hover:text-red-900"
      >
        <X :size="18" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Professional Background -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ข้อมูลอาชีพ</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              อาชีพปัจจุบัน <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.occupation"
              type="text"
              class="input-lung"
              placeholder="เช่น นักศึกษา พนักงานออฟฟิศ ฟรีแลนซ์"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              การศึกษา <span class="text-red-500">*</span>
            </label>
            <select v-model="form.education" class="input-lung" required>
              <option value="">เลือกระดับการศึกษา</option>
              <option value="มัธยมศึกษา">มัธยมศึกษา</option>
              <option value="ปวช./ปวส.">ปวช./ปวส.</option>
              <option value="ปริญญาตรี">ปริญญาตรี</option>
              <option value="ปริญญาโท">ปริญญาโท</option>
              <option value="ปริญญาเอก">ปริญญาเอก</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ประสบการณ์ที่เกี่ยวข้อง <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.experience"
              class="input-lung"
              rows="4"
              placeholder="บอกเล่าประสบการณ์ที่คุณคิดว่าจะช่วยให้คุณเป็นพี่เลี้ยงที่ดี เช่น ดูแลน้องในครอบครัว เป็นมัคคุเทศก์ ฯลฯ"
              required
            />
          </div>
        </div>
      </div>

      <!-- Languages -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">
          ภาษาที่ใช้ได้ <span class="text-red-500">*</span>
        </h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="lang in form.languages"
            :key="lang"
            class="px-3 py-1 bg-primary rounded-full text-sm font-semibold flex items-center gap-2"
          >
            {{ lang }}
            <button
              type="button"
              @click="removeLanguage(lang)"
              class="hover:text-red-600"
            >
              <X :size="16" />
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <select v-model="newLanguage" class="input-lung flex-1">
            <option value="">เลือกภาษา</option>
            <option v-for="lang in languageOptions" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
          <button
            type="button"
            @click="addLanguage"
            class="btn-outline"
          >
            <Plus :size="20" />
          </button>
        </div>
      </div>

      <!-- Special Skills -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">ทักษะพิเศษ</h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="skill in form.specialSkills"
            :key="skill"
            class="px-3 py-1 bg-cream rounded-full text-sm font-semibold flex items-center gap-2"
          >
            {{ skill }}
            <button
              type="button"
              @click="removeSkill(skill)"
              class="hover:text-red-600"
            >
              <X :size="16" />
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="newSkill"
            type="text"
            class="input-lung flex-1"
            placeholder="เช่น ถ่ายภาพ ทำอาหาร พูดภาษาอังกฤษ"
            @keyup.enter="addSkill"
          />
          <button
            type="button"
            @click="addSkill"
            class="btn-outline"
          >
            <Plus :size="20" />
          </button>
        </div>
      </div>

      <!-- Preferred Activities -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">
          กิจกรรมที่คุณชอบและถนัด <span class="text-red-500">*</span>
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="activity in activityOptions"
            :key="activity"
            type="button"
            @click="toggleActivity(activity)"
            class="p-3 rounded-lung border-2 transition-all text-left"
            :class="
              form.preferredActivities.includes(activity)
                ? 'border-primary bg-cream font-semibold'
                : 'border-gray-200 hover:border-gray-300'
            "
          >
            {{ activity }}
          </button>
        </div>
      </div>

      <!-- Availability -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">เวลาว่าง</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.availability.weekdays"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>วันธรรมดา (จันทร์-ศุกร์)</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.availability.weekends"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>วันหยุดสุดสัปดาห์ (เสาร์-อาทิตย์)</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.availability.evenings"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>ช่วงเย็น (หลัง 18:00 น.)</span>
          </label>
        </div>
      </div>

      <!-- Travel & Vehicle -->
      <div>
        <h3 class="text-lg font-bold text-dark mb-4">การเดินทาง</h3>
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.willingToTravel"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>ยินดีเดินทางไปต่างจังหวัด</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.hasVehicle"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>มีพาหนะส่วนตัว</span>
          </label>

          <div v-if="form.hasVehicle">
            <label class="block text-sm font-semibold text-dark mb-2">
              ประเภทพาหนะ
            </label>
            <input
              v-model="form.vehicleType"
              type="text"
              class="input-lung"
              placeholder="เช่น รถยนต์ รถจักรยานยนต์"
            />
          </div>
        </div>
      </div>

      <!-- Profile Images -->
      <div class="border-t pt-6">
        <!-- Toggle between upload modes -->
        <div class="mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-700">โหมดเพิ่มรูป</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ useSimpleUploader ? 'ใส่ URL รูปภาพ (แนะนำถ้า Upload ไม่ได้)' : 'อัพโหลดไฟล์รูปภาพ' }}
            </p>
          </div>
          <button
            type="button"
            @click="useSimpleUploader = !useSimpleUploader"
            class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 rounded-lg transition-colors"
          >
            สลับเป็น {{ useSimpleUploader ? 'Upload ไฟล์' : 'ใส่ URL' }}
          </button>
        </div>

        <!-- Simple URL-based uploader -->
        <ProfileImageUploaderSimple
          v-if="application && useSimpleUploader"
          :images="profileImages"
          :application-id="application.id"
          :max-images="10"
          @upload="handleImageUpload"
          @delete="handleImageDelete"
          @set-primary="handleSetPrimary"
        />

        <!-- Original Firebase Storage uploader -->
        <ProfileImageUploader
          v-else-if="application"
          :images="profileImages"
          :application-id="application.id"
          :max-images="10"
          @upload="handleImageUpload"
          @delete="handleImageDelete"
          @set-primary="handleSetPrimary"
        />
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
          :disabled="!isValid || isSaving"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !isValid || isSaving }"
        >
          {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกและไปขั้นตอนถัดไป' }}
          <ArrowRight v-if="!isSaving" :size="20" class="ml-2" />
        </button>
      </div>
    </form>
  </div>
</template>
