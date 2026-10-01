<script setup lang="ts">
import { ArrowRight, CheckCircle2, DollarSign, Calendar, Users } from 'lucide-vue-next'
import { categories } from '~/data/categories'

definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-b from-cream to-white py-16 md:py-24">
      <div class="container-lung text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-dark mb-6">
          อยากเป็นคนที่<br />
          ใครสักคนกำลังมองหา?
        </h1>
        <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          แบ่งปันเวลา ประสบการณ์ และเรื่องราวของคุณ<br />
          พร้อมสร้างรายได้ในเวลาเดียวกัน
        </p>
        <NuxtLink to="/apply" class="btn-primary text-lg inline-flex items-center gap-2">
          สมัครเป็นลุง
          <ArrowRight :size="22" />
        </NuxtLink>
        <p class="text-sm text-gray-600 mt-4">
          กรอกแบบฟอร์ม 5 ขั้นตอน • ใช้เวลาประมาณ 15-20 นาที
        </p>
      </div>
    </section>

    <!-- Benefits -->
    <section class="py-16 md:py-20">
      <div class="container-lung">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-dark mb-4">
            ทำไมต้องเป็นลุง?
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card p-6 text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full">
              <DollarSign :size="32" class="text-dark" />
            </div>
            <h3 class="text-xl font-bold text-dark">สร้างรายได้</h3>
            <p class="text-gray-600">
              กำหนดราคาเองตามประสบการณ์ ค่าเฉลี่ย 300-500 บาท/ชั่วโมง
            </p>
          </div>

          <div class="card p-6 text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full">
              <Calendar :size="32" class="text-dark" />
            </div>
            <h3 class="text-xl font-bold text-dark">เวลาที่ยืดหยุ่น</h3>
            <p class="text-gray-600">
              เลือกวันและเวลาที่ว่างได้เอง ทำงานตามความสะดวก
            </p>
          </div>

          <div class="card p-6 text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full">
              <Users :size="32" class="text-dark" />
            </div>
            <h3 class="text-xl font-bold text-dark">พบปะผู้คน</h3>
            <p class="text-gray-600">
              พบเจอผู้คนใหม่ ๆ แชร์ประสบการณ์ และสร้างมิตรภาพ
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Activities -->
    <section class="py-16 md:py-20 bg-cream">
      <div class="container-lung">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-dark mb-4">
            คุณสามารถทำอะไรได้บ้าง?
          </h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="card p-6 text-center space-y-3"
          >
            <div class="text-4xl">{{ cat.emoji }}</div>
            <div class="font-semibold text-dark">{{ cat.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-16 md:py-20">
      <div class="container-lung">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-dark mb-4">
            เริ่มต้นอย่างไร?
          </h2>
        </div>

        <div class="max-w-4xl mx-auto space-y-8">
          <div class="flex gap-6">
            <div class="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-dark">
              1
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-dark mb-2">สมัคร</h3>
              <p class="text-gray-600">
                กรอกข้อมูลและอัปโหลดเอกสารยืนยันตัวตน
              </p>
            </div>
          </div>

          <div class="flex gap-6">
            <div class="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-dark">
              2
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-dark mb-2">ยืนยันตัวตน</h3>
              <p class="text-gray-600">
                เราจะตรวจสอบเอกสารและโปรไฟล์ของคุณ (ใช้เวลา 1-2 วัน)
              </p>
            </div>
          </div>

          <div class="flex gap-6">
            <div class="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-dark">
              3
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-dark mb-2">สร้างโปรไฟล์</h3>
              <p class="text-gray-600">
                เขียนแนะนำตัวเอง เพิ่มรูปภาพ และตั้งราคา
              </p>
            </div>
          </div>

          <div class="flex gap-6">
            <div class="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-dark">
              4
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-dark mb-2">รอรับ Booking</h3>
              <p class="text-gray-600">
                โปรไฟล์ของคุณจะปรากฏในระบบ พร้อมรับการจอง
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Requirements -->
    <section class="py-16 md:py-20 bg-soft-green">
      <div class="container-lung">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-dark mb-4">
            คุณสมบัติ
          </h2>
        </div>

        <div class="max-w-2xl mx-auto space-y-3">
          <div class="flex items-start gap-3">
            <CheckCircle2 :size="24" class="text-green-600 flex-shrink-0 mt-1" />
            <p class="text-gray-700">อายุ 40 ปีขึ้นไป</p>
          </div>
          <div class="flex items-start gap-3">
            <CheckCircle2 :size="24" class="text-green-600 flex-shrink-0 mt-1" />
            <p class="text-gray-700">มีบัตรประชาชนไทย</p>
          </div>
          <div class="flex items-start gap-3">
            <CheckCircle2 :size="24" class="text-green-600 flex-shrink-0 mt-1" />
            <p class="text-gray-700">ผ่านการตรวจสอบประวัติอาชญากรรม</p>
          </div>
          <div class="flex items-start gap-3">
            <CheckCircle2 :size="24" class="text-green-600 flex-shrink-0 mt-1" />
            <p class="text-gray-700">มีทักษะการสื่อสารที่ดี</p>
          </div>
          <div class="flex items-start gap-3">
            <CheckCircle2 :size="24" class="text-green-600 flex-shrink-0 mt-1" />
            <p class="text-gray-700">มีความรับผิดชอบและตรงต่อเวลา</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 md:py-20 bg-gradient-to-r from-primary to-orange">
      <div class="container-lung text-center">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6">
          พร้อมเริ่มต้นแล้วหรือยัง?
        </h2>
        <NuxtLink to="/register" class="btn-secondary text-lg inline-flex items-center gap-2">
          สมัครเป็นลุงตอนนี้
          <ArrowRight :size="22" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
