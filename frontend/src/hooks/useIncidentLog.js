import { useState, useEffect } from 'react';
import { getIncidentLog, postIncidentLog } from '../services/api';

export default function useIncidentLog(userId) {
  const STORAGE_KEY = `childguard_log_${userId || 'guest'}`;

  const [log, setLog] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // טען היסטוריה מהבאקאנד
  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await getIncidentLog();
        const rawLog = res.data?.log || res.data || [];
        if (rawLog.length > 0) {
          setLog(rawLog);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(rawLog.slice(0, 200)));
        }
      } catch {
        // fallback — localStorage
      }
    };
    fetchLog();
  }, [userId]);

  const addLog = (entry) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('he-IL'),
      date: new Date().toLocaleDateString('he-IL'),
      ...entry,
    };

    setLog(prev => {
      const next = [logEntry, ...prev].slice(0, 200);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

    // שלח לבאקאנד
    postIncidentLog({
      timestamp: new Date().toISOString(),
      ...entry,
    }).catch(() => {});
  };

  const clearLog = () => {
    setLog([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return { log, addLog, clearLog };
}