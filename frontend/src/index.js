import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const token = localStorage.getItem('token') || 'dev-mode';

if (!token) {
  window.location.href = 'http://localhost:5173';
} else {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

reportWebVitals();