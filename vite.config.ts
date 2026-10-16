import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [
    react(),
    // 앱처럼 설치·오프라인: 화면과 지도 경계는 기기에 저장, 사진은 한 번 본 것만 저장
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false, // public/manifest.webmanifest를 그대로 쓴다 (공유 대상 포함)
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,topojson}', 'art/bora-rest.webp'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__/],
        runtimeCaching: [
          {
            // 글꼴은 쓰는 글자 묶음만 그때그때 받아 저장
            urlPattern: ({ url }) => url.pathname.endsWith('.woff2'),
            handler: 'CacheFirst',
            options: { cacheName: 'fonts-local', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            // 꾸밈 사진·그림: 한 번 본 것만 저장 (영상은 브라우저 캐시에 맡긴다)
            urlPattern: ({ url }) => /^\/(media|art)\/.+\.webp$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'scenery', expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'cdn.jsdelivr.net',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'fonts', expiration: { maxEntries: 120 } },
          },
        ],
      },
    }),
  ],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173, host: true },
  build: { chunkSizeWarningLimit: 1500 },
});
