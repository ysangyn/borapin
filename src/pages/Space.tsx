import { useMemo, useRef, useState } from 'react';
import { Avatars, Icon, TopBar, useToast } from '../components/ui';
import { logOut, useAuth } from '../lib/auth';
import { batchWrite, computeStats, setAccessList, useTrips, useWishes } from '../lib/data';
import { planV22Import, type ImportPlan } from '../lib/v22import';
import { OWNER_EMAIL } from '../lib/firebase';

export default function Space() {
  const auth = useAuth();
  const toast = useToast();
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  if (auth.status !== 'ready') return null;
  const { user, access, isAdmin } = auth;

  const addMember = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return toast('메일 주소를 확인해 주세요');
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

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      setPlan(planV22Import(json));
    } catch (e) {
      toast((e as Error).message || '파일을 읽지 못했어요');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const runImport = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      await batchWrite(
        [
          ...plan.trips.map((t) => ({ coll: 'trips' as const, id: t.id, data: t.data as unknown as Record<string, unknown> })),
          ...plan.wishes.map((w) => ({ coll: 'wishes' as const, id: w.id, data: w.data as unknown as Record<string, unknown> })),
        ],
        user,
      );
      toast(`여행 ${plan.trips.length}건, 가고 싶은 곳 ${plan.wishes.length}곳을 가져왔어요`);
      setPlan(null);
    } catch (e) {
      console.error(e);
      toast('가져오지 못했어요. 파일을 확인해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const exportBackup = () => {
    const data = { app: 'borapin', exported: new Date().toISOString(), trips, wishes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `보라핀_백업_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ background: 'var(--page)', minHeight: '100%' }}>
      <TopBar back title={<span style={{ fontWeight: 800, fontSize: 18 }}>우리 공간</span>} />
      <div className="page" style={{ paddingTop: 0, gap: 14 }}>
        <div className="setting-group" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <Avatars size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>보라 &amp; 영상</div>
            <div className="small muted">여행 {stats?.tripsDone ?? 0}번 · 핀 {stats?.pins ?? 0}개 · {user.email}</div>
          </div>
        </div>

        <section>
          <div className="label" style={{ padding: '0 4px 6px' }}>함께 쓰는 사람 (로그인 허용 계정)</div>
          <div className="setting-group">
            {access.allowed.map((e) => (
              <div key={e} className="setting-row">
                <span className="ico"><Icon name="users" size={17} /></span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e}{e === OWNER_EMAIL ? ' · 관리자' : ''}</span>
                {isAdmin && e !== OWNER_EMAIL && (
                  <button className="btn sm line" onClick={() => setAccessList('allowed', e, false).then(() => toast('뺐어요'))}>빼기</button>
                )}
              </div>
            ))}
            {isAdmin && (
              <div className="setting-row">
                <input className="input" style={{ height: 40 }} placeholder="보라님 지메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="추가할 계정" />
                <button className="btn sm" onClick={addMember}>추가</button>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="label" style={{ padding: '0 4px 6px' }}>기록 옮기기</div>
          <div className="setting-group">
            <button className="setting-row" onClick={() => fileRef.current?.click()} data-testid="v22-import">
              <span className="ico"><Icon name="upload" size={17} /></span>
              <span style={{ flex: 1 }}>예전 여행지도(v22) 기록 가져오기<div className="tiny muted">v22 '내보내기'로 받은 .json 파일을 고르세요</div></span>
              <Icon name="chev" size={16} />
            </button>
            <button className="setting-row" onClick={exportBackup}>
              <span className="ico"><Icon name="download" size={17} /></span>
              <span style={{ flex: 1 }}>백업 파일 내려받기<div className="tiny muted">여행 {trips?.length ?? 0}건 · 가고 싶은 곳 {wishes?.length ?? 0}곳</div></span>
              <Icon name="chev" size={16} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => onFile(e.target.files?.[0])} data-testid="v22-file" />
          {plan && (
            <div className="card white" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }} data-testid="import-plan">
              <b>이렇게 가져올게요</b>
              <div className="small">
                다녀온 지역 <b>{plan.trips.length}곳</b> → 지난 여행 {plan.trips.length}건<br />
                가고 싶은 곳 <b>{plan.wishes.length}곳</b>
                {plan.photoCount > 0 && <><br /><span className="muted">사진 {plan.photoCount}장은 사진 기능이 열리는 2단계에서 옮겨요.</span></>}
                {plan.skipped.length > 0 && <><br /><span className="muted">알 수 없는 지역 {plan.skipped.length}개는 건너뛰어요.</span></>}
                <br /><span className="muted">여러 번 가져와도 같은 지역은 겹치지 않고 덮어써요.</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn ghost" style={{ flex: 1 }} onClick={() => setPlan(null)}>취소</button>
                <button className="btn" style={{ flex: 1 }} disabled={busy} onClick={runImport} data-testid="import-run">{busy ? '가져오는 중…' : '가져오기'}</button>
              </div>
            </div>
          )}
        </section>

        {isAdmin && (
          <section>
            <div className="label" style={{ padding: '0 4px 6px' }}>관리자</div>
            <div className="setting-group">
              <div className="setting-row">
                <span className="ico"><Icon name="shield" size={17} /></span>
                <span style={{ flex: 1 }}>요금제<div className="tiny muted">무료(Spark) · 한도를 넘으면 그날 멈출 뿐 요금은 나오지 않아요</div></span>
                <span className="tag" style={{ background: 'var(--ok-mist)', color: 'var(--ok)' }}>0원</span>
              </div>
              <div className="setting-row">
                <span className="ico"><Icon name="map" size={17} /></span>
                <span style={{ flex: 1 }}>저장된 기록<div className="tiny muted">여행 {trips?.length ?? 0} · 가고 싶은 곳 {wishes?.length ?? 0} · 함께 쓰는 사람 {access.allowed.length}</div></span>
              </div>
              <a className="setting-row" href="https://console.firebase.google.com/project/borapin/usage" target="_blank" rel="noreferrer">
                <span className="ico"><Icon name="external" size={17} /></span>
                <span style={{ flex: 1 }}>Firebase 사용량 보기<div className="tiny muted">요금·예산·자동 차단은 2단계에 이 자리로 들어와요</div></span>
                <Icon name="chev" size={16} />
              </a>
            </div>
          </section>
        )}

        <div className="setting-group">
          <button className="setting-row" onClick={() => logOut()}>
            <span className="ico"><Icon name="logout" size={17} /></span>
            <span style={{ flex: 1 }}>로그아웃</span>
          </button>
        </div>
        <div className="tiny muted" style={{ textAlign: 'center' }}>
          보라핀 v{__APP_VERSION__} · 지도 경계: 통계청 SGIS(공공누리 1유형)·vuski/admdongkor(CC BY 4.0), Natural Earth
        </div>
      </div>
    </div>
  );
}
