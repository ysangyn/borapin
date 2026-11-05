import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from './ui';
import { drawStory, type StoryInput } from '../lib/storyCard';

/** 스토리 카드 창: 그림을 만들어 보여 주고, 폰이면 바로 보내기(공유), 아니면 저장 */
export default function StoryCard({ input, onClose }: { input: StoryInput; onClose: () => void }) {
  const toast = useToast();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let on = true, u = '';
    drawStory(input).then((b) => { if (!on) return; u = URL.createObjectURL(b); setBlob(b); setUrl(u); }, () => on && setFailed(true));
    return () => { on = false; if (u) URL.revokeObjectURL(u); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const name = `${input.title.replace(/[\\/:*?"<>|]/g, '').slice(0, 30) || '내 지도'}.png`;
  const file = blob ? new File([blob], name, { type: 'image/png' }) : null;
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  const share = async () => {
    if (!file) return;
    try { await navigator.share({ files: [file], title: input.title }); }
    catch (e) { if ((e as Error).name !== 'AbortError') toast('보내지 못했어요 · 그림 저장으로 해 주세요'); }
  };
  return createPortal(
    <div className="map-choice-backdrop" onClick={onClose} data-testid="story-card">
      <div className="map-choice card story-card" role="dialog" aria-label="스토리 카드" onClick={(e) => e.stopPropagation()}>
        <b className="jua" style={{ fontSize: 19 }}>스토리 카드</b>
        {url ? <img src={url} alt={`${input.title} 스토리 카드`} className="story-preview" data-testid="story-img" /> : failed ? <span className="small muted">그림을 만들지 못했어요</span> : <div className="story-preview wait" aria-busy="true" />}
        <span className="tiny muted">카드를 올리고, 스토리의 링크 붙이기로 ‘이 지도 보내기’ 주소를 함께 달아 주세요.</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {canShare && <button type="button" className="btn" style={{ flex: 1 }} onClick={() => void share()}>보내기</button>}
          {url && <a className={'btn ' + (canShare ? 'line' : '')} style={{ flex: 1 }} href={url} download={name} data-testid="story-save">그림 저장</a>}
        </div>
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onClose}>닫기</button>
      </div>
    </div>,
    document.body,
  );
}
