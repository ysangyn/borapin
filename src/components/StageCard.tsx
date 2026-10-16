import { useAllNotes } from '../lib/tripExtras';
import { Link } from 'react-router-dom';
import { Icon } from './ui';
import { formatWhen } from '../lib/dates';
import { placeLabel } from '../lib/geo';
import { photoForPlace } from '../lib/media';
import type { Stage } from '../lib/stage';
import type { Photo } from '../lib/types';

/**
 * 여행 전·중·후에 따라 바뀌는 홈 맨 위 카드.
 * 떠나기 전: D-day와 준비물 진행 · 여행 중: 며칠째와 오늘 일정·사진 · 막 다녀옴: 사진·한 줄 남기기
 */
export default function StageCard({ stage, photos }: { stage: Stage; photos: Photo[] | null }) {
  const t = stage.trip;
  const pack = t.packing ?? [];
  const packed = pack.filter((x) => x.done).length;
  const nPhotos = photos ? photos.filter((p) => p.tripId === t.id).length : null;
  const notes = useAllNotes();
  const nNotes = notes ? notes.filter((n) => n.tripId === t.id).length : 0;
  const photo = t.places.map(photoForPlace).find(Boolean) ?? null;
  const where = t.places.map(placeLabel).join(' · ');
  const art = stage.kind === 'before' ? '/art/bora-pack.webp' : stage.kind === 'during' ? '/art/bora-camera.webp' : '/art/bora-cheer.webp';

  const lead = stage.kind === 'before'
    ? (stage.days === 0 ? '오늘 떠나요!' : `${stage.label} · ${where}`)
    : stage.kind === 'during' ? `${stage.label} · ${where}` : `${stage.label} · ${where}`;
  const sub = stage.kind === 'before'
    ? (pack.length ? `준비물 ${packed}/${pack.length} 챙김` : '준비물 목록을 아직 안 만들었어요')
    : stage.kind === 'during'
      ? (nPhotos ? `사진 ${nPhotos}장 올렸어요` : '오늘 찍은 사진을 바로 올려 두세요')
      : nPhotos && nNotes ? `사진 ${nPhotos}장 · 글 ${nNotes}개 남겼어요`
        : nPhotos ? `사진 ${nPhotos}장 올렸어요 · 한 줄만 남겨 볼까요?`
          : nNotes ? `글 ${nNotes}개 · 사진도 올려 둘까요?`
            : '사진과 한 줄을 남겨 두면 나중에 다시 꺼내 봐요';

  return (
    <Link to={`/trips/${t.id}`} className={'stage-card ' + stage.kind} data-testid="stage-card" data-stage={stage.kind} style={photo ? { backgroundImage: `url(${photo.src.s})` } : undefined}>
      <span className="stage-copy">
        <span className="stage-eyebrow">{stage.kind === 'before' ? '다가오는 여행' : stage.kind === 'during' ? '여행 중' : '다녀온 여행'}</span>
        <b className="stage-title">{t.title}</b>
        <span className="stage-lead">{lead}</span>
        <span className="stage-sub">{sub} · {formatWhen(t.when)}</span>
        <span className="stage-actions">
          {stage.kind === 'before' && <span className="btn sm glass">준비물 보기</span>}
          {stage.kind === 'during' && <span className="btn sm glass"><Icon name="image" size={15} stroke={2.2} />사진 올리기</span>}
          {stage.kind === 'after' && <span className="btn sm glass">{nPhotos && nNotes ? '다시 보기' : nPhotos ? '한 줄 남기기' : nNotes ? '사진 올리기' : '사진·한 줄 남기기'}</span>}
        </span>
      </span>
      <img className="stage-art" src={art} alt="" aria-hidden="true" decoding="async" />
    </Link>
  );
}
