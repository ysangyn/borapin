import { useState } from 'react';
import { displayName, useAuth } from '../lib/auth';
import { placeKey } from '../lib/placeRef';
import { myLine, monthOf, nameNeedsRetype, pubBlock, summarize } from '../lib/pubShape';
import { FLAG_REASONS, flagPub, myPubNick, publishPlace, unpublish, useMute, useMyPub, usePlacePubs, type FlagReason } from '../lib/pub';
import { VERDICT_LABEL } from '../lib/placeRecs';
import { useToast } from './ui';
import type { PlaceRec, Trip } from '../lib/types';

/**
 * 가게 화면 '보여 줄 사람: 우리만 · 보라핀 사람들에게' (6걸음).
 * 공개하면 보라핀 사람(어느 공간이든 지금 구성원)이 이 가게 화면에서 내 별명·평가·한 줄·달을 본다. 메모·함께 간 사람·자리·주소는 안 보인다.
 */
export function PubRow({ rec, trip }: { rec: PlaceRec; trip: Trip | null }) {
  const auth = useAuth();
  const toast = useToast();
  const user = auth.status === 'ready' ? auth.user : null;
  const me = user ? displayName(user) : '';
  const key = placeKey(rec);
  const mine = useMyPub(key, user?.uid);
  const [ask, setAsk] = useState<{ nick: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const block = pubBlock(rec);
  const on = !!mine;
  const retype = nameNeedsRetype(rec);
  const open = async () => setAsk({ nick: await myPubNick(user.uid, me), name: retype ? '' : rec.name });
  const line = myLine(rec, me, user.uid);
  return (
    <section className="card white pub-row" data-testid="pub-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <b className="small" style={{ flex: 1 }}>보여 줄 사람</b>
        <div className="seg" role="radiogroup" aria-label="보여 줄 사람">
          <button role="radio" aria-checked={!on} className={!on ? 'on' : ''} disabled={busy || mine === undefined} data-testid="pub-off"
            onClick={async () => {
              if (!on || !key) return;
              setBusy(true);
              try { await unpublish(key, user.uid); toast('공개를 거뒀어요'); } catch { toast('공개를 거두지 못했어요'); }
              setBusy(false);
            }}>우리만</button>
          <button role="radio" aria-checked={on} className={on ? 'on' : ''} disabled={busy || mine === undefined || (!!block && !on)} data-testid="pub-on"
            onClick={() => { if (!on) void open(); }}>보라핀 사람들에게</button>
        </div>
      </div>
      {block && !on && <span className="tiny muted" data-testid="pub-block">{block}</span>}
      {on && !mine.hidden && <span className="tiny muted">보라핀 사람들이 {mine.nick} 이름으로 이 평을 봐요 · {mine.month.replace('-', '년 ')}월</span>}
      {on && mine.hidden && <span className="tiny" style={{ color: 'var(--danger)' }} data-testid="pub-hidden">가려졌어요{mine.hiddenReason ? ` · ${mine.hiddenReason}` : ''}. 한 줄을 고치거나 공개를 거둘 수 있어요.</span>}

      {ask && (
        <div className="arrive-scrim" onClick={() => setAsk(null)}>
          <div className="arrive-sheet" role="dialog" aria-modal="true" aria-label="보라핀 사람들에게 공개" onClick={(e) => e.stopPropagation()} data-testid="pub-confirm">
            <b className="jua" style={{ fontSize: 19 }}>보라핀 사람들에게 이렇게 보여요</b>
            <div className="pub-preview">
              <div><b>{ask.nick || '별명'}</b> <span className="tiny muted">{monthOf(rec, trip?.when).replace('-', '년 ')}월</span></div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="small" style={{ fontWeight: 600 }}>{ask.name || '가게 이름'}</span>
                {rec.verdict && <span className={`tag verdict v-${rec.verdict}`}>{VERDICT_LABEL[rec.verdict]}</span>}
              </div>
              {line ? <span className="small">{line}</span> : <span className="tiny muted">한 줄 평 없이 평가만 보여요</span>}
            </div>
            <span className="tiny muted">메모, 함께 간 사람, 여행 이름, 주소와 자리, 정확한 날짜는 보이지 않아요. 보는 사람은 보라핀에 공간이 있는 사람뿐이고, 인터넷 검색에는 나오지 않아요.</span>
            <label className="small" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              가게 이름
              <input className="input" value={ask.name} maxLength={80} onChange={(e) => setAsk({ ...ask, name: e.target.value })} placeholder="간판에 적힌 이름" data-testid="pub-name" />
              {retype && <span className="tiny muted">카카오 목록에서 고른 이름은 공개할 수 없어서, 간판 이름을 직접 적어 주세요.</span>}
            </label>
            <label className="small" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              보일 별명
              <input className="input" value={ask.nick} maxLength={10} onChange={(e) => setAsk({ ...ask, nick: e.target.value })} data-testid="pub-nick" />
            </label>
            <span className="tiny muted">한 줄에 다른 사람 이름이나 얼굴이 드러나는 말은 쓰지 말아 주세요.</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setAsk(null)}>그만두기</button>
              <button className="btn" style={{ flex: 1 }} disabled={busy || !ask.name.trim() || !ask.nick.trim()} data-testid="pub-confirm-go"
                onClick={async () => {
                  setBusy(true);
                  try { await publishPlace(rec, user, me, { nick: ask.nick, name: ask.name, when: trip?.when }); toast('공개했어요'); setAsk(null); }
                  catch (e) { toast(e instanceof Error && e.message.length < 60 && !/permission/i.test(e.message) ? e.message : '공개하지 못했어요'); }
                  setBusy(false);
                }}>공개하기</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** 가게 화면 '보라핀 사람들': 같은 가게를 공개한 다른 사람들의 평 */
export function PubVoices({ rec }: { rec: PlaceRec }) {
  const auth = useAuth();
  const toast = useToast();
  const user = auth.status === 'ready' ? auth.user : null;
  const key = placeKey(rec);
  const list = usePlacePubs(key);
  const [mute, addMute] = useMute();
  const [flagging, setFlagging] = useState<string | null>(null);
  if (!user || !key || !list) return null;
  const others = list.filter((r) => r.uid !== user.uid && !mute.uids.has(r.uid) && !mute.reviews.has(r.id));
  if (!others.length) return null;
  const sum = summarize(others, new Set());
  return (
    <section className="pv-reviews" data-testid="pub-voices">
      <h2 className="h2">보라핀 사람들</h2>
      <span className="tiny muted">{[sum.again ? `또 갈래요 ${sum.again}명` : '', sum.once ? `한 번이면 충분 ${sum.once}명` : ''].filter(Boolean).join(' · ')}</span>
      {others.map((r) => (
        <div key={r.id} className="pub-voice" data-testid="pub-voice">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <b className="small">{r.nick}</b>
            <span className={`tag verdict v-${r.verdict}`}>{VERDICT_LABEL[r.verdict]}</span>
            <span className="tiny muted" style={{ flex: 1 }}>{r.month.replace('-', '년 ')}월</span>
            <button className="link-btn tiny" onClick={() => setFlagging(flagging === r.id ? null : r.id)} aria-expanded={flagging === r.id} data-testid="pub-flag">신고</button>
          </div>
          {r.line && <span className="small">{r.line}</span>}
          {flagging === r.id && (
            <div className="chips" style={{ gap: 6 }} data-testid="pub-flag-reasons">
              {(Object.keys(FLAG_REASONS) as FlagReason[]).map((k) => (
                <button key={k} className="chip" onClick={async () => {
                  try { await flagPub(r.id, user.uid, k, ''); } catch { /* 이미 신고했으면 그대로 */ }
                  addMute('reviews', r.id); setFlagging(null); toast('신고했어요. 이 폰에서는 안 보여요');
                }}>{FLAG_REASONS[k]}</button>
              ))}
              <button className="chip" onClick={() => { addMute('uids', r.uid); setFlagging(null); toast(`${r.nick} 님 평은 이 폰에서 안 보여요`); }} data-testid="pub-mute">이 사람 평 안 보기</button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
