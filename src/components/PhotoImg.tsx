import { useEffect, useRef, useState } from 'react';
import { BLANK, peekPhotoUrl, photoUrl, type PhotoSize } from '../lib/photoData';

/**
 * Firestore에 담긴 사진을 보여 주는 <img>.
 * 화면 가까이 올 때 받고, 크게 보기(l)는 받는 동안 미리보기(t)를 먼저 깐다.
 */
export default function PhotoImg({ id, size = 't', alt = '' }: { id: string; size?: PhotoSize; alt?: string }) {
  const el = useRef<HTMLImageElement>(null);
  const [got, setGot] = useState<{ id: string; t?: string; l?: string; failed?: boolean }>({ id });
  const cur = got.id === id ? got : { id };
  const t = cur.t ?? peekPhotoUrl(id, 't');
  const l = size === 'l' ? cur.l ?? peekPhotoUrl(id, 'l') : undefined;
  const src = (size === 'l' ? l ?? t : t) ?? BLANK;
  const done = size === 'l' ? Boolean(l) : Boolean(t);

  useEffect(() => {
    if (done) return;
    let alive = true;
    const go = () => {
      const want: PhotoSize[] = size === 'l' ? (t ? ['l'] : ['t', 'l']) : ['t'];
      for (const s of want) {
        photoUrl(id, s).then(
          (u) => alive && setGot((g) => ({ ...(g.id === id ? g : { id }), [s]: u })),
          () => alive && setGot((g) => ({ ...(g.id === id ? g : { id }), failed: true })),
        );
      }
    };
    const node = el.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      go();
      return () => {
        alive = false;
      };
    }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        io.disconnect();
        go();
      }
    }, { rootMargin: '300px' });
    io.observe(node);
    return () => {
      alive = false;
      io.disconnect();
    };
    // t는 미리보기가 생겼을 때 다시 돌지 않게 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, size, done]);

  return (
    <img
      ref={el}
      src={src}
      alt={alt}
      decoding="async"
      className={'ph-img' + (src !== BLANK ? ' on' : '') + (cur.failed && src === BLANK ? ' failed' : '')}
      data-loaded={done ? '1' : undefined}
      data-photo={id}
    />
  );
}
