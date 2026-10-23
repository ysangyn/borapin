import { saveHome, useHome } from '../lib/home';
import { REGION_BY_CODE, regionLong } from '../lib/geo';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScenicPhoto } from '../components/Scene';
import { photoById } from '../lib/media';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, TopBar, useBusy, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { usePlaces, useTrips, useWishes } from '../lib/data';
import { useSeasons } from '../lib/seasons';
import { useWorld } from '../lib/world';
import { useFestivals } from '../lib/festivals';
import { readNotesOnce, readPlansOnce } from '../lib/tripExtras';
import { readPhotosOnce } from '../lib/photos';
import { EMPTY_TRAVEL_INFO, useTravelInfoState } from '../lib/travelinfo';
import { quickWish } from '../lib/wishActions';
import { ask, STARTERS, type Answer, type AskCtx, type AskData, type Btn } from '../lib/ask/engine';
import { askSmart } from '../lib/ask/smart';
import type { Note, Photo, Place, PlanItem } from '../lib/types';

type Msg = { who: 'me'; text: string } | { who: 'bot'; a: Answer; q: string };

/**
 * 사진·글·일정은 '우리 기록' 질문에만 쓰이고 양이 많다. 화면을 열자마자 구독하지 않고
 * 첫 질문을 보낼 때 한 번만 읽어 둔다(getDocs). 하나라도 못 읽으면 그 자료만 비운 채 답한다.
 */
type Records = { notes: Note[]; photos: Photo[]; plans: PlanItem[] };
const NO_RECORDS: Records = { notes: [], photos: [], plans: [] };
async function readRecordsOnce(): Promise<Records> {
  const [notes, photos, plans] = await Promise.all([readNotesOnce().catch(() => []), readPhotosOnce().catch(() => []), readPlansOnce().catch(() => [])]);
  return { notes, photos, plans };
}
/** 단추 순서: 담기 → 화면으로 → 고르기 → 이어 묻기 */
const rank = (b: Btn) => (b.wish ? 0 : b.to ? 1 : b.choose ? 2 : 3);

const CHAT_KEY = 'borapin:ask-chat';
function loadChat(): { msgs: Msg[]; ctx: AskCtx } | null {
  try { const raw = sessionStorage.getItem(CHAT_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveChat(msgs: Msg[], ctx: AskCtx) {
  try { if (msgs.length) sessionStorage.setItem(CHAT_KEY, JSON.stringify({ msgs: msgs.slice(-30), ctx })); else sessionStorage.removeItem(CHAT_KEY); } catch { /* 저장소 없어도 그만 */ }
}

/** 찾아보기: 규칙형 답변기 (비용·횟수 제한 없음, 기기 안에서 처리) */
export default function Ask() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const auth = useAuth();
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const { places: recs } = usePlaces();
  // 여행정보 조각을 못 받아도 입력칸은 열어 둔다 (우리 기록으로는 답할 수 있으니). 안내와 '다시 받기'는 아래 카드로
  const { info, failed: infoFailed, loading: infoLoading, retry: retryInfo } = useTravelInfoState();
  const seasons = useSeasons();
  const festivals = useFestivals();
  // 사진·글·일정: 첫 질문 때 한 번만 읽는다 (구독 없음). 읽는 중엔 같은 약속을 돌려쓴다
  const [records, setRecords] = useState<Records | null>(null);
  const recordsP = useRef<Promise<Records> | null>(null);
  const loadRecords = () => {
    if (!recordsP.current) recordsP.current = readRecordsOnce().catch(() => NO_RECORDS).then((r) => { setRecords(r); return r; });
    return recordsP.current;
  };
  // 대화는 이 탭 안에서 이어진다: 새로 고침·다른 화면에 다녀와도 그대로 (sessionStorage, 실패하면 그냥 메모리)
  const [msgs, setMsgs] = useState<Msg[]>(() => loadChat()?.msgs ?? []);
  const [ctx, setCtx] = useState<AskCtx>(() => loadChat()?.ctx ?? {});
  useEffect(() => { saveChat(msgs, ctx); }, [msgs, ctx]);
  // 대화 중에는 새 버전으로 바꾸지 않는다 (화면이 갑자기 새로 고쳐지지 않게)
  useBusy(msgs.length > 0);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const ready = !!(trips && wishes && recs && (info || infoFailed));
  const world = useWorld();
  const home = useHome();
  // 기록(여행·가고 싶은 곳·우리 장소)과 자료는 앱이 이미 들고 있는 것. 사진·글·일정은 질문할 때 붙인다
  const base = useMemo<Omit<AskData, 'notes' | 'photos' | 'plans'> | null>(() => (ready ? { trips: trips!, wishes: wishes!, recs: recs!, info: info ?? EMPTY_TRAVEL_INFO, seasons, festivals, world, home: home ?? null } : null), [ready, trips, wishes, recs, info, seasons, festivals, world, home]);
  // 되묻기에서 알려 준 동네를 우리 집으로 저장 (둘이 같이 쓴다)
  const keepHome = (p?: Place) => {
    if (!p || p.t !== 'kr') return;
    const r = REGION_BY_CODE.get(p.code);
    if (r) void saveHome({ label: regionLong(r.code), code: r.code, lat: r.lat, lng: r.lng, exact: false }).catch(() => toast('우리 집을 저장하지 못했어요'));
  };

  const [thinking, setThinking] = useState(false);
  // 말로 묻기 (폰 브라우저의 음성 인식, 무료). 지원하는 기기에서만 단추가 보인다
  const SR = typeof window !== 'undefined' ? ((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition) : undefined;
  const [listening, setListening] = useState(false);
  const listen = () => {
    if (!SR || listening) return;
    const rec = new (SR as new () => { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void; start: () => void })();
    rec.lang = 'ko-KR';
    rec.interimResults = false;
    rec.onresult = (e) => { const t = e.results[0]?.[0]?.transcript ?? ''; if (t) void send(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); toast('잘 못 들었어요. 다시 말해 주세요'); };
    setListening(true);
    rec.start();
  };
  const send = async (q: string, forced?: Place) => {
    if (!q.trim() || !base || thinking) return;
    const c = forced ? { ...ctx, place: forced } : ctx;
    if (forced) {
      // 되묻기에서 고른 지역: 첫 질문 때 읽어 둔 기록을 그대로 쓴다 (아직 없으면 지금 읽는다)
      const rec = records ?? (await loadRecords());
      const a = ask(q, c, { ...base, ...rec }, forced);
      setCtx(a.ctx);
      setMsgs((m) => [...m, { who: 'bot', a, q }]);
      return;
    }
    setMsgs((m) => [...m, { who: 'me' as const, text: q }]);
    setText('');
    setThinking(true);
    try {
      // 사진·글·일정은 여기서 처음(그리고 한 번만) 읽는다
      const rec = await loadRecords();
      const history = msgs.flatMap((m, i) => (m.who === 'bot' && msgs[i - 1]?.who === 'me' ? [{ q: (msgs[i - 1] as { text: string }).text, a: m.a.text }] : []));
      const r = await askSmart(q, c, { ...base, ...rec }, auth.status === 'ready' ? auth.user : null, history);
      setCtx(r.answer.ctx);
      keepHome(r.answer.setHome);
      setMsgs((m) => [...m, { who: 'bot', a: r.answer, q }]);
    } finally {
      setThinking(false);
    }
  };

  // 홈에서 넘어온 질문
  // 질문을 보낸 사이 화면이 새로 고쳐졌으면(새 버전 조각 받기 등) 답 없는 마지막 질문을 이어서 다시 묻는다
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || !base) return;
    resumed.current = true;
    const last = msgs[msgs.length - 1];
    if (last?.who === 'me') { setMsgs((m) => m.slice(0, -1)); void send(last.text); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);
  const first = sp.get('q');
  const sentFirst = useRef('');
  useEffect(() => {
    if (first && base && sentFirst.current !== first) {
      sentFirst.current = first;
      send(first);
      setSp({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, base]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs.length, thinking]);

  const press = async (b: Btn, q: string) => {
    if (b.ask) send(b.ask);
    else if (b.choose) send(q, b.choose);
    else if (b.to) nav(b.to);
    else if (b.url) window.open(b.url, '_blank', 'noopener');
    else if (b.wish && auth.status === 'ready') {
      try {
        const { id, already } = await quickWish(b.wish, auth.user, wishes ?? []);
        toast(already ? '이미 담겨 있어요' : '가고 싶은 곳에 담았어요', { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
      } catch {
        toast('담지 못했어요. 다시 해 주세요');
      }
    }
  };

  return (
    <>
      <TopBar back title="물어보기" right={msgs.length > 0 ? <button className="btn sm line" onClick={() => { setMsgs([]); setCtx({}); saveChat([], {}); }}>처음으로</button> : undefined} />
      <div className="page ask-page" style={{ paddingTop: 4 }} data-testid="ask">
        {infoFailed && !info && (
          <div className="card coral-soft" style={{ display: 'flex', gap: 10, alignItems: 'center' }} role="status" data-testid="info-failed">
            <span className="small" style={{ flex: 1 }}>
              <b>여행 정보 자료를 못 받았어요</b>
              <span className="tiny muted" style={{ display: 'block' }}>우리 기록으로는 지금도 찾아 드려요. 연결을 확인하고 다시 받아 보세요.</span>
            </span>
            <button type="button" className="btn sm" onClick={retryInfo} disabled={infoLoading}>{infoLoading ? '받는 중…' : '다시 받기'}</button>
          </div>
        )}
        {msgs.length === 0 && (
          <div className={'card' + (photoById('seorak') ? ' ask-hero' : '')} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: photoById('seorak') ? '64px 16px 16px' : undefined }}>
            {photoById('seorak') && <ScenicPhoto id="seorak" alt="" label="top" />}
            <div className="ask-head">
              <img src="/art/pini.svg" alt="" width={56} height={56} decoding="async" />
              <b style={{ fontSize: photoById('seorak') ? 20 : undefined }}>어디 갈지, 어디 갔었는지 물어보세요</b>
            </div>
            <span className="small muted">국내 160곳 여행정보와 가기 좋은 때, 우리 기록에서 바로 찾아 드려요.</span>
            <div className="chips">
              {STARTERS.map((s) => <button key={s} className="chip" onClick={() => send(s)} disabled={!ready}>{s}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.who === 'me' ? (
            <div key={i} className="bubble me">{m.text}</div>
          ) : (
            <div key={i} className="bot-row">
            <img className="bot-face" src="/art/pini.svg" alt="" aria-hidden="true" width={28} height={28} decoding="async" />
            <div className="bubble bot" data-testid="answer">
              <p className="bot-text">{m.a.text}</p>
              {m.a.lines && m.a.lines.length > 0 && <ul>{m.a.lines.map((l, j) => <li key={j}>{l}</li>)}</ul>}
              {m.a.items && m.a.items.length > 0 && (
                <div className="ask-items" data-testid="ask-items">
                  {m.a.items.map((it, j) => (
                    <div key={j} className="ask-item">
                      <button type="button" className="ask-item-main" onClick={() => it.open && press(it.open, m.q)} disabled={!it.open}>
                        <b>{it.title}</b>
                        {it.sub && <span className="tiny muted">{it.sub}</span>}
                      </button>
                      {/* 담기는 핀 모양 (하트는 마음에만) */}
                      {it.wish && <button type="button" className="ask-item-heart" aria-label={`${it.title} 가고 싶은 곳에 담기`} onClick={() => press({ label: `${it.title} 담기`, wish: it.wish }, m.q)}><Icon name="pin" size={18} stroke={2.2} /></button>}
                    </div>
                  ))}
                </div>
              )}
              {m.a.source && <span className="tiny muted">{m.a.source}</span>}
              {m.a.buttons.some((b) => !b.url) && (
                <div className="chips ask-actions">
                  {[...m.a.buttons.filter((b) => !b.url)].sort((x, y) => rank(x) - rank(y)).map((b, j) => (
                    <button key={j} className={'chip' + (b.wish ? ' on-coral' : b.choose ? ' soft-on' : b.to ? ' soft' : '')} onClick={() => press(b, m.q)}>
                      {b.wish && <Icon name="pin" size={13} stroke={2.2} />}
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
              {m.a.buttons.some((b) => b.url) && (
                <div className="ask-links">
                  {m.a.buttons.filter((b) => b.url).map((b, j) => (
                    <button key={j} className="link-btn" onClick={() => press(b, m.q)}><Icon name="external" size={12} />{b.label}</button>
                  ))}
                </div>
              )}
            </div>
            </div>
          ),
        )}
        {thinking && <div className="bot-row" aria-live="polite"><img className="bot-face" src="/art/pini.svg" alt="" aria-hidden="true" width={28} height={28} /><div className="bubble bot thinking"><span className="dots-typing"><i /><i /><i /></span><span className="tiny muted">핀이가 기록을 뒤져 보는 중…</span></div></div>}
        <div ref={end} />
      </div>
      <form className="ask-bar" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <input className="input" aria-label="질문" placeholder={ready ? '강릉 맛집, 작년 여름에 간 곳…' : '불러오는 중…'} value={text} onChange={(e) => setText(e.target.value)} disabled={!ready} enterKeyHint="send" />
        {!!SR && !text.trim() && (
          <button type="button" className={'btn soft' + (listening ? ' listening' : '')} style={{ width: 52, padding: 0 }} aria-label={listening ? '듣는 중' : '말로 묻기'} disabled={!ready || thinking} onClick={listen}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
          </button>
        )}
        <button className="btn" style={{ width: 52, padding: 0 }} aria-label="묻기" disabled={!ready || thinking || !text.trim()}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg></button>
      </form>
    </>
  );
}
