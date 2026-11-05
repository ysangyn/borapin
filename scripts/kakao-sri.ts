/**
 * 카카오 SDK 무결성(SRI) 확인: CI가 SDK 파일을 받아 sha384를 계산한다.
 * - src/lib/kakao.ts의 SDK_SRI가 비어 있으면 계산한 값을 알려 주기만 한다 (사람이 그 값을 코드에 고정)
 * - 고정돼 있으면 같은지 본다. 다르면(카카오가 같은 주소의 파일을 바꿨거나 가로챔) 실패 → 배포 멈춤
 * 받기 자체가 안 되면(카카오 쪽 장애) 경고만 하고 넘어간다 (배포를 바깥 장애에 묶지 않게).
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const src = readFileSync('src/lib/kakao.ts', 'utf8');
const url = src.match(/const SDK = '([^']+)'/)?.[1];
const pinned = src.match(/export const SDK_SRI = '([^']*)'/)?.[1] ?? '';
if (!url) { console.error('kakao.ts에서 SDK 주소를 못 찾았어요'); process.exit(1); }
const r = await fetch(url).catch((e) => { console.warn(`받기 실패: ${e}`); return null; });
if (!r || !r.ok) { console.warn(`카카오 SDK를 받지 못했어요 (${r?.status ?? '연결 실패'}) · 이번엔 넘어가요`); process.exit(0); }
const got = 'sha384-' + createHash('sha384').update(Buffer.from(await r.arrayBuffer())).digest('base64');
console.log(`주소: ${url}\n계산: ${got}\n고정: ${pinned || '(없음)'}`);
if (!pinned) { console.log('→ 아직 고정 전: 위 계산값을 SDK_SRI에 넣어 주세요'); process.exit(0); }
if (pinned !== got) { console.error('→ 다릅니다! 같은 주소의 SDK 파일이 바뀌었어요. 카카오 공지를 확인하고 버전·값을 새로 고정하세요'); process.exit(1); }
console.log('→ 같아요');
