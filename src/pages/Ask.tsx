import { useEffect, useMemo, useRef, useState } from 'react';
import { ScenicPhoto } from '../components/Scene';
import { photoById } from '../lib/media';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { usePlaces, useTrips, useWishes } from '../lib/data';
import { useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { quickWish } from '../lib/wishActions';
import { ask, STARTERS, type Answer, type AskCtx, type Btn } from '../lib/ask/engine';
import type { Place } from '../lib/types';

type Msg = { who: 'me'; text: string } | { who: 'bot'; a: Answer; q: string };

/** 찾아보기: 규칙형 답변기 (비용·횟수 제한 없음, 기기 안에서 처리) */
export default function Ask() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const auth = useAuth();
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const { places: recs } = usePlaces();
  const info = useTravelInfo();
  const seasons = useSeasons();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ctx, setCtx] = useState<AskCtx>({});
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const ready = !!(trips && wishes && recs && info);
  const data = useMemo(() => (ready ? { trips: trips!, wishes: wishes!, recs: recs!, info: info!, seasons } : null), [ready, trips, wishes, recs, info, seasons]);

  const send = (q: string, forced?: Place) => {
    if (!q.trim() || !data) return;
    const a = ask(q, forced ? { ...ctx, place: forced } : ctx, data, forced);
    setCtx(a.ctx);
    setMsgs((m) => [...m, ...(forced ? [] : [{ who: 'me' as const, text: q }]), { who: 'bot', a, q }]);
    setText('');
  };

  // 홈에서 넘어온 질문
  const first = sp.get('q');
  useEffect(() => {
    if (first && data && msgs.length === 0) {
      send(first);
      setSp({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, data]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs.length]);

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
      <TopBar back title="찾아보기" right={msgs.length > 0 ? <button className="btn sm line" onClick={() => { setMsgs([]); setCtx({}); }}>처음으로</button> : undefined} />
      <div className="page ask-page" style={{ paddingTop: 4 }} data-testid="ask">
        {msgs.length === 0 && (
          <div className={'card' + (photoById('seorak') ? ' ask-hero' : '')} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: photoById('seorak') ? '64px 16px 16px' : undefined }}>
            {photoById('seorak') && <ScenicPhoto id="seorak" alt="" />}
            <b style={{ fontSize: photoById('seorak') ? 20 : undefined }}>어디 갈지, 어디 갔었는지 물어보세요</b>
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
            <div key={i} className="bubble bot" data-testid="answer">
              <b>{m.a.text}</b>
              {m.a.lines && m.a.lines.length > 0 && <ul>{m.a.lines.map((l, j) => <li key={j}>{l}</li>)}</ul>}
              {m.a.source && <span className="tiny muted">{m.a.source}</span>}
              {m.a.buttons.length > 0 && (
                <div className="chips" style={{ marginTop: 4 }}>
                  {m.a.buttons.map((b, j) => (
                    <button key={j} className={'chip' + (b.wish ? ' on-coral' : b.choose ? ' soft-on' : '')} onClick={() => press(b, m.q)}>
                      {b.wish && <Icon name="heart" size={13} stroke={2.2} />}
                      {b.url && <Icon name="external" size={12} />}
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
        <div ref={end} />
      </div>
      <form className="ask-bar" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <input className="input" aria-label="질문" placeholder={ready ? '강릉 맛집, 작년 여름에 간 곳…' : '불러오는 중…'} value={text} onChange={(e) => setText(e.target.value)} disabled={!ready} />
        <button className="btn" style={{ width: 52, padding: 0 }} aria-label="묻기" disabled={!ready || !text.trim()}><Icon name="search" size={20} stroke={2.2} /></button>
      </form>
    </>
  );
}
