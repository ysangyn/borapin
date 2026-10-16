import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';
import pkg from './package.json' with { type: 'json' };

// 이 빌드의 커밋 번호 (CI는 GITHUB_SHA, 내 컴퓨터는 git, 둘 다 없으면 dev)
const COMMIT = (() => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'dev';
  }
})();
const BUILT_AT = new Date().toISOString();

/** 배포 확인용: index.html에 버전 표시, /version.json 만들기 */
function versionStamp(): Plugin {
  return {
    name: 'borapin-version',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { name: 'borapin-version', content: `${pkg.version}+${COMMIT}` }, injectTo: 'head' }],
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: pkg.version, commit: COMMIT, builtAt: BUILT_AT }) + '\n' });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    versionStamp(),
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
  define: { __APP_VERSION__: JSON.stringify(pkg.version), __COMMIT__: JSON.stringify(COMMIT) },
  server: { port: 5173, host: true },
  build: { chunkSizeWarningLimit: 1500 },
});
