import React, { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import StatsBar from './components/StatsBar';
import VehicleList from './components/VehicleList';
import SettingsPanel from './components/SettingsPanel';
import TempRangeBar from './components/TempRangeBar';
import PrintModal from './components/PrintModal';
import useVehicles from './hooks/useVehicles';
import useIncidents from './hooks/useIncidents';
import useCurrentUser from './hooks/useCurrentUser';
import useIncidentLog from './hooks/useIncidentLog';
import useOnlineUsers from './hooks/useOnlineUsers';
import useVehiclesHistory from './hooks/useVehiclesHistory';
import useOnlineUsersHistory from './hooks/useOnlineUsersHistory';
import { sendSMS, startEngine } from './services/api';

const isMobile = () => window.innerWidth < 768;

const DEFAULT_SETTINGS = {
  theme: 'dark', mapStyle: 'street', fontFamily: 'segoe',
  fontSize: 'md', alertSound: 'beep',
  alertVolume: 80, warnTemp: 32, criticalTemp: 38,
  refreshRate: 5, defaultZoom: 14,
  showVehicleList: true, showAlertsPanel: true, showStatsBar: true,
  showBanner: true, vibrate: false, animateMarkers: true,
  showMarkers: true, autoCenter: true,
};

const THEMES = {
  dark:  { topbar: '#0f172a', topbarBorder: '#1e293b', bg: '#f8fafc', sideBg: '#ffffff', sideText: '#1e293b' },
  light: { topbar: '#2563eb', topbarBorder: '#3b82f6', bg: '#f1f5f9', sideBg: '#ffffff', sideText: '#1e293b' },
  red:   { topbar: '#1a0000', topbarBorder: '#3d0000', bg: '#1a0000', sideBg: '#1f0000', sideText: '#fca5a5' },
  green: { topbar: '#001a0a', topbarBorder: '#003d1a', bg: '#001a0a', sideBg: '#002010', sideText: '#86efac' },
};

const fontFamilyMap = {
  segoe: "'Segoe UI', Arial, sans-serif",
  arial: 'Arial, sans-serif',
  mono:  'monospace',
  rubik: 'Rubik, sans-serif',
};

const fontScaleMap = { sm: 0.85, md: 1, lg: 1.15, xl: 1.3 };

const riskLabel = { critical: 'קריטי', warning: 'אזהרה', ok: 'תקין' };
const riskColor = { critical: '#ef4444', warning: '#f59e0b', ok: '#22c55e' };
const riskBg    = { critical: '#fff0f0', warning: '#fffbe6', ok: '#f0fff4' };

const INCIDENT_STATUS = {
  pending:    { label: 'ממתין לטיפול', color: '#ef4444', bg: '#fff1f2', icon: '🔴' },
  dispatched: { label: 'יצא לזירה',    color: '#f59e0b', bg: '#fffbeb', icon: '🚒' },
  handling:   { label: 'בטיפול',       color: '#3b82f6', bg: '#eff6ff', icon: '👷' },
  resolved:   { label: 'טופל',         color: '#22c55e', bg: '#f0fdf4', icon: '✅' },
};

const STATUS_LABELS = {
  pending: 'ממתין לטיפול', dispatched: 'יצא לזירה',
  handling: 'בטיפול', resolved: 'טופל',
};

function playAlertSound(type = 'beep', volume = 80) {
  if (type === 'none') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    const vol = volume / 100;
    resume.then(() => {
      if (type === 'beep') {
        [0, 0.3, 0.6].forEach(delay => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 880; osc.type = 'sine';
          gain.gain.setValueAtTime(vol * 0.5, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
          osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.25);
        });
      } else if (type === 'alarm') {
        [0, 0.4, 0.8, 1.2].forEach((delay, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = i % 2 === 0 ? 660 : 880;
          gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
          osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.35);
        });
      } else if (type === 'siren') {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 1.0);
        gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.1);
      }
    });
  } catch (e) { console.warn('Audio not available:', e); }
}

function UserBadge({ user, isBusy }) {
  if (!user) return null;
  const roleColors = {
    'מפקד':    { bg: '#eff6ff', color: '#1d4ed8' },
    'חובשת':   { bg: '#f0fdf4', color: '#15803d' },
    'נהג':     { bg: '#f8fafc', color: '#475569' },
    'מוקדנית': { bg: '#fdf4ff', color: '#7e22ce' },
    'פרמדיק':  { bg: '#fff7ed', color: '#c2410c' },
  };
  const roleStyle = roleColors[user.role] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.1)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: roleStyle.bg, color: roleStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: '700', flexShrink: 0 }}>
        {user.avatar || user.name?.slice(0, 2)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, fontWeight: '600', color: 'white', lineHeight: 1.2 }}>{user.name}</span>
        <span style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.2 }}>{user.role} · {user.station}</span>
      </div>
      <div style={{ fontSize: 9, fontWeight: '600', padding: '2px 6px', borderRadius: 8, background: isBusy ? '#f59e0b' : '#22c55e', color: 'white', flexShrink: 0 }}>
        {isBusy ? 'לא פנוי' : 'פנוי'}
      </div>
    </div>
  );
}

function BottomWidget({ icon, label, value, color, pulse }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 6px', borderRight: '1px solid #1e293b', gap: 1 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: '700', color, animation: pulse ? 'pulse 1.2s ease-in-out infinite' : 'none' }}>{value}</span>
      <span style={{ fontSize: 9, color: '#64748b' }}>{label}</span>
    </div>
  );
}

function BottomBar({ vehicles, alerts, lastRefresh, systemOk, incidentTimers, getStatus }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const maxTemp = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.temp)) : 0;
  const criticalVehicle = vehicles.find(v => v.risk === 'critical');
  const criticalStatus  = criticalVehicle ? getStatus(criticalVehicle.id) : null;
  const incidentStatus  = criticalStatus ? INCIDENT_STATUS[criticalStatus] : null;
  const criticalTimer   = criticalVehicle && incidentTimers[criticalVehicle.id] ? Math.floor((now - incidentTimers[criticalVehicle.id]) / 1000) : null;
  const formatTimer = (secs) => { if (secs === null) return '--'; const m = Math.floor(secs / 60); const s = secs % 60; return `${m}:${s.toString().padStart(2, '0')}`; };
  const secsSinceRefresh = lastRefresh ? Math.floor((now - lastRefresh) / 1000) : 0;
  const riskScore = Math.min(100, Math.round((vehicles.filter(v => v.risk === 'critical').length * 40) + (vehicles.filter(v => v.risk === 'warning').length * 15) + (maxTemp > 30 ? (maxTemp - 30) * 2 : 0)));
  const riskScoreColor = riskScore >= 70 ? '#ef4444' : riskScore >= 40 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ height: 52, background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'stretch', flexShrink: 0, overflowX: 'auto' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <BottomWidget icon="🌡" label="טמפ׳ מקס׳" value={`${maxTemp}°C`} color={maxTemp >= 38 ? '#ef4444' : maxTemp >= 32 ? '#f59e0b' : '#22c55e'} pulse={maxTemp >= 38} />
      <BottomWidget icon="🚗" label="רכבים פעילים" value={vehicles.length} color="#3b82f6" />
      <BottomWidget icon="⚡" label="ריענון אחרון" value={`${secsSinceRefresh}s`} color={secsSinceRefresh > 10 ? '#f59e0b' : '#22c55e'} />
      <BottomWidget icon={systemOk ? '💚' : '🔴'} label="מערכת" value={systemOk ? 'תקינה' : 'שגיאה'} color={systemOk ? '#22c55e' : '#ef4444'} pulse={!systemOk} />
      <BottomWidget icon={incidentStatus?.icon || '😴'} label="אירוע פעיל" value={incidentStatus?.label || 'אין אירוע'} color={incidentStatus?.color || '#64748b'} pulse={criticalStatus === 'pending'} />
      <BottomWidget icon="⏱" label="זמן אירוע" value={formatTimer(criticalTimer)} color={criticalTimer && criticalTimer > 120 ? '#ef4444' : '#f59e0b'} pulse={criticalTimer !== null} />
      <BottomWidget icon="📊" label="רמת סיכון" value={`${riskScore}%`} color={riskScoreColor} pulse={riskScore >= 70} />
      <BottomWidget icon="🔔" label="התראות" value={alerts.length} color={alerts.length > 0 ? '#f59e0b' : '#22c55e'} />
    </div>
  );
}

function CriticalBanner({ vehicles, onSelect, onDismiss, scale }) {
  const critical = vehicles.filter(v => v.risk === 'critical');
  if (critical.length === 0) return null;
  const s = scale || 1;
  const v = critical[0];
  return (
    <>
      <style>{`@keyframes flashBanner{0%,100%{opacity:1}50%{opacity:.7}} @keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}`}</style>
      <div style={{ background: '#dc2626', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', animation: 'slideDown 0.4s ease, flashBanner 1.2s ease-in-out infinite', borderBottom: '2px solid #f87171', flexShrink: 0, zIndex: 1000 }}>
        <span style={{ fontSize: 20 * s }}>🚨</span>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontWeight: 'bold', fontSize: 14 * s }}>אזהרה קריטית — {critical.length} רכב{critical.length > 1 ? 'ים' : ''} בסכנה!</div>
          <div style={{ fontSize: 12 * s, opacity: 0.9 }}>{critical.map(v => `${v.plate} · ${v.temp}°C · ${v.ownerName || ''}`).join(' | ')}</div>
        </div>
        <a href="tel:101" style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: 13 * s, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>📞 התקשר 101</a>
        <button onClick={() => onSelect(v)} style={{ background: 'white', color: '#dc2626', border: 'none', borderRadius: 6, padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 * s }}>הצג רכב</button>
        <button onClick={onDismiss} style={{ background: 'none', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', fontSize: 12 * s }}>✕</button>
      </div>
    </>
  );
}

function IncidentStatusBar({ vehicleId, status, onSetStatus }) {
  const current = INCIDENT_STATUS[status] || INCIDENT_STATUS.pending;
  const steps = Object.entries(INCIDENT_STATUS).map(([key, val]) => ({ key, ...val }));
  return (
    <div style={{ margin: '12px 0', padding: '14px', background: current.bg, border: `1.5px solid ${current.color}`, borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{current.icon}</span>
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>סטטוס אירוע</div>
          <div style={{ fontSize: 15, fontWeight: '700', color: current.color }}>{current.label}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {status === 'pending' && (<>
          <button onClick={() => onSetStatus(vehicleId, 'dispatched')} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: '600', cursor: 'pointer', width: '100%' }}>🚒 יצא לזירה</button>
          <button onClick={() => onSetStatus(vehicleId, 'handling')} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: '600', cursor: 'pointer', width: '100%' }}>👷 בטיפול</button>
        </>)}
        {status === 'dispatched' && <button onClick={() => onSetStatus(vehicleId, 'handling')} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: '600', cursor: 'pointer', width: '100%' }}>👷 עבור לטיפול</button>}
        {(status === 'dispatched' || status === 'handling') && <button onClick={() => onSetStatus(vehicleId, 'resolved')} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: '600', cursor: 'pointer', width: '100%' }}>✅ סיום טיפול</button>}
        {status === 'resolved' && <button onClick={() => onSetStatus(vehicleId, 'pending')} style={{ background: 'none', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px', fontSize: 12, cursor: 'pointer', width: '100%' }}>↩ איפוס</button>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, gap: 4 }}>
        {steps.map((step, i) => {
          const stepIndex = steps.findIndex(s => s.key === status);
          const isDone = i <= stepIndex;
          return (
            <React.Fragment key={step.key}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: isDone ? step.color : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: '700', flexShrink: 0, transition: 'background 0.3s' }}>{isDone ? '✓' : i + 1}</div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIndex ? '#22c55e' : '#e2e8f0', transition: 'background 0.3s' }} />}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {steps.map(step => <div key={step.key} style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center', flex: 1 }}>{step.label.split(' ')[0]}</div>)}
      </div>
    </div>
  );
}

function VehiclePanel({ vehicle, onClose, settings, scale, theme, incidentStatus, onSetStatus }) {
  const warnTemp = settings?.warnTemp || 32;
  const criticalTemp = settings?.criticalTemp || 38;
  const s = scale || 1;
  const textColor = theme?.sideText || '#1e293b';
  const [smsStatus, setSmsStatus]       = useState(null);
  const [engineStatus, setEngineStatus] = useState(null);

  const handleSendSMS = async () => {
    if (!vehicle.ownerPhone) return;
    setSmsStatus('sending');
    const message = `התראה: רכב ${vehicle.plate} — טמפרטורה ${vehicle.temp}°C. אנא פנה לרכב מיד.`;
    try { await sendSMS(vehicle.id, vehicle.ownerPhone, message); } catch {}
    setSmsStatus('sent');
    setTimeout(() => setSmsStatus(null), 4000);
  };

  const handleStartEngine = async () => {
    setEngineStatus('starting');
    try { await startEngine(vehicle.id); } catch {}
    setEngineStatus('started');
    setTimeout(() => setEngineStatus(null), 5000);
  };

  return (
    <div style={{ padding: 16, background: theme?.sideBg || '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16 * s, fontWeight: 'bold', color: textColor }}>🚗 {vehicle.plate}</div>
          <div style={{ color: '#94a3b8', fontSize: 12 * s, marginTop: 2 }}>{vehicle.ownerName || vehicle.model}</div>
        </div>
        <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 * s, color: '#64748b' }}>✕</button>
      </div>

      <div style={{ background: riskBg[vehicle.risk], border: `1.5px solid ${riskColor[vehicle.risk]}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 11 * s, color: '#64748b', marginBottom: 2 }}>רמת סיכון</div>
        <div style={{ fontSize: 22 * s, fontWeight: '700', color: riskColor[vehicle.risk] }}>{riskLabel[vehicle.risk]}</div>
        {vehicle.recommendation && <div style={{ fontSize: 10 * s, color: '#64748b', marginTop: 4 }}>{vehicle.recommendation}</div>}
      </div>

      {(vehicle.risk === 'warning' || vehicle.risk === 'critical') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {!vehicle.engine && (
            <button onClick={handleStartEngine} disabled={engineStatus === 'starting' || engineStatus === 'started'} style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', fontSize: 13 * s, fontWeight: '600', cursor: engineStatus === 'started' ? 'default' : 'pointer', background: engineStatus === 'started' ? '#22c55e' : engineStatus === 'starting' ? '#94a3b8' : '#1e293b', color: 'white' }}>
              {engineStatus === 'starting' ? '⏳ מדליק מנוע...' : engineStatus === 'started' ? '✅ מנוע הודלק בהצלחה' : '🔑 הדלק מנוע מרחוק'}
            </button>
          )}
          {vehicle.engine && <div style={{ width: '100%', padding: '10px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #22c55e', color: '#15803d', fontSize: 13 * s, fontWeight: '600', textAlign: 'center', boxSizing: 'border-box' }}>✅ המנוע כבר דלוק</div>}
          {vehicle.ownerPhone && (
            <button onClick={handleSendSMS} disabled={smsStatus === 'sending' || smsStatus === 'sent'} style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', fontSize: 13 * s, fontWeight: '600', cursor: smsStatus === 'sent' ? 'default' : 'pointer', background: smsStatus === 'sent' ? '#22c55e' : smsStatus === 'sending' ? '#94a3b8' : vehicle.risk === 'critical' ? '#dc2626' : '#f59e0b', color: 'white' }}>
              {smsStatus === 'sending' ? '⏳ שולח SMS...' : smsStatus === 'sent' ? `✅ SMS נשלח ל${vehicle.ownerPhone}` : `📱 שלח SMS ל${vehicle.ownerName || 'בעלים'}`}
            </button>
          )}
          <a href="tel:101" style={{ width: '100%', padding: '10px', borderRadius: 8, background: '#22c55e', color: 'white', fontSize: 13 * s, fontWeight: '600', textDecoration: 'none', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>📞 התקשר 101</a>
        </div>
      )}

      {vehicle.risk === 'critical' && <IncidentStatusBar vehicleId={vehicle.id} status={incidentStatus} onSetStatus={onSetStatus} />}

      {[
        { label: 'טמפרטורה פנימית',  value: `${vehicle.temp}°C`, icon: '🌡', valueColor: vehicle.temp >= criticalTemp ? '#ef4444' : vehicle.temp >= warnTemp ? '#f59e0b' : textColor },
        { label: 'טמפרטורה חיצונית', value: vehicle.externalTemp ? `${vehicle.externalTemp}°C` : '--', icon: '☀️' },
        { label: 'ילד ברכב',         value: vehicle.motion ? 'זוהה' : 'לא זוהה', icon: '👶', valueColor: vehicle.motion ? '#ef4444' : '#22c55e' },
        { label: 'מנוע',             value: vehicle.engine ? 'דלוק' : 'כבוי', icon: '🔑', valueColor: vehicle.engine ? '#22c55e' : '#94a3b8' },
        { label: 'מרחק הורה',        value: vehicle.parentDistance ? `${Math.round(vehicle.parentDistance)}m` : '--', icon: '📏', valueColor: vehicle.parentDistance > 300 ? '#ef4444' : vehicle.parentDistance > 100 ? '#f59e0b' : '#22c55e' },
        { label: 'גל חום',           value: vehicle.isHeatwave ? 'כן' : 'לא', icon: '🔥', valueColor: vehicle.isHeatwave ? '#ef4444' : '#22c55e' },
        { label: 'ציון סיכון',       value: `${vehicle.riskScore || 0}/100`, icon: '📊', valueColor: (vehicle.riskScore || 0) >= 80 ? '#ef4444' : (vehicle.riskScore || 0) >= 60 ? '#f59e0b' : '#22c55e' },
        { label: 'בעלים',            value: vehicle.ownerName || '--', icon: '👤' },
        { label: 'טלפון',            value: vehicle.ownerPhone || '--', icon: '📱' },
        { label: 'קואורדינטות',      value: `${vehicle.lat}, ${vehicle.lng}`, icon: '📍' },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme?.topbarBorder || '#f1f5f9'}` }}>
          <div style={{ color: '#94a3b8', fontSize: 12 * s }}>{row.icon} {row.label}</div>
          <div style={{ fontWeight: 600, fontSize: 13 * s, color: row.valueColor || textColor }}>{row.value}</div>
        </div>
      ))}
    </div>
  );
}

function AlertsPanel({ alerts, scale, theme, filter, onFilterChange }) {
  const s = scale || 1;
  const textColor = theme?.sideText || '#1e293b';
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const filters = [
    { key: 'all', label: 'הכל', count: alerts.length },
    { key: 'critical', label: 'קריטי', count: alerts.filter(a => a.severity === 'critical').length },
    { key: 'warning', label: 'אזהרה', count: alerts.filter(a => a.severity === 'warning').length },
    { key: 'ok', label: 'נפתר', count: alerts.filter(a => a.severity === 'ok').length },
  ];
  return (
    <div style={{ padding: '14px 14px 12px', background: theme?.sideBg || '#fff' }}>
      <div style={{ fontWeight: '700', fontSize: 14 * s, color: textColor, marginBottom: 10 }}>🔔 התראות</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => onFilterChange(f.key)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11 * s, cursor: 'pointer', border: filter === f.key ? 'none' : '1px solid #e2e8f0', background: filter === f.key ? f.key === 'critical' ? '#ef4444' : f.key === 'warning' ? '#f59e0b' : f.key === 'ok' ? '#22c55e' : '#1e293b' : '#f8fafc', color: filter === f.key ? 'white' : '#64748b', fontWeight: filter === f.key ? '600' : '400' }}>{f.label} ({f.count})</button>
        ))}
      </div>
      {filtered.length === 0
        ? <div style={{ color: '#cbd5e1', fontSize: 13 * s, textAlign: 'center', marginTop: 24 }}>אין התראות</div>
        : filtered.map(a => (
          <div key={a.id} style={{ padding: '9px 12px', marginBottom: 8, borderRadius: 8, fontSize: 12 * s, background: a.severity === 'critical' ? '#fff1f2' : a.severity === 'warning' ? '#fffbeb' : '#f0fdf4', borderLeft: `3px solid ${a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#22c55e'}`, border: `1px solid ${a.severity === 'critical' ? '#fecaca' : a.severity === 'warning' ? '#fde68a' : '#bbf7d0'}`, borderLeftWidth: 3 }}>
            <div style={{ color: '#94a3b8', fontSize: 10 * s, marginBottom: 3 }}>{a.time}</div>
            <div style={{ color: textColor, fontWeight: 500 }}>{a.plate} — {a.message}</div>
          </div>
        ))
      }
    </div>
  );
}

export default function App() {
  const [selected, setSelected]             = useState(null);
  const [time, setTime]                     = useState(new Date());
  const [showBanner, setShowBanner]         = useState(true);
  const [showVehicles, setShowVehicles]     = useState(false);
  const [showAlerts, setShowAlerts]         = useState(false);
  const [showSettings, setShowSettings]     = useState(false);
  const [showPrint, setShowPrint]           = useState(false);
  const [mobile, setMobile]                 = useState(isMobile());
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const [settings, setSettings]             = useState(DEFAULT_SETTINGS);
  const [alertFilter, setAlertFilter]       = useState('all');
  const [lastRefresh, setLastRefresh]       = useState(Date.now());
  const [systemOk, setSystemOk]             = useState(true);
  const [incidentTimers, setIncidentTimers] = useState({});
  const [resolvedIds, setResolvedIds]       = useState([]);
  const [isBusy, setIsBusy]                 = useState(false);
  const prevCriticalCount                   = useRef(0);
  const recordIntervalRef                   = useRef(null);

  const { user }                                    = useCurrentUser();
  const { vehicles, alerts }                        = useVehicles(settings.warnTemp, settings.criticalTemp, settings.refreshRate, resolvedIds, user?.id);
  const { getStatus, setStatus: setIncidentStatus } = useIncidents();
  const { log: incidentLog, addLog }                = useIncidentLog(user?.id);
  const { users: onlineUsers }                      = useOnlineUsers(user?.id, isBusy);
  const { recordVehicleState }                      = useVehiclesHistory(user?.id);
  const { recordUserStatus }                        = useOnlineUsersHistory(user?.id);

  const scale = fontScaleMap[settings.fontSize] || 1;
  const theme = THEMES[settings.theme] || THEMES.dark;

  // ✅ טעינת הגדרות לפי משתמש
  useEffect(() => {
    if (!user?.id) return;
    try {
      const saved = localStorage.getItem(`childguard_settings_${user.id}`);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, [user?.id]);

  // ✅ רישום היסטוריה כל 30 שניות
  useEffect(() => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    recordIntervalRef.current = setInterval(() => {
      if (vehicles.length > 0) recordVehicleState(vehicles);
      if (onlineUsers.length > 0) recordUserStatus(onlineUsers);
    }, 30000);
    return () => clearInterval(recordIntervalRef.current);
  }, [vehicles, onlineUsers]);

  useEffect(() => { setLastRefresh(Date.now()); setSystemOk(true); }, [vehicles]);
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => { const h = () => setMobile(isMobile()); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  useEffect(() => { const h = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h); }, []);

  useEffect(() => {
    const criticalCount = vehicles.filter(v => v.risk === 'critical').length;
    if (criticalCount > prevCriticalCount.current) {
      setTimeout(() => playAlertSound(settings.alertSound, settings.alertVolume), 500);
      setShowBanner(true);
      vehicles.filter(v => v.risk === 'critical').forEach(v => {
        setIncidentTimers(prev => {
          if (prev[v.id]) return prev;
          addLog({ type: 'incident_opened', vehicleId: v.id, plate: v.plate, temp: v.temp, user: user?.name || 'מערכת', action: `אירוע קריטי נפתח — רכב ${v.plate} (${v.temp}°C)` });
          // ✅ רישום מיידי בכל אירוע קריטי
          recordVehicleState(vehicles);
          recordUserStatus(onlineUsers);
          return { ...prev, [v.id]: Date.now() };
        });
      });
    }
    prevCriticalCount.current = criticalCount;
  }, [vehicles, settings.alertSound, settings.alertVolume]);

  // ✅ שמירת הגדרות לפי משתמש
  const handleSettingsChange = (key, value) => {
    const storageKey = `childguard_settings_${user?.id || 'guest'}`;
    if (key === 'reset') {
      setSettings(DEFAULT_SETTINGS);
      try { localStorage.removeItem(storageKey); } catch {}
    } else {
      setSettings(prev => {
        const next = { ...prev, [key]: value };
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
        return next;
      });
    }
  };

  const handleSetStatus = (vehicleId, status) => {
    setIncidentStatus(vehicleId, status);
    if (status === 'dispatched' || status === 'handling') setIsBusy(true);
    if (status === 'resolved' || status === 'pending')    setIsBusy(false);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    addLog({ type: 'status_change', vehicleId, plate: vehicle?.plate || vehicleId, user: user?.name || 'לא ידוע', userId: user?.id, role: user?.role, station: user?.station, action: `${STATUS_LABELS[status]} — על ידי ${user?.name || 'לא ידוע'} (${user?.role || ''})`, newStatus: status });
    if (status === 'resolved') {
      setResolvedIds(prev => [...new Set([...prev, vehicleId])]);
      setIncidentTimers(prev => { const next = { ...prev }; delete next[vehicleId]; return next; });
    }
    if (status === 'pending') setResolvedIds(prev => prev.filter(id => id !== vehicleId));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const hasCritical = vehicles.some(v => v.risk === 'critical');
  const TOPBAR_H = 48, STATS_H = mobile ? 70 : 80, BOTTOM_H = 52;
  const MAP_H = `calc(100vh - ${TOPBAR_H + STATS_H + BOTTOM_H}px)`;

  const topbarButtons = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap' }}>
      {!mobile && user && <UserBadge user={user} isBusy={isBusy} />}
      <span style={{ width: 1, height: 20, background: '#334155', margin: '0 2px', flexShrink: 0 }} />
      <span style={{ color: '#94a3b8', fontSize: 12 }}>🚗 {vehicles.length}</span>
      <span style={{ color: '#ef4444', fontSize: 12 }}>⚠ {vehicles.filter(v => v.risk === 'critical').length}</span>
      <span style={{ color: '#f59e0b', fontSize: 12 }}>! {vehicles.filter(v => v.risk === 'warning').length}</span>
      <span style={{ color: '#64748b', fontSize: 11 }}>🕐 {time.toLocaleTimeString('he-IL')}</span>
      {[
        { icon: '🔔', title: 'בדוק צליל', onClick: () => playAlertSound(settings.alertSound, settings.alertVolume) },
        { icon: '📄', title: 'הדפסה',     onClick: () => setShowPrint(true), bg: '#3b82f6', color: 'white' },
        { icon: '⛶',  title: 'מסך מלא',  onClick: toggleFullscreen, active: isFullscreen },
        { icon: '⚙️', title: 'הגדרות',   onClick: () => setShowSettings(true) },
      ].map(btn => (
        <button key={btn.title} onClick={btn.onClick} title={btn.title} style={{ background: btn.bg || (btn.active ? '#334155' : 'none'), border: btn.bg ? 'none' : '1px solid #334155', borderRadius: 6, color: btn.color || '#94a3b8', padding: '5px 8px', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>{btn.icon}</button>
      ))}
    </div>
  );

  const mobileButtons = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {user && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: '700' }}>{user.avatar || user.name?.slice(0, 2)}</div>}
      <span style={{ color: '#64748b', fontSize: 11 }}>🕐 {time.toLocaleTimeString('he-IL')}</span>
      {[
        { icon: '🚗', onClick: () => setShowVehicles(true) },
        { icon: '🔔', onClick: () => setShowAlerts(true), bg: hasCritical ? '#ef4444' : undefined },
        { icon: '📄', onClick: () => setShowPrint(true), bg: '#3b82f6', color: 'white' },
        { icon: '⛶',  onClick: toggleFullscreen, active: isFullscreen },
        { icon: '⚙️', onClick: () => setShowSettings(true) },
      ].map((btn, i) => (
        <button key={i} onClick={btn.onClick} style={{ background: btn.bg || (btn.active ? '#334155' : 'none'), border: btn.bg ? 'none' : '1px solid #334155', borderRadius: 6, color: btn.color || '#94a3b8', padding: '5px 8px', cursor: 'pointer', fontSize: 13 }}>{btn.icon}</button>
      ))}
    </div>
  );

  const SidePanel = () => (
    <div style={{ background: theme.sideBg }}>
      <AlertsPanel alerts={alerts} scale={scale} theme={theme} filter={alertFilter} onFilterChange={setAlertFilter} />
      <div style={{ borderTop: `1px solid ${theme.topbarBorder}` }}>
        <TempRangeBar warnTemp={settings.warnTemp} criticalTemp={settings.criticalTemp} theme={theme} />
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: fontFamilyMap[settings.fontFamily] || "'Segoe UI', Arial, sans-serif", height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: theme.bg }}>

      <div style={{ height: TOPBAR_H, background: theme.topbar, color: 'white', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, borderBottom: `1px solid ${theme.topbarBorder}`, overflow: 'hidden' }}>
        <span style={{ fontWeight: '700', fontSize: 15, whiteSpace: 'nowrap' }}>🛡 ChildGuard</span>
        {!mobile && <span style={{ color: '#64748b', fontSize: 12, borderLeft: `1px solid ${theme.topbarBorder}`, paddingLeft: 10, whiteSpace: 'nowrap' }}>מרכז חירום</span>}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>{mobile ? mobileButtons : topbarButtons}</div>
      </div>

      {hasCritical && showBanner && settings.showBanner && (
        <CriticalBanner vehicles={vehicles} scale={scale} onSelect={(v) => { setSelected(v); setShowBanner(false); }} onDismiss={() => setShowBanner(false)} />
      )}

      {settings.showStatsBar && <div style={{ height: STATS_H, flexShrink: 0 }}><StatsBar vehicles={vehicles} alerts={alerts} scale={scale} /></div>}

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!mobile && settings.showVehicleList && (
          <VehicleList vehicles={vehicles} selected={selected} onSelect={setSelected} visible={true} onClose={() => {}} theme={theme} onlineUsers={onlineUsers} />
        )}
        {mobile && (
          <VehicleList vehicles={vehicles} selected={selected} onSelect={setSelected} visible={showVehicles} onClose={() => setShowVehicles(false)} theme={theme} onlineUsers={onlineUsers} />
        )}

        <div style={{ flex: 1 }}>
          <MapView vehicles={vehicles} onSelectVehicle={(v) => { setSelected(v); setShowAlerts(false); }} height={MAP_H} settings={settings} selectedVehicle={selected} />
        </div>

        {!mobile && settings.showAlertsPanel && (
          <div style={{ width: 320, background: theme.sideBg, flexShrink: 0, borderLeft: `1px solid ${theme.topbarBorder}`, overflowY: 'auto' }}>
            {selected
              ? <VehiclePanel vehicle={selected} settings={settings} scale={scale} theme={theme} incidentStatus={getStatus(selected.id)} onSetStatus={handleSetStatus} onClose={() => setSelected(null)} />
              : <SidePanel />
            }
          </div>
        )}

        {mobile && (selected || showAlerts) && (
          <div style={{ position: 'fixed', bottom: 52, left: 0, right: 0, background: theme.sideBg, borderTop: `1px solid ${theme.topbarBorder}`, maxHeight: '55vh', overflowY: 'auto', zIndex: 200, borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
            {selected
              ? <VehiclePanel vehicle={selected} settings={settings} scale={scale} theme={theme} incidentStatus={getStatus(selected.id)} onSetStatus={handleSetStatus} onClose={() => setSelected(null)} />
              : <SidePanel />
            }
          </div>
        )}
      </div>

      <BottomBar vehicles={vehicles} alerts={alerts} lastRefresh={lastRefresh} systemOk={systemOk} incidentTimers={incidentTimers} getStatus={getStatus} />

      {showSettings && <SettingsPanel settings={settings} onChange={handleSettingsChange} onClose={() => setShowSettings(false)} />}

      {showPrint && (
        <PrintModal
          onClose={() => setShowPrint(false)}
          vehicles={vehicles}
          alerts={alerts}
          incidentLog={incidentLog}
          onlineUsers={onlineUsers}
        />
      )}
    </div>
  );
}