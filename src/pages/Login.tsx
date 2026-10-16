import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui';
import KoreaMosaic from '../components/KoreaMosaic';
import { SceneVideo } from '../components/Scene';
import { videoById } from '../lib/media';
import { authErrorText, logOut, resendVerification, resetPassword, signInWithEmail, signInWithGoogle, signUpWithEmail, useRecheckAuth } from '../lib/auth';

const Footer = () => (
  <div className="tiny muted login-foot">
    <Link to="/terms">이용약관</Link>
    <Link to="/privacy">개인정보 처리방침</Link>
  </div>
);

export function Login() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const hasVideo = !!videoById('clouds');
  return (
    <div className="login">
      <div className="login-hero">
        {hasVideo ? <SceneVideo id="clouds" className="hero-media" /> : <KoreaMosaic className="login-map" />}
        <div className="login-brand">
          <span className="login-logo"><Logo size={30} /></span>
          <span>보라핀</span>
        </div>
        <p className="login-tag">가본 곳마다, 우리 핀 하나</p>
      </div>
      <div className="login-body">
        <EmailLogin />
        <div className="login-or"><span>간편 로그인</span></div>
        <button
          className="btn block google" disabled={busy} data-testid="login"
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
          {busy ? '로그인 중…' : '구글로 계속하기'}
        </button>
        {err && <div className="small" style={{ color: 'var(--danger)' }} role="alert">{err}</div>}
        <div className="tiny muted" style={{ textAlign: 'center' }}>초대받은 메일 주소로만 들어올 수 있어요.</div>
        <Footer />
      </div>
    </div>
  );
}

/** 이메일 + 비밀번호 로그인 · 가입 · 비밀번호 찾기 */
function EmailLogin() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'in') await signInWithEmail(email, pw);
      else await signUpWithEmail(email, pw);
    } catch (e) {
      setMsg({ text: authErrorText(e) });
    } finally {
      setBusy(false);
    }
  };
  const forgot = async () => {
    if (!email.trim()) return setMsg({ text: '위에 메일 주소를 먼저 적어 주세요' });
    try {
      await resetPassword(email);
      setMsg({ ok: true, text: `${email.trim()}로 비밀번호를 바꾸는 메일을 보냈어요` });
    } catch (e) {
      setMsg({ text: authErrorText(e) });
    }
  };
  return (
    <form className="email-login" onSubmit={(e) => { e.preventDefault(); submit(); }} data-testid="email-form">
      <div className="seg tabs" role="radiogroup" aria-label="로그인 또는 가입">
        <button type="button" role="radio" aria-checked={mode === 'in'} className={mode === 'in' ? 'on' : ''} onClick={() => { setMode('in'); setMsg(null); }}>로그인</button>
        <button type="button" role="radio" aria-checked={mode === 'up'} className={mode === 'up' ? 'on' : ''} onClick={() => { setMode('up'); setMsg(null); }}>처음이에요</button>
      </div>
      <input className="input" type="email" inputMode="email" autoComplete="email" aria-label="메일 주소" placeholder="메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input" type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} aria-label="비밀번호" placeholder={mode === 'up' ? '비밀번호 (6자 이상)' : '비밀번호'} value={pw} onChange={(e) => setPw(e.target.value)} />
      {msg && <div className="small" style={{ color: msg.ok ? 'var(--ok)' : 'var(--danger)' }} role="alert">{msg.text}</div>}
      <button className="btn block" disabled={busy || !email.trim() || pw.length < 6} data-testid="email-submit">
        {busy ? '잠시만요…' : mode === 'in' ? '로그인' : '가입하고 인증 메일 받기'}
      </button>
      {mode === 'in' && <button type="button" className="link-btn" style={{ alignSelf: 'center' }} onClick={forgot}>비밀번호를 잊었어요</button>}
    </form>
  );
}

/** 이메일로 가입한 뒤: 메일함의 인증 링크를 누를 때까지 */
export function VerifyEmail({ email }: { email: string | null }) {
  const recheck = useRecheckAuth();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="center-screen" data-testid="verify">
      <Logo size={56} />
      <div style={{ fontSize: 20, fontWeight: 800 }}>메일함을 확인해 주세요</div>
      <div className="small muted"><b style={{ color: 'var(--ink)' }}>{email}</b>로 인증 메일을 보냈어요.<br />메일의 링크를 누른 뒤 아래 버튼을 눌러 주세요.</div>
      <button
        className="btn" disabled={busy} data-testid="verified"
        onClick={async () => {
          setBusy(true);
          setMsg('');
          try {
            if (!(await recheck())) setMsg('아직 인증되지 않았어요. 메일의 링크를 눌렀는지 확인해 주세요');
          } catch {
            setMsg('확인하지 못했어요. 잠시 뒤 다시 해 주세요');
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? '확인 중…' : '인증했어요'}
      </button>
      {msg && <div className="small" role="alert">{msg}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn sm ghost" onClick={() => resendVerification().then(() => setMsg('인증 메일을 다시 보냈어요. 스팸함도 확인해 주세요'), () => setMsg('잠시 뒤 다시 보내 주세요'))}>메일 다시 보내기</button>
        <button className="btn sm line" onClick={() => logOut()}>다른 계정으로</button>
      </div>
    </div>
  );
}

export function Denied({ email }: { email: string | null }) {
  return (
    <div className="center-screen">
      <Logo size={56} />
      <div style={{ fontSize: 20, fontWeight: 800 }}>아직 초대되지 않은 계정이에요</div>
      <div className="small muted">{email}<br />함께 쓰는 사람에게 이 메일 주소를 추가해 달라고 해 주세요.</div>
      <button className="btn line" onClick={() => logOut()}>다른 계정으로 로그인</button>
      <Footer />
    </div>
  );
}
