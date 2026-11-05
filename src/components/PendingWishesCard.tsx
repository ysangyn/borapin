import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui';
import { useAuth, displayName } from '../lib/auth';
import { addWishItems, createWish, useWishes } from '../lib/data';
import { isMemberName } from '../lib/members';
import { wishBatch } from '../lib/wishes';
import { placeLong } from '../lib/geo';
import { loadPending, savePending, type PendingMap } from '../lib/pendingWishes';

/**
 * 홈: 받은 지도에서 ♡해 둔 곳(이 폰에 적힌 것)을 그 지역 '가고 싶은 곳'으로 한꺼번에 옮긴다.
 * 이미 담긴 이름은 건너뛰고, 그 지역 가고 싶은 곳이 없으면 새로 만든다.
 */
export default function PendingWishesCard() {
  const auth = useAuth();
  const { wishes } = useWishes();
  const toast = useToast();
  const nav = useNavigate();
  const [list, setList] = useState<PendingMap[]>(loadPending);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const on = () => setList(loadPending());
    window.addEventListener('borapin:pending', on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener('borapin:pending', on); window.removeEventListener('storage', on); };
  }, []);
  if (!list.length || auth.status !== 'ready' || !wishes) return null;
  const m = list[0];

  const take = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const plan = wishBatch(wishes, m.region, m.items);
      const n = plan.foods.length + plan.spots.length;
      let id = plan.id;
      if (id) { if (n) await addWishItems(id, { foods: plan.foods, spots: plan.spots }); }
      else {
        const me = displayName(auth.user);
        id = await createWish({ place: m.region, wantedBy: isMemberName(me) ? [me] : [], priority: null, spots: plan.spots, todos: [], foods: plan.foods, links: [], note: `${m.by}의 ‘${m.title}’에서`.slice(0, 200), source: 'app' }, auth.user);
      }
      const rest = list.slice(1);
      savePending(rest);
      setList(rest);
      const more = [plan.skipped ? `이미 있던 ${plan.skipped}곳은 건너뛰었어요` : '', plan.over ? `${plan.over}곳은 칸이 가득 차 못 담았어요` : ''].filter(Boolean).join(' · ');
      toast(n ? `${placeLong(m.region)} 가고 싶은 곳에 ${n}곳 담았어요${more ? ` (${more})` : ''}` : `이미 다 담겨 있어요`, { label: '보기', onClick: () => nav(`/wishes/${id}`) });
    } catch {
      toast('담지 못했어요. 다시 해 주세요');
    } finally { setBusy(false); }
  };
  const drop = () => { const rest = list.slice(1); savePending(rest); setList(rest); };

  return (
    <div className="card white pending-wishes" data-testid="pending-wishes">
      <span className="tiny muted">받은 지도에서 ♡한 곳</span>
      <b className="jua" style={{ fontSize: 18, lineHeight: 1.3 }}>{m.by}의 ‘{m.title}’ {m.items.length}곳</b>
      <span className="small muted ellipsis">{m.items.slice(0, 4).map((x) => x.name).join(' · ')}{m.items.length > 4 ? ` 외 ${m.items.length - 4}곳` : ''}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn sm" disabled={busy} onClick={() => void take()} data-testid="pending-take">{busy ? '담는 중…' : `${placeLong(m.region)} 가고 싶은 곳에 담기`}</button>
        <button type="button" className="btn sm line" disabled={busy} onClick={drop}>지우기</button>
      </div>
    </div>
  );
}
