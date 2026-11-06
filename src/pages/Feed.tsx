import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../components/ui';
import PhotoImg from '../components/PhotoImg';
import { usePlaces, useTrips, useWishes } from '../lib/data';
import { usePhotos } from '../lib/photos';
import { useAllNotes } from '../lib/tripExtras';
import { ago, buildFeed, dayBand, dayId, monthCells, weekLine, type FeedItem } from '../lib/feed';
import { tileText } from '../components/TripRow';
import { placeLabel, placeLong } from '../lib/geo';
import { KIND_LABEL, VERDICT_LABEL } from '../lib/placeRecs';
import { toneOf } from '../lib/members';
import { useAuth, displayName } from '../lib/auth';
import { markFeedSeen } from '../lib/feedSeen';
import { openSlideshow } from '../components/slideshow';
import { wishTitle } from '../components/WishCard';
import QuickUpload from '../components/QuickUpload';
import { photoForPlace } from '../lib/media';
import { heartKey, toggleHeart, useHearts, type Heart } from '../lib/hearts';
import { asksForFeed, useRecentAsks } from '../lib/asks';
import { memberNames, spaceTitle } from '../lib/members';
import { localDate } from '../lib/dates';
import { withIGa } from '../lib/ko';

/** 피드: 둘이 최근에 남긴 사진·글·장소·핀·가고 싶은 곳을 시간순으로. 둘의 소식만 (여행 소식은 홈 묶음·지역 창에) */
export default function Feed() {
  const auth = useAuth();
  const { trips } = useTrips();
  const { photos } = usePhotos();
  const { places: recs } = usePlaces();
  const { wishes } = useWishes();
  const notes = useAllNotes();
  const hearts = useHearts();
  const asks = useRecentAsks();
  const ready = !!(trips && photos && recs && wishes && notes);
  const all = useMemo(() => (ready ? buildFeed({ trips: trips!, photos: photos!, notes: notes!, recs: recs!, wishes: wishes!, asks: asksForFeed(asks, memberNames().length) }, 400) : null), [ready, trips, photos, notes, recs, wishes, asks]);
  const [shown, setShown] = useState(40);
  const items = all ? all.slice(0, shown) : null;
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const week = useMemo(() => (all ? weekLine(all) : null), [all]);

  // 들어와서 봤으면 '새 소식' 표시를 지운다
  useEffect(() => {
    if (items && hearts) markFeedSeen(Math.max(items[0]?.at ?? 0, Date.now()));
  }, [items, hearts]);

  /** 달력에서 날을 누르면 그날 띠로 (아직 안 펼친 날이면 거기까지 펼친다) */
  const goDay = (id: string) => {
    if (!all) return;
    const at = all.findIndex((it) => dayId(it.at) === id);
    if (at < 0) return;
    if (at >= shown) setShown(at + 10);
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('day-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })));
  };

  return (
    <>
      <TopBar title="여행 일기장" right={<Link to="/memories" className="btn sm soft" data-testid="to-memories">추억 돌아보기</Link>} />
      <div className="page feed" style={{ paddingTop: 4 }} data-testid="feed">
        {trips && trips.length > 0 && <QuickUpload trips={trips} />}
        {week && (
          <div className="card white diary-week" data-testid="feed-week">
            <span className="diary-stamp jua" aria-hidden="true">{new Date().getMonth() + 1}월</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span className="hand" style={{ fontSize: 19, lineHeight: 1.2 }}>{week.title}</span>
              {week.sub && <span className="tiny muted">{week.sub}</span>}
            </span>
          </div>
        )}
        {all && all.length > 0 && <MonthStrip items={all} onDay={goDay} />}
        {!items && <div className="skeleton-list" aria-busy="true"><i /><i /><i /></div>}
        {items && items.length === 0 && (
          <div className="card art-row" data-testid="feed-empty">
            <img src="/art/bora-camera.webp" alt="" aria-hidden="true" width={360} height={623} decoding="async" />
            <span>
              <b style={{ display: 'block', fontSize: 17, marginBottom: 4 }}>아직 소식이 없어요</b>
              <span className="small muted" style={{ display: 'block', marginBottom: 10 }}>기록을 남기거나 가고 싶은 곳을 담으면 여기에 한 쪽씩 쌓여요.</span>
              <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Link to="/record" className="btn sm" data-testid="feed-empty-record">기록 남기기</Link>
                <Link to="/wishes" className="btn sm soft" data-testid="feed-empty-wish">가고 싶은 곳 담기</Link>
              </span>
            </span>
          </div>
        )}
        {items && items.length > 0 && (
          <ol className="feed-list">
            {items.map((it, i) => {
              const head = dayBand(it.at);
              const prev = i > 0 ? dayBand(items[i - 1].at) : null;
              return (
                <li key={keyOf(it)}>
                  {head !== prev && <div className="feed-day" id={'day-' + dayId(it.at)} data-testid="feed-day"><span className="jua">{head}</span><i aria-hidden="true" /></div>}
                  <FeedRow item={it} i={i} me={me} heart={hearts?.get(heartKey(it))} onHeart={auth.status === 'ready' ? () => toggleHeart(heartKey(it), hearts?.get(heartKey(it)), auth.user).catch((e) => console.warn(e)) : undefined} uid={auth.status === 'ready' ? auth.user.uid : ''} />
                </li>
              );
            })}
          </ol>
        )}
        {all && items && all.length > items.length && <button type="button" className="btn soft" onClick={() => setShown((n) => n + 40)} data-testid="feed-more">지난 이야기 더 보기</button>}
        {all && items && items.length > 0 && all.length <= items.length && <p className="hand diary-end">여기까지가 {spaceTitle() === '우리' ? '나의' : '우리'} 이야기</p>}
      </div>
    </>
  );
}

/** 이번 달 달력 띠: 소식이 있는 날은 그날 사진(없으면 점), 누르면 그날로 */
function MonthStrip({ items, onDay }: { items: FeedItem[]; onDay: (id: string) => void }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [open, setOpen] = useState(false);
  const oldest = items.length ? new Date(items[items.length - 1].at) : now;
  const canPrev = ym.y * 12 + ym.m > oldest.getFullYear() * 12 + oldest.getMonth();
  const canNext = ym.y * 12 + ym.m < now.getFullYear() * 12 + now.getMonth();
  const step = (d: number) => setYm(({ y, m }) => { const t = y * 12 + m + d; return { y: Math.floor(t / 12), m: t % 12 }; });
  const { lead, days } = monthCells(items, ym.y, ym.m);
  const today = dayId(Date.now());
  const active = days.filter((d) => d.n > 0);
  // 접었을 때는 한 주만: 이번 달이면 오늘이 든 주, 지난달이면 마지막으로 남긴 날이 든 주
  const focus = ym.y === now.getFullYear() && ym.m === now.getMonth() ? now.getDate() : active[active.length - 1]?.day ?? 1;
  const row = Math.floor((lead + focus - 1) / 7);
  const cells: ({ day: number; id: string; n: number; photoId?: string } | null)[] = [...Array.from({ length: lead }, () => null), ...days];
  const shown = open ? cells : cells.slice(row * 7, row * 7 + 7);
  return (
    <div className="card white diary-month" data-testid="feed-month">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button type="button" className="diary-nav" onClick={() => step(-1)} disabled={!canPrev} aria-label="지난달">‹</button>
          <b className="jua" style={{ fontSize: 17 }}>{ym.y !== now.getFullYear() ? `${ym.y}년 ` : ''}{ym.m + 1}월</b>
          <button type="button" className="diary-nav" onClick={() => step(1)} disabled={!canNext} aria-label="다음 달">›</button>
        </span>
        <button type="button" className="link-btn tiny" onClick={() => setOpen((v) => !v)} aria-expanded={open} data-testid="feed-month-toggle">
          {active.length ? `남긴 날 ${active.length} · ` : ''}{open ? '접기' : '한 달 보기'}
        </button>
      </div>
      <div className="diary-grid">
        {['일', '월', '화', '수', '목', '금', '토'].map((w) => <span key={w} className="diary-wd">{w}</span>)}
        {shown.map((d, i) => d ? (
          <button key={d.id} type="button" className={'diary-cell' + (d.n ? ' has' : '') + (d.photoId ? ' photo' : '') + (d.id === today ? ' today' : '')} disabled={!d.n} onClick={() => onDay(d.id)} aria-label={`${ym.m + 1}월 ${d.day}일${d.n ? ` 소식 ${d.n}` : ''}`} data-testid={d.n ? 'feed-month-day' : undefined}>
            {d.photoId && <PhotoImg id={d.photoId} />}
            <span>{d.day}</span>
          </button>
        ) : <span key={'b' + i} />)}
      </div>
    </div>
  );
}

const keyOf = (it: FeedItem) => `${it.kind}:${it.at}:${it.kind === 'photos' ? it.photos[0].id : it.kind === 'note' ? it.note.id : it.kind === 'place' ? it.rec.id : it.kind === 'wish' ? it.wish.id : it.kind === 'ask' ? `${it.day}:${it.uid}` : it.kind === 'wishes' ? `${it.by}:${it.wishes[0].id}` : it.trip.id}`;

function Who({ name, me }: { name: string; me: string }) {
  const tone = toneOf(name);
  return (
    <span className="feed-who">
      <span className={'avatar t' + (tone >= 0 ? tone : 0)} aria-hidden="true">{[...(name || '?')][0]}</span>
      <b>{name === me ? '나' : name || '누군가'}</b>
    </span>
  );
}

function HeartBtn({ heart, uid, onHeart }: { heart?: Heart; uid: string; onHeart?: () => void }) {
  const names = Object.entries(heart?.by ?? {});
  const mine = !!(uid && heart?.by[uid]);
  const others = names.filter(([u]) => u !== uid).map(([, n]) => n);
  return (
    <span className="feed-heart-row">
      <button type="button" className={'feed-heart' + (mine ? ' on' : '')} aria-pressed={mine} aria-label={mine ? '하트 빼기' : '하트'} onClick={onHeart} disabled={!onHeart} data-testid="feed-heart">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>
      </button>
      {names.length > 0 && <span className="tiny muted" data-testid="feed-heart-names">{[...(mine ? ['나'] : []), ...others].join(', ')}</span>}
    </span>
  );
}

function FeedRow({ item, i, me, heart, uid, onHeart }: { item: FeedItem; i: number; me: string; heart?: Heart; uid: string; onHeart?: () => void }) {
  // 하루가 지난 소식은 날짜 띠가 이미 날짜를 말하므로 '얼마 전'을 빼 둔다
  const when = Date.now() - item.at < 86400_000 ? <span className="tiny muted feed-when">{ago(item.at)}</span> : null;
  const foot = (link: string | null, label: string) => (
    <div className="feed-foot">{link ? <Link to={link} className="tiny feed-link">{label}</Link> : <span />}<HeartBtn heart={heart} uid={uid} onHeart={onHeart} /></div>
  );
  if (item.kind === 'photos') {
    const quote = item.captions[0];
    return (
      <article className="feed-item scrap" data-testid="feed-item" data-kind="photos">
        <header><Who name={item.by} me={me} /><span className="small">사진 {item.photos.length}장</span>{when}</header>
        <b className="jua scrap-title">{item.trip.title}</b>
        <Polaroids photos={item.photos} flip={i % 2 === 1} />
        {quote && <p className={'hand scrap-quote ' + inkOf(item.by)}>“{quote}” <span className="tiny">— {item.by === me ? '나' : item.by}</span></p>}
        {foot(`/trips/${item.trip.id}`, '이 여행 펼치기')}
      </article>
    );
  }
  if (item.kind === 'note') {
    // 짧은 글은 그 지역 사진(없으면 하늘·바다·노을 빛깔) 위에 크게
    const short = item.note.text.length <= 90 && !item.note.text.includes('\n\n');
    const photo = short ? item.trip.places.map(photoForPlace).find(Boolean) ?? null : null;
    const hue = item.note.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
    return (
      <article className="feed-item" data-testid="feed-item" data-kind="note">
        <header><Who name={item.by} me={me} /><span className="small">{item.trip.title}에 글</span>{when}</header>
        {short ? (
          <p className={'feed-quote-card g' + hue + (photo ? ' has-photo' : '')} style={photo ? { backgroundImage: `url(${photo.src.s})` } : undefined} data-testid="feed-quote-card">
            <span className="hand">{item.note.text}</span>
          </p>
        ) : (
          <p className={'feed-text quote hand ' + inkOf(item.by)}>{item.note.text}</p>
        )}
        {foot(`/trips/${item.trip.id}`, '여행 보기')}
      </article>
    );
  }
  if (item.kind === 'place') {
    const lines = Object.entries(item.rec.reviews ?? {}).filter(([, t]) => t?.trim());
    return (
      <article className="feed-item ticket" data-testid="feed-item" data-kind="place">
        <div className="ticket-main">
          <header><Who name={item.by} me={me} /><span className="small">{KIND_LABEL[item.rec.kind]} · {placeLabel(item.rec.region)}</span>{when}</header>
          <b className="jua" style={{ fontSize: 20, lineHeight: 1.2 }}>{item.rec.name}</b>
          {lines.map(([w, t]) => <span key={w} className={'hand ticket-line ' + inkOf(w)}>{w === me ? '나' : w} · {t}</span>)}
          {foot(`/places/${item.rec.id}`, '장소 보기')}
        </div>
        <div className={'ticket-stub' + (item.rec.status === 'want' ? ' want' : item.rec.verdict === 'again' ? ' again' : '')} aria-hidden={!item.rec.verdict && item.rec.status !== 'want'}>
          <span className="jua">{item.rec.status === 'want' ? '가고 싶어요' : item.rec.verdict ? VERDICT_LABEL[item.rec.verdict] : KIND_LABEL[item.rec.kind]}</span>
        </div>
      </article>
    );
  }
  if (item.kind === 'ask') {
    const open = item.opened || item.by === me;
    return (
      <article className="feed-item ask-card" data-testid="feed-item" data-kind="ask">
        <header><span className="tiny" style={{ fontWeight: 600, color: 'var(--butter-ink)', flex: 1 }}>오늘의 한 질문</span>{when}</header>
        <b className="jua" style={{ fontSize: 18, lineHeight: 1.3 }}>{item.question}</b>
        {/* 홈은 오늘 질문만 받는다: 지난 날 질문은 '나도 답하기'로 보내지 않는다 */}
        <div className="ask-bubble">
          <span className={'tiny ' + inkOf(item.by)} style={{ fontWeight: 600 }}>{item.by === me ? '나' : item.by}</span>
          {open ? <span className="hand" style={{ fontSize: 18, lineHeight: 1.25 }}>{item.text}</span> : item.day === localDate() ? <span className="small muted">내가 답하면 열려요 🔒</span> : <span className="small muted">지난 질문이라 답은 닫혀 있어요 🔒</span>}
        </div>
        {open ? foot('/', '홈에서 보기') : foot(item.day === localDate() ? '/' : null, '나도 답하기')}
      </article>
    );
  }
  if (item.kind === 'wish') {
    const ph = photoForPlace(item.wish.place);
    return (
      <article className={'feed-item' + (ph ? ' wish-cover' : '')} data-testid="feed-item" data-kind="wish">
        {ph ? (
          <Link to={`/wishes/${item.wish.id}`} className="wish-cover-img" style={{ backgroundImage: `url(${ph.lqip})` }}>
            <img src={ph.src.l} alt="" loading="lazy" decoding="async" />
            <span className="wish-cover-chip">{item.by === me ? '내가' : withIGa(item.by || '누군가')} 담았어요</span>
          </Link>
        ) : <header><Who name={item.by} me={me} /><span className="small">가고 싶은 곳에 담음</span>{when}</header>}
        <div className="wish-cover-body">
          <Link to={`/wishes/${item.wish.id}`} className="feed-place-copy" style={{ color: 'inherit' }}>
            <b className="jua" style={{ fontSize: 19 }}>{wishTitle(item.wish)}</b>
            <span className="muted small">{item.wish.spotName ? placeLong(item.wish.place) : '가고 싶은 곳'}{ph ? ` · ${ago(item.at)}` : ''}</span>
          </Link>
        </div>
        {foot(`/wishes/${item.wish.id}`, '보기')}
      </article>
    );
  }
  if (item.kind === 'wishes') {
    return (
      <article className="feed-item" data-testid="feed-item" data-kind="wishes">
        <header><Who name={item.by} me={me} /><span className="small">가고 싶은 곳에 {item.wishes.length}곳 담음</span>{when}</header>
        <div className="feed-places">
          {item.wishes.slice(0, 6).map((w) => (
            <Link key={w.id} to={`/wishes/${w.id}`} className="feed-place col"><PlaceThumb place={w.place} /><span className="tiny ellipsis">{wishTitle(w)}</span></Link>
          ))}
          {item.wishes.length > 6 && <span className="tiny muted">외 {item.wishes.length - 6}곳</span>}
        </div>
        {foot('/wishes', '가고 싶은 곳 보기')}
      </article>
    );
  }
  return (
    <article className="feed-item" data-testid="feed-item" data-kind="trip">
      <header><Who name={item.by} me={me} /><span className="small">{item.trip.status === 'planned' ? '여행 계획을 만듦' : '핀을 꽂음'}</span>{when}</header>
      <Link to={`/trips/${item.trip.id}`} className="feed-place">
        {item.trip.places[0] ? <PlaceThumb place={item.trip.places[0]} planned={item.trip.status === 'planned'} /> : null}
        <span className="feed-place-copy"><b>{item.trip.title}</b><span className="muted small">{item.trip.places.map(placeLabel).join(', ')}</span></span>
      </Link>
      {foot(`/trips/${item.trip.id}`, '여행 보기')}
    </article>
  );
}

/** 장소 네모: 사진이 있으면 사진, 없으면 지역 이름 글자 */
function PlaceThumb({ place, planned }: { place: Parameters<typeof photoForPlace>[0]; planned?: boolean }) {
  const ph = photoForPlace(place);
  return (
    <span className={'trip-tile' + (ph ? ' photo' : planned ? ' planned' : place.t === 'country' ? ' abroad' : '')} style={ph ? { backgroundImage: `url(${ph.lqip})` } : undefined} aria-hidden="true">
      {ph ? <img src={ph.src.s} alt="" loading="lazy" decoding="async" /> : tileText({ places: [place] } as never)}
    </span>
  );
}

/** 사람마다 손글씨 색 (보라 분홍·영상 파랑처럼 사람 색을 따른다) */
function inkOf(name: string) {
  const t = toneOf(name);
  return 'ink-t' + (t >= 0 ? t % 4 : 0);
}

/** 폴라로이드 두 장을 겹쳐 붙이고 테이프, 나머지는 '+n장' */
function Polaroids({ photos, flip }: { photos: { id: string; caption?: string; place?: Parameters<typeof placeLabel>[0] | null }[]; flip: boolean }) {
  const two = photos.slice(0, 2);
  const cap = (p: (typeof photos)[number]) => (p.place ? placeLabel(p.place) : '');
  return (
    <div className={'polaroids n' + two.length + (flip ? ' flip' : '')}>
      {two.map((p, k) => (
        <button key={p.id} type="button" className={'polaroid p' + k} aria-label={`사진 ${k + 1} 크게 보기`} onClick={() => openSlideshow(photos as never, k)}>
          <PhotoImg id={p.id} />
          {cap(p) && <span className="hand polaroid-cap">{cap(p)}</span>}
        </button>
      ))}
      <i className="tape t0" aria-hidden="true" />
      {two.length > 1 && <i className="tape t1" aria-hidden="true" />}
      {photos.length > 2 && <button type="button" className="polaroid-more" onClick={() => openSlideshow(photos as never, 2)}>+{photos.length - 2}장 더 보기</button>}
    </div>
  );
}
