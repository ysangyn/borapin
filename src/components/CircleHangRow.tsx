import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { nameOf, useAuth } from '../lib/auth';
import { circlesHolding, hangPlace, takeDownPlace, useMyCircles } from '../lib/circles';
import { useToast } from './ui';
import type { PlaceRec } from '../lib/types';

/** 가게 화면의 '모임에 걸기': 모임 이름 칩을 누르면 걸고, 다시 누르면 내린다 */
export default function CircleHangRow({ rec }: { rec: PlaceRec }) {
  const auth = useAuth();
  const toast = useToast();
  const user = auth.status === 'ready' ? auth.user : null;
  const circles = useMyCircles(user?.uid);
  const [on, setOn] = useState<Set<string> | null>(null);
  const [busy, setBusy] = useState('');
  const ids = (circles ?? []).map((c) => c.id).join(',');
  useEffect(() => {
    if (!user || !ids) return;
    let live = true;
    circlesHolding(rec, user.uid, ids.split(',')).then((s) => { if (live) setOn(s); }, () => { if (live) setOn(new Set()); });
    return () => { live = false; };
  }, [user, ids, rec]);
  if (!user || !circles) return null;
  const me = nameOf(user.email);
  return (
    <section className="card white" data-testid="circle-hang-row" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <b className="small" style={{ flex: 1 }}>모임에 걸기</b>
        <Link to="/circles" className="tiny" style={{ fontWeight: 500 }}>{circles.length ? '모임 보기' : '모임 만들기'}</Link>
      </div>
      {circles.length === 0 ? (
        <span className="tiny muted">가족·친구 모임을 만들면 이 가게를 골라서 보여 줄 수 있어요. 메모와 함께 간 사람은 보이지 않아요.</span>
      ) : (
        <div className="chips">
          {circles.map((c) => {
            const hung = on?.has(c.id) ?? false;
            return (
              <button key={c.id} type="button" className={'chip' + (hung ? ' on' : '')} aria-pressed={hung} disabled={on === null || busy === c.id} data-testid={`hang-${c.name}`}
                onClick={async () => {
                  setBusy(c.id);
                  try {
                    if (hung) { await takeDownPlace(c.id, rec, user.uid); toast(`${c.name}에서 내렸어요`); setOn((s) => { const n = new Set(s); n.delete(c.id); return n; }); }
                    else { await hangPlace(c.id, rec, user, me, me, 0); toast(`${c.name}에 걸었어요`); setOn((s) => new Set(s).add(c.id)); }
                  } catch (e) { toast(e instanceof Error && /까지/.test(e.message) ? e.message : '바꾸지 못했어요. 다시 해 주세요'); }
                  setBusy('');
                }}>{hung ? '✓ ' : ''}{c.name}</button>
            );
          })}
        </div>
      )}
    </section>
  );
}
