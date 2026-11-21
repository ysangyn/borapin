import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { Icon, TopBar, useToast } from '../components/ui';
import StreetMap, { type StreetPin } from '../components/StreetMap';
import { logOut, nameOf, useAuth } from '../lib/auth';
import { CIRCLE_LIMITS, mineFirst } from '../lib/circleItems';
import {
  createCircle, createCircleInvite, deleteCircle, deleteCircleInvite, forgetCircle, hangGuestPlace, hangPlace, kickFromCircle, leaveCircle,
  renameCircle, takeDown, useCircle, useCircleInvites, useMyCircles, type CircleItemDoc,
} from '../lib/circles';
import { createPlace, usePlaces } from '../lib/data';
import { inviteUrl } from '../lib/invites';
import { shareAnyhow } from '../lib/kakao';
import { withJosa } from '../lib/ko';
import { KIND_COLOR } from '../lib/placeMaps';
import { KIND_LABEL, KINDS, VERDICT_LABEL, VERDICTS } from '../lib/placeRecs';
import { SPACE_ID } from '../lib/space';
import type { PlaceKind, Verdict } from '../lib/types';

/** 지금 화면을 쓰는 사람: 공간이 있는 사람(ready) 또는 모임만 든 손님 */
function useWho(guestUser?: User | null): { user: User | null; guest: boolean; nick: string } {
  const auth = useAuth();
  if (guestUser) return { user: guestUser, guest: true, nick: guestUser.displayName?.split(' ')[0] ?? (guestUser.email ?? '').split('@')[0] };
  if (auth.status !== 'ready') return { user: null, guest: false, nick: '' };
  return { user: auth.user, guest: false, nick: nameOf(auth.user.email) };
}

/** 내 모임 목록 + 새 모임 만들기 */
export function CirclesHome({ guestUser }: { guestUser?: User | null }) {
  const { user, guest, nick } = useWho(guestUser);
  const list = useMyCircles(user?.uid);
  const toast = useToast();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  return (
    <>
      <TopBar back={!guest} backTo="/maps" title="모임" right={guest ? <button className="btn sm ghost" onClick={() => logOut()}>로그아웃</button> : undefined} />
      <div className="page" data-testid="circles">
        <p className="small muted" style={{ margin: '0 4px' }}>
          가족·친구와 고른 가게만 나눠요. 모임 사람들은 내가 건 가게와 한 줄 평만 보고, 여행 기록은 보지 못해요.
        </p>
        {list === null ? (
          <div className="skeleton-list" aria-busy="true"><i /><i /></div>
        ) : list.length ? (
          <div className="setting-group">
            {list.map((c) => (
              <Link key={c.id} to={`/circles/${c.id}`} className="setting-row" data-testid="circle-row">
                <span className="ico"><Icon name="users" size={17} /></span>
                <span style={{ flex: 1 }}><b>{c.name || '모임'}</b></span>
                <Icon name="chev" size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="card white" style={{ textAlign: 'center' }} data-testid="circles-empty">
            <span className="small muted">{guest ? '들어 있는 모임이 없어요. 초대 링크를 다시 받아 주세요.' : '아직 모임이 없어요. 처가 가족, 대학 친구처럼 모임을 만들고 초대해 보세요.'}</span>
          </div>
        )}
        {!guest && (
          <section className="card white" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <b>새 모임 만들기</b>
            <input className="input" placeholder="모임 이름 (예: 처가 가족)" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} aria-label="모임 이름" />
            <button className="btn" disabled={busy || !name.trim()} data-testid="circle-make" onClick={async () => {
              setBusy(true);
              try { const id = await createCircle(user, name, nick); toast(`${withJosa(name.trim(), '을/를')} 만들었어요`); nav(`/circles/${id}`); }
              catch (e) { toast(e instanceof Error && /까지/.test(e.message) ? e.message : '만들지 못했어요. 다시 해 주세요'); }
              setBusy(false);
            }}>{busy ? '만드는 중…' : '모임 만들기'}</button>
            <span className="tiny muted">한 사람이 {CIRCLE_LIMITS.myCircles}개 모임까지, 한 모임에 {CIRCLE_LIMITS.people}명까지예요.</span>
          </section>
        )}
        {guest && (
          <div className="card white small" style={{ color: 'var(--ink2)' }} data-testid="guest-note">
            지금은 모임만 볼 수 있어요. 내 여행 기록도 남기고 싶으면 보라핀을 소개해 준 사람에게 '내 공간' 초대를 부탁해 주세요.
          </div>
        )}
      </div>
    </>
  );
}

/** 모임 하나: 함께 만드는 지도 */
export function CirclePage({ guestUser }: { guestUser?: User | null }) {
  const { id = '' } = useParams();
  const { user, guest, nick } = useWho(guestUser);
  const { circle, members, items } = useCircle(id);
  const invites = useCircleInvites(user?.uid, id);
  const toast = useToast();
  const nav = useNavigate();
  const [picked, setPicked] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [manage, setManage] = useState(false);
  const me = members?.find((m) => m.uid === user?.uid);
  const host = me?.role === 'host';
  const nickOf = useMemo(() => Object.fromEntries((members ?? []).map((m) => [m.uid, m.nick])), [members]);
  const sorted = useMemo(() => (items && user ? mineFirst(items, user.uid) : []), [items, user]);
  const pins: StreetPin[] = useMemo(() => sorted.filter((i) => typeof i.lat === 'number' && typeof i.lng === 'number').map((i) => ({ id: i.id, name: i.name, lat: i.lat!, lng: i.lng!, color: KIND_COLOR[i.kind] })), [sorted]);
  if (!user) return null;

  if (circle === 'gone') {
    return (
      <>
        <TopBar back backTo="/circles" title="모임" />
        <div className="center-screen" data-testid="circle-gone">
          <b>이 모임을 볼 수 없어요</b>
          <span className="small muted">모임에서 나왔거나 모임이 없어졌어요.</span>
          <button className="btn line" onClick={async () => { await forgetCircle(user.uid, id).catch(() => {}); nav('/circles', { replace: true }); }}>목록에서 지우기</button>
        </div>
      </>
    );
  }
  if (!circle || !members || !items) return <><TopBar back backTo="/circles" title="모임" /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div></>;

  const canDown = (it: CircleItemDoc) => it.by.uid === user.uid || host || (!guest && !!it.spaceId && it.spaceId === SPACE_ID);
  return (
    <>
      <TopBar back backTo="/circles" title={circle.name} right={<button className="btn sm ghost" onClick={() => setManage((x) => !x)} data-testid="circle-manage">{manage ? '닫기' : '사람·설정'}</button>} />
      <div className="page" data-testid="circle-page">
        <div className="chips" data-testid="circle-people">
          {members.map((m) => <span key={m.uid} className="chip">{m.nick}{m.role === 'host' ? ' · 방장' : ''}{m.uid === user.uid ? ' (나)' : ''}</span>)}
        </div>

        {manage && <CircleManage cid={id} name={circle.name} user={user} host={host} members={members} invites={invites} onLeft={() => nav('/circles', { replace: true })} />}

        {pins.length > 0 && <StreetMap pins={pins} height={280} picked={picked} onPick={(p) => setPicked(p === picked ? null : p)} compact />}

        <button className="btn" onClick={() => setAdding(true)} data-testid="circle-add"><Icon name="plus" size={16} />{guest ? '가게 걸기' : '내 가게 걸기'}</button>

        {sorted.length === 0 ? (
          <div className="card white" style={{ textAlign: 'center' }}><span className="small muted">아직 걸린 가게가 없어요. 먼저 좋았던 곳을 걸어 보세요.</span></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="circle-items">
            {sorted.map((it) => (
              <div key={it.id} className={'card white' + (picked === it.id ? ' on' : '')} data-testid="circle-item" onClick={() => setPicked(it.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 5, background: KIND_COLOR[it.kind], flex: 'none' }} />
                  <b style={{ flex: 1, minWidth: 0 }} className="ellipsis">{it.name}</b>
                  <span className="tiny muted">{KIND_LABEL[it.kind]}{it.tag ? ` · ${it.tag}` : ''}</span>
                </div>
                <div className="small" style={{ marginTop: 4, color: 'var(--ink2)' }}>
                  <b>{nickOf[it.by.uid] ?? it.by.nick}</b>
                  {it.verdict ? <span className={'tag' + (it.verdict === 'again' ? ' violet' : '')} style={{ marginLeft: 6 }}>{VERDICT_LABEL[it.verdict]}</span> : null}
                  {it.line ? <span> · {it.line}</span> : null}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {!guest && it.by.uid !== user.uid && (
                    <button className="btn sm soft" data-testid="circle-want" onClick={async (e) => {
                      e.stopPropagation();
                      // 어느 지역인지 모르는 가게(손님이 이름만 건 것)는 담기 화면에서 지역을 고른다
                      if (!it.region) { nav(`/places/new?from=${encodeURIComponent(it.name)}&kind=${it.kind}&status=want`); return; }
                      try {
                        await createPlace({ name: it.name, kind: it.kind, ...(it.tag ? { tag: it.tag } : {}), region: it.region, reviews: {}, verdict: null, status: 'want', ...(typeof it.lat === 'number' ? { lat: it.lat, lng: it.lng } : {}), memo: `${circle.name} 모임 ${nickOf[it.by.uid] ?? it.by.nick} 추천` } as never, user);
                        toast('가고 싶은 곳에 담았어요');
                      } catch { toast('담지 못했어요. 다시 해 주세요'); }
                    }}>가고 싶은 곳에 담기</button>
                  )}
                  {canDown(it) && (
                    <button className="btn sm line" data-testid="circle-down" onClick={async (e) => {
                      e.stopPropagation();
                      if (it.by.uid !== user.uid && !window.confirm(`${nickOf[it.by.uid] ?? it.by.nick} 님이 건 가게예요. 내릴까요?`)) return;
                      try { await takeDown(id, it.id); toast('내렸어요'); } catch { toast('내리지 못했어요'); }
                    }}>내리기</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {adding && (guest
        ? <GuestHang cid={id} user={user} nick={me?.nick ?? nick} count={items.length} onClose={() => setAdding(false)} />
        : <MyPlacesHang cid={id} user={user} nick={me?.nick ?? nick} items={items} onClose={() => setAdding(false)} />)}
    </>
  );
}

/** 사람·초대·설정 (방장은 초대·내보내기·이름·없애기, 구성원은 나가기) */
function CircleManage({ cid, name, user, host, members, invites, onLeft }: { cid: string; name: string; user: User; host: boolean; members: { uid: string; nick: string; role: string }[]; invites: { code: string; expiresAt: number }[]; onLeft: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <section className="setting-group" data-testid="circle-settings">
      {host && (
        <div className="setting-row" style={{ alignItems: 'stretch', flexDirection: 'column', gap: 6 }}>
          <span className="small" style={{ color: 'var(--ink2)' }}>링크를 받은 사람이 로그인하면 이 모임에 들어와요. 보라핀을 안 쓰던 사람도 모임만 볼 수 있어요. 7일 동안, 한 번만 쓸 수 있어요.</span>
          <button className="btn sm" style={{ alignSelf: 'flex-start' }} disabled={busy} data-testid="circle-invite-make" onClick={async () => {
            setBusy(true);
            try { await createCircleInvite(user, cid, name, members.length); toast('초대 링크를 만들었어요'); } catch (e) { toast(e instanceof Error && /까지/.test(e.message) ? e.message : '만들지 못했어요'); }
            setBusy(false);
          }}><Icon name="link" size={15} />초대 링크 만들기</button>
          {invites.map((inv) => (
            <div key={inv.code} style={{ display: 'flex', gap: 6, alignItems: 'center' }} data-testid="circle-invite-row">
              <span className="tiny muted ellipsis" style={{ flex: 1, minWidth: 0 }} data-testid="invite-url">{inviteUrl(inv.code)}</span>
              <button className="btn sm soft" onClick={async () => {
                const r = await shareAnyhow({ title: `${name} 모임에 초대해요`, description: '보라핀에서 고른 가게를 함께 나눠요. 링크를 눌러 로그인하면 들어와요.', url: inviteUrl(inv.code), button: '들어가기' }, () => toast('링크를 복사했어요'));
                if (r === 'kakao') toast('카카오톡을 열었어요 · 보낼 사람을 골라 주세요');
              }}>보내기</button>
              <button className="btn sm line" aria-label="초대 링크 지우기" onClick={() => deleteCircleInvite(inv.code).then(() => toast('초대 링크를 지웠어요'), () => toast('지우지 못했어요'))}>지우기</button>
            </div>
          ))}
        </div>
      )}
      {host && members.filter((m) => m.uid !== user.uid).map((m) => (
        <div key={m.uid} className="setting-row">
          <span style={{ flex: 1 }}>{m.nick}</span>
          <button className="btn sm line" onClick={async () => {
            if (!window.confirm(`${m.nick} 님을 내보낼까요? 이 사람이 건 가게도 함께 내려가요.`)) return;
            try { await kickFromCircle(cid, m.uid); toast('내보냈어요'); } catch { toast('내보내지 못했어요'); }
          }}>내보내기</button>
        </div>
      ))}
      {host && (
        <div className="setting-row" style={{ gap: 8 }}>
          <button className="link-btn" onClick={async () => {
            const n = window.prompt('모임 이름', name);
            if (!n?.trim()) return;
            try { await renameCircle(cid, n); toast('이름을 바꿨어요'); } catch { toast('바꾸지 못했어요'); }
          }}>모임 이름 바꾸기</button>
          <button className="link-btn" style={{ color: 'var(--danger)' }} data-testid="circle-delete" onClick={async () => {
            if (!window.confirm(`'${name}' 모임을 없앨까요? 걸린 가게가 모두 내려가고 되돌릴 수 없어요. 각자의 기록은 그대로예요.`)) return;
            try { await deleteCircle(cid, user.uid); toast('모임을 없앴어요'); onLeft(); } catch { toast('없애지 못했어요'); }
          }}>모임 없애기</button>
        </div>
      )}
      {!host && (
        <div className="setting-row">
          <button className="link-btn" style={{ color: 'var(--danger)' }} data-testid="circle-leave" onClick={async () => {
            if (!window.confirm('이 모임에서 나갈까요? 내가 건 가게도 함께 내려가요.')) return;
            try { await leaveCircle(cid, user.uid); toast('모임에서 나왔어요'); onLeft(); } catch { toast('나가지 못했어요'); }
          }}>이 모임에서 나가기</button>
        </div>
      )}
    </section>
  );
}

/** 내 공간의 가게에서 골라 걸기 */
function MyPlacesHang({ cid, user, nick, items, onClose }: { cid: string; user: User; nick: string; items: CircleItemDoc[]; onClose: () => void }) {
  const { places } = usePlaces();
  const toast = useToast();
  const [q, setQ] = useState('');
  const me = nameOf(user.email);
  const hung = new Set(items.filter((i) => i.by.uid === user.uid).map((i) => i.name));
  const list = (places ?? []).filter((p) => !q.trim() || p.name.includes(q.trim())).slice(0, 60);
  return (
    <div className="arrive-scrim" onClick={onClose}>
      <div className="arrive-sheet" role="dialog" aria-modal="true" aria-label="모임에 걸 가게 고르기" onClick={(e) => e.stopPropagation()} data-testid="circle-pick">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ flex: 1 }}>걸 가게 고르기</b>
          <button className="btn sm ghost" onClick={onClose}>닫기</button>
        </div>
        <input className="input" placeholder="가게 이름 찾기" value={q} onChange={(e) => setQ(e.target.value)} aria-label="가게 이름 찾기" />
        <span className="tiny muted">이름·종류·자리·내 한 줄 평만 걸려요. 메모와 함께 간 사람은 보이지 않아요.</span>
        <div style={{ overflowY: 'auto', maxHeight: '50vh', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {places === null ? <span className="small muted">불러오는 중…</span> : list.length === 0 ? <span className="small muted">담아 둔 가게가 없어요.</span> : list.map((p) => (
            <div key={p.id} className="setting-row">
              <span style={{ flex: 1, minWidth: 0 }}><b className="ellipsis">{p.name}</b><div className="tiny muted">{KIND_LABEL[p.kind]}{p.verdict ? ` · ${VERDICT_LABEL[p.verdict]}` : ''}</div></span>
              {hung.has(p.name) ? <span className="tiny muted">걸었어요</span> : (
                <button className="btn sm" data-testid="circle-hang" onClick={async () => {
                  try { await hangPlace(cid, p, user, me, nick, items.length); toast(`${withJosa(p.name, '을/를')} 걸었어요`); } catch (e) { toast(e instanceof Error && /까지/.test(e.message) ? e.message : '걸지 못했어요'); }
                }}>걸기</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 손님: 이름만 적어 걸기 (내 공간 기록이 없다) */
function GuestHang({ cid, user, nick, count, onClose }: { cid: string; user: User; nick: string; count: number; onClose: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<PlaceKind>('food');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [line, setLine] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="arrive-scrim" onClick={onClose}>
      <div className="arrive-sheet" role="dialog" aria-modal="true" aria-label="가게 걸기" onClick={(e) => e.stopPropagation()} data-testid="circle-guest-hang">
        <b>가게 걸기</b>
        <input className="input" placeholder="가게 이름" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} aria-label="가게 이름" />
        <div className="chips">{KINDS.map((k) => <button key={k.k} type="button" className={'chip' + (kind === k.k ? ' on' : '')} aria-pressed={kind === k.k} onClick={() => setKind(k.k)}>{k.label}</button>)}</div>
        <div className="chips">{VERDICTS.map((v) => <button key={v.v} type="button" className={'chip' + (verdict === v.v ? ' on' : '')} aria-pressed={verdict === v.v} onClick={() => setVerdict(verdict === v.v ? null : v.v)}>{v.label}</button>)}</div>
        <input className="input" placeholder="한 줄 (선택)" maxLength={200} value={line} onChange={(e) => setLine(e.target.value)} aria-label="한 줄" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>그만두기</button>
          <button className="btn" style={{ flex: 1 }} disabled={busy || !name.trim()} data-testid="circle-guest-save" onClick={async () => {
            setBusy(true);
            try { await hangGuestPlace(cid, user, nick, { name, kind, verdict, line }, count); toast(`${withJosa(name.trim(), '을/를')} 걸었어요`); onClose(); } catch (e) { toast(e instanceof Error && /까지/.test(e.message) ? e.message : '걸지 못했어요'); }
            setBusy(false);
          }}>걸기</button>
        </div>
      </div>
    </div>
  );
}
