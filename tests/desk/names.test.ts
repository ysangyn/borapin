import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateFromFilename, dateFromFolder, extKind, sourceHint } from '../../desk/src/names';

test('파일명에서 날짜·시각: 갤럭시·픽셀·아이폰·카톡·카메라 번호', () => {
  assert.deepEqual(dateFromFilename('20190812_183000.jpg'), { taken: '2019-08-12T18:30', precision: 'minute' });
  assert.deepEqual(dateFromFilename('IMG_20240503_101522.jpg'), { taken: '2024-05-03T10:15', precision: 'minute' });
  assert.deepEqual(dateFromFilename('PXL_20240503_011522123.jpg'), { taken: '2024-05-03T01:15', precision: 'minute' }); // 픽셀은 UTC — 시간대는 뒤에서
  assert.deepEqual(dateFromFilename('Screenshot_20240503-101522_Chrome.png'), { taken: '2024-05-03T10:15', precision: 'minute' });
  assert.deepEqual(dateFromFilename('2024-05-03 10.15.22.jpg'), { taken: '2024-05-03T10:15', precision: 'minute' });
  assert.deepEqual(dateFromFilename('KakaoTalk_20240503_101522000.jpg'), { taken: '2024-05-03T10:15', precision: 'minute', received: true });
  assert.deepEqual(dateFromFilename('20240503.jpg'), { taken: '2024-05-03', precision: 'day' });
  assert.equal(dateFromFilename('IMG_0421.JPG'), null); // 카메라 번호엔 날짜 없음
  assert.equal(dateFromFilename('99999999_000000.jpg'), null); // 말이 안 되는 날짜
  assert.equal(dateFromFilename('DSC_1234 (2).jpg'), null);
});

test('폴더 이름에서 날짜·여행 이름', () => {
  assert.deepEqual(dateFromFolder('D:/사진/2024/2024-05-03 제주/IMG_1.jpg'), { taken: '2024-05-03', precision: 'day', title: '제주' });
  assert.deepEqual(dateFromFolder('D:/사진/190812 강릉/a.jpg'), { taken: '2019-08-12', precision: 'day', title: '강릉' });
  assert.deepEqual(dateFromFolder('D:/사진/2024/05/a.jpg'), { taken: '2024-05', precision: 'month', title: null });
  assert.deepEqual(dateFromFolder('D:/사진/2019년 강릉/a.jpg'), { taken: '2019', precision: 'year', title: '강릉' });
  assert.deepEqual(dateFromFolder('D:/사진/여행/강릉 바다/a.jpg'), null);
  // 가장 가까운(깊은) 폴더가 이긴다
  assert.deepEqual(dateFromFolder('D:/사진/2023/2024-05-03 제주/a.jpg')?.taken, '2024-05-03');
});

test('확장자 종류와 출처 힌트', () => {
  assert.equal(extKind('a.JPG'), 'photo');
  assert.equal(extKind('a.heic'), 'photo');
  assert.equal(extKind('a.cr2'), 'raw');
  assert.equal(extKind('a.mov'), 'video');
  assert.equal(extKind('a.txt'), null);
  assert.equal(sourceHint('/sdcard/DCIM/Screenshots/x.png'), 'screenshot');
  assert.equal(sourceHint('C:/Users/me/Pictures/KakaoTalk/x.jpg'), 'received');
  assert.equal(sourceHint('C:/Users/me/Downloads/x.jpg'), 'download');
  assert.equal(sourceHint('D:/사진/2024/x.jpg'), null);
});
