import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { DataProvider } from './lib/store';
import { BottomNav, Logo, Spinner } from './components/ui';
import { ErrorBoundary, ScrollManager, StatusBanner } from './components/system';
import { Denied, Login, VerifyEmail } from './pages/Login';
import Home from './pages/Home';
import { preloadCheer } from './lib/celebrate';

// 홈 말고는 그 화면에 갈 때 불러온다 (첫 화면이 빨리 뜨게)
const Trips = lazy(() => import('./pages/Trips'));
const TripDetail = lazy(() => import('./pages/TripDetail'));
const Record = lazy(() => import('./pages/Record'));
const MapPage = lazy(() => import('./pages/MapPage'));
const Memories = lazy(() => import('./pages/Memories'));
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
  if (auth.status === 'loading') return <div className="app"><Spinner /></div>;
  if (auth.status === 'signedOut') return <div className="app bare"><Login /></div>;
  if (auth.status === 'denied') return <div className="app"><Denied email={auth.user.email} /></div>;
  if (auth.status === 'verify') return <div className="app"><VerifyEmail email={auth.user.email} /></div>;
  if (auth.status === 'error')
    return (
      <div className="app">
        <div className="center-screen" role="alert">
          <Logo size={48} />
          <b style={{ fontSize: 18 }}>{auth.message}</b>
          <button className="btn" onClick={() => location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  const hideNav = loc.pathname.startsWith('/record') || loc.pathname.endsWith('/edit') || /^\/(wishes|places)\/./.test(loc.pathname);
  return (
    <DataProvider>
      <div className={'app' + (hideNav ? ' no-nav' : '')}>
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
              <Route path="/space" element={<Space />} />
              <Route path="/wishes" element={<Wishes />} />
              <Route path="/wishes/:id" element={<WishEdit />} />
              <Route path="/ask" element={<Ask />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/places" element={<Places />} />
              <Route path="/places/:id" element={<PlaceEdit />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        {!hideNav && <BottomNav />}
      </div>
    </DataProvider>
  );
}
