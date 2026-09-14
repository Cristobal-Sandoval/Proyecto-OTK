import React from 'react';
import { X, ArrowRight } from 'lucide-react';

const FloatingBanner = ({ config, onNavigate, onDismiss }) => {
  if (!config || !config.active) return null;

  const handleActionClick = (e) => {
    if (config.link) {
      e.preventDefault();
      if (config.link.startsWith('#')) {
        const targetId = config.link.substring(1);
        onNavigate(targetId);
      } else {
        window.open(config.link, '_blank');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '32px',
        zIndex: 200,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#E0F2FE', // Soft light sky blue
        color: '#0369A1', // Deep sky blue
        borderBottom: '1px solid rgba(3, 105, 161, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 163, 255, 0.05)',
        fontFamily: 'var(--font-display)',
        animation: 'slideDown 0.3s ease-out forwards'
      }}
      className="top-announcement-bar"
    >
      <div 
        onClick={handleActionClick}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px', 
          cursor: config.link ? 'pointer' : 'default',
          flex: 1,
          maxWidth: '1200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        <span 
          style={{ 
            background: '#00A3FF', // Sky Blue
            color: '#FFFFFF', 
            padding: '1px 6px', 
            borderRadius: '4px',
            fontSize: '0.62rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginRight: '2px'
          }}
        >
          ANUNCIO
        </span>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
          {config.text}
        </p>
        {config.link && (
          <ArrowRight size={13} style={{ flexShrink: 0, color: 'var(--cyan)' }} />
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#0369A1',
          cursor: 'pointer',
          padding: '3px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-fast)',
          opacity: 0.8
        }}
        className="close-hover-btn"
        aria-label="Cerrar anuncio"
      >
        <X size={14} />
      </button>

      <style>{`
        .top-announcement-bar .close-hover-btn:hover {
          background: rgba(3, 105, 161, 0.08);
          opacity: 1;
        }
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingBanner;
