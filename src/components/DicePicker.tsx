import { useEffect, useRef, useState } from 'react';
import { josa } from 'es-hangul';
import { Link, useNavigate } from 'react-router-dom';
import { ScenicPhoto } from './Scene';
import { photoForPlace } from '../lib/media';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import type { Stats } from '../lib/data';
import { GROUPS, placeLong, placeParam } from '../lib/geo';
import { candidates, THEMES, type Candidate } from '../lib/recommend';
import { monthsLabel, seasonFor, type SeasonData } from '../lib/seasons';
import type { TravelInfo } from '../lib/travelinfo';
import { quickWish } from '../lib/wishActions';
import type { Wish } from '../lib/types';
import WorldPicker from './WorldPicker';

/** 여행지 뽑기 (v21 주사위): 조건을 골라 한 곳을 뽑는다 */
export default function DicePicker({ stats, info, seasons, wishes, initialScope = 'kr' }: {
  stats: Stats | null;
  info: TravelInfo | null;
  seasons: SeasonData | null;
  wishes: Wish[];
  /** 처음 열 범위: 국내('kr') 또는 해외 도시('world') */
  initialScope?: string;
}) {
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [scope, setScope] = useState<string>(initialScope);
  const [theme, setTheme] = useState<string | null>(null);
  const [unvisited, setUnvisited] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState<Candidate | null>(null);
  const [none, setNone] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearInterval(timer.current), []);

  const roll = () => {
    const pool = candidates({ scope, unvisitedOnly: unvisited, theme: scope === 'world' ? null : theme, stats, info, wishes });
    setNone(pool.length === 0);
    if (!pool.length) return setFace(null);
    setRolling(true);
    let n = 0;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setFace(pool[Math.floor(Math.random() * pool.length)]);
      if (++n >= 9) {
        window.clearInterval(timer.current);
        setRolling(false);
      }
    }, 70);
  };

  const add = async () => {
    if (!face || auth.status !== 'ready') return;
    const f = face;
    setFace(null);
    try {
      const { id, already } = await quickWish(f.place, auth.user, wishes);
      toast(already ? '이미 담겨 있어요' : `${josa(f.name, '을/를')} 가고 싶은 곳에 담았어요`, { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch {
      setFace(f);
      toast('담지 못했어요. 다시 해 주세요');
    }
  };

  const season = face ? seasonFor(seasons, face.place) : null;
  return (
    <div className="card white dice" data-testid="dice">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <b style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name={scope === 'world' ? 'globe' : 'dice'} size={18} />{scope === 'world' ? '해외 도시 고르기' : '여행지 뽑기'}</b>
        <label className="tiny" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={unvisited} onChange={(e) => setUnvisited(e.target.checked)} />안 가본 곳만
        </label>
      </div>
      <select className="select" aria-label="뽑을 범위" value={scope} onChange={(e) => setScope(e.target.value)}>
        <option value="kr">국내 전체</option>
        {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.id === 'jngj' ? '광주·전남' : g.name}</option>)}
        <option value="world">해외 도시</option>
      </select>
      {scope === 'world' ? (
        <WorldPicker stats={stats} wishes={wishes} unvisitedOnly={unvisited} />
      ) : (
        <div className="chips">
          {THEMES.map((t) => (
            <button key={t.id} type="button" className={'chip' + (theme === t.id ? ' soft-on' : '')} onClick={() => setTheme(theme === t.id ? null : t.id)}>{t.label}</button>
          ))}
        </div>
      )}
      {scope !== 'world' && <button className="btn" onClick={roll} disabled={rolling} data-testid="dice-roll"><Icon name="dice" size={18} />{face ? '다시 뽑기' : '뽑기'}</button>}
      {scope !== 'world' && none && <div className="small muted">조건에 맞는 곳이 없어요. 조건을 바꿔 보세요.</div>}
      {scope !== 'world' && face && (
        <div className={'dice-face' + (rolling ? ' rolling' : '')} data-testid="dice-face" aria-live="polite">
          {!rolling && photoForPlace(face.place) && <ScenicPhoto photo={photoForPlace(face.place)} className="photo-banner" />}
          <div style={{ fontSize: 20, fontWeight: 800 }}>{placeLong(face.place)}</div>
          {face.theme && <div className="small" style={{ color: '#33248a', fontWeight: 600 }}>{face.theme}</div>}
          {face.spots && face.spots.length > 0 && <div className="tiny muted">{face.spots.slice(0, 4).join(' · ')}</div>}
          {season && <div className="tiny" style={{ color: '#b4472c' }}>가기 좋은 때 {monthsLabel(season.m)}</div>}
          {!rolling && (
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="btn sm coral" onClick={add} data-testid="dice-add"><Icon name="pin" size={15} stroke={2.2} />담기</button>
              <Link to={`/map?sel=${placeParam(face.place)}`} className="btn sm ghost">지도에서 보기</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
