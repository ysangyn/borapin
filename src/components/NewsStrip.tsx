import { newsAgo, useNews } from '../lib/news';
import type { Place } from '../lib/types';

/** 지역 소식 몇 줄: 제목 · 출처 · 언제. 누르면 기사(바깥)로 */
export default function NewsStrip({ place, max = 3, title = '요즘 소식' }: { place: Place; max?: number; title?: string }) {
  const items = useNews(place);
  if (!items || !items.length) return null;
  return (
    <div className="news-strip" data-testid="news-strip">
      <div className="tiny" style={{ fontWeight: 800, color: 'var(--ink3)', marginBottom: 4 }}>{title}</div>
      {items.slice(0, max).map((n) => (
        <a key={n.link} href={n.link} target="_blank" rel="noreferrer" className="news-row">
          <span className="news-title">{n.title}</span>
          <span className="tiny muted">{n.source}{n.at ? ` · ${newsAgo(n.at)}` : ''}</span>
        </a>
      ))}
    </div>
  );
}
