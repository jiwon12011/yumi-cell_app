/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// PWA 전략 (기획서 §10.4):
// - precache = 앱 셸 + 소형 이미지(optimized/icons·decor·props)만
// - 대형 이미지(배경·세포·카드)는 runtimeCaching CacheFirst — 첫 조회 후 오프라인 가능
// - 원본 PNG(public/*-v2)는 앱이 참조하지 않으므로 캐시 대상에서 제외
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '세포 감정일기',
        short_name: '세포일기',
        description: '오늘의 나는 어떤 세포일까? 세포로 쓰는 하루 한 줄 감정일기',
        theme_color: '#FF6B9D',
        background_color: '#FFF7FB',
        display: 'standalone',
        lang: 'ko',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html}',
          'icons/*.png',
          'optimized/icons/*.webp',
          'optimized/decor/*.webp',
          'optimized/props/*.webp',
          'optimized/cells/thumb/*.webp',
        ],
        globIgnores: [
          '**/backgrounds-v2/**',
          '**/cells-v2/**',
          '**/cards-v2/**',
          '**/decor-v2/**',
          '**/icons-v2/**',
          '**/props-v2/**',
        ],
        runtimeCaching: [
          {
            urlPattern: /\/optimized\/.*\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'font-css' },
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
