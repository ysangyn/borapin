import { useRef, useState } from 'react';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import { deletePhoto, uploadPhoto } from '../lib/photos';
import { useFlags } from '../lib/admin';
import type { Photo } from '../lib/types';
import { openSlideshow } from './slideshow';

/** 사진 격자: 미리보기, 올리기(여러 장), 누르면 슬라이드쇼 */
export default function PhotoGrid({ photos, tripId, max }: { photos: Photo[]; tripId: string | null; max?: number }) {
  const auth = useAuth();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<{ name: string; pct: number }[]>([]);
  const flags = useFlags();

  const upload = async (files: FileList | null) => {
    if (!files?.length || auth.status !== 'ready') return;
    const list = [...files].filter((f) => f.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));
    setQueue(list.map((f) => ({ name: f.name, pct: 0 })));
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      try {
        await uploadPhoto(list[i], tripId, auth.user, (f) => setQueue((q) => q.map((x, j) => (j === i ? { ...x, pct: f } : x))));
        ok++;
      } catch (e) {
        console.warn(e);
        const msg = (e as Error).message ?? '';
        toast(/storage\/|bucket|404/i.test(msg) ? '사진 저장소가 아직 켜지지 않았어요' : msg || '사진을 올리지 못했어요');
        break;
      }
    }
    setQueue([]);
    if (input.current) input.current.value = '';
    if (ok) toast(`사진 ${ok}장을 올렸어요`);
  };

  const shown = max ? photos.slice(0, max) : photos;
  return (
    <div className="photo-grid" data-testid="photo-grid">
      {shown.map((p, i) => (
        <button key={p.id} className="photo-cell" onClick={() => openSlideshow(photos, i, { onDelete: (x) => deletePhoto(x).then(() => toast('사진을 지웠어요')) })} aria-label={`사진 ${i + 1} 크게 보기`}>
          <img src={p.thumb} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
      {queue.map((q) => (
        <div key={q.name} className="photo-cell uploading" aria-label={`${q.name} 올리는 중`}>
          <span>{Math.round(q.pct * 100)}%</span>
        </div>
      ))}
      <button
        className="photo-cell add"
        onClick={() => (flags.uploadsPaused ? toast(`사진 올리기를 잠시 멈췄어요${flags.reason ? ` (${flags.reason})` : ''}`) : input.current?.click())}
        disabled={queue.length > 0}
        data-testid="photo-add"
        aria-disabled={flags.uploadsPaused}
      >
        <Icon name="plus" size={22} stroke={2.2} />
        <span className="tiny">사진</span>
      </button>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} data-testid="photo-input" />
    </div>
  );
}
