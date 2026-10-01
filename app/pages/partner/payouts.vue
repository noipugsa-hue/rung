<script setup lang="ts">
import { Wallet, Plus, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useLedgerStore } from '~/stores/ledger'
import { usePayoutStore } from '~/stores/payout'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import { formatBaht } from '~/utils/money'
import type { Satang } from '~/types/money'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const ledgerStore = useLedgerStore()
const payoutStore = usePayoutStore()
const applicationStore = usePartnerApplicationStore()

const partnerId = computed(() => authStore.user?.id || '')

// Get partner's financial info from application
const application = computed(() =>
  applicationStore.getUserApplication(partnerId.value)
)

const balance = computed(() => {
  if (!partnerId.value) return { totalEarned: 0, pendingPayout: 0, paidOut: 0 }
  return ledgerStore.calculatePartnerBalance(partnerId.value)
})

const payouts = computed(() => payoutStore.getPartnerPayouts(partnerId.value))

const showRequestModal = ref(false)
const requestAmount = ref<number>(0)
const submitting = ref(false)

const canRequestPayout = computed(() => {
  return balance.value.pendingPayout >= payoutStore.MIN_PAYOUT_AMOUNT
})

const minPayoutBaht = computed(() => {
  return payoutStore.MIN_PAYOUT_AMOUNT / 100
})

const maxPayoutBaht = computed(() => {
  return balance.value.pendingPayout / 100
})

function openRequestModal() {
  if (!canRequestPayout.value) {
    alert(`ยอดเงินขั้นต่ำสำหรับการโอนคือ ฿${minPayoutBaht.value}`)
    return
  }
  requestAmount.value = maxPayoutBaht.value
  showRequestModal.value = true
}

async function submitPayoutRequest() {
  if (!partnerId.value || !application.value?.financialInfo || submitting.value) return

  submitting.value = true

  try {
    const amountSatang = Math.round(requestAmount.value * 100)

    await payoutStore.requestPayout(
      partnerId.value,
      amountSatang,
      {
        bankName: application.value.financialInfo.bankName,
        accountNumber: application.value.financialInfo.accountNumber,
        accountName: application.value.financialInfo.accountName
      }
    )

    showRequestModal.value = false
    alert('ส่งคำขอโอนเงินสำเร็จ!')

  } catch (error) {
    console.error('Payout request error:', error)
    alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
  } finally {
    submitting.value = false
  }
}

async function cancelRequest(payoutId: string) {
  if (!confirm('คุณต้องการยกเลิกคำขอโอนเงินนี้หรือไม่?')) return

  try {
    await payoutStore.cancelPayout(payoutId, partnerId.value)
    alert('ยกเลิกคำขอสำเร็จ')
  } catch (error) {
    alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
  }
}

function getStatusBadge(status: string) {
  const badges: Record<string, { class: string; text: string; icon: any }> = {
    pending: { class: 'bg-yellow-100 text-yellow-700', text: 'รอดำเนินการ', icon: Clock },
    processing: { class: 'bg-blue-100 text-blue-700', text: 'กำลังดำเนินการ', icon: Clock },
    completed: { class: 'bg-green-100 text-green-700', text: 'สำเร็จ', icon: CheckCircle2 },
    failed: { class: 'bg-red-100 text-red-700', text: 'ล้มเหลว', icon: XCircle },
    cancelled: { class: 'bg-gray-100 text-gray-700', text: 'ยกเลิก', icon: XCircle }
  }
  return badges[status] || badges.pending
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
    <div class="container-lung max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/partner/earnings" class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-4">
          <ArrowLeft :size="20" />
          <span>กลับไปหน้ารายได้</span>
        </NuxtLink>

        <h1 class="text-3xl font-bold text-dark mb-2">
          การโอนเงิน
        </h1>
        <p class="text-gray-600">
          จัดการคำขอโอนเงินของคุณ
        </p>
      </div>

      <!-- Balance Card -->
      <div class="card p-6 md:p-8 mb-8">
        <div class="flex items-start justify-between mb-6">
          <div>
            <p class="text-sm text-gray-600 mb-2">ยอดเงินรอโอน</p>
            <p class="text-4xl font-bold text-primary mb-4">
              {{ formatBaht(balance.pendingPayout) }}
            </p>
            <p class="text-sm text-gray-600">
              ยอดเงินขั้นต่ำสำหรับการโอน: {{ formatBaht(payoutStore.MIN_PAYOUT_AMOUNT) }}
            </p>
          </div>

          <button
            @click="openRequestModal"
            :disabled="!canRequestPayout"
            class="btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': !canRequestPayout }"
          >
            <Plus :size="20" class="mr-2" />
            ขอโอนเงิน
          </button>
        </div>

        <!-- Bank Account Info -->
        <div v-if="application?.financialInfo" class="pt-6 border-t border-gray-200">
          <p class="text-sm font-semibold text-gray-600 mb-3">บัญชีธนาคารที่ใช้รับเงิน</p>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Wallet :size="24" class="text-dark" />
            </div>
            <div>
              <p class="font-semibold text-dark">{{ application.financialInfo.bankName }}</p>
              <p class="text-sm text-gray-600 font-mono">{{ application.financialInfo.accountNumber }}</p>
              <p class="text-sm text-gray-600">{{ application.financialInfo.accountName }}</p>
            </div>
          </div>
        </div>

        <div v-else class="pt-6 border-t border-gray-200">
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p class="text-sm text-yellow-800">
              กรุณาเพิ่มข้อมูลบัญชีธนาคารในการสมัคร
              <NuxtLink to="/apply" class="text-primary hover:underline ml-1">
                ไปที่ใบสมัคร →
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <!-- Payout History -->
      <div class="card p-6">
        <h2 class="text-xl font-bold text-dark mb-6">ประวัติการโอนเงิน</h2>

        <div v-if="payouts.length > 0" class="space-y-4">
          <div
            v-for="payout in payouts"
            :key="payout.id"
            class="p-4 border-2 border-gray-200 rounded-lung"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                    :class="getStatusBadge(payout.status).class"
                  >
                    <component :is="getStatusBadge(payout.status).icon" :size="16" />
                    {{ getStatusBadge(payout.status).text }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  ขอเมื่อ: {{ formatDate(payout.requestedAt) }}
                </p>
                <p v-if="payout.completedAt" class="text-sm text-gray-600">
                  โอนเมื่อ: {{ formatDate(payout.completedAt) }}
                </p>
              </div>

              <div class="text-right">
                <p class="text-2xl font-bold text-dark mb-1">
                  {{ formatBaht(payout.amountSatang) }}
                </p>
                <p class="text-xs text-gray-600">
                  รหัส: {{ payout.id }}
                </p>
              </div>
            </div>

            <!-- Bank Details -->
            <div class="bg-gray-50 rounded-lg p-3 mb-3">
              <p class="text-xs text-gray-600 mb-1">โอนเข้า</p>
              <p class="text-sm font-semibold text-dark">{{ payout.bankAccount.bankName }}</p>
              <p class="text-sm text-gray-600 font-mono">{{ payout.bankAccount.accountNumber }}</p>
              <p class="text-sm text-gray-600">{{ payout.bankAccount.accountName }}</p>
            </div>

            <!-- Notes -->
            <div v-if="payout.notes" class="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
              <p class="text-sm text-blue-800">
                <strong>หมายเหตุ:</strong> {{ payout.notes }}
              </p>
            </div>

            <!-- Failed Reason -->
            <div v-if="payout.failedReason" class="bg-red-50 border-l-4 border-red-400 p-3 mb-3">
              <p class="text-sm text-red-800">
                <strong>เหตุผล:</strong> {{ payout.failedReason }}
              </p>
            </div>

            <!-- Cancel Button -->
            <button
              v-if="payout.status === 'pending'"
              @click="cancelRequest(payout.id)"
              class="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              ยกเลิกคำขอ
            </button>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <Wallet :size="64" class="text-gray-300 mx-auto mb-4" />
          <p class="text-gray-600 mb-2">ยังไม่มีประวัติการโอนเงิน</p>
          <p class="text-sm text-gray-500">
            เมื่อคุณขอโอนเงิน รายการจะแสดงที่นี่
          </p>
        </div>
      </div>

      <!-- Info Card -->
      <div class="card p-6 bg-cream mt-8">
        <h3 class="font-bold text-dark mb-3">ข้อมูลเกี่ยวกับการโอนเงิน</h3>
        <ul class="text-sm text-gray-700 space-y-2">
          <li>✓ ยอดเงินขั้นต่ำสำหรับการขอโอนคือ {{ formatBaht(payoutStore.MIN_PAYOUT_AMOUNT) }}</li>
          <li>✓ การโอนเงินจะดำเนินการภายใน 3-5 วันทำการ</li>
          <li>✓ คุณจะได้รับการแจ้งเตือนทาง SMS และอีเมลเมื่อโอนเงินสำเร็จ</li>
          <li>✓ ตรวจสอบข้อมูลบัญชีธนาคารให้ถูกต้องก่อนขอโอนเงิน</li>
          <li>✓ หากมีปัญหา กรุณาติดต่อทีมสนับสนุน</li>
        </ul>
      </div>
    </div>

    <!-- Request Payout Modal -->
    <div
      v-if="showRequestModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showRequestModal = false"
    >
      <div class="bg-white rounded-lung max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-dark mb-6">ขอโอนเงิน</h3>

        <form @submit.prevent="submitPayoutRequest" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              จำนวนเงินที่ต้องการโอน (บาท)
            </label>
            <input
              v-model.number="requestAmount"
              type="number"
              :min="minPayoutBaht"
              :max="maxPayoutBaht"
              step="0.01"
              class="input-lung"
              required
            />
            <p class="text-xs text-gray-600 mt-1">
              สูงสุด: ฿{{ maxPayoutBaht.toLocaleString() }}
            </p>
          </div>

          <div v-if="application?.financialInfo" class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm font-semibold text-gray-600 mb-2">โอนเข้าบัญชี</p>
            <p class="text-sm font-semibold text-dark">{{ application.financialInfo.bankName }}</p>
            <p class="text-sm text-gray-600 font-mono">{{ application.financialInfo.accountNumber }}</p>
            <p class="text-sm text-gray-600">{{ application.financialInfo.accountName }}</p>
          </div>

          <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p class="text-sm text-blue-800">
              การโอนเงินจะดำเนินการภายใน 3-5 วันทำการ และคุณจะได้รับการแจ้งเตือนเมื่อเสร็จสิ้น
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="showRequestModal = false"
              class="btn-outline"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="btn-primary"
              :class="{ 'opacity-50 cursor-wait': submitting }"
            >
              {{ submitting ? 'กำลังส่งคำขอ...' : 'ยืนยันขอโอนเงิน' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
