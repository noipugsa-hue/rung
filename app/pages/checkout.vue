<script setup lang="ts">
import { ArrowLeft, CreditCard, Smartphone, Banknote } from 'lucide-vue-next'
import { useLungStore } from '~/stores/lung'
import { useBookingStore } from '~/stores/booking'
import { useCommissionStore } from '~/stores/commission'
import { useLedgerStore } from '~/stores/ledger'
import { useAuthStore } from '~/stores/auth'
import { bahtToSatang, formatBaht } from '~/utils/money'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const lungStore = useLungStore()
const bookingStore = useBookingStore()
const commissionStore = useCommissionStore()
const ledgerStore = useLedgerStore()
const authStore = useAuthStore()

const lungId = route.query.lungId as string
const bookingDate = route.query.date as string
const bookingTime = route.query.time as string
const duration = parseInt(route.query.duration as string)
const location = route.query.location as string
const activity = (route.query.activity as string) || 'ทั่วไป'

const paymentMethod = ref<'promptpay' | 'credit' | 'cash'>('promptpay')
const processing = ref(false)
const showCommissionBreakdown = ref(false)

onMounted(() => {
  if (!lungId || !bookingDate || !bookingTime) {
    router.push('/search')
    return
  }
  lungStore.fetchLungById(lungId)
  commissionStore.initializeDefaultRates()
})

const lung = computed(() => lungStore.currentLung)

// Get commission rate for this partner
const commissionPercent = computed(() =>
  commissionStore.getActiveRateForPartner(lungId)
)

// Calculate totals using satang
const hourlyRateSatang = computed(() => {
  if (!lung.value) return 0
  return bahtToSatang(lung.value.price)
})

const totalSatang = computed(() => hourlyRateSatang.value * duration)

const commissionSatang = computed(() =>
  Math.floor((totalSatang.value * commissionPercent.value) / 100)
)

const partnerEarningSatang = computed(() =>
  totalSatang.value - commissionSatang.value
)

const confirmBooking = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  processing.value = true

  try {
    // Create booking with commission calculation
    const booking = await bookingStore.createBooking({
      lungId: lungId,
      userId: authStore.user.id,
      date: bookingDate,
      time: bookingTime,
      duration: duration,
      location: location,
      activity: activity,
      hourlyRateSatang: hourlyRateSatang.value,
      commissionPercent: commissionPercent.value,
      paymentMethod: paymentMethod.value
    })

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mark as paid
    booking.paymentStatus = 'paid'
    booking.paidAt = new Date().toISOString()

    // Record in ledger
    await ledgerStore.recordBookingPayment(
      booking.id,
      booking.totalAmountSatang,
      lungId
    )
    await ledgerStore.recordCommission(
      booking.id,
      booking.commissionSnapshot.amountSatang,
      lungId
    )

    // Navigate to success
    router.push(`/booking/success?id=${booking.id}`)

  } catch (error) {
    console.error('Payment error:', error)
  } finally {
    processing.value = false
  }
}
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
        ชำระเงิน
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Payment form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Booking summary -->
          <div class="card p-6">
            <h2 class="text-xl font-bold text-dark mb-4">รายละเอียดการจอง</h2>
            <div class="space-y-3">
              <div class="flex items-start gap-4">
                <img
                  :src="lung.avatar"
                  :alt="lung.name"
                  class="w-16 h-16 rounded-lung object-cover"
                />
                <div class="flex-1">
                  <h3 class="font-bold text-dark">{{ lung.name }}</h3>
                  <div class="text-sm text-gray-600 space-y-1 mt-2">
                    <p>📅 {{ new Date(bookingDate).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) }}</p>
                    <p>🕐 {{ bookingTime }} ({{ duration }} ชั่วโมง)</p>
                    <p>📍 {{ location }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment method -->
          <div class="card p-6">
            <h2 class="text-xl font-bold text-dark mb-4">วิธีชำระเงิน</h2>

            <div class="space-y-3">
              <button
                @click="paymentMethod = 'promptpay'"
                class="w-full p-4 rounded-lung border-2 transition-all flex items-center gap-4"
                :class="
                  paymentMethod === 'promptpay'
                    ? 'border-primary bg-cream'
                    : 'border-gray-200 hover:border-gray-300'
                "
              >
                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Smartphone :size="24" class="text-dark" />
                </div>
                <div class="flex-1 text-left">
                  <div class="font-semibold text-dark">PromptPay</div>
                  <div class="text-sm text-gray-600">ชำระผ่าน QR Code</div>
                </div>
                <input
                  type="radio"
                  :checked="paymentMethod === 'promptpay'"
                  class="w-5 h-5"
                />
              </button>

              <button
                @click="paymentMethod = 'credit'"
                class="w-full p-4 rounded-lung border-2 transition-all flex items-center gap-4"
                :class="
                  paymentMethod === 'credit'
                    ? 'border-primary bg-cream'
                    : 'border-gray-200 hover:border-gray-300'
                "
              >
                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <CreditCard :size="24" class="text-dark" />
                </div>
                <div class="flex-1 text-left">
                  <div class="font-semibold text-dark">บัตรเครดิต/เดบิต</div>
                  <div class="text-sm text-gray-600">Visa, Mastercard, etc.</div>
                </div>
                <input
                  type="radio"
                  :checked="paymentMethod === 'credit'"
                  class="w-5 h-5"
                />
              </button>

              <button
                @click="paymentMethod = 'cash'"
                class="w-full p-4 rounded-lung border-2 transition-all flex items-center gap-4"
                :class="
                  paymentMethod === 'cash'
                    ? 'border-primary bg-cream'
                    : 'border-gray-200 hover:border-gray-300'
                "
              >
                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Banknote :size="24" class="text-dark" />
                </div>
                <div class="flex-1 text-left">
                  <div class="font-semibold text-dark">เงินสด</div>
                  <div class="text-sm text-gray-600">ชำระเงินสดเมื่อพบกัน</div>
                </div>
                <input
                  type="radio"
                  :checked="paymentMethod === 'cash'"
                  class="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <!-- Terms -->
          <div class="card p-6">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                class="w-5 h-5 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                required
              />
              <span class="text-sm text-gray-700">
                ฉันยอมรับ <a href="#" class="text-primary hover:underline">เงื่อนไขการใช้งาน</a>
                และ <a href="#" class="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>
                ของ LUNG
              </span>
            </label>
          </div>
        </div>

        <!-- Price summary -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24 space-y-6">
            <h3 class="text-xl font-bold text-dark">สรุปการชำระเงิน</h3>

            <div class="space-y-3">
              <div class="flex justify-between text-gray-700">
                <span>ค่าบริการ ({{ duration }}h × {{ formatBaht(hourlyRateSatang) }})</span>
                <span class="font-semibold">{{ formatBaht(totalSatang) }}</span>
              </div>

              <button
                @click="showCommissionBreakdown = !showCommissionBreakdown"
                class="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                {{ showCommissionBreakdown ? 'ซ่อน' : 'แสดง' }}รายละเอียด
              </button>

              <div v-if="showCommissionBreakdown" class="pl-4 space-y-2 text-sm text-gray-600 border-l-2 border-gray-200">
                <div class="flex justify-between">
                  <span>- ค่าคอมมิชชั่น ({{ commissionPercent }}%)</span>
                  <span>{{ formatBaht(commissionSatang) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>- รายได้ของลุง</span>
                  <span>{{ formatBaht(partnerEarningSatang) }}</span>
                </div>
              </div>

              <div class="border-t pt-4 flex justify-between text-xl font-bold text-dark">
                <span>ยอดรวม</span>
                <span class="text-primary">{{ formatBaht(totalSatang) }}</span>
              </div>
            </div>

            <button
              @click="confirmBooking"
              :disabled="processing"
              class="btn-primary w-full"
              :class="{ 'opacity-50 cursor-wait': processing }"
            >
              {{ processing ? 'กำลังดำเนินการ...' : 'ยืนยันและชำระเงิน' }}
            </button>

            <div class="text-xs text-gray-600 space-y-1">
              <p>✓ การจองจะถูกยืนยันทันทีหลังชำระเงิน</p>
              <p>✓ คุณจะได้รับอีเมลยืนยันการจอง</p>
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
