/**
 * 혼자 쓰는 공간 (docs/design/SPACES-PUBLIC.md 3-6절): 구성원이 한 명인 공간.
 * 자료와 규칙은 같고 화면 말만 다르다. 판단은 여기 하나로 한다 (화면 곳곳에서 사람 수를 직접 세지 않는다).
 */
import { memberNames } from './members';

/** 지금 공간을 혼자 쓰나 (이름이 아직 안 실렸으면 둘 이상으로 본다: 우리 공간이 잠깐 '혼자'로 깜빡이지 않게) */
export const isSolo = () => memberNames().length === 1;

/** 혼자면 one, 아니면 two */
export const soloText = (two: string, one: string) => (isSolo() ? one : two);

/** 설정 화면 이름: 우리 공간 / 내 공간 */
export const spaceWord = () => soloText('우리 공간', '내 공간');
