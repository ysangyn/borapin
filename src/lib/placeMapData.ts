import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, SPACE_ID } from './firebase';
import { queued } from './writes';
import { useStore } from './store';
import { ALL, mapKey, mapsOf, publicPlaces, rankedRecs, themeLabel, themeOf, themesOrder, type Theme } from './placeMaps';
import { placeLong } from './geo';
import { spaceTitle } from './members';
import { samePlace } from './wishes';
import type { MapShare, Place, PlaceMap, PlaceRec } from './types';
import { ASK_URL } from './ask/url';

/**
 * 내 지도 저장·공개 (lib/placeMaps.ts가 순수 계산, 여기는 Firestore).
 * - spaces/main/placeMaps/{mapKey}: 제목·소개·순위·공개 토큰. 없으면 묶음만으로도 지도는 보인다 (문서는 처음 고칠 때 생긴다)
 * - mapShares/{token}: 앱 없이 보는 공개 사본. 장소가 바뀌면 그 지역·주제가 공개 중일 때만 다시 쓴다
 */
const mapsCol = () => collection(db, 'spaces', SPACE_ID, 'placeMaps');
const shareDoc = (token: string) => doc(db, 'mapShares', token);

export function usePlaceMaps(): PlaceMap[] | null {
  const [list, setList] = useState<PlaceMap[] | null>(null);
  useEffect(() => onSnapshot(mapsCol(), (s) => setList(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PlaceMap, 'id'>) }))), () => setList([])), []);
  return list;
}

/** 묶음(장소에서 계산) + 문서(있으면)를 한데: 화면이 쓰는 모양. 지역마다 '한눈에'(all) 지도도 하나씩 (주제가 둘 이상일 때) */
export interface MyMapView { key: string; region: Place; theme: Theme; recs: PlaceRec[]; ranked: PlaceRec[]; doc: PlaceMap | null; title: string }
export const defaultTitle = (region: Place, theme: Theme) => (theme === ALL ? `${placeLong(region)} 지도` : `${placeLong(region)} ${themeLabel(theme)} 지도`);
export function useMyMaps(): MyMapView[] | null {
  const { places } = useStore();
  const docs = usePlaceMaps();
  return useMemo(() => {
    if (!places) return null;
    const views = mapsOf(places).map((m) => {
      const key = mapKey(m.region, m.theme);
      const d = docs?.find((x) => x.id === key) ?? null;
      return { key, region: m.region, theme: m.theme, recs: m.recs, ranked: rankedRecs(m.recs, d?.order), doc: d, title: d?.title?.trim() || defaultTitle(m.region, m.theme) };
    });
    // 한눈에: 같은 지역의 주제가 둘 이상이면 (순서는 주제 순 → 주제 안 순위)
    const regions: Place[] = [];
    for (const v of views) if (!regions.some((r) => samePlace(r, v.region))) regions.push(v.region);
    const alls = regions.flatMap((region) => {
      const mine = views.filter((v) => samePlace(v.region, region));
      if (mine.length < 2) return [];
      const key = mapKey(region, ALL);
      const d = docs?.find((x) => x.id === key) ?? null;
      const ordered = themesOrder(mine.map((v) => v.theme)).flatMap((t) => mine.find((v) => v.theme === t)!.ranked);
      return [{ key, region, theme: ALL, recs: ordered, ranked: ordered, doc: d, title: d?.title?.trim() || defaultTitle(region, ALL) }];
    });
    return [...views, ...alls];
  }, [places, docs]);
}

export async function savePlaceMap(region: Place, theme: Theme, fields: Partial<Pick<PlaceMap, 'title' | 'intro' | 'order' | 'share'>>) {
  const id = mapKey(region, theme);
  await queued(setDoc(doc(mapsCol(), id), { region, theme, ...fields, updatedAt: serverTimestamp(), v: 1 }, { merge: true }));
  return id;
}

// ---------- 공개 사본 ----------
export function buildMapShare(view: { region: Place; theme: Theme; ranked: PlaceRec[]; title: string; doc: PlaceMap | null }): Omit<MapShare, 'updatedAt'> {
  return {
    title: view.title.slice(0, 60),
    intro: (view.doc?.intro ?? '').slice(0, 200),
    theme: view.theme,
    themeLabel: themeLabel(view.theme),
    by: spaceTitle(),
    regionLabel: placeLong(view.region),
    region: view.region,
    // '별로'는 공개하지 않는다 (추천하는 지도라서). 내 화면엔 그대로
    places: publicPlaces(view.ranked).slice(0, 300).map((r) => ({
      id: r.id, name: r.name, kind: r.kind, ...(r.tag?.trim() ? { tag: r.tag.trim() } : {}),
      ...(r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : {}),
      ...(r.photoUrl ? { photoUrl: r.photoUrl } : {}),
      ...(r.address ? { address: r.address } : {}),
      ...(r.naverUrl ? { naverUrl: r.naverUrl } : {}),
      verdict: r.verdict ?? null,
      lines: Object.entries(r.reviews ?? {}).filter(([, t]) => t?.trim()).map(([who, text]) => ({ who, text: text.trim().slice(0, 200) })),
    })),
    v: 1,
  };
}
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);

/** 공개 켜기: 사본을 쓰고 문서에 토큰을 남긴다. 이미 켜져 있으면 사본만 새로 */
export async function enableMapShare(view: MyMapView): Promise<string> {
  const token = view.doc?.share?.token ?? newToken();
  await setDoc(shareDoc(token), { ...buildMapShare(view), updatedAt: serverTimestamp() });
  if (!view.doc?.share?.token) await savePlaceMap(view.region, view.theme, { share: { token } });
  return token;
}
export async function disableMapShare(view: MyMapView) {
  if (view.doc?.share?.token) await deleteDoc(shareDoc(view.doc.share.token)).catch(() => undefined);
  await savePlaceMap(view.region, view.theme, { share: null });
}
export async function loadMapShare(token: string): Promise<MapShare | null> {
  const s = await getDoc(shareDoc(token));
  return s.exists() ? (s.data() as MapShare) : null;
}
/** 공유 주소: 카톡 미리보기(제목·그림)를 넣어 주는 뒷단(Worker /m/토큰)이 있으면 그 주소로, 없으면 앱 주소로. 시험용 프로젝트면 ?p= */
export function mapShareUrl(token: string): string {
  if (!ASK_URL || location.hostname === 'localhost' || /^127\./.test(location.hostname)) return `${location.origin}/m/${token}`;
  const p = location.hostname.startsWith('borapin-test') ? '?p=borapin-test' : '';
  return `${ASK_URL}/m/${token}${p}`;
}

/** 장소를 고친 뒤: 그 지역·주제 지도가 공개 중이면 사본을 다시 쓴다 (기다리지 않아도 됨, 실패해도 조용히) */
let chain: Promise<void> = Promise.resolve();
export function syncMapShareAfterWrite(...recs: (Pick<PlaceRec, 'region' | 'kind' | 'tag'> | null | undefined)[]) {
  const keys = [...new Set(recs.filter((r): r is PlaceRec => !!r).flatMap((r) => [mapKey(r.region, themeOf(r)), mapKey(r.region, ALL)]))];
  if (!keys.length) return;
  chain = chain.then(async () => {
    for (const key of keys) {
      try {
        const d = await getDoc(doc(mapsCol(), key));
        const m = d.exists() ? ({ id: d.id, ...(d.data() as Omit<PlaceMap, 'id'>) }) : null;
        if (!m?.share?.token) continue;
        // 그 지역의 장소 (한눈에면 전부, 아니면 그 주제만). 지역 거르기는 받아서 (region은 맵이라 where로 못 거른다)
        const inRegion = (await getDocs(query(collection(db, 'spaces', SPACE_ID, 'places')))).docs.map((x) => ({ id: x.id, ...(x.data() as Omit<PlaceRec, 'id'>) })).filter((r) => samePlace(r.region, m.region));
        const all = m.theme === ALL ? inRegion : inRegion.filter((r) => themeOf(r) === m.theme);
        // 한눈에는 주제마다 그 주제 지도의 순위를 쓴다
        const orders = m.theme === ALL ? new Map((await getDocs(mapsCol())).docs.map((x) => [x.id, (x.data() as PlaceMap).order])) : null;
        const ranked = m.theme === ALL ? themesOrder(all.map(themeOf)).flatMap((t) => rankedRecs(all.filter((r) => themeOf(r) === t), orders?.get(mapKey(m.region, t)))) : rankedRecs(all, m.order);
        await setDoc(shareDoc(m.share.token), { ...buildMapShare({ region: m.region, theme: m.theme, ranked, title: m.title?.trim() || defaultTitle(m.region, m.theme), doc: m }), updatedAt: serverTimestamp() });
      } catch (e) { console.warn('내 지도 공개 사본 갱신 실패', e); }
    }
  });
}
export const whenMapShareSynced = () => chain;
