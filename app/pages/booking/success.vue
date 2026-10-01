<script setup lang="ts">
import { CheckCircle2, Calendar, Clock, MapPin, Home, MessageCircle } from 'lucide-vue-next'
import { useLungStore } from '~/stores/lung'
import { useBookingStore } from '~/stores/booking'
import { formatBaht } from '~/utils/money'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const lungStore = useLungStore()
const bookingStore = useBookingStore()

const bookingId = route.query.id as string

const booking = computed(() =>
  bookingStore.bookings.find(b => b.id === bookingId)
)

onMounted(() => {
  if (!bookingId) {
    router.push('/')
    return
  }

  const foundBooking = bookingStore.bookings.find(b => b.id === bookingId)
  if (foundBooking) {
    lungStore.fetchLungById(foundBooking.lungId)
  }
})

const lung = computed(() => lungStore.currentLung)
</script>

<template>
  <div class="py-12">
    <div class="container-lung max-w-3xl">
      <!-- Success animation -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-soft-green rounded-full mb-6 animate-bounce">
          <CheckCircle2 :size="48" class="text-green-600" />
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-3">
          จองสำเร็จแล้ว!
        </h1>

        <p v-if="lung" class="text-lg text-gray-600">
          {{ lung.name }}กำลังรอเจอคุณ
        </p>
      </div>

      <!-- Booking details -->
      <div v-if="lung && booking" class="card p-6 md:p-8 mb-6">
        <div class="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
          <img
            :src="lung.avatar"
            :alt="lung.name"
            class="w-20 h-20 rounded-lung object-cover"
          />
          <div>
            <h2 class="text-xl font-bold text-dark">{{ lung.name }}</h2>
            <RatingStars :rating="lung.rating" :review-count="lung.reviewCount" size="sm" />
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <Calendar :size="20" class="text-primary mt-1" />
            <div>
              <div class="font-semibold text-dark">วันที่</div>
              <div class="text-gray-600">
                {{ new Date(booking.date).toLocaleDateString('th-TH', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) }}
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Clock :size="20" class="text-primary mt-1" />
            <div>
              <div class="font-semibold text-dark">เวลา</div>
              <div class="text-gray-600">{{ booking.time }} ({{ booking.duration }} ชั่วโมง)</div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <MapPin :size="20" class="text-primary mt-1" />
            <div>
              <div class="font-semibold text-dark">สถานที่</div>
              <div class="text-gray-600">{{ booking.location }}</div>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <span class="font-semibold text-dark">รหัสการจอง</span>
              <span class="font-mono text-primary">{{ booking.id }}</span>
            </div>

            <div class="flex justify-between items-center mb-4">
              <span class="font-semibold text-dark">ยอดชำระ</span>
              <span class="text-2xl font-bold text-primary">{{ formatBaht(booking.totalAmountSatang) }}</span>
            </div>

            <!-- Commission breakdown -->
            <div class="pl-4 space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div class="flex justify-between">
                <span>ค่าคอมมิชชั่น ({{ booking.commissionSnapshot.rate }}%)</span>
                <span>{{ formatBaht(booking.commissionSnapshot.amountSatang) }}</span>
              </div>
              <div class="flex justify-between">
                <span>รายได้ของลุง</span>
                <span>{{ formatBaht(booking.partnerEarningSatang) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <NuxtLink to="/messages" class="btn-primary w-full flex items-center justify-center gap-2">
          <MessageCircle :size="20" />
          ส่งข้อความถึง{{ lung?.name }}
        </NuxtLink>

        <NuxtLink to="/" class="btn-outline w-full flex items-center justify-center gap-2">
          <Home :size="20" />
          กลับหน้าแรก
        </NuxtLink>
      </div>

      <!-- Info -->
      <div class="mt-8 card p-6 bg-cream">
        <h3 class="font-bold text-dark mb-3">สิ่งที่ควรรู้</h3>
        <ul class="space-y-2 text-sm text-gray-700">
          <li>✓ คุณจะได้รับอีเมลยืนยันการจองภายใน 5 นาที</li>
          <li>✓ คุณสามารถส่งข้อความหา{{ lung?.name }}เพื่อวางแผนรายละเอียดเพิ่มเติม</li>
          <li>✓ ยกเลิกได้ฟรีภายใน 24 ชั่วโมงก่อนเวลานัดหมาย</li>
          <li>✓ อย่าลืมให้รีวิวหลังใช้บริการเพื่อช่วยผู้ใช้ท่านอื่น</li>
        </ul>
      </div>
    </div>
  </div>
</template>
