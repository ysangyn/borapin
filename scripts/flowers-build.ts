/**
 * 꽃 그림 만들기 (설계서 C2): 꽃마다 모양 정의 → '말랑 스티커' SVG(public/art/flowers/<id>.svg) +
 * 지도 무늬 색(src/data/flower-kinds.json). 손으로 하나씩 그리지 않아서, 디자인을 바꾸면 이 파일의 색·선만 고쳐 다시 돌리면 된다.
 *
 *   npx tsx scripts/flowers-build.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTLINE = '#1E1640', SHADOW = '#CFC6F2', HALO = '#FFFFFF';

type Shape = 'round' | 'notch' | 'oval' | 'long' | 'thin' | 'wide' | 'point' | 'cup' | 'rose' | 'bell' | 'cluster' | 'tulip' | 'lotus' | 'lily' | 'spike';
export interface Kind { id: string; ko: string[]; shape: Shape; n?: number; petal: string; mid: string; leaf?: boolean; second?: string }

// 이름(위키백과·시청 표기)이 여러 가지라 ko에 다 적는다. 처음 것이 화면 이름.
export const KINDS: Kind[] = [
  { id: 'forsythia', ko: ['개나리'], shape: 'long', n: 4, petal: '#FFD233', mid: '#F59E0B' },
  { id: 'azalea', ko: ['진달래', '참꽃', '진달래꽃'], shape: 'wide', n: 5, petal: '#E46ABF', mid: '#B5206E' },
  { id: 'royal-azalea', ko: ['철쭉', '영산홍', '산철쭉', '철쭉꽃'], shape: 'wide', n: 5, petal: '#FF8FB4', mid: '#E8475F' },
  { id: 'cherry', ko: ['벚꽃', '왕벚꽃', '산벚꽃', '벚나무'], shape: 'notch', n: 5, petal: '#FFC9D6', mid: '#FF8FAB' },
  { id: 'magnolia', ko: ['목련', '백목련', '목련꽃', '산목련', '함박꽃나무'], shape: 'oval', n: 6, petal: '#FFFFFF', mid: '#FFE3EA' },
  { id: 'camellia', ko: ['동백', '동백꽃', '동백나무'], shape: 'round', n: 5, petal: '#F2566E', mid: '#FFD45C', leaf: true },
  { id: 'rose', ko: ['장미', '장미꽃', '덩굴장미'], shape: 'rose', petal: '#E8475F', mid: '#B8233A', leaf: true },
  { id: 'chrysanthemum', ko: ['국화', '들국화', '감국', '산국'], shape: 'thin', n: 12, petal: '#FFD95A', mid: '#F5A623' },
  { id: 'aster', ko: ['구절초', '쑥부쟁이'], shape: 'thin', n: 12, petal: '#FFFFFF', mid: '#F5C542' },
  { id: 'plum', ko: ['매화', '매화꽃', '홍매화', '매실'], shape: 'round', n: 5, petal: '#FFF0F4', mid: '#F07A95' },
  { id: 'mugunghwa', ko: ['무궁화'], shape: 'wide', n: 5, petal: '#F3A6D8', mid: '#B5206E' },
  { id: 'zinnia', ko: ['백일홍', '배롱나무', '목백일홍'], shape: 'thin', n: 10, petal: '#FF6F91', mid: '#FFD45C' },
  { id: 'pear', ko: ['배꽃', '배나무꽃', '이화', '자두꽃', '오얏꽃'], shape: 'round', n: 5, petal: '#FFFFFF', mid: '#A3D977' },
  { id: 'peach', ko: ['복숭아꽃', '복사꽃', '복숭아', '도화'], shape: 'round', n: 5, petal: '#FFB3C7', mid: '#E8475F' },
  { id: 'apricot', ko: ['살구꽃', '살구'], shape: 'round', n: 5, petal: '#FFE0E8', mid: '#F07A95' },
  { id: 'apple', ko: ['사과꽃'], shape: 'round', n: 5, petal: '#FFF4F6', mid: '#F5C542' },
  { id: 'lotus', ko: ['연꽃', '백련', '홍련'], shape: 'lotus', petal: '#FFB3D1', mid: '#F5C542' },
  { id: 'cornus', ko: ['산수유', '산수유꽃', '생강나무'], shape: 'cluster', petal: '#FFD233', mid: '#E0A800' },
  { id: 'rugosa', ko: ['해당화'], shape: 'wide', n: 5, petal: '#E84D8A', mid: '#FFD45C' },
  { id: 'canola', ko: ['유채', '유채꽃'], shape: 'cluster', petal: '#FFE14D', mid: '#F5B700' },
  { id: 'cosmos', ko: ['코스모스'], shape: 'oval', n: 8, petal: '#FF9FCB', mid: '#F5C542' },
  { id: 'daffodil', ko: ['수선화'], shape: 'point', n: 6, petal: '#FFFFFF', mid: '#FFC93C' },
  { id: 'buckwheat', ko: ['메밀꽃', '메밀'], shape: 'cluster', petal: '#FFFFFF', mid: '#FF9CB5' },
  { id: 'peony', ko: ['모란', '목단', '작약', '함박꽃'], shape: 'rose', petal: '#F78FB3', mid: '#D9467A' },
  { id: 'tulip', ko: ['튤립'], shape: 'tulip', petal: '#F2566E', mid: '#C23040', leaf: true },
  { id: 'sunflower', ko: ['해바라기'], shape: 'point', n: 14, petal: '#FFC72C', mid: '#7A4A1E' },
  { id: 'lily', ko: ['백합', '나리', '참나리', '원추리', '하늘말나리'], shape: 'lily', n: 6, petal: '#FF9A3C', mid: '#C25A00' },
  { id: 'lilac', ko: ['라일락', '수수꽃다리'], shape: 'cluster', petal: '#C9A3F0', mid: '#8E5BD6' },
  { id: 'trumpet', ko: ['능소화'], shape: 'cup', n: 5, petal: '#FF8A3D', mid: '#E0531A' },
  { id: 'iris', ko: ['붓꽃', '꽃창포', '창포'], shape: 'point', n: 3, petal: '#7E6BE0', mid: '#FFD233' },
  { id: 'orchid', ko: ['난초', '춘란', '석곡', '풍란', '백양난', '새우난초', '신안새우난초'], shape: 'point', n: 5, petal: '#F1E6FF', mid: '#B05BD6' },
  { id: 'gardenia', ko: ['치자꽃', '치자', '은목서', '금목서', '목서'], shape: 'oval', n: 6, petal: '#FFF8E1', mid: '#F5C542' },
  { id: 'kerria', ko: ['황매화'], shape: 'round', n: 5, petal: '#FFC93C', mid: '#E58A00' },
  { id: 'lily-valley', ko: ['은방울꽃'], shape: 'cluster', petal: '#FFFFFF', mid: '#A3D977' },
  { id: 'lycoris', ko: ['상사화', '꽃무릇', '석산'], shape: 'lily', n: 6, petal: '#F25C78', mid: '#B8233A' },
  { id: 'pomegranate', ko: ['석류', '석류꽃'], shape: 'cup', n: 6, petal: '#F2563F', mid: '#B8233A' },
  { id: 'cotton', ko: ['목화', '목화꽃'], shape: 'round', n: 5, petal: '#FFFDF4', mid: '#F5E3B3' },
  { id: 'pasque', ko: ['할미꽃', '동강할미꽃'], shape: 'cup', n: 6, petal: '#9B6BD6', mid: '#FFD233' },
  { id: 'wild', ko: ['들꽃'], shape: 'round', n: 5, petal: '#FFF3B0', mid: '#F5A623' },
];

const rot = (shape: string, n: number, start = 0) => Array.from({ length: n }, (_, i) => `<g transform="rotate(${(start + (360 / n) * i).toFixed(1)} 50 50)">${shape}</g>`).join('');

/** 모양 하나를 그린다. f = 꽃잎 칠, c = 가운데 칠, s = 선 속성 */
function body(k: Kind, f: string, c: string, s: string, l: string): string {
  const n = k.n ?? 5;
  const leaf = k.leaf ? `<ellipse cx="30" cy="80" rx="15" ry="7" transform="rotate(-30 30 80)" fill="${l}" ${s}/><ellipse cx="72" cy="82" rx="15" ry="7" transform="rotate(25 72 82)" fill="${l}" ${s}/>` : '';
  const mid = (r: number) => `<circle cx="50" cy="50" r="${r}" fill="${c}" ${s}/>`;
  switch (k.shape) {
    case 'round': return leaf + rot(`<circle cx="50" cy="31" r="15" fill="${f}" ${s}/>`, n) + mid(9);
    case 'notch': return rot(`<path d="M50 50 C37 42 34 24 42 16 L50 23 L58 16 C66 24 63 42 50 50Z" fill="${f}" ${s}/>`, n) + mid(7);
    case 'oval': return rot(`<ellipse cx="50" cy="30" rx="10" ry="19" fill="${f}" ${s}/>`, n, 30) + mid(7);
    case 'long': return rot(`<ellipse cx="50" cy="29" rx="9" ry="19" fill="${f}" ${s}/>`, n, 45) + mid(7);
    case 'thin': return rot(`<ellipse cx="50" cy="28" rx="5.5" ry="17" fill="${f}" ${s}/>`, n) + mid(11);
    case 'wide': return rot(`<path d="M50 50 C35 44 31 24 41 17 C46 14 54 14 59 17 C69 24 65 44 50 50Z" fill="${f}" ${s}/>`, n, 180) + mid(7);
    case 'point': return rot(`<path d="M50 50 C42 40 44 22 50 12 C56 22 58 40 50 50Z" fill="${f}" ${s}/>`, n) + mid(n > 10 ? 14 : n === 6 ? 12 : 9);
    case 'cup': return rot(`<path d="M50 50 C38 46 34 30 42 22 C46 26 54 26 58 22 C66 30 62 46 50 50Z" fill="${f}" ${s}/>`, n, 36) + mid(10);
    case 'rose': return leaf + `<circle cx="50" cy="48" r="28" fill="${f}" ${s}/><path d="M50 30 C64 32 68 50 56 58 C46 64 34 56 38 46 C41 38 52 40 52 47 C52 52 46 52 46 49" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
    case 'bell': return rot(`<ellipse cx="50" cy="30" rx="9" ry="18" fill="${f}" ${s}/>`, 4, 45) + mid(7);
    case 'cluster': return `<path d="M50 92 L50 60" stroke="#5DAA6A" stroke-width="5" stroke-linecap="round"/>` + [[50, 34, 11], [32, 46, 9], [68, 46, 9], [40, 62, 8], [60, 62, 8]].map(([x, y, r]) => rot(`<circle cx="${x}" cy="${y - r}" r="${r * 0.62}" fill="${f}" ${s}/>`, 5).replace(/rotate\(([\d.]+) 50 50\)/g, `rotate($1 ${x} ${y})`) + `<circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${c}" ${s}/>`).join('');
    case 'tulip': return leaf + `<path d="M50 88 L50 58" stroke="#5DAA6A" stroke-width="5" stroke-linecap="round"/><path d="M28 30 C28 52 36 62 50 62 C64 62 72 52 72 30 L61 40 L50 24 L39 40Z" fill="${f}" ${s}/><path d="M50 24 L50 60" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    case 'lotus': return `<ellipse cx="50" cy="78" rx="34" ry="9" fill="#7CC48A" ${s}/>` + [-50, -25, 25, 50].map((a) => `<g transform="rotate(${a} 50 66)"><path d="M50 66 C40 54 42 36 50 26 C58 36 60 54 50 66Z" fill="${f}" ${s}/></g>`).join('') + `<path d="M50 66 C40 54 42 36 50 22 C58 36 60 54 50 66Z" fill="${f}" ${s}/><circle cx="50" cy="56" r="5" fill="${c}" ${s}/>`;
    case 'lily': return rot(`<path d="M50 50 C44 40 42 22 50 10 C58 22 56 40 50 50Z" fill="${f}" ${s}/>`, n) + rot(`<circle cx="50" cy="38" r="1.8" fill="${c}"/>`, n, 30) + mid(6);
    case 'spike': return mid(10);
  }
}

function svg(k: Kind, style: 'sticker' | 'ink' | 'gray'): string {
  if (style === 'ink') { const s = `stroke="#5B3FD1" stroke-width="2.6" stroke-linejoin="round"`; return wrap(body(k, '#F3EEFF', '#F3EEFF', s, '#F3EEFF')); }
  if (style === 'gray') { const s = `stroke="#B9B2D6" stroke-width="3" stroke-linejoin="round"`; return wrap(body(k, '#FFFFFF', '#FFFFFF', s, '#FFFFFF')); }
  const s = `stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"`;
  const halo = (col: string) => body(k, col, col, `stroke="${col}" stroke-width="12" stroke-linejoin="round"`, col);
  return wrap(`<g transform="translate(3 3)">${halo(SHADOW)}</g>${halo(HALO)}${body(k, k.petal, k.mid, s, '#5DAA6A')}`);
}
const wrap = (inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 112" width="112" height="112">${inner}</svg>\n`;

function main() {
  const dir = path.join(ROOT, 'public/art/flowers');
  fs.mkdirSync(dir, { recursive: true });
  for (const k of KINDS) {
    fs.writeFileSync(path.join(dir, `${k.id}.svg`), svg(k, 'sticker'));
    fs.writeFileSync(path.join(dir, `${k.id}-ink.svg`), svg(k, 'ink'));
    fs.writeFileSync(path.join(dir, `${k.id}-gray.svg`), svg(k, 'gray'));
  }
  const kinds = Object.fromEntries(KINDS.map((k) => [k.id, { name: k.ko[0], petal: k.petal, mid: k.mid }]));
  fs.writeFileSync(path.join(ROOT, 'src/data/flower-kinds.json'), JSON.stringify(kinds, null, 1) + '\n');
  console.log(`꽃 그림 ${KINDS.length}종 × 3벌`);
}
if (process.argv[1]?.endsWith('flowers-build.ts')) main();
