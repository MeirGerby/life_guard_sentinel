import React from 'react';
import OnlineUsers from './OnlineUsers';

const riskLabel = { critical: 'קריטי', warning: 'אזהרה', ok: 'תקין' };
const riskColor = { critical: '#ef4444', warning: '#f59e0b', ok: '#22c55e' };
const riskBg    = { critical: '#fff0f0', warning: '#fffbe6', ok: '#f0fff4' };

export default function VehicleList({ vehicles, selected, onSelect, visible, onClose, theme, onlineUsers }) {
  return (
    <>
      {visible && (
        <div onClick={onClose} style={{
          display: window.innerWidth < 768 ? 'block' : 'none',
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 99
        }}/>
      )}
      <div style={{
        width: 240,
        borderRight: `1px solid ${theme?.topbarBorder || '#e8e8e8'}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        position: window.innerWidth < 768 ? 'fixed' : 'relative',
        top: window.innerWidth < 768 ? 0 : 'auto',
        left: window.innerWidth < 768 ? 0 : 'auto',
        height: window.innerWidth < 768 ? '100%' : 'auto',
        zIndex: window.innerWidth < 768 ? 100 : 'auto',
        transform: window.innerWidth < 768
          ? visible ? 'translateX(0)' : 'translateX(-100%)'
          : 'none',
        transition: 'transform 0.3s ease',
        background: theme?.sideBg || '#fff',
      }}>

        {/* כותרת */}
        <div style={{
          padding: '10px 14px', flexShrink: 0,
          borderBottom: `1px solid ${theme?.topbarBorder || '#e8e8e8'}`,
          fontWeight: '600', fontSize: 13,
          color: theme?.sideText || '#333',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: theme?.sideBg || '#f8f9fb',
        }}>
          <span>🚗 רכבים פעילים ({vehicles.length})</span>
          {window.innerWidth < 768 && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              fontSize: 16, cursor: 'pointer', color: '#888'
            }}>✕</button>
          )}
        </div>

        {/* רשימת רכבים */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {vehicles.map(v => (
            <div key={v.id}
              onClick={() => { onSelect(v); if (window.innerWidth < 768) onClose(); }}
              style={{
                padding: '9px 14px',
                borderBottom: `1px solid ${theme?.topbarBorder || '#f0f0f0'}`,
                cursor: 'pointer',
                background: selected?.id === v.id ? '#f0f4ff' : theme?.sideBg || 'white',
                borderLeft: `3px solid ${riskColor[v.risk]}`,
                transition: 'background 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: 13, color: theme?.sideText || '#1e293b' }}>
                  {v.plate}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 7px',
                  borderRadius: 10, background: riskBg[v.risk], color: riskColor[v.risk]
                }}>{riskLabel[v.risk]}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {v.ownerName || v.model}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 500,
                  color: v.temp > 38 ? '#ef4444' : v.temp > 32 ? '#f59e0b' : '#555'
                }}>🌡 {v.temp}°C</div>
              </div>
            </div>
          ))}
        </div>

        {/* משתמשים מחוברים */}
        <div style={{ flexShrink: 0, borderTop: `1px solid ${theme?.topbarBorder || '#e8e8e8'}` }}>
          <OnlineUsers theme={theme} users={onlineUsers} />
        </div>
      </div>
    </>
  );
}