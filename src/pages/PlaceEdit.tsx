import { withJosa } from '../lib/ko';
import RankAsk from '../components/RankAsk';
import { TAG_SUGGEST, themeOf } from '../lib/placeMaps';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { hideReview, useBlind } from '../lib/blind';
import { Icon, Spinner, TopBar, useGoBack, useLeaveGuard, useToast } from '../components/ui';
import PlacePicker from '../components/PlacePicker';
import { useAuth, displayName } from '../lib/auth';
import { createPlace, createTrip, deletePlace, enrichPlace, restorePlace, tripsAtPlace, updatePlace, usePlaces, useTrips } from '../lib/data';
import { lookupLink, type LinkInfo } from '../lib/placeLookup';
import { kindFromCategory } from '../lib/placeApps';
import { locate } from '../lib/geodata';
import PlaceView from '../components/PlaceView';
import { quickTripInput } from '../lib/tripActions';
import { celebrate, whatsNew } from '../lib/celebrate';
import { formatWhen } from '../lib/dates';
import { parsePlaceParam, placeLabel, placeParam, searchPlaces } from '../lib/geo';
import { regionFromAddress } from '../lib/area';
import { KIND_LABEL, KINDS, parseNaverShare, VERDICTS } from '../lib/placeRecs';
import { samePlace } from '../lib/wishes';
import { useHome } from '../lib/home';
import { updatePlan } from '../lib/tripExtras';
import { memberNames, toneOf } from '../lib/members';
import type { Place, PlaceKind, PlaceRec, PlaceRecInput, Verdict } from '../lib/types';

/** 장소 남기기·고치기: 이름, 종류, 어디, 어느 여행, 둘의 한 줄 평, 평가, 네이버 링크 */
export default function PlaceEdit() {
  const { id } = useParams();
  const editing = Boolean(id && id !== 'new');
  const [sp] = useSearchParams();
  const goBack = useGoBack();
  const toast = useToast();
  const auth = useAuth();
  const { places } = usePlaces();
  const { trips } = useTrips();
  const existing = useMemo(() => places?.find((p) => p.id === id), [places, id]);
  const tripParam = sp.get('trip');
  const tripFromParam = trips?.find((t) => t.id === tripParam);

  const [name, setName] = useState(() => (sp.get('from') ?? '').slice(0, 80)); // 받은 지도에서 '내 지도에 담기'로 온 이름
  const [kind, setKind] = useState<PlaceKind>(() => { const k = sp.get('kind'); return ['food', 'cafe', 'sight', 'stay', 'shop', 'etc'].includes(k ?? '') ? (k as PlaceKind) : 'food'; });
  // 내 꼬리표(소품샵·옷가게·빵집…): 있으면 내 지도의 주제가 된다
  const [tag, setTag] = useState<string>(() => (sp.get('tag') ?? '').slice(0, 20));
  const [tagOpen, setTagOpen] = useState(false);
  const [region, setRegion] = useState<Place[]>(() => parsePlaceParam(sp.get('region')));
  // 지역을 아무도 안 정했으면 '우리 집' 동네로 (여행 아니어도 동네 맛집을 바로 담게). 붙여 넣은 링크의 자리나 손으로 고른 지역이 이긴다
  const home = useHome();
  const [regionAuto, setRegionAuto] = useState(false);
  const [tripId, setTripId] = useState<string>(tripParam ?? '');
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [naverUrl, setNaverUrl] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [paste, setPaste] = useState('');
  const [visited, setVisited] = useState(false);
  // 가고 싶어요 / 다녀왔어요 (지역 한 장의 '♥ 가게 담기'는 want로 연다; ?been=1은 가고 싶어요 → 다녀왔어요로 바꾸러 온 것)
  const [status, setStatus] = useState<'want' | 'been'>(() => (sp.get('status') === 'want' ? 'want' : 'been'));
  const [mode, setMode] = useState<'view' | 'form'>(editing && sp.get('edit') !== '1' && sp.get('been') !== '1' ? 'view' : 'form');
  const [loaded, setLoaded] = useState(!editing);
  // 고치는 칸을 '연 때'의 장소. 저장할 때 이것과 견줘 고친 칸만 보낸다
  // (실시간 existing과 견주면 상대가 그사이 고친 칸이 내 옛 값으로 덮이고, 상대 한 줄 평이 지워진다)
  const [opened, setOpened] = useState<PlaceRec | null>(null);
  const [saving, setSaving] = useState(false);
  const [rank, setRank] = useState<{ id: string; name: string; kind: PlaceKind; tag?: string; region: Place } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [kindTouched, setKindTouched] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  // 일정에서 '다녀왔어요'로 오면 그 자리(?lat&lng)와 그 일정 줄(?plan)을 가져온다
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => { const la = Number(sp.get('lat')), ln = Number(sp.get('lng')); return sp.get('lat') && Number.isFinite(la) && Number.isFinite(ln) ? { lat: la, lng: ln } : null; });
  const planParam = sp.get('plan');
  const [link, setLink] = useState<{ state: 'idle' | 'loading' | 'done' | 'none'; info?: LinkInfo }>({ state: 'idle' });

  // 안드로이드 공유(네이버지도 → 보라핀)로 들어온 글
  useEffect(() => {
    if (editing) return;
    const shared = [sp.get('title'), sp.get('text'), sp.get('url')].filter(Boolean).join('\n');
    if (shared) applyPaste(shared);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 여행에서 들어오면 그 여행의 첫 장소를 지역으로
  useEffect(() => {
    if (!editing && tripFromParam && region.length === 0) setRegion(tripFromParam.places.slice(0, 1));
  }, [editing, tripFromParam, region.length]);
  // 어디? 시트에서 공유 글을 붙여 넣고 왔으면 그대로 푼다
  useEffect(() => { const t = sp.get('paste'); if (t && !editing) applyPaste(t); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!editing && !tripParam && !sp.get('region') && !sp.get('paste') && region.length === 0 && home?.code) { setRegion([{ t: 'kr', code: home.code }]); setRegionAuto(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home?.code]);

  useEffect(() => {
    if (editing && existing && !loaded) {
      setName(existing.name);
      setKind(existing.kind);
      setTag(existing.tag ?? '');
      setRegion([existing.region]);
      setTripId(existing.tripId ?? '');
      setReviews(existing.reviews ?? {});
      setVerdict(existing.verdict ?? null);
      setStatus(sp.get('been') === '1' ? 'been' : existing.status === 'want' ? 'want' : 'been');
      setNaverUrl(existing.naverUrl ?? '');
      setAddress(existing.address ?? '');
      setMemo(existing.memo ?? '');
      setPhotoUrl(existing.photoUrl ?? '');
      setCoords(existing.lat != null && existing.lng != null ? { lat: existing.lat, lng: existing.lng } : null);
      setKindTouched(true);
      setOpened(existing);
      setLoaded(true);
    }
  }, [editing, existing, loaded]);

  const where = region[region.length - 1] ?? null;
  const tripOptions = useMemo(() => (trips && where ? tripsAtPlace(trips, (p) => samePlace(p, where)) : []), [trips, where]);
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const [blind, setBlindOn] = useBlind();
  const writers = [...new Set([...memberNames(), me, ...Object.keys(reviews)].filter(Boolean))];

  const applyPaste = (text: string) => {
    setPaste(text);
    const r = parseNaverShare(text);
    if (r.name && !name) setName(r.name.slice(0, 80));
    if (r.url) setNaverUrl(r.url);
    if (r.address && !address) setAddress(r.address);
    // 주소에 시·군이 있으면 지역도 그걸로 (우리 집 동네로 자동으로 둔 것은 바꾼다)
    if (r.address) { const at = regionFromAddress(r.address, searchPlaces); if (at) { setRegion((cur) => (cur.length && !regionAuto ? cur : [at])); setRegionAuto(false); } }
  };

  // 링크가 붙으면 그쪽 지도에서 이름·사진·주소·종류·자리를 가져와 빈 칸만 채운다
  const linkUrl = /^https?:\/\//i.test(naverUrl.trim()) ? naverUrl.trim() : '';
  useEffect(() => {
    if (!linkUrl || mode !== 'form' || (editing && !loaded)) { setLink({ state: 'idle' }); return; }
    if (editing && existing?.naverUrl === linkUrl && existing.photoUrl && existing.lat != null) return;
    let on = true;
    setLink({ state: 'loading' });
    lookupLink(linkUrl, address).then(async (info) => {
      if (!on) return;
      if (!info) { setLink({ state: 'none' }); return; }
      setLink({ state: 'done', info });
      if (info.name) setName((n) => n || info.name!.slice(0, 80));
      if (info.address) setAddress((a) => a || info.address!);
      const k = kindFromCategory(info.category);
      if (k && !kindTouched) setKind(k);
      if (info.image) setPhotoUrl((p) => p || info.image!);
      if (info.lat != null && info.lng != null) {
        setCoords({ lat: info.lat, lng: info.lng });
        const at = await locate(info.lng, info.lat).catch(() => null);
        if (on && at) { setRegion((r) => (r.length && !regionAuto ? r : [at])); setRegionAuto(false); }
      }
    });
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkUrl, mode, loaded]);

  const save = async () => {
    if (!where || !name.trim() || auth.status !== 'ready' || saving) return;
    setSaving(true);
    // 여행 없이 장소만 남기면서 '여기 다녀왔어요'를 골랐으면 핀(날짜 없는 여행)도 꽂고 이어 둔다
    let linkTrip = tripId || null;
    let news: string | null = null;
    if (!editing && !linkTrip && visited && status === 'been') {
      try {
        const ti = quickTripInput(where, memberNames());
        news = trips ? whatsNew(trips, [...trips, { ...ti, id: 'new', v: 1 }]) : null;
        linkTrip = await createTrip(ti, auth.user);
        // 장소 저장이 실패해 다시 눌러도 핀이 하나 더 생기지 않게 (이미 꽂은 핀에 잇는다)
        setTripId(linkTrip);
      } catch (e) {
        console.warn(e);
        toast('핀을 꽂지 못했어요. 다시 해 주세요.');
        setSaving(false);
        return;
      }
    }
    const input: PlaceRecInput = {
      name: name.trim(),
      kind,
      tag: tag.trim().slice(0, 20) || undefined,
      region: where,
      tripId: linkTrip,
      status,
      reviews: Object.fromEntries(Object.entries(reviews).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
      verdict,
      naverUrl: /^https?:\/\//i.test(naverUrl.trim()) ? naverUrl.trim() : undefined,
      address: address.trim() || undefined,
      memo: memo.trim() || undefined,
      photoUrl: /^https:\/\//.test(photoUrl) ? photoUrl.slice(0, 600) : undefined,
      lat: coords?.lat,
      lng: coords?.lng,
    };
    try {
      let newId: string | null = null;
      if (editing && id && opened) await updatePlace(id, opened, input, me);
      else newId = await createPlace(input, auth.user);
      // 일정 줄과 잇는다: 그 줄은 '들른 곳'의 우리 장소로 올라가고 일정에선 다녀온 것으로
      if (!editing && newId && planParam) await updatePlan(planParam, { recId: newId, done: true }).catch((e) => console.warn(e));
      if (news) celebrate();
      toast(editing ? '고쳤어요' : linkTrip && visited ? `담고 핀도 꽂았어요${news ? ` · ${news}` : ''}` : `${withJosa(name.trim(), '을/를')} 담았어요`);
      if (editing) { setSaving(false); if (sp.get('been') === '1') { goBack(`/region/${placeParam(input.region)}?tab=places`); return; } setMode('view'); return; }
      // 새로 담은 곳: 같은 지역·주제에 이미 담은 곳이 있으면 한 번 견줘 내 지도 순위에 끼운다 (없으면 바로 돌아감)
      if (newId && status === 'been' && (places ?? []).some((r) => r.status !== 'want' && themeOf(r) === themeOf(input) && samePlace(r.region, input.region))) { setRank({ id: newId, name: input.name, kind: input.kind, tag: input.tag, region: input.region }); setSaving(false); return; }
      // 담고 나면 그 지역 한 장(맛집·명소 탭)으로: 방금 담은 곳이 어디 들어갔는지 바로 보이게
      goBack(tripParam ? `/trips/${tripParam}` : `/region/${placeParam(input.region)}?tab=places`);
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
      setSaving(false);
    }
  };

  // 쓰던 내용이 있는지: 연 때 모습과 견준다 (상대가 그사이 고쳐도 '내가' 안 고쳤으면 안 묻게)
  const dirty = !saving && mode === 'form' && (editing ? loaded && !!opened && (name !== opened.name || memo !== (opened.memo ?? '') || JSON.stringify(reviews) !== JSON.stringify(opened.reviews ?? {})) : !!(name.trim() || memo.trim() || Object.values(reviews).some((v) => v.trim())));
  useLeaveGuard(dirty);

  const remove = () => {
    if (!existing) return;
    const copy = existing;
    deletePlace(copy.id).catch(() => toast('지우지 못했어요. 다시 해 주세요'));
    toast('장소를 지웠어요', { label: '되돌리기', onClick: () => void restorePlace(copy) });
    goBack('/places');
  };

  if (editing && !loaded) {
    if (places && !existing)
      return (
        <>
          <TopBar back backTo="/places" title="장소" />
          <div className="empty" style={{ margin: 20 }}><b>이 장소를 찾을 수 없어요</b><span className="small">지워졌거나 주소가 바뀌었어요.</span></div>
        </>
      );
    return <Spinner />;
  }

  if (editing && existing && mode === 'view') {
    return (
      <PlaceView
        rec={existing}
        trip={trips?.find((t) => t.id === existing.tripId) ?? null}
        // 고칠 때마다 지금 문서로 새로 연다 (지난 저장 뒤 상대가 고친 것이 폼과 스냅샷에 들어오게)
        onEdit={() => { setMode('form'); setLoaded(false); }}
        onRemove={remove}
        onEnrich={(f) => void enrichPlace(existing.id, f).catch(() => {})}
      />
    );
  }

  return (
    <>
      {rank && <RankAsk rec={rank} all={places ?? []} onDone={() => { setRank(null); goBack(tripParam ? `/trips/${tripParam}` : `/region/${placeParam(rank.region)}?tab=places`); }} />}
      <TopBar back backTo="/places" confirmLeave={dirty} title={editing ? '장소 고치기' : '맛집·카페 담기'} right={editing ? <button className="btn sm ghost" onClick={() => { if (dirty && !window.confirm('고친 내용이 사라져요. 그만 고칠까요?')) return; setMode('view'); setLoaded(false); }}>그만 고치기</button> : undefined} />
      <div className="page" style={{ paddingTop: 4, gap: 18 }}>
        <div className="seg" role="radiogroup" aria-label="가고 싶어요 또는 다녀왔어요" data-testid="place-status">
          <button type="button" role="radio" aria-checked={status === 'want'} className={status === 'want' ? 'on coral' : ''} onClick={() => setStatus('want')} data-testid="status-want">♥ 가고 싶어요</button>
          <button type="button" role="radio" aria-checked={status === 'been'} className={status === 'been' ? 'on' : ''} onClick={() => setStatus('been')} data-testid="status-been">다녀왔어요</button>
        </div>
        {status === 'want' && <span className="tiny muted" style={{ marginTop: -8 }}>그 동네 내 지도에 빈 핀으로 찍히고, 여행을 계획할 때 담기 후보로 먼저 나와요. 가 본 뒤 '다녀왔어요'로 바꾸면 돼요.</span>}
        <div className="field">
          <span className="label">네이버지도 <span className="muted small">(선택)</span></span>
          {/^https?:\/\//i.test(naverUrl.trim()) ? (
            <>
            <div className="naver-linked" data-testid="naver-link">
              <span className="naver-badge" aria-hidden="true">N</span>
              <a href={naverUrl.trim()} target="_blank" rel="noreferrer">{naverUrl.trim().replace(/^https?:\/\//i, '')}</a>
              <button type="button" className="icon-btn" style={{ width: 40, height: 40 }} aria-label="네이버지도 링크 빼기" onClick={() => { setNaverUrl(''); setPaste(''); setLink({ state: 'idle' }); }}><Icon name="x" size={14} /></button>
            </div>
            {(link.state === 'loading' || link.state === 'done' || photoUrl) && (
              <div className="link-preview" data-testid="link-preview" aria-live="polite">
                {photoUrl ? <img src={photoUrl} alt="" referrerPolicy="no-referrer" loading="lazy" onError={() => setPhotoUrl('')} /> : <span className="link-preview-ph" aria-hidden="true"><Icon name="image" size={20} /></span>}
                <span className="link-preview-text">
                  {link.state === 'loading' ? <span className="small muted">링크에서 사진과 자리를 찾는 중…</span> : (
                    <>
                      <b>{link.info?.name || name}</b>
                      {link.info?.category && <span className="tiny muted">{link.info.category}</span>}
                      <span className="tiny" style={{ color: 'var(--violet)' }}>{withJosa([photoUrl && '사진', coords && '자리', link.info?.address && '주소'].filter(Boolean).join('·') || '이름', '을/를')} 가져왔어요</span>
                    </>
                  )}
                </span>
                {photoUrl && <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} aria-label="사진 빼기" onClick={() => setPhotoUrl('')}><Icon name="x" size={13} /></button>}
              </div>
            )}
            {link.state === 'none' && <span className="tiny muted">이 링크에선 더 가져올 게 없어요. 이름과 주소는 직접 써 주세요.</span>}
            </>
          ) : (
            <>
              <textarea className="textarea" rows={2} aria-label="네이버지도 공유 글" value={paste} onChange={(e) => applyPaste(e.target.value)} placeholder="네이버지도에서 '공유'로 복사한 글이나 링크를 붙여 넣으면 이름·주소가 채워져요" />
            </>
          )}
        </div>

        <div className="field">
          <span className="label">이름<span className="req">*</span></span>
          <input className="input" aria-label="장소 이름" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="예: 초당할머니순두부" />
        </div>

        <div className="field">
          <span className="label">종류</span>
          <div className="chips">
            {KINDS.map((k) => (
              <button key={k.k} type="button" aria-pressed={kind === k.k} className={'chip' + (kind === k.k ? ' on' : '')} onClick={() => { setKind(k.k); setKindTouched(true); }}>
                {kind === k.k && <span className="chip-check" aria-hidden="true"><Icon name="check" size={13} stroke={2.6} /></span>}{k.label}
              </button>
            ))}
          </div>
          {/* 꼬리표: 종류 안의 작은 주제. 있으면 내 지도가 '성동구 소품샵 지도'처럼 따로 생긴다 */}
          <div className="chips" style={{ marginTop: 8 }} data-testid="place-tags">
            {[...new Set([...(TAG_SUGGEST[kind] ?? []), ...(places ?? []).filter((p) => p.kind === kind && p.tag?.trim()).map((p) => p.tag!.trim())])].slice(0, 8).map((t) => (
              <button key={t} type="button" className={'chip' + (tag === t ? ' on' : '')} aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>{t}</button>
            ))}
            {tagOpen || (tag && !(TAG_SUGGEST[kind] ?? []).includes(tag) && !(places ?? []).some((p) => p.tag?.trim() === tag)) ? (
              <input className="input" aria-label="내 꼬리표" placeholder="내 꼬리표 (예: 옷가게)" value={tag} onChange={(e) => setTag(e.target.value.slice(0, 20))} style={{ height: 36, width: 150 }} autoFocus={tagOpen} />
            ) : (
              <button type="button" className="chip dashed" onClick={() => setTagOpen(true)}>+ 내 꼬리표</button>
            )}
          </div>
          <span className="tiny muted" style={{ display: 'block', marginTop: 4 }}>꼬리표를 붙이면 '{placeLabel(region[0] ?? { t: 'kr', code: '11' })} {tag.trim() || '소품샵'} 지도'처럼 내 지도가 따로 생겨요. 안 붙이면 {KIND_LABEL[kind]} 지도에 들어가요.</span>
        </div>

        <div className="field">
          <span className="label">어디<span className="req">*</span></span>
          <PlacePicker value={where ? [where] : []} onChange={(v) => { setRegion(v.slice(-1)); setRegionAuto(false); }} />
          {regionAuto && where && <span className="tiny muted" data-testid="region-auto">우리 집 동네로 두었어요 · 다른 곳이면 위에서 바꿔 주세요</span>}
          <input className="input" aria-label="주소" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="자세한 주소 (선택)" />
        </div>

        {tripOptions.length > 0 && (
          <div className="field">
            <span className="label">어느 여행에서</span>
            <select className="select" aria-label="여행 연결" value={tripId} onChange={(e) => setTripId(e.target.value)}>
              <option value="">연결 안 함</option>
              {tripOptions.map((t) => <option key={t.id} value={t.id}>{t.title} · {formatWhen(t.when)}</option>)}
            </select>
          </div>
        )}

        {/* 이 지역에 다녀온 여행이 하나도 없을 때만: 여행 가서 들른 곳이면 여행 지도에 핀도 꽂는다 (동네 가게는 끈 채로) */}
        {!editing && !tripId && status === 'been' && tripOptions.length === 0 && (
          <label className="check-row" data-testid="place-pin-too">
            <input type="checkbox" checked={visited} onChange={(e) => setVisited(e.target.checked)} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>여행 지도에도 핀 꽂기<span className="tiny muted" style={{ fontWeight: 500 }}>여행 가서 들른 곳이면 켜고, 동네 가게면 그냥 둬요</span></span>
          </label>
        )}

        {status === 'been' ? (<>
        <div className="field">
          <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>한 줄 평
            {/* 꼬리표 모양이지만 누르는 단추라 36px 높이(.tag-btn) — 손가락으로 누르기 쉽게 */}
            <button type="button" className={'tag tag-btn' + (blind ? ' violet' : '')} onClick={() => setBlindOn(!blind)} aria-pressed={blind} data-testid="blind-toggle" title="켜 두면 내가 쓰기 전엔 상대 한 줄 평이 가려져요">
              <Icon name={blind ? 'lock' : 'users'} size={14} stroke={2.4} />{blind ? '가리고 쓰는 중' : '가리고 쓰기'}
            </button>
          </span>
          {writers.map((w) => hideReview(reviews, w, me, blind) ? (
            <div key={w} className="review-row review-hidden" data-testid="review-hidden">
              <span className={'avatar t' + Math.max(0, toneOf(w))} aria-hidden="true">{[...w][0]}</span>
              <span className="small muted">{w}의 한 줄 평은 내 것을 쓰면 열려요</span>
            </div>
          ) : (
            <label key={w} className="review-row">
              <span className={'avatar t' + Math.max(0, toneOf(w))} aria-hidden="true">{[...w][0]}</span>
              <input
                className="input"
                aria-label={`${w} 한 줄 평`}
                placeholder="어땠어요?"
                value={reviews[w] ?? ''}
                onChange={(e) => setReviews((r) => ({ ...r, [w]: e.target.value }))}
                maxLength={140}
              />
            </label>
          ))}
        </div>

        <div className="field">
          <span className="label">다시 간다면</span>
          <div className="chips">
            {VERDICTS.map((v) => (
              <button key={v.v} type="button" aria-pressed={verdict === v.v} className={'chip' + (verdict === v.v ? (v.v === 'again' ? ' on-coral' : ' on') : '')} onClick={() => setVerdict(verdict === v.v ? null : v.v)}>
                {verdict === v.v && <span className="chip-check" aria-hidden="true"><Icon name="check" size={13} stroke={2.6} /></span>}{v.label}
              </button>
            ))}
          </div>
        </div>


        </>) : (
          <div className="field">
            <span className="label">왜 가고 싶어요? <span className="muted small">(선택)</span></span>
            <input className="input" aria-label="가고 싶은 이유" value={reviews[me] ?? ''} onChange={(e) => setReviews({ ...reviews, [me]: e.target.value })} placeholder="예: 릴스에서 본 소금빵, 바다 뷰" maxLength={200} />
          </div>
        )}
        <div className="field">
          <span className="label">메모</span>
          <textarea className="textarea" aria-label="장소 메모" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="주문한 메뉴, 웨이팅, 주차…" maxLength={5000} />
        </div>

        <button className="btn block" disabled={!where || !name.trim() || saving} onClick={save} data-testid="place-save">
          {saving ? '담는 중…' : editing ? '고친 내용 저장' : '담기'}
        </button>
        {editing && existing && (
          !confirm ? (
            <button className="btn danger block" onClick={() => setConfirm(true)}><Icon name="trash" size={17} />이 장소 지우기</button>
          ) : (
            <div className="card" style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>그대로 두기</button>
              <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} onClick={remove}>지우기</button>
            </div>
          )
        )}
      </div>
    </>
  );
}
