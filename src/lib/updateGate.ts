/**
 * 새 버전을 언제 받을지 (순수 판단 · 시험: tests/unit/updateGate.test.ts · 쓰는 곳: components/system.tsx UpdateWatcher)
 *
 * 새 버전은 되도록 바로 받되(옛 버전이 남지 않게), 쓰던 내용이 날아가지 않게 한다.
 * - 작업 중(기록·장소·가고 싶은 곳 편집, 글·오늘의 질문 답 쓰는 중, 사진 올리는 중 — components/ui.tsx useBusy)이거나
 *   입력칸에 커서가 있으면 절대 바로 새로 고치지 않는다.
 * - 그럴 땐 다음 화면으로 넘어갈 때(경로가 바뀔 때)나 화면을 숨겼다가 돌아올 때, 그때도 작업 중이 아니면 받는다.
 *   작업이 끝났다고 그 자리에서 바로 새로 고치지는 않는다 (글 하나 남기고 바로 다음 글을 쓰는 사이에 화면이 바뀌지 않게).
 * - 막 도착했을 때는 손을 뗀 지 IDLE_MS 넘었을 때만 바로 받는다 (누르는 중에 화면이 바뀌지 않게).
 * - 띠의 단추는 사용자가 고른 것이니 언제든 받는다.
 */
export type Moment = 'arrived' | 'route' | 'visible' | 'button';
export interface GateState {
  /** 작업 중인 화면 수 (0이면 없음) */
  busy: number;
  /** 입력칸에 커서가 있는지 */
  typing: boolean;
  /** 마지막으로 누르거나 친 뒤 지난 시간(ms). 한 번도 없으면 Infinity */
  idleMs: number;
}
export const IDLE_MS = 10_000;

export function shouldApplyUpdate(s: GateState, at: Moment): boolean {
  if (at === 'button') return true;
  if (s.busy > 0 || s.typing) return false;
  if (at === 'arrived') return s.idleMs >= IDLE_MS;
  return true; // 'route' · 'visible': 화면이 어차피 바뀌는 때라 손을 뗀 지는 보지 않는다
}

const NOT_TEXT = new Set(['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'file', 'color', 'hidden', 'image']);
/** 커서가 글을 쓸 수 있는 칸에 있는지 (document.activeElement를 넣는다) */
export function isTextField(el: { tagName?: string; type?: string; isContentEditable?: boolean } | null | undefined): boolean {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = (el.tagName ?? '').toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag !== 'INPUT') return false;
  return !NOT_TEXT.has((el.type ?? 'text').toLowerCase());
}
