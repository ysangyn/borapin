import { Component, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { sendReport } from '../lib/admin';
import { useStore } from '../lib/store';
import { onLateWriteError } from '../lib/writes';
import { hasUnsavedInput, useToast } from './ui';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RestArt } from './Scene';

/** 화면을 그리다 난 오류: 흰 화면 대신 다시 시도할 수 있는 안내 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    if (isChunkError(error)) return reloadOnce();
    sendReport('error', error.message, (error.stack ?? '').slice(0, 2000));
  }
  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="center-screen" role="alert">
        <RestArt />
        <b style={{ fontSize: 18 }}>이 화면을 여는 중에 문제가 생겼어요</b>
        <span className="small muted">기록은 안전해요. 다시 열어 보고, 계속되면 우리 공간 › 문제 신고로 알려 주세요.</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" onClick={() => this.setState({ error: null })}>다시 시도</button>
          <button className="btn" onClick={() => location.assign('/')}>홈으로</button>
        </div>
      </div>
    );
  }
}

const isChunkError = (e: unknown) => /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(String((e as Error)?.message ?? e));

/** 배포 직후 옛 화면 조각을 못 찾으면 한 번만 새로고침 (무한 반복 방지) */
function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem('borapin:reloaded') ?? 0);
    if (Date.now() - last < 30_000) return;
    sessionStorage.setItem('borapin:reloaded', String(Date.now()));
  } catch {
    /* 저장소를 못 써도 새로고침은 한다 */
  }
  location.reload();
}

export function installChunkRecovery() {
  window.addEventListener('vite:preloadError', (e) => {
    e.preventDefault();
    reloadOnce();
  });
  window.addEventListener('unhandledrejection', (e) => {
    if (isChunkError(e.reason)) reloadOnce();
  });
}

/** 연결 상태 */
export function useOnline() {
  const [on, setOn] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOn(true);
    const down = () => setOn(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return on;
}

/** 위쪽 알림 띠: 오프라인, 불러오기 실패 */
export function StatusBanner() {
  const online = useOnline();
  const { error, retry } = useStore();
  const toast = useToast();
  useEffect(
    () =>
      onLateWriteError((code) =>
        toast(code === 'resource-exhausted' ? '오늘 무료 사용량을 다 써서 저장하지 못했어요' : code === 'permission-denied' ? '저장할 권한이 없어 저장하지 못했어요' : '저장하지 못한 내용이 있어요. 다시 해 주세요'),
      ),
    [toast],
  );
  if (!online)
    return (
      <div className="status-banner" role="status">
        오프라인이에요 · 남긴 기록은 기기에 저장됐다가 연결되면 올라가요
      </div>
    );
  if (error)
    return (
      <div className="status-banner warn" role="alert">
        <span>{error}</span>
        <button onClick={retry}>다시 시도</button>
      </div>
    );
  return null;
}

/** 새 화면으로 갈 때는 맨 위에서, 뒤로 올 때는 있던 자리 그대로 */
export function ScrollManager() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  useEffect(() => {
    if (type !== 'POP') window.scrollTo(0, 0);
  }, [pathname, type]);
  return null;
}

/**
 * 새 버전 받기: 새 버전이 올라오면 바로 새로 고친다 (옛 버전이 남지 않게).
 * 다만 쓰던 내용이 있으면 날아가지 않게, 저장할 때까지 기다리며 띠로 알려 준다.
 */
export function UpdateWatcher() {
  const {
    needRefresh: [need],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // 앱을 오래 열어 두어도 한 시간마다 새 버전이 있는지 본다
      if (reg) window.setInterval(() => void reg.update().catch(() => undefined), 60 * 60 * 1000);
    },
    onRegisterError() {
      /* 서비스 워커를 못 쓰는 환경(시험·사생활 보호 모드)에서는 그냥 둔다 */
    },
  });
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (!need) return;
    const tryNow = () => {
      if (hasUnsavedInput()) return setWaiting(true);
      void updateServiceWorker(true);
    };
    tryNow();
    const t = window.setInterval(tryNow, 3000);
    return () => window.clearInterval(t);
  }, [need, updateServiceWorker]);
  if (!need || !waiting) return null;
  return (
    <div className="status-banner" role="status" data-testid="update-banner">
      새 버전이 있어요. 쓰던 내용을 저장하면 바로 바뀌어요.
      <button onClick={() => void updateServiceWorker(true)}>지금 새로 고침</button>
    </div>
  );
}
