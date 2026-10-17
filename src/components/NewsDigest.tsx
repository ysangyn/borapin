import { useMemo, useState } from 'react';
import { GENERAL_QUERIES, newsAgo, newsSpec, orderNewsTabs, useNewsTabs, type NewsTab } from '../lib/news';
import { aiAvailable } from '../lib/ask/smart';
import type { Place } from '../lib/types';

/**
 * 소식 묶음: 가고 싶은 곳(상위 3곳) + '여행 전반'(유류할증료·항공권·취항·무비자·축제).
 * 탭은 새 소식이 있는 곳부터 가장 최근 순, 소식 없는 곳은 뒤로(흐리게). 기사는 최근 순.
 * 사건·사고 기사는 거른다(newsFilter). 뒷단(Worker)이 없으면 아예 안 보인다.
 */
export default function NewsDigest({ places, compact }: { places: Place[]; compact?: boolean }) {
  const placeKey = places.slice(0, 3).map((p) => JSON.stringify(p)).join('|');
  const tabs: NewsTab[] = useMemo(() => [
    ...places.slice(0, 3).map((p) => { const s = newsSpec(p); return { key: s.queries[0], label: s.label, queries: s.queries, match: s.match }; }),
    { key: 'general', label: '여행 전반', queries: GENERAL_QUERIES, match: '' },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [placeKey]);
  const got = useNewsTabs(aiAvailable() ? tabs : null);
  const ordered = useMemo(() => (got ? orderNewsTabs(tabs, got) : tabs), [tabs, got]);
  const [selKey, setSelKey] = useState<string | null>(null);
  if (!aiAvailable()) return null;
  const tab = ordered.find((t) => t.key === selKey) ?? ordered[0];
  const items = got ? got[tab.key] ?? [] : null;
  return (
    <section className="card white news-digest" data-testid="news-digest">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div className="hub-label">소식</div>
        <span className="tiny muted">구글 뉴스 · 최근 순</span>
      </div>
      <div className="chips news-tabs" role="tablist" aria-label="소식 고르기">
        {ordered.map((t) => {
          const n = got?.[t.key]?.length ?? 0;
          const on = t.key === tab.key;
          return (
            <button key={t.key} role="tab" aria-selected={on} className={'chip' + (on ? ' on' : '') + (got && !n ? ' dim' : '')} onClick={() => setSelKey(t.key)}>
              {t.label}{got ? ` ${n}` : ''}
            </button>
          );
        })}
      </div>
      {items === null && <div className="skeleton-list" aria-busy="true"><i /><i /></div>}
      {items && items.length === 0 && <div className="small muted" style={{ padding: '6px 0' }}>{tab.match ? `한 달 사이 ${tab.label} 여행 소식이 없어요.` : '요즘 올라온 소식이 없어요. 조금 뒤에 다시 볼게요.'}</div>}
      {items && items.length > 0 && (
        <div className="news-strip" style={{ marginTop: 2 }}>
          {items.slice(0, compact ? 3 : 5).map((n) => (
            <a key={n.link} href={n.link} target="_blank" rel="noreferrer" className="news-row">
              <span className="news-title">{n.title}</span>
              <span className="tiny muted">{n.source}{n.at ? ` · ${newsAgo(n.at)}` : ''}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
