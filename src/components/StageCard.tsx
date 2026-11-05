import { useTripNoteCount } from '../lib/tripExtras';
import { useTripPhotoCount } from '../lib/photos';
import { Link } from 'react-router-dom';
import { Icon } from './ui';
import { formatWhen } from '../lib/dates';
import { placeLabel } from '../lib/geo';
import { photoForPlace } from '../lib/media';
import { stageAction, todayPlanLine, type Stage } from '../lib/stage';
import { usePlan } from '../lib/tripExtras';
import { localDate } from '../lib/dates';
import HereNow from './HereNow';
import { nextPlanStep, PLAN_STEP_LABEL } from '../lib/planPick';
import { departLine } from '../lib/way';
import { bookingLine, nextBooking } from '../lib/booking';

/**
 * 여행 전·중·후에 따라 바뀌는 홈 맨 위 카드.
 * 떠나기 전: D-day와 준비물 진행 · 여행 중: 며칠째와 오늘 일정·사진 · 막 다녀옴: 사진·한 줄 남기기
 * 카드는 여행 개요로, 단추는 말한 그 탭(준비·사진·글)으로 간다.
 * 필요한 건 '이 여행'의 사진·글 개수뿐이라 사진·글 전체를 구독하지 않고 서버에서 개수만 센다 (읽기 1+1).
 */
export default function StageCard({ stage }: { stage: Stage }) {
  const t = stage.trip;
  const pack = t.packing ?? [];
  const packed = pack.filter((x) => x.done).length;
  const nPhotos = useTripPhotoCount(t.id);
  const nNotes = useTripNoteCount(t.id) ?? 0;
  // 여행 중이면 오늘 일정 (홈에서 가장 먼저 보고 싶은 것)
  const plan = usePlan(stage.kind === 'during' ? t.id : undefined);
  const now = new Date();
  const today = stage.kind === 'during' && plan ? todayPlanLine(plan, localDate(now), now.getHours() * 60 + now.getMinutes()) : null;
  const photo = t.places.map(photoForPlace).find(Boolean) ?? null;
  const where = t.places.map(placeLabel).join(' · ');
  const art = stage.kind === 'before' ? '/art/bora-pack.webp' : stage.kind === 'during' ? '/art/bora-camera.webp' : '/art/bora-cheer.webp';
  const action = stageAction(stage, { photos: nPhotos ?? 0, notes: nNotes });
  // 계획 이어가기를 시작했는데 걸음이 남았으면 단추를 '이어서 계획하기'로
  // 기록 남기기로 바로 만든 예정 여행(걸음 0)은 그대로 준비물 — 계획은 여행 상세에서 권한다
  const planNext = stage.kind === 'before' && t.status === 'planned' && (t.planDone?.length ?? 0) > 0 ? nextPlanStep(t.planDone) : null;

  const lead = stage.kind === 'before'
    ? (stage.days === 0 ? '오늘 떠나요!' : `${stage.label} · ${where}`)
    : stage.kind === 'during' ? `${stage.label} · ${where}` : `${stage.label} · ${where}`;
  // 떠나기 일주일 안: 고른 교통편 첫 차를 한 줄로 (예매 잊지 않게)
  // 떠나기 일주일 안·여행 중: 적어 둔 예약이 있으면 다음 예약 한 줄(편명·체크인·예약번호), 없으면 고른 교통편 첫 차
  const nb = (stage.kind === 'during' || (stage.kind === 'before' && stage.days <= 7)) ? nextBooking(t.bookings) : null;
  const depart = nb ? bookingLine(nb) : stage.kind === 'before' && stage.days <= 7 ? departLine(t.way?.go) : null;
  const sub = stage.kind === 'before'
    ? (nb ? depart : depart ? `${depart} · 예매하셨어요?` : planNext ? `계획 ${t.planDone?.length ?? 0}/5 · 다음은 '${PLAN_STEP_LABEL[planNext]}'` : pack.length ? `준비물 ${packed}/${pack.length} 챙김` : '준비물 목록을 아직 안 만들었어요')
    : stage.kind === 'during'
      ? (nb && nb.date === localDate(now) ? `${depart}` : today ? (today.left ? `오늘 ${today.left}곳 남았어요${today.next ? ` · 다음 ${today.next}` : ''}` : `오늘 일정 ${today.total}곳 다 다녀왔어요`) : nPhotos ? `사진 ${nPhotos}장 올렸어요` : '오늘 찍은 사진을 바로 올려 두세요')
      : nPhotos && nNotes ? `사진 ${nPhotos}장 · 글 ${nNotes}개 남겼어요`
        : nPhotos ? `사진 ${nPhotos}장 올렸어요 · 한 줄만 남겨 볼까요?`
          : nNotes ? `글 ${nNotes}개 · 사진도 올려 둘까요?`
            : '사진과 한 줄을 남겨 두면 나중에 다시 꺼내 봐요';

  return (
    <div className={'stage-card ' + stage.kind} data-testid="stage-card" data-stage={stage.kind} style={photo ? { backgroundImage: `url(${photo.src.s})` } : undefined}>
      {/* 카드 어디를 눌러도 여행으로 (단추만 빼고) */}
      <Link to={`/trips/${t.id}`} className="stage-main" aria-label={`${t.title} 보기`} data-testid="stage-link" />
      <span className="stage-copy">
        <span className="stage-eyebrow">{stage.kind === 'before' ? '다가오는 여행' : stage.kind === 'during' ? '여행 중' : '다녀온 여행'}</span>
        <b className="stage-title">{t.title}</b>
        <span className="stage-lead">{lead}</span>
        <span className="stage-sub">{sub} · {formatWhen(t.when)}</span>
        <span className="stage-actions">
          {planNext ? (
            <Link to={`/trips/${t.id}/plan-next?step=${planNext}`} className="btn sm glass" data-testid="stage-plan">이어서 계획하기</Link>
          ) : (
            <Link to={action.to} className="btn sm glass" data-testid="stage-action">
              {stage.kind === 'during' && <Icon name="image" size={15} stroke={2.2} />}{action.label}
            </Link>
          )}
          {today && <Link to={`/trips/${t.id}?tab=plan`} className="btn sm glass" data-testid="stage-today">일정</Link>}
          {stage.kind === 'during' && <HereNow trip={t} />}
        </span>
      </span>
      <img className="stage-art" src={art} alt="" aria-hidden="true" decoding="async" />
    </div>
  );
}
