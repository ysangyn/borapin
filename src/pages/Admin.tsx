import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { usePlaces, useTrips, useWishes } from '../lib/data';
import { usePhotos } from '../lib/photos';
import { resolveReport, setFlags, useBilling, useFlags, useReports } from '../lib/admin';

const GB = 1024 ** 3;
const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;

function Meter({ value, max, label, sub }: { value: number; max: number; label: string; sub: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="meter">
      <div className="row-between"><b>{label}</b><span className="small muted">{sub}</span></div>
      <div className="meter-bar"><i style={{ width: `${Math.max(pct, value > 0 ? 1.5 : 0)}%`, background: pct >= 90 ? 'var(--danger)' : pct >= 80 ? 'var(--coral)' : 'var(--violet)' }} /></div>
    </div>
  );
}

/** 관리자: 요금·사용량·자동 차단·오류 신고 (YUN 계정에만 보임) */
export default function Admin() {
  const auth = useAuth();
  const toast = useToast();
  const { trips } = useTrips();
  const { places } = usePlaces();
  const { wishes } = useWishes();
  const { photos } = usePhotos();
  const flags = useFlags();
  const billing = useBilling();
  const reports = useReports();
  const [reason, setReason] = useState('');
  const bytes = useMemo(() => (photos ?? []).reduce((n, p) => n + (p.bytes ?? 0), 0), [photos]);
  if (auth.status !== 'ready' || !auth.isAdmin) return <div className="center-screen">관리자만 볼 수 있어요</div>;

  return (
    <>
      <TopBar back title="관리자" />
      <div className="page admin" style={{ paddingTop: 4 }} data-testid="admin">
        <section className="card white">
          <div className="h2" style={{ fontSize: 16 }}>이번 달 요금</div>
          {billing?.costKrw != null ? (
            <>
              <Meter value={billing.costKrw} max={billing.budgetKrw ?? 5000} label={won(billing.costKrw)} sub={`예산 ${won(billing.budgetKrw ?? 5000)}${billing.forecastKrw ? ` · 월말 예상 ${won(billing.forecastKrw)}` : ''}`} />
              <div className="tiny muted">구글이 집계한 값이라 몇 시간 늦을 수 있어요.</div>
            </>
          ) : (
            <div className="small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>요금제 <b>Blaze</b> · 예산 알림 <b>5,000원</b> (구글 결제에서 설정)</span>
              <span className="muted">둘이 쓰는 동안은 무료 범위 안이라 0원이에요. 구글 예산 값을 받아 여기 보여 주는 연결은 다음 단계에서 붙여요.</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <a className="btn sm ghost" href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer">결제·예산 열기</a>
            <a className="btn sm ghost" href="https://console.firebase.google.com/project/borapin/usage" target="_blank" rel="noreferrer">Firebase 사용량</a>
          </div>
        </section>

        <section className="card white" data-testid="usage">
          <div className="h2" style={{ fontSize: 16 }}>무료 한도 사용량</div>
          <Meter value={bytes} max={5 * GB} label="사진 저장" sub={`${(bytes / 1024 / 1024).toFixed(1)}MB / 5GB · ${photos?.length ?? 0}장`} />
          <Meter value={(trips?.length ?? 0) + (places?.length ?? 0) + (wishes?.length ?? 0)} max={20000} label="기록" sub={`여행 ${trips?.length ?? 0} · 장소 ${places?.length ?? 0} · 가고 싶은 곳 ${wishes?.length ?? 0}`} />
          <div className="tiny muted">읽기·쓰기 횟수(하루 5만·2만 회 무료)는 Firebase 사용량 화면에서 봐요.</div>
        </section>

        <section className="card white" data-testid="cutoff">
          <div className="h2" style={{ fontSize: 16 }}>자동 차단</div>
          <div className="small muted">예산 80%가 되면 사진 올리기를 잠시 멈추고, 보기·기록은 그대로 둡니다. 지금은 아래 스위치로 직접 멈출 수 있어요.</div>
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
