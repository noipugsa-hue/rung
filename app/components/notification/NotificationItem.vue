<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import type { Notification } from '~/types/notification'

const props = defineProps<{
  notification: Notification
  compact?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const router = useRouter()
const notificationStore = useNotificationStore()

// Format time relative (e.g., "5 minutes ago")
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return 'เมื่อสักครู่'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`
  } else if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`
  } else if (diffInDays === 1) {
    return 'เมื่อวาน'
  } else {
    return `${diffInDays} วันที่แล้ว`
  }
}

async function handleClick() {
  // Mark as read
  if (!props.notification.read) {
    await notificationStore.markAsRead(props.notification.id)
  }

  // Navigate if action URL exists
  if (props.notification.actionUrl) {
    router.push(props.notification.actionUrl)
  }

  emit('click')
}
</script>

<template>
  <button
    type="button"
    @click="handleClick"
    class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
    :class="{
      'bg-blue-50/50': !notification.read,
      'py-2': compact
    }"
  >
    <div class="flex items-start gap-3">
      <!-- Actor Avatar -->
      <div v-if="notification.actorAvatar" class="flex-shrink-0">
        <img
          :src="notification.actorAvatar"
          :alt="notification.actorName"
          class="w-10 h-10 rounded-full object-cover"
          :class="{ 'w-8 h-8': compact }"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4
          class="font-semibold text-dark mb-0.5"
          :class="{
            'text-sm': compact,
            'text-base': !compact
          }"
        >
          {{ notification.title }}
        </h4>
        <p
          class="text-gray-600"
          :class="{
            'text-xs': compact,
            'text-sm': !compact
          }"
        >
          {{ notification.message }}
        </p>

        <!-- Time -->
        <div class="flex items-center gap-1 mt-1">
          <Clock :size="12" class="text-gray-400" />
          <span class="text-xs text-gray-400">
            {{ getRelativeTime(notification.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Unread Indicator -->
      <div v-if="!notification.read" class="flex-shrink-0 pt-2">
        <div class="w-2 h-2 rounded-full bg-primary" />
      </div>
    </div>
  </button>
</template>
