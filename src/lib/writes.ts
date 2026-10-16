/**
 * 저장은 기기에 먼저 남고 연결되면 서버로 간다(Firestore 오프라인 캐시).
 * 서버 확인을 끝까지 기다리면 오프라인에서 '저장 중…'에 멈추므로,
 * 온라인이면 잠깐(1.5초)만 기다려 바로 난 오류는 화면에서 알리고, 그 뒤 오류는 알림으로 알린다.
 */
const EVENT = 'borapin:write-error';

export function queued(p: Promise<unknown>, wait = 1500): Promise<void> {
  let done = false;
  return new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(() => {
      done = true;
      resolve();
    }, typeof navigator !== 'undefined' && navigator.onLine === false ? 0 : wait);
    p.then(
      () => {
        if (done) return;
        done = true;
        window.clearTimeout(t);
        resolve();
      },
      (e) => {
        if (!done) {
          done = true;
          window.clearTimeout(t);
          reject(e);
        } else {
          console.warn(e);
          window.dispatchEvent(new CustomEvent(EVENT, { detail: (e as { code?: string })?.code ?? '' }));
        }
      },
    );
  });
}

/** 늦게 실패한 저장을 듣는다 (알림 띄우기용) */
export function onLateWriteError(fn: (code: string) => void) {
  const h = (e: Event) => fn((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

/** 사진처럼 서버에 바로 올려야 하는 일은 연결부터 확인 */
export const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
