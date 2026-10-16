import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { usePlaces, useTrips, useWishes } from '../lib/data';
import { usePhotos } from '../lib/photos';
import { resolveReport, setFlags, useFlags, useReports } from '../lib/admin';
import { FREE_DB_BYTES, photosLeft, usedBytes } from '../lib/usage';

const mb = (n: number) => (n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(2)}GB` : `${(n / 1024 / 1024).toFixed(1)}MB`);

function Meter({ value, max, label, sub }: { value: number; max: number; label: string; sub: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="meter">
      <div className="row-between"><b>{label}</b><span className="small muted">{sub}</span></div>
      <div className="meter-bar"><i style={{ width: `${Math.max(pct, value > 0 ? 1.5 : 0)}%`, background: pct >= 90 ? 'var(--danger)' : pct >= 80 ? 'var(--coral)' : 'var(--violet)' }} /></div>
    </div>
  );
}

/** 관리자: 요금제·저장 공간·사진 올리기 멈춤·오류 신고 (관리자 계정에만 보임) */
export default function Admin() {
  const auth = useAuth();
  const toast = useToast();
  const { trips } = useTrips();
  const { places } = usePlaces();
  const { wishes } = useWishes();
  const { photos } = usePhotos();
  const flags = useFlags();
  const reports = useReports();
  const [reason, setReason] = useState('');
  const records = (trips?.length ?? 0) + (places?.length ?? 0) + (wishes?.length ?? 0);
  const used = useMemo(() => usedBytes(photos ?? [], records), [photos, records]);
  const photoBytes = useMemo(() => (photos ?? []).reduce((n, p) => n + (p.bytes ?? 0), 0), [photos]);
  const left = useMemo(() => photosLeft(photos ?? [], records), [photos, records]);
  if (auth.status !== 'ready' || !auth.isAdmin) return <div className="center-screen">관리자만 볼 수 있어요</div>;

  return (
    <>
      <TopBar back title="관리자" />
      <div className="page admin" style={{ paddingTop: 4 }} data-testid="admin">
        <section className="card white" data-testid="plan">
          <div className="row-between" style={{ alignItems: 'center' }}>
            <div className="h2" style={{ fontSize: 16 }}>요금제</div>
            <span className="tag" style={{ background: 'var(--ok-mist)', color: 'var(--ok)' }}>0원</span>
          </div>
          <div className="small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span><b>무료(Spark)</b> · 결제 카드를 등록하지 않아 요금이 나올 수 없어요.</span>
            <span className="muted">한도를 넘으면 돈이 나가는 대신 그날(저장 공간은 비울 때까지) 해당 기능만 멈춰요.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <a className="btn sm ghost" href="https://console.firebase.google.com/project/borapin/usage" target="_blank" rel="noreferrer">Firebase 사용량</a>
          </div>
        </section>

        <section className="card white" data-testid="usage">
          <div className="h2" style={{ fontSize: 16 }}>무료 한도 사용량</div>
          <Meter value={used} max={FREE_DB_BYTES} label="저장 공간" sub={`${mb(used)} / 1GB`} />
          <div className="small">사진 {photos?.length ?? 0}장 · {mb(photoBytes)} — 앞으로 약 <b>{left.toLocaleString('ko-KR')}장</b> 더 올릴 수 있어요</div>
          <div className="small muted">기록: 여행 {trips?.length ?? 0} · 장소 {places?.length ?? 0} · 가고 싶은 곳 {wishes?.length ?? 0}</div>
          <div className="tiny muted">읽기 하루 5만 회·쓰기 2만 회까지 무료예요. 사진 한 장을 처음 볼 때 1회 읽고, 그다음부터는 기기에 저장된 것을 써요.</div>
        </section>

        <section className="card white" data-testid="cutoff">
          <div className="h2" style={{ fontSize: 16 }}>사진 올리기 멈춤</div>
          <div className="small muted">저장 공간이 95% 차면 사진 올리기는 저절로 멈추고, 보기·기록은 그대로 둬요. 아래 스위치로 직접 멈출 수도 있어요.</div>
          <div className="setting-row" style={{ padding: '10px 0' }}>
            <span style={{ flex: 1 }}>
              <b>사진 올리기</b>
              <div className="tiny muted">{flags.uploadsPaused ? `멈춤${flags.reason ? ` · ${flags.reason}` : ''}` : '켜짐'}</div>
            </span>
            {flags.uploadsPaused ? (
              <button className="btn sm" onClick={() => setFlags({ uploadsPaused: false, reason: '' }).then(() => toast('사진 올리기를 다시 켰어요'))} data-testid="uploads-on">다시 켜기</button>
            ) : (
              <button className="btn sm line" onClick={() => setFlags({ uploadsPaused: true, reason: reason.trim() || '관리자가 멈춤' }).then(() => toast('사진 올리기를 멈췄어요'))} data-testid="uploads-off">멈추기</button>
            )}
          </div>
          {!flags.uploadsPaused && <input className="input" aria-label="멈추는 이유" placeholder="멈추는 이유 (선택)" value={reason} onChange={(e) => setReason(e.target.value)} />}
        </section>

        <section className="card white" data-testid="reports">
          <div className="row-between" style={{ alignItems: 'center' }}>
            <div className="h2" style={{ fontSize: 16 }}>오류·문제 신고</div>
            <span className="small muted">{reports?.length ?? 0}건</span>
          </div>
          {reports && reports.length === 0 && <div className="small muted">들어온 신고가 없어요.</div>}
          {reports?.map((r) => (
            <div key={r.id} className="report">
              <div className="row-between" style={{ alignItems: 'center' }}>
                <span className={'tag' + (r.kind === 'report' ? ' coral' : '')}>{r.kind === 'report' ? '신고' : '오류'}</span>
                <span className="tiny muted">{r.createdAt?.toDate?.().toLocaleString('ko-KR') ?? ''} · {r.by || '알 수 없음'}</span>
              </div>
              <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>
              {r.detail && <details><summary className="tiny muted">자세히</summary><pre className="tiny" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{r.detail}</pre></details>}
              <div className="tiny muted">{r.path}</div>
              <button className="link-btn" onClick={() => resolveReport(r.id)}>해결함</button>
            </div>
          ))}
        </section>

        <section className="setting-group">
          <Link to="/space" className="setting-row"><span className="ico"><Icon name="users" size={17} /></span><span style={{ flex: 1 }}>멤버·초대</span><Icon name="chev" size={16} /></Link>
          <Link to="/space" className="setting-row"><span className="ico"><Icon name="download" size={17} /></span><span style={{ flex: 1 }}>백업·엑셀</span><Icon name="chev" size={16} /></Link>
        </section>
      </div>
    </>
  );
}
