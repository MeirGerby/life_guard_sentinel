import { useState, useEffect } from 'react';

export default function useVehiclesHistory(userId) {
  const STORAGE_KEY = `childguard_vehicles_history_${userId || 'guest'}`;

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!userId) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history, userId]);

  useEffect(() => {
    if (!userId) return;
    try {
      const key = `childguard_vehicles_history_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, [userId]);

  const recordVehicleState = (vehicles) => {
    const now = new Date().toLocaleTimeString('he-IL');
    const date = new Date().toLocaleDateString('he-IL');

    setHistory(prev => {
      const next = { ...prev };
      vehicles.forEach(v => {
        if (!next[v.id]) next[v.id] = { plate: v.plate, ownerName: v.ownerName, records: [] };
        const records = next[v.id].records;
        // הוסף רק אם הסטטוס השתנה
        const last = records[0];
        if (!last || last.risk !== v.risk || last.temp !== v.temp) {
          next[v.id].records = [{
            time: now, date,
            temp: v.temp,
            risk: v.risk,
            engine: v.engine,
            motion: v.motion,
            parentDistance: v.parentDistance,
          }, ...records].slice(0, 50); // שמור 50 רשומות לכל רכב
        }
      });
      return next;
    });
  };

  const getVehicleHistory = (vehicleId) => history[vehicleId]?.records || [];

  return { history, recordVehicleState, getVehicleHistory };
}