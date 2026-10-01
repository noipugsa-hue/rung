<script setup lang="ts">
import { Wallet, Clock, CheckCircle2, XCircle, Eye } from 'lucide-vue-next'
import { usePayoutStore } from '~/stores/payout'
import { useAuthStore } from '~/stores/auth'
import { formatBaht } from '~/utils/money'
import type { PayoutStatus, PayoutRequest } from '~/types/payout'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const payoutStore = usePayoutStore()
const authStore = useAuthStore()
const router = useRouter()

const selectedStatus = ref<PayoutStatus | 'all'>('all')
const selectedPayout = ref<PayoutRequest | null>(null)
const showDetailModal = ref(false)
const showProcessModal = ref(false)

const processForm = reactive({
  action: 'approve' as 'approve' | 'reject',
  notes: '',
  failedReason: ''
})

const payouts = computed(() => {
  if (selectedStatus.value === 'all') {
    return payoutStore.getAllPayouts()
  }
  return payoutStore.getPayoutsByStatus(selectedStatus.value)
})

const stats = computed(() => {
  const all = payoutStore.getAllPayouts()
  return {
    total: all.length,
    pending: all.filter(p => p.status === 'pending').length,
    processing: all.filter(p => p.status === 'processing').length,
    completed: all.filter(p => p.status === 'completed').length,
    failed: all.filter(p => p.status === 'failed').length,
    pendingAmount: all
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amountSatang, 0)
  }
})

function openDetailModal(payout: PayoutRequest) {
  selectedPayout.value = payout
  showDetailModal.value = true
}

function openProcessModal(payout: PayoutRequest, action: 'approve' | 'reject') {
  selectedPayout.value = payout
  processForm.action = action
  processForm.notes = ''
  processForm.failedReason = ''
  showProcessModal.value = true
}

async function processPayout() {
  if (!selectedPayout.value || !authStore.user) return

  try {
    const newStatus: PayoutStatus = processForm.action === 'approve' ? 'completed' : 'failed'

    await payoutStore.updatePayoutStatus(
      selectedPayout.value.id,
      newStatus,
      authStore.user.id,
      processForm.notes,
      processForm.action === 'reject' ? processForm.failedReason : undefined
    )

    showProcessModal.value = false
    selectedPayout.value = null
    alert('บันทึกสำเร็จ')

  } catch (error) {
    console.error('Process error:', error)
    alert('เกิดข้อผิดพลาด')
  }
}

async function markAsProcessing(payout: PayoutRequest) {
  if (!authStore.user) return

  try {
    await payoutStore.updatePayoutStatus(
      payout.id,
      'processing',
      authStore.user.id
    )
    alert('เปลี่ยนสถานะเป็น "กำลังดำเนินการ" สำเร็จ')
  } catch (error) {
    alert('เกิดข้อผิดพลาด')
  }
}

function getStatusBadge(status: PayoutStatus) {
  const badges: Record<PayoutStatus, { class: string; text: string; icon: any }> = {
    pending: { class: 'bg-yellow-100 text-yellow-700', text: 'รอดำเนินการ', icon: Clock },
    processing: { class: 'bg-blue-100 text-blue-700', text: 'กำลังดำเนินการ', icon: Clock },
    completed: { class: 'bg-green-100 text-green-700', text: 'สำเร็จ', icon: CheckCircle2 },
    failed: { class: 'bg-red-100 text-red-700', text: 'ล้มเหลว', icon: XCircle },
    cancelled: { class: 'bg-gray-100 text-gray-700', text: 'ยกเลิก', icon: XCircle }
  }
  return badges[status]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">
          จัดการการโอนเงิน
        </h1>
        <p class="text-gray-600">
          ตรวจสอบและอนุมัติคำขอโอนเงินของพาร์ทเนอร์
        </p>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="card p-4">
          <div class="text-2xl font-bold text-dark mb-1">{{ stats.total }}</div>
          <div class="text-sm text-gray-600">ทั้งหมด</div>
        </div>

        <div class="card p-4">
          <div class="text-2xl font-bold text-yellow-600 mb-1">{{ stats.pending }}</div>
          <div class="text-sm text-gray-600">รอดำเนินการ</div>
        </div>

        <div class="card p-4">
          <div class="text-2xl font-bold text-blue-600 mb-1">{{ stats.processing }}</div>
          <div class="text-sm text-gray-600">กำลังดำเนินการ</div>
        </div>

        <div class="card p-4">
          <div class="text-2xl font-bold text-green-600 mb-1">{{ stats.completed }}</div>
          <div class="text-sm text-gray-600">สำเร็จ</div>
        </div>

        <div class="card p-4">
          <div class="text-xl font-bold text-primary mb-1">{{ formatBaht(stats.pendingAmount) }}</div>
          <div class="text-sm text-gray-600">ยอดรอโอน</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          @click="selectedStatus = 'all'"
          class="px-4 py-2 rounded-lung font-semibold whitespace-nowrap transition-colors"
          :class="selectedStatus === 'all' ? 'bg-primary text-dark' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          ทั้งหมด
        </button>
        <button
          @click="selectedStatus = 'pending'"
          class="px-4 py-2 rounded-lung font-semibold whitespace-nowrap transition-colors"
          :class="selectedStatus === 'pending' ? 'bg-primary text-dark' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          รอดำเนินการ
        </button>
        <button
          @click="selectedStatus = 'processing'"
          class="px-4 py-2 rounded-lung font-semibold whitespace-nowrap transition-colors"
          :class="selectedStatus === 'processing' ? 'bg-primary text-dark' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          กำลังดำเนินการ
        </button>
        <button
          @click="selectedStatus = 'completed'"
          class="px-4 py-2 rounded-lung font-semibold whitespace-nowrap transition-colors"
          :class="selectedStatus === 'completed' ? 'bg-primary text-dark' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          สำเร็จ
        </button>
        <button
          @click="selectedStatus = 'failed'"
          class="px-4 py-2 rounded-lung font-semibold whitespace-nowrap transition-colors"
          :class="selectedStatus === 'failed' ? 'bg-primary text-dark' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          ล้มเหลว
        </button>
      </div>

      <!-- Payouts List -->
      <div v-if="payouts.length > 0" class="space-y-4">
        <div
          v-for="payout in payouts"
          :key="payout.id"
          class="card p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                  :class="getStatusBadge(payout.status).class"
                >
                  <component :is="getStatusBadge(payout.status).icon" :size="16" />
                  {{ getStatusBadge(payout.status).text }}
                </span>
              </div>

              <div class="space-y-1 text-sm text-gray-600">
                <p>Partner ID: <span class="font-mono">{{ payout.partnerId }}</span></p>
                <p>ขอเมื่อ: {{ formatDate(payout.requestedAt) }}</p>
                <p v-if="payout.processedAt">ดำเนินการเมื่อ: {{ formatDate(payout.processedAt) }}</p>
              </div>
            </div>

            <div class="text-right">
              <p class="text-3xl font-bold text-dark mb-2">
                {{ formatBaht(payout.amountSatang) }}
              </p>
              <p class="text-xs text-gray-600 mb-3">
                รหัส: {{ payout.id }}
              </p>
            </div>
          </div>

          <!-- Bank Details -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <p class="text-xs text-gray-600 mb-2">โอนเข้า</p>
            <p class="font-semibold text-dark">{{ payout.bankAccount.bankName }}</p>
            <p class="text-sm text-gray-600 font-mono">{{ payout.bankAccount.accountNumber }}</p>
            <p class="text-sm text-gray-600">{{ payout.bankAccount.accountName }}</p>
          </div>

          <!-- Notes/Failed Reason -->
          <div v-if="payout.notes" class="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
            <p class="text-sm text-blue-800">
              <strong>หมายเหตุ:</strong> {{ payout.notes }}
            </p>
          </div>

          <div v-if="payout.failedReason" class="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
            <p class="text-sm text-red-800">
              <strong>เหตุผล:</strong> {{ payout.failedReason }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-4 border-t">
            <button
              @click="openDetailModal(payout)"
              class="btn-outline btn-sm"
            >
              <Eye :size="16" class="mr-1" />
              ดูรายละเอียด
            </button>

            <template v-if="payout.status === 'pending'">
              <button
                @click="markAsProcessing(payout)"
                class="btn-outline btn-sm text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                เริ่มดำเนินการ
              </button>
              <button
                @click="openProcessModal(payout, 'approve')"
                class="btn-primary btn-sm"
              >
                <CheckCircle2 :size="16" class="mr-1" />
                อนุมัติ
              </button>
              <button
                @click="openProcessModal(payout, 'reject')"
                class="btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle :size="16" class="mr-1" />
                ปฏิเสธ
              </button>
            </template>

            <template v-else-if="payout.status === 'processing'">
              <button
                @click="openProcessModal(payout, 'approve')"
                class="btn-primary btn-sm"
              >
                <CheckCircle2 :size="16" class="mr-1" />
                เสร็จสิ้น
              </button>
              <button
                @click="openProcessModal(payout, 'reject')"
                class="btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle :size="16" class="mr-1" />
                ล้มเหลว
              </button>
            </template>
          </div>
        </div>
      </div>

      <div v-else class="card p-12 text-center">
        <Wallet :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">
          ไม่มีคำขอโอนเงิน
        </h3>
        <p class="text-gray-600">
          {{ selectedStatus === 'all' ? 'ยังไม่มีคำขอโอนเงินในระบบ' : `ไม่มีคำขอที่มีสถานะ "${getStatusBadge(selectedStatus as PayoutStatus).text}"` }}
        </p>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="showDetailModal && selectedPayout"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showDetailModal = false"
    >
      <div class="bg-white rounded-lung max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold text-dark mb-6">รายละเอียดคำขอโอนเงิน</h3>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">รหัส</label>
            <p class="text-dark font-mono">{{ selectedPayout.id }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">จำนวนเงิน</label>
            <p class="text-3xl font-bold text-primary">{{ formatBaht(selectedPayout.amountSatang) }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">สถานะ</label>
            <span
              class="px-3 py-1 rounded-full text-sm font-semibold"
              :class="getStatusBadge(selectedPayout.status).class"
            >
              {{ getStatusBadge(selectedPayout.status).text }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">บัญชีธนาคาร</label>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="font-semibold text-dark">{{ selectedPayout.bankAccount.bankName }}</p>
              <p class="text-sm text-gray-600 font-mono">{{ selectedPayout.bankAccount.accountNumber }}</p>
              <p class="text-sm text-gray-600">{{ selectedPayout.bankAccount.accountName }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-1">ขอเมื่อ</label>
            <p class="text-dark">{{ formatDate(selectedPayout.requestedAt) }}</p>
          </div>

          <div v-if="selectedPayout.processedAt">
            <label class="block text-sm font-semibold text-gray-600 mb-1">ดำเนินการเมื่อ</label>
            <p class="text-dark">{{ formatDate(selectedPayout.processedAt) }}</p>
          </div>

          <div v-if="selectedPayout.completedAt">
            <label class="block text-sm font-semibold text-gray-600 mb-1">เสร็จสิ้นเมื่อ</label>
            <p class="text-dark">{{ formatDate(selectedPayout.completedAt) }}</p>
          </div>
        </div>

        <div class="flex justify-end pt-6 border-t mt-6">
          <button @click="showDetailModal = false" class="btn-outline">
            ปิด
          </button>
        </div>
      </div>
    </div>

    <!-- Process Modal -->
    <div
      v-if="showProcessModal && selectedPayout"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showProcessModal = false"
    >
      <div class="bg-white rounded-lung max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-dark mb-6">
          {{ processForm.action === 'approve' ? 'อนุมัติการโอนเงิน' : 'ปฏิเสธการโอนเงิน' }}
        </h3>

        <form @submit.prevent="processPayout" class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-600 mb-1">จำนวนเงิน</p>
            <p class="text-2xl font-bold text-dark">{{ formatBaht(selectedPayout.amountSatang) }}</p>
            <p class="text-sm text-gray-600 mt-2">Partner ID: {{ selectedPayout.partnerId }}</p>
          </div>

          <div v-if="processForm.action === 'reject'">
            <label class="block text-sm font-semibold text-dark mb-2">
              เหตุผลที่ปฏิเสธ <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="processForm.failedReason"
              class="input-lung"
              rows="3"
              placeholder="กรุณาระบุเหตุผล..."
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              v-model="processForm.notes"
              class="input-lung"
              rows="3"
              placeholder="หมายเหตุ (ถ้ามี)"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="showProcessModal = false"
              class="btn-outline"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :class="processForm.action === 'approve' ? 'btn-primary' : 'btn-outline text-red-600 border-red-600'"
            >
              {{ processForm.action === 'approve' ? 'ยืนยันอนุมัติ' : 'ยืนยันปฏิเสธ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
