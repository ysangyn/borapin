/**
 * 여러 공간 2걸음: 구성원 문서(spaces/{공간}/members/{uid})와 별명 문서(profiles/{uid}).
 * 지금 문은 아직 옛 메일 목록(config/access)이다. 여기서는 새 문에 쓸 문서를 미리 만들어 두기만 한다.
 * (docs/design/SPACES-PUBLIC.md 3-5절)
 */
import type { Relation } from './types';

export interface MemberDoc {
  uid: string;
  email: string;
  role: 'admin' | 'member';
  name: string;
  relation?: Relation;
  /** 어떻게 들어왔나: 옛 목록에서 넘어온 사람은 'legacy', 초대로 온 사람은 초대 코드(3걸음) */
  via: string;
  v: 1;
}

/** 옛 목록에 있는 사람의 구성원 문서. 역할은 옛 관리자 목록을 그대로 따른다 */
export function legacyMemberDoc(user: { uid: string; email: string | null }, info: { name: string; isAdmin: boolean; relation?: Relation | null }): MemberDoc {
  return {
    uid: user.uid,
    email: (user.email ?? '').toLowerCase(),
    role: info.isAdmin ? 'admin' : 'member',
    name: info.name.trim().slice(0, 20) || '나',
    ...(info.relation ? { relation: info.relation } : {}),
    via: 'legacy',
    v: 1,
  };
}

/** 같은 내용이면 같은 글. 폰에 적어 두고, 바뀌었을 때만 다시 쓴다 (읽기 0) */
export function memberSignature(d: MemberDoc): string {
  return [d.uid, d.email, d.role, d.name, d.relation ?? '', d.via].join('|');
}

/** 별명 문서의 처음 값. 메일·실명 칸은 없다 */
export function profileSeed(name: string, spaceId: string): { nick: string; spaceId: string; v: 1 } {
  return { nick: name.trim().slice(0, 10) || '나', spaceId, v: 1 };
}
