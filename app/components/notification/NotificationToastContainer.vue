<script setup lang="ts">
import NotificationToast from './NotificationToast.vue'

const { toasts, dismissToast } = useNotificationToast()
</script>

<template>
  <div
    class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
    aria-live="polite"
    aria-atomic="true"
  >
    <Transition
      v-for="toast in toasts"
      :key="toast.id"
      name="toast"
      appear
    >
      <NotificationToast
        :toast="toast"
        @dismiss="dismissToast(toast.id)"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* Slide in from right */
.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Mobile: Stack from top */
@media (max-width: 640px) {
  .toast-enter-active {
    animation: slideInTop 0.3s ease-out;
  }

  .toast-leave-active {
    animation: slideOutTop 0.3s ease-in;
  }

  @keyframes slideInTop {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOutTop {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
}
</style>
