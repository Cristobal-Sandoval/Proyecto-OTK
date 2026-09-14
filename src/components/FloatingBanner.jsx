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
        height: '34px',
        zIndex: 200,
        padding: '0 10px 0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#E0F2FE', // Soft light sky blue
        color: '#0369A1', // Deep sky blue
        borderBottom: '1px solid rgba(3, 105, 161, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 163, 255, 0.05)',
        fontFamily: 'var(--font-display)',
        animation: 'slideDown 0.3s ease-out forwards'
      }}
      className="top-announcement-bar"
    >
      {/* Fixed Badge on the Left */}
      <span 
        style={{ 
          background: '#00A3FF', 
          color: '#FFFFFF', 
          padding: '2px 7px', 
          borderRadius: '4px',
          fontSize: '0.62rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0, 163, 255, 0.3)'
        }}
      >
        ANUNCIO
      </span>

      {/* Marquee / Ticker Track in the Center */}
      <div 
        onClick={handleActionClick}
        className="banner-marquee-container"
        style={{ 
          flex: 1,
          overflow: 'hidden',
          cursor: config.link ? 'pointer' : 'default',
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
        title={config.link ? "Haz clic para ver más información" : undefined}
      >
        <div className="banner-marquee-track">
          {/* First loop item */}
          <div className="banner-item">
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {config.text}
            </span>
            {config.link && (
              <ArrowRight size={13} style={{ flexShrink: 0, color: 'var(--cyan)' }} />
            )}
            <span className="banner-separator">•</span>
          </div>

          {/* Duplicate loop item for seamless endless scroll */}
          <div className="banner-item">
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {config.text}
            </span>
            {config.link && (
              <ArrowRight size={13} style={{ flexShrink: 0, color: 'var(--cyan)' }} />
            )}
            <span className="banner-separator">•</span>
          </div>
        </div>
      </div>

      {/* Fixed Close Button on the Right */}
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#0369A1',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'var(--transition-fast)',
          opacity: 0.85
        }}
        className="close-hover-btn"
        aria-label="Cerrar anuncio"
      >
        <X size={15} />
      </button>

      <style>{`
        .banner-marquee-container {
          mask-image: linear-gradient(90deg, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%);
        }
        .banner-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: bannerScroll 20s linear infinite;
          will-change: transform;
        }
        .banner-marquee-container:hover .banner-marquee-track,
        .banner-marquee-container:active .banner-marquee-track {
          animation-play-state: paused;
        }
        .banner-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          padding-right: 32px;
        }
        .banner-separator {
          color: #0284C7;
          opacity: 0.6;
          font-weight: bold;
          font-size: 1rem;
          margin-left: 8px;
        }
        .top-announcement-bar .close-hover-btn:hover {
          background: rgba(3, 105, 161, 0.12);
          opacity: 1;
        }
        @keyframes bannerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
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
