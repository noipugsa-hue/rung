<script setup lang="ts">
const props = withDefaults(defineProps<{
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  showFrame?: boolean
  aspectRatio?: 'square' | '4/3' | '16/9'
}>(), {
  showFrame: true,
  aspectRatio: '4/3'
})

const frameClasses = computed(() => {
  if (!props.showFrame) return ''

  const tierFrames = {
    Bronze: 'ring-4 ring-orange-500/30',
    Silver: 'ring-4 ring-gray-400/30',
    Gold: 'ring-4 ring-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    Platinum: 'ring-4 ring-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.4)]'
  }

  return props.tier ? tierFrames[props.tier] : 'ring-2 ring-gray-200'
})

const aspectClass = computed(() => {
  switch (props.aspectRatio) {
    case 'square': return 'aspect-square'
    case '16/9': return 'aspect-video'
    default: return 'aspect-[4/3]'
  }
})
</script>

<template>
  <div
    class="relative rounded-2xl overflow-hidden transition-all duration-300"
    :class="[aspectClass, frameClasses]"
  >
    <slot />
  </div>
</template>
