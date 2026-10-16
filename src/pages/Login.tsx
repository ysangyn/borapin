import { useState } from 'react';
import { Logo } from '../components/ui';
import { logOut, signInWithGoogle } from '../lib/auth';

export function Login() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="center-screen">
      <Logo size={72} />
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em' }}>보라핀</div>
        <div className="muted">가본 곳마다, 우리 핀 하나</div>
      </div>
      <button
        className="btn" style={{ width: 260 }} disabled={busy} data-testid="login"
        onClick={async () => {
          setBusy(true);
          setErr('');
          try {
            await signInWithGoogle();
          } catch (e) {
            setErr('로그인하지 못했어요. 잠시 뒤 다시 해 주세요.');
            console.error(e);
          } finally {
            setBusy(false);
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        구글 계정으로 시작하기
      </button>
      {err && <div className="small" style={{ color: 'var(--danger)' }}>{err}</div>}
      <div className="tiny muted" style={{ maxWidth: 280 }}>지금은 초대된 계정만 들어올 수 있어요.</div>
    </div>
  );
}

export function Denied({ email }: { email: string | null }) {
  return (
    <div className="center-screen">
      <Logo size={56} />
      <div style={{ fontSize: 20, fontWeight: 800 }}>아직 초대되지 않은 계정이에요</div>
      <div className="small muted">{email}<br />관리자에게 이 메일 주소를 추가해 달라고 해 주세요.</div>
      <button className="btn line" onClick={() => logOut()}>다른 계정으로 로그인</button>
    </div>
  );
}
