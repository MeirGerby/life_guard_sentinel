import { useState, useEffect, useRef } from 'react';
import { getVehicles, getAlerts, sendSMS } from '../services/api';

function mapRiskLevel(risk_level) {
  if (risk_level === 'CRITICAL') return 'critical';
  if (risk_level === 'HIGH')     return 'warning';
  if (risk_level === 'MEDIUM')   return 'warning';
  return 'ok';
}

function loadHistoryFromStorage(vehicleId, userId) {
  try {
    const key = `childguard_vehicles_history_${userId || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const history = JSON.parse(saved);
    const vehicleHistory = history[vehicleId];
    if (!vehicleHistory?.records) return [];
    return vehicleHistory.records
      .filter(r => r.lat && r.lng)
      .map(r => [r.lat, r.lng])
      .reverse();
  } catch { return []; }
}

function normalizeVehicle(v, resolvedIds, userId) {
  const risk = resolvedIds.includes(v.vehicle_id)
    ? 'ok'
    : mapRiskLevel(v.risk_level);

  const lat = v.location?.lat || 0;
  const lng = v.location?.lon || v.location?.lng || 0;

  const savedHistory = loadHistoryFromStorage(v.vehicle_id, userId);
  const history = savedHistory.length > 0 ? savedHistory : [[lat, lng]];

  return {
    id:             v.vehicle_id,
    plate:          v.vehicle_id,
    model:          v.owner_name || '',
    lat, lng,
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

function normalizeAlert(a, index) {
  return {
    id:       a.id || index + 1,
    time:     a.timestamp ? new Date(a.timestamp).toLocaleTimeString('he-IL') : new Date().toLocaleTimeString('he-IL'),
    plate:    a.plate || a.vehicle_id || '--',
    message:  a.message || `טמפ׳ גבוהה`,
    severity: a.severity === 'CRITICAL' ? 'critical' :
              a.severity === 'HIGH'     ? 'warning'  :
              a.severity === 'MEDIUM'   ? 'warning'  :
              a.severity === 'LOW'      ? 'ok'       :
              a.severity || 'warning',
  };
}

export default function useVehicles(warnTemp = 32, criticalTemp = 38, refreshRate = 5, resolvedIds = [], userId = null) {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const smsSentRef              = useRef(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [vRes, aRes] = await Promise.all([getVehicles(), getAlerts()]);

        // רכבים מהשרת
        const rawVehicles = vRes.data?.vehicles || vRes.data || [];
        const withNormalized = rawVehicles.map(v =>
          normalizeVehicle(v, resolvedIds, userId)
        );
        setVehicles(withNormalized);

        // התראות מהשרת
        const rawAlerts = aRes.data?.alerts || aRes.data || [];
        const normalizedAlerts = rawAlerts.map((a, i) => normalizeAlert(a, i));
        const resolvedAlerts = resolvedIds.map((id, i) => {
          const v = withNormalized.find(v => v.id === id);
          return {
            id: 100 + i,
            time: new Date().toLocaleTimeString('he-IL'),
            plate: v ? v.plate : id,
            message: 'אירוע טופל בהצלחה',
            severity: 'ok',
          };
        });
        setAlerts([...normalizedAlerts, ...resolvedAlerts]);

        // SMS אוטומטי
        for (const v of withNormalized) {
          if ((v.risk === 'warning' || v.risk === 'critical') && v.ownerPhone && !smsSentRef.current.has(v.id)) {
            const message = v.risk === 'critical'
              ? `🚨 התראה קריטית: רכב ${v.plate} — טמפרטורה ${v.temp}°C, ילד זוהה ברכב! פנה לרכב מיד!`
              : `⚠️ אזהרה: רכב ${v.plate} — טמפרטורה ${v.temp}°C. אנא בדוק את הרכב.`;
            try { await sendSMS(v.id, v.ownerPhone, message); } catch {}
            smsSentRef.current.add(v.id);
          }
          if (v.risk === 'ok') smsSentRef.current.delete(v.id);
        }

      } catch (err) {
        setError('לא ניתן להתחבר לשרת');
        console.error('Failed to fetch vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshRate * 1000);
    return () => clearInterval(interval);
  }, [warnTemp, criticalTemp, refreshRate, JSON.stringify(resolvedIds), userId]);

  return { vehicles, alerts, loading, error };
}