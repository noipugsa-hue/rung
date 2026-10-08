<script setup lang="ts">
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-vue-next'
import { categories } from '~/data/categories'
import { useLungStore } from '~/stores/lung'

definePageMeta({
  layout: 'default'
})

// SEO
const { setSeo, getBreadcrumbSchema } = useSeo()
setSeo({
  title: 'ค้นหาลุง - เช่าลุง หาคนไปด้วย | LUNG',
  description: 'ค้นหาและเช่าลุง หาคนไปกินข้าว เที่ยว คาเฟ่ คุยเล่น จากทั่วประเทศไทย กรองตามกิจกรรม ราคา สถานที่ และเวลาว่าง จองได้ทันที',
  keywords: [
    'เช่าลุง',
    'ลุงเช่า',
    'หาคนไปด้วย',
    'หาเพื่อนไปเที่ยว',
    'หาคนกินข้าว',
    'หาคนไปคาเฟ่',
    'ค้นหาลุง',
    'จองลุง',
    'บริการหาเพื่อน'
  ],
  structuredData: getBreadcrumbSchema([
    { name: 'หน้าแรก', url: '/' },
    { name: 'ค้นหาลุง' }
  ])
})

const route = useRoute()

let lungStore: ReturnType<typeof useLungStore> | null = null

const showFilters = ref(false)
const searchQuery = ref('')
const selectedCategories = ref<string[]>([])
const minPrice = ref<number>()
const maxPrice = ref<number>()
const selectedLocation = ref('') // Empty by default to show all
const onlyAvailable = ref(false)
const instantBookOnly = ref(false)

onMounted(() => {
  lungStore = useLungStore()
  lungStore.fetchLungs()

  // Initialize from query params
  const categoryParam = route.query.category as string
  if (categoryParam) {
    const category = categories.find(c => c.id === categoryParam)
    if (category) {
      selectedCategories.value = [category.name]
    }
  }
})

const filteredLungs = computed(() => {
  if (!lungStore) return []
  let lungs = lungStore.searchLungs({
    categories: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
    location: selectedLocation.value || undefined,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    available: onlyAvailable.value || undefined,
  })

  // Client-side instant book filter
  if (instantBookOnly.value) {
    lungs = lungs.filter(lung => lung.instantBook)
  }

  return lungs
})

const toggleCategory = (categoryName: string) => {
  const index = selectedCategories.value.indexOf(categoryName)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryName)
  }
}

const clearFilters = () => {
  selectedCategories.value = []
  minPrice.value = undefined
  maxPrice.value = undefined
  selectedLocation.value = ''
  onlyAvailable.value = false
  instantBookOnly.value = false
}

const hasActiveFilters = computed(() => {
  return selectedCategories.value.length > 0 ||
    minPrice.value !== undefined ||
    maxPrice.value !== undefined ||
    onlyAvailable.value ||
    instantBookOnly.value
})
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-4">
          ค้นหาคนที่พร้อมไปกับคุณ
        </h1>

        <!-- Search and filter bar -->
        <div class="flex gap-3">
          <div class="flex-1 relative">
            <SearchIcon
              :size="20"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาตามชื่อ, กิจกรรม, หรือสถานที่"
              class="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <button
            @click="showFilters = !showFilters"
            class="btn-outline flex items-center gap-2 whitespace-nowrap"
            :class="{ 'bg-primary border-primary': hasActiveFilters }"
          >
            <SlidersHorizontal :size="20" />
            <span class="hidden sm:inline">ตัวกรอง</span>
            <span v-if="hasActiveFilters" class="bg-dark text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ selectedCategories.length + (onlyAvailable ? 1 : 0) + (instantBookOnly ? 1 : 0) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div
        v-if="showFilters"
        class="card p-6 mb-8"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-dark">ตัวกรอง</h3>
          <div class="flex items-center gap-3">
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="text-sm text-primary hover:underline"
            >
              ล้างทั้งหมด
            </button>
            <button
              @click="showFilters = false"
              class="p-2 hover:bg-gray-100 rounded-full"
            >
              <X :size="20" />
            </button>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Categories -->
          <div>
            <h4 class="font-semibold text-dark mb-3">กิจกรรม</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                @click="toggleCategory(cat.name)"
                class="px-4 py-2 rounded-full border-2 transition-all"
                :class="
                  selectedCategories.includes(cat.name)
                    ? 'bg-primary border-primary text-dark'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                "
              >
                {{ cat.emoji }} {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- Price Range -->
          <div>
            <h4 class="font-semibold text-dark mb-3">ราคา (บาท/ชั่วโมง)</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600 mb-1 block">ต่ำสุด</label>
                <input
                  v-model.number="minPrice"
                  type="number"
                  placeholder="0"
                  class="w-full px-4 py-2 rounded-lung border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600 mb-1 block">สูงสุด</label>
                <input
                  v-model.number="maxPrice"
                  type="number"
                  placeholder="1000"
                  class="w-full px-4 py-2 rounded-lung border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Availability -->
          <div class="space-y-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="onlyAvailable"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="font-medium text-dark">แสดงเฉพาะคนที่ว่างวันนี้</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="instantBookOnly"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <span class="font-medium text-dark flex items-center gap-1.5">
                <span>⚡</span>
                <span>จองได้ทันที (ไม่ต้องรอยืนยัน)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="mb-6">
        <p class="text-gray-600">
          พบ <span class="font-semibold text-dark">{{ filteredLungs.length }}</span> คน
        </p>
      </div>

      <LungGrid :lungs="filteredLungs" :loading="lungStore?.loading || false" />
    </div>
  </div>
</template>
