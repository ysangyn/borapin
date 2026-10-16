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
    // 글자 없는 판 (2026-10-16 받음). 파일 이름을 바꿔 기기에 저장된 옛 그림이 남지 않게
    src: { s: '/art/bora-walk2-s.webp', l: '/art/bora-walk2-l.webp' },
    w: 1080,
    h: 1080,
    lqip: 'data:image/webp;base64,UklGRhQBAABXRUJQVlA4IAgBAABwBgCdASoYABgAPu1oqU+ppaOiKA1RMB2JagCdMoMkom6LsG+BVNA+qfLZlZmLNbwzATr2iTNSDrTG4gAA4huRWRSqr0i5n5x404Vo0gtvK7SuS/MVpSKoZ8gYA3kHkmlDGWki+nxyFxsLag+CaRiW4ftmDHRXNOtJNFBSa+McAprQwoGK7rN0EWeKneND4iwWk+9qKydotuJb+tIHfUz3YtyOKapYSw0CpJh8NHfxk9fO33ZdOyfe4pQ9mVWSASTnuN9izlR8WhdL07RPEAdwoSyx9hktC/frTFSBJcruSo/VyifE8u/48fibt22tRwHRJ7G2NV2z/CCZ2mQRJyqeZ308D7YAAAA=',
    alt: '지도를 들고 캐리어를 끌며 공룡 친구와 여행 떠나는 보라',
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
