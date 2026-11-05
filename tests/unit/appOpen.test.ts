import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appOpen } from '../../src/lib/placeApps';

const AND = 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36';
const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36';
const spot = { name: '테라로사 사천', area: '강릉시', lat: 37.81, lng: 128.88 };

test('안드로이드: 앱으로 바로(없으면 웹), 좌표가 있으면 그 자리', () => {
  const n = appOpen('naver', spot, AND);
  assert.match(n.href, /^intent:\/\/place\?lat=37\.81&lng=128\.88&name=/);
  assert.match(n.href, /scheme=nmap;package=com\.nhn\.android\.nmap;S\.browser_fallback_url=https%3A%2F%2Fmap\.naver\.com/);
  assert.equal(n.newTab, false);
  const k = appOpen('kakao', spot, AND);
  assert.match(k.href, /^intent:\/\/search\?q=.+&p=37\.81,128\.88#Intent;scheme=kakaomap;package=net\.daum\.android\.map;/);
});

test('아이폰: 앱 주소를 먼저 열고, 안 열리면 웹', () => {
  const n = appOpen('naver', { name: '월영교', area: '안동시' }, IOS);
  assert.equal(n.scheme, `nmap://search?query=${encodeURIComponent('안동시 월영교')}&appname=borapin.web.app`);
  assert.equal(n.href, `https://map.naver.com/p/search/${encodeURIComponent('안동시 월영교')}`);
  const k = appOpen('kakao', spot, IOS);
  assert.equal(k.scheme, `kakaomap://search?q=${encodeURIComponent('테라로사 사천')}&p=37.81,128.88`);
});

test('PC: 웹 새 창, 네이버 공유 주소가 있으면 그 주소', () => {
  const n = appOpen('naver', spot, PC);
  assert.equal(n.scheme, undefined);
  assert.equal(n.newTab, true);
  assert.match(n.href, /^https:\/\/map\.naver\.com/);
  assert.equal(appOpen('naver', spot, AND, 'https://naver.me/abc').href, 'https://naver.me/abc');
  assert.equal(appOpen('kakao', spot, PC).href, `https://map.kakao.com/link/map/${encodeURIComponent('테라로사 사천')},37.81,128.88`);
});
