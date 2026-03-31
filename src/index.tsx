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
    // Handle /?/path/here format from 404.html
    const { search } = window.location;
    if (search.startsWith('?/')) {
      const decoded = search
        .slice(1)
        .replace(/~and~/g, '&');
      window.history.replaceState(null, '', decoded);
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
