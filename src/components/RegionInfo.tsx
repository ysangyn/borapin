import { useState } from 'react';
import { useTravelInfo } from '../lib/travelinfo';
import { accessLine } from '../lib/transport';
import { trendAt, trendTags, useTrend } from '../lib/trend';
import TourSpots from './TourSpots';
import { useMapChoice } from './MapChoice';
import { REGION_BY_CODE } from '../lib/geo';

/** 지역 여행정보: 요즘 꼬리표(뜨는 곳·한적해요), 한 줄 테마, 볼거리·먹거리, 더보기로 특산물·교통·구·군별 */
export default function RegionInfo({ code }: { code: string }) {
  const info = useTravelInfo();
  const trend = useTrend();
  const [more, setMore] = useState(false);
  const [openMap, mapChoice] = useMapChoice();
  const cell = info?.cells[code];
  if (!info || !cell) return null;
  const m = cell.main;
  const tags = trendTags(code, trend);
  const area = REGION_BY_CODE.get(code)?.name ?? '';
  const line = (label: string, items: string[]) =>
    items.length ? (
      <div className="info-line"><span className="k">{label}</span><span>{items.join(' · ')}</span></div>
    ) : null;
  // 볼거리·먹거리는 하나씩 누르면 네이버지도·카카오맵 중 골라 바로 확인 (먹거리는 이름으로 그 지역 맛집 검색)
  const tapLine = (label: string, items: string[], where = area) =>
    items.length ? (
      <div className="info-line"><span className="k">{label}</span>
        <span className="tap-items">{items.map((x) => <button key={x} type="button" className="tap-item" onClick={() => openMap({ name: x, area: where, search: true })}>{x}</button>)}</span>
      </div>
    ) : null;
  return (
    <div className="region-info" data-testid="region-info">
      {tags.length > 0 && (
        <div className="trend-tags" data-testid="trend-tags">
          {tags.map((t) => (
            <span key={t.k} className={`chip trend-${t.k}`}>{t.t}{t.why && <small> · {t.why}</small>}</span>
          ))}
          {trendAt(trend) && <span className="tiny muted">{trendAt(trend)}</span>}
        </div>
      )}
      <div className="info-theme">{m.theme}</div>
      {tapLine('볼거리', m.spots)}
      {tapLine('먹거리', m.foods)}
      {mapChoice}
      <TourSpots code={code} />
      {accessLine({ t: 'kr', code }) && <div className="info-line" data-testid="region-access"><span className="k">가는 길</span><span>{accessLine({ t: 'kr', code })}</span></div>}
      {more && (
        <>
          {line('특산물', m.goods)}
          {line('교통', m.transport)}
          {m.note && <div className="info-line"><span className="k">참고</span><span>{m.note}</span></div>}
          {cell.subs.length > 0 && (
            <div className="info-subs">
              {cell.subs.map((s) => (
                <details key={s.name}>
                  <summary><b>{s.name}</b> <span className="muted">{s.theme}</span></summary>
                  {tapLine('볼거리', s.spots, `${area} ${s.name}`)}
                  {tapLine('먹거리', s.foods, `${area} ${s.name}`)}
                  {line('특산물', s.goods)}
                  {line('교통', s.transport)}
                  {s.note && <div className="info-line"><span className="k">참고</span><span>{s.note}</span></div>}
                </details>
              ))}
            </div>
          )}
          <div className="tiny muted" style={{ marginTop: 6 }}>보라핀 여행정보 · {info.updated} 확인</div>
        </>
      )}
      {(m.goods.length > 0 || m.transport.length > 0 || cell.subs.length > 0) && (
        <button className="link-btn" onClick={() => setMore(!more)} aria-expanded={more}>
          {more ? '접기' : cell.subs.length ? `더보기 · ${cell.subs.length}개 구·군·섬` : '더보기'}
        </button>
      )}
    </div>
  );
}
