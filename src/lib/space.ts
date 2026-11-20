/**
 * 지금 쓰는 공간 (Firebase 설정과 떨어진 작은 모듈: 순수 모듈·시험에서도 가져다 쓴다).
 * 우리 공간은 'main', 다른 공간은 별명 문서(profiles/{uid}.spaceId)가 가리키는 곳.
 * 로그인할 때 auth.tsx가 정하고, 자료 구독은 그 뒤에 시작한다. ('살아 있는 이름'이라 가져다 쓴 곳 모두에 바로 보인다)
 */
export let SPACE_ID = 'main';
export function setSpaceId(id: string) { SPACE_ID = id; }
