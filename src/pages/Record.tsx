import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon, Spinner, TopBar, useGoBack, useLeaveGuard, useToast } from '../components/ui';
import PlacePicker from '../components/PlacePicker';
import { useAuth } from '../lib/auth';
import { companionSuggestions, createTrip, updateTrip, updateWish, useTrips } from '../lib/data';
import { fromInputDate, SEASON_LABEL, toInputDate } from '../lib/dates';
import { parsePlaceParam, placeLabel } from '../lib/geo';
import type { Place, Precision, Season, TripInput, TripKind, TripStatus, When } from '../lib/types';
import { celebrate, whatsNew } from '../lib/celebrate';
import { memberNames } from '../lib/members';
import { pickImages, uploadBlocker, uploadSummary, useUploader } from '../lib/uploader';
import { useFlags } from '../lib/admin';

const PRECISIONS: { p: Precision; label: string }[] = [
  { p: 'day', label: '날짜' },
  { p: 'month', label: '몇 월쯤' },
  { p: 'season', label: '계절만' },
  { p: 'year', label: '몇 년쯤' },
  { p: 'unknown', label: '몰라요' },
];
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];


export default function Record() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const goBack = useGoBack();
  const toast = useToast();
  const auth = useAuth();
  // 새 기록에 바로 올릴 사진 (저장되면 그 여행에 올라간다)
  const [pending, setPending] = useState<File[]>([]);
  const previews = useMemo(() => pending.map((f) => URL.createObjectURL(f)), [pending]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploader = useUploader();
  const flags = useFlags();
  const { trips } = useTrips();
  const existing = useMemo(() => trips?.find((t) => t.id === id), [trips, id]);
  const thisYear = new Date().getFullYear();

  const [kind, setKind] = useState<TripKind>('trip');
  const [status, setStatus] = useState<TripStatus>(sp.get('status') === 'planned' ? 'planned' : 'done');
  const [places, setPlaces] = useState<Place[]>(() => parsePlaceParam(sp.get('place')));
  const [when, setWhen] = useState<When>({ p: 'day' });
  const [companions, setCompanions] = useState<string[]>(() => memberNames());
  const [newName, setNewName] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!editing);

  useEffect(() => {
    if (editing && existing && !loaded) {
      setKind(existing.kind);
      setStatus(existing.status);
      setPlaces(existing.places);
      setWhen(existing.when);
      setCompanions(existing.companions);
      setTitle(existing.title);
      setMemo(existing.memo);
      setLoaded(true);
    }
  }, [editing, existing, loaded]);

  const suggestions = useMemo(() => {
    const s = companionSuggestions(trips ?? []);
    for (const c of companions) if (!s.includes(c)) s.push(c);
    return s;
  }, [trips, companions]);

  const autoTitle = places.length ? `${placeLabel(places[0])} ${kind === 'outing' ? '나들이' : '여행'}` : '';
  const whenOk = when.p === 'unknown' || (when.p === 'day' ? !!(when.y && when.m && when.d) : when.p === 'month' ? !!(when.y && when.m) : when.p === 'season' ? !!when.s : !!when.y);
  const endBeforeStart = when.p === 'day' && !!when.d2 && toInputDate(when.y2 ?? when.y, when.m2 ?? when.m, when.d2) < toInputDate(when.y, when.m, when.d);
  const canSave = places.length > 0 && whenOk && !endBeforeStart && !saving;
  // 쓰던 내용이 있는지 (나갈 때 묻기)
  const dirty = !saving && (editing ? loaded && !!existing && (title !== existing.title || memo !== existing.memo || JSON.stringify(places) !== JSON.stringify(existing.places) || JSON.stringify(when) !== JSON.stringify(existing.when)) : !!memo.trim() || !!title.trim());
  useLeaveGuard(dirty);

  const setP = (p: Precision) => setWhen((w) => ({ p, y: w.y ?? (p === 'unknown' ? undefined : thisYear), m: p === 'day' || p === 'month' ? w.m : undefined, d: p === 'day' ? w.d : undefined, d2: p === 'day' ? w.d2 : undefined, m2: p === 'day' ? w.m2 : undefined, y2: p === 'day' ? w.y2 : undefined, s: p === 'season' ? w.s : undefined }));

  const toggleCompanion = (c: string) => setCompanions((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const addName = () => {
    const n = newName.trim();
    if (n && !companions.includes(n)) setCompanions([...companions, n]);
    setNewName('');
  };

  const save = async () => {
    if (!canSave || auth.status !== 'ready') return;
    setSaving(true);
    const input: TripInput = {
      title: title.trim() || autoTitle,
      kind,
      status,
      when: when.p === 'unknown' ? { p: 'unknown' } : when,
      places,
      companions,
      memo: memo.trim(),
      tags: existing?.tags ?? [],
      source: existing?.source ?? 'app',
    };
    try {
      if (editing && id && existing) {
        await updateTrip(id, existing, input);
        toast('고쳤어요');
        goBack(`/trips/${id}`);
      } else {
        const news = status === 'done' && trips ? whatsNew(trips, [...trips, { ...input, id: 'new', v: 1 }]) : null;
        const newId = await createTrip(input, auth.user);
        const wishId = sp.get('wish');
        if (wishId) await updateWish(wishId, { tripId: newId }).catch((e) => console.warn(e));
        if (news) celebrate();
        if (pending.length) {
          const block = await uploadBlocker(flags);
          if (block) toast(`기록했어요 · 사진은 못 올렸어요: ${block}`);
          else {
            const r = await uploader.run(pending, newId, auth.user);
            toast(`기록했어요 · ${uploadSummary(r.ok, r.fails)}`);
          }
          nav(`/trips/${newId}?tab=photos`, { replace: true });
          return;
        }
        toast(status === 'planned' ? '여행 계획을 담았어요' : `기록했어요${news ? ` · ${news}` : ''}`);
        nav(`/trips/${newId}`, { replace: true });
      }
    } catch (e) {
      console.error(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
      setSaving(false);
    }
  };

  const years = Array.from({ length: thisYear + 3 - 1980 }, (_, i) => thisYear + 2 - i);

  if (editing && !loaded) {
    if (trips && !existing)
      return (
        <>
          <TopBar back backTo="/trips" title="기록 고치기" />
          <div className="empty" style={{ margin: 20 }}><b>이 기록을 찾을 수 없어요</b><span className="small">지워졌거나 주소가 바뀌었어요.</span></div>
        </>
      );
    return <Spinner />;
  }

  return (
    <>
      <TopBar back backTo={editing && id ? `/trips/${id}` : '/'} confirmLeave={dirty} title={editing ? '기록 고치기' : '기록 남기기'} />
      <div className="page" style={{ paddingTop: 4, gap: 20 }}>
        <div className="small muted" style={{ marginTop: -8 }}>어디, 대략 언제만 있으면 저장돼요.</div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div className="seg-labeled"><span className="tiny muted">종류</span>
          <div className="seg" role="radiogroup" aria-label="종류">
            <button role="radio" aria-checked={kind === 'trip'} className={kind === 'trip' ? 'on' : ''} onClick={() => setKind('trip')}>여행</button>
            <button role="radio" aria-checked={kind === 'outing'} className={kind === 'outing' ? 'on' : ''} onClick={() => setKind('outing')}>나들이</button>
          </div></div>
          <div className="seg-labeled"><span className="tiny muted">언제</span>
          <div className="seg" role="radiogroup" aria-label="상태">
            <button role="radio" aria-checked={status === 'done'} className={status === 'done' ? 'on' : ''} onClick={() => setStatus('done')}>다녀왔어요</button>
            <button role="radio" aria-checked={status === 'planned'} className={status === 'planned' ? 'on' : ''} onClick={() => setStatus('planned')}>갈 예정</button>
          </div></div>
        </div>

        <div className="field">
          <span className="label">어디<span className="req">*</span></span>
          <PlacePicker value={places} onChange={setPlaces} />
        </div>

        <div className="field">
          <span className="label">{status === 'planned' ? '언제쯤' : '대략 언제'}<span className="req">*</span></span>
          <div className="chips">
            {PRECISIONS.map((x) => (
              <button key={x.p} type="button" aria-pressed={when.p === x.p} className={'chip' + (when.p === x.p ? ' on' : '')} onClick={() => setP(x.p)}>{x.label}</button>
            ))}
          </div>
          {when.p === 'day' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="input" type="date" aria-label="시작 날짜" value={toInputDate(when.y, when.m, when.d)} onChange={(e) => setWhen({ ...when, ...fromInputDate(e.target.value) })} />
              <span className="muted">–</span>
              <input
                className="input" type="date" aria-label="끝 날짜 (선택)"
                value={toInputDate(when.y2 ?? when.y, when.m2 ?? when.m, when.d2)}
                onChange={(e) => {
                  const r = fromInputDate(e.target.value);
                  setWhen({ ...when, y2: r.y, m2: r.m, d2: r.d });
                }}
              />
            </div>
          )}
          {endBeforeStart && <div className="tiny" style={{ color: 'var(--danger)' }}>끝나는 날이 시작하는 날보다 빨라요</div>}
          {(when.p === 'month' || when.p === 'season' || when.p === 'year') && (
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="select" aria-label="연도" value={when.y ?? ''} onChange={(e) => setWhen({ ...when, y: e.target.value ? +e.target.value : undefined })}>
                {when.p === 'season' && <option value="">연도 모름</option>}
                {years.map((y) => <option key={y} value={y}>{y}년</option>)}
              </select>
              {when.p === 'month' && (
                <select className="select" aria-label="월" value={when.m ?? ''} onChange={(e) => setWhen({ ...when, m: e.target.value ? +e.target.value : undefined })}>
                  <option value="">월 고르기</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}
                </select>
              )}
            </div>
          )}
          {when.p === 'season' && (
            <div className="chips">
              {SEASONS.map((s) => (
                <button key={s} type="button" aria-pressed={when.s === s} className={'chip' + (when.s === s ? ' soft-on' : '')} onClick={() => setWhen({ ...when, s })}>{SEASON_LABEL[s]}</button>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <span className="label">누구와</span>
          <div className="chips">
            {suggestions.map((c) => (
              <button key={c} type="button" aria-pressed={companions.includes(c)} className={'chip' + (companions.includes(c) ? ' soft-on' : '')} onClick={() => toggleCompanion(c)}>
                {companions.includes(c) && <Icon name="check" size={13} stroke={2.6} />}{c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input" aria-label="함께 간 사람 이름" placeholder="함께 간 사람 이름 (엄마, 동생…)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addName(); } }} />
            <button type="button" className="btn soft sm" style={{ height: 46 }} onClick={addName}>추가</button>
          </div>
        </div>

        <div className="field">
          <span className="label">제목</span>
          <input className="input" aria-label="제목" placeholder={autoTitle || '비워 두면 자동으로 지어요'} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
        </div>

        {!editing && (
          <div className="field">
            <span className="label">사진 <span className="muted" style={{ fontWeight: 500 }}>(선택 · 저장하면 같이 올라가요)</span></span>
            <div className="pending-photos">
              {previews.map((u, i) => (
                <button key={u} type="button" className="pending-photo" aria-label={`${pending[i].name} 빼기`} onClick={() => setPending((l) => l.filter((_, j) => j !== i))}>
                  <img src={u} alt="" />
                  <span className="pending-x"><Icon name="x" size={12} stroke={2.6} /></span>
                </button>
              ))}
              <button type="button" className="pending-add" onClick={() => fileInput.current?.click()} aria-label="사진 고르기" data-testid="record-photo-add">
                <Icon name="image" size={22} stroke={1.8} />
                <span className="tiny">{pending.length ? '더 고르기' : '사진 고르기'}</span>
              </button>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden data-testid="record-photo-input" onChange={(e) => { const add = pickImages(e.target.files); if (add.length !== (e.target.files?.length ?? 0)) toast('사진 파일만 올릴 수 있어요'); setPending((l) => [...l, ...add].slice(0, 30)); e.target.value = ''; }} />
            </div>
          </div>
        )}

        <div className="field">
          <span className="label">메모</span>
          <textarea className="textarea" aria-label="메모" placeholder="안 써도 돼요" value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={10000} />
        </div>

        {uploader.queue.length > 0 && <div className="small muted" role="status">사진 올리는 중 {uploader.queue.filter((q) => q.pct >= 1).length}/{uploader.queue.length}…</div>}
        <button className="btn block" disabled={!canSave} onClick={save} data-testid="save">
          {saving ? '저장 중…' : editing ? '고친 내용 저장' : '저장하기'}
        </button>
        {!places.length && <div className="tiny muted" style={{ textAlign: 'center', marginTop: -10 }} data-testid="save-hint">어디를 하나 이상 골라 주세요</div>}
        {places.length > 0 && !whenOk && <div className="tiny muted" style={{ textAlign: 'center', marginTop: -10 }} data-testid="save-hint">대략 언제인지 골라 주세요 · 모르면 '몰라요'를 눌러요</div>}
      </div>
    </>
  );
}
