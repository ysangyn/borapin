import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatars, Icon, TopBar, useToast } from '../components/ui';
import { logOut, nameOf, useAuth } from '../lib/auth';
import { computeStats, readAll, setAccessList, usePlaces, useTrips, useWishes } from '../lib/data';
import { exportXlsx, saveBlob } from '../lib/exportXlsx';
import { sendReport } from '../lib/admin';
import { useSeasons } from '../lib/seasons';
import { loadTravelInfo } from '../lib/travelinfo';
import { OWNER_EMAIL } from '../lib/firebase';
import { isOffline } from '../lib/writes';
import { localDate } from '../lib/dates';
import type { Photo } from '../lib/types';

export default function Space() {
  const auth = useAuth();
  const toast = useToast();
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const { places: recs } = usePlaces();
  const seasons = useSeasons();
  const [busy, setBusy] = useState<'xlsx' | 'json' | null>(null);
  const [email, setEmail] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  if (auth.status !== 'ready') return null;
  const { user, access, isAdmin } = auth;

  const addMember = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return toast('메일 주소를 확인해 주세요');
    if (access.allowed.includes(e)) return toast('이미 함께 쓰고 있는 계정이에요');
    setEmail('');
    try {
      await setAccessList('allowed', e, true);
      toast(`${e} 계정이 들어올 수 있어요`);
    } catch (err) {
      console.warn(err);
      setEmail(e);
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
            <div style={{ fontSize: 19, fontWeight: 800 }}>보라 &amp; 영상</div>
            <div className="small muted">여행 {stats?.tripsDone ?? 0}번 · 핀 {stats?.pins ?? 0}개</div>
            <div className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nameOf(user.email)} · {user.email}</div>
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
                <input className="input" style={{ height: 42 }} type="email" inputMode="email" placeholder="함께 쓸 사람의 메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addMember(); }} aria-label="추가할 계정" />
                <button className="btn sm" onClick={addMember}>추가</button>
              </div>
            )}
          </div>
          {isAdmin && <div className="tiny muted" style={{ padding: '6px 4px 0' }}>추가한 메일로 구글 로그인이나 이메일 로그인을 하면 들어올 수 있어요.</div>}
        </section>

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
