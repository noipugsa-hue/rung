<script setup lang="ts">
import { Bell, Lock, Globe, Eye, Shield, Trash2, ArrowLeft, Save } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

const settings = ref({
  notifications: {
    email: true,
    push: true,
    bookings: true,
    messages: true,
    marketing: false,
  },
  privacy: {
    showProfile: true,
    showLocation: true,
    showReviews: true,
  },
  language: 'th',
})

const saving = ref(false)
const successMessage = ref('')

const handleSave = async () => {
  saving.value = true
  successMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    successMessage.value = 'บันทึกการตั้งค่าสำเร็จ'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Save error:', error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-4xl">
      <!-- Back button -->
      <button
        @click="router.push('/account')"
        class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-6"
      >
        <ArrowLeft :size="20" />
        <span>กลับ</span>
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          ตั้งค่า
        </h1>
        <p class="text-gray-600">จัดการการตั้งค่าและความเป็นส่วนตัว</p>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lung text-green-700"
      >
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Notifications -->
        <div class="card p-6">
          <div class="flex items-center gap-3 mb-6">
            <Bell :size="24" class="text-primary" />
            <h2 class="text-xl font-bold text-dark">การแจ้งเตือน</h2>
          </div>

          <div class="space-y-4">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">แจ้งเตือนทางอีเมล</div>
                <div class="text-sm text-gray-600">รับการแจ้งเตือนผ่านอีเมล</div>
              </div>
              <input
                v-model="settings.notifications.email"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">แจ้งเตือนแบบ Push</div>
                <div class="text-sm text-gray-600">รับการแจ้งเตือนบนเบราว์เซอร์</div>
              </div>
              <input
                v-model="settings.notifications.push"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">การจอง</div>
                <div class="text-sm text-gray-600">แจ้งเตือนเมื่อมีการจองใหม่</div>
              </div>
              <input
                v-model="settings.notifications.bookings"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">ข้อความ</div>
                <div class="text-sm text-gray-600">แจ้งเตือนเมื่อมีข้อความใหม่</div>
              </div>
              <input
                v-model="settings.notifications.messages"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">ข่าวสารและโปรโมชั่น</div>
                <div class="text-sm text-gray-600">รับข่าวสารและข้อเสนอพิเศษ</div>
              </div>
              <input
                v-model="settings.notifications.marketing"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>
          </div>
        </div>

        <!-- Privacy -->
        <div class="card p-6">
          <div class="flex items-center gap-3 mb-6">
            <Eye :size="24" class="text-primary" />
            <h2 class="text-xl font-bold text-dark">ความเป็นส่วนตัว</h2>
          </div>

          <div class="space-y-4">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">แสดงโปรไฟล์</div>
                <div class="text-sm text-gray-600">อนุญาตให้ผู้อื่นดูโปรไฟล์ของคุณ</div>
              </div>
              <input
                v-model="settings.privacy.showProfile"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">แสดงตำแหน่ง</div>
                <div class="text-sm text-gray-600">แสดงเมืองที่คุณอยู่</div>
              </div>
              <input
                v-model="settings.privacy.showLocation"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="font-medium text-dark">แสดงรีวิว</div>
                <div class="text-sm text-gray-600">แสดงรีวิวที่คุณเขียนให้ผู้อื่นเห็น</div>
              </div>
              <input
                v-model="settings.privacy.showReviews"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>
          </div>
        </div>

        <!-- Language -->
        <div class="card p-6">
          <div class="flex items-center gap-3 mb-6">
            <Globe :size="24" class="text-primary" />
            <h2 class="text-xl font-bold text-dark">ภาษา</h2>
          </div>

          <select
            v-model="settings.language"
            class="w-full px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
          >
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </div>

        <!-- Security -->
        <div class="card p-6">
          <div class="flex items-center gap-3 mb-6">
            <Shield :size="24" class="text-primary" />
            <h2 class="text-xl font-bold text-dark">ความปลอดภัย</h2>
          </div>

          <div class="space-y-3">
            <button
              type="button"
              class="w-full btn-outline flex items-center justify-center gap-2"
            >
              <Lock :size="18" />
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card p-6 border-2 border-red-200">
          <div class="flex items-center gap-3 mb-6">
            <Trash2 :size="24" class="text-red-600" />
            <h2 class="text-xl font-bold text-red-600">โซนอันตราย</h2>
          </div>

          <p class="text-gray-600 mb-4">
            เมื่อคุณลบบัญชี ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวร
          </p>

          <button
            type="button"
            class="btn-outline border-red-600 text-red-600 hover:bg-red-50"
          >
            ลบบัญชี
          </button>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-4">
          <button
            type="button"
            @click="router.push('/account')"
            class="btn-outline flex-1"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="btn-primary flex-1 flex items-center justify-center gap-2"
            :class="{ 'opacity-50 cursor-wait': saving }"
          >
            <Save :size="20" />
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
