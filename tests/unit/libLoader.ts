/**
 * Firebase를 쓰는 src/lib 모듈을 Node 단위 시험에서 불러오기.
 * `firebase/firestore`는 가짜(firebaseFake.ts)로, `src/lib/firebase.ts`는 대역(firebaseAppFake.ts)으로 바꿔 끼운다.
 * 이 모듈을 먼저 import한 뒤 `lib('share.ts')`처럼 동적으로 불러야 바꿔 끼운 것이 적용된다.
 */
import { register } from 'node:module';

const FAKE = new URL('./firebaseFake.ts', import.meta.url).href;
const APP = new URL('./firebaseAppFake.ts', import.meta.url).href;
const hook =
  'data:text/javascript,' +
  encodeURIComponent(`
const FAKE = ${JSON.stringify(FAKE)}, APP = ${JSON.stringify(APP)};
export async function resolve(specifier, context, next) {
  if (specifier === 'firebase/firestore') return { url: FAKE, shortCircuit: true };
  if (/(^|\\/)firebase(\\.ts)?$/.test(specifier) && context.parentURL && /\\/src\\/lib\\//.test(context.parentURL)) return { url: APP, shortCircuit: true };
  return next(specifier, context);
}
`);
register(hook, import.meta.url);

// 브라우저 전역 흉내 (writes.ts의 window.setTimeout, share.ts의 location 등)
const g = globalThis as unknown as Record<string, unknown>;
g.window ??= globalThis;
g.location ??= { origin: 'https://borapin.web.app', pathname: '/', hostname: 'borapin.web.app' };
if (!('onLine' in (g.navigator as object))) Object.defineProperty(g.navigator, 'onLine', { value: true, configurable: true, writable: true });

/** src/lib 모듈 불러오기 (형은 쓰는 쪽에서 `typeof import('../../src/lib/x')`로 붙인다) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lib = (file: string): Promise<any> => import(new URL(`../../src/lib/${file}`, import.meta.url).href);

export * as fake from './firebaseFake';
