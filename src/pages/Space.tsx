import { withRo } from '../lib/ko';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatars, Icon, TopBar, useToast } from '../components/ui';
import { logOut, nameOf, useAuth } from '../lib/auth';
import { addMember as addMemberDoc, computeStats, readAll, setAccessList, setMemberName, setMemberRelation, usePlaces, useTrips, useWishes } from '../lib/data';
import { exportXlsx, saveBlob } from '../lib/exportXlsx';
import { sendReport } from '../lib/admin';
import { useSeasons } from '../lib/seasons';
import { loadTravelInfo } from '../lib/travelinfo';
import { OWNER_EMAIL } from '../lib/firebase';
import { isOffline } from '../lib/writes';
import { localDate } from '../lib/dates';
import type { Photo } from '../lib/types';
import { RELATION_ICON, RELATION_LABEL, spaceRelation, spaceTitle } from '../lib/members';
import type { Relation } from '../lib/types';
import { createInvite, deleteInvite, inviteUrl, useOpenInvites } from '../lib/invites';
import { shareAnyhow } from '../lib/kakao';
import HomeSetting from '../components/HomeSetting';

export default function Space() {
  const auth = useAuth();
  const toast = useToast();
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const { places: recs } = usePlaces();
  const seasons = useSeasons();
  const [busy, setBusy] = useState<'xlsx' | 'json' | null>(null);
  const [email, setEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteRel, setInviteRel] = useState<Relation | ''>('');
  const [madeCode, setMadeCode] = useState<string | null>(null);
  const invites = useOpenInvites(auth.status === 'ready' && auth.isAdmin);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  // '우리 집을 정하면…'에서 오면 그 칸으로
  useEffect(() => { if (location.hash === '#home') setTimeout(() => document.getElementById('home')?.scrollIntoView({ block: 'center' }), 300); }, []);

  if (auth.status !== 'ready') return null;
  const { user, access, isAdmin } = auth;

  const addMember = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return toast('메일 주소를 확인해 주세요');
    if (access.allowed.includes(e)) return toast('이미 함께 쓰고 있는 계정이에요');
    const n = newName.trim();
    setEmail('');
    setNewName('');
    try {
      await addMemberDoc(e, n);
      toast(`${n || e} 님이 들어올 수 있어요`);
    } catch (err) {
      console.warn(err);
      setEmail(e);
      setNewName(n);
      toast('추가하지 못했어요. 잠시 뒤 다시 해 주세요.');
    }
  };

  const removeMember = async (e: string) => {
    setRemoving(null);
    try {
      await setAccessList('allowed', e, false);
      toast(`${e} 계정을 뺐어요`, { label: '되돌리기', onClick: () => void setAccessList('allowed', e, true) });
    } catch {
      toast('빼지 못했어요. 다시 해 주세요');
    }
  };

  const exportExcel = async () => {
    if (!trips || busy) return;
    if (isOffline()) return toast('인터넷에 연결된 뒤에 내려받을 수 있어요');
    setBusy('xlsx');
    try {
      const [info, photos] = await Promise.all([loadTravelInfo(), readAll('photos') as Promise<Photo[]>]);
      const blob = await exportXlsx({ trips, recs: recs ?? [], wishes: wishes ?? [], photos, info, seasons });
      saveBlob(blob, `보라핀_${localDate()}.xlsx`);
      toast('엑셀 파일을 내려받았어요');
    } catch (e) {
      console.warn(e);
      toast('엑셀을 만들지 못했어요');
    } finally {
      setBusy(null);
    }
  };

  // 사진 파일을 뺀 모든 기록 (여행·가고 싶은 곳·장소·사진 정보·일정·글)
  const exportBackup = async () => {
    if (busy) return;
    if (isOffline()) return toast('인터넷에 연결된 뒤에 내려받을 수 있어요');
    setBusy('json');
    try {
      const [photos, plans, notes] = await Promise.all([readAll('photos'), readAll('plans'), readAll('notes')]);
      const data = { app: 'borapin', v: 2, exported: new Date().toISOString(), trips, wishes, places: recs, photos, plans, notes };
      saveBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `보라핀_백업_${localDate()}.json`);
      toast('백업 파일을 내려받았어요');
    } catch (e) {
      console.warn(e);
      toast('백업을 만들지 못했어요');
    } finally {
      setBusy(null);
    }
  };

  const report = async () => {
    const t = window.prompt('어떤 문제가 있었나요? (화면, 하려던 일)');
    if (!t?.trim()) return;
    try {
      await sendReport('report', t.trim());
      toast('보내 주셔서 고마워요');
    } catch {
      toast('보내지 못했어요. 연결을 확인해 주세요');
    }
  };

  return (
    <div style={{ background: 'var(--page)', minHeight: '100%' }}>
      <TopBar back title={<span style={{ fontWeight: 800, fontSize: 18 }}>우리 공간</span>} />
      <div className="page" style={{ paddingTop: 0, gap: 14 }}>
        <div className="setting-group" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <Avatars size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }} data-testid="space-title">{spaceTitle()}{spaceRelation() && <span className="tag coral" data-testid="space-relation">{RELATION_ICON[spaceRelation()!]} {RELATION_LABEL[spaceRelation()!]}</span>}</div>
            <div className="small muted">{stats ? `함께 다닌 여행 ${stats.tripsDone}번 · 핀 ${stats.pins}개` : '기록을 불러오는 중…'}</div>
            <div className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{withRo(nameOf(user.email))} 들어와 있어요 · {user.email}</div>
            <div className="tiny" style={{ color: 'var(--violet)', marginTop: 2 }}>각자 계정으로 들어와도 같은 기록을 함께 봐요</div>
          </div>
        </div>

        <section>
          <div className="label" style={{ padding: '0 4px 6px' }}>함께 쓰는 사람</div>
          <div className="setting-group">
            {access.allowed.map((e) => (
              <div key={e} className="setting-row">
                <span className="ico"><Icon name="users" size={17} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{nameOf(e)}</b>{e === OWNER_EMAIL ? <span className="tag violet" style={{ marginLeft: 6 }}>관리자</span> : null}
                  {e !== OWNER_EMAIL && (isAdmin ? (
                    <select className="rel-select" aria-label={`${nameOf(e)}와의 관계`} value={access.relations?.[e] ?? ''} onChange={(ev) => setMemberRelation(e, (ev.target.value || null) as Relation | null).then(() => toast('관계를 적어 두었어요'), () => toast('바꾸지 못했어요'))} data-testid="rel-select">
                      <option value="">관계 고르기</option>
                      {(Object.keys(RELATION_LABEL) as Relation[]).map((r) => <option key={r} value={r}>{RELATION_ICON[r]} {RELATION_LABEL[r]}</option>)}
                    </select>
                  ) : access.relations?.[e] ? <span className="tag" style={{ marginLeft: 6 }}>{RELATION_ICON[access.relations[e]]} {RELATION_LABEL[access.relations[e]]}</span> : null)}
                  {isAdmin && (
                    <button className="link-btn" style={{ marginLeft: 8, display: 'inline' }} aria-label={`${e} 부를 이름 바꾸기`} onClick={async () => {
                      const n = window.prompt('앱에서 부를 이름 (예: 보라)', nameOf(e));
                      if (n === null) return;
                      try {
                        await setMemberName(e, n);
                        toast('이름을 바꿨어요');
                      } catch {
                        toast('바꾸지 못했어요. 다시 해 주세요');
                      }
                    }}>이름 바꾸기</button>
                  )}
                  <div className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{e}</div>
                </span>
                {isAdmin && e !== OWNER_EMAIL && (
                  removing === e ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <button className="btn sm ghost" onClick={() => setRemoving(null)}>두기</button>
                      <button className="btn sm" style={{ background: 'var(--danger)' }} onClick={() => removeMember(e)}>빼기</button>
                    </span>
                  ) : (
                    <button className="btn sm line" onClick={() => setRemoving(e)} aria-label={`${e} 빼기`}>빼기</button>
                  )
                )}
              </div>
            ))}
            {isAdmin && (
              <div className="setting-row">
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <input className="input" style={{ height: 42 }} type="email" inputMode="email" placeholder="함께 쓸 사람의 메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addMember(); }} aria-label="추가할 계정" />
                  <input className="input" style={{ height: 42 }} placeholder="앱에서 부를 이름 (예: 보라)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addMember(); }} aria-label="부를 이름" maxLength={20} />
                </span>
                <button className="btn sm" onClick={addMember}>추가</button>
              </div>
            )}
          </div>
          {isAdmin && <div className="tiny muted" style={{ padding: '6px 4px 0' }}>추가한 메일로 구글 로그인이나 이메일 로그인을 하면 들어올 수 있어요.</div>}
        </section>

        {isAdmin && (
          <section data-testid="invite-section">
            <div className="label" style={{ padding: '0 4px 6px' }}>초대 링크</div>
            <div className="setting-group">
              <div className="setting-row" style={{ alignItems: 'stretch' }}>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <span className="small" style={{ color: 'var(--ink2)' }}>메일 주소를 몰라도 돼요. 링크를 받은 사람이 로그인하면 바로 들어와요. 7일 동안, 한 번만 쓸 수 있어요.</span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <input className="input" style={{ height: 42, flex: 1, minWidth: 0 }} placeholder="부를 이름 (선택, 예: 어머니)" value={inviteName} onChange={(e) => setInviteName(e.target.value)} aria-label="초대 이름" maxLength={20} />
                    <select className="select" style={{ height: 42, width: 'auto' }} aria-label="초대할 사람과의 관계" value={inviteRel} onChange={(e) => setInviteRel(e.target.value as Relation | '')}>
                      <option value="">관계</option>
                      {(Object.keys(RELATION_LABEL) as Relation[]).map((r) => <option key={r} value={r}>{RELATION_LABEL[r]}</option>)}
                    </select>
                  </span>
                  <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={async () => {
                    try { const code = await createInvite(user, inviteName, inviteRel || null); setMadeCode(code); setInviteName(''); setInviteRel(''); toast('초대 링크를 만들었어요'); } catch (e) { console.warn(e); toast('만들지 못했어요. 다시 해 주세요'); }
                  }} data-testid="invite-make"><Icon name="link" size={15} />초대 링크 만들기</button>
                </span>
              </div>
              {(invites ?? []).map((inv) => (
                <div key={inv.code} className={'setting-row' + (inv.code === madeCode ? ' invite-new' : '')} data-testid="invite-row">
                  <span className="ico"><Icon name="link" size={17} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b>{inv.name ? `${inv.name} 초대` : '초대 링크'}{inv.relation ? <span className="tag" style={{ marginLeft: 6 }}>{RELATION_LABEL[inv.relation]}</span> : null}</b>
                    <div className="tiny muted ellipsis" data-testid="invite-url">{inviteUrl(inv.code)}</div>
                    <div className="tiny muted">{Math.max(1, Math.ceil((inv.expiresAt - Date.now()) / 86400000))}일 남음 · 한 번 쓰면 사라져요</div>
                  </span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button className="btn sm soft" onClick={async () => {
                      const r = await shareAnyhow({ title: '보라핀에 초대해요', description: `${nameOf(user.email)}이(가) 함께 여행 기록을 남기자고 초대했어요. 링크를 눌러 로그인하면 들어와요.`, url: inviteUrl(inv.code), button: '들어가기' }, () => toast('링크를 복사했어요'));
                      if (r === 'kakao') toast('카카오톡을 열었어요 · 보낼 사람을 골라 주세요');
                    }} data-testid="invite-share">보내기</button>
                    <button className="btn sm line" onClick={() => deleteInvite(inv.code).then(() => toast('초대 링크를 지웠어요'), () => toast('지우지 못했어요'))} aria-label="초대 링크 지우기">지우기</button>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <HomeSetting />

        <section>
          <div className="label" style={{ padding: '0 4px 6px' }}>백업</div>
          <div className="setting-group">
            <button className="setting-row" onClick={exportExcel} disabled={!!busy} data-testid="xlsx">
              <span className="ico"><Icon name="download" size={17} /></span>
              <span style={{ flex: 1 }}>{busy === 'xlsx' ? '엑셀 만드는 중…' : '엑셀로 내려받기'}<div className="tiny muted">여행 · 우리 장소 · 가고 싶은 곳 · 여행정보 (시트 4개)</div></span>
              <Icon name="chev" size={16} />
            </button>
            <button className="setting-row" onClick={exportBackup} disabled={!!busy} data-testid="backup">
              <span className="ico"><Icon name="download" size={17} /></span>
              <span style={{ flex: 1 }}>{busy === 'json' ? '백업 만드는 중…' : '백업 파일 내려받기'}<div className="tiny muted">모든 기록·일정·글 (사진 파일은 빼고) · 여행 {trips?.length ?? 0}건</div></span>
              <Icon name="chev" size={16} />
            </button>
          </div>
        </section>

        <div className="setting-group">
          {isAdmin && (
            <Link to="/admin" className="setting-row" data-testid="admin-link">
              <span className="ico"><Icon name="shield" size={17} /></span>
              <span style={{ flex: 1 }}>관리자 화면<div className="tiny muted">무료 요금제 · 저장 공간 · 사진 올리기 멈춤 · 오류 신고</div></span>
              <Icon name="chev" size={16} />
            </Link>
          )}
          <button className="setting-row" onClick={report} data-testid="report">
            <span className="ico"><Icon name="external" size={17} /></span>
            <span style={{ flex: 1 }}>문제 신고<div className="tiny muted">이상한 점을 알려 주시면 고칠게요</div></span>
          </button>
        </div>

        <div className="setting-group">
          <button className="setting-row" onClick={() => logOut()}>
            <span className="ico"><Icon name="logout" size={17} /></span>
            <span style={{ flex: 1 }}>로그아웃</span>
          </button>
        </div>
        <div className="tiny muted" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>
            <Link to="/terms" style={{ color: 'inherit' }}>이용약관</Link> · <Link to="/privacy" style={{ color: 'inherit' }}>개인정보 처리방침</Link> · <Link to="/credits" style={{ color: 'inherit' }}>사진·영상·지도 출처</Link>
          </span>
          <span data-testid="app-version">보라핀 v{__APP_VERSION__} ({__COMMIT__})</span>
          <span>지도 경계: 통계청 SGIS(공공누리 1유형) · vuski/admdongkor(CC BY 4.0) · Natural Earth</span>
        </div>
      </div>
    </div>
  );
}
