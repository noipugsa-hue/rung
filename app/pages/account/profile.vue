<script setup lang="ts">
import { User, Mail, Phone, MapPin, Camera, Save, ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

// Profile form data
const profile = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: '081-234-5678',
  location: 'กรุงเทพมหานคร',
  bio: '',
  avatar: authStore.user?.avatar || 'https://i.pravatar.cc/300?img=20'
})

const saving = ref(false)
const successMessage = ref('')

const handleSave = async () => {
  if (!authStore.user) return

  saving.value = true
  successMessage.value = ''

  try {
    // Save to Firestore
    const { doc, updateDoc } = await import('firebase/firestore')
    const { $firebase } = useNuxtApp()
    const db = $firebase.db

    const userRef = doc(db, 'users', authStore.user.id)
    await updateDoc(userRef, {
      name: profile.value.name,
      avatar: profile.value.avatar,
      updatedAt: new Date().toISOString()
    })

    // Update local auth store
    authStore.user.name = profile.value.name
    authStore.user.avatar = profile.value.avatar

    successMessage.value = 'บันทึกข้อมูลสำเร็จ'

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    console.error('Save error:', error)
    alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message)
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
          แก้ไขโปรไฟล์
        </h1>
        <p class="text-gray-600">อัปเดตข้อมูลส่วนตัวของคุณ</p>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lung text-green-700"
      >
        {{ successMessage }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Preview -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-8">
            <h2 class="text-lg font-bold text-dark mb-4">รูปโปรไฟล์</h2>

            <!-- Avatar -->
            <div class="relative w-32 h-32 mx-auto mb-4">
              <img
                :src="profile.avatar"
                :alt="profile.name"
                class="w-full h-full rounded-full object-cover"
              />
              <button
                class="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <Camera :size="18" class="text-dark" />
              </button>
            </div>

            <div class="text-center">
              <h3 class="text-xl font-bold text-dark mb-1">{{ profile.name }}</h3>
              <p class="text-sm text-gray-600">{{ profile.email }}</p>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-100">
              <div class="space-y-3 text-sm">
                <div class="flex items-center gap-2 text-gray-600">
                  <Phone :size="16" />
                  <span>{{ profile.phone }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <MapPin :size="16" />
                  <span>{{ profile.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="lg:col-span-2">
          <form @submit.prevent="handleSave" class="space-y-6">
            <!-- Personal Information -->
            <div class="card p-6">
              <h2 class="text-xl font-bold text-dark mb-6">ข้อมูลส่วนตัว</h2>

              <div class="space-y-4">
                <!-- Name -->
                <div>
                  <label for="name" class="block text-sm font-medium text-dark mb-2">
                    ชื่อ-นามสกุล
                  </label>
                  <div class="relative">
                    <User :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="name"
                      v-model="profile.name"
                      type="text"
                      class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-dark mb-2">
                    อีเมล
                  </label>
                  <div class="relative">
                    <Mail :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      v-model="profile.email"
                      type="email"
                      class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none bg-gray-50"
                      disabled
                    />
                  </div>
                  <p class="text-xs text-gray-500 mt-1">อีเมลไม่สามารถเปลี่ยนแปลงได้</p>
                </div>

                <!-- Phone -->
                <div>
                  <label for="phone" class="block text-sm font-medium text-dark mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <div class="relative">
                    <Phone :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="phone"
                      v-model="profile.phone"
                      type="tel"
                      class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <!-- Location -->
                <div>
                  <label for="location" class="block text-sm font-medium text-dark mb-2">
                    ที่อยู่
                  </label>
                  <div class="relative">
                    <MapPin :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="location"
                      v-model="profile.location"
                      type="text"
                      class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <!-- Bio -->
                <div>
                  <label for="bio" class="block text-sm font-medium text-dark mb-2">
                    เกี่ยวกับฉัน
                  </label>
                  <textarea
                    id="bio"
                    v-model="profile.bio"
                    rows="4"
                    class="w-full px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                    placeholder="บอกเล่าเกี่ยวกับตัวคุณ..."
                  ></textarea>
                </div>
              </div>
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
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
