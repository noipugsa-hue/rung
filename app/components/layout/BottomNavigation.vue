<script setup lang="ts">
import { Home, Search, Calendar, MessageCircle, User } from 'lucide-vue-next'

const route = useRoute()

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
    <div class="grid grid-cols-5 h-16">
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center gap-1 transition-colors"
        :class="isActive('/') && route.path === '/' ? 'text-primary' : 'text-gray-600'"
      >
        <Home :size="20" />
        <span class="text-xs font-medium">หน้าแรก</span>
      </NuxtLink>

      <NuxtLink
        to="/search"
        class="flex flex-col items-center justify-center gap-1 transition-colors"
        :class="isActive('/search') ? 'text-primary' : 'text-gray-600'"
      >
        <Search :size="20" />
        <span class="text-xs font-medium">ค้นหา</span>
      </NuxtLink>

      <NuxtLink
        to="/account/bookings"
        class="flex flex-col items-center justify-center gap-1 transition-colors"
        :class="isActive('/booking') || isActive('/account/bookings') ? 'text-primary' : 'text-gray-600'"
      >
        <Calendar :size="20" />
        <span class="text-xs font-medium">จอง</span>
      </NuxtLink>

      <NuxtLink
        to="/messages"
        class="flex flex-col items-center justify-center gap-1 transition-colors"
        :class="isActive('/messages') ? 'text-primary' : 'text-gray-600'"
      >
        <MessageCircle :size="20" />
        <span class="text-xs font-medium">ข้อความ</span>
      </NuxtLink>

      <NuxtLink
        to="/account"
        class="flex flex-col items-center justify-center gap-1 transition-colors"
        :class="isActive('/account') ? 'text-primary' : 'text-gray-600'"
      >
        <User :size="20" />
        <span class="text-xs font-medium">บัญชี</span>
      </NuxtLink>
    </div>
  </nav>
</template>
