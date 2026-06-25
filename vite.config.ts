/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// PWA: 앱 셸 + 세포 이미지(webp)는 precache → 오프라인 동작.
// 결과카드(/cards/*)는 precache에서 제외하고 런타임 캐시(StaleWhileRevalidate)로만 (perf §9-3).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '오늘의 세포 회의',
        short_name: '세포회의',
        description: '지금 내 머릿속 세포들이 회의 중이야.',
        theme_color: '#FF6B9D',
        background_color: '#FFF7FB',
        display: 'standalone',
        lang: 'ko',
      },
      workbox: {
        // 앱 셸(js/css/html) + 세포 webp만 precache. cards/*는 제외.
        globPatterns: ['**/*.{js,css,html}', 'cells/*.webp'],
        globIgnores: ['cards/**'],
        runtimeCaching: [
          {
            urlPattern: /\/cards\/.*\.(?:png|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'result-cards',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
