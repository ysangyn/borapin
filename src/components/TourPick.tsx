import { useState } from 'react';

/**
 * 투어·티켓 찾기: 단추 하나. 누르면 지도 앱 고르기와 같은 작은 창에서 세 곳 중 하나를 고른다.
 * 우리 공간 설정에서 한 곳을 정해 두면 창 없이 바로 그곳 검색이 열린다 (이 폰에만).
 * 공개 API가 없어(2026-10 확인) 그 도시 검색 페이지로 보낸다. 주소가 바뀌면 TOUR_SITES 한 곳만 고친다.
 */
export type TourSite = 'mrt' | 'kkday' | 'klook';
export type TourPref = TourSite | 'ask';
const enc = encodeURIComponent;
export const TOUR_SITES: Record<TourSite, { name: string; url: (q: string) => string }> = {
  mrt: { name: '마이리얼트립', url: (q) => `https://www.myrealtrip.com/search?q=${enc(q)}` },
  kkday: { name: 'KKday', url: (q) => `https://www.kkday.com/ko/product/productlist?keyword=${enc(q)}` },
  klook: { name: '클룩', url: (q) => `https://www.klook.com/ko/search/result/?query=${enc(q)}` },
};
const KEY = 'borapin:tour-app';
export const tourPref = (): TourPref => { try { const v = localStorage.getItem(KEY); return v === 'mrt' || v === 'kkday' || v === 'klook' ? v : 'ask'; } catch { return 'ask'; } };
const setTourPref = (v: TourPref) => { try { localStorage.setItem(KEY, v); } catch { /* */ } };

/** 예정 여행의 도시에서만 보이는 한 줄 단추 */
export default function TourPick({ city }: { city: string }) {
  const [open, setOpen] = useState(false);
  const go = () => {
    const p = tourPref();
    if (p !== 'ask') { window.open(TOUR_SITES[p].url(city), '_blank', 'noopener'); return; }
    setOpen(true);
  };
  return (
    <>
      <button type="button" className="btn sm soft" style={{ alignSelf: 'flex-start' }} onClick={go} data-testid="tour-pick">투어·티켓 찾기</button>
      {open && (
        <div className="map-choice-backdrop" onClick={() => setOpen(false)} data-testid="tour-choice">
          <div className="map-choice card" role="dialog" aria-label={`${city} 투어·티켓 찾기`} onClick={(e) => e.stopPropagation()}>
            <b className="jua" style={{ fontSize: 19 }}>{city} 투어·티켓</b>
            <span className="tiny muted">어디서 찾아볼까요? 우리 공간에서 한 곳을 정해 둘 수 있어요.</span>
            {(Object.keys(TOUR_SITES) as TourSite[]).map((k) => (
              <a key={k} className="btn line block" href={TOUR_SITES[k].url(city)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>{TOUR_SITES[k].name}</a>
            ))}
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setOpen(false)}>그대로 두기</button>
          </div>
        </div>
      )}
    </>
  );
}

/** 우리 공간 설정 한 줄 */
export function TourPrefSetting() {
  const [v, setV] = useState<TourPref>(tourPref);
  const pick = (x: TourPref) => { setTourPref(x); setV(x); };
  return (
    <section data-testid="tour-pref">
      <div className="label" style={{ padding: '0 4px 6px' }}>투어·티켓 찾을 곳</div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="chips">
          {(['ask', 'mrt', 'kkday', 'klook'] as const).map((k) => (
            <button key={k} className={'chip' + (v === k ? ' on' : '')} aria-pressed={v === k} onClick={() => pick(k)}>{k === 'ask' ? '누를 때마다 고르기' : TOUR_SITES[k].name}</button>
          ))}
        </div>
        <span className="tiny muted">이 폰에만 적용돼요. 해외 도시의 가고 싶은 곳·예정 여행 준비 탭에 단추가 나와요.</span>
      </div>
    </section>
  );
}
