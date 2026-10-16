import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../components/ui';
import PhotoImg from '../components/PhotoImg';
import { usePlaces, useTrips, useWishes } from '../lib/data';
import { usePhotos } from '../lib/photos';
import { useAllNotes } from '../lib/tripExtras';
import { ago, buildFeed, type FeedItem } from '../lib/feed';
import { placeLabel, placeLong } from '../lib/geo';
import { KIND_LABEL, VERDICT_LABEL } from '../lib/placeRecs';
import { toneOf } from '../lib/members';
import { useAuth, displayName } from '../lib/auth';
import { markFeedSeen } from '../lib/feedSeen';
import { openSlideshow } from '../components/slideshow';
import { wishTitle } from '../components/WishCard';

/** 피드: 둘이 최근에 남긴 사진·글·장소·핀·가고 싶은 곳을 시간순으로 */
export default function Feed() {
  const auth = useAuth();
  const { trips } = useTrips();
  const { photos } = usePhotos();
  const { places: recs } = usePlaces();
  const { wishes } = useWishes();
  const notes = useAllNotes();
  const ready = !!(trips && photos && recs && wishes && notes);
  const items = useMemo(() => (ready ? buildFeed({ trips: trips!, photos: photos!, notes: notes!, recs: recs!, wishes: wishes! }) : null), [ready, trips, photos, notes, recs, wishes]);
  const me = auth.status === 'ready' ? displayName(auth.user) : '';

  // 들어와서 봤으면 '새 소식' 표시를 지운다
  useEffect(() => {
    if (items) markFeedSeen(items[0]?.at ?? Date.now());
  }, [items]);

  return (
    <>
      <TopBar title="피드" right={<Link to="/memories" className="btn sm soft" data-testid="to-memories">추억 돌아보기</Link>} />
      <div className="page feed" style={{ paddingTop: 4 }} data-testid="feed">
        {!items && <div className="skeleton-list" aria-busy="true"><i /><i /><i /></div>}
        {items && items.length === 0 && (
          <div className="card art-row" data-testid="feed-empty">
            <img src="/art/bora-camera.webp" alt="" aria-hidden="true" width={360} height={623} decoding="async" />
            <span>
              <b style={{ display: 'block', fontSize: 17, marginBottom: 4 }}>아직 소식이 없어요</b>
              <span className="small muted">사진을 올리거나 글을 남기면 여기에 둘의 소식이 쌓여요.</span>
            </span>
          </div>
        )}
        {items && items.length > 0 && (
          <ol className="feed-list">
            {items.map((it) => <li key={keyOf(it)}><FeedRow item={it} me={me} /></li>)}
          </ol>
        )}
      </div>
    </>
  );
}

const keyOf = (it: FeedItem) => `${it.kind}:${it.at}:${it.kind === 'photos' ? it.photos[0].id : it.kind === 'note' ? it.note.id : it.kind === 'place' ? it.rec.id : it.kind === 'wish' ? it.wish.id : it.trip.id}`;

function Who({ name, me }: { name: string; me: string }) {
  const tone = toneOf(name);
  return (
    <span className="feed-who">
      <span className={'avatar t' + (tone >= 0 ? tone : 0)} aria-hidden="true">{[...(name || '?')][0]}</span>
      <b>{name === me ? '나' : name || '누군가'}</b>
    </span>
  );
}

function FeedRow({ item, me }: { item: FeedItem; me: string }) {
  const when = <span className="tiny muted feed-when">{ago(item.at)}</span>;
  if (item.kind === 'photos') {
    const shown = item.photos.slice(0, 4);
    return (
      <article className="feed-item" data-testid="feed-item" data-kind="photos">
        <header><Who name={item.by} me={me} /><span className="small">{item.trip.title}에 사진 {item.photos.length}장</span>{when}</header>
        <div className={'feed-photos n' + Math.min(shown.length, 4)}>
          {shown.map((p, i) => (
            <button key={p.id} type="button" className="feed-photo" aria-label={`사진 ${i + 1} 크게 보기`} onClick={() => openSlideshow(item.photos, i)}>
              <PhotoImg id={p.id} />
              {i === 3 && item.photos.length > 4 && <span className="feed-more">+{item.photos.length - 4}</span>}
            </button>
          ))}
        </div>
        {item.captions[0] && <p className="feed-text">{item.captions[0]}</p>}
        <Link to={`/trips/${item.trip.id}`} className="tiny feed-link">여행 보기</Link>
      </article>
    );
  }
  if (item.kind === 'note') {
    return (
      <article className="feed-item" data-testid="feed-item" data-kind="note">
        <header><Who name={item.by} me={me} /><span className="small">{item.trip.title}에 글</span>{when}</header>
        <p className="feed-text quote">{item.note.text}</p>
        <Link to={`/trips/${item.trip.id}`} className="tiny feed-link">여행 보기</Link>
      </article>
    );
  }
  if (item.kind === 'place') {
    return (
      <article className="feed-item" data-testid="feed-item" data-kind="place">
        <header><Who name={item.by} me={me} /><span className="small">{placeLabel(item.rec.region)}에 {KIND_LABEL[item.rec.kind]} 남김</span>{when}</header>
        <p className="feed-text"><b>{item.rec.name}</b>{item.rec.verdict ? <span className="tag" style={{ marginLeft: 6 }}>{VERDICT_LABEL[item.rec.verdict]}</span> : null}{item.review ? <span className="muted"> · “{item.review}”</span> : null}</p>
        <Link to={`/places/${item.rec.id}`} className="tiny feed-link">장소 보기</Link>
      </article>
    );
  }
  if (item.kind === 'wish') {
    return (
      <article className="feed-item" data-testid="feed-item" data-kind="wish">
        <header><Who name={item.by} me={me} /><span className="small">가고 싶은 곳에 담음</span>{when}</header>
        <p className="feed-text"><b>{wishTitle(item.wish)}</b>{item.wish.spotName ? <span className="muted"> · {placeLong(item.wish.place)}</span> : null}</p>
        <Link to={`/wishes/${item.wish.id}`} className="tiny feed-link">보기</Link>
      </article>
    );
  }
  return (
    <article className="feed-item" data-testid="feed-item" data-kind="trip">
      <header><Who name={item.by} me={me} /><span className="small">{item.trip.status === 'planned' ? '여행 계획을 만듦' : '핀을 꽂음'}</span>{when}</header>
      <p className="feed-text"><b>{item.trip.title}</b><span className="muted"> · {item.trip.places.map(placeLabel).join(', ')}</span></p>
      <Link to={`/trips/${item.trip.id}`} className="tiny feed-link">여행 보기</Link>
    </article>
  );
}
