import { useState, useEffect } from 'react';

// Mock user — יוחלף בנתונים אמיתיים מהלוגין
const MOCK_USER = {
  id: 'u-001',
  name: 'יוסי כהן',
  role: 'מפקד',
  station: 'תחנה 3 — ירושלים',
  avatar: 'יכ',
};

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ננסה לקבל token מה-localStorage (כפי שחבר הצוות שמר)
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('access_token') ||
                      localStorage.getItem('authToken');

        if (token) {
          const res = await fetch('http://localhost:8000/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            return;
          }
        }
        // fallback — mock user
        setUser(MOCK_USER);
      } catch {
        setUser(MOCK_USER);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}