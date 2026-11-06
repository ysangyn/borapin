import type { ItemKind, SourceHint } from './types';

/** 파일 이름·폴더 이름에서 읽어 내는 것 — 순수 함수 */

const PHOTO = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'gif', 'bmp', 'tif', 'tiff', 'avif']);
const RAW = new Set(['cr2', 'cr3', 'nef', 'arw', 'dng', 'raf', 'orf', 'rw2', 'pef']);
const VIDEO = new Set(['mp4', 'mov', 'm4v', 'avi', 'mts', '3gp', 'webm']);

export function extOf(name: string): string {
  const m = name.match(/\.([A-Za-z0-9]+)$/);
  return m ? m[1].toLowerCase() : '';
}

export function extKind(name: string): ItemKind | null {
  const e = extOf(name);
  if (PHOTO.has(e)) return 'photo';
  if (RAW.has(e)) return 'raw';
  if (VIDEO.has(e)) return 'video';
  return null;
}

const validDate = (y: number, mo: number, d: number) => y >= 1990 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31;
const validTime = (h: number, mi: number) => h >= 0 && h <= 23 && mi >= 0 && mi <= 59;
const p2 = (n: number) => String(n).padStart(2, '0');

export interface NameDate {
  taken: string;
  precision: 'minute' | 'day' | 'month' | 'year';
  /** 메신저로 받은 사진(KakaoTalk_…): 받은 날일 뿐 */
  received?: true;
}

/**
 * 파일 이름에서 날짜·시각. 갤럭시 `20190812_183000`, `IMG_20240503_101522`, 픽셀 `PXL_20240503_011522123`,
 * 스크린샷 `Screenshot_20240503-101522`, 아이폰·기타 `2024-05-03 10.15.22`, 카톡 `KakaoTalk_20240503_101522000`, 날짜만 `20240503`.
 * 카메라 번호(`IMG_0421`, `DSC_1234`)엔 날짜가 없다.
 */
export function dateFromFilename(name: string): NameDate | null {
  const base = name.replace(/\.[A-Za-z0-9]+$/, '');
  const received = /^KakaoTalk_/i.test(base);
  // YYYYMMDD[_-]HHMMSS 또는 YYYY-MM-DD HH.MM.SS / YYYY-MM-DD_HH-MM-SS
  let m = base.match(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})[_-](\d{2})(\d{2})(\d{2})/) ?? base.match(/(?:^|[^\d])(\d{4})-(\d{2})-(\d{2})[ _T](\d{2})[.:\-](\d{2})[.:\-](\d{2})/);
  if (m) {
    const [y, mo, d, h, mi] = m.slice(1).map(Number);
    if (validDate(y, mo, d) && validTime(h, mi)) return { taken: `${y}-${p2(mo)}-${p2(d)}T${p2(h)}:${p2(mi)}`, precision: 'minute', ...(received ? { received: true as const } : {}) };
    return null;
  }
  m = base.match(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})(?![\d])/) ?? base.match(/(?:^|[^\d])(\d{4})-(\d{2})-(\d{2})(?![\d])/);
  if (m) {
    const [y, mo, d] = m.slice(1).map(Number);
    if (validDate(y, mo, d)) return { taken: `${y}-${p2(mo)}-${p2(d)}`, precision: 'day', ...(received ? { received: true as const } : {}) };
  }
  return null;
}

export interface FolderDate extends NameDate {
  /** 폴더 이름의 나머지 글(여행 이름) */
  title: string | null;
}

/**
 * 경로의 폴더 이름에서 날짜와 여행 이름. 가장 깊은 폴더부터 본다.
 * `2024-05-03 제주` · `190812 강릉` · `2024/05` · `2019년 강릉`
 */
export function dateFromFolder(path: string): FolderDate | null {
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
  parts.pop(); // 파일 이름
  for (let i = parts.length - 1; i >= 0; i--) {
    const f = parts[i].trim();
    let m = f.match(/^(\d{4})[-._]?(\d{2})[-._]?(\d{2})(?:\s*[-_~]?\s*(.*))?$/);
    if (m) {
      const [y, mo, d] = m.slice(1, 4).map(Number);
      if (validDate(y, mo, d)) return { taken: `${y}-${p2(mo)}-${p2(d)}`, precision: 'day', title: clean(m[4]) };
    }
    m = f.match(/^(\d{2})(\d{2})(\d{2})(?:\s+(.*))?$/);
    if (m) {
      const y = 2000 + Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
      if (validDate(y, mo, d)) return { taken: `${y}-${p2(mo)}-${p2(d)}`, precision: 'day', title: clean(m[4]) };
    }
    m = f.match(/^(\d{4})[-._년]\s*(\d{1,2})월?(?:\s+(.*))?$/);
    if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12 && Number(m[1]) >= 1990) return { taken: `${m[1]}-${p2(Number(m[2]))}`, precision: 'month', title: clean(m[3]) };
    // `2024/05`: 위 폴더가 연도, 이 폴더가 달
    if (/^(0?[1-9]|1[0-2])$/.test(f) && i > 0 && /^(19|20)\d{2}$/.test(parts[i - 1])) return { taken: `${parts[i - 1]}-${p2(Number(f))}`, precision: 'month', title: null };
    m = f.match(/^((?:19|20)\d{2})년?(?:\s+(.*))?$/);
    if (m) return { taken: m[1], precision: 'year', title: clean(m[2]) };
  }
  return null;
}

const clean = (s: string | undefined): string | null => {
  const t = (s ?? '').replace(/^[-_~\s]+|[-_~\s]+$/g, '').trim();
  return t || null;
};

/** 경로에서 출처 힌트: 스크린샷·메신저·다운로드 폴더 */
export function sourceHint(path: string): SourceHint {
  const p = path.replace(/\\/g, '/').toLowerCase();
  if (/\/(screenshots?|스크린샷|화면 ?캡처)\//.test(p) || /\/screenshot_[^/]*$/.test(p)) return 'screenshot';
  if (/\/(kakaotalk|kakao|line|telegram|whatsapp|카카오톡)\//.test(p) || /\/kakaotalk_[^/]*$/.test(p)) return 'received';
  if (/\/(download|downloads|다운로드)\//.test(p)) return 'download';
  return null;
}

/** 훑기에서 건너뛸 폴더 (캐시·휴지통·시스템) */
export const SKIP_DIR = /^(\.|@eaDir$|\$RECYCLE\.BIN$|System Volume Information$|node_modules$|__MACOSX$|\.thumbnails$|Thumbs\.db$)/i;
