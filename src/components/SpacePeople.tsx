import { useState } from 'react';
import { Icon, useToast } from './ui';
import { nameOf, useAuth } from '../lib/auth';
import { RELATION_ICON, RELATION_LABEL, spaceTitle } from '../lib/members';
import { createMemberInvite, createNewSpaceInvite, deleteSpaceInvite, inviteUrl, useMySpaceInvites } from '../lib/invites';
import { leaveSpace, removeFromSpace, renameMeInSpace } from '../lib/spaceMembers';
import { shareAnyhow } from '../lib/kakao';
import { withJosa } from '../lib/ko';
import type { Relation } from '../lib/types';

/** 초대 링크 한 줄: 보내기·지우기 */
function InviteRow({ code, title, expiresAt, sender, onDelete }: { code: string; title: string; expiresAt: number; sender: string; onDelete: () => Promise<void> }) {
  const toast = useToast();
  return (
    <div className="setting-row" data-testid="invite-row">
      <span className="ico"><Icon name="link" size={17} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <b>{title}</b>
        <div className="tiny muted ellipsis" data-testid="invite-url">{inviteUrl(code)}</div>
        <div className="tiny muted">{Math.max(1, Math.ceil((expiresAt - Date.now()) / 86400000))}일 남음 · 한 번 쓰면 사라져요</div>
      </span>
      <span style={{ display: 'flex', gap: 6 }}>
        <button className="btn sm soft" onClick={async () => {
          const r = await shareAnyhow({ title: '보라핀에 초대해요', description: `${withJosa(sender, '이/가')} 함께 여행 기록을 남기자고 초대했어요. 링크를 눌러 로그인하면 들어와요.`, url: inviteUrl(code), button: '들어가기' }, () => toast('링크를 복사했어요'));
          if (r === 'kakao') toast('카카오톡을 열었어요 · 보낼 사람을 골라 주세요');
        }} data-testid="invite-share">보내기</button>
        <button className="btn sm line" onClick={() => { if (window.confirm('이 초대 링크를 지울까요? 받은 사람은 더 들어올 수 없어요.')) onDelete().then(() => toast('초대 링크를 지웠어요'), () => toast('지우지 못했어요')); }} aria-label="초대 링크 지우기">지우기</button>
      </span>
    </div>
  );
}

/** 우리 공간이 아닌 공간의 '함께 쓰는 사람'과 '초대 링크' (구성원 문서로) */
export function SpacePeople() {
  const auth = useAuth();
  const toast = useToast();
  const [removing, setRemoving] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteRel, setInviteRel] = useState<Relation | ''>('');
  const [making, setMaking] = useState(false);
  const user = auth.status === 'ready' ? auth.user : null;
  const invites = useMySpaceInvites(user && auth.status === 'ready' && auth.isAdmin ? user : null, 'member');
  if (auth.status !== 'ready' || !user) return null;
  const { access, isAdmin } = auth;
  const me = (user.email ?? '').toLowerCase();
  const uidOf = (e: string) => access.uids?.[e] ?? '';

  return (
    <>
      <section>
        <div className="label" style={{ padding: '0 4px 6px' }}>함께 쓰는 사람</div>
        <div className="setting-group">
          {access.allowed.map((e) => (
            <div key={e} className="setting-row">
              <span className="ico"><Icon name="users" size={17} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{nameOf(e)}</b>
                {access.admins.includes(e) ? <span className="tag violet" style={{ marginLeft: 6 }}>관리자</span> : null}
                {access.relations?.[e] ? <span className="tag" style={{ marginLeft: 6 }}>{RELATION_ICON[access.relations[e]]} {RELATION_LABEL[access.relations[e]]}</span> : null}
                {e === me && (
                  <button className="link-btn" style={{ marginLeft: 8, display: 'inline' }} aria-label="내 이름 바꾸기" onClick={async () => {
                    const n = window.prompt('앱에서 부를 내 이름', nameOf(e));
                    if (n === null || !n.trim()) return;
                    try { await renameMeInSpace(user.uid, n); toast('이름을 바꿨어요'); } catch { toast('바꾸지 못했어요. 다시 해 주세요'); }
                  }}>이름 바꾸기</button>
                )}
                <div className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{e}</div>
              </span>
              {isAdmin && e !== me && (
                removing === e ? (
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button className="btn sm ghost" onClick={() => setRemoving(null)}>두기</button>
                    <button className="btn sm" style={{ background: 'var(--danger)' }} onClick={async () => {
                      setRemoving(null);
                      try { await removeFromSpace(uidOf(e)); toast(`${nameOf(e)} 님을 내보냈어요`); } catch { toast('내보내지 못했어요. 다시 해 주세요'); }
                    }}>내보내기</button>
                  </span>
                ) : (
                  <button className="btn sm line" onClick={() => setRemoving(e)} aria-label={`${e} 내보내기`}>내보내기</button>
                )
              )}
            </div>
          ))}
        </div>
        {!isAdmin && (
          <button className="link-btn" style={{ marginTop: 8 }} data-testid="leave-space" onClick={async () => {
            if (!window.confirm(`${spaceTitle()} 공간에서 나갈까요? 이 공간의 기록을 더 볼 수 없어요. 다시 들어오려면 새 초대 링크가 필요해요.`)) return;
            try { await leaveSpace(user.uid); location.replace('/'); } catch { toast('나가지 못했어요. 다시 해 주세요'); }
          }}>이 공간에서 나가기</button>
        )}
      </section>

      {isAdmin && (
        <section data-testid="invite-section">
          <div className="label" style={{ padding: '0 4px 6px' }}>초대 링크</div>
          <div className="setting-group">
            <div className="setting-row" style={{ alignItems: 'stretch' }}>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                <span className="small" style={{ color: 'var(--ink2)' }}>링크를 받은 사람이 로그인하면 이 공간에 들어와요. 7일 동안, 한 번만 쓸 수 있어요.</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <input className="input" style={{ height: 42, flex: 1, minWidth: 0 }} placeholder="부를 이름 (선택, 예: 남편)" value={inviteName} onChange={(e) => setInviteName(e.target.value)} aria-label="초대 이름" maxLength={20} />
                  <select className="select" style={{ height: 42, width: 'auto' }} aria-label="초대할 사람과의 관계" value={inviteRel} onChange={(e) => setInviteRel(e.target.value as Relation | '')}>
                    <option value="">관계</option>
                    {(Object.keys(RELATION_LABEL) as Relation[]).map((r) => <option key={r} value={r}>{RELATION_LABEL[r]}</option>)}
                  </select>
                </span>
                <button className="btn sm" style={{ alignSelf: 'flex-start' }} disabled={making} onClick={async () => {
                  if (making) return;
                  setMaking(true);
                  try { await createMemberInvite(user, inviteName, inviteRel || null, spaceTitle()); setInviteName(''); setInviteRel(''); toast('초대 링크를 만들었어요'); } catch (e) { console.warn(e); toast('만들지 못했어요. 다시 해 주세요'); }
                  setMaking(false);
                }} data-testid="invite-make"><Icon name="link" size={15} />{making ? '만드는 중…' : '초대 링크 만들기'}</button>
              </span>
            </div>
            {(invites ?? []).map((inv) => (
              <InviteRow key={inv.code} code={inv.code} title={inv.name ? `${inv.name} 초대` : '초대 링크'} expiresAt={inv.expiresAt} sender={nameOf(user.email)} onDelete={() => deleteSpaceInvite(inv.code)} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** 마을 주인만: 다른 사람에게 새 공간을 열어 주는 초대 링크 (받은 사람이 그 공간의 첫 관리자가 된다) */
export function NewSpaceSetting() {
  const auth = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [making, setMaking] = useState(false);
  const user = auth.status === 'ready' ? auth.user : null;
  const invites = useMySpaceInvites(user, 'admin');
  if (!user) return null;
  return (
    <section data-testid="new-space-section">
      <div className="label" style={{ padding: '0 4px 6px' }}>새 공간 열어 주기</div>
      <div className="setting-group">
        <div className="setting-row" style={{ alignItems: 'stretch' }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span className="small" style={{ color: 'var(--ink2)' }}>우리 기록과 따로 쓰는 공간을 열어 줘요. 받은 사람이 그 공간의 관리자가 되고, 짝이나 가족을 직접 초대해요. 우리도 그 공간은 볼 수 없어요.</span>
            <input className="input" style={{ height: 42 }} placeholder="받는 사람을 부를 이름 (선택, 예: 처제)" value={name} onChange={(e) => setName(e.target.value)} aria-label="새 공간 받는 사람 이름" maxLength={20} />
            <input className="input" style={{ height: 42 }} placeholder="공간 이름 (선택, 예: 꿈꾸는파랑새)" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} aria-label="새 공간 이름" maxLength={60} />
            <button className="btn sm" style={{ alignSelf: 'flex-start' }} disabled={making} onClick={async () => {
              if (making) return;
              setMaking(true);
              try { await createNewSpaceInvite(user, name, spaceName); setName(''); setSpaceName(''); toast('새 공간 링크를 만들었어요'); } catch (e) { console.warn(e); toast('만들지 못했어요. 다시 해 주세요'); }
              setMaking(false);
            }} data-testid="new-space-make"><Icon name="link" size={15} />{making ? '만드는 중…' : '새 공간 링크 만들기'}</button>
          </span>
        </div>
        {(invites ?? []).map((inv) => (
          <InviteRow key={inv.code} code={inv.code} title={`${inv.spaceName || inv.name || '새 공간'} 열어 주기`} expiresAt={inv.expiresAt} sender={nameOf(user.email)} onDelete={() => deleteSpaceInvite(inv.code)} />
        ))}
      </div>
    </section>
  );
}
