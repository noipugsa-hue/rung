<script setup lang="ts">
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import type { ToastNotification } from '~/types/notification'

const props = defineProps<{
  toast: ToastNotification
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const router = useRouter()

// Get icon component based on type
const iconComponent = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return CheckCircle2
    case 'error':
      return XCircle
    case 'warning':
      return AlertTriangle
    case 'info':
    default:
      return Info
  }
})

// Get color classes based on type
const colorClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return {
        bg: 'bg-green-50 border-green-200',
        icon: 'text-green-500',
        text: 'text-green-800'
      }
    case 'error':
      return {
        bg: 'bg-red-50 border-red-200',
        icon: 'text-red-500',
        text: 'text-red-800'
      }
    case 'warning':
      return {
        bg: 'bg-orange-50 border-orange-200',
        icon: 'text-orange-500',
        text: 'text-orange-800'
      }
    case 'info':
    default:
      return {
        bg: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-500',
        text: 'text-blue-800'
      }
  }
})

function handleAction() {
  if (props.toast.actionUrl) {
    router.push(props.toast.actionUrl)
    emit('dismiss')
  }
}

function handleDismiss() {
  emit('dismiss')
}
</script>

<template>
  <div
    class="w-full max-w-sm rounded-2xl shadow-lg border pointer-events-auto overflow-hidden"
    :class="colorClasses.bg"
  >
    <div class="p-4">
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0 pt-0.5">
          <component :is="iconComponent" :size="20" :class="colorClasses.icon" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-sm mb-0.5" :class="colorClasses.text">
            {{ toast.title }}
          </h4>
          <p class="text-sm" :class="colorClasses.text">
            {{ toast.message }}
          </p>

          <!-- Action Button -->
          <button
            v-if="toast.actionUrl && toast.actionLabel"
            type="button"
            @click="handleAction"
            class="mt-2 text-sm font-medium underline hover:no-underline transition-all"
            :class="colorClasses.text"
          >
            {{ toast.actionLabel }}
          </button>
        </div>

        <!-- Dismiss Button -->
        <button
          type="button"
          @click="handleDismiss"
          class="flex-shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
          aria-label="ปิด"
        >
          <X :size="16" :class="colorClasses.text" />
        </button>
      </div>
    </div>

    <!-- Progress Bar (optional visual indicator) -->
    <div
      v-if="toast.duration && toast.duration > 0"
      class="h-1 bg-black/10"
      :class="{
        'animate-progress': toast.duration > 0
      }"
      :style="{
        animationDuration: `${toast.duration}ms`
      }"
    />
  </div>
</template>

<style scoped>
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-progress {
  animation: progress linear forwards;
}
</style>
