<script setup lang="ts">
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-vue-next'
import { categories } from '~/data/categories'
import { useLungStore } from '~/stores/lung'
import { useAuthStore } from '~/stores/auth'
import { getTrialStatus } from '~/utils/trial'

definePageMeta({
  layout: 'default'
})

// SEO
const { setSeo, getOrganizationSchema, getWebsiteSchema, getServiceSchema, getBreadcrumbSchema } = useSeo()

// Combined structured data
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getServiceSchema(),
    getBreadcrumbSchema([
      { name: 'หน้าแรก' }
    ])
  ]
}

setSeo({
  title: 'LUNG — เช่าลุง หาคนไปด้วย บริการหาเพื่อนทำกิจกรรม | ทดลองฟรี 7 วัน',
  description: 'แพลตฟอร์มเช่าลุง ลุงเช่า หาคนไปด้วยในกิจกรรมต่างๆ เช่น กินข้าว เที่ยว คาเฟ่ คุยเล่น จองได้ง่ายๆ ราคาเริ่มต้น 200 บาท ทดลองฟรี 7 วัน ลด 50%',
  keywords: [
    'เช่าลุง',
    'ลุงเช่า',
    'หาคนไปด้วย',
    'หาเพื่อนไปเที่ยว',
    'หาคนกินข้าว',
    'หาคนไปคาเฟ่',
    'บริการหาเพื่อน',
    'คนเช่า',
    'หาเพื่อนคุย',
    'ไปไหนด้วยกัน',
    'หาคนไปเดินเล่น',
    'ใครสักคนไปด้วย',
    'lung',
    'บริการหาเพื่อนทำกิจกรรม',
    'เช่าคนไปด้วย',
    'หาเพื่อนใหม่',
    'คนเช่าไปเที่ยว'
  ],
  structuredData
})

// Client-only store - avoid SSR issues
const lungStore = ref<ReturnType<typeof useLungStore> | null>(null)
const authStore = ref<ReturnType<typeof useAuthStore> | null>(null)
const isClient = ref(false)
const loading = ref(false)

onMounted(() => {
  isClient.value = true
  lungStore.value = useLungStore()
  authStore.value = useAuthStore()
  lungStore.value.fetchLungs()
})

// Computed properties that react to store changes
const availableLungs = computed(() => {
  console.log('🔄 availableLungs computed called')
  if (!lungStore.value) {
    console.log('⚠️ lungStore is null')
    return []
  }
  console.log('🔍 lungStore.lungs.length:', lungStore.value.lungs.length)
  const lungs = lungStore.value.lungs.filter(l => {
    console.log(`  - Lung ${l.name}: available=${l.available}`)
    return l.available
  }).slice(0, 8)
  console.log('✅ availableLungs result:', lungs.length, lungs)
  return lungs
})

const featuredLungs = computed(() => {
  if (!lungStore.value) return []
  return lungStore.value.lungs.slice(0, 4)
})

watch(() => lungStore.value?.loading || false, (newLoading) => {
  loading.value = newLoading
})

// Check if trial promotion should be shown
const showTrialPromotion = computed(() => {
  if (!isClient.value || !authStore.value) return true // Show to guests

  const user = authStore.value.user
  if (!user) return true // Show to non-logged-in users

  // If user is logged in, check trial status
  const trialStatus = getTrialStatus(user.trialStartedAt)

  // Show only if trial is still active OR user never had a trial
  return !user.trialStartedAt || (trialStatus && trialStatus.isActive)
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-white via-cream/20 to-white py-20 md:py-28 lg:py-36 overflow-hidden">
      <!-- Subtle decorative elements -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-soft-green/20 rounded-full blur-3xl"></div>

      <div class="container-lung relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <!-- Left: Content -->
          <div class="space-y-8 lg:space-y-10">
            <div class="space-y-6">
              <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-dark leading-[1.15] tracking-tight animate-fade-in-up">
                <span class="block mb-2">บางวัน…</span>
                <span class="block mb-2">เราแค่ต้องการ</span>
                <span class="block gradient-text">ใครสักคนไปด้วย</span>
              </h1>
              <p class="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-xl leading-relaxed animate-fade-in-up animation-delay-100">
                เช่าลุง หาคนไปด้วยในกิจกรรมต่างๆ<br class="hidden sm:inline" />
                กินข้าว เดินเล่น เที่ยว คาเฟ่ หรือแค่พูดคุย
              </p>
            </div>

            <!-- CTAs -->
            <div class="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-in-up animation-delay-200">
              <NuxtLink
                to="/search"
                class="btn-primary text-center text-base sm:text-lg px-8 py-4 shadow-lung-lg hover:shadow-lung-xl"
              >
                ค้นหาคนที่ใช่
              </NuxtLink>
              <NuxtLink
                to="/become-lung"
                class="btn-outline text-center text-base sm:text-lg px-8 py-4"
              >
                สมัครเป็นลุง
              </NuxtLink>
            </div>

            <!-- Quick categories -->
            <div class="pt-6 lg:pt-8 animate-fade-in-up animation-delay-300">
              <p class="text-sm text-gray-500 mb-4 font-medium">กิจกรรมยอดนิยม</p>
              <div class="flex flex-wrap gap-2.5">
                <NuxtLink
                  v-for="cat in categories.slice(0, 6)"
                  :key="cat.id"
                  :to="`/search?category=${cat.id}`"
                  class="px-4 py-2.5 bg-white border border-gray-200 rounded-full hover:border-primary hover:bg-cream hover:scale-105 transition-all duration-300 text-sm font-medium flex items-center gap-2 shadow-lung-sm hover:shadow-lung-md"
                >
                  <span class="text-base">{{ cat.emoji }}</span>
                  <span>{{ cat.name }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Right: Hero image -->
          <div class="relative hidden lg:block animate-fade-in animation-delay-400">
            <div class="relative rounded-lung-xl overflow-hidden shadow-lung-xl group">
              <img
                src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&h=1000&fit=crop&q=80"
                alt="มีเพื่อนร่วมทาง - LUNG"
                class="w-full h-[550px] xl:h-[650px] object-cover group-hover:scale-105 transition-transform duration-700"
              />

              <!-- Floating badges -->
              <div class="absolute top-6 left-6 space-y-3 animate-slide-in-right">
                <div class="glass-effect rounded-lung px-4 py-3 shadow-lung-lg backdrop-blur-xl border border-white/20">
                  <div class="flex items-center gap-2.5">
                    <CheckCircle2 :size="20" class="text-green-600" />
                    <span class="font-semibold text-dark text-sm">ยืนยันตัวตนแล้ว</span>
                  </div>
                </div>
                <div class="glass-effect rounded-lung px-4 py-3 shadow-lung-lg backdrop-blur-xl border border-white/20">
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">⭐</span>
                    <span class="font-bold text-dark">4.9</span>
                    <span class="text-gray-700 text-sm">(128 รีวิว)</span>
                  </div>
                </div>
              </div>

              <div class="absolute bottom-6 right-6 animate-float">
                <div class="bg-primary rounded-lung px-5 py-3 shadow-lung-lg border-2 border-white">
                  <span class="font-bold text-dark text-sm">✓ วันนี้ว่าง</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Card Section -->
    <section class="py-16 md:py-20 bg-white">
      <div class="container-lung">
        <div class="max-w-5xl mx-auto -mt-32 relative z-20">
          <SearchCard />
        </div>
      </div>
    </section>

    <!-- Free Trial Promotion Section -->
    <section v-if="showTrialPromotion" class="py-16 md:py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div class="container-lung">
        <div class="max-w-4xl mx-auto">
          <div class="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-lung-xl p-8 md:p-12 lg:p-16 shadow-lung-xl overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

            <div class="relative z-10 text-center space-y-6">
              <!-- Badge -->
              <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm border border-white/30">
                <Sparkles :size="18" class="animate-spin" style="animation-duration: 3s;" />
                <span>โปรโมชั่นพิเศษ</span>
              </div>

              <!-- Main heading -->
              <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                ทดลองใช้ฟรี 7 วัน
              </h2>

              <!-- Benefits -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <!-- User benefit -->
                <div class="bg-white/10 backdrop-blur-sm rounded-lung-lg p-6 border border-white/20">
                  <div class="text-4xl mb-3">🎉</div>
                  <h3 class="text-xl font-bold text-white mb-2">สำหรับผู้ใช้ใหม่</h3>
                  <p class="text-white/90 text-sm mb-2">ลดทันที</p>
                  <div class="text-4xl font-bold text-white">50%</div>
                  <p class="text-white/80 text-sm mt-2">สำหรับทุกการจอง</p>
                </div>

                <!-- Lung benefit -->
                <div class="bg-white/10 backdrop-blur-sm rounded-lung-lg p-6 border border-white/20">
                  <div class="text-4xl mb-3">🎁</div>
                  <h3 class="text-xl font-bold text-white mb-2">สำหรับลุงใหม่</h3>
                  <p class="text-white/90 text-sm mb-2">ค่าคอมมิชชั่น</p>
                  <div class="text-4xl font-bold text-white">0%</div>
                  <p class="text-white/80 text-sm mt-2">รับเงินเต็มจำนวน</p>
                </div>
              </div>

              <!-- Description -->
              <p class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                เริ่มต้นใช้งาน LUNG วันนี้และรับสิทธิพิเศษ<br class="hidden sm:inline" />
                สำหรับ 7 วันแรกโดยอัตโนมัติ
              </p>

              <!-- CTAs -->
              <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <NuxtLink
                  to="/register"
                  class="btn-secondary inline-flex items-center justify-center gap-2 text-base md:text-lg px-8 py-4 shadow-lung-lg hover:shadow-lung-xl"
                >
                  สมัครสมาชิก - รับสิทธิทันที
                  <ArrowRight :size="20" />
                </NuxtLink>
                <NuxtLink
                  to="/become-lung"
                  class="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-2 border-white/30 rounded-lung inline-flex items-center justify-center gap-2 text-base md:text-lg px-8 py-4 transition-all duration-300 font-semibold"
                >
                  สมัครเป็นลุง
                </NuxtLink>
              </div>

              <!-- Fine print -->
              <p class="text-sm text-white/70 pt-4">
                * โปรโมชั่นมีผลทันทีหลังสมัครสมาชิกและใช้ได้เป็นเวลา 7 วัน
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-cream/50 to-white">
      <div class="container-lung">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
            วันนี้อยากทำอะไร?
          </h2>
          <p class="text-base md:text-lg text-gray-600">
            เลือกกิจกรรมที่คุณสนใจ
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
          <CategoryCard
            v-for="category in categories"
            :key="category.id"
            :category="category"
          />
        </div>
      </div>
    </section>

    <!-- Featured Section -->
    <FeaturedSection />

    <!-- Available People Section -->
    <section class="py-20 md:py-28 bg-white">
      <div class="container-lung">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
            วันนี้มีลุงคนไหนว่างบ้าง?
          </h2>
          <p class="text-base md:text-lg text-gray-600">
            ลุงเช่า คนที่พร้อมไปกินข้าว เที่ยว คาเฟ่ กับคุณวันนี้
          </p>
        </div>

        <LungGrid :lungs="availableLungs" :loading="loading" />

        <div class="text-center mt-12 md:mt-16">
          <NuxtLink
            to="/search"
            class="btn-primary inline-flex items-center gap-2 text-base md:text-lg px-8 py-4 shadow-lung-lg hover:shadow-lung-xl"
          >
            ดูทั้งหมด
            <ArrowRight :size="20" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="py-20 md:py-28 bg-gradient-to-b from-cream/50 to-white">
      <div class="container-lung">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
            เช่าลุง หาคนไปด้วย ง่ายแค่ 3 ขั้นตอน
          </h2>
          <p class="text-base md:text-lg text-gray-600">
            จองลุงออนไลน์ หาเพื่อนไปกินข้าว เที่ยว คาเฟ่ ได้ภายในไม่กี่นาที
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          <div class="text-center space-y-4 group">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-orange rounded-lung-lg flex items-center justify-center mx-auto mb-6 shadow-lung-md group-hover:shadow-lung-lg transition-shadow">
              <span class="text-3xl font-bold text-dark">1</span>
            </div>
            <h3 class="text-xl md:text-2xl font-bold text-dark">ค้นหา</h3>
            <p class="text-gray-600 leading-relaxed text-sm md:text-base px-4">
              เลือกลุงและกิจกรรมที่คุณสนใจ
            </p>
          </div>

          <div class="text-center space-y-4 group">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-orange rounded-lung-lg flex items-center justify-center mx-auto mb-6 shadow-lung-md group-hover:shadow-lung-lg transition-shadow">
              <span class="text-3xl font-bold text-dark">2</span>
            </div>
            <h3 class="text-xl md:text-2xl font-bold text-dark">จอง</h3>
            <p class="text-gray-600 leading-relaxed text-sm md:text-base px-4">
              เลือกวัน เวลา และสถานที่
            </p>
          </div>

          <div class="text-center space-y-4 group">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-orange rounded-lung-lg flex items-center justify-center mx-auto mb-6 shadow-lung-md group-hover:shadow-lung-lg transition-shadow">
              <span class="text-3xl font-bold text-dark">3</span>
            </div>
            <h3 class="text-xl md:text-2xl font-bold text-dark">ไปด้วยกัน</h3>
            <p class="text-gray-600 leading-relaxed text-sm md:text-base px-4">
              พบกันและใช้เวลาร่วมกัน
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="py-20 md:py-28 bg-white">
      <div class="container-lung">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
            ทำไมต้อง LUNG?
          </h2>
          <p class="text-base md:text-lg text-gray-600">
            ความปลอดภัยและความเป็นส่วนตัวของคุณคือสิ่งสำคัญ
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div class="bg-white rounded-lung-lg p-6 space-y-4 border-2 border-gray-100 hover:border-primary hover:shadow-lung-lg transition-all duration-300 group">
            <div class="w-14 h-14 bg-soft-green rounded-lung flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 :size="28" class="text-dark" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-dark">ยืนยันตัวตน</h3>
            <p class="text-gray-600 text-sm md:text-base leading-relaxed">
              ทุกคนต้องยืนยันตัวตนก่อนเข้าใช้งาน
            </p>
          </div>

          <div class="bg-white rounded-lung-lg p-6 space-y-4 border-2 border-gray-100 hover:border-primary hover:shadow-lung-lg transition-all duration-300 group">
            <div class="w-14 h-14 bg-soft-green rounded-lung flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 :size="28" class="text-dark" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-dark">ระบบจองปลอดภัย</h3>
            <p class="text-gray-600 text-sm md:text-base leading-relaxed">
              ชำระเงินผ่านระบบที่ปลอดภัย
            </p>
          </div>

          <div class="bg-white rounded-lung-lg p-6 space-y-4 border-2 border-gray-100 hover:border-primary hover:shadow-lung-lg transition-all duration-300 group">
            <div class="w-14 h-14 bg-soft-green rounded-lung flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 :size="28" class="text-dark" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-dark">รีวิวจากผู้ใช้จริง</h3>
            <p class="text-gray-600 text-sm md:text-base leading-relaxed">
              อ่านความคิดเห็นจากผู้ใช้งานจริง
            </p>
          </div>

          <div class="bg-white rounded-lung-lg p-6 space-y-4 border-2 border-gray-100 hover:border-primary hover:shadow-lung-lg transition-all duration-300 group">
            <div class="w-14 h-14 bg-soft-green rounded-lung flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 :size="28" class="text-dark" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-dark">มีทีมดูแล</h3>
            <p class="text-gray-600 text-sm md:text-base leading-relaxed">
              ทีมงานพร้อมช่วยเหลือตลอด 24/7
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Partner CTA Section -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-cream/30 to-white">
      <div class="container-lung">
        <div class="max-w-5xl mx-auto">
          <div class="bg-soft-green rounded-lung-xl p-10 md:p-16 lg:p-20 text-center shadow-lung-xl border-2 border-green-100">
            <div class="max-w-3xl mx-auto space-y-6 md:space-y-8">
              <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight">
                มีประสบการณ์ดี ๆ<br />
                อยากแบ่งปันให้ใครสักคน?
              </h2>
              <p class="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                มาเป็นส่วนหนึ่งของ LUNG<br class="hidden sm:inline" />
                สร้างรายได้เสริมและพบปะผู้คนใหม่ ๆ
              </p>
              <NuxtLink
                to="/become-lung"
                class="btn-primary inline-flex items-center gap-2 text-base md:text-lg px-8 md:px-10 py-4 shadow-lung-lg hover:shadow-lung-xl"
              >
                สมัครเป็นลุง
                <ArrowRight :size="22" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="relative py-24 md:py-32 bg-gradient-to-br from-primary via-orange to-primary overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

      <div class="container-lung text-center relative z-10">
        <div class="max-w-4xl mx-auto space-y-8">
          <h2 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-dark leading-tight px-4">
            วันนี้อยากมีใครไปด้วยไหม?
          </h2>
          <p class="text-lg md:text-xl text-dark/80 max-w-2xl mx-auto px-4">
            เริ่มค้นหาคนที่พร้อมจะไปกับคุณวันนี้
          </p>
          <NuxtLink
            to="/search"
            class="btn-secondary inline-flex items-center gap-2 text-base md:text-lg px-8 md:px-10 py-4 shadow-lung-xl hover:shadow-lung-xl hover:scale-105"
          >
            ค้นหาคนที่พร้อมไปกับคุณ
            <ArrowRight :size="22" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
