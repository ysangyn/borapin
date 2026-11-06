/** 보라핀 사진함 0단계: 훑기 결과 한 줄 (읽기 전용 — 파일은 건드리지 않는다) */
export type ItemKind = 'photo' | 'raw' | 'video';
export type TakenFrom = 'exif' | 'filename' | 'folder' | 'mtime';
export type SourceHint = 'screenshot' | 'received' | 'download' | null;

export interface Item {
  /** 등록한 보관처(루트 폴더) */
  root: string;
  /** 루트 아래 상대 경로 ('/' 구분) */
  rel: string;
  size: number;
  /** 파일 수정 시각 (현지, 분까지) */
  mtime: string;
  kind: ItemKind;
  ext: string;
  /** 빠른 해시: 크기 + 앞·뒤 64KB (훑기용) */
  quick: string;
  /** 내용 전체 SHA-256 (같은 사진 판정) · 못 읽으면 null */
  sha: string | null;
  /** 촬영 시각 'YYYY-MM-DDTHH:mm' 또는 날짜만 'YYYY-MM-DD'(파일명·폴더) */
  taken: string | null;
  takenFrom: TakenFrom | null;
  tz: string | null;
  lat: number | null;
  lng: number | null;
  camera: string | null;
  /** 출처 힌트: 스크린샷·메신저로 받은 것·다운로드 */
  hint: SourceHint;
  /** 메신저로 받은 사진(파일명 규칙) — 촬영일이 아니라 받은 날 */
  received: boolean;
}

export const fullPath = (i: Pick<Item, 'root' | 'rel'>) => `${i.root.replace(/[\\/]+$/, '')}/${i.rel}`;
