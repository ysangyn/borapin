/**
 * 읽어 주기 (폰 내장 음성, 무료). 안 될 때 조용히 지나가지 않고 이유를 알린다.
 * - 카카오톡·네이버 앱 안 브라우저: 음성 기능이 없다 → '다른 브라우저로 열기' 안내
 * - 아이폰: 무음 스위치가 켜져 있으면 소리가 안 난다 → 처음 한 번 안내
 * - 아이폰 사파리: cancel() 바로 뒤 speak()는 무시될 때가 있다 → 말하는 중일 때만 멈추고 잠깐 뒤에
 */
const EVENT = 'borapin:speech-note';
const UA = typeof navigator !== 'undefined' ? navigator.userAgent : '';
export const inAppBrowser = (ua = UA) => /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i.test(ua);
export const isIOS = (ua = UA) => /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);

export function speechProblemText(kind: 'none' | 'silent', ua = UA): string {
  if (inAppBrowser(ua)) return /KAKAOTALK/i.test(ua)
    ? '카카오톡 안에서는 읽어 주기가 안 돼요. 오른쪽 아래 ⋯ → 다른 브라우저로 열어 주세요'
    : '앱 안 브라우저에서는 읽어 주기가 안 돼요. 사파리나 크롬으로 열어 주세요';
  if (isIOS(ua)) return '소리가 안 나면 옆 무음 스위치를 끄고 소리를 키워 주세요';
  return kind === 'none' ? '이 브라우저는 읽어 주기를 못 해요. 크롬으로 열어 주세요' : '소리가 안 나면 미디어 소리를 키워 주세요';
}

const note = (msg: string) => window.dispatchEvent(new CustomEvent(EVENT, { detail: msg }));
export function onSpeechNote(fn: (msg: string) => void) {
  const h = (e: Event) => fn((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

const PREFER: Record<string, RegExp> = { en: /Samantha|Google US|Karen|Daniel|Moira|Aaron|Nicky/ };

export function say(text: string, lang: string, rate = 0.92) {
  const ss = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!ss || typeof SpeechSynthesisUtterance === 'undefined' || inAppBrowser()) { note(speechProblemText('none')); return; }
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    const short = lang.slice(0, 2).toLowerCase();
    const voices = ss.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(short));
    const pick = voices.find((v) => PREFER[short]?.test(v.name)) ?? voices.find((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) ?? voices[0];
    if (pick) u.voice = pick;
    let started = false;
    u.onstart = () => { started = true; };
    u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') note(speechProblemText('silent')); };
    const go = () => { ss.speak(u); ss.resume?.(); };
    if (ss.speaking || ss.pending) { ss.cancel(); window.setTimeout(go, 120); } else go();
    window.setTimeout(() => { if (!started && !ss.speaking) note(speechProblemText(ss.getVoices().length ? 'silent' : 'none')); }, 3000);
    // 아이폰은 무음 스위치를 알 수 없어서 처음 한 번만 알려 둔다
    if (isIOS()) {
      try { if (!localStorage.getItem('borapin:speech-ios-tip')) { localStorage.setItem('borapin:speech-ios-tip', '1'); note(speechProblemText('silent')); } } catch { /* */ }
    }
  } catch {
    note(speechProblemText('none'));
  }
}
