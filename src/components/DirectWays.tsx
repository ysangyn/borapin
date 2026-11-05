import { useHome } from '../lib/home';
import { basisLabel, directWays, useRoutes, wayName, aboutTime } from '../lib/transit';
import { Icon } from './ui';

/**
 * 우리 집 시·군에서 이 시·군까지 갈아타지 않고 한 번에 가는 기차·버스 (서비스마다 가장 빠른 하나, 최대 둘).
 * 누르면 그 회사 예매·시간표로. 우리 집이 없거나 같은 시·군이거나 한 번에 가는 길이 없으면 아무것도 그리지 않는다.
 */
export default function DirectWays({ code, max = 2 }: { code: string; max?: number }) {
  const home = useHome();
  const d = useRoutes();
  if (!home || !d || home.code === code) return null;
  const ways = directWays(d, home.code, code);
  // 기차 하나 + 버스 중 빠른 하나
  const bus = ways.filter((w) => w.svc !== 'T').sort((a, b) => a.min - b.min)[0];
  const pick = [ways.find((w) => w.svc === 'T'), bus].filter((w): w is NonNullable<typeof w> => !!w).slice(0, max);
  if (!pick.length) return null;
  return (
    <>
      {pick.map((w) => (
        <div key={w.svc} className="hub-way-row static" data-testid="direct-way">
          <Icon name="train" size={16} />
          <span>
            한 번에 <b>{wayName(w)} {w.from}→{w.to}</b> {aboutTime(w.min)} · 하루 {w.n}편
            {w === pick[pick.length - 1] && basisLabel(d) ? <span className="tiny muted"> · {basisLabel(d)}</span> : null}
          </span>
        </div>
      ))}
    </>
  );
}
