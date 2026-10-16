import { useEffect, useMemo, useState } from 'react';

interface Svg { w: number; h: number; cells: { c: string; d: string }[] }

/** 날마다 같은 순서로 섞기 (그림이 매번 달라 보이되 깜빡이지 않게) */
function shuffled<T>(xs: T[], seed: number) {
  const a = [...xs];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 국내 160칸이 하나씩 보라색으로 채워지는 그림 (로그인 화면).
 * 움직임 줄이기 설정이면 채워진 모습만 보여 준다.
 */
export default function KoreaMosaic({ fill = 0.34, className }: { fill?: number; className?: string }) {
  const [svg, setSvg] = useState<Svg | null>(null);
  useEffect(() => {
    let alive = true;
    import('../data/kr-svg.json').then((m) => alive && setSvg(m.default as Svg));
    return () => {
      alive = false;
    };
  }, []);
  const lit = useMemo(() => {
    if (!svg) return new Map<string, number>();
    const day = Math.floor(Date.now() / 86_400_000);
    const pick = shuffled(svg.cells.map((c) => c.c), day).slice(0, Math.round(svg.cells.length * fill));
    // 순서대로 0.06초씩 늦게, 세 가지 진하기
    return new Map(pick.map((c, i) => [c, i]));
  }, [svg, fill]);

  if (!svg) return <div className={className} style={{ aspectRatio: '272 / 289' }} aria-hidden="true" />;
  return (
    <svg className={'mosaic ' + (className ?? '')} viewBox={`0 0 ${svg.w} ${svg.h}`} role="img" aria-label="핀이 하나씩 채워지는 우리나라 지도">
      {svg.cells.map(({ c, d }) => {
        const i = lit.get(c);
        return (
          <path
            key={c}
            d={d}
            className={i == null ? 'm-cell' : `m-cell on t${i % 3}`}
            style={i == null ? undefined : { animationDelay: `${0.25 + i * 0.06}s` }}
          />
        );
      })}
    </svg>
  );
}
