import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { LngLatBoundsLike, Map as MLMap } from 'maplibre-gl';
import { loadGeo, SIZES } from '../lib/geodata';
import seas from '../data/seas.json';
import { COUNTRY_BY_ID, REGION_BY_CODE } from '../lib/geo';
import type { Place } from '../lib/types';
import type { Stats } from '../lib/data';
import { Icon } from './ui';
import { labelsFor } from './mapLabels';
import { addGardenPatterns } from './gardenPatterns';
import { patternOf, type Plant } from '../lib/garden';
import { toneOf } from '../lib/members';

// v6는 워커 파일을 자기 옆에서 찾는데, 번들되면 그 자리에 파일이 없다 → 주소를 직접 알려 준다.
maplibregl.setWorkerUrl(workerUrl);

export type MapMode = 'kr' | 'world';

export const BOUNDS: Record<MapMode, LngLatBoundsLike> = {
  kr: [[124.6, 33.1], [130.95, 38.65]],
  world: [[-160, -45], [180, 70]],
};

const KOREA: [number, number] = [127.6, 36.2];

/** 화면 맞추기: 국내는 남한 전체(가까이 볼 곳이 있으면 그 둘레), 세계는 한국 + 다녀온(예정) 나라가 다 보이게 */
function frame(map: MLMap, mode: MapMode, stats: Stats | null, duration: number, near?: Place[], nearZoom = 7.3) {
  if (mode === 'kr') {
    const pts = (near ?? []).flatMap((p) => (p.t === 'kr' ? [REGION_BY_CODE.get(p.code)] : [])).filter((r): r is NonNullable<typeof r> => !!r);
    if (pts.length) {
      const b = new maplibregl.LngLatBounds([pts[0].lng, pts[0].lat], [pts[0].lng, pts[0].lat]);
      pts.forEach((r) => b.extend([r.lng, r.lat]));
      return map.fitBounds(b, { padding: { top: 56, bottom: 48, left: 56, right: 72 }, maxZoom: nearZoom, duration });
    }
    return map.fitBounds(BOUNDS.kr, { padding: 16, duration });
  }
  const pts: [number, number][] = [KOREA];
  const ids = stats ? [...stats.countryVisits.keys(), ...stats.countryPlanned] : [];
  for (const id of ids) {
    const c = COUNTRY_BY_ID.get(id);
    if (c) pts.push([c.lng, c.lat]);
  }
  if (pts.length === 1) return map.easeTo({ center: [KOREA[0], 30], zoom: 1.6, duration });
  const b = new maplibregl.LngLatBounds(pts[0], pts[0]);
  pts.forEach((p) => b.extend(p));
  map.fitBounds(b, { padding: { top: 90, bottom: 60, left: 50, right: 70 }, maxZoom: 3.2, duration });
}

const COLORS = { v1: '#B9A8F5', v2: '#8D73EE', v3: '#5B3FD1', none: '#F3EFE6', sea: '#E3E9F5', land: '#ECE8E0' };

function fillExpr() {
  return [
    'case',
    ['boolean', ['feature-state', 'planned'], false], '#F6F2FF',
    ['>=', ['coalesce', ['feature-state', 'visits'], 0], 3], COLORS.v3,
    ['==', ['coalesce', ['feature-state', 'visits'], 0], 2], COLORS.v2,
    ['==', ['coalesce', ['feature-state', 'visits'], 0], 1], COLORS.v1,
    COLORS.none,
  ] as unknown as maplibregl.ExpressionSpecification;
}

export interface MapFlag {
  id: string;
  place: Place;
  priority: number | null;
  both: boolean;
}

/** 우리 장소가 있는 지역 */
export interface MapSpot { place: Place; count: number }

export interface MapViewProps {
  mode: MapMode;
  stats: Stats | null;
  height?: number | string;
  cooperative?: boolean;
  controls?: boolean;
  legend?: boolean;
  selected?: Place | null;
  onSelect?: (p: Place | null) => void;
  /** 이 장소들만 강조 (여행 상세) */
  focus?: Place[];
  /** 가고 싶은 곳 깃발 */
  flags?: MapFlag[];
  /** 우리 장소가 있는 지역 (개수) */
  spots?: MapSpot[];
  /** 이 장소로 화면 이동 (색칠은 그대로) */
  flyTo?: Place | null;
  /** 처음 열 때 이 장소들 둘레를 가까이 (홈: 최근 핀·이달의 추천). 비어 있으면 남한 전체 */
  near?: Place[];
  /** near로 가까이 갈 때 최대 확대 (기본 7.3: 시·군 이름이 보이는 정도, 6.3: 도 단위) */
  nearZoom?: number;
  className?: string;
  controlsTop?: number;
  legendBottom?: number;
  /** false면 손가락·마우스로 움직이지 않는 그림 지도 (여행 상세·공유 미리보기) */
  interactive?: boolean;
  /** 심는 지도: 다녀온 칸을 보라 대신 풀밭·새싹·들꽃 무늬로 (홈·큰 지도) */
  garden?: Map<string, Plant> | null;
}

export default function MapView({ mode, stats, height = 300, cooperative, controls = true, legend, selected, onSelect, focus, flags, spots, flyTo, near, nearZoom, className, controlsTop = 12, legendBottom = 12, interactive = true, garden }: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [ready, setReady] = useState(false);
  // 'data': 경계 자료를 못 받음(다시 받으면 됨) · 'gl': 이 기기가 WebGL을 못 써서 지도를 아예 못 그림
  const [failed, setFailed] = useState<'' | 'data' | 'gl'>('');
  // 같은 장소 목록이면 다시 맞추지 않게 (상대가 다른 여행을 고쳐도 지도가 튀지 않게)
  const focusKey = focus ? JSON.stringify(focus) : '';
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const nearRef = useRef(near);
  nearRef.current = near;
  const nearZoomRef = useRef(nearZoom);
  nearZoomRef.current = nearZoom;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const labelBox = useRef<HTMLDivElement>(null);
  const labelEls = useRef(new Map<string, HTMLSpanElement>());
  const shown = useRef(new Set<string>());
  const raf = useRef(0);
  const krData = useRef<GeoJSON.FeatureCollection | null>(null);

  // 지역 이름 배치: 화면 안, 겹치지 않게, 다녀온 곳 > 큰 곳 순
  const layoutLabels = () => {
    const map = mapRef.current;
    const box = labelBox.current;
    if (!map || !box) return;
    const set = labelsFor(modeRef.current, map.getZoom());
    const W = box.clientWidth, H = box.clientHeight;
    const s = statsRef.current;
    const ordered = set
      .map((l) => {
        const on = l.visited(s);
        const size = l.sizeKey ? SIZES.get(l.sizeKey) ?? 0 : 0;
        return { l, on, p: l.base + (on ? 10000 : 0) + Math.log2(1 + size * 100) * 10 };
      })
      .sort((a, b) => b.p - a.p);
    const placed: number[][] = [];
    const next = new Set<string>();
    for (const { l, on } of ordered) {
      const pt = map.project([l.lng, l.lat]);
      const x0 = pt.x - l.w / 2, y0 = pt.y - l.h / 2, x1 = x0 + l.w, y1 = y0 + l.h;
      if (x0 < 2 || y0 < 2 || x1 > W - 2 || y1 > H - 2) continue;
      if (placed.some((b) => x0 < b[2] + 2 && x1 > b[0] - 2 && y0 < b[3] + 1 && y1 > b[1] - 1)) continue;
      placed.push([x0, y0, x1, y1]);
      let el = labelEls.current.get(l.key);
      if (!el) {
        el = document.createElement('span');
        el.className = `map-label ${l.kind}`;
        el.textContent = l.text;
        box.appendChild(el);
        labelEls.current.set(l.key, el);
      }
      el.style.transform = `translate(${Math.round(x0)}px, ${Math.round(y0)}px)`;
      posRef.current.set(l.key, { lng: l.lng, lat: l.lat, w: l.w, h: l.h });
      el.classList.toggle('on', on);
      el.style.display = '';
      next.add(l.key);
    }
    for (const k of shown.current) if (!next.has(k)) { const el = labelEls.current.get(k); if (el) el.style.display = 'none'; }
    shown.current = next;
    zoomAtLayout.current = map.getZoom();
    layoutAt.current = performance.now();
  };
  const posRef = useRef(new Map<string, { lng: number; lat: number; w: number; h: number }>());
  const zoomAtLayout = useRef(-1);
  const layoutAt = useRef(0); // 오래 끌면 0.4초마다 새로 들어온 이름표도 놓는다
  /** 끌기(확대 없이)일 때는 보이는 이름표만 같은 순간에 옮긴다 → 그림과 글자가 함께 움직인다 */
  const followLabels = () => {
    const map = mapRef.current;
    if (!map || Math.abs(map.getZoom() - zoomAtLayout.current) > 1e-6 || performance.now() - layoutAt.current > 400) return scheduleLabels();
    for (const k of shown.current) {
      const el = labelEls.current.get(k), q = posRef.current.get(k);
      if (!el || !q) continue;
      const pt = map.project([q.lng, q.lat]);
      el.style.transform = `translate(${Math.round(pt.x - q.w / 2)}px, ${Math.round(pt.y - q.h / 2)}px)`;
    }
  };
  const layoutRef = useRef(layoutLabels);
  layoutRef.current = layoutLabels;
  const scheduleLabels = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => layoutRef.current());
  };
  const fittedRef = useRef('');

  // 지도 만들기
  useEffect(() => {
    if (!el.current) return;
    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: el.current,
        style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': COLORS.sea } }] },
        ...(mode === 'kr' ? { bounds: BOUNDS.kr, fitBoundsOptions: { padding: 16 } } : { center: [KOREA[0], 30] as [number, number], zoom: 1.6 }),
        minZoom: 0.6,
        maxZoom: 11,
        attributionControl: false,
        // 폰(손가락)에서는 한 손가락으로 바로 움직이고 두 손가락으로 확대. PC에서만 '⌘/Ctrl + 휠'로 확대해 페이지 스크롤을 막지 않는다
        cooperativeGestures: !!cooperative && !(typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches),
        interactive,
        locale: {
          'CooperativeGesturesHandler.WindowsHelpText': 'Ctrl을 누른 채 스크롤하면 확대돼요',
          'CooperativeGesturesHandler.MacHelpText': '⌘를 누른 채 스크롤하면 확대돼요',
          'CooperativeGesturesHandler.MobileHelpText': '두 손가락으로 움직여 주세요',
        },
        dragRotate: false,
        pitchWithRotate: false,
        renderWorldCopies: false,
      });
    } catch (e) {
      // WebGL을 못 쓰는 기기(옛 폰·그래픽 가속 꺼짐)에서는 만들다 예외가 난다 → 지도 칸 안에만 안내하고 나머지 화면은 그대로 둔다
      console.warn(e);
      setFailed('gl');
      return;
    }
    map.touchZoomRotate.disableRotation();
    // 시험용: 지금 가운데 (손가락으로 움직였는지 확인)
    map.on('moveend', () => { const c = map.getCenter(); if (el.current) el.current.dataset.center = `${c.lng.toFixed(3)},${c.lat.toFixed(3)}`; });
    mapRef.current = map;
    let cancelled = false;
    map.on('load', async () => {
      let g: Awaited<ReturnType<typeof loadGeo>>;
      try {
        g = await loadGeo();
      } catch (e) {
        console.warn(e);
        if (!cancelled) setFailed('data');
        return;
      }
      if (cancelled) return;
      map.addSource('world', { type: 'geojson', data: g.world, promoteId: 'ADM0_A3' });
      map.addSource('kr', { type: 'geojson', data: g.kr, promoteId: 'cell' });
      map.addSource('krmesh', { type: 'geojson', data: { type: 'Feature', geometry: g.krMesh, properties: {} } });
      map.addLayer({ id: 'world-fill', type: 'fill', source: 'world', paint: { 'fill-color': fillExpr() } });
      map.addLayer({ id: 'world-line', type: 'line', source: 'world', paint: { 'line-color': '#FFFFFF', 'line-width': 0.6 } });
      map.addLayer({ id: 'kr-fill', type: 'fill', source: 'kr', paint: { 'fill-color': fillExpr() } });
      // 심는 지도: 칸 자료에 무늬 이름(pat)·새싹 테두리 색(ring)을 넣어 그린다 (무늬는 feature-state로 못 바꿔서)
      krData.current = g.kr as GeoJSON.FeatureCollection;
      try { addGardenPatterns(map); } catch (e) { console.warn(e); }
      map.addLayer({ id: 'kr-garden', type: 'fill', source: 'kr', filter: ['has', 'pat'], paint: { 'fill-pattern': ['get', 'pat'] } });
      map.addLayer({ id: 'kr-ring', type: 'line', source: 'kr', filter: ['has', 'ring'], paint: { 'line-color': ['get', 'ring'], 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.2, 8, 2.6] } });
      map.addLayer({ id: 'kr-line', type: 'line', source: 'kr', paint: { 'line-color': '#FFFFFF', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.3, 8, 1] } });
      map.addLayer({ id: 'kr-group', type: 'line', source: 'krmesh', paint: { 'line-color': '#FFFFFF', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 8, 2.4] } });
      map.addLayer({
        id: 'kr-planned', type: 'line', source: 'kr',
        paint: { 'line-color': COLORS.v3, 'line-width': 1.2, 'line-dasharray': [2, 1.5], 'line-opacity': ['case', ['boolean', ['feature-state', 'planned'], false], 1, 0] },
      });
      map.addLayer({
        id: 'world-planned', type: 'line', source: 'world',
        paint: { 'line-color': COLORS.v3, 'line-width': 1, 'line-dasharray': [2, 1.5], 'line-opacity': ['case', ['boolean', ['feature-state', 'planned'], false], 1, 0] },
      });
      for (const src of ['kr', 'world'] as const) {
        map.addLayer({
          id: `${src}-sel`, type: 'line', source: src,
          paint: { 'line-color': COLORS.v3, 'line-width': ['case', ['boolean', ['feature-state', 'sel'], false], 3, 0] },
        });
      }
      // 바다 이름
      const markers: { m: maplibregl.Marker; rank: number }[] = [];
      for (const s of seas) {
        const div = document.createElement('div');
        div.className = 'sea-label' + (s.rank === 0 ? ' big' : '');
        div.textContent = s.name;
        markers.push({ m: new maplibregl.Marker({ element: div }).setLngLat([s.lng, s.lat]).addTo(map), rank: s.rank });
      }
      const updateSeas = () => {
        const z = map.getZoom();
        for (const { m, rank } of markers) {
          const show = rank === 0 ? z < 4.5 : rank <= 2 ? z >= 2.2 && z < 6.5 : rank === 5 ? z >= 5.2 : z >= 3.5 && z < 7;
          m.getElement().style.display = show ? '' : 'none';
        }
      };
      map.on('zoom', updateSeas);
      updateSeas();

      map.on('click', (e) => {
        const f = map.queryRenderedFeatures(e.point, { layers: ['kr-fill', 'world-fill'] });
        const kr = f.find((x) => x.layer.id === 'kr-fill');
        if (kr) return onSelectRef.current?.({ t: 'kr', code: String(kr.properties.cell) });
        const w = f.find((x) => x.layer.id === 'world-fill');
        if (w && w.properties.ADM0_A3 !== 'KOR') return onSelectRef.current?.({ t: 'country', id: String(w.properties.ADM0_A3) });
        onSelectRef.current?.(null);
      });
      map.on('mousemove', (e) => {
        if (!onSelectRef.current) return;
        const f = map.queryRenderedFeatures(e.point, { layers: ['kr-fill', 'world-fill'] });
        map.getCanvas().style.cursor = f.length ? 'pointer' : '';
      });
      map.on('move', followLabels);
      map.on('moveend', scheduleLabels);
      map.on('resize', scheduleLabels);
      scheduleLabels();
      if (import.meta.env.VITE_EMULATOR === '1') (window as unknown as { __map?: MLMap }).__map = map;

      // 점검용: 실제로 그려진 경계 수를 남긴다
      map.on('idle', () => {
        if (!el.current) return;
        const n = map.queryRenderedFeatures({ layers: ['kr-fill', 'world-fill'] }).length;
        el.current.dataset.features = String(n);
        el.current.dataset.zoom = map.getZoom().toFixed(2);
      });
      setReady(true);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 국내/세계, 기록이 바뀌면 이름도 다시 배치
  useEffect(() => {
    if (ready) scheduleLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, stats, ready]);

  // 세계 지도에서는 국내 160칸을 숨기고 한국을 나라 하나로 칠한다
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const vis = mode === 'kr' ? 'visible' : 'none';
    for (const id of ['kr-fill', 'kr-line', 'kr-group', 'kr-planned', 'kr-sel']) map.setLayoutProperty(id, 'visibility', vis);
  }, [mode, ready]);

  // 처음 열 때, 기록이 처음 들어왔을 때, 국내/세계를 바꿀 때만 화면을 맞춘다
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || focus?.length) return;
    const key = mode + (stats ? ':s' : '');
    if (fittedRef.current === key) return;
    const animate = fittedRef.current !== '' && fittedRef.current.split(':')[0] !== mode;
    fittedRef.current = key;
    frame(map, mode, stats, animate ? 700 : 0, nearRef.current, nearZoomRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ready, focusKey, stats]);

  // 색칠
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !stats) return;
    map.removeFeatureState({ source: 'kr' });
    map.removeFeatureState({ source: 'world' });
    const focusSet = focus ? new Set(focus.map((p) => (p.t === 'kr' ? p.code : p.id))) : null;
    for (const [code, n] of stats.cellVisits) if (!focusSet || focusSet.has(code)) map.setFeatureState({ source: 'kr', id: code }, { visits: n });
    for (const code of stats.cellPlanned) if (!focusSet || focusSet.has(code)) map.setFeatureState({ source: 'kr', id: code }, { planned: true });
    // 국내 지도에서는 이웃 나라를 칠하지 않는다 (우리나라 칸에 눈이 가게)
    if (mode === 'world') {
      for (const [id, n] of stats.countryVisits) if (!focusSet || focusSet.has(id)) map.setFeatureState({ source: 'world', id }, { visits: n });
      for (const id of stats.countryPlanned) if (!focusSet || focusSet.has(id)) map.setFeatureState({ source: 'world', id }, { planned: true });
      if (!focusSet && (stats.cellVisits.size || stats.cellPlanned.size)) map.setFeatureState({ source: 'world', id: 'KOR' }, { visits: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, ready, focusKey, mode]);

  // 선택 표시
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const src of ['kr', 'world']) {
      const prev = (map as unknown as { __sel?: Record<string, string> }).__sel?.[src];
      if (prev) map.setFeatureState({ source: src, id: prev }, { sel: false });
    }
    const sel: Record<string, string> = {};
    if (selected) {
      const src = selected.t === 'kr' ? 'kr' : 'world';
      const id = selected.t === 'kr' ? selected.code : selected.id;
      map.setFeatureState({ source: src, id }, { sel: true });
      sel[src] = id;
    }
    (map as unknown as { __sel?: Record<string, string> }).__sel = sel;
  }, [selected, ready]);

  // 심는 지도 무늬
  useEffect(() => {
    const map = mapRef.current, base = krData.current;
    if (!map || !ready || !base) return;
    const focusSet = focus ? new Set(focus.map((p) => (p.t === 'kr' ? p.code : p.id))) : null;
    const RING = ['#F07A95', '#4D7FE0'];
    const fc: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: base.features.map((f) => {
        const code = String(f.properties?.cell ?? '');
        const p = garden?.get(code);
        if (!p || (focusSet && !focusSet.has(code))) return f;
        const t = p.stage === 'sprout' && p.by.length === 1 ? toneOf(p.by[0]) : -1;
        return { ...f, properties: { ...f.properties, pat: patternOf(p), ...(t >= 0 ? { ring: RING[t % 2] } : {}) } };
      }),
    };
    (map.getSource('kr') as maplibregl.GeoJSONSource | undefined)?.setData(fc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garden, ready, focusKey]);

  // 새싹·꽃이 있는 칸을 누르면 그 자리에 한 송이 피어난다 (0.6초, 움직임 줄이기면 그냥 보였다 사라짐)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !selected || selected.t !== 'kr') return;
    const p = garden?.get(selected.code), r = REGION_BY_CODE.get(selected.code);
    if (!p || p.stage === 'seed' || !r) return;
    // 지도는 표시 위치를 transform으로 잡으므로 움직임은 안쪽 그림에만
    const box = document.createElement('div');
    box.className = 'bloom-box';
    box.dataset.testid = 'bloom';
    const img = document.createElement('img');
    img.src = p.stage === 'flower' ? '/art/garden/flower.svg' : '/art/garden/sprout.svg';
    img.alt = '';
    img.className = 'bloom-marker';
    box.appendChild(img);
    const m = new maplibregl.Marker({ element: box }).setLngLat([r.lng, r.lat]).addTo(map);
    const t = window.setTimeout(() => m.remove(), 1600);
    return () => { window.clearTimeout(t); m.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, ready]);

  // 가고 싶은 곳 깃발 (국내 지도엔 국내, 세계 지도엔 나라)
  const flagMarkers = useRef<maplibregl.Marker[]>([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    flagMarkers.current.forEach((m) => m.remove());
    flagMarkers.current = [];
    for (const f of flags ?? []) {
      if ((f.place.t === 'kr') !== (mode === 'kr')) continue;
      const at = f.place.t === 'kr' ? REGION_BY_CODE.get(f.place.code) : COUNTRY_BY_ID.get(f.place.id);
      if (!at) continue;
      const el = document.createElement('div');
      el.className = 'wish-flag-marker';
      el.dataset.testid = 'wish-flag';
      el.innerHTML = `<div class="wish-flag${f.both ? ' both' : ''}"><svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true"><path d="M2 21V2" stroke="#c4553a" stroke-width="2" stroke-linecap="round"/><path d="M3 2.5h11l-2.4 4L14 10.5H3z" fill="#FF7A59" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>${f.priority ? `<b>${f.priority}</b>` : ''}</div>`;
      flagMarkers.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [5, -7] }).setLngLat([at.lng, at.lat]).addTo(map));
    }
  }, [flags, mode, ready]);

  // 우리 장소 표시: 지역 가운데 아래쪽에 작은 개수 표시 (깃발과 겹치지 않게 왼쪽으로)
  const spotMarkers = useRef<maplibregl.Marker[]>([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    spotMarkers.current.forEach((m) => m.remove());
    spotMarkers.current = [];
    for (const s of spots ?? []) {
      if ((s.place.t === 'kr') !== (mode === 'kr')) continue;
      const at = s.place.t === 'kr' ? REGION_BY_CODE.get(s.place.code) : COUNTRY_BY_ID.get(s.place.id);
      if (!at) continue;
      const el = document.createElement('div');
      el.className = 'place-spot-marker';
      el.innerHTML = `<div class="place-spot" data-testid="place-spot" data-code="${s.place.t === 'kr' ? s.place.code : s.place.id}" aria-label="우리 장소 ${s.count}곳"><svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg><b>${s.count}</b></div>`;
      spotMarkers.current.push(new maplibregl.Marker({ element: el, anchor: 'top', offset: [-6, 4] }).setLngLat([at.lng, at.lat]).addTo(map));
    }
  }, [spots, mode, ready]);

  // 지정한 장소로 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !flyTo) return;
    loadGeo().then((g) => {
      const fc = flyTo.t === 'kr' ? g.kr : g.world;
      const key = flyTo.t === 'kr' ? 'cell' : 'ADM0_A3';
      const id = flyTo.t === 'kr' ? flyTo.code : flyTo.id;
      const f = fc.features.find((x) => x.properties?.[key] === id);
      if (!f) return;
      const b = new maplibregl.LngLatBounds();
      const walk = (c: unknown): void => {
        if (Array.isArray(c) && typeof c[0] === 'number') b.extend(c as [number, number]);
        else if (Array.isArray(c)) c.forEach(walk);
      };
      walk((f.geometry as { coordinates: unknown }).coordinates);
      if (!b.isEmpty()) map.fitBounds(b, { padding: { top: 120, bottom: 320, left: 40, right: 70 }, maxZoom: flyTo.t === 'kr' ? 8.6 : 4.5, duration: 600 });
    });
  }, [flyTo, ready]);

  // 여행 상세: 해당 장소로 맞춤
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !focus?.length) return;
    loadGeo().then((g) => {
      const b = new maplibregl.LngLatBounds();
      for (const p of focus) {
        const fc = p.t === 'kr' ? g.kr : g.world;
        const key = p.t === 'kr' ? 'cell' : 'ADM0_A3';
        const id = p.t === 'kr' ? p.code : p.id;
        const f = fc.features.find((x) => x.properties?.[key] === id);
        if (!f) continue;
        const walk = (c: unknown): void => {
          if (Array.isArray(c) && typeof c[0] === 'number') b.extend(c as [number, number]);
          else if (Array.isArray(c)) c.forEach(walk);
        };
        walk((f.geometry as { coordinates: unknown }).coordinates);
      }
      if (!b.isEmpty()) map.fitBounds(b, { padding: 36, maxZoom: 8.5, duration: 0 });
    });
  }, [focus, ready]);

  const zoom = (d: number) => mapRef.current?.easeTo({ zoom: (mapRef.current?.getZoom() ?? 3) + d, duration: 250 });
  // 맞춤 단추는 늘 전체(남한 전체 · 다녀온 나라 전부)
  const fit = () => mapRef.current && frame(mapRef.current, mode, statsRef.current, 600);

  return (
    <div className={'map-wrap ' + (className ?? '')} style={{ height }}>
      <div ref={el} style={{ position: 'absolute', inset: 0 }} data-testid="map" />
      <div ref={labelBox} className="map-labels" aria-hidden="true" />
      {failed === 'data' && (
        <div className="map-failed" role="alert">
          <span>지도를 불러오지 못했어요</span>
          <button className="btn sm" onClick={() => location.reload()}>다시 불러오기</button>
        </div>
      )}
      {failed === 'gl' && (
        <div className="map-failed" role="alert" data-testid="map-unsupported">
          <span>이 기기에서는 지도를 그릴 수 없어요</span>
          <span className="tiny muted" style={{ padding: '0 24px', textAlign: 'center' }}>기록은 그대로예요. 브라우저를 최신으로 바꾸거나 다른 기기에서 열면 지도가 보여요.</span>
        </div>
      )}
      {controls && failed !== 'gl' && (
        <div className="map-ctrls" style={{ top: controlsTop }}>
          <button aria-label="확대" onClick={() => zoom(1)}><Icon name="plus" size={18} stroke={2.2} /></button>
          <hr />
          <button aria-label="축소" onClick={() => zoom(-1)}><Icon name="minus" size={18} stroke={2.2} /></button>
          <hr />
          <button aria-label="전체 보기" onClick={fit}><Icon name="focus" size={18} stroke={2} /></button>
        </div>
      )}
      {legend && (
        <div className="map-legend" style={{ bottom: legendBottom }}>
          {garden ? (
            <>
              <span><i className="lg-meadow" />다녀온 곳</span>
              <span><i className="lg-bloom" />마음을 남길수록 피어요</span>
            </>
          ) : (
            <>
              <span><i style={{ background: COLORS.v1 }} />다녀옴</span>
              <span><i style={{ background: COLORS.v2 }} />2번</span>
              <span><i style={{ background: COLORS.v3 }} />3번 이상</span>
            </>
          )}
          <span><i style={{ background: '#F6F2FF', border: '1.5px dashed #5B3FD1' }} />예정</span>
          {!!flags?.length && <span><i className="lg-flag" />가고 싶은 곳</span>}
          {!!spots?.length && <span><i className="lg-star" />우리 장소</span>}
        </div>
      )}
    </div>
  );
}
