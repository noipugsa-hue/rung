<script setup lang="ts">
import { Bell, Check } from 'lucide-vue-next'
import NotificationItem from '~/components/notification/NotificationItem.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const filter = ref<'all' | 'unread'>('all')
const loading = ref(false)

// Fetch notifications on mount
onMounted(async () => {
  if (!authStore.user?.id) return
  await notificationStore.fetchNotifications(authStore.user.id)
})

// Filtered notifications based on current filter
const filteredNotifications = computed(() => {
  if (filter.value === 'unread') {
    return notificationStore.unreadNotifications
  }
  return notificationStore.notifications
})

// Mark all as read
async function handleMarkAllRead() {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    await notificationStore.markAllAsRead(authStore.user.id)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-cream py-8">
    <div class="container-custom mx-auto px-4 max-w-4xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">การแจ้งเตือน</h1>
        <p class="text-gray-600">ติดตามข่าวสารและการอัปเดตทั้งหมด</p>
      </div>

      <!-- Filter and Actions -->
      <div class="bg-white rounded-2xl p-4 mb-6 flex items-center justify-between">
        <!-- Filters -->
        <div class="flex gap-2">
          <button
            type="button"
            @click="filter = 'all'"
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="[
              filter === 'all'
                ? 'bg-primary text-dark'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            ทั้งหมด ({{ notificationStore.notifications.length }})
          </button>
          <button
            type="button"
            @click="filter = 'unread'"
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="[
              filter === 'unread'
                ? 'bg-primary text-dark'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            ยังไม่ได้อ่าน ({{ notificationStore.unreadCount }})
          </button>
        </div>

        <!-- Mark All Read Button -->
        <button
          v-if="notificationStore.unreadCount > 0"
          type="button"
          @click="handleMarkAllRead"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          <Check :size="16" />
          <span>อ่านทั้งหมด</span>
        </button>
      </div>

      <!-- Notifications List -->
      <div class="bg-white rounded-2xl overflow-hidden border border-gray-200">
        <!-- Empty State -->
        <div
          v-if="filteredNotifications.length === 0"
          class="text-center py-16"
        >
          <Bell :size="64" class="mx-auto text-gray-300 mb-4" />
          <h3 class="text-lg font-semibold text-gray-600 mb-2">
            {{ filter === 'unread' ? 'ไม่มีการแจ้งเตือนที่ยังไม่ได้อ่าน' : 'ไม่มีการแจ้งเตือน' }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ filter === 'unread' ? 'คุณได้อ่านการแจ้งเตือนทั้งหมดแล้ว' : 'เมื่อมีข่าวสารใหม่ จะแจ้งให้คุณทราบที่นี่' }}
          </p>
        </div>

        <!-- Notifications -->
        <div v-else class="divide-y divide-gray-100">
          <NotificationItem
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :notification="notification"
          />
        </div>
      </div>

      <!-- Load More (if needed in future) -->
      <!-- <div class="mt-6 text-center">
        <button
          type="button"
          class="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
        >
          โหลดเพิ่มเติม
        </button>
      </div> -->
    </div>
  </div>
</template>
