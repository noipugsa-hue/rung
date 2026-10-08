<script setup lang="ts">
import {
  Heart,
  MapPin,
  Languages,
  Briefcase,
  ArrowLeft,
  Calendar,
  MessageCircle
} from 'lucide-vue-next'
import { useLungStore } from '~/stores/lung'
import { useFavoritesStore } from '~/stores/favorites'
import { useAchievementStore } from '~/stores/achievement'
import { formatBaht } from '~/utils/money'
import ImageLightbox from '~/components/common/ImageLightbox.vue'
import ProfileImageFrame from '~/components/common/ProfileImageFrame.vue'
import TierBadge from '~/components/common/TierBadge.vue'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const lungStore = useLungStore()
const favoritesStore = useFavoritesStore()
const achievementStore = useAchievementStore()

const lungId = route.params.id as string

onMounted(() => {
  lungStore.fetchLungById(lungId)
})

const lung = computed(() => lungStore.currentLung)
const isFavorited = computed(() => lung.value ? favoritesStore.isFavorite(lung.value.id) : false)

// Lightbox state
const showLightbox = ref(false)
const lightboxStartIndex = ref(0)

const openLightbox = (index: number) => {
  lightboxStartIndex.value = index
  showLightbox.value = true
}

// Fetch tier data
const lungTier = ref<'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null>(null)

// Dynamic SEO based on lung data
const { setSeo, getPersonSchema, getBreadcrumbSchema } = useSeo()

watch(lung, async (newLung) => {
  if (newLung) {
    // Fetch tier for this lung's user
    if (newLung.userId) {
      const points = await achievementStore.getUserPoints(newLung.userId)
      if (points) {
        lungTier.value = points.tier
      }
    }

    // Set SEO
    setSeo({
      title: `เช่าลุง ${newLung.name} - ${newLung.categories[0]} | LUNG`,
      description: `จองลุง ${newLung.name} อายุ ${newLung.age} ปี จาก ${newLung.location} สำหรับ ${newLung.categories.join(', ')} ${newLung.bio.substring(0, 100)}... ราคา ${formatBaht(newLung.pricePerHour)} ต่อชั่วโมง`,
      keywords: [
        'เช่าลุง',
        `เช่าลุง${newLung.location}`,
        ...newLung.categories.map(cat => `หาคน${cat}`),
        newLung.name,
        'จองลุง',
        'ลุงเช่า'
      ],
      image: newLung.gallery[0],
      type: 'article',
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          getPersonSchema(newLung),
          getBreadcrumbSchema([
            { name: 'หน้าแรก', url: '/' },
            { name: 'ค้นหาลุง', url: '/search' },
            { name: newLung.name }
          ])
        ]
      }
    })
  }
}, { immediate: true })

const toggleFavorite = () => {
  if (lung.value) {
    favoritesStore.toggleFavorite(lung.value.id)
  }
}

const goToBooking = () => {
  router.push(`/booking/${lungId}`)
}
</script>

<template>
  <div v-if="lung" class="pb-8">
    <!-- Back button -->
    <div class="container-lung py-4">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors"
      >
        <ArrowLeft :size="20" />
        <span>กลับ</span>
      </button>
    </div>

    <!-- Enhanced Gallery -->
    <div class="container-lung mb-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <!-- Primary image - larger with tier badge -->
        <div
          class="col-span-2 md:row-span-2 relative group cursor-pointer"
          @click="openLightbox(0)"
        >
          <ProfileImageFrame
            :tier="lungTier"
            :show-frame="!!lungTier"
            aspect-ratio="4/3"
          >
            <img
              :src="lung.gallery[0]"
              :alt="lung.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <!-- Gradient overlay on hover -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            <!-- View icon on hover -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <span class="text-2xl">👁️</span>
              </div>
            </div>

            <!-- Tier badge overlay -->
            <TierBadge
              v-if="lungTier"
              :tier="lungTier"
              size="md"
              position="top-right"
            />
          </ProfileImageFrame>
        </div>

        <!-- Additional images (show up to 6 more) -->
        <div
          v-for="(img, idx) in lung.gallery.slice(1, 7)"
          :key="idx"
          class="relative group cursor-pointer rounded-2xl overflow-hidden aspect-square hover:ring-2 hover:ring-primary transition-all"
          @click="openLightbox(idx + 1)"
        >
          <img
            :src="img"
            :alt="`${lung.name} ${idx + 2}`"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          <!-- Show remaining count on last image -->
          <div
            v-if="idx === 5 && lung.gallery.length > 7"
            class="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl"
          >
            +{{ lung.gallery.length - 7 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <ImageLightbox
      v-if="showLightbox"
      :images="lung.gallery"
      :initial-index="lightboxStartIndex"
      @close="showLightbox = false"
    />

    <div class="container-lung">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Header -->
          <div>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
                  {{ lung.name }}, {{ lung.age }}
                </h1>
                <div class="flex items-center gap-4 flex-wrap">
                  <RatingStars :rating="lung.rating" :review-count="lung.reviewCount" size="md" />
                  <VerifiedBadge v-if="lung.verified" size="md" />
                  <AvailabilityBadge :available="lung.available" />
                </div>
              </div>

              <button
                @click="toggleFavorite"
                class="p-3 rounded-full border-2 border-gray-200 hover:border-primary transition-colors"
                :class="{ 'text-red-500 border-red-500': isFavorited }"
              >
                <Heart :size="24" :class="{ 'fill-current': isFavorited }" />
              </button>
            </div>

            <div class="flex items-center gap-6 text-gray-600 flex-wrap">
              <div class="flex items-center gap-2">
                <MapPin :size="18" />
                <span>{{ lung.location }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Languages :size="18" />
                <span>{{ lung.languages.join(', ') }}</span>
              </div>
            </div>
          </div>

          <!-- About -->
          <div class="card p-6">
            <h2 class="text-2xl font-bold text-dark mb-4">เกี่ยวกับ{{ lung.name }}</h2>
            <p class="text-gray-700 leading-relaxed">{{ lung.bio }}</p>
          </div>

          <!-- Experience -->
          <div class="card p-6">
            <div class="flex items-center gap-2 mb-4">
              <Briefcase :size="24" class="text-primary" />
              <h2 class="text-2xl font-bold text-dark">ประสบการณ์</h2>
            </div>
            <p class="text-gray-700">{{ lung.experience }}</p>
          </div>

          <!-- Categories -->
          <div class="card p-6">
            <h2 class="text-2xl font-bold text-dark mb-4">กิจกรรมที่รับ</h2>
            <div class="flex flex-wrap gap-3">
              <span
                v-for="cat in lung.categories"
                :key="cat"
                class="px-4 py-2 bg-cream rounded-full font-medium text-dark"
              >
                {{ cat }}
              </span>
            </div>
          </div>

          <!-- Reviews -->
          <div v-if="lung.reviews.length > 0" class="card p-6">
            <h2 class="text-2xl font-bold text-dark mb-6">รีวิว</h2>
            <div class="space-y-6">
              <div
                v-for="review in lung.reviews"
                :key="review.id"
                class="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div class="flex items-start gap-4">
                  <img
                    :src="review.userAvatar"
                    :alt="review.userName"
                    class="w-12 h-12 rounded-full object-cover"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="font-semibold text-dark">{{ review.userName }}</span>
                      <RatingStars :rating="review.rating" size="sm" />
                    </div>
                    <p class="text-gray-700 mb-2">{{ review.comment }}</p>
                    <div class="flex items-center gap-3 text-sm text-gray-500">
                      <span>{{ review.activity }}</span>
                      <span>•</span>
                      <span>{{ new Date(review.date).toLocaleDateString('th-TH') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking card - Sticky on desktop -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24 space-y-6">
            <div>
              <PriceDisplay :price="lung.price" size="lg" />
            </div>

            <div v-if="lung.availability.length > 0" class="space-y-3">
              <div class="flex items-center gap-2 text-dark font-semibold">
                <Calendar :size="20" />
                <span>ช่วงเวลาว่าง</span>
              </div>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div
                  v-for="slot in lung.availability.slice(0, 3)"
                  :key="slot.date"
                  class="text-sm"
                >
                  <div class="font-medium text-dark">
                    {{ new Date(slot.date).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    }) }}
                  </div>
                  <div class="text-gray-600">
                    {{ slot.times.join(', ') }}
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="lung.available"
              @click="goToBooking"
              class="btn-primary w-full"
            >
              จอง{{ lung.name }}
            </button>
            <button
              v-else
              disabled
              class="btn-outline w-full opacity-50 cursor-not-allowed"
            >
              ขณะนี้ไม่ว่าง
            </button>

            <button class="btn-outline w-full flex items-center justify-center gap-2">
              <MessageCircle :size="20" />
              ส่งข้อความ
            </button>

            <div class="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <p>✓ ยกเลิกได้ฟรีภายใน 24 ชั่วโมง</p>
              <p>✓ ชำระเงินผ่านระบบปลอดภัย</p>
              <p>✓ ได้รับการประกันความปลอดภัย</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile booking bar -->
    <div class="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
      <div class="flex items-center justify-between gap-4">
        <div>
          <PriceDisplay :price="lung.price" size="md" />
        </div>
        <button
          v-if="lung.available"
          @click="goToBooking"
          class="btn-primary flex-1"
        >
          จองเลย
        </button>
        <button
          v-else
          disabled
          class="btn-outline flex-1 opacity-50 cursor-not-allowed"
        >
          ไม่ว่าง
        </button>
      </div>
    </div>
  </div>

  <div v-else-if="lungStore.loading" class="container-lung py-12">
    <div class="animate-pulse space-y-8">
      <div class="h-96 bg-gray-200 rounded-lung-lg" />
      <div class="h-8 bg-gray-200 rounded w-1/3" />
      <div class="h-32 bg-gray-200 rounded-lung" />
    </div>
  </div>

  <div v-else class="container-lung py-12 text-center">
    <div class="text-6xl mb-4">😕</div>
    <h2 class="text-2xl font-bold text-dark mb-2">ไม่พบข้อมูล</h2>
    <p class="text-gray-600 mb-6">ไม่พบโปรไฟล์ที่คุณค้นหา</p>
    <NuxtLink to="/search" class="btn-primary">
      กลับไปค้นหา
    </NuxtLink>
  </div>
</template>
