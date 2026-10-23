import { useEffect, useRef, useState } from 'react';
import { photoById, preferStill, useBlur, videoById, type ScenePhoto } from '../lib/media';
import { artById } from '../lib/art';

/**
 * 여행지 사진: 흐린 미리보기가 먼저 깔리고, 화면 폭에 맞는 크기(640/1280)를 받는다.
 * 미리보기 묶음(media-blur.json)은 첫 묶음에 없어서 여기서 따로 받는다 — 오기 전엔 사진만, 오면 배경이 깔린다.
 */
export function ScenicPhoto({ photo, id, className, alt, eager, label }: { photo?: ScenePhoto | null; id?: string; className?: string; alt?: string; eager?: boolean; label?: 'top' | 'bottom' }) {
  const p = photo ?? (id ? photoById(id) : null);
  const [loaded, setLoaded] = useState(false);
  useBlur();
  if (!p) return null;
  return (
    <div className={'scenic ' + (className ?? '')} style={p.lqip ? { backgroundImage: `url(${p.lqip})` } : undefined}>
      <img
        src={p.src.l}
        srcSet={`${p.src.s} 640w, ${p.src.l} 1280w`}
        sizes="(min-width: 600px) 560px, 100vw"
        alt={alt ?? p.name}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={loaded ? 'on' : ''}
        onLoad={() => setLoaded(true)}
      />
      {/* 어디를 찍은 사진인지 */}
      {label && (
        <span className={'scenic-label ' + label} data-testid="scenic-label">
          <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
          {p.name}
        </span>
      )}
    </div>
  );
}

/** 세로로 긴 화면인지 (폰을 세워 든 경우). 돌리면 바뀐다. */
function useTall(enabled: boolean) {
  const q = '(max-aspect-ratio: 3/4)';
  const [tall, setTall] = useState(() => enabled && typeof window !== 'undefined' && !!window.matchMedia?.(q).matches);
  useEffect(() => {
    if (!enabled || !window.matchMedia) return;
    const m = window.matchMedia(q);
    const on = () => setTall(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [enabled]);
  return tall;
}

/** 화면이 한가해진 뒤(그리기·로그인 확인이 끝난 뒤)에 true — 영상 같은 큰 것을 그때 붙인다 */
function useIdle() {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setIdle(true), { timeout: 2500 }); return () => w.cancelIdleCallback?.(id); }
    const t = window.setTimeout(() => setIdle(true), 1200);
    return () => window.clearTimeout(t);
  }, []);
  return idle;
}

/**
 * 반복 풍경 영상 (구름·계곡). 정지 사진이 먼저 보이고, 화면에 보일 때만 재생한다. 소리는 없다.
 * 세로 화면에서는 세로로 자른 판을 써서 흐려지지 않게 한다.
 * 데이터 절약·움직임 줄이기 기기에서는 정지 사진만.
 * 영상 파일은 첫 화면(로그인)과 받기 경쟁하지 않게 화면이 한가해진 뒤에 붙이고, 그때도 preload="metadata"로 가볍게 시작한다.
 */
export function SceneVideo({ id, className, children }: { id: string; className?: string; children?: React.ReactNode }) {
  const v = videoById(id);
  const el = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(preferStill);
  const idle = useIdle();
  const tall = useTall(!!v?.portrait);
  const f = tall && v?.portrait ? v.portrait : v;
  const show = !still && idle;
  useEffect(() => {
    const node = el.current;
    if (!node || !show) return;
    const io = new IntersectionObserver(([e]) => {
      // 재생이 막히면(저전력 모드 등) 영상을 빼고 정지 사진만 남긴다
      if (e.isIntersecting) node.play().catch(() => setStill(true));
      else node.pause();
    });
    io.observe(node);
    return () => io.disconnect();
  }, [show, f]);
  if (!v || !f) return <div className={'scene ' + (className ?? '')}>{children}</div>;
  return (
    <div className={'scene ' + (className ?? '')} style={{ backgroundImage: f.lqip ? `url(${f.poster}), url(${f.lqip})` : `url(${f.poster})` }}>
      {show && (
        <video key={f.mp4} ref={el} muted loop playsInline autoPlay preload="metadata" poster={f.poster} aria-hidden="true" tabIndex={-1} disablePictureInPicture disableRemotePlayback>
          <source src={f.webm} type="video/webm" />
          <source src={f.mp4} type="video/mp4" />
        </video>
      )}
      {children}
    </div>
  );
}

/** 보라핀 그림 (정사각형). 흐린 미리보기 위로 선명한 그림이 뜬다. */
export function Art({ id, className, size = 280 }: { id: string; className?: string; size?: number }) {
  const a = artById(id);
  const [loaded, setLoaded] = useState(false);
  // 이미 기기에 저장된 그림은 onLoad가 안 올 수 있다 → 붙은 뒤 complete를 한 번 본다 (흐린 미리보기에 멈추던 문제)
  const ref = (el: HTMLImageElement | null) => { if (el && el.complete && el.naturalWidth > 0) setLoaded(true); };
  if (!a) return null;
  return (
    <div className={'art ' + (className ?? '')} style={{ backgroundImage: `url(${a.lqip})`, width: `min(100%, ${size}px)` }}>
      <img
        ref={ref}
        src={a.src.l}
        srcSet={`${a.src.s} 540w, ${a.src.l} 1080w`}
        sizes={`${size}px`}
        alt={a.alt}
        width={a.w}
        height={a.h}
        loading="lazy"
        decoding="async"
        className={loaded ? 'on' : ''}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

/** 쉬는 보라 (오류·연결 끊김·끝난 링크). 오프라인에서도 보이게 기기에 미리 저장해 둔다. */
export function RestArt() {
  return <img className="rest-art" src="/art/bora-rest.webp" alt="" aria-hidden="true" width={480} height={495} decoding="async" />;
}
