import { useState } from 'react';
import type { User } from 'firebase/auth';
import { clearPendingInvite, type JoinResult } from '../lib/invites';
import { joinCircle, type CircleInvite } from '../lib/circles';

/**
 * 모임 초대장으로 들어오기. 보라핀 공간이 있는 사람도, 없는 사람(손님)도 같은 화면.
 * 손님은 모임 지도만 보고 가게를 걸 수 있다 (자기 여행 기록은 없다).
 */
export default function CircleJoin({ code, invite, user, guest, fallbackNick }: { code: string; invite: CircleInvite; user: User; guest: boolean; fallbackNick: string }) {
  const [nick, setNick] = useState((fallbackNick || user.displayName?.split(' ')[0] || (user.email ?? '').split('@')[0] || '').slice(0, 10));
  const [state, setState] = useState<'idle' | 'busy' | JoinResult>('idle');
  const bad = !!invite.usedBy || invite.expiresAt < Date.now() || state === 'used' || state === 'expired';
  const go = async () => {
    if (!nick.trim()) return;
    setState('busy');
    const r = await joinCircle(code, invite, user, nick);
    setState(r);
    if (r === 'joined') {
      clearPendingInvite();
      location.replace(`/circles/${invite.circleId}`);
    }
  };
  return (
    <div className="center-screen" data-testid="circle-join">
      <img src="/art/bora-cheer.webp" alt="" aria-hidden="true" width={360} height={360} style={{ width: 140, height: 'auto' }} />
      {!bad ? (
        <>
          <div style={{ fontSize: 20, fontWeight: 600 }} data-testid="join-title">{invite.circleName ? `'${invite.circleName}' 모임에 초대받았어요` : '모임에 초대받았어요'}</div>
          <div className="small muted" style={{ maxWidth: 320 }}>
            모임 사람들이 골라서 건 가게를 함께 보고, 나도 가게를 걸 수 있어요. 서로의 여행 기록은 보이지 않아요.
            {guest ? ' 보라핀을 처음 쓰면 모임만 볼 수 있어요.' : ''}
          </div>
          <label className="field" style={{ width: '100%', maxWidth: 320 }}>
            <span className="label">모임에서 부를 내 별명</span>
            <input className="input" value={nick} maxLength={10} onChange={(e) => setNick(e.target.value)} aria-label="모임 별명" />
          </label>
          <button className="btn block" style={{ maxWidth: 320 }} onClick={go} disabled={state === 'busy' || !nick.trim()} data-testid="join-go">{state === 'busy' ? '들어가는 중…' : '모임에 들어가기'}</button>
          {state === 'failed' && <div className="small" style={{ color: 'var(--danger)' }}>들어가지 못했어요. 연결을 확인하고 다시 눌러 주세요.</div>}
        </>
      ) : (
        <>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{invite.usedBy || state === 'used' ? '이미 쓰인 초대 링크예요' : '초대 링크가 만료됐어요'}</div>
          <div className="small muted" style={{ maxWidth: 320 }}>모임을 만든 사람에게 새 링크를 부탁해 주세요. 링크는 7일 동안, 한 번만 쓸 수 있어요.</div>
          <button className="btn line" onClick={() => { clearPendingInvite(); location.replace('/'); }}>처음으로</button>
        </>
      )}
    </div>
  );
}
