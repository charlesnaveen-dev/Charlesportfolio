import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/motion'; // Register GSAP and ScrollTrigger early
import './styles/global.css';
import './styles/components.css';

const rootElement = document.getElementById('root');

if (rootElement && rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
