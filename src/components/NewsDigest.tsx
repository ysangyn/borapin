import { useState } from 'react';
import { GENERAL_NEWS_QUERY, newsAgo, newsQuery, useNewsQuery } from '../lib/news';
import { aiAvailable } from '../lib/ask/smart';
import { placeLabel } from '../lib/geo';
import type { Place } from '../lib/types';

/**
 * 소식 묶음: 가고 싶은 곳(상위 3곳)마다 3줄 + '여행 전반'(유류할증료·항공권·축제·여권·환율).
 * 탭으로 고르고, 사건·사고 기사는 거른다(newsFilter). 뒷단(Worker)이 없으면 아예 안 보인다.
 */
export default function NewsDigest({ places, compact }: { places: Place[]; compact?: boolean }) {
  const tabs = [...places.slice(0, 3).map((p) => ({ key: newsQuery(p), label: placeLabel(p) })), { key: GENERAL_NEWS_QUERY, label: '여행 전반' }];
  const [sel, setSel] = useState(0);
  const items = useNewsQuery(aiAvailable() ? tabs[Math.min(sel, tabs.length - 1)].key : '');
  if (!aiAvailable()) return null;
  return (
    <section className="card white news-digest" data-testid="news-digest">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div className="hub-label">소식</div>
        <span className="tiny muted">구글 뉴스 · 6시간마다</span>
      </div>
      <div className="chips news-tabs" role="tablist" aria-label="소식 고르기">
        {tabs.map((t, i) => <button key={t.key} role="tab" aria-selected={sel === i} className={'chip' + (sel === i ? ' on' : '')} onClick={() => setSel(i)}>{t.label}</button>)}
      </div>
      {items === null && <div className="skeleton-list" aria-busy="true"><i /><i /></div>}
      {items && items.length === 0 && <div className="small muted" style={{ padding: '6px 0' }}>요즘 올라온 소식이 없어요.</div>}
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
