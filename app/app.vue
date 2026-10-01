<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import NotificationToastContainer from '~/components/notification/NotificationToastContainer.vue'

// Initialize auth on app mount (SSR-safe)
onMounted(() => {
  const authStore = useAuthStore()
  authStore.initAuth()
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NotificationToastContainer />
  </div>
</template>
