<script setup lang="ts">
import { Heart } from 'lucide-vue-next'
import { useFavoritesStore } from '~/stores/favorites'
import { useLungStore } from '~/stores/lung'

definePageMeta({
  middleware: 'auth'
})

const favoritesStore = useFavoritesStore()
const lungStore = useLungStore()

onMounted(() => {
  lungStore.fetchLungs()
})

const favoriteLungs = computed(() => {
  return lungStore.lungs.filter(lung =>
    favoritesStore.favoriteIds.includes(lung.id)
  )
})
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          รายการถูกใจ
        </h1>
        <p class="text-gray-600">
          คนที่คุณสนใจและอาจจะอยากจองในอนาคต
        </p>
      </div>

      <LungGrid v-if="favoriteLungs.length > 0" :lungs="favoriteLungs" />

      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-cream rounded-full mb-6">
          <Heart :size="48" class="text-gray-400" />
        </div>
        <h2 class="text-2xl font-bold text-dark mb-3">
          ยังไม่มีคนที่คุณถูกใจ
        </h2>
        <p class="text-gray-600 mb-6">
          เริ่มค้นหาและกดหัวใจเพื่อบันทึกคนที่คุณสนใจ
        </p>
        <NuxtLink to="/search" class="btn-primary">
          ไปค้นหาคน
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
