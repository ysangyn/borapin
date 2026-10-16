import { useEffect, useState } from 'react';
import { logOut, useRecheckAuth } from '../lib/auth';
import { clearPendingInvite, joinByInvite, readInvite, type Invite, type JoinResult } from '../lib/invites';
import type { User } from 'firebase/auth';

/** 초대 링크로 들어오기: 로그인은 됐지만 아직 멤버가 아닐 때 보이는 화면 */
export default function Join({ code, user }: { code: string; user: User }) {
  const recheck = useRecheckAuth();
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined);
  const [state, setState] = useState<'idle' | 'busy' | JoinResult>('idle');
  useEffect(() => { readInvite(code).then(setInvite, () => setInvite(null)); }, [code]);

  const go = async () => {
    setState('busy');
    const r = await joinByInvite(code, user);
    setState(r);
    if (r === 'joined') {
      clearPendingInvite();
      await recheck();
      location.replace('/');
    }
  };
  const bad = invite === null || (invite && invite.expiresAt < Date.now()) || state === 'expired' || state === 'missing' || state === 'used';
  return (
    <div className="center-screen" data-testid="join">
      <img src="/art/bora-cheer.webp" alt="" aria-hidden="true" width={360} height={360} style={{ width: 140, height: 'auto' }} />
      {invite === undefined && <div className="small muted">초대를 확인하는 중…</div>}
      {invite && !bad && (
        <>
          <div style={{ fontSize: 20, fontWeight: 800 }}>보라핀에 초대받았어요</div>
          <div className="small muted" style={{ maxWidth: 320 }}>
            {invite.name ? <>앞으로 앱에서 <b>{invite.name}</b>(으)로 불려요. </> : null}
            <b>{user.email}</b> 계정으로 들어가요. 들어가면 함께 쓰는 사람들의 기록과 사진을 같이 보게 돼요.
          </div>
          <button className="btn block" style={{ maxWidth: 320 }} onClick={go} disabled={state === 'busy'} data-testid="join-go">{state === 'busy' ? '들어가는 중…' : '들어가기'}</button>
          {state === 'failed' && <div className="small" style={{ color: 'var(--danger)' }}>들어가지 못했어요. 연결을 확인하고 다시 눌러 주세요.</div>}
        </>
      )}
      {bad && (
        <>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{state === 'used' || invite?.usedBy ? '이미 쓰인 초대 링크예요' : '초대 링크가 만료됐거나 없어요'}</div>
          <div className="small muted" style={{ maxWidth: 320 }}>초대한 사람에게 새 링크를 부탁해 주세요. 링크는 7일 동안, 한 번만 쓸 수 있어요.</div>
          <button className="btn line" onClick={() => { clearPendingInvite(); location.replace('/'); }}>처음으로</button>
        </>
      )}
      <button className="link-btn" onClick={() => { clearPendingInvite(); logOut(); }}>다른 계정으로 로그인</button>
    </div>
  );
}
