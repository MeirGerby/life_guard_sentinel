import { useState, useEffect } from 'react';

export default function useIncidentLog(userId) {
  const STORAGE_KEY = `childguard_log_${userId || 'guest'}`;

  const [log, setLog] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // שמור לפי משתמש כשמשתנה
  useEffect(() => {
    if (!userId) return;
    try {
      // שמור רק 200 הרשומות האחרונות
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, 200)));
    } catch {}
  }, [log, userId]);

  // טען מחדש כשמשתמש משתנה
  useEffect(() => {
    if (!userId) return;
    try {
      const key = `childguard_log_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) setLog(JSON.parse(saved));
    } catch {}
  }, [userId]);

  const addLog = (entry) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('he-IL'),
      date: new Date().toLocaleDateString('he-IL'),
      ...entry,
    };

    setLog(prev => [logEntry, ...prev].slice(0, 200));

    fetch('http://localhost:8000/incidents/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString(), ...entry }),
    }).catch(() => {});
  };

  const clearLog = () => {
    setLog([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return { log, addLog, clearLog };
}