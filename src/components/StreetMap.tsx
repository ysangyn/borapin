import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Map as MLMap } from 'maplibre-gl';
import { isDark } from '../lib/theme';

maplibregl.setWorkerUrl(workerUrl);

/**
 * 거리 지도 (내 지도 · 공개 지도): 골목이 보이는 무료 타일(OpenFreeMap, 키·횟수 제한 없음, OSM 자료) 위에 보라 수채를 얇게 입힌다.
 * 타일 서버는 예고 없이 멈출 수 있다고 하니, 스타일을 못 받으면 우리 바탕색에 점만 그린다 (화면이 비지 않게).
 * 핀: 1~3등은 사진 동그라미로 크게, 나머지는 점. 가까이 겹치면 MapLibre가 겹친 채 두므로 확대하면 풀린다.
 */
export interface StreetPin { id: string; name: string; lat: number; lng: number; img?: string; rank?: number; /** 종류 색 (없으면 보라) */ color?: string }
const STYLE = 'https://tiles.openfreemap.org/styles/positron';
const FALLBACK_BG = { light: '#EFEBFF', dark: '#231B4A' };

export default function StreetMap({ pins, height = 300, onPick, picked, here }: { pins: StreetPin[]; height?: number; onPick?: (id: string) => void; picked?: string | null; here?: { lat: number; lng: number } | null }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const hereMarker = useRef<maplibregl.Marker | null>(null);
  const [plain, setPlain] = useState(false);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!el.current) return;
    const dark = isDark();
    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: el.current,
        style: STYLE,
        center: [127.0, 37.5],
        zoom: 13,
        minZoom: 3,
        maxZoom: 18,
        attributionControl: { compact: true },
        cooperativeGestures: !(typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches),
        locale: { 'CooperativeGesturesHandler.WindowsHelpText': 'Ctrl을 누른 채 스크롤하면 확대돼요', 'CooperativeGesturesHandler.MacHelpText': '⌘를 누른 채 스크롤하면 확대돼요', 'CooperativeGesturesHandler.MobileHelpText': '두 손가락으로 움직여 주세요' },
      });
    } catch { setPlain(true); return; }
    mapRef.current = map;
    // 타일 스타일을 못 받으면(막힘·멈춤) 우리 바탕색으로: 점은 그대로 보인다
    const fallback = () => {
      if (map.isStyleLoaded()) return;
      setPlain(true);
      try { map.setStyle({ version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': dark ? FALLBACK_BG.dark : FALLBACK_BG.light } }] }); } catch { /* */ }
    };
    map.on('error', (e) => { if (/style|Failed to fetch|NetworkError/i.test(String((e as unknown as { error?: { message?: string } }).error?.message ?? ''))) fallback(); });
    const t = window.setTimeout(fallback, 6000);
    map.once('style.load', () => window.clearTimeout(t));
    return () => { window.clearTimeout(t); markers.current.forEach((m) => m.remove()); markers.current.clear(); map.remove(); mapRef.current = null; };
  }, []);

  // 핀
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const keep = new Set(pins.map((p) => p.id));
    for (const [id, m] of markers.current) if (!keep.has(id)) { m.remove(); markers.current.delete(id); }
    for (const p of pins) {
      let m = markers.current.get(p.id);
      const html = pinHtml(p, picked === p.id);
      if (!m) {
        const node = document.createElement('button');
        node.type = 'button';
        node.className = 'street-pin-btn';
        node.setAttribute('aria-label', p.name);
        node.addEventListener('click', (e) => { e.stopPropagation(); onPickRef.current?.(p.id); });
        m = new maplibregl.Marker({ element: node, anchor: 'center' }).setLngLat([p.lng, p.lat]).addTo(map);
        markers.current.set(p.id, m);
      } else m.setLngLat([p.lng, p.lat]);
      const node = m.getElement();
      if (node.dataset.html !== html) { node.innerHTML = html; node.dataset.html = html; }
      node.style.zIndex = picked === p.id ? '3' : p.rank && p.rank <= 3 ? '2' : '1';
    }
    if (pins.length) {
      const b = new maplibregl.LngLatBounds([pins[0].lng, pins[0].lat], [pins[0].lng, pins[0].lat]);
      pins.forEach((p) => b.extend([p.lng, p.lat]));
      if (here) b.extend([here.lng, here.lat]);
      map.fitBounds(b, { padding: { top: 48, bottom: 36, left: 40, right: 40 }, maxZoom: 16, duration: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, picked]);

  // 지금 여기
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!here) { hereMarker.current?.remove(); hereMarker.current = null; return; }
    if (!hereMarker.current) {
      const node = document.createElement('span');
      node.className = 'street-here';
      node.setAttribute('aria-label', '지금 여기');
      hereMarker.current = new maplibregl.Marker({ element: node, anchor: 'center' }).setLngLat([here.lng, here.lat]).addTo(map);
    } else hereMarker.current.setLngLat([here.lng, here.lat]);
  }, [here]);

  return (
    <div className={'street-map' + (plain ? ' plain' : '')} style={{ height }} data-testid="street-map" data-plain={plain ? '1' : '0'}>
      <div ref={el} style={{ position: 'absolute', inset: 0 }} />
      <div className="street-wash" aria-hidden="true" />
      {plain && <span className="street-plain-note">거리 지도를 지금 못 받아 자리만 보여요</span>}
    </div>
  );
}

function pinHtml(p: StreetPin, on: boolean) {
  const big = !!p.rank && p.rank <= 3;
  const c = (p.color ?? '#5B3FD1').replace(/[^#0-9a-fA-F]/g, '');
  if (big) {
    return `<span class="street-pin big${on ? ' on' : ''}" style="--pc:${c}">${p.img ? `<img src="${p.img.replace(/"/g, '')}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<i></i>'}<b>${p.rank}</b></span><span class="street-pin-name">${escapeHtml(p.name)}</span>`;
  }
  return `<span class="street-pin dot${on ? ' on' : ''}" style="--pc:${c}"></span>${on ? `<span class="street-pin-name">${escapeHtml(p.name)}</span>` : ''}`;
}
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
