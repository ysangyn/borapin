import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { OWNER_EMAIL } from '../lib/owner';
import { dismissFlag, FLAG_REASONS, hidePub, readPub, unhidePub, unpublish, useFlags, useMyPubs, type PubDoc } from '../lib/pub';
import { VERDICT_LABEL } from '../lib/placeRecs';
import { useToast } from './ui';

/** 설정 '보라핀 사람들에게 나눈 것': 내가 공개한 평을 한눈에 보고 거둔다 (가려진 것도 까닭과 함께) */
export function MyPubs() {
  const auth = useAuth();
  const toast = useToast();
  const uid = auth.status === 'ready' ? auth.user.uid : null;
  const list = useMyPubs(uid);
  const [busy, setBusy] = useState(false);
  if (!uid || !list) return null;
  return (
    <section data-testid="my-pubs">
      <div className="label" style={{ padding: '0 4px 6px' }}>보라핀 사람들에게 나눈 평 {list.length ? `${list.length}곳` : ''}</div>
      <div className="setting-group">
        {list.length === 0 && <div className="setting-row"><span className="small muted">아직 없어요. 다녀온 가게 화면의 '보여 줄 사람'에서 나눌 수 있어요.</span></div>}
        {list.map((r) => (
          <div key={r.id} className="setting-row" data-testid="my-pub">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="small" style={{ fontWeight: 600 }}>{r.name} <span className={`tag verdict v-${r.verdict}`}>{VERDICT_LABEL[r.verdict]}</span></div>
              <div className="tiny muted ellipsis">{r.hidden ? `가려졌어요${r.hiddenReason ? ` · ${r.hiddenReason}` : ''}` : r.line || '한 줄 없이 평가만'}</div>
            </div>
            <button className="btn sm ghost" disabled={busy} onClick={async () => {
              setBusy(true);
              try { await unpublish(r.placeKey, uid); toast('공개를 거뒀어요'); } catch { toast('공개를 거두지 못했어요'); }
              setBusy(false);
            }}>거두기</button>
          </div>
        ))}
        {list.length > 1 && (
          <button className="setting-row" disabled={busy} data-testid="my-pubs-all" onClick={async () => {
            setBusy(true);
            const r = await Promise.allSettled(list.map((p) => unpublish(p.placeKey, uid)));
            toast(r.every((x) => x.status === 'fulfilled') ? '공개를 모두 거뒀어요' : '몇 곳은 거두지 못했어요. 다시 해 주세요');
            setBusy(false);
          }}><span className="small" style={{ color: 'var(--danger)' }}>모두 거두기</span></button>
        )}
      </div>
    </section>
  );
}

/** 주인만: 신고함. 살펴보고 '가리기' 또는 '그대로 두기' (자동으로 숨기지 않는다) */
export function FlagBox() {
  const auth = useAuth();
  const toast = useToast();
  const owner = auth.status === 'ready' && (auth.user.email ?? '').toLowerCase() === OWNER_EMAIL;
  const flags = useFlags(owner);
  const [revs, setRevs] = useState<Record<string, PubDoc | null>>({});
  const ids = [...new Set((flags ?? []).map((f) => f.reviewId))];
  useEffect(() => {
    ids.filter((id) => !(id in revs)).forEach((id) => void readPub(id).then((r) => setRevs((m) => ({ ...m, [id]: r })), () => setRevs((m) => ({ ...m, [id]: null }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);
  if (!owner || !flags) return null;
  return (
    <section data-testid="flag-box">
      <div className="label" style={{ padding: '0 4px 6px' }}>신고함 {flags.length ? `${flags.length}건` : ''}</div>
      <div className="setting-group">
        {flags.length === 0 && <div className="setting-row"><span className="small muted">들어온 신고가 없어요</span></div>}
        {ids.map((id) => {
          const fs = flags.filter((f) => f.reviewId === id);
          const r = revs[id];
          return (
            <div key={id} className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }} data-testid="flag-item">
              <div className="small"><b>{r ? `${r.name} · ${r.nick}` : r === null ? '지워진 평' : '읽는 중…'}</b>{r?.hidden ? ' (가려짐)' : ''}</div>
              {r?.line && <div className="small">{r.line}</div>}
              <div className="tiny muted">{fs.map((f) => FLAG_REASONS[f.reason] + (f.note ? `: ${f.note}` : '')).join(' / ')}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {r && !r.hidden && <button className="btn sm" data-testid="flag-hide" onClick={async () => {
                  try { await hidePub(id, FLAG_REASONS[fs[0].reason]); await Promise.all(fs.map((f) => dismissFlag(f.id))); toast('평을 가렸어요'); } catch { toast('가리지 못했어요'); }
                }}>가리기</button>}
                {r?.hidden && <button className="btn sm ghost" onClick={async () => { try { await unhidePub(id); toast('가리기를 풀었어요'); } catch { toast('풀지 못했어요'); } }}>가리기 풀기</button>}
                <button className="btn sm ghost" data-testid="flag-keep" onClick={async () => {
                  try { await Promise.all(fs.map((f) => dismissFlag(f.id))); toast('그대로 두었어요'); } catch { toast('바꾸지 못했어요'); }
                }}>그대로 두기</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
