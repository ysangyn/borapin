import { useEffect, useRef, useState } from 'react';
import { photoById, preferStill, videoById, type ScenePhoto } from '../lib/media';
import { artById } from '../lib/art';

/**
 * 여행지 사진: 흐린 미리보기가 먼저 깔리고, 화면 폭에 맞는 크기(640/1280)를 받는다.
 */
export function ScenicPhoto({ photo, id, className, alt, eager }: { photo?: ScenePhoto | null; id?: string; className?: string; alt?: string; eager?: boolean }) {
  const p = photo ?? (id ? photoById(id) : null);
  const [loaded, setLoaded] = useState(false);
  if (!p) return null;
  return (
    <div className={'scenic ' + (className ?? '')} style={{ backgroundImage: `url(${p.lqip})` }}>
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

/**
 * 반복 풍경 영상 (구름·계곡). 정지 사진이 먼저 보이고, 화면에 보일 때만 재생한다. 소리는 없다.
 * 세로 화면에서는 세로로 자른 판을 써서 흐려지지 않게 한다.
 * 데이터 절약·움직임 줄이기 기기에서는 정지 사진만.
 */
export function SceneVideo({ id, className, children }: { id: string; className?: string; children?: React.ReactNode }) {
  const v = videoById(id);
  const el = useRef<HTMLVideoElement>(null);
  const [still] = useState(preferStill);
  const tall = useTall(!!v?.portrait);
  const f = tall && v?.portrait ? v.portrait : v;
  useEffect(() => {
    const node = el.current;
    if (!node || still) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) node.play().catch(() => undefined);
      else node.pause();
    });
    io.observe(node);
    return () => io.disconnect();
  }, [still, f]);
  if (!v || !f) return <div className={'scene ' + (className ?? '')}>{children}</div>;
  return (
    <div className={'scene ' + (className ?? '')} style={{ backgroundImage: `url(${f.poster}), url(${f.lqip})` }}>
      {!still && (
        <video key={f.mp4} ref={el} muted loop playsInline autoPlay preload="auto" poster={f.poster} aria-hidden="true" tabIndex={-1} disablePictureInPicture disableRemotePlayback>
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
  if (!a) return null;
  return (
    <div className={'art ' + (className ?? '')} style={{ backgroundImage: `url(${a.lqip})`, width: `min(100%, ${size}px)` }}>
      <img
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
