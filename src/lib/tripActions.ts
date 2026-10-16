import { placeLabel } from './geo';
import type { Place, TripInput } from './types';

/** '다녀왔어요' 한 번으로 꽂는 핀: 날짜 없이 장소만 (지도 창·장소 남기기에서 같이 쓴다) */
export const quickTripInput = (place: Place, companions: string[]): TripInput => ({
  title: `${placeLabel(place)} 여행`,
  kind: 'trip',
  status: 'done',
  when: { p: 'unknown' },
  places: [place],
  companions,
  memo: '',
  tags: [],
  source: 'app',
});
