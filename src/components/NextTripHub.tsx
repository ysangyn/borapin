import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, useBusy, useToast } from './ui';
import { Hearts, wishTitle } from './WishCard';
import WishRolling from './WishRolling';
import { useAuth } from '../lib/auth';
import { updateWish, type Stats } from '../lib/data';
import { placeLabel, placeLong, placeParam, REGION_BY_CODE } from '../lib/geo';
import { photoForPlace } from '../lib/media';
import { bothWant, samePlace, sortWishes, wishState } from '../lib/wishes';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { useFestivals, upcomingFestivals, festivalPeriod, isOngoing } from '../lib/festivals';
import { flightLinks } from '../lib/flights';
import { newsAgo, useNews } from '../lib/news';
import { answerAsk, questionFor, questionText, useTodayAsk } from '../lib/asks';
import { useStudy } from '../lib/study/store';
import HomeRoute from './HomeRoute';
import { alarmFor, visaFor } from '../lib/abroad';
import Stopovers from './Stopovers';
import { summary, todaySet, ymd } from '../lib/study/srs';
import { everyoneLabel, memberNames } from '../lib/members';
import { upcomingTrips } from '../lib/stats';
import { cityFor, flyLabel, tzLabel, useWorld } from '../lib/world';
import { LANG_LABEL, phraseLangFor } from '../lib/phrases';
import { accessLine } from '../lib/transport';
import { tzText } from '../lib/tz';
import { useOpenDrafts } from '../lib/planDrafts';
import { useAuth as useAuthHub } from '../lib/auth';
import { dday, formatWhen } from '../lib/dates';
import type { Place, Trip, Wish } from '../lib/types';

/**
 * 여행과 여행 사이의 홈 묶음 "다음 여행 준비".
 * 다음은 어디 → 오늘의 한 질문 → 오늘의 영어 → 가는 길.
 * 기준 장소는 하나: 예정된 여행이 있으면 그 여행, 없으면 가고 싶은 곳 1순위(둘 다 원하는 곳 먼저).
 * 질문·가는 길은 모두 그 장소에 매달린다. 가고 싶은 곳이 하나도 없으면 '3곳만 담아볼까요'가 첫 블록.
 */
export default function NextTripHub({ wishes, trips, stats, excludeTripId = null }: { wishes: Wish[]; trips: Trip[]; stats: Stats | null; excludeTripId?: string | null }) {
  // 홈 위 카드가 이미 맡은 여행(떠나기 전·여행 중·막 다녀옴)은 여기서 또 보여 주지 않는다
  const upcoming = useMemo(() => upcomingTrips(trips).filter((t) => t.id !== excludeTripId), [trips, excludeTripId]);
  const nextTrip = upcoming[0] ?? null;
  const active = useMemo(() => {
    const list = sortWishes(wishes.filter((w) => wishState(w, trips).kind === 'wish'));
    return [...list.filter(bothWant), ...list.filter((w) => !bothWant(w))];
  }, [wishes, trips]);
  const firstWish = active[0] ?? null;
  const anchor: { place: Place; wish: Wish | null } | null = nextTrip?.places[0]
    ? { place: nextTrip.places[0], wish: wishes.find((w) => w.tripId === nextTrip.id) ?? null }
    : firstWish ? { place: firstWish.place, wish: firstWish } : null;
  return (
    <section className="hub" data-testid="next-hub" data-anchor={nextTrip ? 'trip' : firstWish ? 'wish' : 'none'}>
      <div className="hub-head">
        <h2 className="h2 hub-title">다음 여행 준비</h2>
        <Link to="/wishes" className="small" style={{ fontWeight: 700 }}>{active.length ? `가고 싶은 곳 ${active.length}곳` : '여행지 뽑기'}</Link>
      </div>
      <DraftNudge />
      {nextTrip ? <NextTripHero trip={nextTrip} more={upcoming.slice(1, 3)} wishes={active.slice(0, 2)} />
        : firstWish ? <WhereNext top={active.slice(0, 3)} />
        : <WishRolling wishes={wishes} trips={trips} stats={stats} bare />}
      {anchor && <TodayAsk place={anchor.place} wish={anchor.wish} />}
      {anchor && <WayThere place={anchor.place} months={anchor.wish?.months} wishId={anchor.wish?.id ?? null} />}
      <TodayEnglish />
    </section>
  );
}

/** 1-a. 예정된 여행이 있으면 그 여행이 '다음' — 날짜가 없으면 정하라고 권한다 */
function NextTripHero({ trip, more, wishes }: { trip: Trip; more: Trip[]; wishes: Wish[] }) {
  const ph = trip.places[0] ? photoForPlace(trip.places[0]) : null;
  const d = dday(trip.when);
  const undated = trip.when.p === 'unknown' || !trip.when.y;
  return (
    <div className="hub-block" data-testid="hub-where">
      <Link to={`/trips/${trip.id}`} className={'hub-first' + (ph ? ' has-photo' : '')} style={ph ? { backgroundImage: `url(${ph.src.s})` } : undefined} data-testid="hub-first">
        <span className="hub-first-copy">
          <span className="tiny hub-first-eyebrow">다음 여행{d ? ` · ${d}` : ''}</span>
          <b>{trip.title}</b>
          <span className="small hub-first-meta">{undated ? '날짜는 아직 안 정했어요' : formatWhen(trip.when)}{trip.places.length > 1 ? ` · ${trip.places.map(placeLabel).join(' · ')}` : ''}</span>
        </span>
        <Icon name="chev" size={18} />
      </Link>
      {(more.length > 0 || wishes.length > 0) && (
        <div className="hub-others">
          {more.map((t) => (
            <Link key={t.id} to={`/trips/${t.id}`} className="hub-other">
              <span className="hub-other-name">{t.title}</span>
              <span className="tiny muted">{t.when.p === 'unknown' ? '날짜 미정' : formatWhen(t.when)}</span>
            </Link>
          ))}
          {wishes.slice(0, Math.max(0, 2 - more.length)).map((w, i) => (
            <Link key={w.id} to={`/wishes/${w.id}`} className="hub-other">
              <span className="hub-other-name">{wishTitle(w)}</span>
              <span className="tiny muted">{i === 0 && more.length === 0 ? '그다음은 여기 · ' : ''}{bothWant(w) ? everyoneLabel() : (w.wantedBy ?? []).join('·') || '아직 하트가 없어요'}</span>
            </Link>
          ))}
        </div>
      )}
      {undated && <Link to={`/trips/${trip.id}/edit`} className="btn soft block" data-testid="hub-set-date">날짜 정하기</Link>}
    </div>
  );
}

/** 1-b. 다음은 어디? — 둘 다 원하는 곳 먼저, 1순위는 사진 크게 */
function WhereNext({ top }: { top: Wish[] }) {
  const first = top[0];
  const ph = photoForPlace(first.place);
  const both = bothWant(first);
  const waiting = memberNames().filter((n) => !(first.wantedBy ?? []).includes(n));
  return (
    <div className="hub-block" data-testid="hub-where">
      <Link to={`/wishes/${first.id}`} className={'hub-first' + (ph ? ' has-photo' : '')} style={ph ? { backgroundImage: `url(${ph.src.s})` } : undefined} data-testid="hub-first">
        <span className="hub-first-copy">
          <span className="tiny hub-first-eyebrow">{both ? `${everyoneLabel()} · 다음은 여기` : '지금 1순위'}</span>
          <b>{wishTitle(first)}</b>
          <span className="small hub-first-meta"><Hearts wantedBy={first.wantedBy} />{!both && waiting.length > 0 && <span>{waiting.join('·')}의 하트를 기다려요</span>}</span>
        </span>
        <Icon name="chev" size={18} />
      </Link>
      {top.length > 1 && (
        <div className="hub-others">
          {top.slice(1).map((w) => (
            <Link key={w.id} to={`/wishes/${w.id}`} className="hub-other">
              <span className="hub-other-name">{wishTitle(w)}</span>
              <span className="tiny muted">{bothWant(w) ? everyoneLabel() : (w.wantedBy ?? []).join('·') || '아직 하트가 없어요'}</span>
            </Link>
          ))}
        </div>
      )}
      {both && <Link to={`/record?status=planned&place=${placeParam(first.place)}&wish=${first.id}`} className="btn block" data-testid="hub-confirm">{placeLabel(first.place)} 여행 만들기</Link>}
    </div>
  );
}

/** 2. 오늘의 한 질문 — 모두 답하면 서로의 답이 열린다 */
function TodayAsk({ place: anchorPlace, wish }: { place: Place; wish: Wish | null }) {
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const day = ymd(new Date());
  const q = questionFor(day);
  const doc = useTodayAsk(day);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  // 답을 쓰는 중(또는 남기는 중)에는 새 버전 자동 새로 고침이 기다린다 (쓰던 답이 날아가지 않게)
  useBusy(!!text.trim() || busy);
  const uid = auth.status === 'ready' ? auth.user.uid : '';
  const answers = doc?.answers ?? {};
  const mine = answers[uid];
  const others = Object.entries(answers).filter(([u]) => u !== uid);
  const need = Math.max(1, memberNames().length);
  const opened = Object.keys(answers).length >= need;
  // 둘의 답이 같으면(띄어쓰기·기호 무시) 작은 기쁨 하나
  const norm = (t: string) => t.replace(/[\s.,!~·]/g, '').toLowerCase();
  const matched = opened && need > 1 && new Set(Object.values(answers).map((a) => norm(a.text))).size === 1;
  // 첫 답이 질문의 장소를 고정한다 (둘이 다른 1순위를 보고 있어도 같은 질문)
  const place = doc?.place ?? anchorPlace;
  const submit = async () => {
    if (auth.status !== 'ready' || !text.trim() || busy) return;
    setBusy(true);
    try {
      await answerAsk(day, q, place, text, auth.user, doc ?? null);
      toast(need > 1 && !opened ? '답을 남겼어요 · 상대도 답하면 서로 보여요' : '답을 남겼어요');
      setText('');
    } catch (e) { console.warn(e); toast('남기지 못했어요. 다시 해 주세요'); }
    finally { setBusy(false); }
  };
  // 답을 가고 싶은 곳 메모(먹을 것·가볼 곳·해볼 것)에 넣기 — 메모를 둘 가고 싶은 곳이 있을 때만
  const canSave = !!q.save && !!wish && samePlace(wish.place, place);
  const saveToWish = async (t: string) => {
    if (!q.save || !wish) return;
    const list = wish[q.save] ?? [];
    if (list.includes(t)) return toast('이미 메모에 있어요');
    try { await updateWish(wish.id, { [q.save]: [...list, t] }); toast(`${placeLabel(wish.place)} 메모에 넣었어요`, { label: '보기', onClick: () => nav(`/wishes/${wish.id}`) }); } catch { toast('넣지 못했어요. 다시 해 주세요'); }
  };
  return (
    <div className="hub-block card white hub-ask" data-testid="hub-ask">
      <div className="hub-label">오늘의 한 질문{matched && <span className="tag coral" data-testid="hub-ask-matched">마음이 통했어요 💜</span>}</div>
      <p className="hub-q">{questionText(q, place)}</p>
      {!mine ? (
        <form className="hub-ask-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <input className="input" aria-label="오늘의 질문 답" placeholder="한 줄이면 돼요" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="btn" disabled={!text.trim() || busy} data-testid="hub-ask-send">답하기</button>
        </form>
      ) : (
        <div className="hub-answers">
          <div className="hub-answer mine"><span className="tiny muted">나</span><span className="hub-answer-text">{mine.text}</span>{canSave && <button className="link-btn" onClick={() => saveToWish(mine.text)}>메모에 넣기</button>}</div>
          {opened ? others.map(([u, a]) => (
            <div key={u} className="hub-answer" data-testid="hub-answer-other"><span className="tiny muted">{a.name}</span><span className="hub-answer-text">{a.text}</span>{canSave && <button className="link-btn" onClick={() => saveToWish(a.text)}>메모에 넣기</button>}</div>
          )) : (
            <div className="hub-answer locked" data-testid="hub-ask-waiting"><Icon name="lock" size={14} /><span className="tiny muted">상대가 답하면 서로의 답이 열려요</span></div>
          )}
        </div>
      )}
    </div>
  );
}

/** 3. 오늘의 영어 — 한 문장 미리 보기 + 진도 */
function TodayEnglish() {
  const { data } = useStudy();
  const today = useMemo(() => new Date(), []);
  const set = useMemo(() => (data ? todaySet(data.progress, today) : []), [data, today]);
  const sum = useMemo(() => (data ? summary(data.progress, data.days, today) : null), [data, today]);
  const doneToday = !!data?.days.includes(ymd(today));
  // 홈 미리 보기는 오늘의 새 문장(날마다 바뀜). 밀린 복습이 있어도 같은 문장이 며칠씩 걸려 있지 않게
  const reviews = data ? set.filter((i) => data.progress[i.id]).length : 0;
  const first = set.find((i) => !data?.progress[i.id]) ?? set[0];
  return (
    <Link to="/study" className="hub-block card white hub-english" data-testid="hub-english">
      <div className="hub-label">
        오늘의 영어
        {sum && sum.streak > 0 && <span className="tag violet">{sum.streak}일째</span>}
        {doneToday && <span className="tag"><Icon name="check" size={12} stroke={2.4} />오늘 했어요</span>}
      </div>
      {!data ? (
        <div className="skeleton-text" aria-busy="true" style={{ width: '70%' }} />
      ) : first ? (
        <>
          <div className="hub-en">{first.en}</div>
          <div className="small muted">{first.ko}</div>
          <div className="tiny muted hub-english-foot">{doneToday ? '더 하기' : '시작하기'} · {set.length}문장 · 90초{reviews ? ` · 복습 ${reviews}` : ''}{sum && sum.learned > 0 ? ` · 외운 문장 ${sum.learned}` : ''}</div>
        </>
      ) : (
        <div className="small muted">오늘 몫을 다 했어요. 내일 또 봐요!</div>
      )}
    </Link>
  );
}

/** 4. 가는 길 — 가기 좋은 때 · 축제 · 항공권 · 소식 한 줄 (바깥 링크는 여기만) */
function WayThere({ place, months, wishId }: { place: Place; months?: number[]; wishId?: string | null }) {
  const nav = useNavigate();
  const seasons = useSeasons();
  const fest = useFestivals();
  const s = seasonFor(seasons, place, months);
  const f = place.t === 'kr' ? upcomingFestivals(fest, place.code, new Date(), 60)[0] : undefined;
  const flights = flightLinks(place, s?.m[0] ?? null);
  const news = useNews(place);
  const world = useWorld();
  const city = cityFor(world, place);
  const good = news?.[0] ?? null;
  if (!s && !f && !flights && !good && !city && !accessLine(place)) return null;
  return (
    <div className="hub-block card white" data-testid="hub-way">
      <div className="hub-label">{placeLong(place)} 가는 길</div>
      <div className="hub-way-rows">
        {s && <button className="hub-way-row" onClick={() => nav(`/map?sel=${placeParam(place)}`)}><Icon name="sun" size={16} /><span>가기 좋은 때 <b>{monthsLabel(s.m)}</b>{s.why ? ` · ${s.why}` : ''}</span></button>}
        {f && <button className="hub-way-row" onClick={() => nav(`/map?sel=${placeParam(place)}`)}><Icon name="flag" size={16} /><span>{isOngoing(f) ? '지금 열리는 축제' : '다가오는 축제'} <b>{f.t}</b> · {festivalPeriod(f)}</span></button>}
        {place.t === 'kr' && REGION_BY_CODE.get(place.code) && <div className="hub-way-row" style={{ cursor: 'default' }}><Icon name="home" size={16} /><HomeRoute to={{ name: placeLabel(place), lat: REGION_BY_CODE.get(place.code)!.lat, lng: REGION_BY_CODE.get(place.code)!.lng }} note="시·군 가운데까지" /></div>}
        {place.t === 'kr' && <Stopovers destCode={place.code} />}
        {place.t === 'kr' && accessLine(place) && <button className="hub-way-row" onClick={() => nav(`/map?sel=${placeParam(place)}`)} data-testid="hub-access"><Icon name="pin" size={16} /><span>가는 길 <b>{accessLine(place)}</b></span></button>}
        {city && <button className="hub-way-row" onClick={() => nav(wishId ? `/wishes/${wishId}` : `/map?sel=${placeParam(place)}`)} data-testid="hub-city"><Icon name="globe" size={16} /><span>{city.cur} · {city.lang} · 콘센트 {city.plug} · {tzText(place) || tzLabel(city.tz)}</span></button>}
        {city && <button className="hub-way-row" onClick={() => nav(wishId ? `/wishes/${wishId}` : `/map?sel=${placeParam(place)}`)}><Icon name="shield" size={16} /><span>입국 <b>{visaFor(city.c)?.text ?? city.entry}</b>{alarmFor(city.c) ? <> · 여행경보 <b className={alarmFor(city.c)!.lvl >= 3 ? 'alarm-high' : ''}>{alarmFor(city.c)!.text}</b></> : null} · 떠나기 전 확인</span></button>}
        {city && phraseLangFor(city.lang) && phraseLangFor(city.lang) !== 'en' && <button className="hub-way-row" onClick={() => nav(`/phrases/${phraseLangFor(city.lang)}?city=${encodeURIComponent(city.city)}`)} data-testid="hub-phrases"><Icon name="play" size={16} /><span>{LANG_LABEL[phraseLangFor(city.lang)!]} 한마디 30문장 · 인사·식당·길</span></button>}
        {flights && <a className="hub-way-row" href={flights.skyscanner} target="_blank" rel="noreferrer"><Icon name="external" size={16} /><span>항공권 보기 · {flights.label} · 인천에서 {city ? flyLabel(city.fly) : ''}{s ? ` · ${s.m[0]}월` : ''}</span></a>}
        {good && <a className="hub-way-row" href={good.link} target="_blank" rel="noreferrer" data-testid="hub-news"><Icon name="feed" size={16} /><span className="hub-news-title">{good.title}<span className="tiny muted"> · {good.source}{good.at ? ` · ${newsAgo(good.at)}` : ''}</span></span></a>}
      </div>
    </div>
  );
}

/** 고르는 중인 여행 계획: 상대가 후보를 골라 두었거나, 내가 하트를 기다리는 중 */
function DraftNudge() {
  const drafts = useOpenDrafts();
  const auth = useAuthHub();
  const uid = auth.status === 'ready' ? auth.user.uid : '';
  const d = drafts?.[0];
  if (!d) return null;
  const mineDone = (d.hearts[uid] ?? []).length > 0;
  const text = d.by.uid !== uid && !mineDone ? `${d.by.name}이(가) 여행 후보 ${d.cands.length}곳을 골라 뒀어요` : mineDone ? '여행 후보 · 상대 하트를 기다리는 중' : '고르던 여행 후보가 있어요';
  return (
    <Link to={`/plan/${d.id}`} className="card coral-soft draft-nudge" data-testid="draft-nudge">
      <Icon name="heart" size={18} stroke={2.2} />
      <span style={{ flex: 1, minWidth: 0 }}><b>{text}</b><span className="tiny muted" style={{ display: 'block' }}>{d.cands.map((c) => placeLabel(c.place)).join(' · ')}</span></span>
      <Icon name="chev" size={16} />
    </Link>
  );
}
