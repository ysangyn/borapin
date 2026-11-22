import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import { memberNames } from '../lib/members';
import { createTrip, deleteTrip } from '../lib/data';
import { placeLabel } from '../lib/geo';
import type { Place, Trip, Wish } from '../lib/types';
import { quickWish } from '../lib/wishActions';
import { samePlace } from '../lib/wishes';
import { quickTripInput } from '../lib/tripActions';
import { celebrate, whatsNew } from '../lib/celebrate';

/**
 * 지역에서 남기는 말은 둘뿐: 📍 다녀왔어요 / ♡ 가고 싶어요 (사용자 의견 11-22: '담기'·'핀'·'기록'이 뒤섞여 뭘 눌러야 할지 몰랐다).
 * 단추를 누르면 '얼마나 자세히'를 고른다. 지도 창(PlaceSheet)과 지역 한 장(RegionPage)이 같이 쓴다.
 */
export default function BeenWant({ place, trips, wishes, againCount = 0, inline }: { place: Place; trips: Trip[]; wishes: Wish[]; againCount?: number; /** 창 안에서는 고르는 칸이 단추 위로 펼쳐진다 (창 밖으로 잘리지 않게) */ inline?: boolean }) {
  const nav = useNavigate();
  const toast = useToast();
  const auth = useAuth();
  const [open, setOpen] = useState<null | 'been' | 'want'>(null);
  const [busy, setBusy] = useState(false);
  const pp = place.t === 'kr' ? `kr:${place.code}` : `country:${place.id}${place.city ? `:${encodeURIComponent(place.city)}` : ''}`;
  const name = placeLabel(place);
  const wish = wishes.find((w) => !w.tripId && samePlace(w.place, place));
  const ready = auth.status === 'ready';

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(null); } };
    window.addEventListener('keydown', esc, true);
    return () => window.removeEventListener('keydown', esc, true);
  }, [open]);

  const pin = async () => {
    if (auth.status !== 'ready' || busy) return;
    setBusy(true);
    try {
      const input = quickTripInput(place, memberNames());
      const news = whatsNew(trips, [...trips, { ...input, id: 'new', v: 1 }]);
      const id = await createTrip(input, auth.user);
      if (news) celebrate();
      setOpen(null);
      toast(`${name}에 핀을 꽂았어요${news ? ` · ${news}` : ''}`, { label: '되돌리기', onClick: () => void deleteTrip(id) });
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const addWish = async () => {
    if (auth.status !== 'ready') return;
    try {
      const { id, already } = await quickWish(place, auth.user, wishes);
      setOpen(null);
      toast(already ? '이미 가고 싶은 곳에 있어요' : '가고 싶은 곳에 담았어요', { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch {
      toast('담지 못했어요. 다시 해 주세요');
    }
  };

  return (
    <div className={'bw' + (inline ? ' inline' : '')} data-testid="been-want">
      {open && <div className="bw-backdrop" onClick={() => setOpen(null)} aria-hidden="true" />}
      {open === 'been' && (
        <div className="bw-pop" role="menu" aria-label="다녀왔어요" data-testid="been-menu">
          <span className="bw-pop-head">{name}, 얼마나 남길까요?</span>
          <button type="button" role="menuitem" className="bw-item" onClick={() => void pin()} disabled={busy || !ready} data-testid="quick-pin">
            <Icon name="pin" size={20} /><span><b>{busy ? '꽂는 중…' : againCount ? '핀 하나 더 꽂기' : '핀만 꽂기'}</b><small>날짜 없이 다녀온 표시만</small></span>
          </button>
          <Link to={`/record?place=${pp}`} role="menuitem" className="bw-item" data-testid="been-trip">
            <Icon name="calendar" size={20} /><span><b>다녀온 여행 남기기</b><small>날짜·사진·같이 간 사람까지</small></span>
          </Link>
          <Link to={`/places/new?region=${pp}&status=been`} role="menuitem" className="bw-item" data-testid="been-place">
            <Icon name="star" size={20} /><span><b>다녀온 가게·명소 남기기</b><small>맛집·카페·볼거리 한 곳과 한 줄 평</small></span>
          </Link>
        </div>
      )}
      {open === 'want' && (
        <div className="bw-pop" role="menu" aria-label="가고 싶어요" data-testid="want-menu">
          <span className="bw-pop-head">무엇이 가고 싶어요?</span>
          {wish ? (
            <Link to={`/wishes/${wish.id}`} role="menuitem" className="bw-item on" data-testid="sheet-wished">
              <span className="bw-heart" aria-hidden="true">♥</span><span><b>{name}, 가고 싶은 곳에 있어요</b><small>메모·들를 곳 보기</small></span>
            </Link>
          ) : (
            <button type="button" role="menuitem" className="bw-item" onClick={() => void addWish()} disabled={!ready} data-testid="sheet-wish">
              <span className="bw-heart" aria-hidden="true">♡</span><span><b>{name} 가고 싶어요</b><small>이 지역을 가고 싶은 곳에</small></span>
            </button>
          )}
          <Link to={`/places/new?region=${pp}&status=want`} role="menuitem" className="bw-item" data-testid="want-place">
            <Icon name="star" size={20} /><span><b>가고 싶은 가게·명소</b><small>찜해 둘 맛집·카페·볼거리 한 곳</small></span>
          </Link>
          <Link to={`/plan?place=${pp}`} role="menuitem" className="bw-item" data-testid="want-plan">
            <Icon name="calendar" size={20} /><span><b>여기로 여행 계획하기</b><small>언제 갈지, 어디서 잘지 같이 정하기</small></span>
          </Link>
        </div>
      )}
      <div className="bw-bar">
        <button type="button" className={'btn' + (open === 'been' ? ' on' : '')} aria-expanded={open === 'been'} onClick={() => setOpen(open === 'been' ? null : 'been')} data-testid="sheet-been">
          <Icon name="pin" size={18} stroke={2.2} />{againCount ? '또 다녀왔어요' : '다녀왔어요'}
        </button>
        <button type="button" className={'btn coral-soft' + (open === 'want' ? ' on' : '')} aria-expanded={open === 'want'} onClick={() => setOpen(open === 'want' ? null : 'want')} data-testid="sheet-want">
          <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>{wish ? '♥' : '♡'}</span>가고 싶어요
        </button>
      </div>
    </div>
  );
}
