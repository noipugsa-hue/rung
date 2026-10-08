<script setup lang="ts">
const props = withDefaults(defineProps<{
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  size?: 'sm' | 'md' | 'lg'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}>(), {
  size: 'sm',
  position: 'top-right'
})

const tierConfig = {
  Bronze: {
    gradient: 'from-orange-700 to-orange-500',
    icon: '🥉',
    ring: 'ring-orange-500/50'
  },
  Silver: {
    gradient: 'from-gray-400 to-gray-200',
    icon: '🥈',
    ring: 'ring-gray-400/50'
  },
  Gold: {
    gradient: 'from-yellow-500 to-yellow-300',
    icon: '🥇',
    ring: 'ring-yellow-500/50'
  },
  Platinum: {
    gradient: 'from-purple-600 to-purple-400',
    icon: '💎',
    ring: 'ring-purple-500/50'
  }
}

const config = computed(() => tierConfig[props.tier])

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'lg': return 'w-14 h-14 text-lg'
    case 'md': return 'w-10 h-10 text-sm'
    default: return 'w-8 h-8 text-xs'
  }
})

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top-left': return 'top-2 left-2'
    case 'bottom-right': return 'bottom-2 right-2'
    case 'bottom-left': return 'bottom-2 left-2'
    default: return 'top-2 right-2'
  }
})
</script>

<template>
  <div
    class="absolute z-20 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ring-2 group cursor-help"
    :class="[sizeClasses, positionClasses, config.gradient, config.ring]"
    :title="`ระดับ ${tier}`"
  >
    <span class="font-bold">{{ config.icon }}</span>

    <!-- Tooltip -->
    <div
      class="absolute bottom-full mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
    >
      ระดับ {{ tier }}
      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <div class="border-4 border-transparent border-t-dark" />
      </div>
    </div>
  </div>
</template>
