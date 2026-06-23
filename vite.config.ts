import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/synth-sheet-live/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Synth Sheet Live',
        short_name: 'SynthSheet',
        description: 'A PWA for creating and performing synthesizer chord sheets live',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f0f0f',
        theme_color: '#0f0f0f',
        start_url: '/synth-sheet-live/',
        scope: '/synth-sheet-live/',
        icons: [
          {
            src: '/synth-sheet-live/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/synth-sheet-live/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/synth-sheet-live/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
