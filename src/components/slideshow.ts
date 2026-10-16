import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import { placeLong } from '../lib/geo';
import { takenLabel } from '../lib/photos';
import { BLANK, peekPhotoUrl, photoUrl } from '../lib/photoData';
import type { Photo } from '../lib/types';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/**
 * 전체 화면 슬라이드쇼 (PhotoSwipe, MIT)
 * - 넘겨 보기, 자동 재생(4초), 섞어 보기, 날짜·장소·메모 자막, 지우기
 */
export function openSlideshow(photos: Photo[], index = 0, opts: { autoplay?: boolean; shuffle?: boolean; onDelete?: (p: Photo) => void } = {}) {
  let list = [...photos];
  if (opts.shuffle) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    index = 0;
  }
  // 큰 사진은 넘겨 볼 때 받는다. 받는 동안은 미리보기를 늘려서 보여 준다.
  const srcOf = (p: Photo) => peekPhotoUrl(p.id, 'l') ?? peekPhotoUrl(p.id, 't') ?? BLANK;
  const asked = new Set<string>();
  const lb = new PhotoSwipeLightbox({
    dataSource: list.map((p) => ({ src: srcOf(p), msrc: peekPhotoUrl(p.id, 't'), width: p.w, height: p.h, alt: p.caption || takenLabel(p) })),
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.96,
    showHideAnimationType: 'fade',
    loop: true,
  });
  lb.addFilter('itemData', (item, index) => {
    const p = list[index];
    if (!p) return item;
    if (!peekPhotoUrl(p.id, 'l') && !asked.has(p.id)) {
      asked.add(p.id);
      photoUrl(p.id, 'l').then(() => lb.pswp?.refreshSlideContent(index), () => undefined);
      if (!peekPhotoUrl(p.id, 't')) photoUrl(p.id, 't').then(() => !peekPhotoUrl(p.id, 'l') && lb.pswp?.refreshSlideContent(index), () => undefined);
    }
    return { ...item, src: srcOf(p), msrc: peekPhotoUrl(p.id, 't') };
  });
  let timer = 0;
  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
    document.querySelector('.pswp__button--play')?.classList.remove('on');
  };
  const play = () => {
    stop();
    timer = window.setInterval(() => lb.pswp?.next(), 4000);
    document.querySelector('.pswp__button--play')?.classList.add('on');
  };
  lb.on('uiRegister', () => {
    const ui = lb.pswp!.ui!;
    ui.registerElement({
      name: 'caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: (el, pswp) => {
        el.className = 'pswp__caption-bp';
        const set = () => {
          const p = list[pswp.currIndex];
          if (!p) return;
          const where = p.place ? placeLong(p.place) : '';
          el.innerHTML = `<b>${esc([takenLabel(p), where].filter(Boolean).join(' · '))}</b>${p.caption ? `<span>${esc(p.caption)}</span>` : ''}`;
        };
        pswp.on('change', set);
        set();
      },
    });
    ui.registerElement({
      name: 'play',
      order: 8,
      isButton: true,
      title: '자동 재생',
      html: '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>',
      onClick: () => (timer ? stop() : play()),
    });
    if (opts.onDelete) {
      ui.registerElement({
        name: 'delete',
        order: 7,
        isButton: true,
        title: '이 사진 지우기',
        html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
        onClick: (_e, _el, pswp) => {
          const p = list[pswp.currIndex];
          if (p && window.confirm('이 사진을 지울까요? 되돌릴 수 없어요.')) {
            opts.onDelete!(p);
            pswp.close();
          }
        },
      });
    }
  });
  lb.on('pointerDown', () => timer && stop());
  lb.on('destroy', () => {
    stop();
    list = [];
  });
  lb.init();
  lb.loadAndOpen(index);
  if (opts.autoplay) lb.on('openingAnimationEnd', play);
}
