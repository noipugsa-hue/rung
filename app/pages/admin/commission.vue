<script setup lang="ts">
import { Settings, Plus, Edit2, Calendar, TrendingUp } from 'lucide-vue-next'
import { useCommissionStore } from '~/stores/commission'
import { useAuthStore } from '~/stores/auth'
import type { CommissionRate } from '~/types/commission'

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const commissionStore = useCommissionStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingRate = ref<CommissionRate | null>(null)

// Fetch commission rates on mount
onMounted(async () => {
  if (process.client) {
    await commissionStore.fetchRates()
  }
})

const form = reactive({
  percentage: 15,
  effectiveFrom: new Date().toISOString().split('T')[0],
  type: 'global' as 'global' | 'partner-specific',
  partnerId: ''
})

const rates = computed(() => commissionStore.rates)
const currentGlobalRate = computed(() => commissionStore.globalRate)

function openNewRateModal() {
  resetForm()
  editingRate.value = null
  showModal.value = true
}

function resetForm() {
  form.percentage = currentGlobalRate.value

  // Get the latest global rate's effectiveFrom date
  const latestGlobalRate = rates.value
    .filter(r => r.type === 'global')
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]

  // Use the latest rate's date, or today if no rates exist
  form.effectiveFrom = latestGlobalRate?.effectiveFrom || new Date().toISOString().split('T')[0]
  form.type = 'global'
  form.partnerId = ''
}

function closeModal() {
  showModal.value = false
  resetForm()
}

async function saveRate() {
  if (!authStore.user) return

  try {
    if (form.type === 'global') {
      await commissionStore.updateGlobalRate(
        form.percentage,
        form.effectiveFrom
      )
    }

    closeModal()

    // Refresh rates to show updated data
    await commissionStore.fetchRates()

    alert('บันทึกอัตราคอมมิชชั่นสำเร็จ')

  } catch (error: any) {
    console.error('Save rate error:', error)
    alert(`เกิดข้อผิดพลาด: ${error.message || 'ไม่สามารถบันทึกได้'}`)
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function isRateActive(rate: CommissionRate): boolean {
  const now = new Date().toISOString()
  return rate.effectiveFrom <= now && (!rate.effectiveTo || rate.effectiveTo > now)
}

const globalRates = computed(() => {
  return rates.value
    .filter(r => r.type === 'global')
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
})

const partnerRates = computed(() => {
  return rates.value
    .filter(r => r.type === 'partner-specific')
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
})
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">
          ตั้งค่าคอมมิชชั่น
        </h1>
        <p class="text-gray-600">
          จัดการอัตราคอมมิชชั่นของแพลตฟอร์ม
        </p>
      </div>

      <!-- Current Rate Overview -->
      <div class="card p-6 md:p-8 mb-8 bg-gradient-to-r from-primary to-cream">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-dark mb-2">อัตราคอมมิชชั่นปัจจุบัน</p>
            <p class="text-5xl font-bold text-dark mb-4">
              {{ currentGlobalRate }}%
            </p>
            <p class="text-sm text-dark opacity-80">
              ใช้กับพาร์ทเนอร์ทุกคนที่ไม่มีอัตราเฉพาะ
            </p>
          </div>
          <button
            @click="openNewRateModal"
            class="btn-primary"
          >
            <Edit2 :size="20" class="mr-2" />
            แก้ไขอัตรา
          </button>
        </div>
      </div>

      <!-- Info Card -->
      <div class="card p-6 bg-blue-50 border-l-4 border-blue-400 mb-8">
        <h3 class="font-bold text-dark mb-2">ข้อมูลเกี่ยวกับคอมมิชชั่น</h3>
        <ul class="text-sm text-gray-700 space-y-1">
          <li>• อัตราคอมมิชชั่นใหม่จะมีผลตั้งแต่วันที่กำหนด</li>
          <li>• การจองที่มีอยู่แล้วจะใช้อัตราที่บันทึกไว้ (snapshot)</li>
          <li>• อัตราคอมมิชชั่นทั่วไปอยู่ที่ 10-25%</li>
          <li>• สามารถตั้งอัตราเฉพาะสำหรับพาร์ทเนอร์แต่ละคนได้</li>
        </ul>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp :size="24" class="text-dark" />
            </div>
            <div>
              <p class="text-sm text-gray-600">อัตราปัจจุบัน</p>
              <p class="text-2xl font-bold text-dark">{{ currentGlobalRate }}%</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar :size="24" class="text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">ประวัติการเปลี่ยน</p>
              <p class="text-2xl font-bold text-dark">{{ globalRates.length }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Settings :size="24" class="text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">อัตราเฉพาะ</p>
              <p class="text-2xl font-bold text-dark">{{ partnerRates.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Rates History -->
      <div class="card p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-dark">ประวัติอัตราคอมมิชชั่นทั่วไป</h2>
        </div>

        <div v-if="globalRates.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">อัตรา</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">เริ่มใช้</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">สิ้นสุด</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">สถานะ</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">สร้างโดย</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rate in globalRates"
                :key="rate.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  <span class="text-2xl font-bold text-primary">{{ rate.percentage }}%</span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-700">
                  {{ formatDate(rate.effectiveFrom) }}
                </td>
                <td class="py-3 px-4 text-sm text-gray-700">
                  {{ rate.effectiveTo ? formatDate(rate.effectiveTo) : '—' }}
                </td>
                <td class="py-3 px-4">
                  <span
                    v-if="isRateActive(rate)"
                    class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                  >
                    ใช้งานอยู่
                  </span>
                  <span
                    v-else-if="rate.effectiveTo && rate.effectiveTo < new Date().toISOString()"
                    class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"
                  >
                    สิ้นสุดแล้ว
                  </span>
                  <span
                    v-else
                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                  >
                    รอใช้งาน
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-700">
                  {{ rate.createdBy }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-8">
          <Settings :size="48" class="text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600">ยังไม่มีประวัติ</p>
        </div>
      </div>

      <!-- Partner-Specific Rates -->
      <div v-if="partnerRates.length > 0" class="card p-6">
        <h2 class="text-xl font-bold text-dark mb-6">อัตราคอมมิชชั่นเฉพาะพาร์ทเนอร์</h2>

        <div class="space-y-3">
          <div
            v-for="rate in partnerRates"
            :key="rate.id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="font-semibold text-dark">Partner ID: {{ rate.partnerId }}</p>
                <p class="text-sm text-gray-600">
                  {{ formatDate(rate.effectiveFrom) }}
                  {{ rate.effectiveTo ? ` - ${formatDate(rate.effectiveTo)}` : '' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-primary">{{ rate.percentage }}%</p>
                <span
                  v-if="isRateActive(rate)"
                  class="text-xs font-semibold text-green-600"
                >
                  ใช้งานอยู่
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lung max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-dark mb-6">
          {{ editingRate ? 'แก้ไขอัตราคอมมิชชั่น' : 'ตั้งอัตราคอมมิชชั่นใหม่' }}
        </h3>

        <form @submit.prevent="saveRate" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              ประเภทอัตรา
            </label>
            <select v-model="form.type" class="input-lung" required>
              <option value="global">อัตราทั่วไป</option>
              <option value="partner-specific">อัตราเฉพาะพาร์ทเนอร์</option>
            </select>
          </div>

          <div v-if="form.type === 'partner-specific'">
            <label class="block text-sm font-semibold text-dark mb-2">
              Partner ID
            </label>
            <input
              v-model="form.partnerId"
              type="text"
              class="input-lung"
              placeholder="LUNG-xxxxx"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              อัตราคอมมิชชั่น (%)
            </label>
            <input
              v-model.number="form.percentage"
              type="number"
              min="10"
              max="25"
              step="0.5"
              class="input-lung"
              required
            />
            <p class="text-xs text-gray-600 mt-1">
              ระหว่าง 10-25%
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              เริ่มใช้วันที่
            </label>
            <input
              v-model="form.effectiveFrom"
              type="date"
              class="input-lung"
              required
            />
            <p class="text-xs text-gray-600 mt-1">
              อัตราใหม่จะมีผลตั้งแต่วันที่กำหนด
            </p>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p class="text-sm text-yellow-800">
              <strong>หมายเหตุ:</strong> การจองที่มีอยู่แล้วจะไม่ได้รับผลกระทบ
              เนื่องจากอัตราคอมมิชชั่นถูกบันทึกไว้ในแต่ละการจอง
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="btn-outline"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
