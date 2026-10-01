<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { User } from '~/stores/auth'

const props = defineProps<{
  user: User | null
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [userId: string, updates: Partial<User>]
}>()

const formData = ref({
  name: '',
  email: '',
  role: 'user' as 'user' | 'lung' | 'admin'
})

const saving = ref(false)

// Watch for user changes to update form
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!props.user) return

  saving.value = true
  try {
    await emit('save', props.user.id, formData.value)
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  if (!saving.value) {
    emit('close')
  }
}
</script>

<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show && user"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <!-- Modal Content -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show && user"
            class="bg-white rounded-lung shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-dark">แก้ไขข้อมูลผู้ใช้</h3>
              <button
                @click="handleClose"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lung hover:bg-gray-100 transition-colors"
                :disabled="saving"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ-นามสกุล
                </label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lung focus:ring-2 focus:ring-primary focus:border-transparent"
                  :disabled="saving"
                />
              </div>

              <!-- Email (Read-only display) -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  disabled
                  class="w-full px-4 py-2 border border-gray-300 rounded-lung bg-gray-50 text-gray-500 cursor-not-allowed"
                  title="ไม่สามารถแก้ไขอีเมลได้ (ต้องแก้ไขใน Firebase Authentication)"
                />
                <p class="mt-1 text-xs text-gray-500">
                  หมายเหตุ: ไม่สามารถแก้ไขอีเมลได้ (ต้องใช้ Firebase Admin SDK)
                </p>
              </div>

              <!-- Role -->
              <div>
                <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
                  สิทธิ์การใช้งาน
                </label>
                <select
                  id="role"
                  v-model="formData.role"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lung focus:ring-2 focus:ring-primary focus:border-transparent"
                  :disabled="saving"
                >
                  <option value="user">ผู้ใช้</option>
                  <option value="lung">พาร์ทเนอร์</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>

              <!-- User Info -->
              <div class="p-3 bg-gray-50 rounded-lung">
                <div class="text-xs text-gray-500 space-y-1">
                  <p><span class="font-medium">User ID:</span> {{ user.id }}</p>
                  <p v-if="user.createdAt">
                    <span class="font-medium">วันที่สมัคร:</span>
                    {{ new Date(user.createdAt).toLocaleDateString('th-TH') }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="handleClose"
                  class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lung hover:bg-gray-200 transition-colors font-medium"
                  :disabled="saving"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-primary text-dark rounded-lung hover:bg-yellow-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="saving"
                >
                  {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
