import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import './index.css';

// בדיקה אם המשתמש מחובר
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('authToken');
  
  if (!token) {
    // לא מחובר — חזור לדף הלוגין של חבר הצוות
    window.location.href = 'http://localhost:3001'; // כתובת דף הלוגין
    return null;
  }
  
  return children;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={
        <PrivateRoute>
          <App />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);
