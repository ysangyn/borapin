import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseShareDoc, previewHtml } from '../../worker/src/mapPreview';

// Firestore REST가 주는 모양 (fields.*.stringValue …)
const DOC = {
  name: 'projects/borapin/databases/(default)/documents/mapShares/abc',
  fields: {
    title: { stringValue: '성수 카페 지도' },
    intro: { stringValue: '조용히 오래 앉아 있을 수 있는 곳만' },
    theme: { stringValue: 'cafe' },
    by: { stringValue: '보라 & 영상' },
    regionLabel: { stringValue: '서울 성동구' },
    places: { arrayValue: { values: [
      { mapValue: { fields: { name: { stringValue: '센터커피' }, photoUrl: { stringValue: 'https://img.example/a.jpg' } } } },
      { mapValue: { fields: { name: { stringValue: '오르에르' } } } },
      { mapValue: { fields: { name: { stringValue: '대림창고' }, photoUrl: { stringValue: 'https://img.example/c.jpg' } } } },
    ] } },
  },
};

test('공개 사본 문서 → 미리보기 재료 (제목·소개·사진은 첫 것·몇 곳·1~3위)', () => {
  const p = parseShareDoc(DOC);
  assert.deepEqual(p, { title: '성수 카페 지도', intro: '조용히 오래 앉아 있을 수 있는 곳만', by: '보라 & 영상', regionLabel: '서울 성동구', count: 3, image: 'https://img.example/a.jpg', top: ['센터커피', '오르에르', '대림창고'] });
  assert.equal(parseShareDoc({ error: { code: 404 } }), null);
});

test('미리보기 HTML: og 태그에 제목·설명·그림, 사람은 앱 주소로 넘어간다, 글자는 안전하게', () => {
  const html = previewHtml({ title: '성수 <카페> 지도', intro: '', by: '보라', regionLabel: '서울 성동구', count: 12, image: 'https://img.example/a.jpg', top: ['센터커피', '오르에르'] }, 'https://borapin.web.app/m/abc');
  assert.match(html, /<meta property="og:title" content="성수 &lt;카페&gt; 지도 · 보라의 지도">/);
  assert.match(html, /<meta property="og:description" content="서울 성동구 12곳 · 1위 센터커피 · 2위 오르에르">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/img.example\/a.jpg">/);
  assert.match(html, /http-equiv="refresh" content="0;url=https:\/\/borapin.web.app\/m\/abc"/);
  assert.match(html, /<a href="https:\/\/borapin.web.app\/m\/abc">/);
});
