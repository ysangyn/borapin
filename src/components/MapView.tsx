import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { LngLatBoundsLike, Map as MLMap } from 'maplibre-gl';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, MultiLineString } from 'geojson';
import seas from '../data/seas.json';
import { REGION_BY_CODE } from '../lib/geo';
import type { Place } from '../lib/types';
import type { Stats } from '../lib/data';
import { Icon } from './ui';

// v6는 워커 파일을 자기 옆에서 찾는데, 번들되면 그 자리에 파일이 없다 → 주소를 직접 알려 준다.
maplibregl.setWorkerUrl(workerUrl);

export type MapMode = 'kr' | 'world';

export const BOUNDS: Record<MapMode, LngLatBoundsLike> = {
  kr: [[124.6, 33.1], [130.95, 38.65]],
  world: [[-160, -45], [180, 70]],
};

const COLORS = { v1: '#CBBEFF', v2: '#9A82F5', v3: '#5B3FD1', none: '#E6E2F0', sea: '#F1EFF7', land: '#E9E6F1' };

// ---------- 경계 데이터는 한 번만 불러온다 ----------
let geoPromise: Promise<{ kr: FeatureCollection; krMesh: MultiLineString; world: FeatureCollection }> | null = null;
function loadGeo() {
  if (!geoPromise) {
    geoPromise = Promise.all([
      fetch('/data/kr-cells.topojson').then((r) => r.json() as Promise<Topology>),
      fetch('/data/world.topojson').then((r) => r.json() as Promise<Topology>),
    ]).then(([krT, wT]) => {
      const krObj = krT.objects[Object.keys(krT.objects)[0]] as GeometryCollection<{ cell: string }>;
      const wObj = wT.objects[Object.keys(wT.objects)[0]] as GeometryCollection;
      const kr = feature(krT, krObj) as unknown as FeatureCollection;
      const groupOf = (g: unknown) => REGION_BY_CODE.get((g as { properties?: { cell?: string } }).properties?.cell ?? '')?.group;
      const krMesh = mesh(krT, krObj, (a, b) => a !== b && groupOf(a) !== groupOf(b)) as MultiLineString;
      const world = feature(wT, wObj) as unknown as FeatureCollection;
      return { kr, krMesh, world };
    });
  }
  return geoPromise;
}

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
  className?: string;
  controlsTop?: number;
  legendBottom?: number;
}

export default function MapView({ mode, stats, height = 300, cooperative, controls = true, legend, selected, onSelect, focus, className, controlsTop = 12, legendBottom = 12 }: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // 지도 만들기
  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': COLORS.sea } }] },
      bounds: BOUNDS[mode],
      fitBoundsOptions: { padding: 16 },
      minZoom: 0.6,
      maxZoom: 11,
      attributionControl: false,
      cooperativeGestures: cooperative ? { windowsHelpText: 'Ctrl을 누른 채 스크롤해 확대하세요', macHelpText: '⌘를 누른 채 스크롤해 확대하세요', mobileHelpText: '두 손가락으로 움직여 주세요' } as unknown as boolean : false,
      dragRotate: false,
      pitchWithRotate: false,
      renderWorldCopies: false,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;
    let cancelled = false;
    map.on('load', async () => {
      const g = await loadGeo();
      if (cancelled) return;
      map.addSource('world', { type: 'geojson', data: g.world, promoteId: 'ADM0_A3' });
      map.addSource('kr', { type: 'geojson', data: g.kr, promoteId: 'cell' });
      map.addSource('krmesh', { type: 'geojson', data: { type: 'Feature', geometry: g.krMesh, properties: {} } });
      map.addLayer({ id: 'world-fill', type: 'fill', source: 'world', paint: { 'fill-color': fillExpr() } });
      map.addLayer({ id: 'world-line', type: 'line', source: 'world', paint: { 'line-color': '#FFFFFF', 'line-width': 0.6 } });
      map.addLayer({ id: 'kr-fill', type: 'fill', source: 'kr', paint: { 'fill-color': fillExpr() } });
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
      // 점검용: 실제로 그려진 경계 수를 남긴다
      map.on('idle', () => {
        if (!el.current) return;
        const n = map.queryRenderedFeatures({ layers: ['kr-fill', 'world-fill'] }).length;
        el.current.dataset.features = String(n);
      });
      setReady(true);
    });
    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 모드 바뀌면 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || focus?.length) return;
    map.fitBounds(BOUNDS[mode], { padding: 16, duration: 700 });
  }, [mode, ready, focus]);

  // 색칠
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !stats) return;
    map.removeFeatureState({ source: 'kr' });
    map.removeFeatureState({ source: 'world' });
    const focusSet = focus ? new Set(focus.map((p) => (p.t === 'kr' ? p.code : p.id))) : null;
    for (const [code, n] of stats.cellVisits) if (!focusSet || focusSet.has(code)) map.setFeatureState({ source: 'kr', id: code }, { visits: n });
    for (const code of stats.cellPlanned) if (!focusSet || focusSet.has(code)) map.setFeatureState({ source: 'kr', id: code }, { planned: true });
    for (const [id, n] of stats.countryVisits) if (!focusSet || focusSet.has(id)) map.setFeatureState({ source: 'world', id }, { visits: n });
    for (const id of stats.countryPlanned) if (!focusSet || focusSet.has(id)) map.setFeatureState({ source: 'world', id }, { planned: true });
    if (!focusSet && (stats.cellVisits.size || stats.cellPlanned.size)) map.setFeatureState({ source: 'world', id: 'KOR' }, { visits: 1 });
  }, [stats, ready, focus]);

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
  const fit = () => mapRef.current?.fitBounds(BOUNDS[mode], { padding: 16, duration: 600 });

  return (
    <div className={'map-wrap ' + (className ?? '')} style={{ height }}>
      <div ref={el} style={{ position: 'absolute', inset: 0 }} data-testid="map" />
      {controls && (
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
          <span><i style={{ background: COLORS.v1 }} />다녀옴</span>
          <span><i style={{ background: COLORS.v2 }} />2번</span>
          <span><i style={{ background: COLORS.v3 }} />3번 이상</span>
          <span><i style={{ background: '#F6F2FF', border: '1.5px dashed #5B3FD1' }} />예정</span>
        </div>
      )}
    </div>
  );
}
