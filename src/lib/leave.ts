/** 앱이 스스로 뒤로 갈 때(저장 뒤·뒤로 단추) 잠깐 묻지 않게 */
let freeUntil = 0;
export const leaveFreely = () => { freeUntil = Date.now() + 1000; };
/** 폰·브라우저 뒤로 가기(POP)일 때만, 쓰던 게 있으면 묻는다 (시험: tests/unit/leave.test.ts) */
export const shouldAskLeave = (dirty: boolean, action: string, now = Date.now()) => dirty && action === 'POP' && now > freeUntil;
