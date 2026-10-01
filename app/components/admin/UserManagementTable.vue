<script setup lang="ts">
import { Edit2, Trash2, Mail, User, Calendar, Shield } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import type { User as UserType } from '~/stores/auth'

const props = defineProps<{
  users: UserType[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [user: UserType]
  delete: [user: UserType]
}>()

const authStore = useAuthStore()

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRoleBadge(role: string) {
  const badges = {
    admin: { class: 'bg-purple-100 text-purple-700', text: 'ผู้ดูแลระบบ' },
    lung: { class: 'bg-blue-100 text-blue-700', text: 'พาร์ทเนอร์' },
    user: { class: 'bg-gray-100 text-gray-700', text: 'ผู้ใช้' }
  }
  return badges[role as keyof typeof badges] || badges.user
}

function canDeleteUser(user: UserType) {
  // Cannot delete yourself
  return user.id !== authStore.user?.id
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=FFDBB5&color=FF6B35`
  }
}
</script>

<template>
  <div class="bg-white rounded-lung shadow-sm overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p class="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="users.length === 0" class="p-8 text-center">
      <User :size="48" class="mx-auto text-gray-400 mb-2" />
      <p class="text-gray-600">ไม่พบข้อมูลผู้ใช้</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ผู้ใช้
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              อีเมล
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สิทธิ์
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              วันที่สมัคร
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <!-- User Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img
                  :src="user.avatar"
                  :alt="user.name"
                  class="w-10 h-10 rounded-full object-cover bg-gray-200"
                  @error="handleAvatarError"
                />
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-xs text-gray-500">ID: {{ user.id.substring(0, 8) }}...</div>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center text-sm text-gray-900">
                <Mail :size="16" class="text-gray-400 mr-2" />
                {{ user.email }}
              </div>
            </td>

            <!-- Role -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getRoleBadge(user.role).class"
              >
                <Shield :size="14" class="mr-1" />
                {{ getRoleBadge(user.role).text }}
              </span>
            </td>

            <!-- Created At -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center text-sm text-gray-500">
                <Calendar :size="16" class="text-gray-400 mr-2" />
                {{ formatDate(user.createdAt) }}
              </div>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <!-- Edit Button -->
                <button
                  @click="emit('edit', user)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lung transition-colors"
                  title="แก้ไข"
                >
                  <Edit2 :size="16" />
                  <span>แก้ไข</span>
                </button>

                <!-- Delete Button -->
                <button
                  v-if="canDeleteUser(user)"
                  @click="emit('delete', user)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lung transition-colors"
                  title="ลบ"
                >
                  <Trash2 :size="16" />
                  <span>ลบ</span>
                </button>

                <!-- Cannot delete self -->
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed"
                  title="ไม่สามารถลบตัวเองได้"
                >
                  <Trash2 :size="16" />
                  <span>ลบ</span>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
