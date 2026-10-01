<script setup lang="ts">
import { TrendingUp, TrendingDown, Calendar, Search, Download } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth'
})

const searchQuery = ref('')
const filterType = ref('all')

const transactions = [
  {
    id: 'TXN-001',
    type: 'earning',
    description: 'การจองจาก คุณสมชาย',
    bookingId: 'BK-001',
    amount: 540,
    commission: 60,
    netAmount: 480,
    date: '2026-09-28',
    status: 'completed'
  },
  {
    id: 'TXN-002',
    type: 'earning',
    description: 'การจองจาก คุณสมหญิง',
    bookingId: 'BK-002',
    amount: 270,
    commission: 30,
    netAmount: 240,
    date: '2026-09-27',
    status: 'completed'
  },
  {
    id: 'TXN-003',
    type: 'payout',
    description: 'โอนเงินเข้าบัญชี',
    amount: 5000,
    date: '2026-09-25',
    status: 'completed',
    bankAccount: 'xxx-x-x1234-x'
  },
  {
    id: 'TXN-004',
    type: 'earning',
    description: 'การจองจาก คุณโจ',
    bookingId: 'BK-003',
    amount: 810,
    commission: 90,
    netAmount: 720,
    date: '2026-09-20',
    status: 'completed'
  },
  {
    id: 'TXN-005',
    type: 'refund',
    description: 'คืนเงินการจองที่ยกเลิก',
    bookingId: 'BK-005',
    amount: -540,
    date: '2026-09-18',
    status: 'completed'
  },
]

const filteredTransactions = computed(() => {
  return transactions.filter(txn => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesType = filterType.value === 'all' || txn.type === filterType.value

    return matchesSearch && matchesType
  })
})

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'earning':
      return TrendingUp
    case 'payout':
    case 'refund':
      return TrendingDown
    default:
      return TrendingUp
  }
}

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'earning':
      return 'text-green-600'
    case 'payout':
      return 'text-blue-600'
    case 'refund':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    earning: 'รายได้',
    payout: 'โอนเงิน',
    refund: 'คืนเงิน'
  }
  return labels[type] || type
}

const exportTransactions = () => {
  console.log('Export transactions')
  // Implement export logic
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <!-- Header -->
      <div class="mb-8 flex items-start justify-between">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
            ประวัติการทำรายการ
          </h1>
          <p class="text-gray-600">ดูประวัติรายได้และการโอนเงินทั้งหมด</p>
        </div>

        <button
          @click="exportTransactions"
          class="btn-outline flex items-center gap-2"
        >
          <Download :size="18" />
          ส่งออก
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-green-100 rounded-lung flex items-center justify-center">
              <TrendingUp :size="24" class="text-green-600" />
            </div>
            <div>
              <div class="text-sm text-gray-600">รายได้รวม</div>
              <div class="text-2xl font-bold text-dark">฿1,440</div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-blue-100 rounded-lung flex items-center justify-center">
              <TrendingDown :size="24" class="text-blue-600" />
            </div>
            <div>
              <div class="text-sm text-gray-600">โอนออกแล้ว</div>
              <div class="text-2xl font-bold text-dark">฿5,000</div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-primary rounded-lung flex items-center justify-center">
              <Calendar :size="24" class="text-dark" />
            </div>
            <div>
              <div class="text-sm text-gray-600">รายการทั้งหมด</div>
              <div class="text-2xl font-bold text-dark">{{ transactions.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Search -->
          <div class="relative">
            <Search :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหารหัสรายการ, คำอธิบาย..."
              class="w-full pl-10 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <!-- Type Filter -->
          <select
            v-model="filterType"
            class="px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
          >
            <option value="all">ทุกประเภท</option>
            <option value="earning">รายได้</option>
            <option value="payout">โอนเงิน</option>
            <option value="refund">คืนเงิน</option>
          </select>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="card divide-y divide-gray-100">
        <div
          v-for="txn in filteredTransactions"
          :key="txn.id"
          class="p-6 hover:bg-cream/50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4 flex-1">
              <!-- Icon -->
              <div :class="['w-12 h-12 rounded-lung flex items-center justify-center',
                txn.type === 'earning' ? 'bg-green-100' :
                txn.type === 'payout' ? 'bg-blue-100' : 'bg-red-100']">
                <component
                  :is="getTransactionIcon(txn.type)"
                  :size="24"
                  :class="getTransactionColor(txn.type)"
                />
              </div>

              <!-- Details -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="font-bold text-dark">{{ txn.description }}</h3>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-sm text-gray-600">{{ txn.id }}</span>
                      <span v-if="txn.bookingId" class="text-xs px-2 py-1 bg-cream rounded-full">
                        {{ txn.bookingId }}
                      </span>
                      <span :class="['text-xs px-2 py-1 rounded-full font-medium', getTransactionColor(txn.type)]">
                        {{ getTypeLabel(txn.type) }}
                      </span>
                    </div>
                  </div>

                  <!-- Amount -->
                  <div class="text-right">
                    <div :class="['text-2xl font-bold', getTransactionColor(txn.type)]">
                      {{ txn.amount >= 0 ? '+' : '' }}฿{{ Math.abs(txn.amount) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ new Date(txn.date).toLocaleDateString('th-TH') }}
                    </div>
                  </div>
                </div>

                <!-- Additional Info -->
                <div v-if="txn.commission !== undefined" class="text-sm text-gray-600 mt-2">
                  <div class="flex gap-4">
                    <span>ค่าคอมมิชชั่น: ฿{{ txn.commission }}</span>
                    <span>รายได้สุทธิ: <strong class="text-dark">฿{{ txn.netAmount }}</strong></span>
                  </div>
                </div>

                <div v-if="txn.bankAccount" class="text-sm text-gray-600 mt-2">
                  โอนเข้าบัญชี: {{ txn.bankAccount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTransactions.length === 0" class="card p-12 text-center">
        <Calendar :size="48" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">ไม่พบรายการ</h3>
        <p class="text-gray-600">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
      </div>
    </div>
  </div>
</template>
