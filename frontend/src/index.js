import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// בדיקה אם המשתמש מחובר
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('authToken');
  
  // if (!token) {
  //   // לא מחובר — חזור לדף הלוגין של חבר הצוות
  //   window.location.href = 'http://localhost:3001'; // כתובת דף הלוגין
  //   return null;
  // }
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
