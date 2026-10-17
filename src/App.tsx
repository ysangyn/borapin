import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { DataProvider } from './lib/store';
import { BottomNav, Spinner, useToast } from './components/ui';
import { ErrorBoundary, ScrollManager, StatusBanner } from './components/system';
import { RestArt } from './components/Scene';
import { Denied, Login, VerifyEmail } from './pages/Login';
import Join from './pages/Join';
import { clearPendingInvite, pendingInvite, rememberInviteFromUrl } from './lib/invites';
import Home from './pages/Home';
import { preloadCheer } from './lib/celebrate';

// 홈 말고는 그 화면에 갈 때 불러온다 (첫 화면이 빨리 뜨게)
const Trips = lazy(() => import('./pages/Trips'));
const TripDetail = lazy(() => import('./pages/TripDetail'));
const Record = lazy(() => import('./pages/Record'));
const MapPage = lazy(() => import('./pages/MapPage'));
const Memories = lazy(() => import('./pages/Memories'));
const Feed = lazy(() => import('./pages/Feed'));
const Backdrop = lazy(() => import('./components/Backdrop'));
const Study = lazy(() => import('./pages/Study'));
const Phrases = lazy(() => import('./pages/Phrases'));
const Planner = lazy(() => import('./pages/Planner'));
const PlanPick = lazy(() => import('./pages/Planner').then((m) => ({ default: m.PlanPick })));
const Space = lazy(() => import('./pages/Space'));
const Wishes = lazy(() => import('./pages/Wishes'));
const WishEdit = lazy(() => import('./pages/WishEdit'));
const Places = lazy(() => import('./pages/Places'));
const PlaceEdit = lazy(() => import('./pages/PlaceEdit'));
const Ask = lazy(() => import('./pages/Ask'));
const Admin = lazy(() => import('./pages/Admin'));
const SharedTripPage = lazy(() => import('./pages/SharedTripPage'));
const Legal = lazy(() => import('./pages/Legal'));

export default function App() {
  const auth = useAuth();
  const loc = useLocation();
  // 축하 그림은 들어온 뒤 잠시 있다가 미리 받아 둔다
  useEffect(() => {
    if (auth.status !== 'ready') return;
    const t = setTimeout(preloadCheer, 3000);
    return () => clearTimeout(t);
  }, [auth.status]);
  // 링크 공개된 여행과 약관·개인정보 처리방침은 로그인 없이 본다
  if (loc.pathname.startsWith('/s/') || ['/privacy', '/terms', '/credits'].includes(loc.pathname)) {
    return (
      <div className="app">
        <ErrorBoundary resetKey={loc.pathname}>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/s/:token" element={<SharedTripPage />} />
              <Route path="/privacy" element={<Legal kind="privacy" />} />
              <Route path="/terms" element={<Legal kind="terms" />} />
              <Route path="/credits" element={<Legal kind="credits" />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }
  // 글자를 치는 동안은 떠 있는 보라를 숨긴다 (입력칸·단추를 가리지 않게)
  useEffect(() => {
    const on = (e: FocusEvent) => { const t = e.target as HTMLElement | null; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) document.body.classList.add('typing'); };
    const off = () => window.setTimeout(() => { const a = document.activeElement as HTMLElement | null; if (!a || !/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) document.body.classList.remove('typing'); }, 80);
    document.addEventListener('focusin', on);
    document.addEventListener('focusout', off);
    return () => { document.removeEventListener('focusin', on); document.removeEventListener('focusout', off); };
  }, []);
  if (auth.status === 'loading') return <div className="app"><Spinner /></div>;
  if (auth.status === 'signedOut') { rememberInviteFromUrl(); return <div className="app bare"><Login /></div>; }
  if (auth.status === 'denied') {
    // 초대 링크로 온 사람: 들어가기 화면 (아니면 '초대되지 않은 계정')
    const code = rememberInviteFromUrl() ?? pendingInvite();
    if (code) return <div className="app"><Join code={code} user={auth.user} /></div>;
    return <div className="app"><Denied email={auth.user.email} /></div>;
  }
  if (auth.status === 'verify') return <div className="app"><VerifyEmail email={auth.user.email} /></div>;
  if (auth.status === 'error')
    return (
      <div className="app">
        <div className="center-screen" role="alert">
          <RestArt />
          <b style={{ fontSize: 18 }}>{auth.message}</b>
          <button className="btn" onClick={() => location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  // 떠 있는 보라: 목록 화면(홈·여행·피드·추억·가고 싶은 곳·우리 장소)에만. 상세·지도·입력 화면에서는 단추를 가리므로 뺀다
  const showFab = !hideNavFor(loc.pathname) && !loc.pathname.startsWith('/ask') && !loc.pathname.startsWith('/map') && !/^\/trips\/./.test(loc.pathname) && !loc.pathname.startsWith('/space') && !loc.pathname.startsWith('/admin');
  const hideNav = hideNavFor(loc.pathname);
  return (
    <DataProvider>
      <Suspense fallback={null}><Backdrop /></Suspense>
      <div className={'app' + (hideNav ? ' no-nav' : '') + (showFab ? ' has-fab' : '')}>
        <ScrollManager />
        <StatusBanner />
        <ErrorBoundary resetKey={loc.pathname}>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/trips/:id" element={<TripDetail />} />
              <Route path="/trips/:id/edit" element={<Record />} />
              <Route path="/record" element={<Record />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/study" element={<Study />} />
              <Route path="/phrases/:lang" element={<Phrases />} />
              <Route path="/plan" element={<Planner />} />
              <Route path="/plan/:id" element={<PlanPick />} />
              <Route path="/space" element={<Space />} />
              <Route path="/wishes" element={<Wishes />} />
              <Route path="/wishes/:id" element={<WishEdit />} />
              <Route path="/ask" element={<Ask />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/places" element={<Places />} />
              <Route path="/places/:id" element={<PlaceEdit />} />
              <Route path="/join/:code" element={<AlreadyIn />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        {!hideNav && <BottomNav />}
        {showFab && <AskFab />}
      </div>
    </DataProvider>
  );
}

/** 우하단에 떠 있는 보라 얼굴 + 말풍선: 누르면 물어보기(챗봇)로 */
function AskFab() {
  return (
    <Link to="/ask" className="ask-fab" aria-label="보라에게 물어봐" data-testid="ask-fab">
      <span className="ask-fab-bubble" aria-hidden="true">물어봐요</span>
      <img src="/art/bora-face.webp" alt="" width={80} height={80} decoding="async" />
    </Link>
  );
}

/** 입력 화면(기록·고치기·가고 싶은 곳·장소)에서는 아래 메뉴와 떠 있는 보라를 숨긴다 */
function hideNavFor(path: string) {
  return path.startsWith('/record') || path.endsWith('/edit') || /^\/(wishes|places)\/./.test(path) || path.startsWith('/study');
}

/** 이미 함께 쓰는 사람이 초대 링크를 열었을 때 */
function AlreadyIn() {
  const toast = useToast();
  useEffect(() => { clearPendingInvite(); toast('이미 함께 쓰고 있어요'); }, [toast]);
  return <Navigate to="/" replace />;
}
