<script setup lang="ts">
import { User, Calendar, Heart, MessageCircle, Star, Settings, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target && authStore.user) {
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user.name)}&background=FFDBB5&color=FF6B35&size=80`
  }
}

const menuItems = [
  { icon: User, label: 'โปรไฟล์', to: '/account/profile' },
  { icon: Calendar, label: 'การจองของฉัน', to: '/account/bookings' },
  { icon: Heart, label: 'รายการถูกใจ', to: '/favorites' },
  { icon: MessageCircle, label: 'ข้อความ', to: '/messages' },
  { icon: Star, label: 'รีวิวของฉัน', to: '/account/reviews' },
  { icon: Settings, label: 'ตั้งค่า', to: '/account/settings' },
]
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-4xl">
      <h1 class="text-3xl md:text-4xl font-bold text-dark mb-8">
        บัญชีของฉัน
      </h1>

      <!-- Profile card -->
      <div class="card p-6 mb-8">
        <div class="flex items-center gap-4">
          <img
            :src="authStore.user?.avatar"
            :alt="authStore.user?.name"
            class="w-20 h-20 rounded-full object-cover bg-gray-200"
            @error="handleAvatarError"
          />
          <div>
            <h2 class="text-2xl font-bold text-dark">{{ authStore.user?.name }}</h2>
            <p class="text-gray-600">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <div class="card divide-y divide-gray-100">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-4 p-4 hover:bg-cream transition-colors group"
        >
          <div class="w-12 h-12 bg-cream group-hover:bg-primary rounded-full flex items-center justify-center transition-colors">
            <component :is="item.icon" :size="24" class="text-dark" />
          </div>
          <span class="flex-1 font-medium text-dark">{{ item.label }}</span>
          <span class="text-gray-400">→</span>
        </NuxtLink>

        <button @click="handleLogout" class="flex items-center gap-4 p-4 hover:bg-red-50 transition-colors group w-full text-left">
          <div class="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors">
            <LogOut :size="24" class="text-red-600" />
          </div>
          <span class="flex-1 font-medium text-red-600">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  </div>
</template>
