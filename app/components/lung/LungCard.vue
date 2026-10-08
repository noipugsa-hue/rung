<script setup lang="ts">
import type { Lung } from '~/types'
import { Heart, MapPin } from 'lucide-vue-next'
import { useFavoritesStore } from '~/stores/favorites'
import { useFeaturedStore } from '~/stores/featured'
import { useAchievementStore } from '~/stores/achievement'
import FeaturedBadge from '~/components/common/FeaturedBadge.vue'
import TierBadge from '~/components/common/TierBadge.vue'

const props = defineProps<{
  lung: Lung
}>()

const favoritesStore = useFavoritesStore()
const featuredStore = useFeaturedStore()
const achievementStore = useAchievementStore()

const isFavorited = computed(() => favoritesStore.isFavorite(props.lung.id))
const isFeatured = computed(() => featuredStore.isItemFeatured(props.lung.id))

const toggleFavorite = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  favoritesStore.toggleFavorite(props.lung.id)
}

// Image carousel state
const currentImageIndex = ref(0)
const isHovering = ref(false)
let autoRotateInterval: NodeJS.Timeout | null = null

// Fetch tier data
const lungTier = ref<'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null>(null)

onMounted(async () => {
  // Fetch tier for this lung's user
  if (props.lung.userId) {
    const points = await achievementStore.getUserPoints(props.lung.userId)
    if (points) {
      lungTier.value = points.tier
    }
  }
})

// Display up to 3 images from gallery
const displayImages = computed(() => {
  if (!props.lung.gallery || props.lung.gallery.length === 0) {
    return [props.lung.avatar]
  }
  return props.lung.gallery.slice(0, 3)
})

const currentImage = computed(() => {
  return displayImages.value[currentImageIndex.value] || props.lung.avatar
})

// Auto-rotate images on hover (desktop only)
const startAutoRotate = () => {
  isHovering.value = true
  if (displayImages.value.length <= 1 || window.innerWidth < 768) return

  autoRotateInterval = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % displayImages.value.length
  }, 2500)
}

const stopAutoRotate = () => {
  isHovering.value = false
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval)
    autoRotateInterval = null
  }
  currentImageIndex.value = 0
}

onUnmounted(() => {
  stopAutoRotate()
})
</script>

<template>
  <NuxtLink
    :to="`/lung/${lung.id}`"
    class="bg-white rounded-lung-xl overflow-hidden border-2 border-gray-100 hover:border-primary hover:shadow-lung-xl transition-all duration-300 group block"
    @mouseenter="startAutoRotate"
    @mouseleave="stopAutoRotate"
  >
    <div class="relative overflow-hidden aspect-4/3">
      <!-- Image with smooth transition -->
      <img
        :src="currentImage"
        :alt="lung.name"
        class="w-full h-full object-cover transition-all duration-500"
        :class="{ 'group-hover:scale-105': !isHovering }"
        :key="currentImage"
      />

      <!-- Image indicators (dots) -->
      <div
        v-if="displayImages.length > 1"
        class="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div
          v-for="(_, idx) in displayImages"
          :key="idx"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="[
            idx === currentImageIndex
              ? 'bg-white w-4'
              : 'bg-white/50 w-1.5'
          ]"
        />
      </div>

      <!-- Overlay gradient on hover -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <!-- Favorite button -->
      <button
        @click="toggleFavorite"
        class="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lung-md z-20"
        :class="{ 'text-red-500': isFavorited, 'text-gray-700': !isFavorited }"
      >
        <Heart :size="19" :class="{ 'fill-current': isFavorited }" />
      </button>

      <!-- Tier badge -->
      <TierBadge
        v-if="lungTier"
        :tier="lungTier"
        size="sm"
        position="bottom-left"
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <!-- Availability badge -->
      <div class="absolute bottom-3 left-3 z-20">
        <AvailabilityBadge :available="lung.available" />
      </div>

      <!-- Verified badge -->
      <div v-if="lung.verified" class="absolute top-3 left-3 z-20">
        <VerifiedBadge size="sm" />
      </div>

      <!-- Featured badge -->
      <div v-if="isFeatured" class="absolute top-3 left-3 z-20" :class="{ 'top-14': lung.verified }">
        <FeaturedBadge size="sm" />
      </div>

      <!-- Instant Book badge -->
      <div v-if="lung.instantBook" class="absolute bottom-3 right-3 z-20">
        <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
          ⚡ จองได้ทันที
        </span>
      </div>
    </div>

    <div class="p-5 sm:p-6 space-y-4">
      <!-- Name and age -->
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-lg sm:text-xl font-bold text-dark group-hover:text-primary transition-colors">
          {{ lung.name }}, {{ lung.age }}
        </h3>
        <RatingStars :rating="lung.rating" :review-count="lung.reviewCount" size="sm" />
      </div>

      <!-- Location -->
      <div class="flex items-center gap-2 text-gray-600 text-sm">
        <MapPin :size="16" class="shrink-0" />
        <span class="truncate">{{ lung.location }}</span>
      </div>

      <!-- Categories -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="cat in lung.categories.slice(0, 3)"
          :key="cat"
          class="px-3 py-1.5 bg-cream rounded-full text-xs font-medium text-dark"
        >
          {{ cat }}
        </span>
        <span
          v-if="lung.categories.length > 3"
          class="px-3 py-1.5 bg-cream rounded-full text-xs font-medium text-gray-600"
        >
          +{{ lung.categories.length - 3 }}
        </span>
      </div>

      <!-- Price -->
      <div class="pt-4 border-t border-gray-100">
        <PriceDisplay :price="lung.price" size="sm" />
      </div>
    </div>
  </NuxtLink>
</template>
