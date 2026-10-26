import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { josa } from 'es-hangul';
import { ScenicPhoto } from './Scene';
import { useMapChoice } from './MapChoice';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import type { Stats } from '../lib/stats';
import { placeLabel, placeLong, placeParam } from '../lib/geo';
import { PHOTOS } from '../lib/media';
import { isGoodNow, monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { dailyShuffle, samePlace } from '../lib/wishes';
import { quickWish } from '../lib/wishActions';
import type { Wish } from '../lib/types';
import { festivalPeriod, isOngoing, upcomingFestivals, useFestivals } from '../lib/festivals';

/**
 * '이번 달 가볼 만한 곳' 큰 사진 카드: 미리 고른 여행지 사진 중
 * 이번 달이 좋은 곳 → 안 가본 곳 → 아직 안 담은 곳을 먼저, 날마다 한 곳.
 */
/** 오늘의 추천 사진 한 장 (홈 지도도 이곳 둘레를 보여 준다) */
export function useMonthPick(stats: Stats | null, wishes: Wish[]) {
  const seasons = useSeasons();
  const festData = useFestivals();
  const month = new Date().getMonth() + 1;
  return useMemo(() => {
    const list = PHOTOS.filter((p) => p.place?.t === 'kr');
    if (!list.length) return null;
    const score = (p: (typeof list)[number]) => {
      const s = seasonFor(seasons, p.place!);
      const code = p.place!.t === 'kr' ? p.place!.code : '';
      const fest = upcomingFestivals(festData, code, new Date(), 40).length ? 3 : 0;
      return fest + (isGoodNow(s, month) ? 2 : 0) + (stats?.cellVisits.has(code) ? 0 : 2) + (wishes.some((w) => samePlace(w.place, p.place!)) ? 0 : 1);
    };
    const shuffled = dailyShuffle(list, 'month-pick');
    return [...shuffled].sort((a, b) => score(b) - score(a))[0];
  }, [seasons, stats, wishes, month, festData]);
}

export default function MonthPick({ stats, wishes }: { stats: Stats | null; wishes: Wish[] }) {
  const seasons = useSeasons();
  const festData = useFestivals();
  const info = useTravelInfo();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const month = new Date().getMonth() + 1;
  const pick = useMonthPick(stats, wishes);
  if (!pick?.place) return null;
  const place = pick.place;
  const s = seasonFor(seasons, place);
  const good = isGoodNow(s, month);
  const theme = place.t === 'kr' ? info?.cells[place.code]?.main.theme : undefined;
  const wished = wishes.some((w) => samePlace(w.place, place));
  const fest = place.t === 'kr' ? upcomingFestivals(festData, place.code, new Date(), 40)[0] : undefined;
  const add = async () => {
    if (auth.status !== 'ready') return;
    try {
      const { id, already } = await quickWish(place, auth.user, wishes);
      toast(already ? '이미 담겨 있어요' : `${josa(placeLabel(place), '을/를')} 담았어요`, { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch {
      toast('담지 못했어요. 다시 해 주세요');
    }
  };
  const [openMap, mapChoice] = useMapChoice();
  return (
    <section className="month-pick" data-testid="month-pick">
      <ScenicPhoto photo={pick} className="month-pick-photo" alt={pick.name} label="top" onTap={(p) => openMap({ name: p.name, search: true, wish: { place, kind: 'spot' } })} />
      {mapChoice}
      <div className="month-pick-copy">
        <span className="month-pick-eyebrow">{good ? `${month}월에 가기 좋은 곳` : '오늘의 여행지'}</span>
        <b className="month-pick-name">{placeLong(place)}</b>
        {theme && <span className="month-pick-theme">{theme}</span>}
        {fest && <span className="month-pick-fest" data-testid="month-pick-festival">{isOngoing(fest) ? '지금 열리는 축제' : '다가오는 축제'} · {fest.t} {festivalPeriod(fest)}</span>}
        {s && <span className="month-pick-months">가기 좋은 때 {monthsLabel(s.m)}</span>}
        <div className="month-pick-actions">
          {wished ? (
            <Link to="/wishes" className="btn sm coral-soft"><Icon name="pin" size={15} stroke={2.2} />담겨 있어요</Link>
          ) : (
            <button className="btn sm coral" onClick={add}><Icon name="pin" size={15} stroke={2.2} />담기</button>
          )}
          <Link to={`/map?sel=${placeParam(place)}`} className="btn sm glass" data-testid="month-pick-detail">자세히</Link>
          <Link to={`/record?place=${placeParam(place)}`} className="btn sm glass" data-testid="month-pick-record">여기 기록</Link>
        </div>
      </div>
    </section>
  );
}
