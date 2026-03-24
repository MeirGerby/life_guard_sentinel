import { useState, useEffect } from 'react';
import { getVehicles, getAlerts } from '../services/api';

const MOCK_VEHICLES_RAW = [
  { id: 1, plate: '123-45-678', model: 'טויוטה פריוס', lat: 31.785, lng: 35.218, temp: 41, motion: true,  engine: false },
  { id: 2, plate: '987-65-432', model: 'מאזדה CX5',    lat: 31.790, lng: 35.225, temp: 34, motion: true,  engine: false },
  { id: 3, plate: '456-78-901', model: 'הונדה סיוויק', lat: 31.780, lng: 35.210, temp: 27, motion: false, engine: true  },
];

function calcRisk(temp, motion, engine, warnTemp, criticalTemp) {
  if (!engine && motion && temp >= criticalTemp) return 'critical';
  if (!engine && temp >= warnTemp) return 'warning';
  return 'ok';
}

function calcAlerts(vehicles) {
  return vehicles
    .filter(v => v.risk !== 'ok')
    .map((v, i) => ({
      id: i + 1,
      time: new Date().toLocaleTimeString('he-IL'),
      plate: v.plate,
      message: `טמפ׳ ${v.temp}°C · ${v.motion ? 'תנועה זוהתה' : 'מנוע כבוי'}`,
      severity: v.risk,
    }));
}

export default function useVehicles(warnTemp = 32, criticalTemp = 38, refreshRate = 5) {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, aRes] = await Promise.all([getVehicles(), getAlerts()]);
        const withRisk = vRes.data.map(v => ({
          ...v,
          risk: calcRisk(v.temp, v.motion, v.engine, warnTemp, criticalTemp)
        }));
        setVehicles(withRisk);
        setAlerts(aRes.data);
      } catch {
        const withRisk = MOCK_VEHICLES_RAW.map(v => ({
          ...v,
          risk: calcRisk(v.temp, v.motion, v.engine, warnTemp, criticalTemp)
        }));
        setVehicles(withRisk);
        setAlerts(calcAlerts(withRisk));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshRate * 1000);
    return () => clearInterval(interval);
  }, [warnTemp, criticalTemp, refreshRate]);

  return { vehicles, alerts, loading };
}