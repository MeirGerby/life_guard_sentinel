import { useState, useEffect, useRef } from 'react';
import { getVehicles, getAlerts } from '../services/api';

const MOCK_VEHICLES_RAW = [
  {
    vehicle_id: 'v-001',
    internal_temp: 41,
    engine_status: 'off',
    occupancy_detected: true,
    parent_distance_meters: 450,
    location: { lat: 31.785, lon: 35.218 },
    external_temp: 36,
    is_heatwave: true,
    risk_score: 85,
    risk_level: 'CRITICAL',
    recommendation: 'Immediate action required',
    owner_name: 'ישראל ישראלי',
    owner_phone: '050-1234567',
  },
  {
    vehicle_id: 'v-002',
    internal_temp: 34,
    engine_status: 'off',
    occupancy_detected: true,
    parent_distance_meters: 120,
    location: { lat: 31.790, lon: 35.225 },
    external_temp: 32,
    is_heatwave: false,
    risk_score: 62,
    risk_level: 'HIGH',
    recommendation: 'High risk detected',
    owner_name: 'שרה כהן',
    owner_phone: '052-7654321',
  },
  {
    vehicle_id: 'v-003',
    internal_temp: 27,
    engine_status: 'on',
    occupancy_detected: false,
    parent_distance_meters: 15,
    location: { lat: 31.780, lon: 35.210 },
    external_temp: 28,
    is_heatwave: false,
    risk_score: 10,
    risk_level: 'LOW',
    recommendation: 'Low risk',
    owner_name: 'דוד לוי',
    owner_phone: '054-9876543',
  },
];

function mapRiskLevel(risk_level) {
  if (risk_level === 'CRITICAL') return 'critical';
  if (risk_level === 'HIGH')     return 'warning';
  if (risk_level === 'MEDIUM')   return 'warning';
  return 'ok';
}

// בונה היסטוריית מסלול מה-localStorage לפי vehicle_id
function loadHistoryFromStorage(vehicleId, userId) {
  try {
    const key = `childguard_vehicles_history_${userId || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const history = JSON.parse(saved);
    const vehicleHistory = history[vehicleId];
    if (!vehicleHistory?.records) return [];

    // המר רשומות למסלול [lat, lng]
    return vehicleHistory.records
      .filter(r => r.lat && r.lng)
      .map(r => [r.lat, r.lng])
      .reverse(); // מהישן לחדש
  } catch {
    return [];
  }
}

function normalizeVehicle(v, resolvedIds, userId) {
  const risk = resolvedIds.includes(v.vehicle_id)
    ? 'ok'
    : mapRiskLevel(v.risk_level);

  const lat = v.location?.lat || 0;
  const lng = v.location?.lon || v.location?.lng || 0;

  // קח היסטוריה מה-localStorage אם קיימת
  const savedHistory = loadHistoryFromStorage(v.vehicle_id, userId);
  const history = savedHistory.length > 0
    ? savedHistory
    : [[lat, lng]]; // לפחות נקודה אחת — המיקום הנוכחי

  return {
    id:             v.vehicle_id,
    plate:          v.vehicle_id,
    model:          v.owner_name || '',
    lat,
    lng,
    temp:           v.internal_temp,
    externalTemp:   v.external_temp,
    motion:         v.occupancy_detected,
    engine:         v.engine_status === 'on',
    risk,
    riskScore:      v.risk_score,
    riskLevel:      v.risk_level,
    recommendation: v.recommendation,
    ownerName:      v.owner_name,
    ownerPhone:     v.owner_phone,
    isHeatwave:     v.is_heatwave,
    parentDistance: v.parent_distance_meters,
    timestamp:      v.timestamp,
    history,
  };
}

function calcAlerts(vehicles, resolvedIds = []) {
  const activeAlerts = vehicles
    .filter(v => v.risk !== 'ok')
    .map((v, i) => ({
      id: i + 1,
      time: new Date().toLocaleTimeString('he-IL'),
      plate: v.plate,
      message: `טמפ׳ ${v.temp}°C · ${v.motion ? 'ילד זוהה' : 'מנוע כבוי'}`,
      severity: v.risk,
    }));

  const resolvedAlerts = resolvedIds.map((id, i) => {
    const v = vehicles.find(v => v.id === id);
    return {
      id: 100 + i,
      time: new Date().toLocaleTimeString('he-IL'),
      plate: v ? v.plate : id,
      message: 'אירוע טופל בהצלחה',
      severity: 'ok',
    };
  });

  return [...activeAlerts, ...resolvedAlerts];
}

export default function useVehicles(warnTemp = 32, criticalTemp = 38, refreshRate = 5, resolvedIds = [], userId = null) {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const smsSentRef              = useRef(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, aRes] = await Promise.all([getVehicles(), getAlerts()]);
        const rawVehicles = vRes.data?.vehicles || vRes.data || [];
        const withNormalized = rawVehicles.map(v => normalizeVehicle(v, resolvedIds, userId));
        setVehicles(withNormalized);
        const rawAlerts = aRes.data?.alerts || aRes.data || [];
        setAlerts(rawAlerts.length > 0 ? rawAlerts : calcAlerts(withNormalized, resolvedIds));
        await autoSendSMS(withNormalized);
      } catch {
        const withNormalized = MOCK_VEHICLES_RAW.map(v => normalizeVehicle(v, resolvedIds, userId));
        setVehicles(withNormalized);
        setAlerts(calcAlerts(withNormalized, resolvedIds));
        await autoSendSMS(withNormalized);
      } finally {
        setLoading(false);
      }
    };

    const autoSendSMS = async (vehicles) => {
      for (const v of vehicles) {
        if (
          (v.risk === 'warning' || v.risk === 'critical') &&
          v.ownerPhone &&
          !smsSentRef.current.has(v.id)
        ) {
          const message = v.risk === 'critical'
            ? `🚨 התראה קריטית: רכב ${v.plate} — טמפרטורה ${v.temp}°C, ילד זוהה ברכב! פנה לרכב מיד!`
            : `⚠️ אזהרה: רכב ${v.plate} — טמפרטורה ${v.temp}°C. אנא בדוק את הרכב.`;
          try {
            const { sendSMS } = await import('../services/api');
            await sendSMS(v.id, v.ownerPhone, message);
          } catch {}
          smsSentRef.current.add(v.id);
        }
        if (v.risk === 'ok') smsSentRef.current.delete(v.id);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshRate * 1000);
    return () => clearInterval(interval);
  }, [warnTemp, criticalTemp, refreshRate, JSON.stringify(resolvedIds), userId]);

  return { vehicles, alerts, loading };
}