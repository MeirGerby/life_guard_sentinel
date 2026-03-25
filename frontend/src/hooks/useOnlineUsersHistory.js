import { useState, useEffect } from 'react';

export default function useOnlineUsersHistory(userId) {
  const STORAGE_KEY = `childguard_users_history_${userId || 'guest'}`;

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!userId) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 500)));
    } catch {}
  }, [history, userId]);

  useEffect(() => {
    if (!userId) return;
    try {
      const key = `childguard_users_history_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, [userId]);

  const recordUserStatus = (users) => {
    const now = new Date().toLocaleTimeString('he-IL');
    const date = new Date().toLocaleDateString('he-IL');
    setHistory(prev => [{
      time: now, date,
      users: users.map(u => ({
        id: u.id, name: u.name,
        role: u.role, station: u.station,
        busy: u.busy,
      })),
    }, ...prev].slice(0, 500));
  };

  return { history, recordUserStatus };
}