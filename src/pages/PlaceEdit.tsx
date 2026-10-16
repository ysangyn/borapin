import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Icon, Spinner, TopBar, useGoBack, useLeaveGuard, useToast } from '../components/ui';
import PlacePicker from '../components/PlacePicker';
import { useAuth, displayName } from '../lib/auth';
import { createPlace, createTrip, deletePlace, restorePlace, tripsAtPlace, updatePlace, usePlaces, useTrips } from '../lib/data';
import { quickTripInput } from '../lib/tripActions';
import { celebrate, whatsNew } from '../lib/celebrate';
import { formatWhen } from '../lib/dates';
import { parsePlaceParam } from '../lib/geo';
import { KINDS, parseNaverShare, placeRecLinks, VERDICTS } from '../lib/placeRecs';
import { samePlace } from '../lib/wishes';
import { memberNames, toneOf } from '../lib/members';
import type { Place, PlaceKind, PlaceRecInput, Verdict } from '../lib/types';

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

  const [name, setName] = useState('');
  const [kind, setKind] = useState<PlaceKind>('food');
  const [region, setRegion] = useState<Place[]>(() => parsePlaceParam(sp.get('region')));
  const [tripId, setTripId] = useState<string>(tripParam ?? '');
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [naverUrl, setNaverUrl] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [paste, setPaste] = useState('');
  const [visited, setVisited] = useState(false);
  const [loaded, setLoaded] = useState(!editing);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

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

  useEffect(() => {
    if (editing && existing && !loaded) {
      setName(existing.name);
      setKind(existing.kind);
      setRegion([existing.region]);
      setTripId(existing.tripId ?? '');
      setReviews(existing.reviews ?? {});
      setVerdict(existing.verdict ?? null);
      setNaverUrl(existing.naverUrl ?? '');
      setAddress(existing.address ?? '');
      setMemo(existing.memo ?? '');
      setLoaded(true);
    }
  }, [editing, existing, loaded]);

  const where = region[region.length - 1] ?? null;
  const tripOptions = useMemo(() => (trips && where ? tripsAtPlace(trips, (p) => samePlace(p, where)) : []), [trips, where]);
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const writers = [...new Set([...memberNames(), me, ...Object.keys(reviews)].filter(Boolean))];

  const applyPaste = (text: string) => {
    setPaste(text);
    const r = parseNaverShare(text);
    if (r.name && !name) setName(r.name.slice(0, 80));
    if (r.url) setNaverUrl(r.url);
    if (r.address && !address) setAddress(r.address);
  };

  const save = async () => {
    if (!where || !name.trim() || auth.status !== 'ready' || saving) return;
    setSaving(true);
    // 여행 없이 장소만 남기면서 '여기 다녀왔어요'를 골랐으면 핀(날짜 없는 여행)도 꽂고 이어 둔다
    let linkTrip = tripId || null;
    let news: string | null = null;
    if (!editing && !linkTrip && visited) {
      try {
        const ti = quickTripInput(where, memberNames());
        news = trips ? whatsNew(trips, [...trips, { ...ti, id: 'new', v: 1 }]) : null;
        linkTrip = await createTrip(ti, auth.user);
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
      region: where,
      tripId: linkTrip,
      reviews: Object.fromEntries(Object.entries(reviews).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
      verdict,
      naverUrl: /^https?:\/\//i.test(naverUrl.trim()) ? naverUrl.trim() : undefined,
      address: address.trim() || undefined,
      memo: memo.trim() || undefined,
    };
    try {
      if (editing && id && existing) await updatePlace(id, existing, input);
      else await createPlace(input, auth.user);
      if (news) celebrate();
      toast(editing ? '고쳤어요' : linkTrip && visited ? `장소를 남기고 핀도 꽂았어요${news ? ` · ${news}` : ''}` : '장소를 남겼어요');
      goBack(tripParam ? `/trips/${tripParam}` : '/places');
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
      setSaving(false);
    }
  };

  const links = where && name ? placeRecLinks({ name, region: where, naverUrl: /^https?:\/\//i.test(naverUrl.trim()) ? naverUrl.trim() : undefined }) : null;
  const dirty = !saving && (editing ? loaded && !!existing && (name !== existing.name || memo !== (existing.memo ?? '') || JSON.stringify(reviews) !== JSON.stringify(existing.reviews ?? {})) : !!(name.trim() || memo.trim() || Object.values(reviews).some((v) => v.trim())));
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

  return (
    <>
      <TopBar back backTo="/places" confirmLeave={dirty} title={editing ? '장소' : '장소 남기기'} />
      <div className="page" style={{ paddingTop: 4, gap: 18 }}>
        <div className="field">
          <span className="label">네이버지도 <span className="muted small">(선택)</span></span>
          {/^https?:\/\//i.test(naverUrl.trim()) ? (
            <div className="naver-linked" data-testid="naver-link">
              <span className="naver-badge" aria-hidden="true">N</span>
              <a href={naverUrl.trim()} target="_blank" rel="noreferrer">{naverUrl.trim().replace(/^https?:\/\//i, '')}</a>
              <button type="button" className="icon-btn" style={{ width: 40, height: 40 }} aria-label="네이버지도 링크 빼기" onClick={() => { setNaverUrl(''); setPaste(''); }}><Icon name="x" size={14} /></button>
            </div>
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
              <button key={k.k} type="button" aria-pressed={kind === k.k} className={'chip' + (kind === k.k ? ' on' : '')} onClick={() => setKind(k.k)}>
                {kind === k.k && <span className="chip-check" aria-hidden="true"><Icon name="check" size={13} stroke={2.6} /></span>}{k.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">어디<span className="req">*</span></span>
          <PlacePicker value={where ? [where] : []} onChange={(v) => setRegion(v.slice(-1))} />
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

        {!editing && !tripId && (
          <label className="check-row">
            <input type="checkbox" checked={visited} onChange={(e) => setVisited(e.target.checked)} />
            <span>여기 다녀왔어요 (지도에 핀도 꽂기)</span>
          </label>
        )}

        <div className="field">
          <span className="label">한 줄 평</span>
          {writers.map((w) => (
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


        <div className="field">
          <span className="label">메모</span>
          <textarea className="textarea" aria-label="장소 메모" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="주문한 메뉴, 웨이팅, 주차…" maxLength={5000} />
        </div>

        {links && (
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={links.naver} target="_blank" rel="noreferrer" className="btn sm ghost" style={{ flex: 1 }}>네이버지도로 열기</a>
            <a href={links.google} target="_blank" rel="noreferrer" className="btn sm ghost" style={{ flex: 1 }}>구글지도로 열기</a>
          </div>
        )}

        <button className="btn block" disabled={!where || !name.trim() || saving} onClick={save} data-testid="place-save">
          {saving ? '저장 중…' : editing ? '고친 내용 저장' : '남기기'}
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
