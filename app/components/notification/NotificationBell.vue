<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import NotificationItem from './NotificationItem.vue'

const notificationStore = useNotificationStore()
const router = useRouter()
const showDropdown = ref(false)

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.notification-bell')) {
      showDropdown.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleNotificationClick() {
  showDropdown.value = false
}

function handleViewAll() {
  showDropdown.value = false
  router.push('/notifications')
}

async function handleMarkAllRead() {
  const authStore = useAuthStore()
  if (authStore.user?.id) {
    await notificationStore.markAllAsRead(authStore.user.id)
  }
}
</script>

<template>
  <div class="relative notification-bell">
    <!-- Bell Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="การแจ้งเตือน"
    >
      <Bell :size="24" class="text-dark" />

      <!-- Unread Badge -->
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-dark">การแจ้งเตือน</h3>
            <button
              v-if="notificationStore.unreadCount > 0"
              type="button"
              @click="handleMarkAllRead"
              class="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              อ่านทั้งหมด
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Empty State -->
          <div
            v-if="notificationStore.recentNotifications.length === 0"
            class="py-12 text-center"
          >
            <Bell :size="48" class="mx-auto text-gray-300 mb-3" />
            <p class="text-gray-500 text-sm">ไม่มีการแจ้งเตือน</p>
          </div>

          <!-- Notifications -->
          <div v-else class="divide-y divide-gray-100">
            <NotificationItem
              v-for="notification in notificationStore.recentNotifications"
              :key="notification.id"
              :notification="notification"
              :compact="true"
              @click="handleNotificationClick"
            />
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="notificationStore.notifications.length > 5"
          class="px-4 py-3 border-t border-gray-200"
        >
          <button
            type="button"
            @click="handleViewAll"
            class="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            ดูทั้งหมด
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
