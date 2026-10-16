import { useEffect, useState } from 'react';

/**
 * 현지어 여행 표현 (src/data/phrases.json): 말마다 30문장, 우리말 뜻·현지 글·한글 발음.
 * 세계 도시 자료의 '말'(lang) 글자에서 말을 고른다. 영어권은 오늘의 영어(/study)로 보낸다.
 */
export type Phrase = [group: string, ko: string, native: string, sound: string];
export interface PhraseLang { label: string; speech: string; items: Phrase[] }
export interface PhraseData { updated: string; groups: string[]; langs: Record<string, PhraseLang> }

let cache: Promise<PhraseData> | null = null;
export function loadPhrases(): Promise<PhraseData> {
  if (!cache) {
    cache = import('../data/phrases.json').then((m) => m.default as unknown as PhraseData);
    cache.catch(() => { cache = null; });
  }
  return cache;
}
export function usePhrases(): PhraseData | null {
  const [d, setD] = useState<PhraseData | null>(null);
  useEffect(() => { let on = true; loadPhrases().then((x) => on && setD(x)); return () => { on = false; }; }, []);
  return d;
}

const BY_NAME: [RegExp, string][] = [
  [/일본어/, 'ja'], [/중국어|광둥어/, 'zh'], [/태국어/, 'th'], [/베트남어/, 'vi'], [/스페인어/, 'es'], [/프랑스어/, 'fr'],
  [/이탈리아어/, 'it'], [/독일어/, 'de'], [/인도네시아어|말레이어/, 'id'], [/포르투갈어/, 'pt'],
];
export const LANG_LABEL: Record<string, string> = { ja: '일본어', zh: '중국어', th: '태국어', vi: '베트남어', es: '스페인어', fr: '프랑스어', it: '이탈리아어', de: '독일어', id: '인도네시아어', pt: '포르투갈어', en: '영어' };

/** '중국어(번체)' · '말레이어·영어' 같은 글자에서 표현 묶음 코드 ('영어'만 있으면 'en') */
export function phraseLangFor(lang: string): string | null {
  for (const [re, code] of BY_NAME) if (re.test(lang)) return code;
  return /영어/.test(lang) ? 'en' : null;
}

/** 현지어 읽어 주기 (기기 내장 음성, 없으면 조용히 넘어감) */
export function speakPhrase(text: string, speech: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speech;
    u.rate = 0.9;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace('_', '-').toLowerCase().startsWith(speech.slice(0, 2).toLowerCase()));
    if (v) u.voice = v;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch { /* 음성 없는 기기 */ }
}
