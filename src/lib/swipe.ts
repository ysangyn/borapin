import { useEffect, type RefObject } from 'react';

/**
 * 아래로 끌어서 닫기 (지역 창 같은 아래 창): 손잡이에서 시작하거나, 안쪽 목록이 맨 위일 때 아래로 끌면 창이 따라 내려오고
 * 100px 넘게(또는 빠르게) 내리면 닫힌다. 덜 내리면 제자리로. 손가락 기기에서만, 움직임 줄이기면 끌기만 하고 애니메이션 없이 닫음.
 * 창의 기본 위치(transform: translateX(-50%))를 지키며 아래로만 옮긴다.
 */
export function useSwipeDown(sheet: RefObject<HTMLElement | null>, scroller: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    let y0 = 0, t0 = 0, dy = 0, active = false, decided = false;
    const base = getComputedStyle(el).transform === 'none' ? '' : 'translateX(-50%) ';
    const set = (y: number, anim = false) => { el.style.animation = 'none'; el.style.transition = anim ? 'transform .2s ease' : 'none'; el.style.transform = `${base}translateY(${y}px)`; };
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const fromGrip = !!(e.target as Element).closest?.('.grip');
      const atTop = (scroller.current?.scrollTop ?? 0) <= 0;
      if (!fromGrip && !atTop) return;
      // 가로로 넘기는 사진 줄·지도 안에서는 끌지 않는다
      if ((e.target as Element).closest?.('.tour-strip, .chips, input, textarea, select')) return;
      y0 = e.touches[0].clientY; t0 = Date.now(); dy = 0; active = true; decided = fromGrip;
    };
    const move = (e: TouchEvent) => {
      if (!active) return;
      const d = e.touches[0].clientY - y0;
      if (!decided) { if (Math.abs(d) < 6) return; if (d < 0) { active = false; return; } decided = true; }
      dy = Math.max(0, d);
      if (e.cancelable) e.preventDefault();
      set(dy);
    };
    const end = () => {
      if (!active) return;
      active = false;
      const fast = dy > 40 && dy / Math.max(1, Date.now() - t0) > 0.6;
      if (dy > 100 || fast) {
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { onClose(); return; }
        set(el.offsetHeight, true);
        window.setTimeout(onClose, 180);
      } else if (dy > 0) {
        set(0, true);
      }
      dy = 0;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
