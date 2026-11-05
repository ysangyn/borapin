import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from './ui';
import { applyAnswer, insertAt, mapKey, nextQuestion, rankedRecs, startInsert, themeLabel, themeOf, type InsertState } from '../lib/placeMaps';
import { savePlaceMap, usePlaceMaps } from '../lib/placeMapData';
import { samePlace } from '../lib/wishes';
import type { PlaceRec } from '../lib/types';

/**
 * 장소를 담은 직후 한 번: "새 곳은 OO보다 좋았어요?" — 같은 지역·같은 주제의 지도 순위에 끼운다 (최대 3번, 건너뛰어도 됨).
 * 별점 대신 비교로 순위를 만든다. 견줄 곳이 없으면(그 지도의 첫 곳) 묻지 않고 1등.
 */
export default function RankAsk({ rec, all, onDone }: { rec: Pick<PlaceRec, 'id' | 'name' | 'kind' | 'tag' | 'region'>; all: PlaceRec[]; onDone: () => void }) {
  const docs = usePlaceMaps();
  const toast = useToast();
  const theme = themeOf(rec);
  const key = mapKey(rec.region, theme);
  const doc = docs?.find((d) => d.id === key) ?? null;
  const siblings = useMemo(() => all.filter((r) => r.id !== rec.id && themeOf(r) === theme && samePlace(r.region, rec.region)), [all, rec, theme]);
  const order = useMemo(() => rankedRecs(siblings, doc?.order).map((r) => r.id), [siblings, doc]);
  const [st, setSt] = useState<InsertState | null>(null);
  const state = st ?? startInsert(order, rec.id);
  const pivotId = nextQuestion(state);
  const pivot = siblings.find((r) => r.id === pivotId) ?? null;
  const [busy, setBusy] = useState(false);
  const finish = async (s: InsertState, skipped: boolean) => {
    setBusy(true);
    try {
      if (!skipped || siblings.length === 0) {
        const next = insertAt(s);
        await savePlaceMap(rec.region, theme, { order: next });
        const at = next.indexOf(rec.id) + 1;
        if (!skipped) toast(`${themeLabel(theme)} 지도 ${at}등에 넣었어요`);
      }
    } catch { toast('순위를 저장하지 못했어요'); }
    onDone();
  };
  // 견줄 곳이 없으면 묻지 않는다 (첫 곳은 1등)
  if (docs === null) return null;
  if (!siblings.length || !pivot) { void finish(state, true); return null; }
  const answer = (a: 'better' | 'worse') => {
    const s = applyAnswer(state, a);
    if (nextQuestion(s)) setSt(s); else void finish(s, false);
  };
  return createPortal(
    <div className="map-choice-backdrop" data-testid="rank-ask">
      <div className="map-choice card" role="dialog" aria-label="순위 견주기" style={{ gap: 12 }}>
        <span className="tiny muted">{themeLabel(theme)} 지도에 넣을게요 · {state.asked + 1}/{Math.min(3, Math.ceil(Math.log2(siblings.length + 1)))}</span>
        <b className="jua" style={{ fontSize: 20, lineHeight: 1.3 }}>‘{rec.name}’은 ‘{pivot.name}’보다 좋았어요?</b>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} disabled={busy} onClick={() => answer('better')} data-testid="rank-better">더 좋았어요</button>
          <button className="btn line" style={{ flex: 1 }} disabled={busy} onClick={() => answer('worse')} data-testid="rank-worse">{pivot.name.length > 6 ? '아니요' : `${pivot.name}가 더`}</button>
        </div>
        <button className="link-btn" style={{ alignSelf: 'center' }} disabled={busy} onClick={() => void finish(state, state.asked === 0)} data-testid="rank-skip">{state.asked ? '여기까지만' : '모르겠어요 · 건너뛰기'}</button>
      </div>
    </div>,
    document.body,
  );
}
