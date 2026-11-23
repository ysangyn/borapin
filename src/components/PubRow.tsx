import { useEffect, useRef, useState } from 'react';
import { displayName, useAuth } from '../lib/auth';
import { placeKey } from '../lib/placeRef';
import { myLine, monthOf, nameNeedsRetype, pubBlock, PUB_PHOTO_MAX, summarize } from '../lib/pubShape';
import { addPubPhoto, FLAG_REASONS, flagPub, myPubNick, publishPlace, removePubPhoto, unpublish, useMute, useMyPub, usePlacePubs, usePubPhotos, usePubPhotosPaused, useSpacePubOff, type FlagReason, type PubDoc } from '../lib/pub';
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
  const off = useSpacePubOff();
  if (!user) return null;
  // 공간 관리자가 공개를 껐으면 새로 공개하지 못한다 (이미 공개된 것이 남아 있으면 거둘 수는 있다)
  const block = off ? '이 공간은 관리자가 보라핀 사람들에게 공개하기를 꺼 두었어요' : pubBlock(rec);
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
      {on && mine.hidden && <span className="tiny" style={{ color: 'var(--danger)' }} data-testid="pub-hidden">가려졌어요{mine.hiddenReason ? ` · ${mine.hiddenReason}` : ''}. 한 줄을 고치거나 사진을 지우거나 공개를 거둘 수 있어요.</span>}
      {on && <MyPubPhotos pub={mine} />}

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
            <span className="tiny muted">메모, 함께 간 사람, 여행 이름, 주소와 자리, 정확한 날짜, 우리 사진첩의 사진은 보이지 않아요. 사진은 공개한 뒤에 골라서 2장까지 올릴 수 있어요. 보는 사람은 보라핀에 공간이 있는 사람뿐이고, 인터넷 검색에는 나오지 않아요.</span>
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

/** 내 공개 평에 붙이는 사진 (2장까지). 원본과 다른 작은 사본이라 자리·찍은 시각이 없다 */
function MyPubPhotos({ pub }: { pub: PubDoc }) {
  const toast = useToast();
  const photos = usePubPhotos(pub.photos);
  const paused = usePubPhotosPaused();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const n = pub.photos?.length ?? 0;
  const add = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try { await addPubPhoto(pub, file); toast('사진을 올렸어요'); }
    catch (e) { toast(e instanceof Error && e.message.length < 60 && !/permission|insufficient/i.test(e.message) ? e.message : '사진을 올리지 못했어요'); }
    setBusy(false);
    if (input.current) input.current.value = '';
  };
  return (
    <div className="pub-photos" data-testid="pub-photos">
      <div className="pub-photo-row">
        {photos.map((p) => (
          <figure key={p.id} className="pub-photo" data-testid="pub-photo">
            <img src={p.url} alt="공개한 사진" />
            <button type="button" className="pub-photo-x" disabled={busy} aria-label="사진 지우기" data-testid="pub-photo-remove"
              onClick={async () => {
                setBusy(true);
                try { await removePubPhoto(pub, p.id); toast('사진을 지웠어요'); } catch { toast('사진을 지우지 못했어요'); }
                setBusy(false);
              }}>×</button>
          </figure>
        ))}
        {n < PUB_PHOTO_MAX && !paused && (
          <button type="button" className="pub-photo-add" disabled={busy} onClick={() => input.current?.click()} data-testid="pub-photo-add">
            <span aria-hidden="true">＋</span>{busy ? '올리는 중…' : '사진 올리기'}
          </button>
        )}
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => void add(e.target.files?.[0])} data-testid="pub-photo-input" />
      </div>
      <span className="tiny muted">
        {paused && n < PUB_PHOTO_MAX ? '지금은 공개 사진을 새로 올릴 수 없어요. ' : ''}사진은 {PUB_PHOTO_MAX}장까지. 음식·가게 사진만 올리고, 사람 얼굴이 나온 사진은 올리지 말아 주세요. 작게 줄인 사본이라 찍은 곳·시각은 들어가지 않아요.
      </span>
    </div>
  );
}

/** 남의 공개 사진: 작은 그림, 누르면 크게 */
export function PubPhotoStrip({ ids }: { ids: readonly string[] | undefined }) {
  const photos = usePubPhotos(ids);
  const [big, setBig] = useState<string | null>(null);
  useEffect(() => {
    if (!big) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setBig(null); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [big]);
  if (!photos.length) return null;
  const cur = photos.find((p) => p.id === big);
  return (
    <div className="pub-photo-row" data-testid="pub-voice-photos">
      {photos.map((p) => (
        <button key={p.id} type="button" className="pub-photo" onClick={() => setBig(p.id)} aria-label="사진 크게 보기">
          <img src={p.url} alt="가게 사진" loading="lazy" />
        </button>
      ))}
      {cur && (
        <div className="arrive-scrim pub-photo-big" role="dialog" aria-modal="true" aria-label="사진 크게 보기" onClick={() => setBig(null)} data-testid="pub-photo-big">
          <img src={cur.url} alt="가게 사진" />
          <button type="button" className="btn ghost sm" onClick={() => setBig(null)}>닫기</button>
        </div>
      )}
    </div>
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
          <PubPhotoStrip ids={r.photos} />
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
