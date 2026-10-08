<script setup lang="ts">
import { Mail, Shield, CheckCircle, XCircle } from 'lucide-vue-next'
import { doc, updateDoc, getDoc } from 'firebase/firestore'

definePageMeta({
  layout: 'default'
})

const email = ref('')
const loading = ref(false)
const message = ref('')
const success = ref(false)

const setAdminAccess = async () => {
  if (!email.value) {
    message.value = 'กรุณากรอกอีเมล'
    success.value = false
    return
  }

  loading.value = true
  message.value = ''

  try {
    const { $firebase } = useNuxtApp()
    const db = $firebase.db

    // Query users by email
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email.value))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      message.value = '❌ ไม่พบผู้ใช้งานนี้ กรุณาตรวจสอบอีเมลหรือให้ผู้ใช้ login ก่อน'
      success.value = false
      loading.value = false
      return
    }

    // Get first user document
    const userDoc = querySnapshot.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data()

    // Check if already admin
    if (userData.isAdmin === true) {
      message.value = '⚠️ ผู้ใช้งานนี้มี Admin access อยู่แล้ว'
      success.value = true
      loading.value = false
      return
    }

    // Update isAdmin field
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      isAdmin: true,
      updatedAt: new Date().toISOString()
    })

    message.value = `✅ ตั้งค่า Admin access สำเร็จ!\n\n📧 ${userData.name} (${userData.email})\n\n⚠️ สำคัญ: ให้ผู้ใช้ logout แล้ว login ใหม่เพื่อเห็นเมนู Admin`
    success.value = true
  } catch (error: any) {
    console.error('Error:', error)
    message.value = `❌ เกิดข้อผิดพลาด: ${error.message}`
    success.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-cream via-white to-soft-green py-12 px-4">
    <div class="container-lung max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Shield :size="32" class="text-primary" />
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">Admin Setup</h1>
        <p class="text-gray-600">ตั้งค่า Admin Access สำหรับผู้ใช้งาน</p>
      </div>

      <!-- Form Card -->
      <div class="card-lung p-6 md:p-8">
        <div class="mb-6">
          <label class="block text-sm font-medium text-dark mb-2">
            อีเมลของผู้ใช้ที่ต้องการให้เป็น Admin
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail :size="20" class="text-gray-400" />
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="example@gmail.com"
              class="input-lung pl-10 w-full"
              @keyup.enter="setAdminAccess"
            />
          </div>
        </div>

        <button
          @click="setAdminAccess"
          :disabled="loading || !email"
          class="btn-primary w-full"
        >
          <span v-if="loading">กำลังประมวลผล...</span>
          <span v-else>ตั้งค่า Admin Access</span>
        </button>

        <!-- Message -->
        <div
          v-if="message"
          class="mt-6 p-4 rounded-lung border"
          :class="{
            'bg-green-50 border-green-200': success,
            'bg-red-50 border-red-200': !success
          }"
        >
          <div class="flex items-start gap-3">
            <CheckCircle v-if="success" :size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
            <XCircle v-else :size="20" class="text-red-600 flex-shrink-0 mt-0.5" />
            <p class="whitespace-pre-line text-sm" :class="success ? 'text-green-800' : 'text-red-800'">
              {{ message }}
            </p>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="card-lung p-6 mt-6">
        <h3 class="font-semibold text-dark mb-4">📋 วิธีใช้งาน</h3>
        <ol class="space-y-2 text-sm text-gray-600">
          <li>1. กรอกอีเมลของผู้ใช้ที่ต้องการให้เป็น Admin</li>
          <li>2. คลิกปุ่ม "ตั้งค่า Admin Access"</li>
          <li>3. ให้ผู้ใช้คนนั้น <strong>logout</strong> แล้ว <strong>login ใหม่</strong></li>
          <li>4. เมนู "Admin Dashboard" จะปรากฏใน dropdown</li>
        </ol>

        <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            <strong>⚠️ หมายเหตุ:</strong> ผู้ใช้ต้อง login อย่างน้อย 1 ครั้งก่อนจึงจะสามารถตั้งค่า Admin ได้
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-primary hover:text-primary/80 text-sm font-medium">
          ← กลับหน้าแรก
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
