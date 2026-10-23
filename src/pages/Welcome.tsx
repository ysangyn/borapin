import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui';
import HomeSetting from '../components/HomeSetting';
import KoreaMosaic from '../components/KoreaMosaic';
import { displayName, useAuth } from '../lib/auth';
import { renameSelf } from '../lib/invites';
import { memberNames, spaceTitle, toneOf } from '../lib/members';
import { withRo } from '../lib/ko';
import { computeStats, useTrips } from '../lib/data';

const KEY = 'borapin:welcomed';
export const needsWelcome = () => { try { return !localStorage.getItem(KEY); } catch { return false; } };
export const markWelcomed = () => { try { localStorage.setItem(KEY, new Date().toISOString()); } catch { /* */ } };

/**
 * 처음 들어온 사람의 환영 3장면: 어서 와요 → 내 이름 → 우리 집. 한 번만 보이고, 건너뛸 수 있다.
 * (새 화면이 아니라 들어온 직후 한 번 지나가는 길이라 아래 메뉴 없이 보인다)
 */
export default function Welcome() {
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const { trips } = useTrips();
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const others = memberNames().filter((n) => n !== me);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(me);
  const [busy, setBusy] = useState(false);

  const finish = () => { markWelcomed(); nav('/', { replace: true }); };
  const saveName = async () => {
    if (auth.status !== 'ready') return;
    const clean = name.trim();
    if (!clean || clean === me) return setStep(2);
    setBusy(true);
    try { await renameSelf(auth.user, clean); toast(`이제 ${withRo(clean)} 불려요`); setStep(2); }
    catch { toast('이름을 저장하지 못했어요'); }
    finally { setBusy(false); }
  };

  return (
    <div className="page welcome" data-testid="welcome" style={{ paddingTop: 28, minHeight: '100dvh' }}>
      <div className="welcome-dots" aria-hidden="true">{[0, 1, 2].map((i) => <span key={i} className={i === step ? 'on' : ''} />)}</div>

      {step === 0 && (
        <>
          <h1 className="jua welcome-title">어서 와요{me ? `, ${me}` : ''}!</h1>
          <p className="welcome-sub">{others.length && stats?.pins ? <>{others.join('·')}이 먼저 꽂아 둔 핀이 <b>{stats.pins}개</b> 있어요.<br />이제 {spaceTitle()}의 지도가 됐어요.</> : <>다녀온 곳마다 핀을 꽂는, 우리만의 지도예요.</>}</p>
          <div className="welcome-art">
            <KoreaMosaic fill={stats && stats.cellVisits.size ? Math.min(0.6, stats.cellVisits.size / 160 + 0.08) : 0.12} className="welcome-map" />
            <img src="/art/bora-cheer.webp" alt="" width={120} height={165} />
          </div>
          <div className="welcome-foot">
            <button className="btn block jua" style={{ fontSize: 17 }} onClick={() => setStep(1)} data-testid="welcome-next">다음: 내 이름</button>
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={finish}>나중에 하기</button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="jua welcome-title">앱에서 뭐라고 부를까요?</h1>
          <p className="welcome-sub">한 줄 평·하트에 이 이름과 색으로 나와요.</p>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={'avatar t' + Math.max(0, toneOf(me))} style={{ width: 44, height: 44, fontSize: 16 }} aria-hidden="true">{[...(name.trim() || me || '나')][0]}</span>
            <input className="jua welcome-name" aria-label="내 이름" value={name} maxLength={10} onChange={(e) => setName(e.target.value)} placeholder={me || '이름'} />
          </div>
          <div className="welcome-foot">
            <button className="btn block jua" style={{ fontSize: 17 }} onClick={saveName} disabled={busy || !name.trim()} data-testid="welcome-name-next">{busy ? '저장하는 중…' : '다음: 우리 집은 어디?'}</button>
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setStep(2)}>그대로 둘게요</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="jua welcome-title">우리 집은 어디예요?</h1>
          <p className="welcome-sub">집을 알면 '가까운 곳'과 가는 길을 바로 알려 드려요. 시·군까지만 적어도 돼요.</p>
          <HomeSetting />
          <div className="welcome-foot">
            <button className="btn block jua" style={{ fontSize: 17 }} onClick={finish} data-testid="welcome-done">지도 보러 가기</button>
          </div>
        </>
      )}
    </div>
  );
}
