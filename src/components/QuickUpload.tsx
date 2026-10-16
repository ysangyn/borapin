import { useMemo, useRef, useState } from 'react';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import { useFlags } from '../lib/admin';
import { recentlyAdded, upcomingTrips } from '../lib/stats';
import { pickImages, uploadBlocker, uploadSummary, useUploader } from '../lib/uploader';
import { formatWhen } from '../lib/dates';
import type { Trip } from '../lib/types';

/** 피드 맨 위: 여행을 고르고 사진을 바로 올린다 (기본은 가장 최근 여행) */
export default function QuickUpload({ trips }: { trips: Trip[] }) {
  const auth = useAuth();
  const toast = useToast();
  const flags = useFlags();
  const input = useRef<HTMLInputElement>(null);
  const { queue, run } = useUploader();
  const options = useMemo(() => {
    const recent = recentlyAdded(trips, 8);
    const planned = upcomingTrips(trips).slice(0, 3);
    const seen = new Set<string>();
    return [...recent, ...planned].filter((t) => !seen.has(t.id) && seen.add(t.id));
  }, [trips]);
  const [tripId, setTripId] = useState<string>('');
  const chosen = tripId || options[0]?.id || '';
  if (!options.length) return null;

  const onFiles = async (files: FileList | null) => {
    if (auth.status !== 'ready' || !chosen) return;
    const list = pickImages(files);
    if (!list.length) return toast('사진 파일만 올릴 수 있어요');
    const block = await uploadBlocker(flags);
    if (block) return toast(block);
    const r = await run(list, chosen, auth.user);
    if (input.current) input.current.value = '';
    toast(uploadSummary(r.ok, r.fails));
  };
  const busy = queue.length > 0;
  const doneCount = queue.filter((q) => q.pct >= 1).length;

  return (
    <div className="quick-upload" data-testid="quick-upload">
      <select className="select quick-upload-trip" aria-label="사진을 올릴 여행" value={chosen} onChange={(e) => setTripId(e.target.value)} disabled={busy}>
        {options.map((t) => <option key={t.id} value={t.id}>{t.title} · {formatWhen(t.when)}</option>)}
      </select>
      <button className="btn sm" onClick={() => input.current?.click()} disabled={busy} data-testid="quick-upload-btn">
        <Icon name="image" size={16} stroke={2.2} />{busy ? `올리는 중 ${doneCount}/${queue.length}` : '사진 올리기'}
      </button>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} data-testid="quick-upload-input" />
    </div>
  );
}
