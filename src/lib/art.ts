/** 보라핀 그림 (직접 만든 그림) */
export interface ArtImage {
  id: string;
  /** 540·1080px WebP */
  src: { s: string; l: string };
  w: number;
  h: number;
  lqip: string;
  alt: string;
}

export const ART: ArtImage[] = [
  {
    id: 'bora-walk',
    src: { s: '/art/bora-walk-s.webp', l: '/art/bora-walk-l.webp' },
    w: 1080,
    h: 1080,
    lqip: 'data:image/webp;base64,UklGRh4BAABXRUJQVlA4IBIBAAAwBgCdASoYABgAPu1qq1EppaOiqAqpMB2JZgCdMoMuunmPADGQB+5dWfw2H1gysgMRMpvcPAxGb+MAAOIe2ZrYEQ1R/Kp5ui3bFZmNS6TS4l7wWJhJuDwHRfwWQyk/JMvhZBO1xSOMdjk8uT4sioJvY6FaqdzcTzKS6/a09/leDIHEGlr9f02TxEvgcifzlPTX6EOMDE+SUZXytI5zzTDg+Mas6uYN/2MVe9CHoCVmBYC3HaOvZt0vO4DoiFQcb61/zs5mkRYgRjVq7MR8W9Xvt0V72nzPGVEPTOfJF1HKgcTtowg8rqWeDWvAMNBWtRTiov8TkdSZgMKERIGXaqouOmJbB9JXMJne/r5UHY1MAAAA',
    alt: '지도를 들고 캐리어를 끌며 여행 떠나는 보라',
  },
  {
    id: 'bora-login',
    src: { s: '/art/bora-login.webp', l: '/art/bora-login.webp' },
    w: 540,
    h: 584,
    lqip: '',
    alt: '캐리어를 끌고 지도를 보며 걸어가는 보라',
  },
];
export const artById = (id: string) => ART.find((a) => a.id === id) ?? null;
