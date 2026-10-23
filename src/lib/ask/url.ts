/**
 * 물어보기 뒷단(Cloudflare Worker) 주소. 소식·장소 찾기도 같은 뒷단을 쓴다.
 * 규칙형 엔진(engine.ts)과 떨어뜨려 둔 이유: 홈 소식(news.ts)이 주소 하나 때문에 엔진·FAQ·주제 사전을 첫 묶음에 끌어들이지 않게.
 */
import { USE_EMULATOR } from '../firebase';

export const ASK_URL: string = (import.meta.env.VITE_ASK_URL as string | undefined)?.replace(/\/$/, '') ?? '';
/** 시험(에뮬레이터)에서는 AI를 부르지 않는다 (결과가 늘 같아야 하고, 한도를 아낀다) */
export const aiAvailable = () => !!ASK_URL && !USE_EMULATOR && typeof navigator !== 'undefined' && navigator.onLine !== false;
