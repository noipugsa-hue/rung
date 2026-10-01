<script setup lang="ts">
import { User, Mail, Phone, MapPin, Briefcase, FileText, Camera, Save } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

// Profile form data
const profile = ref({
  name: 'ลุงเอก',
  age: 45,
  email: 'lung.ake@example.com',
  phone: '081-234-5678',
  location: 'กรุงเทพมหานคร',
  bio: 'สวัสดีครับ ผมเป็นคนชอบพูดคุย ชอบกินอาหารอร่อยๆ และเที่ยวชมสถานที่ต่างๆ มีประสบการณ์ในการทำงานด้านการท่องเที่ยวมา 15 ปี ยินดีให้คำแนะนำและพาไปสถานที่ดีๆ',
  experience: 'ทำงานด้านการท่องเที่ยวและบริการ 15 ปี',
  languages: ['ไทย', 'อังกฤษ', 'จีน'],
  categories: ['กินข้าว', 'คาเฟ่', 'เที่ยว', 'ช้อปปิ้ง'],
  price: 300,
  avatar: 'https://i.pravatar.cc/300?img=12'
})

const selectedCategories = ref<string[]>(profile.value.categories)
const selectedLanguages = ref<string[]>(profile.value.languages)

const availableCategories = [
  { id: 'food', name: 'กินข้าว', emoji: '🍽️' },
  { id: 'cafe', name: 'คาเฟ่', emoji: '☕' },
  { id: 'travel', name: 'เที่ยว', emoji: '🗺️' },
  { id: 'shopping', name: 'ช้อปปิ้ง', emoji: '🛍️' },
  { id: 'exercise', name: 'ออกกำลังกาย', emoji: '🏃' },
  { id: 'art', name: 'ศิลปะ', emoji: '🎨' },
  { id: 'music', name: 'ดนตรี', emoji: '🎵' },
  { id: 'talk', name: 'พูดคุย', emoji: '💬' },
]

const availableLanguages = ['ไทย', 'อังกฤษ', 'จีน', 'ญี่ปุ่น', 'เกาหลี', 'ฝรั่งเศส']

const saving = ref(false)
const successMessage = ref('')

const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}

const toggleLanguage = (language: string) => {
  const index = selectedLanguages.value.indexOf(language)
  if (index > -1) {
    selectedLanguages.value.splice(index, 1)
  } else {
    selectedLanguages.value.push(language)
  }
}

const handleSave = async () => {
  saving.value = true
  successMessage.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    profile.value.categories = [...selectedCategories.value]
    profile.value.languages = [...selectedLanguages.value]

    successMessage.value = 'บันทึกข้อมูลสำเร็จ'

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
    <div class="container-lung">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          แก้ไขโปรไฟล์
        </h1>
        <p class="text-gray-600">อัปเดตข้อมูลส่วนตัวและโปรไฟล์ของคุณ</p>
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
            <h2 class="text-lg font-bold text-dark mb-4">ตัวอย่างโปรไฟล์</h2>

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

            <div class="text-center mb-4">
              <h3 class="text-xl font-bold text-dark">{{ profile.name }}, {{ profile.age }}</h3>
              <div class="flex items-center justify-center gap-2 mt-2 text-gray-600">
                <MapPin :size="16" />
                <span class="text-sm">{{ profile.location }}</span>
              </div>
            </div>

            <!-- Price -->
            <div class="text-center p-3 bg-cream rounded-lung mb-4">
              <div class="text-2xl font-bold text-dark">฿{{ profile.price }}</div>
              <div class="text-xs text-gray-600">ต่อชั่วโมง</div>
            </div>

            <!-- Categories -->
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-600">กิจกรรม</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cat in selectedCategories"
                  :key="cat"
                  class="px-3 py-1 bg-primary rounded-full text-xs font-medium text-dark"
                >
                  {{ cat }}
                </span>
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

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Name -->
                <div>
                  <label for="name" class="block text-sm font-medium text-dark mb-2">
                    ชื่อ
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

                <!-- Age -->
                <div>
                  <label for="age" class="block text-sm font-medium text-dark mb-2">
                    อายุ
                  </label>
                  <input
                    id="age"
                    v-model.number="profile.age"
                    type="number"
                    min="18"
                    max="100"
                    class="w-full px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                    required
                  />
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
                      class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
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
                      required
                    />
                  </div>
                </div>

                <!-- Location -->
                <div class="md:col-span-2">
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
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="card p-6">
              <h2 class="text-xl font-bold text-dark mb-6">ข้อมูลโปรไฟล์</h2>

              <div class="space-y-4">
                <!-- Bio -->
                <div>
                  <label for="bio" class="block text-sm font-medium text-dark mb-2">
                    เกี่ยวกับคุณ
                  </label>
                  <textarea
                    id="bio"
                    v-model="profile.bio"
                    rows="4"
                    class="w-full px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                    placeholder="บอกเล่าเกี่ยวกับตัวคุณ..."
                    required
                  ></textarea>
                </div>

                <!-- Experience -->
                <div>
                  <label for="experience" class="block text-sm font-medium text-dark mb-2">
                    ประสบการณ์
                  </label>
                  <div class="relative">
                    <Briefcase :size="18" class="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      id="experience"
                      v-model="profile.experience"
                      rows="2"
                      class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                      placeholder="ประสบการณ์ที่เกี่ยวข้อง..."
                    ></textarea>
                  </div>
                </div>

                <!-- Price -->
                <div>
                  <label for="price" class="block text-sm font-medium text-dark mb-2">
                    ราคาต่อชั่วโมง (บาท)
                  </label>
                  <input
                    id="price"
                    v-model.number="profile.price"
                    type="number"
                    min="100"
                    step="50"
                    class="w-full px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div class="card p-6">
              <h2 class="text-xl font-bold text-dark mb-2">กิจกรรมที่สนใจ</h2>
              <p class="text-sm text-gray-600 mb-4">เลือกกิจกรรมที่คุณสนใจและมีความถนัด</p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="cat in availableCategories"
                  :key="cat.id"
                  type="button"
                  @click="toggleCategory(cat.name)"
                  class="p-4 rounded-lung border-2 transition-all"
                  :class="selectedCategories.includes(cat.name)
                    ? 'border-primary bg-cream'
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="text-3xl mb-2">{{ cat.emoji }}</div>
                  <div class="text-sm font-medium text-dark">{{ cat.name }}</div>
                </button>
              </div>
            </div>

            <!-- Languages -->
            <div class="card p-6">
              <h2 class="text-xl font-bold text-dark mb-2">ภาษาที่พูดได้</h2>
              <p class="text-sm text-gray-600 mb-4">เลือกภาษาที่คุณสามารถสื่อสารได้</p>

              <div class="flex flex-wrap gap-3">
                <button
                  v-for="lang in availableLanguages"
                  :key="lang"
                  type="button"
                  @click="toggleLanguage(lang)"
                  class="px-4 py-2 rounded-full border-2 transition-all"
                  :class="selectedLanguages.includes(lang)
                    ? 'border-primary bg-cream font-semibold'
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  {{ lang }}
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex gap-4">
              <button
                type="button"
                @click="router.push('/partner/dashboard')"
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
