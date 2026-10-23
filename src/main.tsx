import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
// 둥근 제목 글꼴(주아)과 손글씨(개구): 구글식 글자 조각이라 쓰는 글자만 받는다. 짧은 글(제목·D-day·한 줄 평)에만
import '@fontsource/jua/400.css';
import '@fontsource/gaegu/700.css';
import App from './App';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/ui';
import { installErrorReporting } from './lib/admin';
import { ErrorBoundary, installChunkRecovery, UpdateWatcher } from './components/system';
import { IS_PREVIEW } from './lib/firebase';

installErrorReporting();
installChunkRecovery();

// 미리보기 주소는 시험용 프로젝트에 붙어 있다: 실제 기록으로 착각하지 않게 표시
if (IS_PREVIEW) {
  const tag = document.createElement('div');
  tag.className = 'preview-ribbon';
  tag.setAttribute('data-testid', 'preview-ribbon');
  tag.textContent = '시험용 미리보기 · 실제 기록이 아니에요';
  document.body.appendChild(tag);
}

// 홈 지도는 무거워서: 로그인·기록을 기다리는 동안 지도 코드와 경계를 미리 받아 둔다 (공유 링크 화면은 빼고)
if (!location.pathname.startsWith('/s/')) {
  void import('./components/MapView').catch(() => undefined);
  void import('./lib/geodata').then((m) => m.loadGeo()).catch(() => undefined);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {/* 맨 바깥 오류 경계: 화면 안쪽 경계가 못 잡는 오류(App 자체·새 버전 감시)도 흰 화면 대신 안내로 */}
          <ErrorBoundary>
            <UpdateWatcher />
            <App />
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
