/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// PWA: 정적 데이터만 쓰므로 오프라인 동작 목표. 결과카드(/cards/*.png)는
// 다음 단계에서 precache 분리 전략(perf 게이트 §9-3)으로 따로 다룬다.
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
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
