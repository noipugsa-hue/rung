<script setup lang="ts">
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-vue-next'
import { useLungStore } from '~/stores/lung'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const lungStore = useLungStore()

const lungId = route.params.id as string

const selectedDate = ref('')
const selectedTime = ref('')
const duration = ref(2)
const location = ref('')

onMounted(() => {
  lungStore.fetchLungById(lungId)
})

const lung = computed(() => lungStore.currentLung)

const totalPrice = computed(() => {
  if (!lung.value) return 0
  return lung.value.price * duration.value
})

const serviceFee = computed(() => {
  return Math.round(totalPrice.value * 0.05)
})

const grandTotal = computed(() => {
  return totalPrice.value + serviceFee.value
})

const canProceed = computed(() => {
  return selectedDate.value && selectedTime.value && location.value && duration.value > 0
})

const proceedToCheckout = () => {
  if (canProceed.value) {
    router.push({
      path: '/checkout',
      query: {
        lungId: lungId,
        date: selectedDate.value,
        time: selectedTime.value,
        duration: duration.value.toString(),
        location: location.value,
      }
    })
  }
}

const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
</script>

<template>
  <div v-if="lung" class="py-8">
    <div class="container-lung max-w-4xl">
      <!-- Back button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-6"
      >
        <ArrowLeft :size="20" />
        <span>กลับ</span>
      </button>

      <h1 class="text-3xl md:text-4xl font-bold text-dark mb-8">
        จอง{{ lung.name }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Lung info -->
          <div class="card p-6">
            <div class="flex items-center gap-4">
              <img
                :src="lung.avatar"
                :alt="lung.name"
                class="w-20 h-20 rounded-lung object-cover"
              />
              <div>
                <h3 class="text-xl font-bold text-dark">{{ lung.name }}, {{ lung.age }}</h3>
                <RatingStars :rating="lung.rating" :review-count="lung.reviewCount" size="sm" />
                <div class="flex items-center gap-1 text-gray-600 text-sm mt-1">
                  <MapPin :size="14" />
                  <span>{{ lung.location }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Date selection -->
          <div class="card p-6">
            <div class="flex items-center gap-2 mb-4">
              <Calendar :size="24" class="text-primary" />
              <h2 class="text-xl font-bold text-dark">เลือกวันที่</h2>
            </div>
            <input
              v-model="selectedDate"
              type="date"
              :min="new Date().toISOString().split('T')[0]"
              class="w-full px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <!-- Time selection -->
          <div class="card p-6">
            <div class="flex items-center gap-2 mb-4">
              <Clock :size="24" class="text-primary" />
              <h2 class="text-xl font-bold text-dark">เลือกเวลา</h2>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <button
                v-for="time in availableTimes"
                :key="time"
                @click="selectedTime = time"
                class="px-4 py-3 rounded-lung border-2 transition-all font-medium"
                :class="
                  selectedTime === time
                    ? 'bg-primary border-primary text-dark'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                "
              >
                {{ time }}
              </button>
            </div>
          </div>

          <!-- Duration -->
          <div class="card p-6">
            <h2 class="text-xl font-bold text-dark mb-4">ระยะเวลา</h2>
            <div class="grid grid-cols-3 gap-3">
              <button
                @click="duration = 1"
                class="px-4 py-3 rounded-lung border-2 transition-all font-medium"
                :class="
                  duration === 1
                    ? 'bg-primary border-primary text-dark'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                "
              >
                1 ชั่วโมง
              </button>
              <button
                @click="duration = 2"
                class="px-4 py-3 rounded-lung border-2 transition-all font-medium"
                :class="
                  duration === 2
                    ? 'bg-primary border-primary text-dark'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                "
              >
                2 ชั่วโมง
              </button>
              <button
                @click="duration = 4"
                class="px-4 py-3 rounded-lung border-2 transition-all font-medium"
                :class="
                  duration === 4
                    ? 'bg-primary border-primary text-dark'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                "
              >
                4 ชั่วโมง
              </button>
            </div>
          </div>

          <!-- Location -->
          <div class="card p-6">
            <h2 class="text-xl font-bold text-dark mb-4">สถานที่นัดพบ</h2>
            <input
              v-model="location"
              type="text"
              placeholder="เช่น สยามพารากอน, คาเฟ่ในซอย..."
              class="w-full px-4 py-3 rounded-lung border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
            <p class="text-sm text-gray-600 mt-2">
              คุณสามารถแจ้งสถานที่โดยประมาณได้ และปรับเปลี่ยนในภายหลัง
            </p>
          </div>
        </div>

        <!-- Summary -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24 space-y-6">
            <h3 class="text-xl font-bold text-dark">สรุปการจอง</h3>

            <div class="space-y-3 pb-4 border-b border-gray-200">
              <div class="flex justify-between text-gray-700">
                <span>฿{{ lung.price }} × {{ duration }} ชั่วโมง</span>
                <span class="font-semibold">฿{{ totalPrice.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>ค่าบริการ (5%)</span>
                <span class="font-semibold">฿{{ serviceFee.toLocaleString() }}</span>
              </div>
            </div>

            <div class="flex justify-between text-lg font-bold text-dark">
              <span>รวมทั้งหมด</span>
              <span>฿{{ grandTotal.toLocaleString() }}</span>
            </div>

            <button
              @click="proceedToCheckout"
              :disabled="!canProceed"
              class="btn-primary w-full"
              :class="{ 'opacity-50 cursor-not-allowed': !canProceed }"
            >
              ดำเนินการจอง
            </button>

            <div class="text-sm text-gray-600 space-y-2">
              <p>✓ ยกเลิกได้ฟรีภายใน 24 ชั่วโมง</p>
              <p>✓ ชำระเงินหลังยืนยันการจอง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="lungStore.loading" class="container-lung py-12">
    <div class="animate-pulse space-y-8">
      <div class="h-8 bg-gray-200 rounded w-1/3" />
      <div class="h-64 bg-gray-200 rounded-lung" />
    </div>
  </div>
</template>
