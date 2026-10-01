<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

// Redirect to dashboard
navigateTo('/admin/dashboard', { replace: true })
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
      <p class="text-gray-600">กำลังโหลด...</p>
    </div>
  </div>
</template>
