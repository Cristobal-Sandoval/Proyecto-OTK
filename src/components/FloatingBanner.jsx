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
      role="region"
      aria-label="Anuncio destacado"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        minHeight: '44px',
        zIndex: 200,
        padding: '5px 8px 5px 16px',
        display: 'flex',
        alignItems: 'center',
        background: '#E0F2FE', // Soft light sky blue
        color: '#075985', // Darkened for 4.5:1 contrast
        borderBottom: '1px solid rgba(3, 105, 161, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 163, 255, 0.05)',
        fontFamily: 'var(--font-display)',
        animation: 'slideDown 0.3s ease-out forwards'
      }}
      className="top-announcement-bar"
    >
      {/* ========================================================
          DESKTOP VIEW (>= 768px): Clean, Static & Perfectly Centered
          ======================================================== */}
      <a
        href={config.link || '#'}
        onClick={handleActionClick}
        aria-label={config.link ? `Ver anuncio: ${config.text}` : undefined}
        className="banner-desktop-wrapper"
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: config.link ? 'pointer' : 'default',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '6px 16px',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'inherit',
          minHeight: '44px'
        }}
      >
        <span 
          style={{ 
            background: '#0369A1', 
            color: '#FFFFFF', 
            padding: '3px 8px', 
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0, 163, 255, 0.25)'
          }}
        >
          ANUNCIO
        </span>

        <span 
          style={{ 
            fontSize: '0.82rem', 
            fontWeight: 700, 
            letterSpacing: '-0.01em',
            color: '#075985',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {config.text}
        </span>

        {config.link && (
          <ArrowRight size={14} aria-hidden="true" style={{ flexShrink: 0, color: '#0369A1' }} />
        )}
      </a>

      {/* ========================================================
          MOBILE VIEW (< 768px): Smooth Endless Ticker/Marquee
          ======================================================== */}
      <div className="banner-mobile-wrapper" style={{ flex: 1, height: '100%', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        {/* Fixed Badge on Left */}
        <span 
          style={{ 
            background: '#0369A1', 
            color: '#FFFFFF', 
            padding: '3px 6px', 
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flexShrink: 0
          }}
        >
          ANUNCIO
        </span>

        {/* Ticker in Center */}
        <a
          href={config.link || '#'}
          onClick={handleActionClick}
          aria-label={config.link ? `Ver anuncio: ${config.text}` : undefined}
          className="banner-mobile-ticker-container"
          style={{ 
            flex: 1,
            overflow: 'hidden',
            cursor: config.link ? 'pointer' : 'default',
            position: 'relative',
            height: '100%',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div className="banner-mobile-track" aria-hidden="true">
            <div className="banner-mobile-item">
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                {config.text}
              </span>
              {config.link && <ArrowRight size={13} aria-hidden="true" style={{ color: 'var(--cyan)' }} />}
              <span className="banner-separator" aria-hidden="true">•</span>
            </div>
            <div className="banner-mobile-item" aria-hidden="true">
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                {config.text}
              </span>
              {config.link && <ArrowRight size={13} aria-hidden="true" style={{ color: 'var(--cyan)' }} />}
              <span className="banner-separator" aria-hidden="true">•</span>
            </div>
          </div>
        </a>
      </div>

      {/* Fixed Close Button on the Right */}
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#075985',
          cursor: 'pointer',
          padding: '10px',
          minHeight: '44px',
          minWidth: '44px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'var(--transition-fast)',
          opacity: 0.9
        }}
        className="close-hover-btn"
        aria-label="Cerrar anuncio"
      >
        <X size={18} aria-hidden="true" />
      </button>

      <style>{`
        /* Responsive Display Toggle */
        @media (min-width: 768px) {
          .banner-desktop-wrapper {
            display: flex !important;
          }
          .banner-mobile-wrapper {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .banner-desktop-wrapper {
            display: none !important;
          }
          .banner-mobile-wrapper {
            display: flex !important;
          }
        }

        .banner-mobile-ticker-container {
          mask-image: linear-gradient(90deg, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%);
        }
        .banner-mobile-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: bannerScroll 20s linear infinite;
          will-change: transform;
        }
        .banner-mobile-ticker-container:hover .banner-mobile-track,
        .banner-mobile-ticker-container:active .banner-mobile-track,
        .banner-mobile-ticker-container:focus-visible .banner-mobile-track,
        .banner-mobile-ticker-container:focus-within .banner-mobile-track {
          animation-play-state: paused;
        }
        .banner-mobile-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          padding-right: 28px;
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
        .banner-desktop-wrapper:focus-visible,
        .banner-mobile-ticker-container:focus-visible {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .banner-mobile-track { animation: none !important; }
          .top-announcement-bar { animation: none !important; }
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
