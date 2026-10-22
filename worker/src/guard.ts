/**
 * 뒷단 문지기 — 순수 함수만 (시험: tests/unit/worker-guard.test.ts)
 * 토큰 내용 검사, 멤버 확인 결과 해석, 메모리 캐시, 분당 횟수 세기.
 * Cloudflare 전용 타입을 쓰지 않아 node 시험에서도 그대로 돈다.
 */

/** Firebase ID 토큰의 내용(payload) 가운데 우리가 보는 칸 */
export interface TokenPayload { aud?: unknown; iss?: unknown; sub?: unknown; exp?: unknown; iat?: unknown; email?: unknown; email_verified?: unknown }
export type PayloadCheck = { ok: true; uid: string; email: string; project: string } | { ok: false; reason: string };

/**
 * 서명 확인 전에 내용으로 거르기: 만료·발급처·대상(우리 프로젝트)·메일 인증.
 * 메일 인증이 안 된 토큰(이메일로 막 가입한 계정·익명)은 보안 규칙(signedIn)과 똑같이 받지 않는다. 구글 로그인은 늘 인증됨.
 */
export function checkPayload(p: TokenPayload, projects: string[], nowSec: number): PayloadCheck {
  if (typeof p.exp !== 'number' || typeof p.iat !== 'number') return { ok: false, reason: 'no time' };
  if (p.exp <= nowSec) return { ok: false, reason: 'expired' };
  if (p.iat > nowSec + 300) return { ok: false, reason: 'issued in future' };
  const project = projects.find((x) => p.aud === x && p.iss === `https://securetoken.google.com/${x}`);
  if (!project) return { ok: false, reason: 'wrong project' };
  if (typeof p.sub !== 'string' || !p.sub) return { ok: false, reason: 'no uid' };
  if (typeof p.email !== 'string' || !p.email) return { ok: false, reason: 'no email' };
  if (p.email_verified !== true) return { ok: false, reason: 'email not verified' };
  return { ok: true, uid: p.sub, email: p.email, project };
}

// ---------- 멤버 확인 (Firestore REST로 멤버 전용 문서를 사용자 토큰으로 읽어 본다) ----------
/** 멤버만 읽을 수 있는 문서 (firestore.rules: `match /config/access { allow read: if isMember(); }`). 내용은 필요 없어 칸 하나만 달라고 한다 */
export const memberDocUrl = (project: string) => `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents/config/access?mask.fieldPaths=updatedAt`;
/** 읽기 결과 → 멤버인지: 200 멤버 · 401/403 아님 · 그 밖(404·429·5xx·연결 실패 0)은 모름(이번만 거절, 캐시 안 함) */
export function memberFromStatus(status: number): 'member' | 'denied' | 'unknown' {
  if (status === 200) return 'member';
  if (status === 401 || status === 403) return 'denied';
  return 'unknown';
}
/** 캐시 기간: 멤버는 1시간, 아닌 사람은 5분(초대로 막 들어온 사람이 오래 막히지 않게) */
export const MEMBER_TTL_MS = { member: 60 * 60_000, denied: 5 * 60_000 } as const;

// ---------- 작은 메모리 캐시 (Worker 전역, 크기 제한) ----------
export class TtlCache<V> {
  private m = new Map<string, { v: V; until: number }>();
  constructor(private readonly max = 500) {}
  get(key: string, now = Date.now()): V | undefined {
    const e = this.m.get(key);
    if (!e) return undefined;
    if (e.until <= now) {
      this.m.delete(key);
      return undefined;
    }
    return e.v;
  }
  set(key: string, v: V, ttlMs: number, now = Date.now()): void {
    this.m.delete(key);
    if (this.m.size >= this.max) {
      for (const [k, e] of this.m) if (e.until <= now) this.m.delete(k); // 지난 것 먼저
      while (this.m.size >= this.max) this.m.delete(this.m.keys().next().value as string); // 그래도 차면 가장 오래된 것
    }
    this.m.set(key, { v, until: now + ttlMs });
  }
  get size(): number {
    return this.m.size;
  }
}

// ---------- 분당 횟수 세기 (고정 창, 메모리) ----------
export class RateCounter {
  private m = new Map<string, { n: number; start: number }>();
  constructor(private readonly limit: number, private readonly windowMs = 60_000, private readonly max = 2000) {}
  /** 한 번 세고, limit 안이면 ok. 넘으면 창이 끝날 때까지 몇 초인지(retryAfter) 알려 준다 */
  hit(key: string, now = Date.now()): { ok: boolean; retryAfter: number } {
    let e = this.m.get(key);
    if (!e || now - e.start >= this.windowMs) {
      if (!e && this.m.size >= this.max) this.sweep(now);
      e = { n: 0, start: now };
      this.m.set(key, e);
    }
    e.n++;
    const ok = e.n <= this.limit;
    return { ok, retryAfter: ok ? 0 : Math.max(1, Math.ceil((e.start + this.windowMs - now) / 1000)) };
  }
  get size(): number {
    return this.m.size;
  }
  private sweep(now: number) {
    for (const [k, e] of this.m) if (now - e.start >= this.windowMs) this.m.delete(k);
    while (this.m.size >= this.max) this.m.delete(this.m.keys().next().value as string);
  }
}
