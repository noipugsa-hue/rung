<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-cream border-t border-gray-100 mt-20">
    <div class="container-lung py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="text-2xl font-bold text-dark mb-3">LUNG</div>
          <p class="text-gray-600 text-sm">
            บางวัน…เราแค่ต้องการใครสักคนไปด้วย
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-semibold text-dark mb-3">สำหรับผู้ใช้</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/search" class="text-gray-600 hover:text-dark transition-colors text-sm">
                ค้นหาคน
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/" class="text-gray-600 hover:text-dark transition-colors text-sm">
                วิธีใช้งาน
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/" class="text-gray-600 hover:text-dark transition-colors text-sm">
                ความปลอดภัย
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-dark mb-3">สำหรับลุง</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/become-lung" class="text-gray-600 hover:text-dark transition-colors text-sm">
                สมัครเป็นลุง
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/partner/dashboard" class="text-gray-600 hover:text-dark transition-colors text-sm">
                Dashboard
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-dark mb-3">ช่วยเหลือ</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-gray-600 hover:text-dark transition-colors text-sm">
                คำถามที่พบบ่อย
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/" class="text-gray-600 hover:text-dark transition-colors text-sm">
                ติดต่อเรา
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="pt-8 border-t border-gray-200">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-gray-600 text-sm">
            © {{ currentYear }} LUNG. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <NuxtLink to="/" class="text-gray-600 hover:text-dark transition-colors text-sm">
              Terms
            </NuxtLink>
            <NuxtLink to="/" class="text-gray-600 hover:text-dark transition-colors text-sm">
              Privacy
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
