import { useEffect, useState } from 'react';
import { logOut, useRecheckAuth } from '../lib/auth';
import { clearPendingInvite, joinByInvite, joinSpaceInvite, readAnyInvite, type AnyInvite, type JoinResult } from '../lib/invites';
import { withRo } from '../lib/ko';
import CircleJoin from './CircleJoin';
import type { User } from 'firebase/auth';

/** 초대 링크로 들어오기: 로그인은 됐지만 아직 멤버가 아닐 때 보이는 화면 */
export default function Join({ code, user }: { code: string; user: User }) {
  const recheck = useRecheckAuth();
  const [found, setFound] = useState<AnyInvite | undefined>(undefined);
  const [state, setState] = useState<'idle' | 'busy' | JoinResult>('idle');
  useEffect(() => { readAnyInvite(code).then(setFound, () => setFound(null)); }, [code]);
  const invite = found === undefined ? undefined : found && found.kind !== 'circle' ? found.invite : null;
  const space = found?.kind === 'space' ? found.invite : null;

  const go = async () => {
    setState('busy');
    const r = space ? await joinSpaceInvite(code, space, user, user.displayName?.split(' ')[0] ?? '') : await joinByInvite(code, user);
    setState(r);
    if (r === 'joined') {
      clearPendingInvite();
      await recheck();
      location.replace('/welcome');
    }
  };
  if (found?.kind === 'circle') return <CircleJoin code={code} invite={found.invite} user={user} guest fallbackNick="" />;
  const bad = invite === null || (invite && invite.expiresAt < Date.now()) || state === 'expired' || state === 'missing' || state === 'used';
  return (
    <div className="center-screen" data-testid="join">
      <img src="/art/bora-cheer.webp" alt="" aria-hidden="true" width={360} height={360} style={{ width: 140, height: 'auto' }} />
      {invite === undefined && <div className="small muted">초대를 확인하는 중…</div>}
      {invite && !bad && (
        <>
          <div style={{ fontSize: 20, fontWeight: 600 }} data-testid="join-title">
            {space?.role === 'admin' ? '보라핀을 새로 시작해요' : space?.spaceName ? `${space.spaceName}에 초대받았어요` : '보라핀에 초대받았어요'}
          </div>
          <div className="small muted" style={{ maxWidth: 320 }}>
            {invite.name ? <>앞으로 앱에서 <b>{invite.name}</b>{withRo(invite.name).slice(invite.name.trim().length)} 불려요. </> : null}
            <b>{user.email}</b> 계정으로 들어가요.{' '}
            {space?.role === 'admin'
              ? '나만의 공간이 새로 생겨요. 기록은 이 공간 사람만 봐요. 들어간 뒤 짝이나 가족을 초대할 수 있어요.'
              : '들어가면 함께 쓰는 사람들의 기록과 사진을 같이 보게 돼요.'}
          </div>
          <button className="btn block" style={{ maxWidth: 320 }} onClick={go} disabled={state === 'busy'} data-testid="join-go">{state === 'busy' ? '들어가는 중…' : '들어가기'}</button>
          {state === 'failed' && <div className="small" style={{ color: 'var(--danger)' }}>들어가지 못했어요. 연결을 확인하고 다시 눌러 주세요.</div>}
        </>
      )}
      {bad && (
        <>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{state === 'used' || invite?.usedBy ? '이미 쓰인 초대 링크예요' : '초대 링크가 만료됐거나 없어요'}</div>
          <div className="small muted" style={{ maxWidth: 320 }}>초대한 사람에게 새 링크를 부탁해 주세요. 링크는 7일 동안, 한 번만 쓸 수 있어요.</div>
          <button className="btn line" onClick={() => { clearPendingInvite(); location.replace('/'); }}>처음으로</button>
        </>
      )}
      <button className="link-btn" onClick={() => { clearPendingInvite(); logOut(); }}>다른 계정으로 로그인</button>
    </div>
  );
}
