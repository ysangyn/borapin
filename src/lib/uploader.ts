import { useCallback, useState } from 'react';
import type { User } from 'firebase/auth';
import { photoUsage, uploadPhoto } from './photos';
import { FREE_DB_BYTES } from './usage';
import { isOffline } from './writes';

export type UploadRow = { name: string; pct: number; failed?: boolean };

/** 사진 파일만 (HEIC 등 확장자로도) */
export const pickImages = (files: FileList | File[] | null) =>
  [...(files ?? [])].filter((f) => f.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));

/** 올리기 전에 막을 일: 멈춤 스위치, 오프라인, 무료 저장 공간 95% */
export async function uploadBlocker(flags: { uploadsPaused?: boolean; reason?: string }): Promise<string | null> {
  if (flags.uploadsPaused) return `사진 올리기를 잠시 멈췄어요${flags.reason ? ` (${flags.reason})` : ''}`;
  if (isOffline()) return '사진은 인터넷에 연결된 뒤에 올릴 수 있어요';
  try {
    const u = await photoUsage();
    if (u.bytes >= FREE_DB_BYTES * 0.95) return '무료 저장 공간이 거의 차서 사진 올리기를 멈췄어요';
  } catch {
    /* 확인하지 못해도 올리기는 할 수 있게 */
  }
  return null;
}

/**
 * 여러 장을 차례로 올리며 진행률을 알려 준다. 결과 문구는 부르는 쪽에서 알림으로.
 * 한도가 찼으면 남은 사진은 올리지 않는다.
 */
export function useUploader() {
  const [queue, setQueue] = useState<UploadRow[]>([]);
  const run = useCallback(async (files: File[], tripId: string | null, user: User): Promise<{ ok: number; fails: string[] }> => {
    setQueue(files.map((f) => ({ name: f.name, pct: 0 })));
    let ok = 0;
    const fails: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        await uploadPhoto(files[i], tripId, user, (f) => setQueue((q) => q.map((x, j) => (j === i ? { ...x, pct: f } : x))));
        ok++;
      } catch (e) {
        console.warn(e);
        const code = (e as { code?: string }).code ?? '';
        const msg = (e as Error).message ?? '';
        setQueue((q) => q.map((x, j) => (j === i ? { ...x, failed: true } : x)));
        if (code === 'resource-exhausted') {
          fails.push('오늘 무료 사용량을 다 썼어요 (오후 4~5시쯤 다시 열려요)');
          break;
        }
        fails.push(/[가-힣]/.test(msg) ? msg : '올리지 못했어요');
      }
    }
    setQueue([]);
    return { ok, fails };
  }, []);
  return { queue, run };
}

export const uploadSummary = (ok: number, fails: string[]) =>
  !fails.length ? `사진 ${ok}장을 올렸어요` : ok ? `${ok}장 올렸고 ${fails.length}장은 못 올렸어요 · ${fails[0]}` : fails[0];
