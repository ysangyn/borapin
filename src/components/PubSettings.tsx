import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { OWNER_EMAIL } from '../lib/owner';
import { countSpacePubs, turnSpacePubOff, turnSpacePubOn, useSpacePubOff, dismissFlag, FLAG_REASONS, hidePub, readPub, setPubPhotosPaused, unhidePub, unpublish, useFlags, useMyPubs, usePubPhotosPaused, type PubDoc } from '../lib/pub';
import { PubPhotoStrip } from './PubRow';
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
              <div className="tiny muted ellipsis">{r.hidden ? `가려졌어요${r.hiddenReason ? ` · ${r.hiddenReason}` : ''}` : r.line || '한 줄 없이 평가만'}{r.photos?.length ? ` · 사진 ${r.photos.length}장` : ''}</div>
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

/** 공간 관리자만: 이 공간의 공개 끄기. 끄면 이 공간 사람들이 공개한 평·사진을 모두 거두고, 새로 공개하지 못한다 */
export function SpacePubSwitch() {
  const auth = useAuth();
  const toast = useToast();
  const admin = auth.status === 'ready' && auth.isAdmin;
  const off = useSpacePubOff();
  const [ask, setAsk] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  if (!admin) return null;
  return (
    <section data-testid="space-pub-switch">
      <div className="label" style={{ padding: '0 4px 6px' }}>우리 공간의 공개</div>
      <div className="setting-group">
        <div className="setting-row">
          <span className="small" style={{ flex: 1 }}>{off ? '보라핀 사람들에게 공개하기를 꺼 두었어요' : '보라핀 사람들에게 공개할 수 있어요'}
            <span className="tiny muted" style={{ display: 'block' }}>{off ? '이 공간 사람은 가게 평·사진을 새로 공개하지 못해요. 다른 사람이 공개한 평은 계속 볼 수 있어요' : '끄면 이 공간 사람 모두가 새로 공개하지 못하고, 지금까지 공개한 평·사진도 거둬요'}</span>
          </span>
          {off
            ? <button className="btn sm ghost" disabled={busy} data-testid="space-pub-on" onClick={async () => {
                setBusy(true);
                try { await turnSpacePubOn(); toast('공개를 다시 켰어요'); } catch { toast('켜지 못했어요'); }
                setBusy(false);
              }}>다시 켜기</button>
            : <button className="btn sm ghost" disabled={busy || ask !== null} data-testid="space-pub-off" onClick={async () => { setAsk(await countSpacePubs().catch(() => 0)); }}>공개 끄기</button>}
        </div>
        {ask !== null && !off && (
          <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }} role="alertdialog" aria-label="공개 끄기 확인" data-testid="space-pub-confirm">
            <span className="small">{ask > 0 ? `이 공간에서 공개한 평 ${ask}곳과 그 사진을 모두 거둬요. 다시 켜도 거둔 평은 돌아오지 않아요.` : '지금 공개한 평은 없어요. 끄면 이 공간 사람은 새로 공개하지 못해요.'}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn sm ghost" style={{ flex: 1 }} disabled={busy} onClick={() => setAsk(null)}>그만두기</button>
              <button className="btn sm" style={{ flex: 1 }} disabled={busy} data-testid="space-pub-off-go" onClick={async () => {
                setBusy(true);
                try {
                  const r = await turnSpacePubOff();
                  toast(r.failed ? `공개를 껐어요. ${r.failed}곳은 거두지 못했어요. 다시 해 주세요` : r.dropped ? `공개를 껐어요 · 평 ${r.dropped}곳을 거뒀어요` : '공개를 껐어요');
                } catch { toast('끄지 못했어요'); }
                setBusy(false); setAsk(null);
              }}>{busy ? '끄는 중…' : '공개 끄기'}</button>
            </div>
          </div>
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
  const paused = usePubPhotosPaused();
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
              <PubPhotoStrip ids={r?.photos} />
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
        {/* 저장 공간(무료 1GiB)이 차 가면 새 공개 사진만 멈춘다. 이미 올린 사진과 평 글은 그대로 */}
        <label className="setting-row" data-testid="pub-photos-pause">
          <span className="small" style={{ flex: 1 }}>공개 사진 올리기 멈추기<span className="tiny muted" style={{ display: 'block' }}>저장 공간이 모자랄 때 켜요. 이미 올린 사진은 그대로 보여요</span></span>
          <input type="checkbox" checked={paused} onChange={async (e) => {
            const on = e.target.checked;
            try { await setPubPhotosPaused(on); toast(on ? '공개 사진 올리기를 멈췄어요' : '공개 사진 올리기를 다시 열었어요'); } catch { toast('바꾸지 못했어요'); }
          }} />
        </label>
      </div>
    </section>
  );
}
