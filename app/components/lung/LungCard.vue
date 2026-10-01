<script setup lang="ts">
import type { Lung } from '~/types'
import { Heart, MapPin } from 'lucide-vue-next'
import { useFavoritesStore } from '~/stores/favorites'
import { useFeaturedStore } from '~/stores/featured'
import FeaturedBadge from '~/components/common/FeaturedBadge.vue'

const props = defineProps<{
  lung: Lung
}>()

const favoritesStore = useFavoritesStore()
const featuredStore = useFeaturedStore()

const isFavorited = computed(() => favoritesStore.isFavorite(props.lung.id))
const isFeatured = computed(() => featuredStore.isItemFeatured(props.lung.id))

const toggleFavorite = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  favoritesStore.toggleFavorite(props.lung.id)
}
</script>

<template>
  <NuxtLink
    :to="`/lung/${lung.id}`"
    class="bg-white rounded-lung-xl overflow-hidden border-2 border-gray-100 hover:border-primary hover:shadow-lung-xl transition-all duration-300 group block"
  >
    <div class="relative overflow-hidden aspect-4/3">
      <img
        :src="lung.avatar"
        :alt="lung.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />

      <!-- Overlay gradient on hover -->
      <div class="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <!-- Favorite button -->
      <button
        @click="toggleFavorite"
        class="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lung-md z-20"
        :class="{ 'text-red-500': isFavorited, 'text-gray-700': !isFavorited }"
      >
        <Heart :size="19" :class="{ 'fill-current': isFavorited }" />
      </button>

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
