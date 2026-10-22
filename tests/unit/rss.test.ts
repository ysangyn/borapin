import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bingQuery, parseBingRss, parseGoogleRss } from '../../worker/src/rss';

test('구글 뉴스 RSS: 제목 끝 언론사를 떼고 날짜를 맞춘다', () => {
  const xml = `<rss><channel><item><title>설악산 단풍 이번 주 절정 - 연합뉴스</title><link>https://news.google.com/rss/articles/abc</link><pubDate>Fri, 16 Oct 2026 03:00:00 GMT</pubDate><source url="https://www.yna.co.kr">연합뉴스</source></item></channel></rss>`;
  const [a] = parseGoogleRss(xml);
  assert.equal(a.title, '설악산 단풍 이번 주 절정');
  assert.equal(a.source, '연합뉴스');
  assert.equal(a.at, '2026-10-16T03:00:00.000Z');
});

test('빙 뉴스 RSS: 진짜 기사 주소와 언론사', () => {
  const xml = `<rss xmlns:News="https://www.bing.com/news/search?q=x&amp;format=rss"><channel><item><title>요즘 뜨는 여행지 &amp; 가을 명소</title><link>http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=1&amp;url=https%3a%2f%2fwww.hani.co.kr%2farti%2f1.html&amp;c=1</link><description>설명</description><pubDate>Fri, 16 Oct 2026 03:00:00 GMT</pubDate><News:Source>한겨레</News:Source></item></channel></rss>`;
  const [a] = parseBingRss(xml);
  assert.equal(a.title, '요즘 뜨는 여행지 & 가을 명소');
  assert.equal(a.link, 'https://www.hani.co.kr/arti/1.html');
  assert.equal(a.source, '한겨레');
  assert.equal(bingQuery('유류할증료 when:14d'), '유류할증료');
  assert.equal(bingQuery('KTX OR SRT 예매 when:14d'), 'KTX OR SRT 예매');
});

test('구글 뉴스도 http(s) 주소가 아닌 링크는 버린다 (앱이 그대로 <a href>에 넣으므로)', () => {
  const item = (link: string) => `<item><title>제목 - 언론사</title><link>${link}</link></item>`;
  const got = parseGoogleRss(`<rss>${item('javascript:alert(1)')}${item('ftp://x.example/a')}${item('')}${item('https://news.google.com/rss/articles/ok')}</rss>`);
  assert.deepEqual(got.map((x) => x.link), ['https://news.google.com/rss/articles/ok']);
});

test('숫자로 쓴 글자(&#183; 등)도 풀어 쓴다', () => {
  const [a] = parseBingRss('<item><title>하나&#183;모두투어 &#x27;한숨&#x27;</title><link>https://a.example/1</link></item>');
  assert.equal(a.title, "하나·모두투어 '한숨'");
});
