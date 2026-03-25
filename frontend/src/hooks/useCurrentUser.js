import { useState, useEffect } from 'react';
import { getMe } from '../services/api';

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // קודם נסה מה-localStorage (מה שהלוגין שמר)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setLoading(false);
        }

        // עדכן מהבאקאנד
        const token = localStorage.getItem('token');
        if (token && token !== 'dev-token-123' && token !== 'dev-mode') {
          const res = await getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        }
      } catch {
        // רק מה-localStorage — בלי mock!
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null); // אין משתמש — לא מציג כלום
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}