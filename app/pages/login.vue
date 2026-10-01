<script setup lang="ts">
import { Mail, Lock, ArrowRight } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const router = useRouter()
const route = useRoute()

let authStore: ReturnType<typeof useAuthStore> | null = null

onMounted(async () => {
  authStore = useAuthStore()
  // Check for redirect result from Google Sign-in
  await authStore.handleRedirectResult()

  // If user is authenticated after redirect, navigate away
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  }
})

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }

  if (!authStore) {
    error.value = 'กรุณารอสักครู่'
    return
  }

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    // Redirect to intended page or home
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } else {
    error.value = result.error || 'เข้าสู่ระบบไม่สำเร็จ'
  }
}

const handleGoogleSignIn = async () => {
  error.value = ''

  if (!authStore) {
    error.value = 'กรุณารอสักครู่'
    return
  }

  try {
    const result = await authStore.signInWithGoogle()
    console.log('Google sign-in result:', result)

    if (result.success) {
      console.log('Login successful, auth state:', authStore.isAuthenticated)

      // If using redirect method, the page will reload automatically
      // So we only need to redirect manually for popup method
      if (!(result as any).redirect) {
        // Wait a bit for auth state to update
        await new Promise(resolve => setTimeout(resolve, 500))

        const redirect = route.query.redirect as string || '/'
        console.log('Redirecting to:', redirect)
        await router.push(redirect)
      }
      // If redirect is true, the browser will redirect automatically after auth
    } else {
      console.error('Login failed:', result.error)
      error.value = result.error || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ'
    }
  } catch (err: any) {
    console.error('Google sign-in error:', err)
    error.value = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-b from-cream to-white px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <h1 class="text-5xl font-bold text-dark mb-2">LUNG</h1>
          <p class="text-gray-600">บางวัน…เราแค่ต้องการใครสักคนไปด้วย</p>
        </NuxtLink>
      </div>

      <!-- Login Card -->
      <div class="card p-8">
        <h2 class="text-2xl font-bold text-dark mb-6 text-center">
          เข้าสู่ระบบ
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-dark mb-2">
              อีเมล
            </label>
            <div class="relative">
              <Mail :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-12 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-dark mb-2">
              รหัสผ่าน
            </label>
            <div class="relative">
              <Lock :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full pl-12 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lung text-red-600 text-sm">
            {{ error }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore?.loading"
            class="btn-primary w-full flex items-center justify-center gap-2"
            :class="{ 'opacity-50 cursor-wait': authStore?.loading }"
          >
            {{ authStore?.loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
            <ArrowRight v-if="!authStore?.loading" :size="20" />
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-gray-500">หรือ</span>
          </div>
        </div>

        <!-- Google Sign In -->
        <button
          @click="handleGoogleSignIn"
          type="button"
          :disabled="authStore?.loading"
          class="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lung hover:bg-gray-50 transition-colors"
          :class="{ 'opacity-50 cursor-wait': authStore?.loading }"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span class="text-gray-700 font-medium">
            เข้าสู่ระบบด้วย Google
          </span>
        </button>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200" />
          </div>
        </div>

        <!-- Register Link -->
        <p class="text-center text-gray-600 text-sm">
          ยังไม่มีบัญชี?
          <NuxtLink to="/register" class="text-primary hover:underline font-semibold">
            สมัครสมาชิก
          </NuxtLink>
        </p>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <NuxtLink to="/" class="text-gray-600 hover:text-dark transition-colors text-sm">
          ← กลับหน้าแรก
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
