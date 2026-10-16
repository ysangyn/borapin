import { useRef, useState } from 'react';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import { deletePhoto, photoUsage, uploadPhoto } from '../lib/photos';
import { useFlags } from '../lib/admin';
import { FREE_DB_BYTES } from '../lib/usage';
import { isOffline } from '../lib/writes';
import type { Photo } from '../lib/types';
import { openSlideshow } from './slideshow';
import PhotoImg from './PhotoImg';

/** 사진 격자: 미리보기, 올리기(여러 장), 누르면 슬라이드쇼. readOnly면 보기만 (추억 사진첩) */
export default function PhotoGrid({ photos, tripId, max, readOnly }: { photos: Photo[]; tripId: string | null; max?: number; readOnly?: boolean }) {
  const auth = useAuth();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<{ name: string; pct: number; failed?: boolean }[]>([]);
  const [checking, setChecking] = useState(false);
  const flags = useFlags();

  const upload = async (files: FileList | null) => {
    if (!files?.length || auth.status !== 'ready') return;
    const list = [...files].filter((f) => f.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));
    if (!list.length) return toast('사진 파일만 올릴 수 있어요');
    setQueue(list.map((f) => ({ name: f.name, pct: 0 })));
    let ok = 0;
    const fails: string[] = [];
    for (let i = 0; i < list.length; i++) {
      try {
        await uploadPhoto(list[i], tripId, auth.user, (f) => setQueue((q) => q.map((x, j) => (j === i ? { ...x, pct: f } : x))));
        ok++;
      } catch (e) {
        console.warn(e);
        const code = (e as { code?: string }).code ?? '';
        const msg = (e as Error).message ?? '';
        setQueue((q) => q.map((x, j) => (j === i ? { ...x, failed: true } : x)));
        // 한도가 찼으면 남은 사진도 올라가지 않으니 멈춘다
        if (code === 'resource-exhausted') {
          fails.push('오늘 무료 사용량을 다 썼어요 (오후 4~5시쯤 다시 열려요)');
          break;
        }
        fails.push(/[가-힣]/.test(msg) ? msg : '올리지 못했어요');
      }
    }
    setQueue([]);
    if (input.current) input.current.value = '';
    if (!fails.length) toast(`사진 ${ok}장을 올렸어요`);
    else toast(ok ? `${ok}장 올렸고 ${fails.length}장은 못 올렸어요 · ${fails[0]}` : fails[0]);
  };

  // 올리기 전에 막을 일이 있는지 확인 (멈춤 스위치, 오프라인, 무료 저장 공간 95%)
  const pick = async () => {
    if (flags.uploadsPaused) return toast(`사진 올리기를 잠시 멈췄어요${flags.reason ? ` (${flags.reason})` : ''}`);
    if (isOffline()) return toast('사진은 인터넷에 연결된 뒤에 올릴 수 있어요');
    setChecking(true);
    try {
      const u = await photoUsage();
      if (u.bytes >= FREE_DB_BYTES * 0.95) return toast('무료 저장 공간이 거의 차서 사진 올리기를 멈췄어요');
    } catch {
      /* 확인하지 못해도 올리기는 할 수 있게 */
    } finally {
      setChecking(false);
    }
    input.current?.click();
  };

  const shown = max ? photos.slice(0, max) : photos;
  return (
    <div className="photo-grid" data-testid="photo-grid">
      {shown.map((p, i) => (
        <button
          key={p.id}
          className="photo-cell"
          onClick={() => openSlideshow(photos, i, readOnly ? {} : { onDelete: (x) => deletePhoto(x).then(() => toast('사진을 지웠어요'), () => toast('지우지 못했어요')) })}
          aria-label={`사진 ${i + 1} 크게 보기`}
        >
          <PhotoImg id={p.id} />
        </button>
      ))}
      {max && photos.length > max && <span className="photo-more">+{photos.length - max}</span>}
      {queue.map((q, i) => (
        <div key={i} className={'photo-cell uploading' + (q.failed ? ' failed' : '')} aria-label={`${q.name} ${q.failed ? '올리지 못함' : '올리는 중'}`}>
          <span>{q.failed ? '실패' : `${Math.round(q.pct * 100)}%`}</span>
        </div>
      ))}
      {!readOnly && (
        <>
          <button
            className={'photo-cell add' + (flags.uploadsPaused ? ' paused' : '')}
            onClick={pick}
            disabled={queue.length > 0 || checking}
            data-testid="photo-add"
          >
            <Icon name="plus" size={22} stroke={2.2} />
            <span className="tiny">{checking ? '확인 중' : '사진'}</span>
          </button>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} data-testid="photo-input" />
        </>
      )}
    </div>
  );
}
