import { useMemo, useState } from 'react';
import TransitStops from './TransitStops';
import { Link } from 'react-router-dom';
import { Icon, useToast } from './ui';
import { useHome } from '../lib/home';
import { straightKm } from '../lib/placeApps';
import { stopovers } from '../lib/stopover';
import { useTravelInfo } from '../lib/travelinfo';
import { computeStats, useTrips, useWishes } from '../lib/data';
import { useAuth } from '../lib/auth';
import { quickWish } from '../lib/wishActions';
import { placeParam, REGION_BY_CODE, regionLong } from '../lib/geo';

const touch = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

/** 차로 갈 때 가는 길에 들르기: 조금만 돌아가는 안 가 본 시·군 (집이 정해져 있을 때) */
export default function Stopovers({ destCode, trip }: { destCode: string; trip?: { id: string; firstDay: string | null } }) {
  const home = useHome();
  const info = useTravelInfo();
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const auth = useAuth();
  const toast = useToast();
  const dest = REGION_BY_CODE.get(destCode);
  const visited = useMemo(() => (trips ? computeStats(trips).cellVisits : new Map<string, number>()), [trips]);
  const list = useMemo(() => (home && dest && trips ? stopovers(home, { ...dest, code: dest.code }, visited, info) : []), [home, dest, trips, info, visited]);
  const [mode, setMode] = useState<'car' | 'transit'>('car');
  if (!home || !dest || straightKm(home, dest) < 60) return null;
  const add = async (code: string) => {
    if (auth.status !== 'ready') return;
    try { const { already } = await quickWish({ t: 'kr', code }, auth.user, wishes ?? []); toast(already ? '이미 담겨 있어요' : '가고 싶은 곳에 담았어요'); } catch { toast('담지 못했어요. 다시 해 주세요'); }
  };
  return (
    <div className="stopovers" data-testid="stopovers">
      <div className="seg" role="tablist" aria-label="들러 가기">
        <button role="tab" aria-selected={mode === 'car'} className={mode === 'car' ? 'on' : ''} onClick={() => setMode('car')}>자동차</button>
        <button role="tab" aria-selected={mode === 'transit'} className={mode === 'transit' ? 'on' : ''} onClick={() => setMode('transit')} data-testid="stopover-transit">대중교통</button>
      </div>
      {mode === 'transit' && <TransitStops from={home.code} to={dest.code} visited={visited} onWish={(c) => void add(c)} trip={trip} />}
      {mode === 'car' && !list.length && <span className="tiny muted">차로 조금만 돌아가면 들를 곳이 없어요</span>}
      {mode === 'car' && list.map((s) => {
        const r = REGION_BY_CODE.get(s.code)!;
        const nav = `nmap://route/car?slat=${home.lat}&slng=${home.lng}&sname=${encodeURIComponent(home.label)}&v1lat=${r.lat}&v1lng=${r.lng}&v1name=${encodeURIComponent(r.name)}&dlat=${dest.lat}&dlng=${dest.lng}&dname=${encodeURIComponent(dest.name)}&appname=borapin.web.app`;
        return (
          <div key={s.code} className="stopover-row" data-testid="stopover">
            <Link to={`/map?sel=${placeParam({ t: 'kr', code: s.code })}`} className="stopover-main">
              <b>{regionLong(s.code)}</b>
              <span className="tiny muted">{s.extraMin <= 5 ? '거의 안 돌아가요' : `약 ${s.extraMin}분 더`}{s.visited ? ' · 가 봤어요' : ' · 처음'}{s.theme ? ` · ${s.theme}` : ''}</span>
            </Link>
            {touch() && <a className="icon-btn" href={nav} aria-label={`${r.name} 들러 내비로 열기`}><Icon name="flag" size={15} /></a>}
            <button className="icon-btn" onClick={() => void add(s.code)} aria-label={`${r.name} 가고 싶은 곳에 담기`}><Icon name="pin" size={15} /></button>
          </div>
        );
      })}
      {mode === 'car' && list.length > 0 && <span className="tiny muted">시간은 직선거리로 어림한 값이에요</span>}
    </div>
  );
}
