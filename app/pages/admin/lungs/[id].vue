<script setup lang="ts">
import {
  ArrowLeft, Save, UserCheck, UserX, Eye, EyeOff, Image as ImageIcon,
  MapPin, Briefcase, Languages, Star, DollarSign, Calendar, MessageSquare,
  TrendingUp, AlertCircle
} from 'lucide-vue-next'
import { useLungStore } from '~/stores/lung'
import type { Lung } from '~/types'

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const lungStore = useLungStore()

const lungId = route.params.id as string
const lung = ref<Lung | null>(null)
const loading = ref(true)
const saving = ref(false)

// Edit form
const editForm = ref<Partial<Lung>>({})
const editMode = ref(false)

// Load lung data
onMounted(async () => {
  await lungStore.fetchLungs()
  lung.value = lungStore.lungs.find(l => l.id === lungId) || null

  if (lung.value) {
    editForm.value = { ...lung.value }
  }

  loading.value = false
})

function goBack() {
  router.push('/admin/lungs')
}

function toggleEditMode() {
  editMode.value = !editMode.value
  if (editMode.value && lung.value) {
    editForm.value = { ...lung.value }
  }
}

async function saveChanges() {
  if (!lung.value || !editForm.value || saving.value) return

  saving.value = true

  try {
    await lungStore.updateLung(lung.value.id, editForm.value)
    lung.value = { ...lung.value, ...editForm.value }
    editMode.value = false
    alert('บันทึกข้อมูลสำเร็จ')
  } catch (error) {
    console.error('Save error:', error)
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
  } finally {
    saving.value = false
  }
}

async function toggleVerified() {
  if (!lung.value) return

  try {
    const newStatus = !lung.value.verified
    await lungStore.updateLung(lung.value.id, { verified: newStatus })
    lung.value.verified = newStatus
    editForm.value.verified = newStatus
    alert(`${newStatus ? 'ยืนยัน' : 'ยกเลิกยืนยัน'}โปรไฟล์สำเร็จ`)
  } catch (error) {
    console.error('Toggle verified error:', error)
    alert('เกิดข้อผิดพลาด')
  }
}

async function toggleAvailable() {
  if (!lung.value) return

  try {
    const newStatus = !lung.value.available
    await lungStore.updateLung(lung.value.id, { available: newStatus })
    lung.value.available = newStatus
    editForm.value.available = newStatus
    alert(`เปลี่ยนสถานะเป็น${newStatus ? 'พร้อมให้บริการ' : 'ไม่พร้อมให้บริการ'}สำเร็จ`)
  } catch (error) {
    console.error('Toggle available error:', error)
    alert('เกิดข้อผิดพลาด')
  }
}

// Mock statistics (ในอนาคตจะดึงจาก bookings)
const stats = computed(() => {
  if (!lung.value) return null

  return {
    totalBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    avgResponseTime: '2 ชม.'
  }
})

const tabs = [
  { id: 'profile', label: 'ข้อมูลโปรไฟล์', icon: UserCheck },
  { id: 'gallery', label: 'แกลเลอรี่', icon: ImageIcon },
  { id: 'reviews', label: 'รีวิว', icon: MessageSquare },
  { id: 'bookings', label: 'การจอง', icon: Calendar }
]

const activeTab = ref('profile')
</script>

<template>
  <div v-if="loading" class="py-12 text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
    <p class="text-gray-600 mt-4">กำลังโหลด...</p>
  </div>

  <div v-else-if="lung" class="py-8">
    <div class="container-lung max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-4"
        >
          <ArrowLeft :size="20" />
          <span>กลับไปรายการ</span>
        </button>

        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-4">
            <img
              :src="lung.avatar"
              :alt="lung.name"
              class="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <h1 class="text-3xl font-bold text-dark mb-2">{{ lung.name }}</h1>
              <div class="flex items-center gap-3 flex-wrap">
                <span class="text-sm text-gray-600">{{ lung.age }} ปี</span>
                <span class="text-sm text-gray-600">•</span>
                <span class="text-sm text-gray-600">{{ lung.id }}</span>
                <span
                  v-if="lung.verified"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
                >
                  <UserCheck :size="12" />
                  ยืนยันแล้ว
                </span>
                <span
                  v-if="lung.available"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                >
                  <Eye :size="12" />
                  พร้อมให้บริการ
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"
                >
                  <EyeOff :size="12" />
                  ไม่พร้อมให้บริการ
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              v-if="!editMode"
              @click="toggleEditMode"
              class="btn-outline"
            >
              แก้ไขข้อมูล
            </button>
            <template v-else>
              <button
                @click="toggleEditMode"
                class="btn-outline"
              >
                ยกเลิก
              </button>
              <button
                @click="saveChanges"
                :disabled="saving"
                class="btn-primary"
                :class="{ 'opacity-50 cursor-wait': saving }"
              >
                <Save :size="18" class="mr-2" />
                {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">คะแนน</span>
            <Star :size="18" class="text-yellow-500" />
          </div>
          <p class="text-2xl font-bold text-dark">{{ lung.rating }}</p>
          <p class="text-xs text-gray-600">{{ lung.reviewCount }} รีวิว</p>
        </div>

        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">ราคา/ชม.</span>
            <DollarSign :size="18" class="text-green-500" />
          </div>
          <p class="text-2xl font-bold text-dark">฿{{ lung.price }}</p>
        </div>

        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">การจอง</span>
            <Calendar :size="18" class="text-blue-500" />
          </div>
          <p class="text-2xl font-bold text-dark">{{ stats?.completedBookings || 0 }}</p>
          <p class="text-xs text-gray-600">ครั้ง</p>
        </div>

        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">รายได้</span>
            <TrendingUp :size="18" class="text-purple-500" />
          </div>
          <p class="text-2xl font-bold text-dark">฿{{ stats?.totalEarnings || 0 }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2 border-b">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 font-semibold whitespace-nowrap transition-all flex items-center gap-2"
          :class="
            activeTab === tab.id
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          "
        >
          <component :is="tab.icon" :size="18" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <!-- Basic Info -->
        <div class="card p-6">
          <h3 class="text-xl font-bold text-dark mb-4">ข้อมูลพื้นฐาน</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-2">ชื่อ</label>
              <input
                v-if="editMode"
                v-model="editForm.name"
                type="text"
                class="input-lung"
              />
              <p v-else class="text-dark">{{ lung.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-2">อายุ</label>
              <input
                v-if="editMode"
                v-model.number="editForm.age"
                type="number"
                class="input-lung"
              />
              <p v-else class="text-dark">{{ lung.age }} ปี</p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                <MapPin :size="16" class="inline mr-1" />
                ที่อยู่
              </label>
              <input
                v-if="editMode"
                v-model="editForm.location"
                type="text"
                class="input-lung"
              />
              <p v-else class="text-dark">{{ lung.location }}</p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                <Briefcase :size="16" class="inline mr-1" />
                แนะนำตัว
              </label>
              <textarea
                v-if="editMode"
                v-model="editForm.bio"
                rows="4"
                class="input-lung"
              />
              <p v-else class="text-dark whitespace-pre-wrap">{{ lung.bio }}</p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                <Briefcase :size="16" class="inline mr-1" />
                ประสบการณ์
              </label>
              <textarea
                v-if="editMode"
                v-model="editForm.experience"
                rows="4"
                class="input-lung"
              />
              <p v-else class="text-dark whitespace-pre-wrap">{{ lung.experience }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                <DollarSign :size="16" class="inline mr-1" />
                ราคา/ชั่วโมง
              </label>
              <input
                v-if="editMode"
                v-model.number="editForm.price"
                type="number"
                class="input-lung"
              />
              <p v-else class="text-dark">฿{{ lung.price }}</p>
            </div>
          </div>
        </div>

        <!-- Languages & Categories -->
        <div class="card p-6">
          <h3 class="text-xl font-bold text-dark mb-4">ทักษะและความสามารถ</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                <Languages :size="16" class="inline mr-1" />
                ภาษาที่ใช้ได้
              </label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="lang in lung.languages"
                  :key="lang"
                  class="px-3 py-1 bg-primary rounded-full text-sm font-semibold"
                >
                  {{ lang }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                หมวดหมู่/กิจกรรม
              </label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cat in lung.categories"
                  :key="cat"
                  class="px-3 py-1 bg-cream rounded-full text-sm"
                >
                  {{ cat }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Controls -->
        <div class="card p-6">
          <h3 class="text-xl font-bold text-dark mb-4">จัดการสถานะ</h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-dark">สถานะการยืนยัน</p>
                <p class="text-sm text-gray-600">
                  {{ lung.verified ? 'โปรไฟล์ได้รับการยืนยันแล้ว' : 'โปรไฟล์ยังไม่ได้รับการยืนยัน' }}
                </p>
              </div>
              <button
                @click="toggleVerified"
                class="px-4 py-2 rounded-lg font-semibold transition-colors"
                :class="
                  lung.verified
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                "
              >
                {{ lung.verified ? 'ยกเลิกยืนยัน' : 'ยืนยันโปรไฟล์' }}
              </button>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-dark">สถานะให้บริการ</p>
                <p class="text-sm text-gray-600">
                  {{ lung.available ? 'พร้อมให้บริการ' : 'ไม่พร้อมให้บริการ' }}
                </p>
              </div>
              <button
                @click="toggleAvailable"
                class="px-4 py-2 rounded-lg font-semibold transition-colors"
                :class="
                  lung.available
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                "
              >
                {{ lung.available ? 'ปิดให้บริการ' : 'เปิดให้บริการ' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Gallery Tab -->
      <div v-if="activeTab === 'gallery'" class="card p-6">
        <h3 class="text-xl font-bold text-dark mb-4">
          <ImageIcon :size="24" class="inline mr-2" />
          แกลเลอรี่รูปภาพ
        </h3>

        <div v-if="lung.gallery && lung.gallery.length > 0">
          <p class="text-sm text-gray-600 mb-4">จำนวน: {{ lung.gallery.length }} รูป</p>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="(image, index) in lung.gallery"
              :key="index"
              class="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
            >
              <img
                :src="image"
                :alt="`Gallery ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <div
                v-if="index === 0"
                class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold"
              >
                ⭐ รูปหลัก
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <ImageIcon :size="48" class="mx-auto mb-3 opacity-30" />
          <p>ยังไม่มีรูปภาพในแกลเลอรี่</p>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div v-if="activeTab === 'reviews'" class="card p-6">
        <h3 class="text-xl font-bold text-dark mb-4">
          <MessageSquare :size="24" class="inline mr-2" />
          รีวิวจากลูกค้า
        </h3>

        <div v-if="lung.reviews && lung.reviews.length > 0" class="space-y-4">
          <div
            v-for="review in lung.reviews"
            :key="review.id"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <img
                :src="review.userAvatar"
                :alt="review.userName"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <p class="font-semibold text-dark">{{ review.userName }}</p>
                  <div class="flex items-center gap-1">
                    <Star :size="14" class="text-yellow-500 fill-current" />
                    <span class="font-semibold">{{ review.rating }}</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ review.activity }}</p>
                <p class="text-sm text-gray-900">{{ review.comment }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ new Date(review.date).toLocaleDateString('th-TH') }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <MessageSquare :size="48" class="mx-auto mb-3 opacity-30" />
          <p>ยังไม่มีรีวิว</p>
        </div>
      </div>

      <!-- Bookings Tab -->
      <div v-if="activeTab === 'bookings'" class="card p-6">
        <h3 class="text-xl font-bold text-dark mb-4">
          <Calendar :size="24" class="inline mr-2" />
          ประวัติการจอง
        </h3>

        <div class="text-center py-8 text-gray-500">
          <Calendar :size="48" class="mx-auto mb-3 opacity-30" />
          <p>ยังไม่มีข้อมูลการจอง</p>
          <p class="text-sm mt-2">ข้อมูลการจองจะแสดงที่นี่เมื่อมีการจอง</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="py-12 text-center">
    <AlertCircle :size="64" class="text-gray-300 mx-auto mb-4" />
    <h2 class="text-2xl font-bold text-dark mb-2">ไม่พบข้อมูล</h2>
    <p class="text-gray-600 mb-4">ไม่พบลุงที่คุณค้นหา</p>
    <button @click="goBack" class="btn-outline">
      กลับไปรายการ
    </button>
  </div>
</template>
