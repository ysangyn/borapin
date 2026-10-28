/**
 * 꽃 도감 재료 모으기 (한 번만, data-build): 위키백과에서
 *  1) 국내 시·군 160칸 문서의 정보 상자 '꽃'(시화·군화) 칸
 *  2) 영어 위키백과 'List of national flowers'의 나라별 꽃
 * 을 읽어 data/flowers-raw.json에 둔다. 사람이 확인해 src/data/flowers.json(꽃 이름·그림 종류)으로 옮긴다.
 *
 *   npx tsx scripts/flowers-collect.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import regionsData from '../src/data/regions.json' with { type: 'json' };
import countries from '../src/data/countries.json' with { type: 'json' };

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'data/flowers-raw.json');
const UA = { 'User-Agent': 'borapin-data-build (github.com/ysangyn/borapin)' };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const METRO: Record<string, string> = { '11': '서울특별시', '26': '부산광역시', '27': '대구광역시', '28': '인천광역시', '29': '광주광역시', '30': '대전광역시', '31': '울산광역시', '36110': '세종특별자치시', '50': '제주특별자치도' };
const SIDO_SHORT: Record<string, string> = { 경기: '경기도', 강원: '강원특별자치도', 충북: '충청북도', 충남: '충청남도', 전북: '전북특별자치도', 전남: '전라남도', 경북: '경상북도', 경남: '경상남도' };

function candidates(r: { code: string; name: string; sido: string }): string[] {
  if (METRO[r.code]) return [METRO[r.code]];
  const parts = r.name.split(' ');
  const base = parts[parts.length - 1];
  const sido = SIDO_SHORT[parts[0]] ?? r.sido;
  const alt = sido === '강원특별자치도' ? ['강원도'] : sido === '전북특별자치도' ? ['전라북도'] : [];
  return [`${base} (${sido})`, ...alt.map((a) => `${base} (${a})`), base];
}

async function wikitext(lang: string, title: string, section0 = true): Promise<{ title: string; text: string } | null> {
  const u = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main${section0 ? '&rvsection=0' : ''}&redirects=1&format=json&formatversion=2&titles=${encodeURIComponent(title)}`;
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(u, { headers: UA });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { query?: { pages?: { title: string; missing?: boolean; revisions?: { slots: { main: { content: string } } }[] }[] } };
      const p = j.query?.pages?.[0];
      if (!p || p.missing || !p.revisions) return null;
      return { title: p.title, text: p.revisions[0].slots.main.content };
    } catch (e) { if (i === 3) throw e; await sleep(1000 * i); }
  }
  return null;
}

const clean = (s: string) => s.replace(/<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>/g, '').replace(/\{\{[^}]*\}\}/g, '').replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1').replace(/<[^>]+>/g, ' ').replace(/'''?/g, '').replace(/\s+/g, ' ').trim();

/** 정보 상자에서 꽃 칸: '꽃', '시화', '군화', '구화', '상징꽃' … */
function flowerField(text: string): string | null {
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*\|\s*([^=|]{1,12}?)\s*=\s*(.*)$/);
    if (!m) continue;
    const k = m[1].replace(/\s/g, '');
    if (/^(꽃|시화|군화|구화|도화|시꽃|군꽃|상징꽃|상징_꽃|상징화)$/.test(k) || /(꽃|화)$/.test(k) && /^(시|군|구|도|상징)/.test(k)) {
      const v = clean(m[2]);
      if (v && !/^없음$/.test(v)) return v;
    }
  }
  return null;
}

async function main() {
  const kr: Record<string, { name: string; article?: string; flower?: string | null; tried: string[] }> = {};
  for (const r of (regionsData as { regions: { code: string; name: string; sido: string }[] }).regions) {
    const tried = candidates(r);
    let hit: { title: string; text: string } | null = null;
    for (const t of tried) {
      hit = await wikitext('ko', t).catch(() => null);
      if (hit && !/동음이의|\{\{동음이의/.test(hit.text.slice(0, 400))) break;
      hit = null;
      await sleep(150);
    }
    kr[r.code] = { name: r.name, article: hit?.title, flower: hit ? flowerField(hit.text) : null, tried };
    console.log(`${r.code} ${r.name} → ${hit?.title ?? '문서 없음'} · ${kr[r.code].flower ?? '꽃 칸 없음'}`);
    await sleep(150);
  }
  // 나라꽃: 영어 위키백과 목록의 표 줄 (나라 · 꽃) 그대로 모은다
  const list = await wikitext('en', 'List of national flowers', false);
  const world: Record<string, string> = {};
  if (list) {
    const rows = list.text.split(/\n\|-/);
    for (const row of rows) {
      const cells = row.split(/\n\||\|\|/).map((c) => clean(c.replace(/^[!|]/, ''))).filter(Boolean);
      if (cells.length < 2) continue;
      const c = (countries as { id: string; en: string }[]).find((x) => cells[0].toLowerCase().includes(x.en.toLowerCase()));
      if (c && !world[c.id]) world[c.id] = cells.slice(1, 4).join(' | ');
    }
  }
  const okKr = Object.values(kr).filter((x) => x.flower).length;
  console.log(`국내 꽃 칸 ${okKr}/160 · 나라 ${Object.keys(world).length}`);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString().slice(0, 10), kr, world }, null, 1) + '\n');
}
main().catch((e) => { console.error(e); process.exit(1); });
