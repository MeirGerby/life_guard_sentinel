import { useState, useEffect } from 'react';

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // קודם נסה מה-localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setLoading(false);
          return;
        }

        // אם אין — נסה מהבאקאנד
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetch('http://localhost:8000/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return;
          }
        }

        // fallback — mock user לפיתוח
        setUser({
          id: 'u-001',
          name: 'יוסי כהן',
          role: 'מפקד',
          station: 'תחנה 3 — ירושלים',
          avatar: 'יכ',
        });
      } catch {
        setUser({
          id: 'u-001',
          name: 'יוסי כהן',
          role: 'מפקד',
          station: 'תחנה 3 — ירושלים',
          avatar: 'יכ',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}
