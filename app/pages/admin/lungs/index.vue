<script setup lang="ts">
import { Search, Filter, UserCheck, UserX, Eye, Edit, TrendingUp, Users, Star, DollarSign } from 'lucide-vue-next'
import { useLungStore } from '~/stores/lung'
import type { Lung } from '~/types'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const lungStore = useLungStore()
const router = useRouter()

// Filters
const searchQuery = ref('')
const statusFilter = ref<'all' | 'verified' | 'available' | 'unavailable'>('all')
const categoryFilter = ref<string>('all')

// Load lungs on mount
onMounted(async () => {
  await lungStore.fetchLungs()
})

// Filtered lungs
const filteredLungs = computed(() => {
  let lungs = lungStore.lungs

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    lungs = lungs.filter(lung =>
      lung.name.toLowerCase().includes(query) ||
      lung.location.toLowerCase().includes(query) ||
      lung.id.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value === 'verified') {
    lungs = lungs.filter(lung => lung.verified)
  } else if (statusFilter.value === 'available') {
    lungs = lungs.filter(lung => lung.available)
  } else if (statusFilter.value === 'unavailable') {
    lungs = lungs.filter(lung => !lung.available)
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    lungs = lungs.filter(lung => lung.categories.includes(categoryFilter.value))
  }

  return lungs
})

// Statistics
const stats = computed(() => {
  const lungs = lungStore.lungs
  return {
    total: lungs.length,
    verified: lungs.filter(l => l.verified).length,
    available: lungs.filter(l => l.available).length,
    avgRating: lungs.length > 0
      ? (lungs.reduce((sum, l) => sum + l.rating, 0) / lungs.length).toFixed(1)
      : '0.0'
  }
})

// All unique categories
const allCategories = computed(() => {
  const categories = new Set<string>()
  lungStore.lungs.forEach(lung => {
    lung.categories.forEach(cat => categories.add(cat))
  })
  return Array.from(categories).sort()
})

function viewLung(id: string) {
  router.push(`/admin/lungs/${id}`)
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  categoryFilter.value = 'all'
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">จัดการลุง</h1>
        <p class="text-gray-600">ดูและจัดการโปรไฟล์ลุงทั้งหมดในระบบ</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">ลุงทั้งหมด</span>
            <Users :size="20" class="text-gray-400" />
          </div>
          <p class="text-3xl font-bold text-dark">{{ stats.total }}</p>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">ยืนยันแล้ว</span>
            <UserCheck :size="20" class="text-green-500" />
          </div>
          <p class="text-3xl font-bold text-green-600">{{ stats.verified }}</p>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">พร้อมให้บริการ</span>
            <TrendingUp :size="20" class="text-blue-500" />
          </div>
          <p class="text-3xl font-bold text-blue-600">{{ stats.available }}</p>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">คะแนนเฉลี่ย</span>
            <Star :size="20" class="text-yellow-500" />
          </div>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.avgRating }}</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="card p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- Search -->
          <div class="relative">
            <Search :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาชื่อ, สถานที่, รหัส..."
              class="input-lung pl-10"
            />
          </div>

          <!-- Status Filter -->
          <select v-model="statusFilter" class="input-lung">
            <option value="all">สถานะทั้งหมด</option>
            <option value="verified">ยืนยันแล้ว</option>
            <option value="available">พร้อมให้บริการ</option>
            <option value="unavailable">ไม่พร้อมให้บริการ</option>
          </select>

          <!-- Category Filter -->
          <select v-model="categoryFilter" class="input-lung">
            <option value="all">หมวดหมู่ทั้งหมด</option>
            <option v-for="cat in allCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <!-- Clear Filters -->
        <button
          v-if="searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'"
          @click="clearFilters"
          class="text-sm text-orange-600 hover:text-orange-700 font-semibold"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Results Count -->
      <div class="mb-4 text-sm text-gray-600">
        แสดง {{ filteredLungs.length }} จาก {{ stats.total }} ลุง
      </div>

      <!-- Lungs Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ลุง
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ที่อยู่
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  หมวดหมู่
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  คะแนน
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ราคา/ชม.
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  สถานะ
                </th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  การกระทำ
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="lung in filteredLungs"
                :key="lung.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Profile -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="lung.avatar"
                      :alt="lung.name"
                      class="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p class="font-semibold text-dark">{{ lung.name }}</p>
                      <p class="text-sm text-gray-600">{{ lung.age }} ปี</p>
                      <p class="text-xs text-gray-500">{{ lung.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- Location -->
                <td class="px-6 py-4">
                  <p class="text-sm text-gray-900">{{ lung.location }}</p>
                </td>

                <!-- Categories -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="cat in lung.categories.slice(0, 2)"
                      :key="cat"
                      class="px-2 py-1 bg-cream rounded text-xs"
                    >
                      {{ cat }}
                    </span>
                    <span
                      v-if="lung.categories.length > 2"
                      class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                    >
                      +{{ lung.categories.length - 2 }}
                    </span>
                  </div>
                </td>

                <!-- Rating -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1">
                    <Star :size="16" class="text-yellow-500 fill-current" />
                    <span class="font-semibold">{{ lung.rating }}</span>
                    <span class="text-sm text-gray-600">({{ lung.reviewCount }})</span>
                  </div>
                </td>

                <!-- Price -->
                <td class="px-6 py-4">
                  <p class="font-semibold text-dark">฿{{ lung.price }}</p>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1">
                    <span
                      v-if="lung.verified"
                      class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full w-fit"
                    >
                      <UserCheck :size="12" />
                      ยืนยัน
                    </span>
                    <span
                      v-if="lung.available"
                      class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full w-fit"
                    >
                      พร้อมให้บริการ
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full w-fit"
                    >
                      ไม่พร้อมให้บริการ
                    </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="viewLung(lung.id)"
                      class="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="ดูและแก้ไข"
                    >
                      <Edit :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredLungs.length === 0"
          class="py-12 text-center"
        >
          <UserX :size="64" class="text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-dark mb-2">ไม่พบข้อมูล</h3>
          <p class="text-gray-600 mb-4">ไม่พบลุงที่ตรงกับเงื่อนไขที่คุณค้นหา</p>
          <button @click="clearFilters" class="btn-outline">
            ล้างตัวกรอง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
