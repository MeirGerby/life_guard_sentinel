import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORIES = [
  { key: 'vehicles',  label: 'רכבים',         icon: '🚗' },
  { key: 'alerts',    label: 'התראות',         icon: '🔔' },
  { key: 'drivers',   label: 'נהגים',          icon: '👤' },
  { key: 'incidents', label: 'אירועים',        icon: '🚨' },
  { key: 'forces',    label: 'כוחות ביטחון',  icon: '🛡' },
];

export default function PrintModal({ onClose, vehicles, alerts, incidentLog, onlineUsers }) {
  const [category, setCategory]     = useState(null);
  const [selected, setSelected]     = useState([]);
  const [selectAll, setSelectAll]   = useState(false);
  const [generating, setGenerating] = useState(false);

  const getItems = (cat) => {
    if (cat === 'vehicles') return vehicles.map(v => ({
      id: v.id,
      label: `${v.plate} — ${v.ownerName || '--'}`,
      sub: `${v.temp}°C · ${v.risk === 'critical' ? 'קריטי' : v.risk === 'warning' ? 'אזהרה' : 'תקין'}`,
      data: v,
    }));

    if (cat === 'alerts') return alerts.map((a, i) => ({
      id: `alert-${i}`,
      label: `${a.plate} — ${a.message}`,
      sub: `${a.time} · ${a.severity === 'critical' ? 'קריטי' : a.severity === 'warning' ? 'אזהרה' : 'נפתר'}`,
      data: a,
    }));

    if (cat === 'drivers') return vehicles.map(v => ({
      id: `driver-${v.id}`,
      label: v.ownerName || 'לא ידוע',
      sub: `${v.plate} · ${v.ownerPhone || '--'}`,
      data: v,
    }));

    if (cat === 'incidents') {
      // קבץ לוג לפי אירועים
      const grouped = {};
      (incidentLog || []).forEach(entry => {
        const key = entry.vehicleId || 'unknown';
        if (!grouped[key]) grouped[key] = { vehicleId: key, plate: entry.plate, entries: [], openedAt: entry.timestamp };
        grouped[key].entries.push(entry);
      });
      return Object.values(grouped).map((inc, i) => ({
        id: `inc-group-${i}`,
        label: `רכב ${inc.plate || inc.vehicleId}`,
        sub: `נפתח: ${inc.openedAt || '--'} · ${inc.entries.length} פעולות`,
        data: inc,
      }));
    }

    if (cat === 'forces') {
      return (onlineUsers || []).map(u => {
        // מצא את כל האירועים שהמשתמש הזה היה מעורב בהם
        const userEvents = (incidentLog || []).filter(e => e.user === u.name || e.userId === u.id);
        return {
          id: u.id,
          label: `${u.name} — ${u.role}`,
          sub: `${u.station} · ${userEvents.length} אירועים`,
          data: { user: u, events: userEvents },
        };
      });
    }

    return [];
  };

  const items = category ? getItems(category) : [];

  const handleSelectAll = () => {
    if (selectAll) { setSelected([]); setSelectAll(false); }
    else { setSelected(items.map(i => i.id)); setSelectAll(true); }
  };

  const toggleItem = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handlePrint = async () => {
    if (selected.length === 0) return;
    setGenerating(true);

    const doc = new jsPDF();
    const now = new Date().toLocaleString('en-GB');
    const catLabel = CATEGORIES.find(c => c.key === category)?.label || '';
    const selectedItems = items.filter(i => selected.includes(i.id));

    doc.setFontSize(18);
    doc.text(`ChildGuard — דוח ${catLabel}`, 14, 20);
    doc.setFontSize(11); doc.setTextColor(120);
    doc.text(`Generated: ${now}  |  ${selectedItems.length} פריטים`, 14, 28);
    doc.setTextColor(0);

    if (category === 'vehicles') {
      autoTable(doc, {
        startY: 38,
        head: [['מזהה רכב', 'בעלים', 'טלפון', 'טמפרטורה', 'מנוע', 'ילד', 'מרחק הורה', 'סיכון', 'ציון', 'גל חום', 'המלצה']],
        body: selectedItems.map(i => {
          const v = i.data;
          return [
            v.plate, v.ownerName || '--', v.ownerPhone || '--', `${v.temp}°C`,
            v.engine ? 'דלוק' : 'כבוי',
            v.motion ? 'זוהה' : 'לא זוהה',
            v.parentDistance ? `${Math.round(v.parentDistance)}m` : '--',
            v.risk === 'critical' ? 'קריטי' : v.risk === 'warning' ? 'אזהרה' : 'תקין',
            `${v.riskScore || 0}/100`,
            v.isHeatwave ? 'כן' : 'לא',
            v.recommendation || '--',
          ];
        }),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
    }

    if (category === 'alerts') {
      autoTable(doc, {
        startY: 38,
        head: [['זמן', 'רכב', 'הודעה', 'חומרה']],
        body: selectedItems.map(i => {
          const a = i.data;
          return [a.time, a.plate, a.message, a.severity === 'critical' ? 'קריטי' : a.severity === 'warning' ? 'אזהרה' : 'נפתר'];
        }),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
    }

    if (category === 'drivers') {
      autoTable(doc, {
        startY: 38,
        head: [['שם בעלים', 'טלפון', 'מזהה רכב', 'טמפרטורה', 'סיכון', 'מרחק']],
        body: selectedItems.map(i => {
          const v = i.data;
          return [v.ownerName || '--', v.ownerPhone || '--', v.plate, `${v.temp}°C`, v.risk === 'critical' ? 'קריטי' : v.risk === 'warning' ? 'אזהרה' : 'תקין', v.parentDistance ? `${Math.round(v.parentDistance)}m` : '--'];
        }),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
    }

    if (category === 'incidents') {
      let currentY = 38;
      for (const item of selectedItems) {
        const inc = item.data;
        const plate = inc.plate || inc.vehicleId;

        // כותרת אירוע
        doc.setFontSize(13); doc.setTextColor(15, 23, 42);
        doc.text(`אירוע — רכב ${plate}`, 14, currentY);
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`נפתח: ${inc.openedAt || '--'}`, 14, currentY + 6);

        // מי היה פנוי באותו זמן
        const freeUsers = (onlineUsers || []).filter(u => {
          const userBusyEvents = (incidentLog || []).filter(e => (e.user === u.name || e.userId === u.id) && (e.newStatus === 'dispatched' || e.newStatus === 'handling'));
          return userBusyEvents.length === 0;
        });

        doc.setFontSize(10); doc.setTextColor(34, 197, 94);
        const freeStr = freeUsers.length > 0
          ? `פנויים באותו זמן: ${freeUsers.map(u => `${u.name} (${u.role})`).join(', ')}`
          : 'לא היו כוחות פנויים';
        doc.text(freeStr, 14, currentY + 13);

        currentY += 22;

        // פעולות האירוע
        autoTable(doc, {
          startY: currentY,
          head: [['זמן', 'פעולה', 'משתמש', 'תפקיד', 'תחנה']],
          body: inc.entries.map(e => [e.timestamp, e.action || '--', e.user || '--', e.role || '--', e.station || '--']),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [15, 23, 42] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 16;

        if (currentY > 250 && selectedItems.indexOf(item) < selectedItems.length - 1) {
          doc.addPage();
          currentY = 20;
        }
      }
    }

    if (category === 'forces') {
      let currentY = 38;
      for (const item of selectedItems) {
        const { user, events } = item.data;

        doc.setFontSize(13); doc.setTextColor(15, 23, 42);
        doc.text(`${user.name} — ${user.role}`, 14, currentY);
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`תחנה: ${user.station}  |  סה"כ אירועים: ${events.length}`, 14, currentY + 6);
        currentY += 16;

        if (events.length === 0) {
          doc.setFontSize(10); doc.setTextColor(150);
          doc.text('לא יצא לאירועים', 14, currentY);
          currentY += 12;
        } else {
          autoTable(doc, {
            startY: currentY,
            head: [['זמן', 'רכב', 'פעולה', 'סטטוס']],
            body: events.map(e => [
              e.timestamp,
              e.plate || '--',
              e.action || '--',
              e.newStatus === 'dispatched' ? 'יצא לזירה' :
              e.newStatus === 'handling'   ? 'בטיפול' :
              e.newStatus === 'resolved'   ? 'טופל' : '--',
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [15, 23, 42] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 14, right: 14 },
          });
          currentY = doc.lastAutoTable.finalY + 14;
        }

        if (currentY > 250 && selectedItems.indexOf(item) < selectedItems.length - 1) {
          doc.addPage();
          currentY = 20;
        }
      }
    }

    doc.save(`childguard-${category}-${Date.now()}.pdf`);
    setGenerating(false);
    onClose();
  };

  return (
    <>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }`}</style>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, padding: 24, width: 540, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.2s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>📄 הדפסת דוח</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {!category ? 'בחר קטגוריה' : `בחר פריטים מתוך ${items.length}`}
              </div>
            </div>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 16, color: '#64748b' }}>✕</button>
          </div>

          {/* קטגוריות */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => { setCategory(cat.key); setSelected([]); setSelectAll(false); }} style={{
                padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                border: category === cat.key ? '2px solid #3b82f6' : '1.5px solid #e2e8f0',
                background: category === cat.key ? '#eff6ff' : '#f8fafc',
                color: category === cat.key ? '#1d4ed8' : '#475569',
                fontWeight: category === cat.key ? '700' : '500',
                fontSize: 11, transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* רשימת פריטים */}
          {category && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: '600', color: '#1e293b' }}>{selected.length} / {items.length} נבחרו</div>
                <button onClick={handleSelectAll} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#64748b' }}>
                  {selectAll ? 'בטל הכל' : 'בחר הכל'}
                </button>
              </div>

              <div style={{ overflowY: 'auto', maxHeight: 280, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                {items.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>אין פריטים להצגה</div>
                ) : items.map(item => (
                  <div key={item.id} onClick={() => toggleItem(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: selected.includes(item.id) ? '#eff6ff' : 'white',
                    transition: 'background 0.1s',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: selected.includes(item.id) ? 'none' : '1.5px solid #cbd5e1',
                      background: selected.includes(item.id) ? '#3b82f6' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: 'white', fontWeight: '700',
                    }}>{selected.includes(item.id) ? '✓' : ''}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: '500', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* כפתורים */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: '500' }}>ביטול</button>
            <button onClick={handlePrint} disabled={selected.length === 0 || generating} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: selected.length === 0 ? '#e2e8f0' : '#3b82f6',
              color: selected.length === 0 ? '#94a3b8' : 'white',
              cursor: selected.length === 0 ? 'default' : 'pointer',
              fontSize: 13, fontWeight: '600', transition: 'background 0.2s',
            }}>
              {generating ? '⏳ מייצר PDF...' : `📄 הדפס (${selected.length})`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}