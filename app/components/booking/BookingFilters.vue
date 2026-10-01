<script setup lang="ts">
import { Filter, X, Search } from 'lucide-vue-next'
import type { BookingFilters } from '~/composables/useBookingHistory'

const props = defineProps<{
  modelValue: BookingFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: BookingFilters]
  clear: []
}>()

const localFilters = ref<BookingFilters>({ ...props.modelValue })
const showFilters = ref(false)

const statusOptions = [
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' }
]

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  localFilters.value = { ...newValue }
}, { deep: true })

// Apply filters
function applyFilters() {
  emit('update:modelValue', { ...localFilters.value })
  showFilters.value = false
}

// Clear filters
function clearFilters() {
  localFilters.value = {}
  emit('clear')
  showFilters.value = false
}

// Toggle status selection
function toggleStatus(status: string) {
  if (!localFilters.value.status) {
    localFilters.value.status = []
  }

  const index = localFilters.value.status.indexOf(status)
  if (index > -1) {
    localFilters.value.status.splice(index, 1)
  } else {
    localFilters.value.status.push(status)
  }
}

// Check if status is selected
function isStatusSelected(status: string): boolean {
  return localFilters.value.status?.includes(status) ?? false
}

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (localFilters.value.status && localFilters.value.status.length > 0) count++
  if (localFilters.value.dateFrom) count++
  if (localFilters.value.dateTo) count++
  if (localFilters.value.searchQuery) count++
  return count
})

// Has active filters
const hasActiveFilters = computed(() => activeFilterCount.value > 0)
</script>

<template>
  <div class="space-y-4">
    <!-- Filter Bar -->
    <div class="flex gap-3">
      <!-- Search -->
      <div class="flex-1 relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search :size="20" class="text-gray-400" />
        </div>
        <input
          v-model="localFilters.searchQuery"
          type="text"
          placeholder="ค้นหากิจกรรมหรือสถานที่..."
          class="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          @input="applyFilters"
        />
      </div>

      <!-- Filter Button -->
      <button
        type="button"
        @click="showFilters = !showFilters"
        class="relative px-6 py-3 border border-gray-300 rounded-full font-medium text-dark hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Filter :size="20" />
        <span class="hidden sm:inline">ตัวกรอง</span>
        <span
          v-if="hasActiveFilters"
          class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-dark text-xs font-bold rounded-full flex items-center justify-center"
        >
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Clear Button -->
      <button
        v-if="hasActiveFilters"
        type="button"
        @click="clearFilters"
        class="px-6 py-3 border border-gray-300 rounded-full text-dark hover:bg-gray-50 transition-colors"
        title="ล้างตัวกรอง"
      >
        <X :size="20" />
      </button>
    </div>

    <!-- Filter Panel -->
    <Transition name="slide">
      <div
        v-if="showFilters"
        class="bg-white rounded-2xl border border-gray-200 p-6 space-y-6"
      >
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-semibold text-dark mb-3">
            สถานะ
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              @click="toggleStatus(option.value)"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              :class="[
                isStatusSelected(option.value)
                  ? 'bg-primary text-dark'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="dateFrom" class="block text-sm font-semibold text-dark mb-2">
              จากวันที่
            </label>
            <input
              id="dateFrom"
              v-model="localFilters.dateFrom"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label for="dateTo" class="block text-sm font-semibold text-dark mb-2">
              ถึงวันที่
            </label>
            <input
              id="dateTo"
              v-model="localFilters.dateTo"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="clearFilters"
            class="flex-1 px-6 py-3 border border-gray-300 rounded-full text-dark font-medium hover:bg-gray-50 transition-colors"
          >
            ล้างตัวกรอง
          </button>
          <button
            type="button"
            @click="applyFilters"
            class="flex-1 px-6 py-3 bg-primary text-dark rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            ใช้ตัวกรอง
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
