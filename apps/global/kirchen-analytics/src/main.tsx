import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Load runtime config. Dev: /config.js from public/. Production: ../../config.js relative to app path.
function loadConfig(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof (window as unknown as { env?: unknown }).env !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = import.meta.env.DEV ? '/config.js' : '../../config.js';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

loadConfig().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
