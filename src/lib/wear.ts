/**
 * 달별 옷차림 한 줄 (설계서 A9 기본정보): 도시의 평년 기후(src/data/wear.json, scripts/wear.ts)로 만든다.
 * 기준은 낮 최고·아침 최저기온과 하루 강수량. 숫자 단정 대신 '쯤'으로, 떠나기 전 날씨는 다시 확인.
 */
export interface CityClimate { t: number[]; hi: number[]; lo: number[]; r: number[] }

function clothes(hi: number, lo: number): string {
  if (hi >= 30) return '반팔·반바지, 햇볕 가릴 모자';
  if (hi >= 26) return lo < 20 ? '반팔에 아침저녁 얇은 겉옷' : '반팔·얇은 옷';
  if (hi >= 21) return '긴팔이나 반팔에 가디건';
  if (hi >= 16) return '긴팔에 가벼운 겉옷';
  if (hi >= 11) return '맨투맨·자켓';
  if (hi >= 5) return '코트·니트';
  if (hi >= 0) return '두꺼운 코트·목도리';
  return '패딩·장갑·모자';
}

/** '낮 24°·아침 17°쯤 · 반팔에 아침저녁 얇은 겉옷 · 비 잦아요(우산)' */
export function wearLine(c: CityClimate | undefined | null, month: number): string | null {
  const i = month - 1;
  if (!c || i < 0 || i > 11 || c.hi?.[i] == null) return null;
  const hi = Math.round(c.hi[i]), lo = Math.round(c.lo[i]), rain = c.r[i];
  const wet = rain >= 6 ? ' · 비 잦아요(우산)' : rain >= 3 ? ' · 가끔 비(작은 우산)' : '';
  return `낮 ${hi}°·아침 ${lo}°쯤 · ${clothes(hi, lo)}${wet}`;
}
