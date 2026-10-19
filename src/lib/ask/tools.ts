/**
 * 보라(AI)가 "이 자료를 봐 달라"고 하면 폰 안에서 실행하는 도구들.
 * 기록은 폰 밖으로 나가지 않고, 여기서 고른 사실만 글로 만들어 모델에 준다.
 */
import { computeStats, TOTAL_CELLS, TOTAL_GROUPS } from '../stats';
import { cityFor, COST_LABEL, flyLabel, tzLabel, WALK_LABEL } from '../world';
import { dday, formatWhen, SEASON_LABEL } from '../dates';
import { COUNTRY_BY_ID, GROUPS, placeLabel, placeLong, placeParam, searchPlaces } from '../geo';
import { candidates, THEMES } from '../recommend';
import { DARK_SKY, STAR_Q, topicOf, unusedWords } from './engine';
import { monthsLabel, seasonFor } from '../seasons';
import { festivalPeriod, isOngoing, upcomingFestivals } from '../festivals';
import { packFromTemplate } from '../packing';
import { samePlace, dailyShuffle } from '../wishes';
import type { Photo, Place, Season } from '../types';
import type { AskData, Btn } from './engine';

export interface ToolCall { tool: string; args?: Record<string, unknown> }
export interface Facts { text: string; actions: { id: string; btn: Btn }[] }

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null);

/** 지명 → 앱의 지역. 앞 대화의 지역이 있으면 '거기'도 받는다 */
export function resolvePlace(name: string, prev: Place | null): Place | null {
  if (!name) return prev;
  if (/거기|그곳|여기|그 지역/.test(name)) return prev;
  const hit = searchPlaces(name, 1)[0];
  return hit && hit.score >= 40 ? hit.place : prev;
}

const tripsAt = (d: AskData, p: Place) => d.trips.filter((t) => t.status === 'done' && t.places.some((x) => samePlace(x, p))).sort((a, b) => (b.when.y ?? 0) - (a.when.y ?? 0));

export function runTools(calls: ToolCall[], d: AskData, prev: Place | null, now = new Date(), question = ''): Facts {
  const out: string[] = [];
  const actions: { id: string; btn: Btn }[] = [];
  let act = 0;
  const addAction = (label: string, btn: Omit<Btn, 'label'>) => {
    const id = `a${++act}`;
    actions.push({ id, btn: { ...btn, label } });
    return `[${id}: ${label}]`;
  };
  let place: Place | null = prev;
  const placeArg = (a: Record<string, unknown> | undefined) => {
    const n = str(a?.place ?? a?.name);
    const p = n ? resolvePlace(n, place) : place;
    if (p) place = p;
    return p;
  };

  for (const c of calls.slice(0, 6)) {
    const a = c.args ?? {};
    try {
      switch (c.tool) {
        case 'resolve_place': {
          const p = placeArg(a);
          out.push(p ? `지역: '${str(a.name ?? a.place)}' → ${placeLong(p)}` : `지역: '${str(a.name ?? a.place)}'은 앱에 없는 지명`);
          break;
        }
        case 'place_info': {
          const p = placeArg(a);
          if (!p) { out.push('지역 정보: 지역을 모름'); break; }
          const c2 = p.t === 'kr' ? d.info.cells[p.code] : null;
          if (!c2) {
            const w = cityFor(d.world ?? null, p);
            if (w) {
              out.push(`${w.city}(${COUNTRY_BY_ID.get(w.c)?.name ?? w.c}) 도시정보: ${w.line} / 가기 좋은 때 ${monthsLabel(w.best)}(${w.why}) / 볼 것 ${w.see.join(', ')} / 먹을 것 ${w.eat.join(', ')} / 돈 ${w.cur}, ${COST_LABEL[w.cost]} / 말 ${w.lang} / 콘센트 ${w.plug} / 인천에서 ${flyLabel(w.fly)}, ${tzLabel(w.tz)} / 걷기 ${WALK_LABEL[w.walk]} / 어울리는 동행 ${w.with.join('·')} / 입국 ${w.entry}(출발 전 확인) / 꼬리표 ${w.tags.join('·')}`);
              out.push(`  ${addAction(`${w.city} 지도에서 보기`, { to: `/map?sel=${placeParam(p)}` })} ${addAction('가고 싶은 곳에 담기', { wish: p })}`);
              break;
            }
            out.push(`${placeLong(p)}: 국내 여행정보 없음${p.t === 'country' ? ` (해외 · ${COUNTRY_BY_ID.get(p.id)?.continent ?? ''})` : ''}`); break;
          }
          out.push(`${placeLong(p)} 여행정보: 테마 ${c2.main.theme} / 볼거리 ${c2.main.spots.join(', ')} / 먹거리 ${c2.main.foods.join(', ')} / 특산물 ${c2.main.goods.join(', ') || '없음'} / 교통 ${c2.main.transport.join(', ') || '없음'}${c2.main.note ? ` / 참고 ${c2.main.note}` : ''}${c2.subs.length ? ` / 구·군: ${c2.subs.slice(0, 5).map((s) => `${s.name}(${s.spots.slice(0, 2).join('·')})`).join(', ')}` : ''}`);
          out.push(`  ${addAction(`${placeLabel(p)} 지도에서 보기`, { to: `/map?sel=${placeParam(p)}` })} ${addAction('가고 싶은 곳에 담기', { wish: p })} ${addAction('여행 만들기', { to: `/record?status=planned&place=${placeParam(p)}` })}`);
          break;
        }
        case 'best_time': {
          const p = placeArg(a);
          if (!p) break;
          const s = seasonFor(d.seasons, p);
          out.push(s ? `${placeLong(p)} 가기 좋은 때: ${monthsLabel(s.m)} · ${s.why}${s.at ? ` (${s.at} 기준)` : ''}` : `${placeLong(p)} 가기 좋은 때 자료 없음`);
          break;
        }
        case 'festivals': {
          const p = str(a.place) ? placeArg(a) : null;
          const month = num(a.month);
          const from = month ? new Date(now.getFullYear() + (month < now.getMonth() + 1 ? 1 : 0), month - 1, 1) : now;
          if (p && p.t === 'kr') {
            const list = upcomingFestivals(d.festivals ?? null, p.code, from, 120);
            out.push(list.length ? `${placeLong(p)} 축제: ${list.slice(0, 6).map((f) => `${f.t}(${festivalPeriod(f)}${isOngoing(f, now) ? '·지금' : ''})`).join(', ')}` : `${placeLong(p)} 다가오는 축제 자료 없음`);
          } else {
            const all = Object.entries(d.festivals?.cells ?? {}).flatMap(([code]) => upcomingFestivals(d.festivals ?? null, code, from, month ? 31 : 45).map((f) => ({ code, f })));
            const picks = dailyShuffle(all, 'ask').slice(0, 8);
            out.push(picks.length ? `${month ? month + '월' : '다가오는'} 축제: ${picks.map(({ code, f }) => `${placeLong({ t: 'kr', code })} ${f.t}(${festivalPeriod(f)})`).join(', ')}` : '축제 자료 없음');
          }
          break;
        }
        case 'our_trips': {
          const p = str(a.place) ? placeArg(a) : null;
          const year = num(a.year);
          const season = str(a.season) as Season | '';
          const person = str(a.person);
          let list = d.trips.filter((t) => t.status === 'done');
          if (p) list = list.filter((t) => t.places.some((x) => samePlace(x, p)));
          if (year) list = list.filter((t) => t.when.y === year);
          if (season && SEASON_LABEL[season as Season]) list = list.filter((t) => t.when.s === season);
          if (person) list = list.filter((t) => t.companions.some((c) => c.includes(person)));
          out.push(list.length ? `우리 기록 ${list.length}건: ${list.slice(0, 8).map((t) => `${formatWhen(t.when)} ${t.title} (${t.places.map(placeLabel).join('·')}${t.companions.length ? `, ${t.companions.join('·')}` : ''})`).join(' / ')}` : `우리 기록 없음${p ? ` (${placeLong(p)}은 안 가봄)` : ''}`);
          for (const t of list.slice(0, 3)) out.push(`  ${addAction(`${t.title} 보기`, { to: `/trips/${t.id}` })}`);
          break;
        }
        case 'our_places': {
          const p = str(a.place) ? placeArg(a) : null;
          const q = str(a.query);
          let list = d.recs;
          if (p) list = list.filter((r) => samePlace(r.region, p));
          if (q) list = list.filter((r) => [r.name, r.memo ?? '', ...Object.values(r.reviews ?? {})].join(' ').includes(q));
          out.push(list.length ? `우리 장소 ${list.length}곳: ${list.slice(0, 8).map((r) => `${r.name}(${placeLabel(r.region)}, ${r.kind}${r.verdict ? `, ${r.verdict === 'again' ? '또 갈래요' : r.verdict === 'meh' ? '별로' : '한 번이면'}` : ''}${Object.entries(r.reviews ?? {}).map(([w, v]) => `, ${w}: "${v}"`).join('')})`).join(' / ')}` : '우리 장소 없음');
          for (const r of list.slice(0, 3)) out.push(`  ${addAction(`${r.name} 보기`, { to: `/places/${r.id}` })}`);
          break;
        }
        case 'our_notes': {
          const q = str(a.query);
          const list = (d.notes ?? []).filter((n) => !q || n.text.includes(q));
          out.push(list.length ? `글 ${list.length}개: ${list.slice(0, 5).map((n) => { const t = d.trips.find((x) => x.id === n.tripId); return `"${n.text.slice(0, 60)}"(${n.by?.name ?? ''}${t ? `, ${t.title}` : ''})`; }).join(' / ')}` : '글 없음');
          break;
        }
        case 'our_photos': {
          const p = str(a.place) ? placeArg(a) : null;
          const tripQ = str(a.trip);
          let trips = d.trips;
          if (p) trips = trips.filter((t) => t.places.some((x) => samePlace(x, p)));
          if (tripQ) trips = trips.filter((t) => t.title.includes(tripQ));
          const ids = new Set(trips.map((t) => t.id));
          const list = (d.photos ?? []).filter((ph) => ph.tripId && ids.has(ph.tripId));
          const byTrip = new Map<string, Photo[]>();
          for (const ph of list) byTrip.set(ph.tripId!, [...(byTrip.get(ph.tripId!) ?? []), ph]);
          out.push(list.length
            ? `사진 ${list.length}장: ${[...byTrip.entries()].slice(0, 6).map(([id, phs]) => { const t = d.trips.find((x) => x.id === id); const caps = phs.map((x) => x.caption?.trim()).filter(Boolean).slice(0, 3); const taken = phs.map((x) => x.taken).filter(Boolean).sort(); return `${t?.title ?? ''} ${phs.length}장${taken.length ? ` (${taken[0]!.slice(0, 10)}${taken.length > 1 ? `~${taken[taken.length - 1]!.slice(0, 10)}` : ''})` : ''}${caps.length ? ` 설명: ${caps.map((c) => `"${c}"`).join(', ')}` : ''}`; }).join(' / ')}`
            : '사진 없음');
          for (const [id] of [...byTrip.entries()].slice(0, 2)) { const t = d.trips.find((x) => x.id === id); if (t) out.push(`  ${addAction(`${t.title} 사진 보기`, { to: `/trips/${t.id}?tab=photos` })}`); }
          break;
        }
        case 'plans': {
          const p = str(a.place) ? placeArg(a) : null;
          const tripQ = str(a.trip);
          let trips = d.trips.filter((t) => t.status === 'planned' || (d.plans ?? []).some((x) => x.tripId === t.id));
          if (p) trips = trips.filter((t) => t.places.some((x) => samePlace(x, p)));
          if (tripQ) trips = trips.filter((t) => t.title.includes(tripQ));
          const rows = trips.slice(0, 3).map((t) => {
            const items = (d.plans ?? []).filter((x) => x.tripId === t.id).sort((x, y) => (x.day ?? '').localeCompare(y.day ?? '') || x.order - y.order);
            return `${t.title} 일정 ${items.length}줄: ${items.slice(0, 12).map((x) => `${x.day ? x.day.slice(5) + ' ' : ''}${x.time ? x.time + ' ' : ''}${x.name}${x.info ? ` (${x.info.slice(0, 40)})` : ''}${x.done ? ' ✓' : ''}`).join(', ') || '없음'}`;
          });
          out.push(rows.length ? rows.join(' / ') : '일정 있는 여행 없음');
          for (const t of trips.slice(0, 2)) out.push(`  ${addAction(`${t.title} 일정 보기`, { to: `/trips/${t.id}?tab=plan` })}`);
          break;
        }
        case 'stats': {
          const s = computeStats(d.trips);
          out.push(`통계: 여행 ${s.tripsDone}번, 핀 ${s.pins}개, 시·군 ${s.cellVisits.size}/${TOTAL_CELLS}, 광역 ${s.groupsVisited.size}/${TOTAL_GROUPS}, 나라 ${s.countryVisits.size}곳, 올해 ${d.trips.filter((t) => t.status === 'done' && t.when.y === now.getFullYear()).length}번`);
          out.push(`  ${addAction('지도 보기', { to: '/map' })}`);
          break;
        }
        case 'wishes': {
          out.push(d.wishes.length ? `가고 싶은 곳 ${d.wishes.length}곳: ${d.wishes.slice(0, 10).map((w) => `${w.spotName ? w.spotName + '·' : ''}${placeLong(w.place)}${w.priority ? `(${w.priority}순위)` : ''}${(w.wantedBy ?? []).length ? `[${w.wantedBy!.join('·')}]` : ''}`).join(', ')}` : '가고 싶은 곳 없음');
          out.push(`  ${addAction('가고 싶은 곳 보기', { to: '/wishes' })}`);
          break;
        }
        case 'next_trips': {
          const list = d.trips.filter((t) => t.status === 'planned');
          out.push(list.length ? `예정: ${list.map((t) => `${t.title} ${formatWhen(t.when)}${dday(t.when, now) ? ` ${dday(t.when, now)}` : ''} (${t.places.map(placeLabel).join('·')})${t.packing?.length ? ` 준비물 ${t.packing.filter((x) => x.done).length}/${t.packing.length}` : ''}`).join(' / ')}` : '예정된 여행 없음');
          for (const t of list.slice(0, 2)) out.push(`  ${addAction(`${t.title} 보기`, { to: `/trips/${t.id}` })}`);
          break;
        }
        case 'recommend': {
          const month = num(a.month);
          const themes = (Array.isArray(a.themes) ? a.themes : [a.theme]).map(str).filter(Boolean);
          const themeId = themes.map((t) => THEMES.find((x) => x.label === t || x.re.test(t))?.id).find(Boolean) ?? null;
          const unvisited = a.unvisited === true || a.unvisited === 'true';
          const g = str(a.group);
          const groupId = g ? GROUPS.find((x) => x.name.includes(g) || g.includes(x.name))?.id ?? null : null;
          const stats = computeStats(d.trips);
          // 질문에 여행 주제(케이블카·해돋이…)나 별·은하수가 있으면 주제 사전의 곳만 사실로 준다 (일반 후보를 주제에 맞는 척 쓰지 않게)
          const tp = question ? topicOf(question) : null;
          const star = question && STAR_Q.test(question);
          if (tp || star) {
            const pool = (tp ? tp.places : DARK_SKY).filter((x) => !unvisited || !stats.cellVisits.has(x.code));
            const label = tp ? tp.label : '별·은하수(어두운 밤하늘)';
            out.push(pool.length ? `${label} 하기 좋은 곳(보라핀 주제 사전): ${pool.slice(0, 6).map((x) => `${placeLong({ t: 'kr', code: x.code })} · ${x.spot} · 우리 ${tripsAt(d, { t: 'kr', code: x.code }).length}번`).join(' / ')}` : `${label}: 조건에 맞는 곳 없음`);
            for (const x of pool.slice(0, 3)) out.push(`  ${addAction(`${placeLabel({ t: 'kr', code: x.code })} 담기`, { wish: { t: 'kr', code: x.code } })}`);
            break;
          }
          const miss = question ? unusedWords(question, d.info) : [];
          if (miss.length) out.push(`주의: 질문의 '${miss.join(', ')}'에 맞는 자료는 없음. 아래 후보는 그 조건과 상관없는 일반 후보이니 그 조건에 맞는다고 쓰지 말 것`);
          let list = candidates({ scope: groupId ?? 'kr', unvisitedOnly: unvisited, theme: themeId, stats, info: d.info, wishes: d.wishes });
          if (month) list = list.filter((c) => seasonFor(d.seasons, c.place)?.m.includes(month));
          const picks = dailyShuffle(list, 'ask').slice(0, Math.min(num(a.count) ?? 4, 6));
          out.push(picks.length ? `추천 후보${month ? ` (${month}월)` : ''}${themes.length ? ` (${themes.join('·')})` : ''}${unvisited ? ' (안 가본 곳)' : ''}: ${picks.map((c) => { const s = seasonFor(d.seasons, c.place); const fest = c.place.t === 'kr' ? upcomingFestivals(d.festivals ?? null, c.place.code, now, 45)[0] : undefined; return `${placeLong(c.place)} · ${c.theme ?? ''}${s ? ` · 좋은 때 ${monthsLabel(s.m)}` : ''}${fest ? ` · 축제 ${fest.t}(${festivalPeriod(fest)})` : ''} · 우리 ${tripsAt(d, c.place).length}번`; }).join(' / ')}` : '조건에 맞는 후보 없음');
          for (const c of picks.slice(0, 3)) out.push(`  ${addAction(`${placeLabel(c.place)} 담기`, { wish: c.place })} ${addAction(`${placeLabel(c.place)} 자세히`, { to: `/map?sel=${placeParam(c.place)}` })}`);
          break;
        }
        case 'packing': {
          const p = str(a.place) ? placeArg(a) : null;
          const kind = str(a.kind) || (p && p.t === 'kr' && /바다|해변|섬/.test(d.info.cells[p.code]?.main.theme ?? '') ? 'rest' : 'city');
          const items = packFromTemplate(kind, p?.t === 'country');
          out.push(`준비물(${kind}${p?.t === 'country' ? ', 해외' : ''}): ${items.map((x) => x.t).join(', ')}`);
          break;
        }
        default:
          out.push(`(모르는 도구 ${c.tool})`);
      }
    } catch (e) {
      console.warn('tool failed', c, e);
    }
  }
  return { text: out.join('\n'), actions };
}

export const lastPlace = (calls: ToolCall[], prev: Place | null): Place | null => {
  let p = prev;
  for (const c of calls) {
    const n = str(c.args?.place ?? c.args?.name);
    if (n) p = resolvePlace(n, p);
  }
  return p;
};
