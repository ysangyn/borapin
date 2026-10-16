import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { members } from '../lib/members';
import { useStore } from '../lib/store';
import { displayName, useAuth } from '../lib/auth';
import { buildFeed, unseenCount } from '../lib/feed';
import { feedSeenAt, onFeedSeen } from '../lib/feedSeen';
import { unseenHearts, useHearts } from '../lib/hearts';

const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  bag: 'M3 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  feed: 'M4 5h16v4H4zM4 12h10M4 16h16M4 20h7',
  image: 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM21 16l-5-5-9 9M9 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  back: 'M15 5l-7 7 7 7',
  chev: 'm9 5 7 7-7 7',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
  x: 'M6 6l12 12M18 6 6 18',
  check: 'm5 12 5 5 9-10',
  pin: 'M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4',
  users: 'M9 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6',
  focus: 'M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  upload: 'M12 20V9M7 14l5-5 5 5M5 4h14',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM9 12l2 2 4-4',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10',
  globe: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  flag: 'M5 22V3h12l-2.5 4.5L17 12H5',
  lock: 'M5 11h14v9H5zM8 11V8a4 4 0 0 1 8 0v3',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
  dice: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  play: 'M8 5v14l11-7z',
  sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
};

export function Icon({ name, size = 20, stroke = 1.9, className }: { name: keyof typeof PATHS | string; size?: number; stroke?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="보라핀 로고">
      <path d="M42 6c-7.7 0-14 6.3-14 14 0 10.3 14 21.5 14 21.5S56 30.3 56 20c0-7.7-6.3-14-14-14z" fill="#B9A8FF" />
      <path d="M25 12C15.6 12 8 19.6 8 29c0 12.6 17 27 17 27s17-14.4 17-27c0-9.4-7.6-17-17-17z" fill="#5B3FD1" />
      <circle cx="25" cy="29" r="6.5" fill="#FFFFFF" />
    </svg>
  );
}

/** 함께 쓰는 사람 동그라미 (실제 멤버, 셋까지 + 나머지 수) */
export function Avatars({ size = 32 }: { size?: number }) {
  const s = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  const list = members();
  const shown = list.slice(0, 3);
  return (
    <span className="avatars" aria-label={list.map((m) => m.name).join(' · ') || '우리'} data-testid="avatars">
      {shown.map((m) => <span key={m.email} className={'avatar t' + m.tone} style={s}>{m.initial}</span>)}
      {list.length > 3 && <span className="avatar more" style={s}>+{list.length - 3}</span>}
    </span>
  );
}

/** 아래 메뉴 '피드'의 새 소식 점: 마지막으로 본 뒤에 남이 남긴 여행·장소·가고 싶은 곳 (사진·글은 피드에 들어가면 센다) */
function useFeedUnseen() {
  const { trips, wishes, places } = useStore();
  const auth = useAuth();
  const [seen, setSeen] = useState(feedSeenAt);
  useEffect(() => onFeedSeen(() => setSeen(feedSeenAt())), []);
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const uid = auth.status === 'ready' ? auth.user.uid : '';
  const hearts = useHearts();
  return useMemo(() => {
    if (!trips || !wishes || !places) return 0;
    const items = buildFeed({ trips, wishes, recs: places, photos: [], notes: [] });
    const fromHearts = unseenHearts(hearts, seen, uid);
    if (import.meta.env.VITE_EMULATOR === '1') (window as unknown as { __unseen?: unknown }).__unseen = { seen, me, items: items.slice(0, 5).map((i) => ({ kind: i.kind, at: i.at, by: i.by })) };
    return unseenCount(items, seen, me) + fromHearts;
  }, [trips, wishes, places, seen, me, hearts, uid]);
}

export function BottomNav() {
  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'on' : '');
  const unseen = useFeedUnseen();
  return (
    <nav className="nav" aria-label="주 메뉴">
      <NavLink to="/" end className={cls}><Icon name="home" size={24} />홈</NavLink>
      <NavLink to="/trips" className={cls}><Icon name="bag" size={24} />여행</NavLink>
      <NavLink to="/record" className="plus" aria-label="기록하기"><Icon name="plus" size={26} stroke={2.4} /></NavLink>
      <NavLink to="/map" className={cls}><Icon name="map" size={24} />지도</NavLink>
      <NavLink to="/feed" className={({ isActive }) => (isActive || location.pathname.startsWith('/memories') ? 'on' : '')} data-testid="nav-feed">
        <span className="nav-icon"><Icon name="feed" size={24} />{unseen > 0 && <i className="nav-dot" aria-label={`새 소식 ${unseen}개`} data-testid="feed-dot" />}</span>피드
      </NavLink>
    </nav>
  );
}

/**
 * 뒤로 가기. 앱 안에서 온 화면이면 그 화면으로, 바깥(링크·공유·새 탭)에서 바로 열었으면 상위 화면으로.
 */
export function useGoBack() {
  const nav = useNavigate();
  const loc = useLocation();
  return useCallback((fallback = '/') => {
    if (loc.key !== 'default') nav(-1);
    else nav(fallback, { replace: true });
  }, [nav, loc.key]);
}

/** 쓰던 내용이 있으면 새로고침·창 닫기 전에 묻는다 */
// 지금 화면에 저장하지 않은 입력이 있는지 (새 버전으로 바로 새로 고쳐도 되는지 판단할 때 쓴다)
let unsaved = 0;
export const hasUnsavedInput = () => unsaved > 0;

export function useLeaveGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    unsaved++;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => {
      unsaved--;
      window.removeEventListener('beforeunload', h);
    };
  }, [dirty]);
}

export function TopBar({ title, back, right, backTo = '/', confirmLeave }: { title?: ReactNode; back?: boolean; right?: ReactNode; backTo?: string; confirmLeave?: boolean }) {
  const goBack = useGoBack();
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {back && (
          <button className="back" aria-label="뒤로" onClick={() => { if (!confirmLeave || window.confirm('저장하지 않은 내용이 있어요. 그래도 나갈까요?')) goBack(backTo); }}>
            <Icon name="back" size={22} stroke={2.2} />
          </button>
        )}
        {typeof title === 'string' ? <h1>{title}</h1> : title}
      </div>
      {right}
    </div>
  );
}

// ---------- 토스트 ----------
export interface ToastAction { label: string; onClick: () => void }
type ToastFn = (msg: string, action?: ToastAction) => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ msg: string; action?: ToastAction; id: number } | null>(null);
  const show = useCallback<ToastFn>((msg, action) => {
    const id = Date.now() + Math.random();
    setT({ msg, action, id });
    window.setTimeout(() => setT((cur) => (cur?.id === id ? null : cur)), action ? 5000 : 2600);
  }, []);
  // 알림이 떠 있는 동안은 떠 있는 보라(물어봐요)를 잠시 숨겨 겹치지 않게
  useEffect(() => {
    document.body.classList.toggle('toast-open', !!t);
  }, [t]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {/* 읽어 주는 영역은 늘 붙여 둔다 (그때그때 붙이면 화면 읽기 프로그램이 놓친다) */}
      <div className="toast-region" role="status" aria-live="polite">
      {t && (
        <div className="toast" key={t.id}>
          <span>{t.msg}</span>
          {t.action && (
            <button
              className="toast-action"
              onClick={() => {
                t.action?.onClick();
                setT(null);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      )}
      </div>
    </ToastCtx.Provider>
  );
}

export function Spinner({ label = '불러오는 중' }: { label?: string }) {
  return <div className="center-screen muted small" aria-busy="true">{label}…</div>;
}
