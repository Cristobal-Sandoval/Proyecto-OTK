import React, { useRef, useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

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

// Reusable Cosplayer Card
const CosplayerCard = ({ cosplayer, hasMovedRef }) => (
  <div className="cosplayer-card glass-card">
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
          onClick={(e) => {
            if (hasMovedRef && hasMovedRef.current) {
              e.preventDefault();
              return;
            }
            e.stopPropagation();
          }}
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
);

const CosplayerGallery = ({ cosplayers = [] }) => {
  // Mobile touch slider refs and states
  const mobileSliderRef = useRef(null);
  const desktopSliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const hasMoved = useRef(false);

  // Desktop slider controls (when cosplayers > 3)
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Triplicate list for mobile endless loop
  const mobileCarouselItems = cosplayers.length > 0 
    ? [...cosplayers, ...cosplayers, ...cosplayers] 
    : [];

  // Mobile: Continuous gentle auto-scroll
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteracting.current && mobileSliderRef.current && mobileCarouselItems.length > 0) {
        const speed = 0.045; // ~45px per second
        mobileSliderRef.current.scrollLeft += speed * delta;

        const { scrollLeft, scrollWidth } = mobileSliderRef.current;
        const singleSetWidth = scrollWidth / 3;

        if (singleSetWidth > 0 && scrollLeft >= singleSetWidth * 2) {
          mobileSliderRef.current.scrollLeft -= singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [mobileCarouselItems.length]);

  const pauseInteraction = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    isInteracting.current = true;
  };

  const resumeInteractionAfterDelay = (delayMs = 2500) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, delayMs);
  };

  const checkDesktopScrollBounds = () => {
    if (!desktopSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = desktopSliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollDesktop = (direction) => {
    if (!desktopSliderRef.current) return;
    const scrollAmount = 340;
    desktopSliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkDesktopScrollBounds, 350);
  };

  return (
    <section className="section-padding" id="cosplay" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="section-title" style={{ marginBottom: 0, textAlign: 'left' }}>
            <h2 style={{ textAlign: 'left' }}>Pasarela <span className="text-neon-pink">Cosplay</span></h2>
            <p style={{ textAlign: 'left', maxWidth: '600px' }}>Conoce a los artistas del cosplay que darán vida a tus personajes favoritos en Otakonce 2026.</p>
          </div>

          {/* Desktop Navigation Arrows (Only shown when there are more than 3 cosplayers) */}
          {cosplayers.length > 3 && (
            <div className="cosplay-desktop-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => scrollDesktop('left')}
                disabled={!canScrollLeft}
                aria-label="Cosplayers anteriores"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface-solid)',
                  border: '1.5px solid var(--border-color)',
                  color: canScrollLeft ? 'var(--text-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollLeft ? 'pointer' : 'default',
                  opacity: canScrollLeft ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollDesktop('right')}
                disabled={!canScrollRight}
                aria-label="Siguientes cosplayers"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface-solid)',
                  border: '1.5px solid var(--border-color)',
                  color: canScrollRight ? 'var(--text-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollRight ? 'pointer' : 'default',
                  opacity: canScrollRight ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            DESKTOP VIEW (>= 768px): Perfectly Framed inside Container
            ======================================================== */}
        <div className="cosplayers-desktop-wrapper">
          {cosplayers.length <= 3 ? (
            /* Perfectly Balanced Grid for 1 to 3 Cosplayers */
            <div className="cosplayers-desktop-grid">
              {cosplayers.map((cosplayer) => (
                <CosplayerCard key={cosplayer.id} cosplayer={cosplayer} />
              ))}
            </div>
          ) : (
            /* Contained Desktop Slider for 4+ Cosplayers */
            <div 
              ref={desktopSliderRef}
              className="cosplayers-desktop-slider"
              onScroll={checkDesktopScrollBounds}
            >
              {cosplayers.map((cosplayer) => (
                <div key={cosplayer.id} style={{ flex: '0 0 340px' }}>
                  <CosplayerCard cosplayer={cosplayer} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MOBILE VIEW (< 768px): Edge-to-Edge Auto-drift + Touch Swipe
          ======================================================== */}
      <div className="cosplayers-mobile-wrapper">
        <div 
          ref={mobileSliderRef}
          className="cosplay-mobile-slider"
          onTouchStart={() => {
            pauseInteraction();
            hasMoved.current = false;
          }}
          onTouchEnd={() => resumeInteractionAfterDelay(2500)}
          onTouchCancel={() => resumeInteractionAfterDelay(2500)}
        >
          {mobileCarouselItems.map((cosplayer, index) => (
            <div 
              key={`${cosplayer.id}-${index}`}
              className="cosplayer-mobile-card-wrapper"
            >
              <CosplayerCard cosplayer={cosplayer} hasMovedRef={hasMoved} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* ==========================================
           RESPONSIVE DISPLAY SWITCH
           ========================================== */
        @media (min-width: 768px) {
          .cosplayers-desktop-wrapper {
            display: block !important;
          }
          .cosplayers-mobile-wrapper {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .cosplayers-desktop-wrapper {
            display: none !important;
          }
          .cosplayers-mobile-wrapper {
            display: block !important;
          }
        }

        /* ==========================================
           DESKTOP STYLES (Framed inside Container)
           ========================================== */
        .cosplayers-desktop-grid {
          display: grid;
          grid-template-columns: repeat(${Math.min(cosplayers.length, 3)}, 1fr);
          gap: 24px;
          width: 100%;
        }

        .cosplayers-desktop-slider {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          padding: 8px 4px 16px;
        }
        .cosplayers-desktop-slider::-webkit-scrollbar {
          display: none;
        }

        /* Card Shared Styling */
        .cosplayer-card {
          width: 100%;
          height: 480px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
          user-select: none;
        }
        .cosplayer-card:hover {
          transform: translateY(-6px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
        }

        /* ==========================================
           MOBILE STYLES (Swipeable Continuous Drift)
           ========================================== */
        .cosplay-mobile-slider {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 8px 20px 20px;
          width: 100%;
          scrollbar-width: none;
          -ms-overflow-style: none;
          touch-action: pan-x pan-y pinch-zoom;
        }
        .cosplay-mobile-slider::-webkit-scrollbar {
          display: none;
        }
        .cosplayer-mobile-card-wrapper {
          flex: 0 0 280px;
          width: 280px;
        }
        .cosplayer-mobile-card-wrapper .cosplayer-card {
          height: 420px;
        }
      `}</style>
    </section>
  );
};

export default CosplayerGallery;
