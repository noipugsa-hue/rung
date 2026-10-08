<script setup lang="ts">
import { LayoutDashboard, Users, DollarSign, FileText, TrendingUp, Settings, LogOut, Menu, X, UserCheck, Wrench } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()

// SSR-safe store access
const authStore = computed(() => {
  if (process.client) {
    return useAuthStore()
  }
  return null
})

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleLogout = () => {
  if (authStore.value) {
    authStore.value.logout()
  }
  router.push('/login')
}

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target && authStore.value?.user) {
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.value.user.name)}&background=FFDBB5&color=FF6B35`
  }
}

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'จัดการผู้ใช้', icon: Users },
  { path: '/admin/applications', label: 'ใบสมัครพาร์ทเนอร์', icon: UserCheck },
  { path: '/admin/lungs', label: 'จัดการลุง', icon: UserCheck },
  { path: '/admin/bookings', label: 'การจอง', icon: FileText },
  { path: '/admin/payouts', label: 'จัดการการโอนเงิน', icon: TrendingUp },
  { path: '/admin/ledger', label: 'บัญชีแยกประเภท', icon: FileText },
  { path: '/admin/commission', label: 'ตั้งค่าคอมมิชชั่น', icon: DollarSign },
  { path: '/admin/fix-applications', label: '🔧 แก้ไขเอกสารที่มีปัญหา', icon: Wrench }
]
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-gray-50">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 sticky top-0 h-screen">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-200">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="text-2xl font-bold text-dark">LUNG</div>
          <div class="px-2 py-0.5 bg-primary rounded text-xs font-semibold text-dark">Admin</div>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="flex items-center gap-3 px-4 py-3 rounded-lung transition-colors font-medium"
              :class="isActive(item.path) ? 'bg-primary text-dark' : 'text-gray-700 hover:bg-gray-100'"
            >
              <component :is="item.icon" :size="20" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- User Info -->
      <div class="p-4 border-t border-gray-200">
        <div v-if="authStore?.value?.user" class="flex items-center gap-3 mb-3">
          <img
            :src="authStore.value.user.avatar"
            :alt="authStore.value.user.name"
            class="w-10 h-10 rounded-full object-cover bg-gray-200"
            @error="handleAvatarError"
          />
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-dark truncate">{{ authStore.value.user.name }}</div>
            <div class="text-xs text-gray-600 truncate">{{ authStore.value.user.email }}</div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lung transition-colors font-medium"
        >
          <LogOut :size="18" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <div class="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="flex items-center justify-between h-16 px-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="text-xl font-bold text-dark">LUNG</div>
          <div class="px-2 py-0.5 bg-primary rounded text-xs font-semibold text-dark">Admin</div>
        </NuxtLink>
        <button @click="toggleMenu" class="p-2 text-dark">
          <Menu v-if="!isMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="isMenuOpen"
        class="border-t border-gray-100 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto"
      >
        <nav class="p-4 space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lung transition-colors font-medium"
            :class="isActive(item.path) ? 'bg-primary text-dark' : 'text-gray-700 hover:bg-gray-100'"
          >
            <component :is="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="p-4 border-t border-gray-200">
          <div v-if="authStore?.value?.user" class="flex items-center gap-3 mb-3">
            <img
              :src="authStore.value.user.avatar"
              :alt="authStore.value.user.name"
              class="w-10 h-10 rounded-full object-cover bg-gray-200"
              @error="handleAvatarError"
            />
            <div>
              <div class="font-semibold text-dark">{{ authStore.value.user.name }}</div>
              <div class="text-xs text-gray-600">{{ authStore.value.user.email }}</div>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lung transition-colors font-medium"
          >
            <LogOut :size="18" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 md:overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
