import React, { useState } from 'react';

function formatTime(ms) {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 60)   return `${secs}ש'`;
  if (secs < 3600) return `${Math.floor(secs / 60)}ד'`;
  return `${Math.floor(secs / 3600)}ש"`;
}

const roleColors = {
  'מפקד':    { bg: '#eff6ff', color: '#1d4ed8' },
  'חובשת':   { bg: '#f0fdf4', color: '#15803d' },
  'נהג':     { bg: '#f8fafc', color: '#475569' },
  'מוקדנית': { bg: '#fdf4ff', color: '#7e22ce' },
  'פרמדיק':  { bg: '#fff7ed', color: '#c2410c' },
};

export default function OnlineUsers({ theme, users }) {
  const [expanded, setExpanded] = useState(false);
  const textColor = theme?.sideText || '#1e293b';
  const sideBg    = theme?.sideBg   || '#fff';
  const count     = users?.length || 0;
  const busyCount = users?.filter(u => u.busy).length || 0;
  const freeCount = count - busyCount;

  return (
    <div style={{ background: sideBg }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 16 }}>👥</span>
            <div style={{
              position: 'absolute', top: -2, right: -4,
              width: 8, height: 8, borderRadius: '50%',
              background: '#22c55e',
            }} />
          </div>
          <span style={{ fontWeight: '700', fontSize: 13, color: textColor }}>
            מחוברים עכשיו
          </span>
          <span style={{
            background: '#22c55e', color: 'white',
            borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: '700'
          }}>{count}</span>
          {busyCount > 0 && (
            <span style={{
              background: '#f59e0b', color: 'white',
              borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: '700'
            }}>{busyCount} עסוק</span>
          )}
        </div>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ paddingBottom: 8 }}>
          {/* סיכום */}
          <div style={{
            display: 'flex', gap: 8, padding: '6px 14px 10px',
            borderBottom: `1px solid ${theme?.topbarBorder || '#f1f5f9'}`,
          }}>
            <div style={{
              flex: 1, textAlign: 'center', padding: '6px',
              background: '#f0fdf4', borderRadius: 8,
            }}>
              <div style={{ fontSize: 16, fontWeight: '700', color: '#22c55e' }}>{freeCount}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>פנויים</div>
            </div>
            <div style={{
              flex: 1, textAlign: 'center', padding: '6px',
              background: '#fffbeb', borderRadius: 8,
            }}>
              <div style={{ fontSize: 16, fontWeight: '700', color: '#f59e0b' }}>{busyCount}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>עסוקים</div>
            </div>
          </div>

          {users?.map(u => {
            const roleStyle = roleColors[u.role] || { bg: '#f8fafc', color: '#475569' };
            return (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px',
                borderBottom: `1px solid ${theme?.topbarBorder || '#f1f5f9'}`,
                opacity: u.busy ? 0.85 : 1,
              }}>
                {/* אווטאר */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: roleStyle.bg, color: roleStyle.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: '700', flexShrink: 0,
                  border: `1px solid ${roleStyle.color}33`,
                  position: 'relative',
                }}>
                  {u.avatar}
                  {u.busy && (
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 10, height: 10, borderRadius: '50%',
                      background: '#f59e0b', border: '1.5px solid white',
                      fontSize: 6, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white',
                    }}>!</div>
                  )}
                </div>

                {/* פרטים */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: '600', color: textColor }}>{u.name}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{formatTime(u.connectedAt)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 4,
                      background: roleStyle.bg, color: roleStyle.color, fontWeight: 600
                    }}>{u.role}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.station}
                    </span>
                  </div>
                </div>

                {/* סטטוס */}
                <div style={{
                  fontSize: 10, fontWeight: '600', padding: '2px 8px',
                  borderRadius: 10, flexShrink: 0,
                  background: u.busy ? '#fffbeb' : '#f0fdf4',
                  color: u.busy ? '#f59e0b' : '#22c55e',
                  border: `1px solid ${u.busy ? '#fde68a' : '#bbf7d0'}`,
                }}>
                  {u.busy ? 'לא פנוי' : 'פנוי'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}