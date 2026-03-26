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
    console.warn("No token found, but staying on current page for development.");
    return children;
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
