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
      title: 'LUNG — เช่าลุง หาคนไปด้วย บริการหาเพื่อนทำกิจกรรม',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'แพลตฟอร์มเช่าลุง ลุงเช่า หาคนไปด้วยในกิจกรรมต่างๆ กินข้าว เที่ยว คาเฟ่ คุยเล่น จองได้ง่าย ราคาเริ่มต้น 200 บาท ทดลองฟรี 7 วัน'
        },
        {
          name: 'keywords',
          content: 'เช่าลุง, ลุงเช่า, หาคนไปด้วย, หาเพื่อนไปเที่ยว, หาคนกินข้าว, หาคนไปคาเฟ่, บริการหาเพื่อน, คนเช่า, หาเพื่อนคุย, lung'
        },
        { property: 'og:site_name', content: 'LUNG' },
        { property: 'og:title', content: 'LUNG — เช่าลุง หาคนไปด้วย' },
        { property: 'og:description', content: 'แพลตฟอร์มเช่าลุง หาคนไปด้วยในกิจกรรมต่างๆ จองได้ง่าย ราคาเริ่มต้น 200 บาท' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'th_TH' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'LUNG — เช่าลุง หาคนไปด้วย' },
        { name: 'twitter:description', content: 'แพลตฟอร์มเช่าลุง หาคนไปด้วยในกิจกรรมต่างๆ' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'language', content: 'Thai' },
        { name: 'geo.region', content: 'TH' },
        { name: 'geo.placename', content: 'Thailand' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://lung.app' }
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
