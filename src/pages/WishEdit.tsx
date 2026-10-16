import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon, Spinner, TopBar, useGoBack, useLeaveGuard, useToast } from '../components/ui';
import PlacePicker from '../components/PlacePicker';

import { useAuth, displayName } from '../lib/auth';
import { createWish, deleteWish, restoreWish, saveWishEdits, useTrips, useWishes } from '../lib/data';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { parsePlaceParam, placeParam } from '../lib/geo';
import { COUPLE, lines, wishState } from '../lib/wishes';
import type { Place, WishInput, WishPriority } from '../lib/types';

export default function WishEdit() {
  const { id } = useParams();
  const editing = Boolean(id && id !== 'new');
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const goBack = useGoBack();
  const toast = useToast();
  const auth = useAuth();
  const seasons = useSeasons();
  const { wishes } = useWishes();
  const { trips } = useTrips();
  const existing = useMemo(() => wishes?.find((w) => w.id === id), [wishes, id]);

  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const [places, setPlaces] = useState<Place[]>(() => parsePlaceParam(sp.get('place')));
  const [spotName, setSpotName] = useState('');
  const [wantedBy, setWantedBy] = useState<string[]>(() => ((COUPLE as readonly string[]).includes(me) ? [me] : []));
  const [priority, setPriority] = useState<WishPriority>(null);
  const [spots, setSpots] = useState('');
  const [todos, setTodos] = useState('');
  const [foods, setFoods] = useState('');
  const [links, setLinks] = useState('');
  const [note, setNote] = useState('');
  const [months, setMonths] = useState<number[]>([]);
  const [pickMonths, setPickMonths] = useState(false);
  const [loaded, setLoaded] = useState(!editing);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (editing && existing && !loaded) {
      setPlaces([existing.place]);
      setSpotName(existing.spotName ?? '');
      setWantedBy(existing.wantedBy ?? []);
      setPriority(existing.priority ?? null);
      setSpots(existing.spots.join('\n'));
      setTodos(existing.todos.join('\n'));
      setFoods(existing.foods.join('\n'));
      setLinks((existing.links ?? []).join('\n'));
      setNote(existing.note ?? '');
      setMonths(existing.months ?? []);
      setPickMonths(!!existing.months?.length);
      setLoaded(true);
    }
  }, [editing, existing, loaded]);

  const place = places[places.length - 1] ?? null;
  const auto = place ? seasonFor(seasons, place) : null;
  const state = existing && trips ? wishState(existing, trips) : null;

  const save = async () => {
    if (!place || auth.status !== 'ready' || saving) return;
    setSaving(true);
    const input: WishInput = {
      place,
      spotName: spotName.trim() || undefined,
      wantedBy,
      priority,
      spots: lines(spots),
      todos: lines(todos),
      foods: lines(foods),
      links: lines(links),
      note: note.trim(),
      months: pickMonths ? months : [],
      source: existing?.source ?? 'app',
    };
    try {
      if (editing && id && existing) {
        await saveWishEdits(id, existing, input);
        toast('고쳤어요');
        goBack('/wishes');
      } else {
        await createWish(input, auth.user);
        toast('가고 싶은 곳에 담았어요');
        nav('/wishes', { replace: true });
      }
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
      setSaving(false);
    }
  };

  const toggle = (n: string) => setWantedBy((w) => (w.includes(n) ? w.filter((x) => x !== n) : [...w, n]));
  const dirty = !saving && (editing ? loaded && !!existing && (spotName !== (existing.spotName ?? '') || note !== (existing.note ?? '') || spots !== existing.spots.join('\n') || todos !== existing.todos.join('\n') || foods !== existing.foods.join('\n')) : !!(spotName.trim() || note.trim() || spots.trim() || todos.trim() || foods.trim()));
  useLeaveGuard(dirty);

  const remove = () => {
    if (!existing) return;
    const copy = existing;
    deleteWish(copy.id).catch(() => toast('빼지 못했어요. 다시 해 주세요'));
    toast('가고 싶은 곳에서 뺐어요', { label: '되돌리기', onClick: () => void restoreWish(copy) });
    nav('/wishes', { replace: true });
  };

  if (editing && !loaded) {
    if (wishes && !existing)
      return (
        <>
          <TopBar back backTo="/wishes" title="가고 싶은 곳" />
          <div className="empty" style={{ margin: 20 }}><b>이곳을 찾을 수 없어요</b><span className="small">이미 빠졌거나 주소가 바뀌었어요.</span></div>
        </>
      );
    return <Spinner />;
  }

  return (
    <>
      <TopBar back backTo="/wishes" confirmLeave={dirty} title={editing ? '가고 싶은 곳' : '가고 싶은 곳 담기'} />
      <div className="page" style={{ paddingTop: 4, gap: 18 }}>
        <div className="field">
          <span className="label">어디<span className="req">*</span></span>
          <PlacePicker value={place ? [place] : []} onChange={(v) => setPlaces(v.slice(-1))} />
          <input className="input" aria-label="가게·명소 이름" placeholder="특정 가게·명소가 있다면 (선택, 예: 성산일출봉)" value={spotName} onChange={(e) => setSpotName(e.target.value)} maxLength={60} />
        </div>

        <div className="field">
          <span className="label">누가 원해요</span>
          <div className="chips">
            {COUPLE.map((n) => (
              <button key={n} type="button" className={'chip heart-chip' + (wantedBy.includes(n) ? ' on-coral' : '')} onClick={() => toggle(n)} aria-pressed={wantedBy.includes(n)}>
                <Icon name="heart" size={14} stroke={2.2} />{n}
              </button>
            ))}
            {COUPLE.every((n) => wantedBy.includes(n)) && <span className="tag coral" style={{ alignSelf: 'center' }}>둘 다 원해요</span>}
          </div>
        </div>

        <div className="field">
          <span className="label">우선순위</span>
          <div className="chips">
            {([null, 1, 2, 3] as WishPriority[]).map((p) => (
              <button key={String(p)} type="button" className={'chip' + (priority === p ? ' on' : '')} onClick={() => setPriority(p)}>
                {p ? <><Icon name="flag" size={13} stroke={2.2} />{p}순위</> : '없음'}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">가볼 곳 <span className="muted small">(한 줄에 하나)</span></span>
          <textarea className="textarea" aria-label="가볼 곳" rows={3} value={spots} onChange={(e) => setSpots(e.target.value)} placeholder={'성산일출봉\n우도'} />
        </div>
        <div className="field">
          <span className="label">해볼 것</span>
          <textarea className="textarea" aria-label="해볼 것" rows={2} value={todos} onChange={(e) => setTodos(e.target.value)} placeholder="일출 보기" />
        </div>
        <div className="field">
          <span className="label">먹을 것</span>
          <textarea className="textarea" aria-label="먹을 것" rows={2} value={foods} onChange={(e) => setFoods(e.target.value)} placeholder="고기국수" />
        </div>

        <div className="field">
          <span className="label">가기 좋은 때</span>
          {auto && !pickMonths && <div className="small">{monthsLabel(auto.m)} <span className="muted">· {auto.why}</span></div>}
          {!auto && !pickMonths && place && <div className="small muted">아직 계산된 값이 없어요. 직접 골라도 돼요.</div>}
          {pickMonths && (
            <div className="chips">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button key={m} type="button" className={'chip' + (months.includes(m) ? ' soft-on' : '')} onClick={() => setMonths((x) => (x.includes(m) ? x.filter((y) => y !== m) : [...x, m]))}>{m}월</button>
              ))}
            </div>
          )}
          <button type="button" className="link-btn" onClick={() => setPickMonths(!pickMonths)}>{pickMonths ? '앱이 정한 달로 되돌리기' : '직접 고르기'}</button>
        </div>

        <div className="field">
          <span className="label">참고 링크 <span className="muted small">(인스타·블로그·지도, 한 줄에 하나)</span></span>
          <textarea className="textarea" aria-label="참고 링크" rows={2} value={links} onChange={(e) => setLinks(e.target.value)} placeholder="https://" />
          {lines(links).filter((l) => /^https?:\/\//.test(l)).map((l) => (
            <a key={l} href={l} target="_blank" rel="noreferrer" className="tiny" style={{ display: 'flex', gap: 4, alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Icon name="link" size={13} />{l}
            </a>
          ))}
        </div>

        <div className="field">
          <span className="label">메모</span>
          <textarea className="textarea" aria-label="메모" value={note} onChange={(e) => setNote(e.target.value)} placeholder="안 써도 돼요" maxLength={5000} />
        </div>

        <button className="btn block" disabled={!place || saving} onClick={save} data-testid="wish-save">
          {saving ? '저장 중…' : editing ? '고친 내용 저장' : '담기'}
        </button>

        {editing && existing && state?.kind === 'wish' && (
          <Link to={`/record?status=planned&place=${placeParam(existing.place)}&wish=${existing.id}`} className="btn soft block">이곳으로 여행 만들기</Link>
        )}
        {editing && existing && (
          !confirm ? (
            <button className="btn danger block" onClick={() => setConfirm(true)}><Icon name="trash" size={17} />가고 싶은 곳에서 빼기</button>
          ) : (
            <div className="card" style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>그대로 두기</button>
              <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} onClick={remove}>빼기</button>
            </div>
          )
        )}
      </div>
    </>
  );
}
