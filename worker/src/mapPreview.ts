/**
 * 받은 내 지도(/m/토큰)의 카톡·메신저 미리보기: 앱은 정적 호스팅이라 미리보기 글·그림이 늘 같다.
 * 그래서 공유 주소를 이 Worker로 두고, 공개 사본(mapShares, 규칙상 누구나 읽음)을 Firestore REST로 읽어
 * og 태그를 끼운 작은 HTML을 준다. 사람 브라우저는 곧장 앱 주소로 넘어간다. 순수 함수 (시험: tests/unit/worker-map.test.ts).
 */
export interface Preview { title: string; intro: string; by: string; regionLabel: string; count: number; image: string | null; top: string[] }

type FsValue = { stringValue?: string; integerValue?: string; doubleValue?: number; arrayValue?: { values?: FsValue[] }; mapValue?: { fields?: Record<string, FsValue> } };
const str = (f: Record<string, FsValue> | undefined, k: string) => f?.[k]?.stringValue ?? '';

export function parseShareDoc(doc: unknown): Preview | null {
  const d = doc as { fields?: Record<string, FsValue> } | null;
  if (!d?.fields) return null;
  const f = d.fields;
  const places = (f.places?.arrayValue?.values ?? []).map((v) => v.mapValue?.fields).filter((x): x is Record<string, FsValue> => !!x);
  return {
    title: str(f, 'title'),
    intro: str(f, 'intro'),
    by: str(f, 'by'),
    regionLabel: str(f, 'regionLabel'),
    count: places.length,
    image: places.map((p) => str(p, 'photoUrl')).find((u) => /^https:\/\//.test(u)) ?? null,
    top: places.slice(0, 3).map((p) => str(p, 'name')).filter(Boolean),
  };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export function previewHtml(p: Preview, appUrl: string): string {
  const title = `${p.title} · ${p.by}의 지도`;
  const desc = p.intro.trim() || [`${p.regionLabel} ${p.count}곳`, ...p.top.map((n, i) => `${i + 1}위 ${n}`)].join(' · ');
  const u = esc(appUrl);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta property="og:type" content="website">
<meta property="og:site_name" content="보라핀">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${p.image ? `<meta property="og:image" content="${esc(p.image)}">` : ''}
<meta property="og:url" content="${u}">
<meta name="twitter:card" content="${p.image ? 'summary_large_image' : 'summary'}">
<meta http-equiv="refresh" content="0;url=${u}">
<script>location.replace(${JSON.stringify(appUrl)})</script>
</head><body style="font-family:sans-serif;padding:24px;color:#1E1640"><p>${esc(title)}</p><p><a href="${u}">지도 열기</a></p></body></html>`;
}
