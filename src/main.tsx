import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Monkey-patch window.fetch to robustly handle relative API calls in all browser contexts,
// including sandbox iframes, headless testing, and file:// origins.
try {
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    value: function (input: RequestInfo | URL, init?: RequestInit) {
      let url = '';
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input && typeof input === 'object' && 'url' in input) {
        url = input.url;
      }

      if (url.startsWith('/api/')) {
        const getApiBaseUrl = () => {
          try {
            if (window.location.origin && window.location.origin.startsWith('http') && window.location.origin !== 'null') {
              return window.location.origin;
            }
          } catch (e) {}

          // Fallback: search for absolute script/link tags loaded by the hosting server
          try {
            const scripts = document.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
              const src = scripts[i].src;
              if (src && src.startsWith('http')) {
                const parsed = new URL(src);
                return parsed.origin;
              }
            }
          } catch (e) {}

          try {
            const links = document.getElementsByTagName('link');
            for (let i = 0; i < links.length; i++) {
              const href = links[i].href;
              if (href && href.startsWith('http')) {
                const parsed = new URL(href);
                return parsed.origin;
              }
            }
          } catch (e) {}

          return '';
        };

        const base = getApiBaseUrl();
        if (base) {
          const targetUrl = base + url;
          if (typeof input === 'string') {
            return originalFetch(targetUrl, init);
          } else if (input instanceof URL) {
            return originalFetch(new URL(targetUrl), init);
          } else {
            const newRequest = new Request(targetUrl, input);
            return originalFetch(newRequest, init);
          }
        }
      }

      return originalFetch(input, init);
    },
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.error("Failed to safely monkey patch window.fetch:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
