/** 우리 공간(main)이 아닌 공간의 구성원 다루기 (firestore.rules: 자기 이름만 고침, 관리자는 남을 내보냄, 구성원은 스스로 나감) */
import { deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db, SPACE_ID } from './firebase';
import { queued } from './writes';

const memberRef = (uid: string) => doc(db, 'spaces', SPACE_ID, 'members', uid);

export const renameMeInSpace = (uid: string, name: string) =>
  queued(updateDoc(memberRef(uid), { name: name.trim().slice(0, 20), updatedAt: serverTimestamp() }));

export const removeFromSpace = (uid: string) => queued(deleteDoc(memberRef(uid)));

/** 스스로 나가기: 내 구성원 문서와 별명 문서를 함께 지운다 (별명 문서는 들어 있는 공간만 가리킬 수 있다) */
export async function leaveSpace(uid: string) {
  const b = writeBatch(db);
  b.delete(memberRef(uid));
  b.delete(doc(db, 'profiles', uid));
  await b.commit();
}
