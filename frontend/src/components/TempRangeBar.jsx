import React from 'react';

export default function TempRangeBar({ warnTemp, criticalTemp }) {
  const min = 20;
  const max = 60;
  const range = max - min;

  const warnPct     = ((warnTemp - min) / range) * 100;
  const criticalPct = ((criticalTemp - min) / range) * 100;

  const zones = [
    { label: '✅ תקין',   from: min,          to: warnTemp,     color: '#22c55e', bg: '#f0fdf4' },
    { label: '⚠ אזהרה',  from: warnTemp,     to: criticalTemp, color: '#f59e0b', bg: '#fffbeb' },
    { label: '🔴 קריטי', from: criticalTemp, to: max,          color: '#ef4444', bg: '#fff1f2' },
  ];

  return (
    <div style={{ padding: '14px 14px 12px' }}>

      {/* כותרת */}
      <div style={{ fontWeight: '700', fontSize: 13, color: '#1e293b', marginBottom: 12 }}>
        🌡 טווחי טמפרטורה
      </div>

      {/* סרגל צבעוני */}
      <div style={{ position: 'relative', height: 28, borderRadius: 14, overflow: 'hidden', marginBottom: 8, display: 'flex' }}>
        <div style={{ width: `${warnPct}%`, background: '#22c55e' }} />
        <div style={{ width: `${criticalPct - warnPct}%`, background: '#f59e0b' }} />
        <div style={{ flex: 1, background: '#ef4444' }} />

        {/* סמן אזהרה */}
        <div style={{
          position: 'absolute', left: `${warnPct}%`,
          top: 0, bottom: 0, width: 2, background: 'white',
          transform: 'translateX(-50%)'
        }} />
        {/* סמן קריטי */}
        <div style={{
          position: 'absolute', left: `${criticalPct}%`,
          top: 0, bottom: 0, width: 2, background: 'white',
          transform: 'translateX(-50%)'
        }} />
      </div>

      {/* תוויות מתחת לסרגל */}
      <div style={{ position: 'relative', height: 16, marginBottom: 14 }}>
        <span style={{ position: 'absolute', left: 0, fontSize: 10, color: '#94a3b8' }}>{min}°</span>
        <span style={{ position: 'absolute', left: `${warnPct}%`, fontSize: 10, color: '#f59e0b', fontWeight: 700, transform: 'translateX(-50%)' }}>{warnTemp}°</span>
        <span style={{ position: 'absolute', left: `${criticalPct}%`, fontSize: 10, color: '#ef4444', fontWeight: 700, transform: 'translateX(-50%)' }}>{criticalTemp}°</span>
        <span style={{ position: 'absolute', right: 0, fontSize: 10, color: '#94a3b8' }}>{max}°</span>
      </div>

      {/* טבלת טווחים */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {zones.map(z => (
          <div key={z.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 8,
            background: z.bg, border: `1px solid ${z.color}33`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: z.color }}>{z.label}</span>
            </div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              {z.from}° — {z.to === max ? `${max}°+` : `${z.to}°`}
            </span>
          </div>
        ))}
      </div>

      {/* הסבר */}
      <div style={{
        marginTop: 10, padding: '8px 10px', borderRadius: 8,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        fontSize: 11, color: '#64748b', lineHeight: 1.5
      }}>
        💡 הטווחים מתעדכנים לפי הגדרות ההתראות שלך
      </div>
    </div>
  );
}