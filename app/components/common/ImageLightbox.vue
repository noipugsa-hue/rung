<script setup lang="ts">
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useSwipe } from '@vueuse/core'

const props = withDefaults(defineProps<{
  images: string[]
  initialIndex?: number
}>(), {
  initialIndex: 0
})

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.initialIndex)
const lightboxRef = ref<HTMLElement | null>(null)

// Swipe support for mobile
const { direction } = useSwipe(lightboxRef, {
  onSwipe() {
    if (direction.value === 'left') next()
    if (direction.value === 'right') prev()
  }
})

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

// Keyboard support
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') emit('close')
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="lightboxRef"
      class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <!-- Close button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
      >
        <X :size="24" class="text-white" />
      </button>

      <!-- Navigation -->
      <button
        v-if="images.length > 1"
        @click="prev"
        class="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
      >
        <ChevronLeft :size="24" class="text-white" />
      </button>

      <button
        v-if="images.length > 1"
        @click="next"
        class="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
      >
        <ChevronRight :size="24" class="text-white" />
      </button>

      <!-- Main image -->
      <div class="max-w-6xl w-full flex flex-col items-center gap-4">
        <img
          :src="images[currentIndex]"
          :alt="`Image ${currentIndex + 1}`"
          class="max-h-[80vh] w-auto object-contain rounded-lg animate-fade-in"
          :key="currentIndex"
        />

        <!-- Thumbnail strip -->
        <div
          v-if="images.length > 1"
          class="flex gap-2 overflow-x-auto max-w-full px-4 py-2"
        >
          <button
            v-for="(img, idx) in images"
            :key="idx"
            @click="currentIndex = idx"
            class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all"
            :class="[
              idx === currentIndex
                ? 'ring-primary scale-110'
                : 'ring-transparent hover:ring-white/50'
            ]"
          >
            <img
              :src="img"
              :alt="`Thumbnail ${idx + 1}`"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      <!-- Image counter -->
      <div
        v-if="images.length > 1"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium"
      >
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </Teleport>
</template>
