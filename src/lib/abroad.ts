import { useEffect, useState } from 'react';
import { COUNTRY_BY_ID } from './geo';

/**
 * 외교부 여행경보·입국허가요건, 수출입은행 환율 (CI가 매일 받아 넣음, 실패하면 지난 자료).
 * 번들에 넣지 않고 /data/abroad.json(scripts/abroad-build.ts가 public/data에 쓰는 사본)을 쓸 때 받는다:
 * 매일 바뀌는 자료가 첫 묶음과 서비스워커 해시를 매일 바꾸지 않게(F17). 받기 전·못 받으면 null이라 화면·답에서 그 줄을 뺀다.
 */
export interface Abroad {
  alarm?: Record<string, { lvl: number; remark?: string }>; alarmAt?: string;
  visa?: Record<string, { free: boolean | null; stay?: string; note?: string }>; visaAt?: string;
  fx?: Record<string, number>; fxAt?: string;
  /** 여행경보 조정 (나라 ISO2 k, 날짜 d, 제목 t) */
  changes?: { k: string; d: string; t: string }[]; changesAt?: string;
  /** 나라별 최근 안전공지 (ISO2 → 최근 것부터) */
  notices?: Record<string, { d: string; t: string }[]>; noticesAt?: string;
}
let D: Abroad | null = null;
let loading: Promise<Abroad | null> | null = null;
const listeners = new Set<() => void>();

const hasContent = (d: unknown): d is Abroad => !!d && typeof d === 'object' && ('alarm' in d || 'visa' in d || 'fx' in d);

/** 자료를 받는다 (한 번만, 실패하면 다음에 다시). 브라우저 밖(시험)에서는 받지 않는다 */
export function loadAbroad(): Promise<Abroad | null> {
  if (D) return Promise.resolve(D);
  if (typeof window === 'undefined') return Promise.resolve(null);
  loading ??= fetch('/data/abroad.json', { headers: { accept: 'application/json' } })
    // 호스팅은 없는 파일 대신 index.html을 주므로 JSON인지 본다
    .then((r) => (r.ok && /json/.test(r.headers.get('content-type') ?? '') ? r.json() : null))
    .then((j) => { if (hasContent(j)) { D = j; for (const f of listeners) f(); } return D; })
    .catch(() => null)
    .finally(() => { if (!D) loading = null; });
  return loading;
}
/** 지금 받아 둔 자료 (받기 전엔 null). 규칙형 엔진처럼 동기로 쓰는 곳용 */
export const abroadNow = (): Abroad | null => D;
/** 시험용: 받지 않고 바로 넣는다 */
export function setAbroad(d: Abroad | null) { D = d; for (const f of listeners) f(); }

/** 자료가 오면 다시 그리게 하는 훅. 받는 중엔 undefined('외교부 자료 받는 중'), 못 받았으면 null(손 메모로), 받았으면 자료 */
export function useAbroad(): Abroad | null | undefined {
  const [d, setD] = useState<Abroad | null | undefined>(() => D ?? undefined);
  useEffect(() => {
    if (d !== undefined) return; // 받았거나(자료) 못 받았거나(null) — 이번 화면에서는 한 번만 시도
    let on = true;
    const tick = () => { if (on && D) setD(D); };
    listeners.add(tick);
    void loadAbroad().then((x) => on && setD(x));
    return () => { on = false; listeners.delete(tick); };
  }, [d]);
  return d;
}

const iso2 = (countryId: string) => COUNTRY_BY_ID.get(countryId)?.iso2?.toUpperCase() ?? '';
const md = (d?: string) => (d ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '');

export const ALARM_LABEL = ['', '여행유의', '여행자제', '출국권고', '여행금지'];

/** 여행경보: 1 여행유의 · 2 여행자제 · 3 출국권고 · 4 여행금지 (자료를 아직 못 받았으면 null) */
export function alarmFor(countryId: string, d: Abroad | null = D): { lvl: number; text: string; at: string } | null {
  const a = d?.alarm?.[iso2(countryId)];
  if (!a) return null;
  return { lvl: a.lvl, text: `${a.remark ? `${a.remark} ` : ''}${a.lvl}단계 ${ALARM_LABEL[a.lvl] ?? ''}`.trim(), at: md(d?.alarmAt) };
}

/** 입국(일반여권): '무비자 90일' / '비자 필요' (자료를 아직 못 받았으면 null) */
export function visaFor(countryId: string, d: Abroad | null = D): { text: string; at: string } | null {
  const v = d?.visa?.[iso2(countryId)];
  if (!v || v.free === null) return null;
  return { text: v.free ? `무비자${v.stay ? ` ${v.stay}` : ''}` : '비자 필요', at: md(d?.visaAt) };
}

/** 환율: 'JPY 엔' 같은 통화 글에서 코드를 읽어 '1엔 ≈ 8.5원' (자료를 아직 못 받았으면 null) */
export function fxFor(cur: string, d: Abroad | null = D): { text: string; at: string } | null {
  const code = cur.match(/[A-Z]{3}/)?.[0];
  if (!code || !d?.fx?.[code]) return null;
  const v = d.fx[code];
  const unit = cur.replace(code, '').trim() || code;
  const [n, shown] = v < 1 ? [100, v * 100] : v < 20 ? [1, v] : [1, v];
  return { text: `${n === 100 ? 100 : 1}${unit} ≈ ${shown >= 100 ? Math.round(shown).toLocaleString('ko-KR') : shown.toFixed(1)}원`, at: md(d.fxAt) };
}

/**
 * 안전 소식 한 줄: 가고 싶은·계획한 나라의 최근 여행경보 조정·안전공지 중 가장 새것 하나.
 * 경보 조정은 30일, 공지는 14일 안의 것만 (오래된 공지로 겁주지 않게). 앞의 나라(예정 여행)가 먼저.
 */
export interface SafetyNews { countryId: string; kind: '경보' | '공지'; d: string; t: string; when: string }
export function safetyNews(countryIds: string[], d: Abroad | null = D, now = new Date()): SafetyNews | null {
  if (!d) return null;
  const ago = (x: string) => (now.getTime() - new Date(`${x}T00:00:00+09:00`).getTime()) / 86_400_000;
  for (const id of [...new Set(countryIds)]) {
    const k = iso2(id);
    if (!k) continue;
    const c = (d.changes ?? []).filter((x) => x.k.toUpperCase() === k && ago(x.d) <= 30 && ago(x.d) >= -1).sort((a, b) => b.d.localeCompare(a.d))[0];
    const n = (d.notices?.[k] ?? []).filter((x) => ago(x.d) <= 14 && ago(x.d) >= -1).sort((a, b) => b.d.localeCompare(a.d))[0];
    const pick = c && (!n || c.d >= n.d) ? { kind: '경보' as const, ...c } : n ? { kind: '공지' as const, ...n } : null;
    if (pick) return { countryId: id, kind: pick.kind, d: pick.d, t: pick.t, when: md(pick.d) };
  }
  return null;
}
