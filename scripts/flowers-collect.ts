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

/** 여러 문서를 한 번에 (최대 20개). 429면 Retry-After만큼(없으면 점점 길게) 쉬었다 다시 */
async function pages(lang: string, titles: string[]): Promise<Map<string, { title: string; text: string }>> {
  const u = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&redirects=1&format=json&formatversion=2&maxlag=5&titles=${encodeURIComponent(titles.join('|'))}`;
  for (let i = 1; ; i++) {
    const r = await fetch(u, { headers: UA }).catch(() => null);
    if (r?.ok) {
      const j = (await r.json()) as { query?: { normalized?: { from: string; to: string }[]; redirects?: { from: string; to: string }[]; pages?: { title: string; missing?: boolean; revisions?: { slots: { main: { content: string } } }[] }[] } };
      const q = j.query ?? {};
      const out = new Map<string, { title: string; text: string }>();
      const byTitle = new Map((q.pages ?? []).filter((p) => !p.missing && p.revisions).map((p) => [p.title, { title: p.title, text: p.revisions![0].slots.main.content }]));
      for (const t of titles) {
        let x = t;
        x = q.normalized?.find((n) => n.from === x)?.to ?? x;
        x = q.redirects?.find((n) => n.from === x)?.to ?? x;
        const hit = byTitle.get(x);
        if (hit) out.set(t, hit);
      }
      return out;
    }
    if (i >= 8) throw new Error(`HTTP ${r?.status ?? 'fetch failed'}`);
    const wait = Number(r?.headers.get('retry-after')) || 5 * i;
    console.log(`  쉬어 가기 ${wait}초 (HTTP ${r?.status ?? '-'})`);
    await sleep(wait * 1000);
  }
}
async function wikitext(lang: string, title: string): Promise<{ title: string; text: string } | null> {
  return (await pages(lang, [title])).get(title) ?? null;
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
  const regs = (regionsData as { regions: { code: string; name: string; sido: string }[] }).regions;
  const todo = new Map(regs.map((r) => [r.code, { r, cands: candidates(r) }]));
  for (const r of regs) kr[r.code] = { name: r.name, flower: null, tried: candidates(r) };
  // 후보 이름을 한 차례씩: 첫 후보를 모두 20개씩 묶어 묻고, 없거나 동음이의 문서면 다음 후보로
  for (let round = 0; round < 3 && todo.size; round++) {
    const ask = [...todo.values()].filter((x) => x.cands[round]).map((x) => ({ code: x.r.code, title: x.cands[round] }));
    for (let i = 0; i < ask.length; i += 20) {
      const batch = ask.slice(i, i + 20);
      const got = await pages('ko', batch.map((b) => b.title));
      for (const b of batch) {
        const hit = got.get(b.title);
        if (!hit || /\{\{동음이의|동음이의어 문서/.test(hit.text.slice(0, 600))) continue;
        kr[b.code].article = hit.title;
        kr[b.code].flower = flowerField(hit.text.slice(0, 20000));
        todo.delete(b.code);
      }
      await sleep(1500);
    }
  }
  for (const [code, v] of Object.entries(kr)) console.log(`${code} ${v.name} → ${v.article ?? '문서 없음'} · ${v.flower ?? '꽃 칸 없음'}`);
  // 나라꽃: 영어 위키백과 목록의 표 줄 (나라 · 꽃) 그대로 모은다
  const list = await wikitext('en', 'List of national flowers').catch(() => null);
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
