<script setup lang="ts">
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-vue-next'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { usePartnerApplicationStore } from '~/stores/partnerApplication'
import type { PartnerApplication } from '~/types/application'

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const router = useRouter()
const applicationStore = usePartnerApplicationStore()

const loading = ref(true)
const totalUsers = ref(0)
const activeLungs = ref(0)
const totalBookings = ref(0)
const totalRevenue = ref(0)
const pendingApplications = ref<PartnerApplication[]>([])

// Fetch dashboard data
onMounted(async () => {
  if (!process.client) return

  loading.value = true
  try {
    const { $firebase } = useNuxtApp()
    const db = $firebase.db

    // Fetch all data in parallel
    const [usersSnap, lungsSnap, bookingsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(query(collection(db, 'lungs'), where('available', '==', true))),
      getDocs(collection(db, 'bookings'))
    ])

    totalUsers.value = usersSnap.size
    activeLungs.value = lungsSnap.size
    totalBookings.value = bookingsSnap.size

    // Calculate total revenue from bookings
    let revenue = 0
    bookingsSnap.forEach((doc) => {
      const booking = doc.data()
      if (booking.totalAmount) {
        revenue += booking.totalAmount
      }
    })
    totalRevenue.value = revenue

    // Fetch pending applications
    await applicationStore.fetchAllApplications()
    pendingApplications.value = applicationStore.applications.filter(
      (app) => app.status === 'submitted'
    )

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
})

const stats = computed(() => [
  {
    icon: Users,
    label: 'Total Users',
    value: totalUsers.value.toLocaleString(),
    color: 'bg-primary'
  },
  {
    icon: UserCheck,
    label: 'Active Lungs',
    value: activeLungs.value.toLocaleString(),
    color: 'bg-orange'
  },
  {
    icon: Calendar,
    label: 'Bookings',
    value: totalBookings.value.toLocaleString(),
    color: 'bg-soft-green'
  },
  {
    icon: DollarSign,
    label: 'Revenue',
    value: `฿${(totalRevenue.value / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
    color: 'bg-cream'
  },
])

function viewApplication(applicationId: string) {
  router.push(`/admin/application-detail-${applicationId}`)
}

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          Admin Dashboard
        </h1>
        <p class="text-gray-600">LUNG Management System</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else>
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="card p-6"
          >
            <div class="flex items-center gap-4 mb-3">
              <div :class="[stat.color, 'w-12 h-12 rounded-lung flex items-center justify-center']">
                <component :is="stat.icon" :size="24" class="text-dark" />
              </div>
              <div>
                <div class="text-2xl font-bold text-dark">{{ stat.value }}</div>
                <div class="text-sm text-gray-600">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Pending verifications -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-dark flex items-center gap-2">
                <Clock :size="24" class="text-orange" />
                Pending Verification
              </h2>
              <span class="px-3 py-1 bg-orange text-dark rounded-full text-sm font-medium">
                {{ pendingApplications.length }} pending
              </span>
            </div>

            <div v-if="pendingApplications.length === 0" class="text-center py-8 text-gray-500">
              ไม่มีใบสมัครที่รออนุมัติ
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="app in pendingApplications"
                :key="app.id"
                class="flex items-center justify-between p-4 bg-cream rounded-lung cursor-pointer hover:bg-primary transition-colors"
                @click="viewApplication(app.id)"
              >
                <div>
                  <h3 class="font-semibold text-dark">
                    {{ app.personalInfo?.firstName || 'N/A' }} {{ app.personalInfo?.lastName || '' }},
                    {{ app.personalInfo?.dateOfBirth ? calculateAge(app.personalInfo.dateOfBirth) : 'N/A' }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    Submitted: {{ app.submittedAt ? new Date(app.submittedAt.seconds * 1000).toLocaleDateString('th-TH') : 'N/A' }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click.stop="viewApplication(app.id)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lung text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats Summary -->
          <div class="card p-6">
            <h2 class="text-2xl font-bold text-dark mb-6">สรุปข้อมูล</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center p-4 bg-cream rounded-lung">
                <div class="text-3xl font-bold text-dark mb-2">{{ totalUsers }}</div>
                <div class="text-sm text-gray-600">ผู้ใช้ทั้งหมด</div>
              </div>
              <div class="text-center p-4 bg-cream rounded-lung">
                <div class="text-3xl font-bold text-dark mb-2">{{ activeLungs }}</div>
                <div class="text-sm text-gray-600">ลุงที่พร้อมให้บริการ</div>
              </div>
              <div class="text-center p-4 bg-cream rounded-lung">
                <div class="text-3xl font-bold text-dark mb-2">{{ pendingApplications.length }}</div>
                <div class="text-sm text-gray-600">ใบสมัครรออนุมัติ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
