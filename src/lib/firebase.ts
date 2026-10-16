import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// 웹 앱 설정값. 앱에 들어가 공개되는 값이며, 데이터 보호는 Firestore 보안 규칙이 맡는다.
const firebaseConfig = {
  apiKey: 'AIzaSyCaK68gpzphfn9bFWQsR_8zXfSVkMKBzMM',
  authDomain: 'borapin.firebaseapp.com',
  projectId: 'borapin',
  storageBucket: 'borapin.firebasestorage.app',
  messagingSenderId: '148116962013',
  appId: '1:148116962013:web:17ffc0608e37c71c997934',
};

export const USE_EMULATOR = import.meta.env.VITE_EMULATOR === '1';

export const app = initializeApp(
  USE_EMULATOR ? { ...firebaseConfig, projectId: 'demo-borapin', storageBucket: 'demo-borapin.appspot.com' } : firebaseConfig,
);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  // 오프라인에서도 기록을 볼 수 있게 기기에 캐시. 테스트에서는 메모리만 사용.
  localCache: USE_EMULATOR ? memoryLocalCache() : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

/** 사진 저장소 (Firebase Storage, 미국 지역 버킷) */
export const storage = getStorage(app);

if (USE_EMULATOR) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

/** 처음부터 관리자인 계정. Firestore 보안 규칙(firestore.rules)과 같은 값이어야 한다. */
export const OWNER_EMAIL = 'ysangyn@gmail.com';
export const SPACE_ID = 'main';
