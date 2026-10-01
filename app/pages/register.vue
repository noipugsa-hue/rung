<script setup lang="ts">
import { User, Mail, Lock, ArrowRight, Gift } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const router = useRouter()
const route = useRoute()

let authStore: ReturnType<typeof useAuthStore> | null = null
let referralStore: ReturnType<typeof useReferralStore> | null = null

onMounted(() => {
  authStore = useAuthStore()
  referralStore = useReferralStore()

  // Auto-fill referral code from URL
  const refCode = route.query.ref as string
  if (refCode) {
    referralCode.value = refCode.toUpperCase()
  }
})

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const referralCode = ref('')
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  if (password.value.length < 6) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  if (!authStore || !referralStore) {
    error.value = 'กรุณารอสักครู่'
    return
  }

  const result = await authStore.register(name.value, email.value, password.value)

  if (result.success) {
    // Apply referral code if provided
    if (referralCode.value && authStore.user?.id) {
      await referralStore.applyReferralCode(
        referralCode.value,
        authStore.user.id,
        name.value,
        email.value
      )
    }

    router.push('/')
  } else {
    error.value = result.error || 'สมัครสมาชิกไม่สำเร็จ'
  }
}

const handleGoogleSignIn = async () => {
  error.value = ''

  if (!authStore) {
    error.value = 'กรุณารอสักครู่'
    return
  }

  const result = await authStore.signInWithGoogle()

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-white px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <h1 class="text-5xl font-bold text-dark mb-2">LUNG</h1>
          <p class="text-gray-600">บางวัน…เราแค่ต้องการใครสักคนไปด้วย</p>
        </NuxtLink>
      </div>

      <!-- Register Card -->
      <div class="card p-8">
        <h2 class="text-2xl font-bold text-dark mb-6 text-center">
          สมัครสมาชิก
        </h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-dark mb-2">
              ชื่อ
            </label>
            <div class="relative">
              <User :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="ชื่อของคุณ"
                class="w-full pl-12 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

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

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-dark mb-2">
              ยืนยันรหัสผ่าน
            </label>
            <div class="relative">
              <Lock :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                class="w-full pl-12 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Referral Code (Optional) -->
          <div>
            <label for="referralCode" class="block text-sm font-medium text-dark mb-2">
              รหัสแนะนำ (ถ้ามี)
            </label>
            <div class="relative">
              <Gift :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="referralCode"
                v-model="referralCode"
                type="text"
                placeholder="เช่น JOHN2024"
                class="w-full pl-12 pr-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none uppercase"
              />
            </div>
            <p v-if="referralCode" class="mt-1 text-xs text-green-600">
              🎁 คุณจะได้รับส่วนลด ฿100 เมื่อจองครั้งแรก!
            </p>
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
            {{ authStore?.loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
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
            ดำเนินการต่อด้วย Google
          </span>
        </button>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200" />
          </div>
        </div>

        <!-- Login Link -->
        <p class="text-center text-gray-600 text-sm">
          มีบัญชีอยู่แล้ว?
          <NuxtLink to="/login" class="text-primary hover:underline font-semibold">
            เข้าสู่ระบบ
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
