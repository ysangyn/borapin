import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { BottomNav, Spinner } from './components/ui';
import { Denied, Login } from './pages/Login';
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Record from './pages/Record';
import MapPage from './pages/MapPage';
import Memories from './pages/Memories';
import Space from './pages/Space';
import Wishes from './pages/Wishes';
import WishEdit from './pages/WishEdit';
import Places from './pages/Places';
import PlaceEdit from './pages/PlaceEdit';
import Ask from './pages/Ask';

export default function App() {
  const auth = useAuth();
  const loc = useLocation();
  if (auth.status === 'loading') return <div className="app"><Spinner /></div>;
  if (auth.status === 'signedOut') return <div className="app"><Login /></div>;
  if (auth.status === 'denied') return <div className="app"><Denied email={auth.user.email} /></div>;
  const hideNav = loc.pathname.startsWith('/record') || loc.pathname.endsWith('/edit') || /^\/(wishes|places)\/./.test(loc.pathname);
  return (
    <div className="app">
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
        <Route path="/places" element={<Places />} />
        <Route path="/places/:id" element={<PlaceEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}
