import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const typeTheme = {
  success: { 
    bg: '#f0f9ff', 
    bd: '#0ea5e9', 
    fg: '#0369a1',
    icon: '✅',
    accent: '#0ea5e9'
  },
  info: { 
    bg: '#f0f9ff', 
    bd: '#3b82f6', 
    fg: '#1e40af',
    icon: 'ℹ️',
    accent: '#3b82f6'
  },
  warning: { 
    bg: '#fffbeb', 
    bd: '#f59e0b', 
    fg: '#d97706',
    icon: '⚠️',
    accent: '#f59e0b'
  },
  error: { 
    bg: '#fef2f2', 
    bd: '#ef4444', 
    fg: '#dc2626',
    icon: '❌',
    accent: '#ef4444'
  },
  default: { 
    bg: '#f8fafc', 
    bd: '#64748b', 
    fg: '#334155',
    icon: '📢',
    accent: '#64748b'
  },
  announcement: { 
    bg: '#f0f9ff', 
    bd: '#0ea5e9', 
    fg: '#0369a1',
    icon: '📢',
    accent: '#0ea5e9'
  },
};

function ProgressBar({ duration, accentColor }) {
  if (!duration || duration <= 0) return null;
  return (
    <div style={{ 
      height: 4, 
      background: 'rgba(0,0,0,0.06)', 
      width: '100%', 
      marginTop: 12,
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div
        style={{
          height: '100%',
          width: '100%',
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`,
          transformOrigin: 'left',
          animation: `nt-progress ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
          borderRadius: '2px',
        }}
      />
      <style>{`
        @keyframes nt-progress { 
          from { transform: scaleX(1) } 
          to { transform: scaleX(0) } 
        }
      `}</style>
    </div>
  );
}

export default function NotificationToaster() {
  const { activeToasts, dismiss, connectionStatus } = useNotifications();

  return (
    <>
      {/* Connection indicator (minimal) */}
      <div
        style={{
          position: 'fixed',
          top: 8,
          right: 8,
          zIndex: 2147483647,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor:
              connectionStatus.state === 'connected' ? '#10b981' :
              connectionStatus.state === 'reconnecting' || connectionStatus.state === 'connecting' ? '#f59e0b' :
              connectionStatus.state === 'failed' ? '#ef4444' : '#9ca3af',
            boxShadow: '0 0 0 2px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.15)',
            border: '2px solid white',
            transition: 'all 0.3s ease',
          }}
          title={`Notifications: ${connectionStatus.state}`}
        />
      </div>

      {/* Toast stack */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          width: 'min(92vw, 400px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 2147483646,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {activeToasts.map((t) => {
          const theme = typeTheme[t.type] || typeTheme.default;
          return (
            <div
              key={t.id}
              role="status"
              style={{
                background: theme.bg,
                color: theme.fg,
                border: `1px solid ${theme.bd}`,
                borderRadius: '16px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                padding: '20px',
                transform: 'translateX(0)',
                animation: 'nt-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(10px)',
                borderLeft: `4px solid ${theme.accent}`,
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ 
                  fontSize: '24px', 
                  marginTop: '2px',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}>
                  {theme.icon}
                </div>
                <div style={{ fontWeight: 600, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: theme.fg }}>{t.title}</span>
                    <button
                      onClick={() => dismiss(t.id)}
                      aria-label="Close notification"
                      style={{
                        pointerEvents: 'auto',
                        border: 'none',
                        background: 'rgba(0,0,0,0.05)',
                        color: theme.fg,
                        fontSize: '20px',
                        lineHeight: 1,
                        cursor: 'pointer',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        fontWeight: 'bold',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0,0,0,0.1)';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0,0,0,0.05)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {t.message && (
                    <div style={{ 
                      fontWeight: '500', 
                      fontSize: '14px', 
                      marginTop: '8px', 
                      color: theme.fg,
                      lineHeight: '1.4',
                      opacity: '0.9'
                    }}>
                      {t.message}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      opacity: '0.7',
                      fontWeight: '500',
                      color: theme.fg
                    }}>
                      {formatTime(t.timestamp)}
                    </span>
                    {t.link && (
                      <button
                        onClick={() => (window.location.href = t.link)}
                        style={{
                          pointerEvents: 'auto',
                          border: 'none',
                          background: 'transparent',
                          color: theme.fg,
                          textDecoration: 'underline',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    )}
                  </div>
                  <ProgressBar duration={t.duration} accentColor={theme.accent} />
                </div>
              </div>
            </div>
          );
        })}
        <style>{`
          @keyframes nt-slide-in { 
            from { 
              transform: translateX(32px) scale(0.95); 
              opacity: 0;
              filter: blur(2px);
            } 
            to { 
              transform: translateX(0) scale(1); 
              opacity: 1;
              filter: blur(0px);
            } 
          }
        `}</style>
      </div>
    </>
  );
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}


