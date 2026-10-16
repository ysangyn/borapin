import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';

// 웹 앱 설정값. 앱에 들어가 공개되는 값이며, 데이터 보호는 Firestore 보안 규칙이 맡는다.
const firebaseConfig = {
  apiKey: 'AIzaSyCaK68gpzphfn9bFWQsR_8zXfSVkMKBzMM',
  authDomain: 'borapin.firebaseapp.com',
  projectId: 'borapin',
  storageBucket: 'borapin.firebasestorage.app',
  messagingSenderId: '148116962013',
  appId: '1:148116962013:web:17ffc0608e37c71c997934',
};

// 시험용 프로젝트 borapin-test (실제 기록과 완전히 분리). 미리보기 주소에서만 쓴다.
const testConfig = {
  apiKey: 'AIzaSyAXT9E3jX2BBJwQv0dWS4Fqcx-7qK8bWt0',
  authDomain: 'borapin-test.firebaseapp.com',
  projectId: 'borapin-test',
  storageBucket: 'borapin-test.firebasestorage.app',
  messagingSenderId: '604713963331',
  appId: '1:604713963331:web:35c413dcdffff3d0f7e9f6',
};

export const USE_EMULATOR = import.meta.env.VITE_EMULATOR === '1';
/** 호스팅 미리보기 채널 주소 (borapin--채널-해시.web.app): 실제 기록 대신 시험용 프로젝트에 붙는다 */
export const IS_PREVIEW = typeof location !== 'undefined' && /^borapin--[a-z0-9-]+\.web\.app$/.test(location.hostname);

export const app = initializeApp(
  USE_EMULATOR ? { ...firebaseConfig, projectId: 'demo-borapin' } : IS_PREVIEW ? testConfig : firebaseConfig,
);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  // 오프라인에서도 기록·사진을 볼 수 있게 기기에 캐시(최대 300MB, 오래 안 본 것부터 비움).
  // 테스트와 공유 링크(로그인 없이 보는 사람)는 기기에 남기지 않는다 — 공개를 끄면 바로 못 보게.
  localCache: USE_EMULATOR || location.pathname.startsWith('/s/')
    ? memoryLocalCache()
    : persistentLocalCache({ tabManager: persistentMultipleTabManager(), cacheSizeBytes: 300 * 1024 * 1024 }),
});

if (USE_EMULATOR) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

/** 처음부터 관리자인 계정. Firestore 보안 규칙(firestore.rules)과 같은 값이어야 한다. */
export const OWNER_EMAIL = 'ysangyn@gmail.com';
export const SPACE_ID = 'main';
