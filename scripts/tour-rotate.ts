/**
 * 관광공사 자료는 매일 전국을 다 받지 않고, 받은 지 오래된 시·군부터 조금씩 (일주일에 한 바퀴).
 * - 평소: 받은 지 6일 넘은 곳 중 가장 오래된 25곳 (하루 여러 번 빌드해도 같은 곳을 또 받지 않음)
 * - 처음(음식점·쇼핑 칸이 절반도 안 찼을 때): 60곳씩 빨리 채운다
 * 실패한 곳은 날짜가 안 바뀌니 다음 빌드에서 다시 고른다.
 */
type Cell = { at?: string; f?: unknown };
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400_000);

export function pickBatch(codes: string[], prev: Record<string, Cell | undefined>, today: string, batch = 25, boot = 60): string[] {
  const filled = codes.filter((c) => Array.isArray(prev[c]?.f)).length;
  const n = filled < codes.length / 2 ? boot : batch;
  const age = (c: string) => { const x = prev[c]; return !x || !Array.isArray(x.f) || !x.at ? 9999 : daysBetween(x.at, today); };
  return codes
    .map((c, i) => ({ c, i, a: age(c) }))
    .filter((x) => x.a >= 7)
    .sort((x, y) => y.a - x.a || x.i - y.i)
    .slice(0, n)
    .map((x) => x.c);
}
