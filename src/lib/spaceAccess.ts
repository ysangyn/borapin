/**
 * 여러 공간 3걸음 나: 우리 공간(main)이 아닌 공간을 쓸 때 필요한 순수 도우미.
 * - 다른 공간에는 옛 메일 목록(config/access)이 없다. 구성원 문서들로 같은 모양의 목록을 만들어 화면이 그대로 쓰게 한다.
 */
import type { Access, Relation } from './types';

export interface SpaceMember { uid: string; email: string; role: 'admin' | 'member'; name: string; relation?: Relation | string; via?: string; v?: 1 }

/** 구성원 문서들 → 함께 쓰는 사람 목록. 관리자 먼저, 그다음 이름 순 */
export function accessFromMembers(list: SpaceMember[]): Access {
  const sorted = [...list].sort((a, b) => (a.role === b.role ? a.name.localeCompare(b.name, 'ko') : a.role === 'admin' ? -1 : 1));
  const e = (m: SpaceMember) => m.email.toLowerCase();
  return {
    allowed: sorted.map(e),
    admins: sorted.filter((m) => m.role === 'admin').map(e),
    names: Object.fromEntries(sorted.map((m) => [e(m), m.name])),
    relations: Object.fromEntries(sorted.filter((m) => m.relation).map((m) => [e(m), m.relation as Relation])),
    uids: Object.fromEntries(sorted.map((m) => [e(m), m.uid])),
  };
}

/** 폰 저장 열쇠: 우리 공간은 예전 이름 그대로(이미 적힌 것을 잃지 않게), 다른 공간은 공간 이름표를 붙인다 */
export const spaceKey = (base: string, spaceId: string) => (spaceId === 'main' ? base : `${base}@${spaceId}`);

/** 새 공간 이름표: 영문·숫자 20자 (firestore.rules validSpaceInvite와 같은 모양) */
export function newSpaceId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const buf = new Uint8Array(20);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => chars[b % chars.length]).join('');
}
