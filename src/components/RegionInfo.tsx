import { useState } from 'react';
import { useTravelInfo } from '../lib/travelinfo';
import { accessLine } from '../lib/transport';

/** 지역 여행정보: 한 줄 테마, 볼거리·먹거리, 더보기로 특산물·교통·구·군별 */
export default function RegionInfo({ code }: { code: string }) {
  const info = useTravelInfo();
  const [more, setMore] = useState(false);
  const cell = info?.cells[code];
  if (!info || !cell) return null;
  const m = cell.main;
  const line = (label: string, items: string[]) =>
    items.length ? (
      <div className="info-line"><span className="k">{label}</span><span>{items.join(' · ')}</span></div>
    ) : null;
  return (
    <div className="region-info" data-testid="region-info">
      <div className="info-theme">{m.theme}</div>
      {line('볼거리', m.spots)}
      {line('먹거리', m.foods)}
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
                  {line('볼거리', s.spots)}
                  {line('먹거리', s.foods)}
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
