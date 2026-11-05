import { lazy, Suspense } from 'react';

const StreetMap = lazy(() => import('./StreetMap'));

/**
 * 장소 하나의 작은 거리 지도 (앱 안에서 골목까지 보이게 · 바깥 지도 앱을 열기 전에).
 * 지도 묶음(maplibre)은 필요할 때만 받는다. 해외도 그대로 보인다.
 */
export default function MiniStreet({ name, lat, lng, height = 170, img }: { name: string; lat: number; lng: number; height?: number; img?: string }) {
  return (
    <div className="mini-street" style={{ height }} data-testid="mini-street">
      <Suspense fallback={<div className="mini-street-wait" style={{ height }} aria-hidden="true" />}>
        <StreetMap pins={[{ id: 'p', name, lat, lng, img, rank: img ? 1 : undefined }]} height={height} />
      </Suspense>
    </div>
  );
}
