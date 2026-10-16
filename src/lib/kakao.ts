/**
 * 카카오톡으로 보내기 (카카오 JavaScript SDK, 무료).
 * - 키는 공개용 JavaScript 키라 코드에 둬도 된다. 쓸 수 있는 주소(borapin.web.app, localhost)는 카카오 개발자 콘솔에 등록돼 있다.
 * - 등록되지 않은 주소(미리보기 채널·시험)에서는 단추를 숨기고 기기의 공유하기(navigator.share)로 대신한다.
 * - SDK는 단추를 누를 때 처음 받는다 (첫 화면을 무겁게 하지 않게).
 */
const JS_KEY = '3fa4657079c863251f5d20d044c88f65';
const SDK = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

interface KakaoSdk {
  isInitialized(): boolean;
  init(key: string): void;
  Share: { sendDefault(opts: Record<string, unknown>): void };
}
declare global { interface Window { Kakao?: KakaoSdk } }

/** 이 주소에서 카카오 공유를 쓸 수 있나 (콘솔에 등록한 도메인만) */
export function kakaoReady(): boolean {
  if (typeof location === 'undefined') return false;
  return location.hostname === 'borapin.web.app' || location.hostname === 'localhost';
}

let loading: Promise<KakaoSdk> | null = null;
function loadSdk(): Promise<KakaoSdk> {
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SDK;
    s.crossOrigin = 'anonymous';
    s.onload = () => (window.Kakao ? resolve(window.Kakao) : reject(new Error('Kakao SDK missing')));
    s.onerror = () => { loading = null; reject(new Error('Kakao SDK load failed')); };
    document.head.appendChild(s);
  });
  return loading;
}

export interface KakaoCard {
  title: string;
  description?: string;
  /** 절대 주소여야 한다 (카카오 서버가 받아 간다) */
  imageUrl?: string;
  url: string;
  /** 단추 글 (기본 '보라핀에서 보기') */
  button?: string;
}

/** 카카오톡 공유 창 띄우기. 실패하면 던진다 (부르는 쪽에서 기기 공유로 넘어가게). */
export async function sendKakao(card: KakaoCard) {
  const k = await loadSdk();
  if (!k.isInitialized()) k.init(JS_KEY);
  const link = { mobileWebUrl: card.url, webUrl: card.url };
  k.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: card.title,
      description: card.description ?? '',
      imageUrl: card.imageUrl ?? `${location.origin}/icons/bora-512.png`,
      link,
    },
    buttons: [{ title: card.button ?? '보라핀에서 보기', link }],
  });
}

/** 글만 보낼 때(준비물 목록 등): 카카오 글 카드 */
export async function sendKakaoText(text: string, url: string, button = '보라핀 열기') {
  const k = await loadSdk();
  if (!k.isInitialized()) k.init(JS_KEY);
  const link = { mobileWebUrl: url, webUrl: url };
  k.Share.sendDefault({ objectType: 'text', text: text.slice(0, 200), link, buttons: [{ title: button, link }] });
}

/** 카카오가 되면 카카오로, 아니면 기기 공유하기로, 그것도 없으면 복사 */
export async function shareAnyhow(card: KakaoCard, onCopied?: () => void) {
  if (kakaoReady()) {
    try {
      await sendKakao(card);
      return 'kakao' as const;
    } catch (e) {
      console.warn(e);
    }
  }
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    await nav.share({ title: card.title, text: card.description, url: card.url }).catch(() => undefined);
    return 'native' as const;
  }
  try {
    await navigator.clipboard.writeText(`${card.title}\n${card.url}`);
    onCopied?.();
  } catch {
    window.prompt('이 링크를 복사하세요', card.url);
  }
  return 'copied' as const;
}
