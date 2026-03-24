import React, { useState } from 'react';

export default function SettingsPanel({ settings, onChange, onClose }) {
  const [tab, setTab] = useState('display');
  const [previewMsg, setPreviewMsg] = useState('');

  const tabs = [
    { key: 'display', label: '🎨 תצוגה' },
    { key: 'map',     label: '🗺️ מפה' },
    { key: 'alerts',  label: '🔔 התראות' },
    { key: 'font',    label: '🔤 גופן' },
  ];

  function previewSound(type, volume) {
    if (type === 'none') {
      setPreviewMsg('🔇 אין צליל');
      setTimeout(() => setPreviewMsg(''), 2000);
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const vol = (volume || 80) / 100;
    setPreviewMsg('▶ מנגן...');
    setTimeout(() => setPreviewMsg(''), 2000);

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
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.1);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: 540,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          background: '#0f172a', color: 'white',
          padding: '16px 20px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: 16 }}>⚙️ הגדרות</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>התאם את הדשבורד לצרכיך</div>
          </div>
          <button onClick={onClose} style={{
            background: '#1e293b', border: 'none', borderRadius: 8,
            color: '#94a3b8', padding: '6px 12px', cursor: 'pointer', fontSize: 13
          }}>✕ סגור</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0', flexShrink: 0
        }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: tab === t.key ? '600' : '400',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#0f172a' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>

          {/* תצוגה */}
          {tab === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <Section title="ערכת צבעים">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'dark',  label: 'כהה',        colors: ['#0f172a', '#1e293b', '#3b82f6'], preview: 'רקע כהה מקצועי' },
                    { key: 'light', label: 'בהיר',        colors: ['#ffffff', '#f8fafc', '#3b82f6'], preview: 'רקע בהיר נקי' },
                    { key: 'red',   label: 'חירום אדום',  colors: ['#1a0000', '#3d0000', '#ef4444'], preview: 'מצב חירום' },
                    { key: 'green', label: 'ירוק לילה',   colors: ['#001a0a', '#003d1a', '#22c55e'], preview: 'תצוגת לילה' },
                  ].map(theme => (
                    <div key={theme.key} onClick={() => onChange('theme', theme.key)} style={{
                      border: `2px solid ${settings.theme === theme.key ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                      background: settings.theme === theme.key ? '#eff6ff' : '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {theme.colors.map((c, i) => (
                            <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{theme.label}</span>
                        {settings.theme === theme.key && <span style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: 12 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{theme.preview}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="פאנלים גלויים">
                <Toggle label="🚗 רשימת רכבים" value={settings.showVehicleList} onChange={v => onChange('showVehicleList', v)}
                  preview={settings.showVehicleList ? '✅ מוצג בצד שמאל' : '❌ מוסתר'} />
                <Toggle label="🔔 פאנל התראות" value={settings.showAlertsPanel} onChange={v => onChange('showAlertsPanel', v)}
                  preview={settings.showAlertsPanel ? '✅ מוצג בצד ימין' : '❌ מוסתר'} />
                <Toggle label="📊 סטטיסטיקות" value={settings.showStatsBar} onChange={v => onChange('showStatsBar', v)}
                  preview={settings.showStatsBar ? '✅ מוצג מעל המפה' : '❌ מוסתר — מפה גדולה יותר'} />
                <Toggle label="🚨 באנר קריטי" value={settings.showBanner} onChange={v => onChange('showBanner', v)}
                  preview={settings.showBanner ? '✅ מוצג בזמן חירום' : '❌ מוסתר'} />
              </Section>

              <Section title="קצב ריענון נתונים">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min="2" max="30" value={settings.refreshRate}
                    onChange={e => onChange('refreshRate', Number(e.target.value))}
                    style={{ flex: 1 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', minWidth: 80 }}>
                    כל {settings.refreshRate} שנ'
                  </span>
                </div>
                <PreviewBox>
                  {settings.refreshRate <= 5
                    ? '⚡ ריענון מהיר — עדכונים בזמן אמת'
                    : settings.refreshRate <= 15
                    ? '🔄 ריענון בינוני — חיסכון בביצועים'
                    : '🐢 ריענון איטי — חיסכון מקסימלי'}
                </PreviewBox>
              </Section>

            </div>
          )}

          {/* מפה */}
          {tab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <Section title="סגנון מפה">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'street',    label: 'רחובות',    emoji: '🏙️', desc: 'מפת רחובות רגילה' },
                    { key: 'satellite', label: 'לוויין',     emoji: '🛰️', desc: 'תמונות לוויין אמיתיות' },
                    { key: 'dark',      label: 'כהה',        emoji: '🌑', desc: 'מתאים לשימוש לילי' },
                    { key: 'terrain',   label: 'טופוגרפי',   emoji: '⛰️', desc: 'הצגת פני שטח' },
                  ].map(s => (
                    <div key={s.key} onClick={() => onChange('mapStyle', s.key)} style={{
                      border: `2px solid ${settings.mapStyle === s.key ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 10, padding: '12px', cursor: 'pointer', textAlign: 'center',
                      background: settings.mapStyle === s.key ? '#eff6ff' : '#fff'
                    }}>
                      <div style={{ fontSize: 28 }}>{s.emoji}</div>
                      <div style={{ fontSize: 12, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{s.desc}</div>
                      {settings.mapStyle === s.key && (
                        <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 4, fontWeight: 600 }}>✓ פעיל</div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="הגדרות מפה">
                <Toggle label="🚗 הצג מרקרים" value={settings.showMarkers} onChange={v => onChange('showMarkers', v)}
                  preview={settings.showMarkers ? '✅ רכבים גלויים על המפה' : '❌ מרקרים מוסתרים'} />
                <Toggle label="💫 אנימציה על מרקרים קריטיים" value={settings.animateMarkers} onChange={v => onChange('animateMarkers', v)}
                  preview={settings.animateMarkers ? '✅ מרקרים קריטיים מהבהבים' : '❌ ללא אנימציה'} />
                <Toggle label="📍 מרכז מפה אוטומטי" value={settings.autoCenter} onChange={v => onChange('autoCenter', v)}
                  preview={settings.autoCenter ? '✅ המפה ממורכזת על הרכבים' : '❌ מיקום ידני'} />
              </Section>

              <Section title="זום ברירת מחדל">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min="10" max="18" value={settings.defaultZoom}
                    onChange={e => onChange('defaultZoom', Number(e.target.value))}
                    style={{ flex: 1 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', minWidth: 40 }}>
                    {settings.defaultZoom}x
                  </span>
                </div>
                <PreviewBox>
                  {settings.defaultZoom <= 12
                    ? '🌍 תצוגה רחבה — רואים את כל העיר'
                    : settings.defaultZoom <= 15
                    ? '🏘️ תצוגת שכונה — איזון טוב'
                    : '🔍 זום קרוב — פרטי רחוב'}
                </PreviewBox>
              </Section>

            </div>
          )}

          {/* התראות */}
          {tab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <Section title="סוג צליל התראה">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'beep',  label: 'צפצוף קצר', desc: '3 ביפים קצרים', emoji: '🔔' },
                    { key: 'alarm', label: 'אזעקה',      desc: 'צליל עולה-יורד חוזר', emoji: '🚨' },
                    { key: 'siren', label: 'סירנה',       desc: 'צליל ממושך עולה-יורד', emoji: '🚒' },
                    { key: 'none',  label: 'שקט',         desc: 'ללא צליל בכלל', emoji: '🔇' },
                  ].map(sound => (
                    <div key={sound.key} style={{
                      border: `2px solid ${settings.alertSound === sound.key ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                      background: settings.alertSound === sound.key ? '#eff6ff' : '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                        onClick={() => onChange('alertSound', sound.key)}>
                        <span style={{ fontSize: 20 }}>{sound.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{sound.label}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{sound.desc}</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); previewSound(sound.key, settings.alertVolume); }}
                          style={{
                            background: '#3b82f6', border: 'none', borderRadius: 6,
                            color: 'white', padding: '4px 10px', cursor: 'pointer',
                            fontSize: 11, fontWeight: 600
                          }}>▶ נגן</button>
                        {settings.alertSound === sound.key && (
                          <span style={{ color: '#3b82f6', fontSize: 16 }}>✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {previewMsg && (
                  <PreviewBox color="#eff6ff" border="#3b82f6">{previewMsg}</PreviewBox>
                )}
              </Section>

              <Section title="עוצמת צליל">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>🔈</span>
                  <input type="range" min="0" max="100" value={settings.alertVolume}
                    onChange={e => onChange('alertVolume', Number(e.target.value))}
                    style={{ flex: 1 }} />
                  <span style={{ fontSize: 18 }}>🔊</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', minWidth: 40 }}>
                    {settings.alertVolume}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <button
                    onClick={() => previewSound(settings.alertSound, settings.alertVolume)}
                    style={{
                      background: '#0f172a', border: 'none', borderRadius: 8,
                      color: 'white', padding: '7px 16px', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600
                    }}>▶ נגן עם עוצמה זו</button>
                  <PreviewBox inline>
                    {settings.alertVolume === 0 ? '🔇 שקט' :
                     settings.alertVolume < 30 ? '🔉 נמוך' :
                     settings.alertVolume < 70 ? '🔔 בינוני' : '🔊 גבוה'}
                  </PreviewBox>
                </div>
              </Section>

              <Section title="סף טמפרטורה להתראה">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>⚠ סף אזהרה</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{settings.warnTemp}°C</span>
                  </div>
                  <input type="range" min="25" max="40" value={settings.warnTemp}
                    onChange={e => onChange('warnTemp', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }} />
                  <PreviewBox color="#fffbeb" border="#fde68a">
                    🌡 מעל {settings.warnTemp}°C — יוצג כ"אזהרה" (צהוב)
                  </PreviewBox>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>🔴 סף קריטי</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{settings.criticalTemp}°C</span>
                  </div>
                  <input type="range" min="35" max="55" value={settings.criticalTemp}
                    onChange={e => onChange('criticalTemp', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ef4444' }} />
                  <PreviewBox color="#fff1f2" border="#fecaca">
                    🚨 מעל {settings.criticalTemp}°C — יוצג כ"קריטי" ויופעל צליל חירום
                  </PreviewBox>
                </div>
              </Section>

            </div>
          )}

          {/* גופן */}
          {tab === 'font' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <Section title="גופן ממשק">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'segoe', label: 'Segoe UI',  family: "'Segoe UI', sans-serif" },
                    { key: 'arial', label: 'Arial',      family: 'Arial, sans-serif' },
                    { key: 'mono',  label: 'Monospace',  family: 'monospace' },
                    { key: 'rubik', label: 'Rubik',       family: 'Rubik, sans-serif' },
                  ].map(font => (
                    <div key={font.key} onClick={() => onChange('fontFamily', font.key)} style={{
                      border: `2px solid ${settings.fontFamily === font.key ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: settings.fontFamily === font.key ? '#eff6ff' : '#fff'
                    }}>
                      <div>
                        <div style={{ fontSize: 16, fontFamily: font.family, fontWeight: 500 }}>
                          ChildGuard Dashboard — 123-45-678
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: font.family }}>
                          רכבים פעילים · התראות · מרכז חירום
                        </div>
                      </div>
                      {settings.fontFamily === font.key && (
                        <span style={{ color: '#3b82f6', fontSize: 16, marginLeft: 8 }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="גודל טקסט">
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { key: 'sm', label: 'קטן',   px: '12px' },
                    { key: 'md', label: 'בינוני', px: '14px' },
                    { key: 'lg', label: 'גדול',   px: '16px' },
                    { key: 'xl', label: 'ענק',    px: '18px' },
                  ].map(s => (
                    <div key={s.key} onClick={() => onChange('fontSize', s.key)} style={{
                      flex: 1, textAlign: 'center', padding: '10px 6px',
                      border: `2px solid ${settings.fontSize === s.key ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: settings.fontSize === s.key ? '#eff6ff' : '#fff'
                    }}>
                      <div style={{ fontSize: s.px, fontWeight: 600 }}>Aa</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.px}</div>
                    </div>
                  ))}
                </div>
                <PreviewBox>
                  <span style={{ fontSize: { sm: '12px', md: '14px', lg: '16px', xl: '18px' }[settings.fontSize] }}>
                    זהו גודל הטקסט שיוצג בדשבורד
                  </span>
                </PreviewBox>
              </Section>

            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexShrink: 0, background: '#f8fafc'
        }}>
          <button onClick={() => onChange('reset', true)} style={{
            background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '7px 14px', cursor: 'pointer', fontSize: 12, color: '#64748b'
          }}>↩ איפוס ברירת מחדל</button>
          <button onClick={onClose} style={{
            background: '#3b82f6', border: 'none', borderRadius: 8,
            color: 'white', padding: '7px 20px', cursor: 'pointer',
            fontSize: 13, fontWeight: '600'
          }}>✓ שמור וסגור</button>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: '700', color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10, paddingBottom: 6,
        borderBottom: '1px solid #f1f5f9'
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function Toggle({ label, value, onChange, preview }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
        <span style={{ fontSize: 13, color: '#1e293b' }}>{label}</span>
        <div onClick={() => onChange(!value)} style={{
          width: 40, height: 22, borderRadius: 11,
          background: value ? '#3b82f6' : '#cbd5e1',
          position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: 'white',
            position: 'absolute', top: 2, left: value ? 20 : 2,
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
        </div>
      </div>
      {preview && <PreviewBox>{preview}</PreviewBox>}
    </div>
  );
}

function PreviewBox({ children, color, border, inline }) {
  if (inline) return (
    <span style={{
      fontSize: 12, color: '#3b82f6', fontWeight: 500, padding: '4px 10px',
      background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe'
    }}>{children}</span>
  );
  return (
    <div style={{
      fontSize: 12, color: '#475569', padding: '8px 12px',
      background: color || '#f8fafc',
      border: `1px solid ${border || '#e2e8f0'}`,
      borderRadius: 8, marginTop: 4
    }}>{children}</div>
  );
}