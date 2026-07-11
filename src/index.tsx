import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './i18n';
import './index.css';
import App from './App';

// GitHub Pages SPA redirect support:
// 404.html encodes the original path as /?/path/here
// We restore it here before React renders.
(function () {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== window.location.href) {
    window.history.replaceState(null, '', redirect);
  } else {
    // Handle /?/path/here format from 404.html.
    // The fallback encodes original query params after `&`, e.g. /?/parceiros&utm=x.
    const { search } = window.location;
    if (search.startsWith('?/')) {
      const raw = search.slice(1).replace(/~and~/g, '&');
      const ampIndex = raw.indexOf('&');
      const restored = ampIndex === -1
        ? raw
        : `${raw.slice(0, ampIndex)}?${raw.slice(ampIndex + 1)}`;
      window.history.replaceState(null, '', restored);
    }
  }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
