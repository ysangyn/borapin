import { useEffect, useRef, useState } from 'react';
import { photoById, preferStill, videoById, type ScenePhoto } from '../lib/media';

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

/**
 * 반복 풍경 영상 (구름·계곡). 정지 사진이 먼저 보이고, 화면에 보일 때만 재생한다.
 * 데이터 절약·움직임 줄이기 기기에서는 정지 사진만.
 */
export function SceneVideo({ id, className, children }: { id: string; className?: string; children?: React.ReactNode }) {
  const v = videoById(id);
  const el = useRef<HTMLVideoElement>(null);
  const [still] = useState(preferStill);
  useEffect(() => {
    const node = el.current;
    if (!node || still) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) node.play().catch(() => undefined);
      else node.pause();
    });
    io.observe(node);
    return () => io.disconnect();
  }, [still]);
  if (!v) return <div className={'scene ' + (className ?? '')}>{children}</div>;
  return (
    <div className={'scene ' + (className ?? '')} style={{ backgroundImage: `url(${v.poster}), url(${v.lqip})` }}>
      {!still && (
        <video ref={el} muted loop playsInline autoPlay preload="auto" poster={v.poster} aria-hidden="true" tabIndex={-1}>
          <source src={v.webm} type="video/webm" />
          <source src={v.mp4} type="video/mp4" />
        </video>
      )}
      {children}
    </div>
  );
}
