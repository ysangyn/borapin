import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inAppBrowser, isIOS, speechProblemText } from '../../src/lib/speech';

const KAKAO = 'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 KAKAOTALK/10.8.0';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const CHROME = 'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';

test('읽어 주기가 안 될 때 이유: 카톡 안 브라우저·아이폰 무음·그 밖', () => {
  assert.ok(inAppBrowser(KAKAO));
  assert.ok(!inAppBrowser(IPHONE) && !inAppBrowser(CHROME));
  assert.ok(isIOS(IPHONE) && !isIOS(CHROME));
  assert.match(speechProblemText('none', KAKAO), /카카오톡.*다른 브라우저/);
  assert.match(speechProblemText('silent', IPHONE), /무음 스위치/);
  assert.match(speechProblemText('none', CHROME), /크롬/);
});
