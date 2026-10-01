<script setup lang="ts">
import { Menu, X, Search, Heart, User, LogOut, ChevronDown, LayoutDashboard, Wallet, TrendingUp } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import NotificationBell from '~/components/notification/NotificationBell.vue'

const router = useRouter()

// Client-only store access with proper reactivity
let authStore: ReturnType<typeof useAuthStore> | null = null
const isAuthenticated = ref(false)
const currentUser = ref<any>(null)

onMounted(() => {
  authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Watch for auth changes
  watch(() => authStore?.isAuthenticated, (value) => {
    isAuthenticated.value = value || false

    // Subscribe to notifications when authenticated
    if (value && authStore?.user?.id) {
      notificationStore.subscribeToNotifications(authStore.user.id)
    }
  }, { immediate: true })

  watch(() => authStore?.user, (value) => {
    currentUser.value = value
  }, { immediate: true })
})

const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
  isUserMenuOpen.value = false
}

const handleLogout = () => {
  if (authStore) {
    authStore.logout()
  }
  router.push('/login')
  closeMenu()
}

// Scroll shadow effect
const isScrolled = ref(false)

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
  }

  window.addEventListener('scroll', handleScroll)

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<template>
  <nav
    class="glass-effect border-b border-gray-100/50 sticky top-0 z-50 transition-all duration-300"
    :class="{ 'nav-scrolled': isScrolled, 'shadow-lung-sm': !isScrolled, 'shadow-lung-md': isScrolled }"
  >
    <div class="container-lung">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group" @click="closeMenu">
          <div class="text-2xl md:text-3xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">LUNG</div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <NuxtLink
            to="/search"
            class="text-dark hover:text-primary transition-all duration-200 font-medium relative group"
          >
            <span>ค้นหาลุง</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </NuxtLink>
          <NuxtLink
            to="/#how-it-works"
            class="text-dark hover:text-primary transition-all duration-200 font-medium relative group"
          >
            <span>วิธีใช้งาน</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </NuxtLink>
          <NuxtLink
            to="/become-lung"
            class="text-dark hover:text-primary transition-all duration-200 font-medium relative group"
          >
            <span>เป็นลุง</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </NuxtLink>
          <NuxtLink
            v-if="isAuthenticated"
            to="/favorites"
            class="text-dark hover:text-primary transition-all duration-200 font-medium flex items-center gap-1.5 relative group"
          >
            <Heart :size="18" />
            <span>ถูกใจ</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </NuxtLink>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden md:flex items-center gap-3">
          <template v-if="isAuthenticated">
            <!-- Notification Bell -->
            <NotificationBell />

            <!-- User Menu -->
            <div v-if="currentUser" class="relative">
              <button
                @click="isUserMenuOpen = !isUserMenuOpen"
                class="flex items-center gap-2 hover:bg-cream px-3 py-2 rounded-full transition-colors"
              >
                <img
                  :src="currentUser.avatar"
                  :alt="currentUser.name"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <span class="font-medium text-dark">{{ currentUser.name }}</span>
                <ChevronDown :size="16" />
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-56 bg-white rounded-lung shadow-lung-lg border border-gray-100 py-2"
              >
                <NuxtLink
                  to="/account"
                  @click="isUserMenuOpen = false"
                  class="flex items-center gap-3 px-4 py-2 hover:bg-cream transition-colors"
                >
                  <User :size="18" />
                  <span>บัญชีของฉัน</span>
                </NuxtLink>

                <!-- Admin Links -->
                <template v-if="currentUser?.role === 'admin'">
                  <div class="border-t border-gray-100 my-2" />
                  <NuxtLink
                    to="/admin/dashboard"
                    @click="isUserMenuOpen = false"
                    class="flex items-center gap-3 px-4 py-2 hover:bg-cream transition-colors"
                  >
                    <LayoutDashboard :size="18" />
                    <span>Admin Dashboard</span>
                  </NuxtLink>
                </template>

                <!-- Partner Links -->
                <template v-if="currentUser?.role === 'lung'">
                  <div class="border-t border-gray-100 my-2" />
                  <NuxtLink
                    to="/partner/earnings"
                    @click="isUserMenuOpen = false"
                    class="flex items-center gap-3 px-4 py-2 hover:bg-cream transition-colors"
                  >
                    <Wallet :size="18" />
                    <span>รายได้และยอดเงิน</span>
                  </NuxtLink>
                  <NuxtLink
                    to="/partner/payouts"
                    @click="isUserMenuOpen = false"
                    class="flex items-center gap-3 px-4 py-2 hover:bg-cream transition-colors"
                  >
                    <TrendingUp :size="18" />
                    <span>การโอนเงิน</span>
                  </NuxtLink>
                </template>

                <div class="border-t border-gray-100 my-2" />
                <button
                  @click="handleLogout"
                  class="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600 w-full text-left"
                >
                  <LogOut :size="18" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <NuxtLink to="/login" class="btn-outline">
              เข้าสู่ระบบ
            </NuxtLink>
            <NuxtLink to="/register" class="btn-primary">
              สมัครสมาชิก
            </NuxtLink>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMenu"
          class="md:hidden p-2 text-dark"
        >
          <Menu v-if="!isMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isMenuOpen"
      class="md:hidden border-t border-gray-100 bg-white"
    >
      <div class="container-lung py-4 space-y-3">
        <!-- User Info (Mobile) -->
        <div v-if="isAuthenticated && currentUser" class="pb-3 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <img
              :src="currentUser.avatar"
              :alt="currentUser.name"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div class="font-semibold text-dark">{{ currentUser.name }}</div>
              <div class="text-sm text-gray-600">{{ currentUser.email }}</div>
            </div>
          </div>
        </div>

        <NuxtLink
          to="/search"
          class="block py-2 text-dark hover:text-primary transition-colors font-medium"
          @click="closeMenu"
        >
          ค้นหาลุง
        </NuxtLink>

        <NuxtLink
          to="/#how-it-works"
          class="block py-2 text-dark hover:text-primary transition-colors font-medium"
          @click="closeMenu"
        >
          วิธีใช้งาน
        </NuxtLink>

        <NuxtLink
          to="/become-lung"
          class="block py-2 text-dark hover:text-primary transition-colors font-medium"
          @click="closeMenu"
        >
          เป็นลุง
        </NuxtLink>

        <NuxtLink
          v-if="isAuthenticated"
          to="/favorites"
          class="block py-2 text-dark hover:text-primary transition-colors font-medium"
          @click="closeMenu"
        >
          ถูกใจ
        </NuxtLink>

        <!-- Admin Links (Mobile) -->
        <template v-if="isAuthenticated && currentUser?.role === 'admin'">
          <div class="border-t border-gray-100 my-3" />
          <NuxtLink
            to="/admin/dashboard"
            class="block py-2 text-dark hover:text-primary transition-colors font-medium"
            @click="closeMenu"
          >
            Admin Dashboard
          </NuxtLink>
        </template>

        <!-- Partner Links (Mobile) -->
        <template v-if="isAuthenticated && currentUser?.role === 'lung'">
          <div class="border-t border-gray-100 my-3" />
          <NuxtLink
            to="/partner/earnings"
            class="block py-2 text-dark hover:text-primary transition-colors font-medium"
            @click="closeMenu"
          >
            รายได้และยอดเงิน
          </NuxtLink>
          <NuxtLink
            to="/partner/payouts"
            class="block py-2 text-dark hover:text-primary transition-colors font-medium"
            @click="closeMenu"
          >
            การโอนเงิน
          </NuxtLink>
        </template>

        <div class="pt-3 border-t border-gray-100 space-y-2">
          <template v-if="isAuthenticated">
            <NuxtLink
              to="/account"
              class="block btn-outline text-center"
              @click="closeMenu"
            >
              บัญชี
            </NuxtLink>
            <button
              @click="handleLogout"
              class="w-full btn-outline text-red-600 border-red-600 hover:bg-red-50"
            >
              ออกจากระบบ
            </button>
          </template>

          <template v-else>
            <NuxtLink
              to="/login"
              class="block btn-outline text-center"
              @click="closeMenu"
            >
              เข้าสู่ระบบ
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="block btn-primary text-center"
              @click="closeMenu"
            >
              สมัครสมาชิก
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
