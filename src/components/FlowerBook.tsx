import { useState } from 'react';
import { COUNTRY_BY_ID, REGION_BY_CODE } from '../lib/geo';
import { flowerSrc, krFlowers, worldFlowers } from '../lib/flowers';
import type { Stats } from '../lib/stats';

/**
 * 모은 꽃 (설계서 C2): 다녀온 시·군의 꽃, 다녀온 나라의 나라꽃을 도감처럼. 못 본 꽃은 회색 선.
 * '국내 160송이 중 18송이'는 칸 수(같은 꽃도 고장마다 한 송이), '꽃 종류'는 서로 다른 꽃 수.
 */
export default function FlowerBook({ stats }: { stats: Stats }) {
  const [tab, setTab] = useState<'kr' | 'world'>('kr');
  const kr = krFlowers(), world = worldFlowers();
  const items = tab === 'kr'
    ? Object.entries(kr).map(([code, f]) => ({ key: code, where: REGION_BY_CODE.get(code)?.name.split(' ').pop() ?? code, f, got: stats.cellVisits.has(code) }))
    : Object.entries(world).map(([id, f]) => ({ key: id, where: COUNTRY_BY_ID.get(id)?.name ?? id, f, got: stats.countryVisits.has(id) }));
  if (!Object.keys(kr).length) return null;
  const got = items.filter((x) => x.got);
  const kindsGot = new Set(got.map((x) => x.f.name)).size;
  // 모은 꽃이 앞, 못 본 꽃은 12송이만 살짝
  const shown = [...got, ...items.filter((x) => !x.got).slice(0, 12)];
  return (
    <section data-testid="flower-book">
      <div className="row-between" style={{ marginBottom: 6, alignItems: 'center' }}>
        <h2 className="h2">모은 꽃</h2>
        <div className="chips">
          <button className={'chip' + (tab === 'kr' ? ' on' : '')} onClick={() => setTab('kr')}>국내</button>
          {Object.keys(world).length > 0 && <button className={'chip' + (tab === 'world' ? ' on' : '')} onClick={() => setTab('world')}>세계</button>}
        </div>
      </div>
      <div className="small muted" style={{ marginBottom: 8 }}>
        {tab === 'kr' ? `국내 ${items.length}송이 중 ${got.length}송이` : `나라꽃 ${got.length}송이`} · 꽃 종류 {kindsGot}가지
      </div>
      <div className="flower-grid">
        {shown.map((x) => (
          <div key={x.key} className={'flower-cell' + (x.got ? '' : ' gray')} title={`${x.where} · ${x.f.name}`}>
            <img src={flowerSrc(x.f.icon, x.got ? '' : '-gray')} alt="" width={48} height={48} loading="lazy" />
            <b>{x.got ? x.f.name : '?'}</b>
            <span>{x.where}</span>
          </div>
        ))}
      </div>
      {items.length > shown.length && <div className="tiny muted" style={{ marginTop: 6 }}>아직 {items.length - got.length}송이가 기다려요</div>}
    </section>
  );
}
