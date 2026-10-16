import { lazy, Suspense } from 'react';
import type { MapViewProps } from './MapView';

const Inner = lazy(() => import('./MapView'));

/** 지도 라이브러리는 무거워서 필요할 때 따로 불러온다 */
export default function LazyMap(props: MapViewProps) {
  return (
    <Suspense fallback={<div className="map-wrap" style={{ height: props.height ?? 300 }} aria-busy="true" />}>
      <Inner {...props} />
    </Suspense>
  );
}
