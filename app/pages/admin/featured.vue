<script setup lang="ts">
import { Star, Plus, Eye, MousePointerClick, ToggleLeft, ToggleRight, Trash2 } from 'lucide-vue-next'
import { useFeaturedStore } from '~/stores/featured'
import type { FeaturedItem } from '~/types/featured'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const featuredStore = useFeaturedStore()
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    await featuredStore.getAllFeaturedItems()
  } catch (err) {
    console.error('Load featured items error:', err)
  } finally {
    loading.value = false
  }
})

const statusColors = {
  true: 'text-green-600 bg-green-100',
  false: 'text-gray-600 bg-gray-100'
}

async function handleToggleActive(item: FeaturedItem) {
  const { showSuccess, showError } = useNotificationToast()

  const success = await featuredStore.toggleActive(item.id)

  if (success) {
    showSuccess('สำเร็จ', `${item.isActive ? 'ปิด' : 'เปิด'}การแสดงผลแล้ว`)
    await featuredStore.getAllFeaturedItems()
  } else {
    showError('ข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง')
  }
}

async function handleDelete(item: FeaturedItem) {
  if (!confirm(`ต้องการลบ "${item.title}" ใช่หรือไม่?`)) return

  const { showSuccess, showError } = useNotificationToast()

  const success = await featuredStore.deleteFeaturedItem(item.id)

  if (success) {
    showSuccess('สำเร็จ', 'ลบรายการแล้ว')
  } else {
    showError('ข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง')
  }
}

function isActive(item: FeaturedItem): boolean {
  const now = new Date()
  const start = new Date(item.startDate)
  const end = new Date(item.endDate)

  return item.isActive && now >= start && now <= end
}
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-dark mb-2">จัดการรายการแนะนำ</h1>
        <p class="text-gray-600">จัดการแคมเปญและ Lung ที่แนะนำ</p>
      </div>

      <button class="btn-primary flex items-center gap-2">
        <Plus :size="20" />
        <span>เพิ่มรายการใหม่</span>
      </button>
    </div>

    <!-- Stats -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="text-3xl font-bold text-dark mb-1">
          {{ featuredStore.featuredItems.length }}
        </div>
        <div class="text-sm text-gray-600">รายการทั้งหมด</div>
      </div>

      <div class="bg-green-50 rounded-2xl p-6 border border-green-200">
        <div class="text-3xl font-bold text-green-700 mb-1">
          {{ featuredStore.featuredItems.filter(i => isActive(i)).length }}
        </div>
        <div class="text-sm text-green-700">กำลังแสดงผล</div>
      </div>

      <div class="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div class="text-3xl font-bold text-blue-700 mb-1">
          {{ featuredStore.featuredItems.reduce((sum, i) => sum + i.impressionCount, 0).toLocaleString() }}
        </div>
        <div class="text-sm text-blue-700">ยอดดูทั้งหมด</div>
      </div>

      <div class="bg-orange-50 rounded-2xl p-6 border border-orange-200">
        <div class="text-3xl font-bold text-orange-700 mb-1">
          {{ featuredStore.featuredItems.reduce((sum, i) => sum + i.clickCount, 0).toLocaleString() }}
        </div>
        <div class="text-sm text-orange-700">คลิกทั้งหมด</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>

    <!-- Featured Items Table -->
    <div v-else-if="featuredStore.featuredItems.length > 0" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">รายการ</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ประเภท</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ระยะเวลา</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">ยอดดู</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">คลิก</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="item in featuredStore.featuredItems"
              :key="item.id"
              class="hover:bg-gray-50"
            >
              <!-- Title -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="item.imageUrl"
                    :alt="item.title"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p class="font-semibold text-dark">{{ item.title }}</p>
                    <p class="text-sm text-gray-500 line-clamp-1">{{ item.description }}</p>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-blue-100 text-blue-700': item.type === 'lung',
                    'bg-green-100 text-green-700': item.type === 'activity',
                    'bg-purple-100 text-purple-700': item.type === 'campaign'
                  }"
                >
                  {{ item.type === 'lung' ? 'Lung' : item.type === 'activity' ? 'กิจกรรม' : 'แคมเปญ' }}
                </span>
              </td>

              <!-- Duration -->
              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="text-gray-700">{{ new Date(item.startDate).toLocaleDateString('th-TH', { dateStyle: 'short' }) }}</p>
                  <p class="text-gray-500">ถึง {{ new Date(item.endDate).toLocaleDateString('th-TH', { dateStyle: 'short' }) }}</p>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
                  :class="statusColors[String(isActive(item)) as 'true' | 'false']"
                >
                  {{ isActive(item) ? 'แสดงอยู่' : 'ปิด' }}
                </span>
              </td>

              <!-- Impressions -->
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1 text-sm text-gray-700">
                  <Eye :size="16" />
                  <span>{{ item.impressionCount.toLocaleString() }}</span>
                </div>
              </td>

              <!-- Clicks -->
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1 text-sm text-gray-700">
                  <MousePointerClick :size="16" />
                  <span>{{ item.clickCount.toLocaleString() }}</span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="handleToggleActive(item)"
                    class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    :title="item.isActive ? 'ปิดการแสดงผล' : 'เปิดการแสดงผล'"
                  >
                    <ToggleRight v-if="item.isActive" :size="20" class="text-green-600" />
                    <ToggleLeft v-else :size="20" class="text-gray-400" />
                  </button>

                  <button
                    @click="handleDelete(item)"
                    class="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 :size="20" class="text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-2xl p-12 text-center border border-gray-200">
      <Star :size="64" class="mx-auto text-gray-300 mb-4" />
      <h3 class="text-xl font-bold text-dark mb-2">ยังไม่มีรายการแนะนำ</h3>
      <p class="text-gray-600 mb-6">เริ่มสร้างรายการแนะนำเพื่อโปรโมทกิจกรรมและ Lung ยอดนิยม</p>
      <button class="btn-primary inline-flex items-center gap-2">
        <Plus :size="20" />
        <span>เพิ่มรายการแรก</span>
      </button>
    </div>
  </div>
</template>
