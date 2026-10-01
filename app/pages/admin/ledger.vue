<script setup lang="ts">
import { FileText, Download, Filter, Search, Calendar } from 'lucide-vue-next'
import { useLedgerStore } from '~/stores/ledger'
import { formatBaht } from '~/utils/money'
import type { LedgerEntryType, LedgerEntryStatus } from '~/types/ledger'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const ledgerStore = useLedgerStore()

const searchQuery = ref('')
const filterType = ref<LedgerEntryType | 'all'>('all')
const filterStatus = ref<LedgerEntryStatus | 'all'>('all')

const entries = computed(() => {
  let filtered = ledgerStore.entries

  // Filter by type
  if (filterType.value !== 'all') {
    filtered = filtered.filter(e => e.type === filterType.value)
  }

  // Filter by status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(e => e.status === filterStatus.value)
  }

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(e =>
      e.id.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.bookingId?.toLowerCase().includes(query) ||
      e.partnerId?.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

const stats = computed(() => {
  const all = ledgerStore.entries

  const bookingPayments = all
    .filter(e => e.type === 'booking_payment')
    .reduce((sum, e) => sum + e.amountSatang, 0)

  const commissions = all
    .filter(e => e.type === 'commission')
    .reduce((sum, e) => sum + e.amountSatang, 0)

  const payouts = all
    .filter(e => e.type === 'payout')
    .reduce((sum, e) => sum + Math.abs(e.amountSatang), 0)

  const refunds = all
    .filter(e => e.type === 'refund')
    .reduce((sum, e) => sum + e.amountSatang, 0)

  return {
    totalEntries: all.length,
    bookingPayments,
    commissions,
    payouts,
    refunds
  }
})

function getTypeLabel(type: LedgerEntryType): string {
  const labels: Record<LedgerEntryType, string> = {
    booking_payment: 'รับชำระ',
    commission: 'คอมมิชชั่น',
    payout: 'โอนเงิน',
    refund: 'คืนเงิน'
  }
  return labels[type]
}

function getTypeColor(type: LedgerEntryType): string {
  const colors: Record<LedgerEntryType, string> = {
    booking_payment: 'bg-green-100 text-green-700',
    commission: 'bg-blue-100 text-blue-700',
    payout: 'bg-purple-100 text-purple-700',
    refund: 'bg-orange-100 text-orange-700'
  }
  return colors[type]
}

function getStatusBadge(status: LedgerEntryStatus) {
  const badges: Record<LedgerEntryStatus, { class: string; text: string }> = {
    pending: { class: 'bg-yellow-100 text-yellow-700', text: 'รอดำเนินการ' },
    completed: { class: 'bg-green-100 text-green-700', text: 'สำเร็จ' },
    failed: { class: 'bg-red-100 text-red-700', text: 'ล้มเหลว' }
  }
  return badges[status]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function exportToCSV() {
  // Simple CSV export
  const headers = ['วันที่', 'ประเภท', 'จำนวน', 'สถานะ', 'รายละเอียด', 'รหัส']
  const rows = entries.value.map(e => [
    formatDate(e.createdAt),
    getTypeLabel(e.type),
    e.amountSatang / 100,
    e.status,
    e.description,
    e.id
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">
          บัญชีแยกประเภท
        </h1>
        <p class="text-gray-600">
          ดูและจัดการธุรกรรมทางการเงินทั้งหมด
        </p>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div class="card p-4 md:p-6">
          <p class="text-sm text-gray-600 mb-1">รายการทั้งหมด</p>
          <p class="text-2xl md:text-3xl font-bold text-dark">{{ stats.totalEntries }}</p>
        </div>

        <div class="card p-4 md:p-6">
          <p class="text-sm text-gray-600 mb-1">รับชำระ</p>
          <p class="text-xl md:text-2xl font-bold text-green-600">
            {{ formatBaht(stats.bookingPayments) }}
          </p>
        </div>

        <div class="card p-4 md:p-6">
          <p class="text-sm text-gray-600 mb-1">คอมมิชชั่น</p>
          <p class="text-xl md:text-2xl font-bold text-blue-600">
            {{ formatBaht(stats.commissions) }}
          </p>
        </div>

        <div class="card p-4 md:p-6">
          <p class="text-sm text-gray-600 mb-1">โอนเงิน</p>
          <p class="text-xl md:text-2xl font-bold text-purple-600">
            {{ formatBaht(stats.payouts) }}
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-dark mb-2">
              <Search :size="16" class="inline mr-1" />
              ค้นหา
            </label>
            <input
              v-model="searchQuery"
              type="text"
              class="input-lung"
              placeholder="ค้นหารหัส, รายละเอียด..."
            />
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              <Filter :size="16" class="inline mr-1" />
              ประเภท
            </label>
            <select v-model="filterType" class="input-lung">
              <option value="all">ทั้งหมด</option>
              <option value="booking_payment">รับชำระ</option>
              <option value="commission">คอมมิชชั่น</option>
              <option value="payout">โอนเงิน</option>
              <option value="refund">คืนเงิน</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-semibold text-dark mb-2">
              สถานะ
            </label>
            <select v-model="filterStatus" class="input-lung">
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="completed">สำเร็จ</option>
              <option value="failed">ล้มเหลว</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <button @click="exportToCSV" class="btn-outline text-sm">
            <Download :size="16" class="mr-2" />
            ส่งออก CSV
          </button>
        </div>
      </div>

      <!-- Entries Table -->
      <div class="card p-6">
        <div class="overflow-x-auto">
          <table v-if="entries.length > 0" class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">วันที่</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">ประเภท</th>
                <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">จำนวน</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">สถานะ</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">รายละเอียด</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">อ้างอิง</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in entries"
                :key="entry.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4 text-sm text-gray-700">
                  {{ formatDate(entry.createdAt) }}
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="getTypeColor(entry.type)"
                  >
                    {{ getTypeLabel(entry.type) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <span
                    class="font-bold"
                    :class="{
                      'text-green-600': entry.type === 'booking_payment',
                      'text-red-600': entry.type === 'commission' || entry.type === 'payout',
                      'text-orange-600': entry.type === 'refund'
                    }"
                  >
                    {{ entry.type === 'commission' || entry.type === 'payout' ? '-' : '+' }}{{ formatBaht(entry.amountSatang) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="getStatusBadge(entry.status).class"
                  >
                    {{ getStatusBadge(entry.status).text }}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-700">
                  {{ entry.description }}
                </td>
                <td class="py-3 px-4 text-xs">
                  <div v-if="entry.bookingId" class="text-gray-600 mb-1">
                    📋 {{ entry.bookingId }}
                  </div>
                  <div v-if="entry.partnerId" class="text-gray-600">
                    👤 {{ entry.partnerId }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="text-center py-12">
            <FileText :size="64" class="text-gray-300 mx-auto mb-4" />
            <p class="text-gray-600 mb-2">ไม่พบรายการ</p>
            <p class="text-sm text-gray-500">
              ลองเปลี่ยนตัวกรองหรือคำค้นหา
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
