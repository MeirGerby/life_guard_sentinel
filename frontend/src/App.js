import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import MapView from './components/MapView';
import StatsBar from './components/StatsBar';
import VehicleList from './components/VehicleList';
import SettingsPanel from './components/SettingsPanel';
import TempRangeBar from './components/TempRangeBar';
import useVehicles from './hooks/useVehicles';

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

function playAlertSound(type = 'beep', volume = 80) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const vol = volume / 100;
  if (type === 'none') return;
  if (type === 'beep') {
    [0, 0.3, 0.6].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      gain.gain.setValueAtTime(vol * 0.5, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.25);
    });
  } else if (type === 'alarm') {
    [0, 0.4, 0.8, 1.2].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = i % 2 === 0 ? 660 : 880;
      gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  } else if (type === 'siren') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.5);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 1.0);
    gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.1);
  }
}

function exportPDF(vehicles, alerts) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString('en-GB');
  doc.setFontSize(18);
  doc.text('ChildGuard - Emergency Dashboard Report', 14, 20);
  doc.setFontSize(11); doc.setTextColor(120);
  doc.text(`Generated: ${now}`, 14, 28);
  doc.setFontSize(13); doc.setTextColor(0);
  doc.text('Summary', 14, 40); doc.setFontSize(11);
  doc.text(`Total Vehicles: ${vehicles.length}`, 14, 48);
  doc.text(`Critical: ${vehicles.filter(v => v.risk === 'critical').length}`, 14, 55);
  doc.text(`Warning: ${vehicles.filter(v => v.risk === 'warning').length}`, 14, 62);
  doc.text(`OK: ${vehicles.filter(v => v.risk === 'ok').length}`, 14, 69);
  doc.setFontSize(13); doc.text('Vehicles Status', 14, 82);
  autoTable(doc, {
    startY: 87,
    head: [['Plate', 'Vehicle ID', 'Temp', 'Motion', 'Engine', 'Risk']],
    body: vehicles.map(v => [
      v.plate, v.id.toString(), `${v.temp}C`,
      v.motion ? 'Detected' : 'None',
      v.engine ? 'On' : 'Off',
      v.risk === 'critical' ? 'Critical' : v.risk === 'warning' ? 'Warning' : 'OK',
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [26, 26, 46] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  const alertsY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(13); doc.text('Alerts', 14, alertsY);
  autoTable(doc, {
    startY: alertsY + 5,
    head: [['Time', 'Plate', 'Message', 'Severity']],
    body: alerts.map(a => [
      a.time, a.plate,
      a.severity === 'critical' ? 'Critical alert detected' :
      a.severity === 'warning'  ? 'Warning alert detected' : 'Resolved',
      a.severity === 'critical' ? 'Critical' : a.severity === 'warning' ? 'Warning' : 'OK',
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [26, 26, 46] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  doc.save(`childguard-report-${Date.now()}.pdf`);
}

function CriticalBanner({ vehicles, onSelect, onDismiss, scale }) {
  const critical = vehicles.filter(v => v.risk === 'critical');
  if (critical.length === 0) return null;
  const s = scale || 1;
  return (
    <>
      <style>{`
        @keyframes flashBanner { 0%,100%{opacity:1} 50%{opacity:.7} }
        @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }
      `}</style>
      <div style={{
        background: '#dc2626', color: 'white',
        padding: '10px 16px', display: 'flex',
        alignItems: 'center', gap: 12, flexWrap: 'wrap',
        animation: 'slideDown 0.4s ease, flashBanner 1.2s ease-in-out infinite',
        borderBottom: '2px solid #f87171', flexShrink: 0, zIndex: 1000,
      }}>
        <span style={{ fontSize: 20 * s }}>🚨</span>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontWeight: 'bold', fontSize: 14 * s }}>
            אזהרה קריטית — {critical.length} רכב{critical.length > 1 ? 'ים' : ''} בסכנה!
          </div>
          <div style={{ fontSize: 12 * s, opacity: 0.9 }}>
            {critical.map(v => `${v.plate} · ${v.temp}°C`).join(' | ')}
          </div>
        </div>
        <button onClick={() => onSelect(critical[0])} style={{
          background: 'white', color: '#dc2626', border: 'none',
          borderRadius: 6, padding: '5px 12px', fontWeight: 'bold',
          cursor: 'pointer', fontSize: 12 * s
        }}>הצג רכב</button>
        <button onClick={onDismiss} style={{
          background: 'none', color: 'white',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: 6, padding: '5px 10px',
          cursor: 'pointer', fontSize: 12 * s
        }}>✕ סגור</button>
      </div>
    </>
  );
}

function VehiclePanel({ vehicle, onClose, settings, scale, theme }) {
  const warnTemp     = settings?.warnTemp     || 32;
  const criticalTemp = settings?.criticalTemp || 38;
  const s = scale || 1;
  const textColor = theme?.sideText || '#1e293b';
  return (
    <div style={{ padding: 16, background: theme?.sideBg || '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16 * s, fontWeight: 'bold', color: textColor }}>🚗 {vehicle.plate}</div>
          <div style={{ color: '#94a3b8', fontSize: 12 * s, marginTop: 2 }}>{vehicle.model}</div>
        </div>
        <button onClick={onClose} style={{
          background: '#f1f5f9', border: 'none', borderRadius: 8,
          padding: '6px 12px', cursor: 'pointer', fontSize: 13 * s, color: '#64748b'
        }}>✕</button>
      </div>
      <div style={{
        background: riskBg[vehicle.risk],
        border: `1.5px solid ${riskColor[vehicle.risk]}`,
        borderRadius: 10, padding: '12px 16px',
        marginBottom: 16, textAlign: 'center'
      }}>
        <div style={{ fontSize: 11 * s, color: '#64748b', marginBottom: 4 }}>רמת סיכון</div>
        <div style={{ fontSize: 24 * s, fontWeight: '700', color: riskColor[vehicle.risk] }}>
          {riskLabel[vehicle.risk]}
        </div>
      </div>
      {[
        { label: 'טמפרטורה',    value: `${vehicle.temp}°C`, icon: '🌡',
          valueColor: vehicle.temp >= criticalTemp ? '#ef4444' : vehicle.temp >= warnTemp ? '#f59e0b' : textColor },
        { label: 'תנועה',       value: vehicle.motion ? 'זוהתה' : 'לא זוהתה', icon: '👁',
          valueColor: vehicle.motion ? '#ef4444' : '#22c55e' },
        { label: 'מנוע',        value: vehicle.engine ? 'דלוק' : 'כבוי', icon: '🔑',
          valueColor: vehicle.engine ? '#22c55e' : '#94a3b8' },
        { label: 'קואורדינטות', value: `${vehicle.lat}, ${vehicle.lng}`, icon: '📍' },
      ].map(row => (
        <div key={row.label} style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '9px 0',
          borderBottom: `1px solid ${theme?.topbarBorder || '#f1f5f9'}`
        }}>
          <div style={{ color: '#94a3b8', fontSize: 12 * s }}>{row.icon} {row.label}</div>
          <div style={{ fontWeight: 600, fontSize: 13 * s, color: row.valueColor || textColor }}>{row.value}</div>
        </div>
      ))}
      {vehicle.risk === 'critical' && (
        <button style={{
          marginTop: 20, width: '100%', background: '#dc2626', color: 'white',
          border: 'none', borderRadius: 10, padding: '13px 0',
          fontSize: 14 * s, fontWeight: 'bold', cursor: 'pointer'
        }}>🚨 שלח כוחות חירום</button>
      )}
    </div>
  );
}

function AlertsPanel({ alerts, scale, theme }) {
  const [filter, setFilter] = useState('all');
  const s = scale || 1;
  const textColor = theme?.sideText || '#1e293b';
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const filters = [
    { key: 'all',      label: 'הכל',   count: alerts.length },
    { key: 'critical', label: 'קריטי', count: alerts.filter(a => a.severity === 'critical').length },
    { key: 'warning',  label: 'אזהרה', count: alerts.filter(a => a.severity === 'warning').length },
    { key: 'ok',       label: 'נפתר',  count: alerts.filter(a => a.severity === 'ok').length },
  ];
  return (
    <div style={{ padding: '14px 14px 12px', background: theme?.sideBg || '#fff' }}>
      <div style={{ fontWeight: '700', fontSize: 14 * s, color: textColor, marginBottom: 10 }}>🔔 התראות</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 11 * s, cursor: 'pointer',
            border: filter === f.key ? 'none' : '1px solid #e2e8f0',
            background: filter === f.key
              ? f.key === 'critical' ? '#ef4444'
              : f.key === 'warning'  ? '#f59e0b'
              : f.key === 'ok'       ? '#22c55e'
              : '#1e293b' : '#f8fafc',
            color: filter === f.key ? 'white' : '#64748b',
            fontWeight: filter === f.key ? '600' : '400',
          }}>{f.label} ({f.count})</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ color: '#cbd5e1', fontSize: 13 * s, textAlign: 'center', marginTop: 24 }}>אין התראות</div>
      ) : filtered.map(a => (
        <div key={a.id} style={{
          padding: '9px 12px', marginBottom: 8, borderRadius: 8, fontSize: 12 * s,
          background: a.severity === 'critical' ? '#fff1f2' :
                      a.severity === 'warning'  ? '#fffbeb' : '#f0fdf4',
          borderLeft: `3px solid ${
            a.severity === 'critical' ? '#ef4444' :
            a.severity === 'warning'  ? '#f59e0b' : '#22c55e'}`,
          border: `1px solid ${
            a.severity === 'critical' ? '#fecaca' :
            a.severity === 'warning'  ? '#fde68a' : '#bbf7d0'}`,
          borderLeftWidth: 3
        }}>
          <div style={{ color: '#94a3b8', fontSize: 10 * s, marginBottom: 3 }}>{a.time}</div>
          <div style={{ color: textColor, fontWeight: 500 }}>{a.plate} — {a.message}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [selected, setSelected]         = useState(null);
  const [time, setTime]                 = useState(new Date());
  const [showBanner, setShowBanner]     = useState(true);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showAlerts, setShowAlerts]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobile, setMobile]             = useState(isMobile());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings]         = useState(DEFAULT_SETTINGS);
  const prevCriticalCount               = useRef(0);

  const { vehicles, alerts } = useVehicles(settings.warnTemp, settings.criticalTemp, settings.refreshRate);
  const scale = fontScaleMap[settings.fontSize] || 1;
  const theme = THEMES[settings.theme] || THEMES.dark;

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const criticalCount = vehicles.filter(v => v.risk === 'critical').length;
    if (criticalCount > prevCriticalCount.current) {
      playAlertSound(settings.alertSound, settings.alertVolume);
      setShowBanner(true);
    }
    prevCriticalCount.current = criticalCount;
  }, [vehicles, settings.alertSound, settings.alertVolume]);

  const handleSettingsChange = (key, value) => {
    if (key === 'reset') setSettings(DEFAULT_SETTINGS);
    else setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const hasCritical = vehicles.some(v => v.risk === 'critical');
  const TOPBAR_H = 48;
  const STATS_H  = mobile ? 70 : 80;
  const MAP_H    = `calc(100vh - ${TOPBAR_H + STATS_H}px)`;

  const topbarButtons = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ color: '#94a3b8', fontSize: 12 * scale }}>🚗 {vehicles.length}</span>
      <span style={{ color: '#ef4444', fontSize: 12 * scale }}>⚠ {vehicles.filter(v => v.risk === 'critical').length}</span>
      <span style={{ color: '#f59e0b', fontSize: 12 * scale }}>! {vehicles.filter(v => v.risk === 'warning').length}</span>
      <span style={{ color: '#64748b', fontSize: 11 * scale, marginLeft: 4, marginRight: 4 }}>
        🕐 {time.toLocaleTimeString('he-IL')}
      </span>
      {[
        { icon: '🔔', title: 'בדוק צליל', onClick: () => playAlertSound(settings.alertSound, settings.alertVolume) },
        { icon: '📄', title: 'ייצוא PDF', onClick: () => exportPDF(vehicles, alerts), bg: '#3b82f6', color: 'white' },
        { icon: '⛶',  title: 'מסך מלא',  onClick: toggleFullscreen, active: isFullscreen },
        { icon: '⚙️', title: 'הגדרות',   onClick: () => setShowSettings(true) },
      ].map(btn => (
        <button key={btn.title} onClick={btn.onClick} title={btn.title} style={{
          background: btn.bg || (btn.active ? '#334155' : 'none'),
          border: btn.bg ? 'none' : '1px solid #334155',
          borderRadius: 6, color: btn.color || '#94a3b8',
          padding: '5px 9px', cursor: 'pointer', fontSize: 14 * scale,
        }}>{btn.icon}</button>
      ))}
    </div>
  );

  const mobileButtons = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ color: '#64748b', fontSize: 11 }}>🕐 {time.toLocaleTimeString('he-IL')}</span>
      {[
        { icon: '🚗', onClick: () => setShowVehicles(true) },
        { icon: '🔔', onClick: () => setShowAlerts(true), bg: hasCritical ? '#ef4444' : undefined },
        { icon: '📄', onClick: () => exportPDF(vehicles, alerts), bg: '#3b82f6', color: 'white' },
        { icon: '⛶',  onClick: toggleFullscreen, active: isFullscreen },
        { icon: '⚙️', onClick: () => setShowSettings(true) },
      ].map((btn, i) => (
        <button key={i} onClick={btn.onClick} style={{
          background: btn.bg || (btn.active ? '#334155' : 'none'),
          border: btn.bg ? 'none' : '1px solid #334155',
          borderRadius: 6, color: btn.color || '#94a3b8',
          padding: '5px 8px', cursor: 'pointer', fontSize: 13
        }}>{btn.icon}</button>
      ))}
    </div>
  );

  const SidePanel = () => (
    <div style={{ background: theme.sideBg }}>
      <AlertsPanel alerts={alerts} scale={scale} theme={theme} />
      <div style={{ borderTop: `1px solid ${theme.topbarBorder}` }}>
        <TempRangeBar warnTemp={settings.warnTemp} criticalTemp={settings.criticalTemp} theme={theme} />
      </div>
    </div>
  );

  return (
    <div style={{
      fontFamily: fontFamilyMap[settings.fontFamily] || "'Segoe UI', Arial, sans-serif",
      height: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: theme.bg,
    }}>

      {/* Topbar */}
      <div style={{
        height: TOPBAR_H, background: theme.topbar, color: 'white',
        padding: '0 16px', display: 'flex',
        alignItems: 'center', gap: 12, flexShrink: 0,
        borderBottom: `1px solid ${theme.topbarBorder}`
      }}>
        <span style={{ fontWeight: '700', fontSize: 16 * scale }}>🛡 ChildGuard</span>
        {!mobile && (
          <span style={{ color: '#64748b', fontSize: 12 * scale, borderLeft: `1px solid ${theme.topbarBorder}`, paddingLeft: 12 }}>
            מרכז חירום
          </span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          {mobile ? mobileButtons : topbarButtons}
        </div>
      </div>

      {/* באנר קריטי */}
      {hasCritical && showBanner && settings.showBanner && (
        <CriticalBanner
          vehicles={vehicles} scale={scale}
          onSelect={(v) => { setSelected(v); setShowBanner(false); }}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Stats */}
      {settings.showStatsBar && (
        <div style={{ height: STATS_H, flexShrink: 0 }}>
          <StatsBar vehicles={vehicles} alerts={alerts} scale={scale} />
        </div>
      )}

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>

        {!mobile && settings.showVehicleList && (
          <VehicleList vehicles={vehicles} selected={selected}
            onSelect={setSelected} visible={true} onClose={() => {}} />
        )}
        {mobile && (
          <VehicleList vehicles={vehicles} selected={selected}
            onSelect={setSelected} visible={showVehicles}
            onClose={() => setShowVehicles(false)} />
        )}

        {/* Map */}
        <div style={{ flex: 1 }}>
          <MapView
            vehicles={vehicles}
            onSelectVehicle={(v) => { setSelected(v); setShowAlerts(false); }}
            height={MAP_H}
            settings={settings}
          />
        </div>

        {/* Side panel desktop */}
        {!mobile && settings.showAlertsPanel && (
          <div style={{
            width: 320, background: theme.sideBg, flexShrink: 0,
            borderLeft: `1px solid ${theme.topbarBorder}`, overflowY: 'auto'
          }}>
            {selected
              ? <VehiclePanel vehicle={selected} settings={settings} scale={scale} theme={theme} onClose={() => setSelected(null)} />
              : <SidePanel />
            }
          </div>
        )}

        {/* Side panel mobile */}
        {mobile && (selected || showAlerts) && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: theme.sideBg, borderTop: `1px solid ${theme.topbarBorder}`,
            maxHeight: '60vh', overflowY: 'auto', zIndex: 200,
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
          }}>
            {selected
              ? <VehiclePanel vehicle={selected} settings={settings} scale={scale} theme={theme} onClose={() => setSelected(null)} />
              : <SidePanel />
            }
          </div>
        )}
      </div>

      {/* Settings */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}



