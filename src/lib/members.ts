/**
 * 지금 공간을 함께 쓰는 사람들 (이름·첫 글자·색). 로그인하면 auth가 채운다.
 * Firebase를 쓰지 않는 순수 모듈이라 통계·찾아보기·시험 코드에서도 쓴다.
 */
export interface Member {
  email: string;
  name: string;
  /** 동그라미에 쓰는 첫 글자 */
  initial: string;
  /** 동그라미 색 번호 (0~3) */
  tone: number;
}

let list: Member[] = [];

/** 이름 순서(가나다)로 정렬해 누가 들어와도 같은 순서로 보이게 */
export function setMembers(people: { email: string; name: string }[]) {
  const seen = new Set<string>();
  const uniq = people.filter((p) => p.name && !seen.has(p.name) && seen.add(p.name));
  list = uniq
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    .map((p, i) => ({ ...p, initial: [...p.name][0] ?? '?', tone: i % 4 }));
}

export const members = (): Member[] => list;
export const memberNames = (): string[] => list.map((m) => m.name);
export const isMemberName = (name: string) => list.some((m) => m.name === name);
export const toneOf = (name: string) => list.find((m) => m.name === name)?.tone ?? -1;

/** 공간 이름: '보라 & 영상', 셋 이상이면 '엄마 · 아빠 외 1명' */
export function spaceTitle(names = memberNames()): string {
  if (!names.length) return '우리';
  if (names.length <= 2) return names.join(' & ');
  return `${names.slice(0, 2).join(' · ')} 외 ${names.length - 2}명`;
}

/** 모두가 원하는지 (둘 이상일 때만 의미가 있다) */
export const everyoneWants = (wantedBy: string[] | undefined) => list.length >= 2 && list.every((m) => (wantedBy ?? []).includes(m.name));
/** '둘 다 원해요' / '모두 원해요' */
export const everyoneLabel = () => (list.length === 2 ? '둘 다 원해요' : '모두 원해요');
