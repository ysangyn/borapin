import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import { useStudy, speak } from '../lib/study/store';
import { choices, cloze, ITEMS, speakScore, summary, todaySet, ymd, type Item } from '../lib/study/srs';

type Mode = 'learn' | 'pick' | 'blank' | 'speak' | 'saved';

/**
 * 오늘의 영어: 하루 10문장. 보기 → 고르기 → 빈칸 → 말하기, 단어장.
 * 맞고 틀림은 간격 반복에 들어가 내일 묶음을 정한다. 둘이 같은 날 같은 10문장을 본다.
 */
export default function Study() {
  const { data, grade, toggleSaved } = useStudy();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('learn');
  const today = useMemo(() => new Date(), []);
  const todayStr = ymd(today);
  const [extra, setExtra] = useState(0);
  const set = useMemo(() => (data ? todaySet(data.progress, today, extra) : []), [data, today, extra]);
  const sum = useMemo(() => (data ? summary(data.progress, data.days, today) : null), [data, today]);
  const saved = useMemo(() => (data ? ITEMS.filter((i) => data.progress[i.id]?.saved) : []), [data]);

  return (
    <>
      <TopBar back title="오늘의 영어" />
      <div className="page study" style={{ paddingTop: 4 }} data-testid="study">
        {sum && (
          <div className="study-top" data-testid="study-summary">
            <div className="stat"><b>{sum.streak}</b><span>연속 학습일</span></div>
            <div className="stat"><b>{sum.learned}</b><span>외운 문장</span></div>
            <div className="stat"><b>{sum.learning}</b><span>공부 중</span></div>
            <div className="stat"><b>{sum.saved}</b><span>단어장</span></div>
          </div>
        )}
        <div className="seg tabs" role="tablist" aria-label="공부 방법">
          {([['learn', '보기'], ['pick', '고르기'], ['blank', '빈칸'], ['speak', '말하기'], ['saved', '단어장']] as [Mode, string][]).map(([m, l]) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{l}</button>
          ))}
        </div>
        {!data && <div className="skeleton-list" aria-busy="true"><i /><i /><i /></div>}
        {data && mode === 'learn' && (
          <div className="study-list">
            <div className="small muted">오늘은 복습 {set.filter((i) => (data.progress[i.id]?.seen ?? 0) > 0 && data.progress[i.id].due <= todayStr).length}개 + 새 문장 {set.filter((i) => !data.progress[i.id] || data.progress[i.id].seen <= 1).length}개 · 90초면 돼요. <b>외웠어요</b>·<b>다시</b>가 내일 묶음을 정해요.</div>
            {set.map((it, i) => <LearnCard key={it.id} item={it} n={i + 1} saved={!!data.progress[it.id]?.saved} box={data.progress[it.id]?.box ?? 0} onGrade={(ok) => { grade(it.id, ok); toast(ok ? '외웠어요 · 며칠 뒤 한 번 더 물어볼게요' : '다시 · 내일 또 보여 드릴게요'); }} onSave={() => toggleSaved(it.id)} />)}
            {extra < 6 && <button className="btn soft block" onClick={() => setExtra(extra + 3)} data-testid="study-more">새 문장 3개 더</button>}
            {extra >= 6 && <div className="small muted" style={{ textAlign: 'center' }}>오늘은 여기까지 — 내일 또 봐요. 많이보다 매일이 이겨요.</div>}
          </div>
        )}
        {data && mode === 'pick' && <PickQuiz items={set} onGrade={grade} go={setMode} />}
        {data && mode === 'blank' && <BlankQuiz items={set} onGrade={grade} go={setMode} />}
        {data && mode === 'speak' && <SpeakDrill items={set} onGrade={grade} go={setMode} />}
        {data && mode === 'saved' && (
          <div className="study-list">
            {saved.length === 0 && <div className="empty"><b>단어장이 비어 있어요</b><span className="small">문장 카드 오른쪽 위 깃발을 누르면 여기에 모여요.</span></div>}
            {saved.map((it) => (
              <div key={it.id} className="card white study-word">
                {it.words.map(([w, m]) => <div key={w} className="study-word-row"><b>{w}</b><span className="muted">{m}</span><button className="icon-btn" aria-label={`${w} 읽어 주기`} onClick={() => speak(w)}><Icon name="play" size={16} /></button></div>)}
                <div className="tiny muted">{it.en} · {it.ko}</div>
                <button className="link-btn" onClick={() => toggleSaved(it.id)}>단어장에서 빼기</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function LearnCard({ item, n, saved, box, onGrade, onSave }: { item: Item; n: number; saved: boolean; box: number; onGrade: (ok: boolean) => void; onSave: () => void }) {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <article className={'card white study-card' + (done !== null ? ' done' : '')} data-testid="study-card">
      <header>
        <span className="tiny muted">{n}. {item.topicLabel}{box >= 5 ? ' · 외운 문장' : box > 0 ? ` · ${box}단계` : ''}</span>
        <button className={'icon-btn' + (saved ? ' on' : '')} aria-label={saved ? '단어장에서 빼기' : '단어장에 넣기'} aria-pressed={saved} onClick={onSave}><Icon name="flag" size={16} stroke={2.2} /></button>
      </header>
      <button className="study-en" onClick={() => speak(item.en)} aria-label={`${item.en} 읽어 주기`}>
        <span>{item.en}</span><Icon name="play" size={18} />
      </button>
      <div className="study-ko">{item.ko}</div>
      <div className="chips">{item.words.map(([w, m]) => <span key={w} className="chip soft-on" style={{ height: 30, fontSize: 12.5 }}>{w} <span className="muted" style={{ fontWeight: 500 }}>{m}</span></span>)}</div>
      <div className="study-actions">
        <button className="btn sm soft" disabled={done !== null} onClick={() => { setDone(false); onGrade(false); }}>다시</button>
        <button className="btn sm" disabled={done !== null} onClick={() => { setDone(true); onGrade(true); }} data-testid="study-know">외웠어요</button>
      </div>
    </article>
  );
}

function PickQuiz({ items, onGrade, go }: { items: Item[]; onGrade: (id: string, ok: boolean) => void; go: (m: Mode) => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const item = items[i];
  const opts = useMemo(() => (item ? choices(item, `${item.id}-${i}`) : []), [item, i]);
  if (!item) return <Finish score={score} total={items.length} next="blank" go={go} />;
  const answer = (id: string) => {
    if (picked) return;
    setPicked(id);
    const ok = id === item.id;
    if (ok) setScore((s) => s + 1);
    onGrade(item.id, ok);
  };
  return (
    <div className="card white study-quiz" data-testid="study-pick">
      <div className="tiny muted">{i + 1} / {items.length} · 뜻에 맞는 영어를 고르세요</div>
      <div className="study-q">{item.ko}</div>
      <div className="study-opts">
        {opts.map((o) => (
          <button key={o.id} className={'study-opt' + (picked ? (o.id === item.id ? ' right' : o.id === picked ? ' wrong' : '') : '')} onClick={() => answer(o.id)} disabled={!!picked}>{o.en}</button>
        ))}
      </div>
      {picked && <div className="study-actions"><button className="btn sm soft" onClick={() => speak(item.en)}>읽어 주기</button><button className="btn sm" onClick={() => { setI(i + 1); setPicked(null); }}>{i + 1 < items.length ? '다음' : '끝'}</button></div>}
    </div>
  );
}

function BlankQuiz({ items, onGrade, go }: { items: Item[]; onGrade: (id: string, ok: boolean) => void; go: (m: Mode) => void }) {
  const list = useMemo(() => items.map((it) => ({ it, z: cloze(it) })).filter((x) => x.z), [items]);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const cur = list[i];
  if (!cur) return <Finish score={score} total={list.length} next="speak" go={go} />;
  const check = () => {
    const ok = text.trim().toLowerCase() === cur.z!.answer.toLowerCase();
    setResult(ok);
    if (ok) setScore((s) => s + 1);
    onGrade(cur.it.id, ok);
  };
  return (
    <div className="card white study-quiz" data-testid="study-blank">
      <div className="tiny muted">{i + 1} / {list.length} · 빈칸에 들어갈 말을 쓰세요</div>
      <div className="study-q">{cur.z!.text}</div>
      <div className="small muted">{cur.it.ko} · 힌트: {cur.it.words[0][1]}</div>
      <input className="input" aria-label="빈칸 답" value={text} onChange={(e) => setText(e.target.value)} disabled={result !== null} onKeyDown={(e) => { if (e.key === 'Enter' && text.trim() && result === null) check(); }} autoCapitalize="none" autoCorrect="off" />
      {result === null ? (
        <div className="study-actions"><button className="btn sm" disabled={!text.trim()} onClick={check}>확인</button></div>
      ) : (
        <>
          <div className={'small ' + (result ? 'ok-text' : 'bad-text')}>{result ? '맞았어요!' : `아쉬워요 · 답은 "${cur.z!.answer}"`}</div>
          <div className="study-actions"><button className="btn sm soft" onClick={() => speak(cur.it.en)}>읽어 주기</button><button className="btn sm" onClick={() => { setI(i + 1); setText(''); setResult(null); }}>{i + 1 < list.length ? '다음' : '끝'}</button></div>
        </>
      )}
    </div>
  );
}

function SpeakDrill({ items, onGrade, go }: { items: Item[]; onGrade: (id: string, ok: boolean) => void; go: (m: Mode) => void }) {
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [total, setTotal] = useState(0);
  const item = items[i];
  const SR = typeof window !== 'undefined' ? ((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition) : undefined;
  if (!item) return <Finish score={total} total={items.length} next="saved" go={go} />;
  const listen = () => {
    if (!SR || listening) return;
    const rec = new (SR as new () => { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void; start: () => void })();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript ?? '';
      setHeard(t);
      const s = speakScore(item.en, t);
      setScore(s);
      const ok = s >= 0.7;
      if (ok) setTotal((x) => x + 1);
      onGrade(item.id, ok);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };
  return (
    <div className="card white study-quiz" data-testid="study-speak">
      <div className="tiny muted">{i + 1} / {items.length} · 듣고 따라 말해 보세요</div>
      <button className="study-en" onClick={() => speak(item.en)}><span>{item.en}</span><Icon name="play" size={18} /></button>
      <div className="small muted">{item.ko}</div>
      {!SR && <div className="small muted">이 브라우저는 음성 인식이 안 돼요. 크롬이나 삼성 인터넷에서 열어 주세요. 대신 소리 내어 읽고 "외웠어요"를 눌러도 돼요.</div>}
      <div className="study-actions">
        {!!SR && <button className={'btn sm' + (listening ? ' listening' : ' soft')} onClick={listen} disabled={listening}>{listening ? '듣는 중…' : '🎤 말하기'}</button>}
        {!SR && <button className="btn sm soft" onClick={() => { onGrade(item.id, true); setScore(1); }}>외웠어요</button>}
        <button className="btn sm" onClick={() => { setI(i + 1); setHeard(''); setScore(null); }}>{i + 1 < items.length ? '다음' : '끝'}</button>
      </div>
      {score !== null && (
        <div className={'small ' + (score >= 0.7 ? 'ok-text' : 'bad-text')}>
          {Math.round(score * 100)}점{heard ? ` · 들린 말: "${heard}"` : ''}{score >= 0.7 ? ' · 좋아요!' : ' · 한 번 더 들어 보고 따라 해 봐요'}
        </div>
      )}
    </div>
  );
}

const NEXT_LABEL: Partial<Record<Mode, string>> = { blank: '빈칸 풀기', speak: '말하기 해 보기', saved: '단어장 보기' };

/** 오늘 몫 끝: 막다른 곳이 되지 않게 다음 공부 방법과 홈으로 가는 단추를 둔다 */
function Finish({ score, total, next, go }: { score: number; total: number; next: Mode; go: (m: Mode) => void }) {
  return (
    <div className="card white study-quiz" data-testid="study-finish">
      <div className="study-q">오늘 몫 끝! {score}/{total}</div>
      <div className="small muted">틀린 건 내일 묶음에 먼저 나와요. 내일 또 봐요 👋</div>
      <div className="study-actions">
        <button className="btn sm" onClick={() => go(next)} data-testid="study-next">{NEXT_LABEL[next]}</button>
        <Link to="/" className="btn sm ghost">홈으로</Link>
      </div>
    </div>
  );
}
