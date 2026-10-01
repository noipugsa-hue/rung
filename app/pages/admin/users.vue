<script setup lang="ts">
import { Users as UsersIcon, Search, RefreshCw, Shield } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/stores/auth'
import UserManagementTable from '~/components/admin/UserManagementTable.vue'
import EditUserModal from '~/components/admin/EditUserModal.vue'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const authStore = useAuthStore()
const { showSuccess, showError } = useNotificationToast()

// State
const users = ref<User[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedRole = ref<'all' | 'user' | 'lung' | 'admin'>('all')
const editingUser = ref<User | null>(null)
const showEditModal = ref(false)

// Load users
const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await authStore.getAllUsers()
    console.log(`📊 Loaded ${users.value.length} users`)
  } catch (error: any) {
    console.error('Load users error:', error)
    showError('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
  } finally {
    loading.value = false
  }
}

// Initial load
onMounted(() => {
  loadUsers()
})

// Filtered users
const filteredUsers = computed(() => {
  let result = users.value

  // Filter by role
  if (selectedRole.value !== 'all') {
    result = result.filter(u => u.role === selectedRole.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query)
    )
  }

  return result
})

// Stats
const stats = computed(() => {
  const all = users.value
  return {
    total: all.length,
    users: all.filter(u => u.role === 'user').length,
    lungs: all.filter(u => u.role === 'lung').length,
    admins: all.filter(u => u.role === 'admin').length
  }
})

// Edit user
const handleEditUser = (user: User) => {
  editingUser.value = user
  showEditModal.value = true
}

// Save edited user
const handleSaveUser = async (userId: string, updates: Partial<User>) => {
  try {
    await authStore.updateUserProfile(userId, updates)
    showSuccess('สำเร็จ', 'บันทึกข้อมูลผู้ใช้เรียบร้อย')
    showEditModal.value = false
    editingUser.value = null
    await loadUsers() // Reload to get updated data
  } catch (error: any) {
    console.error('Update user error:', error)
    showError('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้')
  }
}

// Delete user
const handleDeleteUser = async (user: User) => {
  const confirmed = confirm(
    `คุณต้องการลบผู้ใช้ "${user.name}" (${user.email}) ใช่หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้\n\nหมายเหตุ: จะลบเฉพาะข้อมูลใน Firestore ไม่ลบบัญชี Firebase Authentication`
  )

  if (!confirmed) return

  try {
    await authStore.deleteUser(user.id)
    showSuccess('สำเร็จ', 'ลบผู้ใช้เรียบร้อย')
    await loadUsers() // Reload to get updated list
  } catch (error: any) {
    console.error('Delete user error:', error)
    showError('ข้อผิดพลาด', 'ไม่สามารถลบผู้ใช้ได้')
  }
}

const roleOptions = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'user', label: 'ผู้ใช้' },
  { value: 'lung', label: 'พาร์ทเนอร์' },
  { value: 'admin', label: 'ผู้ดูแลระบบ' }
]
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-dark mb-2">จัดการผู้ใช้งาน</h1>
      <p class="text-gray-600">ดูและจัดการข้อมูลผู้ใช้งานในระบบ</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lung p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">ทั้งหมด</p>
            <p class="text-2xl font-bold text-dark">{{ stats.total }}</p>
          </div>
          <div class="p-3 bg-gray-100 rounded-lung">
            <UsersIcon :size="24" class="text-gray-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lung p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">ผู้ใช้</p>
            <p class="text-2xl font-bold text-dark">{{ stats.users }}</p>
          </div>
          <div class="p-3 bg-gray-100 rounded-lung">
            <UsersIcon :size="24" class="text-gray-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lung p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">พาร์ทเนอร์</p>
            <p class="text-2xl font-bold text-dark">{{ stats.lungs }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-lung">
            <Shield :size="24" class="text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lung p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">ผู้ดูแลระบบ</p>
            <p class="text-2xl font-bold text-dark">{{ stats.admins }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-lung">
            <Shield :size="24" class="text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lung p-4 shadow-sm">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <Search :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาด้วยชื่อ, อีเมล หรือ ID..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lung focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <!-- Role Filter -->
        <div class="w-full md:w-48">
          <select
            v-model="selectedRole"
            class="w-full px-4 py-2 border border-gray-300 rounded-lung focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option
              v-for="option in roleOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Refresh Button -->
        <button
          @click="loadUsers"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lung hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw :size="18" :class="{ 'animate-spin': loading }" />
          <span class="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>

      <!-- Results count -->
      <div class="mt-3 text-sm text-gray-600">
        แสดง {{ filteredUsers.length }} จาก {{ stats.total }} ผู้ใช้
      </div>
    </div>

    <!-- User Table -->
    <UserManagementTable
      :users="filteredUsers"
      :loading="loading"
      @edit="handleEditUser"
      @delete="handleDeleteUser"
    />

    <!-- Edit Modal -->
    <EditUserModal
      :user="editingUser"
      :show="showEditModal"
      @close="showEditModal = false; editingUser = null"
      @save="handleSaveUser"
    />
  </div>
</template>
