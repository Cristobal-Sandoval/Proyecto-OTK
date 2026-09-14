import React, { useState } from 'react';
import { ExternalLink, Pause, Play } from 'lucide-react';

const Instagram = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const CosplayerGallery = ({ cosplayers = [] }) => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicar elementos para asegurar un bucle infinito continuo sin cortes
  const carouselItems = cosplayers.length > 0 
    ? [...cosplayers, ...cosplayers, ...cosplayers] 
    : [];

  return (
    <section className="section-padding" id="cosplay" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <h2>Pasarela <span className="text-neon-pink">Cosplay</span></h2>
          <p>Conoce a los artistas del cosplay que darán vida a tus personajes favoritos en Otakonce 2026.</p>
        </div>

        {/* Carousel Control Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              background: 'var(--bg-surface-solid)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              cursor: 'pointer'
            }}
          >
            {isPaused ? <Play size={12} style={{ color: 'var(--cyan)' }} /> : <Pause size={12} style={{ color: 'var(--secondary)' }} />}
            {isPaused ? 'Reanudar carrusel' : 'Pausar al tocar o pasar el mouse'}
          </button>
        </div>
      </div>

      {/* Infinite Moving Marquee Wrapper */}
      <div 
        className="cosplay-marquee-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
      >
        <div 
          className={`cosplay-marquee-track ${isPaused ? 'is-paused' : ''}`}
        >
          {carouselItems.map((cosplayer, index) => (
            <div 
              key={`${cosplayer.id}-${index}`}
              className="cosplay-marquee-card glass-card"
            >
              {/* Background Cosplay Image / Fallback Gradient */}
              <div
                role="img"
                aria-label={`Foto de cosplay de ${cosplayer.name} como ${cosplayer.character}`}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
                  backgroundImage: cosplayer.image ? `url(${cosplayer.image})` : 'linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 20%',
                  position: 'relative'
                }}
                className="image-loader-bg"
              >
                {/* Floating Character Tag */}
                <span 
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '18px',
                    zIndex: 2,
                    background: 'rgba(8,7,17,0.85)',
                    border: '1.5px solid var(--secondary)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    backdropFilter: 'blur(6px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {cosplayer.character}
                </span>

                {/* Bottom Overlay Gradient & Details */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '65%',
                    background: 'linear-gradient(to top, rgba(8, 7, 17, 0.96) 0%, rgba(8, 7, 17, 0.72) 45%, transparent 100%)',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '22px',
                    gap: '6px'
                  }}
                  className="cosplay-details"
                >
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {cosplayer.name}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#F1F5F9', lineHeight: 1.4, margin: '2px 0', textShadow: '0 1px 2px rgba(0,0,0,0.8)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cosplayer.bio}
                  </p>

                  <a 
                    href={cosplayer.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      alignSelf: 'flex-start',
                      marginTop: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(253, 52, 132, 0.12)'
                    }}
                    className="instagram-link"
                  >
                    <Instagram size={14} />
                    @{cosplayer.instagram.split('/').pop() || 'instagram'}
                    <ExternalLink size={11} style={{ opacity: 0.8 }} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes infiniteCosplayScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }
        .cosplay-marquee-wrapper {
          overflow: hidden;
          position: relative;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding: 16px 0 32px;
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          cursor: grab;
        }
        .cosplay-marquee-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: infiniteCosplayScroll 40s linear infinite;
          will-change: transform;
        }
        .cosplay-marquee-track.is-paused {
          animation-play-state: paused !important;
        }
        .cosplay-marquee-wrapper:hover .cosplay-marquee-track {
          animation-play-state: paused;
        }
        .cosplay-marquee-card {
          flex: 0 0 280px;
          width: 280px;
          height: 420px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform var(--transition-fast), border-color var(--transition-fast);
        }
        .cosplay-marquee-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
        }
        @media (min-width: 768px) {
          .cosplay-marquee-card {
            flex: 0 0 320px;
            width: 320px;
            height: 460px;
          }
          .cosplay-marquee-track {
            gap: 26px;
            animation-duration: 48s;
          }
        }
      `}</style>
    </section>
  );
};

export default CosplayerGallery;
