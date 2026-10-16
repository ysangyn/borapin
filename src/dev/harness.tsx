import { createRoot } from 'react-dom/client';
import '../styles.css';
import MapView from '../components/MapView';
import { computeStats } from '../lib/data';
import type { Trip } from '../lib/types';
const mk = (places: unknown[]) => ({ id: Math.random().toString(), title: 'x', kind: 'trip', status: 'done', when: { p: 'year', y: 2024 }, places, companions: [], memo: '', tags: [], v: 1 });
const a = computeStats([mk([{ t: 'kr', code: '51150' }]), mk([{ t: 'country', id: 'JPN' }])] as unknown as Trip[]);
const b = computeStats([mk([{ t: 'kr', code: '51150' }]), mk([{ t: 'country', id: 'JPN' }]), mk([{ t: 'country', id: 'FRA' }]), mk([{ t: 'country', id: 'VNM' }])] as unknown as Trip[]);
const c = computeStats([mk([{ t: 'kr', code: '51150' }])] as unknown as Trip[]);
createRoot(document.getElementById('root')!).render(
  <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
    <MapView mode="world" stats={c} height={230} controls={false} />
    <MapView mode="world" stats={a} height={230} controls={false} />
    <MapView mode="world" stats={b} height={230} controls={false} />
  </div>,
);
