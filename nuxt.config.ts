// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [ '@pinia/nuxt' ],
  devtools: { enabled: true },
  css: [ '@/css/tailwind.css' ],
  srcDir: './src',
  compatibilityDate: '2024-11-01',

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  pinia: {
    storesDirs: [ './src/stores/**' ]
  },
  devServer: {
    port: 3000
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001', // assuming your Express server runs on 3001
        changeOrigin: true
      }
    }
  }
})
