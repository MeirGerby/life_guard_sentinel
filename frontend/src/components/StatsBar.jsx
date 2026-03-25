import React from 'react';

function StatCard({ icon, label, value, color, scale }) {
  const s = scale || 1;
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      padding: '8px 16px', display: 'flex',
      alignItems: 'center', gap: 10,
      border: `1px solid ${color}22`, flex: 1, minWidth: 100,
    }}>
      <div style={{
        width: 32 * s, height: 32 * s, borderRadius: 8,
        background: `${color}18`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 16 * s, flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10 * s, color: '#888' }}>{label}</div>
        <div style={{ fontSize: 22 * s, fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

export default function StatsBar({ vehicles, alerts, scale }) {
  return (
    <div style={{
      background: '#f8f9fb', borderBottom: '1px solid #e8e8e8',
      padding: '8px 16px', display: 'flex', gap: 8,
      flexShrink: 0, overflowX: 'auto', height: '100%',
      alignItems: 'center'
    }}>
      <StatCard icon="🚗" label="רכבים פעילים" value={vehicles.length}                                color="#4f46e5" scale={scale} />
      <StatCard icon="🔴" label="קריטי"         value={vehicles.filter(v=>v.risk==='critical').length} color="#ef4444" scale={scale} />
      <StatCard icon="🟡" label="אזהרה"         value={vehicles.filter(v=>v.risk==='warning').length}  color="#f59e0b" scale={scale} />
      <StatCard icon="🟢" label="תקין"          value={vehicles.filter(v=>v.risk==='ok').length}       color="#22c55e" scale={scale} />
      <StatCard icon="🔔" label="התראות היום"   value={alerts.length}                                  color="#64748b" scale={scale} />
    </div>
  );
}