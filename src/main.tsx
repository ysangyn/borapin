import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import App from './App';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/ui';
import { installErrorReporting } from './lib/admin';
import { installChunkRecovery, UpdateWatcher } from './components/system';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <UpdateWatcher />
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
