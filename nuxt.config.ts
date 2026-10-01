// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    server: {
      hmr: {
        overlay: false // ปิด error overlay
      }
    }
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  typescript: {
    strict: true,
    typeCheck: false, // Disable for faster dev
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  app: {
    head: {
      title: 'LUNG — ใครสักคนไปด้วย',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'ค้นหาคนที่พร้อมกินข้าว เที่ยว คาเฟ่ หรือใช้เวลาด้วยกัน'
        },
        { property: 'og:title', content: 'LUNG — ใครสักคนไปด้วย' },
        { property: 'og:description', content: 'ค้นหาคนที่พร้อมกินข้าว เที่ยว คาเฟ่ หรือใช้เวลาด้วยกัน' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
    }
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
})
