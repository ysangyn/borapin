/** 단위 시험용 `src/lib/firebase.ts` 대역: 진짜 앱을 만들지 않는다 (libLoader.ts가 끼워 넣음) */
export const app = { __fake: true };
export const auth = { currentUser: null as unknown };
export const db = { __fake: true };
export const USE_EMULATOR = false;
export const IS_PREVIEW = false;
export const OWNER_EMAIL = 'ysangyn@gmail.com';
export const SPACE_ID = 'main';
