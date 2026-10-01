<script setup lang="ts">
import { Search, MapPin, Calendar } from 'lucide-vue-next'
import { ref } from 'vue'

const searchQuery = ref('')
const location = ref('')
const date = ref('')

const router = useRouter()

const handleSearch = () => {
  const query: any = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (location.value) query.location = location.value
  if (date.value) query.date = date.value

  router.push({
    path: '/search',
    query
  })
}
</script>

<template>
  <div class="bg-white rounded-lung-xl shadow-lung-xl p-6 md:p-8 border border-gray-100 hover:shadow-lung-xl transition-shadow duration-300">
    <h2 class="text-2xl md:text-3xl font-bold text-dark mb-6 text-center">
      วันนี้อยากทำอะไร?
    </h2>

    <form @submit.prevent="handleSearch" class="space-y-4">
      <!-- Desktop Layout -->
      <div class="hidden md:grid md:grid-cols-3 md:gap-4">
        <!-- Activity Search -->
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search :size="20" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหากิจกรรม"
            class="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-dark placeholder-gray-400"
          />
        </div>

        <!-- Location -->
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <MapPin :size="20" />
          </div>
          <input
            v-model="location"
            type="text"
            placeholder="พื้นที่"
            class="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-dark placeholder-gray-400"
          />
        </div>

        <!-- Date -->
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Calendar :size="20" />
          </div>
          <input
            v-model="date"
            type="date"
            placeholder="วันและเวลา"
            class="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-dark placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="space-y-3 md:hidden">
        <!-- Activity Search -->
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search :size="20" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหากิจกรรม"
            class="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-dark placeholder-gray-400"
          />
        </div>

        <!-- Location -->
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <MapPin :size="20" />
          </div>
          <input
            v-model="location"
            type="text"
            placeholder="พื้นที่"
            class="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-dark placeholder-gray-400"
          />
        </div>

        <!-- Date -->
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Calendar :size="20" />
          </div>
          <input
            v-model="date"
            type="date"
            class="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-dark placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Search Button -->
      <div class="pt-2">
        <button
          type="submit"
          class="btn-primary w-full md:w-auto md:px-12 py-4 text-lg shadow-lung-lg hover:shadow-lung-xl"
        >
          ค้นหา
        </button>
      </div>
    </form>
  </div>
</template>
