/**
 * 여행 상식 중 '바뀌기 쉬운 규정'에 관한 최근 2주 뉴스를 모아 보고서로 (매주, CI).
 * 기사가 있으면 src/data/faq.json 그 항목을 사람이 다시 확인한다. 앱은 바꾸지 않는다.
 */
import fs from 'node:fs';
import { parseBingRss } from '../worker/src/rss';

const faq = JSON.parse(fs.readFileSync('src/data/faq.json', 'utf8')) as { updated: string; faq: { id: string; a: string; volatile: boolean }[] };
const Q: Record<string, string> = {
  'intl-passport': '여권 유효기간 입국 규정 변경', 'passport-time': '여권 발급 기간', visa: '무비자 입국 전자여행허가 시행', powerbank: '보조배터리 기내 반입 규정',
  liquid: '기내 액체 반입 규정 변경', baggage: '위탁 수하물 규정 변경', 'carryon-banned': '기내 반입 금지 물품 변경', idp: '국제운전면허 인정 국가',
  dutyfree: '면세 한도 상향', meds: '해외 의약품 반입 금지', 'tax-refund': '택스리펀 제도 변경', smoking: '전자담배 반입 금지 국가', drone: '드론 비행 규정 변경',
  'pet-travel': '반려동물 기내 동반 규정', 'kids-travel': '유아 항공권 규정',
};
const out: string[] = [`바뀌기 쉬운 여행 상식 점검 · faq.json ${faq.updated} 기준 · ${new Date().toISOString().slice(0, 10)}`];
let flagged = 0;
for (const f of faq.faq.filter((x) => x.volatile && Q[x.id])) {
  try {
    const r = await fetch(`https://www.bing.com/news/search?q=${encodeURIComponent(Q[f.id])}&format=rss&setlang=ko-KR&cc=KR&mkt=ko-KR`, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
    const items = parseBingRss(await r.text()).filter((n) => n.at && Date.now() - new Date(n.at).getTime() < 14 * 86400000);
    if (items.length) { flagged++; out.push(`\n! ${f.id} — "${f.a}"`); for (const n of items.slice(0, 3)) out.push(`  · ${n.title} (${n.source} ${n.at.slice(0, 10)}) ${n.link}`); }
    else out.push(`· ${f.id}: 최근 2주 관련 기사 없음`);
  } catch (e) { out.push(`· ${f.id}: 확인 실패 ${(e as Error).message}`); }
}
out.push(`\n다시 볼 항목 ${flagged}개`);
fs.writeFileSync('faq-watch.txt', out.join('\n'));
console.log(out.join('\n'));
