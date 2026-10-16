import { useEffect, useState } from 'react';
import { PHOTOS, preferStill, videoById } from '../lib/media';
import { dailyShuffle } from '../lib/wishes';

/**
 * PC 양옆 빈 자리 배경: 하루에 한 장면(구름 영상 또는 풍경 사진)을 아주 흐리게.
 * - 폰(좁은 화면)에서는 아예 붙이지 않는다 (보이지도 않고 배터리만 쓴다)
 * - 화면이 다 그려진 뒤(idle)에 붙여 첫 화면을 느리게 하지 않는다
 * - 움직임 줄이기·데이터 절약이면 영상 대신 사진
 */
export default function Backdrop() {
  const [ready, setReady] = useState(false);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const t = idle ? idle(() => setReady(true), { timeout: 2500 }) : window.setTimeout(() => setReady(true), 1200);
    return () => { mq.removeEventListener('change', on); if (!idle) window.clearTimeout(t as number); };
  }, []);
  if (!ready || !wide) return null;
  const day = new Date().toISOString().slice(0, 10);
  // 하루에 하나: 월·수·금은 구름 영상, 나머지는 풍경 사진 (둘 다 자유 이용 자료)
  const video = videoById('clouds');
  const useVideo = !!video && !preferStill() && new Date().getDay() % 2 === 1;
  const photo = dailyShuffle(PHOTOS, `backdrop-${day}`)[0];
  return (
    <div className="backdrop" aria-hidden="true" data-testid="backdrop">
      {useVideo ? (
        <video muted loop playsInline autoPlay preload="metadata" poster={video!.poster} tabIndex={-1} disablePictureInPicture disableRemotePlayback>
          <source src={video!.webm} type="video/webm" />
          <source src={video!.mp4} type="video/mp4" />
        </video>
      ) : photo ? (
        <img src={photo.src.l} alt="" decoding="async" />
      ) : null}
    </div>
  );
}
