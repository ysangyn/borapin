import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Icon, TopBar } from '../components/ui';
import { phraseLangFor, speakPhrase, usePhrases } from '../lib/phrases';

/** 현지어 한마디: 말 하나의 여행 표현 30문장, 묶음별로 보고 읽어 준다 */
export default function Phrases() {
  const { lang = '' } = useParams();
  const [sp] = useSearchParams();
  const data = usePhrases();
  const code = data?.langs[lang] ? lang : phraseLangFor(lang) ?? lang;
  const pack = data?.langs[code];
  const [group, setGroup] = useState<string>('');
  const items = useMemo(() => (pack ? pack.items.filter((p) => !group || p[0] === group) : []), [pack, group]);
  const city = sp.get('city') ?? '';
  return (
    <>
      <TopBar back title={pack ? `${pack.label} 한마디` : '현지어 한마디'} />
      <div className="page" style={{ paddingTop: 4 }} data-testid="phrases">
        {!data && <div className="skeleton-list" aria-busy="true"><i /><i /><i /></div>}
        {data && !pack && (
          <div className="empty"><b>이 말의 표현은 아직 없어요</b><span className="small">영어 표현은 <Link to="/study">오늘의 영어</Link>에서 매일 익힐 수 있어요.</span></div>
        )}
        {pack && (
          <>
            <div className="small muted">{city ? `${city}에서 ` : ''}쓸 만한 {pack.items.length}문장. 글자를 누르면 읽어 줘요 — 가게에서 보여 줘도 돼요.</div>
            <div className="chips" role="tablist" aria-label="묶음">
              <button role="tab" aria-selected={!group} className={'chip' + (!group ? ' on' : '')} onClick={() => setGroup('')}>전체</button>
              {data.groups.map((g) => <button key={g} role="tab" aria-selected={group === g} className={'chip' + (group === g ? ' on' : '')} onClick={() => setGroup(g)}>{g}</button>)}
            </div>
            <div className="list">
              {items.map(([g, ko, nat, snd]) => (
                <button key={g + ko} type="button" className="phrase-row" onClick={() => speakPhrase(nat, pack.speech)} aria-label={`${ko} 읽어 주기`} data-testid="phrase-row">
                  <span className="phrase-ko">{ko}{!group && <span className="tiny muted"> · {g}</span>}</span>
                  <span className="phrase-native">{nat}</span>
                  <span className="phrase-sound">{snd}</span>
                  <Icon name="play" size={16} className="phrase-play" />
                </button>
              ))}
            </div>
            <div className="tiny muted" style={{ textAlign: 'center' }}>발음은 한글로 적어 둔 가까운 소리예요. 자료 {data.updated.slice(0, 7).replace('-', '.')} 기준</div>
          </>
        )}
      </div>
    </>
  );
}
