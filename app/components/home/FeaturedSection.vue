<script setup lang="ts">
import { Star, TrendingUp } from 'lucide-vue-next'
import type { FeaturedItem } from '~/types/featured'
import { useFeaturedStore } from '~/stores/featured'

const featuredStore = useFeaturedStore()
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    await featuredStore.getActiveFeaturedItems(6)

    // Track impressions
    featuredStore.activeFeaturedItems.forEach(item => {
      featuredStore.trackImpression(item.id)
    })
  } catch (err) {
    console.error('Load featured items error:', err)
  } finally {
    loading.value = false
  }
})

async function handleClick(item: FeaturedItem) {
  await featuredStore.trackClick(item.id)

  // Navigate based on type
  if (item.type === 'lung') {
    navigateTo(`/lung/${item.itemId}`)
  } else if (item.type === 'activity') {
    navigateTo(`/search?category=${item.itemId}`)
  } else if (item.type === 'campaign') {
    // Handle campaign navigation
    navigateTo(`/campaign/${item.itemId}`)
  }
}
</script>

<template>
  <section class="py-16 bg-gradient-to-br from-cream to-soft-green">
    <div class="container-lung">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <Star :size="28" class="text-primary fill-primary" />
            <h2 class="text-3xl md:text-4xl font-bold text-dark">แนะนำพิเศษ</h2>
          </div>
          <p class="text-gray-600">Lung ยอดนิยมและกิจกรรมพิเศษสำหรับคุณ</p>
        </div>

        <NuxtLink
          to="/search"
          class="hidden sm:flex items-center gap-2 text-primary hover:text-dark transition-colors"
        >
          <span class="font-semibold">ดูทั้งหมด</span>
          <TrendingUp :size="20" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <!-- Featured Grid -->
      <div v-else-if="featuredStore.activeFeaturedItems.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in featuredStore.activeFeaturedItems"
          :key="item.id"
          @click="handleClick(item)"
          class="relative group cursor-pointer"
        >
          <div class="bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-primary hover:shadow-lung-xl transition-all duration-300">
            <!-- Image -->
            <div class="relative aspect-4/3 overflow-hidden">
              <img
                :src="item.imageUrl"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              <!-- Featured Badge -->
              <div class="absolute top-3 right-3 z-10">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-dark rounded-full text-xs font-bold shadow-lg">
                  <Star :size="14" class="fill-current" />
                  <span>แนะนำ</span>
                </span>
              </div>

              <!-- Overlay -->
              <div class="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent" />
            </div>

            <!-- Content -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                {{ item.title }}
              </h3>
              <p class="text-gray-600 text-sm line-clamp-2">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Star :size="64" class="mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500">ยังไม่มีรายการแนะนำในขณะนี้</p>
      </div>

      <!-- View All (Mobile) -->
      <div class="sm:hidden text-center mt-8">
        <NuxtLink
          to="/search"
          class="btn-outline inline-flex items-center gap-2"
        >
          <span>ดูทั้งหมด</span>
          <TrendingUp :size="20" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
