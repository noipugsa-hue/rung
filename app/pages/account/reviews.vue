<script setup lang="ts">
import { Star, ThumbsUp, Calendar, ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

const reviews = [
  {
    id: '1',
    lungName: 'ลุงเอก',
    lungAvatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    comment: 'ลุงเอกเป็นคนสนุก พูดคุยสนุก แนะนำร้านอาหารอร่อยมาก ประทับใจมากครับ',
    date: '2026-09-15',
    activity: 'กินข้าว'
  },
  {
    id: '2',
    lungName: 'ลุงสมชาย',
    lungAvatar: 'https://i.pravatar.cc/150?img=33',
    rating: 4,
    comment: 'เป็นมิตร รู้จักสถานที่เที่ยวดี บรรยากาศดีมากครับ',
    date: '2026-09-10',
    activity: 'เที่ยว'
  },
  {
    id: '3',
    lungName: 'ลุงประสิทธิ์',
    lungAvatar: 'https://i.pravatar.cc/150?img=51',
    rating: 5,
    comment: 'คุยสนุกมาก ใจดี พาไปคาเฟ่ดีๆ ประทับใจครับ จะใช้บริการอีกแน่นอน',
    date: '2026-09-05',
    activity: 'คาเฟ่'
  },
]
</script>

<template>
  <div class="py-8">
    <div class="container-lung max-w-4xl">
      <!-- Back button -->
      <button
        @click="router.push('/account')"
        class="flex items-center gap-2 text-gray-600 hover:text-dark transition-colors mb-6"
      >
        <ArrowLeft :size="20" />
        <span>กลับ</span>
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-2">
          รีวิวของฉัน
        </h1>
        <p class="text-gray-600">รีวิวที่คุณให้ไว้กับลุง</p>
      </div>

      <!-- Reviews List -->
      <div v-if="reviews.length > 0" class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="card p-6"
        >
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <img
              :src="review.lungAvatar"
              :alt="review.lungName"
              class="w-16 h-16 rounded-full object-cover"
            />

            <div class="flex-1">
              <!-- Header -->
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-lg font-bold text-dark">{{ review.lungName }}</h3>
                  <div class="flex items-center gap-3 mt-1">
                    <div class="flex items-center gap-1">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        :size="16"
                        :class="i <= review.rating ? 'text-primary fill-current' : 'text-gray-300'"
                      />
                    </div>
                    <span class="text-xs px-2 py-1 bg-cream rounded-full">{{ review.activity }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar :size="14" />
                  <span>{{ new Date(review.date).toLocaleDateString('th-TH') }}</span>
                </div>
              </div>

              <!-- Comment -->
              <p class="text-gray-700 leading-relaxed">
                {{ review.comment }}
              </p>

              <!-- Actions -->
              <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <button class="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
                  <ThumbsUp :size="14" />
                  <span>มีประโยชน์</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card p-12 text-center">
        <Star :size="48" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">ยังไม่มีรีวิว</h3>
        <p class="text-gray-600 mb-6">
          เมื่อคุณใช้บริการกับลุงแล้ว คุณสามารถให้รีวิวได้
        </p>
        <NuxtLink to="/search" class="btn-primary inline-flex items-center gap-2">
          ค้นหาลุง
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
