<script setup lang="ts">
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

const availability = ref([
  {
    id: '1',
    day: 'monday',
    dayLabel: 'จันทร์',
    enabled: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '18:00' }
    ]
  },
  {
    id: '2',
    day: 'tuesday',
    dayLabel: 'อังคาร',
    enabled: true,
    slots: [
      { start: '09:00', end: '18:00' }
    ]
  },
  {
    id: '3',
    day: 'wednesday',
    dayLabel: 'พุธ',
    enabled: true,
    slots: [
      { start: '09:00', end: '18:00' }
    ]
  },
  {
    id: '4',
    day: 'thursday',
    dayLabel: 'พฤหัสบดี',
    enabled: true,
    slots: [
      { start: '09:00', end: '18:00' }
    ]
  },
  {
    id: '5',
    day: 'friday',
    dayLabel: 'ศุกร์',
    enabled: true,
    slots: [
      { start: '09:00', end: '18:00' }
    ]
  },
  {
    id: '6',
    day: 'saturday',
    dayLabel: 'เสาร์',
    enabled: true,
    slots: [
      { start: '10:00', end: '20:00' }
    ]
  },
  {
    id: '7',
    day: 'sunday',
    dayLabel: 'อาทิตย์',
    enabled: false,
    slots: []
  },
])

const addSlot = (dayId: string) => {
  const day = availability.value.find(d => d.id === dayId)
  if (day) {
    day.slots.push({ start: '09:00', end: '17:00' })
  }
}

const removeSlot = (dayId: string, slotIndex: number) => {
  const day = availability.value.find(d => d.id === dayId)
  if (day) {
    day.slots.splice(slotIndex, 1)
  }
}

const saving = ref(false)
const successMessage = ref('')

const handleSave = async () => {
  saving.value = true
  successMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    successMessage.value = 'บันทึกตารางเวลาสำเร็จ'
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
    <div class="container-lung max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          ตารางเวลาว่าง
        </h1>
        <p class="text-gray-600">กำหนดช่วงเวลาที่คุณพร้อมให้บริการ</p>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lung text-green-700"
      >
        {{ successMessage }}
      </div>

      <!-- Info Card -->
      <div class="card p-6 mb-6 bg-soft-green border border-green-200">
        <div class="flex items-start gap-3">
          <Calendar :size="24" class="text-dark flex-shrink-0 mt-1" />
          <div>
            <h3 class="font-bold text-dark mb-2">เกี่ยวกับตารางเวลา</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• กำหนดช่วงเวลาที่คุณพร้อมให้บริการในแต่ละวัน</li>
              <li>• สามารถเพิ่มหลายช่วงเวลาในวันเดียวกันได้</li>
              <li>• ปิดการใช้งานวันที่ไม่ว่าง</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Availability Form -->
      <form @submit.prevent="handleSave" class="space-y-4">
        <div
          v-for="day in availability"
          :key="day.id"
          class="card p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <input
                v-model="day.enabled"
                type="checkbox"
                :id="`day-${day.id}`"
                class="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <label :for="`day-${day.id}`" class="text-lg font-bold text-dark cursor-pointer">
                {{ day.dayLabel }}
              </label>
            </div>

            <button
              v-if="day.enabled"
              type="button"
              @click="addSlot(day.id)"
              class="flex items-center gap-2 text-primary hover:text-orange transition-colors text-sm font-medium"
            >
              <Plus :size="16" />
              เพิ่มช่วงเวลา
            </button>
          </div>

          <div v-if="day.enabled && day.slots.length > 0" class="space-y-3">
            <div
              v-for="(slot, index) in day.slots"
              :key="index"
              class="flex items-center gap-3"
            >
              <Clock :size="18" class="text-gray-400 flex-shrink-0" />

              <div class="flex items-center gap-2 flex-1">
                <input
                  v-model="slot.start"
                  type="time"
                  class="px-3 py-2 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                />
                <span class="text-gray-600">-</span>
                <input
                  v-model="slot.end"
                  type="time"
                  class="px-3 py-2 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>

              <button
                v-if="day.slots.length > 1"
                type="button"
                @click="removeSlot(day.id, index)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>

          <div v-else-if="day.enabled" class="text-sm text-gray-500 text-center py-4">
            คลิก "เพิ่มช่วงเวลา" เพื่อเพิ่มช่วงเวลาว่าง
          </div>

          <div v-else class="text-sm text-gray-400 text-center py-4">
            ปิดการใช้งาน
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-4 pt-4">
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
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกตารางเวลา' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
