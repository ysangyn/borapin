import { useState } from 'react';
import { Icon } from './ui';
import { usePlaces } from '../lib/data';
import { TAG_SUGGEST } from '../lib/placeMaps';
import { KIND_LABEL, KINDS, VERDICTS } from '../lib/placeRecs';
import type { PlaceKind, Verdict } from '../lib/types';

/**
 * 종류 + 꼬리표 고르기: '맛집·카페 담기'와 '지금 여기 남기기'가 같이 쓴다 (말·순서·모양을 하나로).
 * 꼬리표는 종류 안의 작은 주제 — 붙이면 '고양시 빵집 지도'처럼 내 지도가 따로 생긴다.
 */
export function KindTagPicker({ kind, tag, onKind, onTag, area }: {
  kind: PlaceKind; tag: string;
  onKind: (k: PlaceKind) => void; onTag: (t: string) => void;
  /** 안내 줄에 쓸 지역 이름 (예: 고양시) */
  area: string;
}) {
  const { places } = usePlaces();
  const [open, setOpen] = useState(false);
  const mine = (places ?? []).filter((p) => p.kind === kind && p.tag?.trim()).map((p) => p.tag!.trim());
  const sugg = [...new Set([...(TAG_SUGGEST[kind] ?? []), ...mine])].slice(0, 8);
  const custom = !!tag && !sugg.includes(tag);
  return (
    <div className="field">
      <span className="label">종류</span>
      <div className="chips" data-testid="kind-chips">
        {KINDS.map((k) => (
          <button key={k.k} type="button" aria-pressed={kind === k.k} className={'chip' + (kind === k.k ? ' on' : '')} onClick={() => { if (k.k !== kind) onTag(''); onKind(k.k); }} data-testid={`kind-${k.k}`}>
            {kind === k.k && <span className="chip-check" aria-hidden="true"><Icon name="check" size={13} stroke={2.6} /></span>}{k.label}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginTop: 8 }} data-testid="place-tags">
        {sugg.map((t) => (
          <button key={t} type="button" className={'chip' + (tag === t ? ' on' : '')} aria-pressed={tag === t} onClick={() => onTag(tag === t ? '' : t)} data-testid={`tag-${t}`}>{t}</button>
        ))}
        {open || custom ? (
          <input className="input" aria-label="내 꼬리표" placeholder="내 꼬리표 (예: 옷가게)" value={tag} onChange={(e) => onTag(e.target.value.slice(0, 20))} style={{ height: 36, width: 150 }} autoFocus={open} />
        ) : (
          <button type="button" className="chip dashed" onClick={() => setOpen(true)}>+ 내 꼬리표</button>
        )}
      </div>
      <span className="tiny muted" style={{ display: 'block', marginTop: 4 }}>꼬리표를 붙이면 '{area} {tag.trim() || '소품샵'} 지도'처럼 내 지도가 따로 생겨요. 안 붙이면 {KIND_LABEL[kind]} 지도에 들어가요.</span>
    </div>
  );
}

/** 다시 간다면: 또 갈래요 · 한 번이면 충분 · 별로 (두 화면 같은 말) */
export function VerdictPicker({ value, onChange }: { value: Verdict | null; onChange: (v: Verdict | null) => void }) {
  return (
    <div className="field">
      <span className="label">다시 간다면 <span className="muted small">(안 골라도 돼요)</span></span>
      <div className="chips" data-testid="verdict-chips">
        {VERDICTS.map((v) => (
          <button key={v.v} type="button" aria-pressed={value === v.v} className={'chip' + (value === v.v ? (v.v === 'again' ? ' on-coral' : ' on') : '')} onClick={() => onChange(value === v.v ? null : v.v)} data-testid={`verdict-${v.v}`}>
            {value === v.v && <span className="chip-check" aria-hidden="true"><Icon name="check" size={13} stroke={2.6} /></span>}{v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
