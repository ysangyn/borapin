import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  bag: 'M3 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
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

export function Avatars({ size = 32 }: { size?: number }) {
  const s = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  return (
    <span className="avatars" aria-label="보라 · 영상">
      <span className="avatar bora" style={s}>보</span>
      <span className="avatar ys" style={s}>영</span>
    </span>
  );
}

export function BottomNav() {
  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'on' : '');
  return (
    <nav className="nav" aria-label="주 메뉴">
      <NavLink to="/" end className={cls}><Icon name="home" size={24} />홈</NavLink>
      <NavLink to="/trips" className={cls}><Icon name="bag" size={24} />여행</NavLink>
      <NavLink to="/record" className="plus" aria-label="기록하기"><Icon name="plus" size={26} stroke={2.4} /></NavLink>
      <NavLink to="/map" className={cls}><Icon name="map" size={24} />지도</NavLink>
      <NavLink to="/memories" className={cls}><Icon name="image" size={24} />추억</NavLink>
    </nav>
  );
}

export function TopBar({ title, back, right }: { title?: ReactNode; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {back && (
          <button className="back" aria-label="뒤로" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))}>
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
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && (
        <div className="toast" role="status">
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
    </ToastCtx.Provider>
  );
}

export function Spinner({ label = '불러오는 중' }: { label?: string }) {
  return <div className="center-screen muted small" aria-busy="true">{label}…</div>;
}
