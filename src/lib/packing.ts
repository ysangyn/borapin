import type { PackItem } from './types';

/** 준비물 기본 목록 (Firebase 없이 쓰는 순수 모듈: 찾아보기에서도 쓴다) */
const COMMON = ['신분증', '지갑·카드', '휴대폰 충전기', '보조배터리', '상비약', '세면도구', '갈아입을 옷', '잠옷'];
export const PACK_TEMPLATES: Record<string, { label: string; items: string[] }> = {
  rest: { label: '휴양', items: ['수영복', '선크림', '선글라스', '모자', '비치타월', '샌들'] },
  city: { label: '도시', items: ['편한 신발', '접는 우산', '에코백', '보조 가방'] },
  nature: { label: '자연', items: ['등산화', '바람막이', '물병', '간식', '벌레 기피제', '손전등'] },
  family: { label: '가족', items: ['아이 간식', '물티슈', '여벌 옷', '장난감', '아이 상비약'] },
};
const ABROAD = ['여권', '환전·트래블카드', '멀티어댑터', '유심·eSIM', '여행자 보험', '항공권·숙소 예약 확인'];

export function packFromTemplate(kind: string, abroad: boolean): PackItem[] {
  const names = [...(abroad ? ABROAD : []), ...COMMON, ...(PACK_TEMPLATES[kind]?.items ?? [])];
  return [...new Set(names)].map((t) => ({ t, who: null, done: false }));
}

