import React, { useRef, useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';

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

const GuestCard = ({ guest, hasMovedRef }) => (
  <div className="guest-card glass-card">
    {/* Background Guest Image */}
    <div
      role="img"
      aria-label={`Foto de invitado ${guest.name} como ${guest.character}`}
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
        backgroundImage: guest.image ? `url(${guest.image})` : 'linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        position: 'relative'
      }}
      className="image-loader-bg"
    >
      {/* Top Floating Badges */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, gap: '8px', flexWrap: 'wrap' }}>
        {/* Character Tag */}
        <span 
          style={{
            background: 'rgba(8,7,17,0.88)',
            border: '1.5px solid var(--secondary)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#FFFFFF',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {guest.character}
        </span>

        {/* Role Badge */}
        <span
          style={{
            background: 'linear-gradient(135deg, #00A3FF 0%, #7C3AED 100%)',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '4px 9px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.03em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(0, 163, 255, 0.4)'
          }}
        >
          <Star size={11} fill="#FFFFFF" />
          {guest.role || 'Invitado Especial'}
        </span>
      </div>

      {/* Bottom Overlay Details */}
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
        className="guest-details"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#FFFFFF', lineHeight: 1.2, margin: 0 }}>
            {guest.name}
          </h3>
          {guest.city && (
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={12} color="var(--cyan)" /> {guest.city}
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.84rem', color: '#F1F5F9', lineHeight: 1.4, margin: '2px 0', textShadow: '0 1px 2px rgba(0,0,0,0.8)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {guest.bio}
        </p>

        <a 
          href={guest.instagram}
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
          className="instagram-link hover-glow"
        >
          <Instagram size={14} />
          @{guest.instagram ? guest.instagram.split('/').filter(Boolean).pop() : 'instagram'}
          <ExternalLink size={11} style={{ opacity: 0.8 }} />
        </a>
      </div>
    </div>
  </div>
);

const GuestsSection = ({ guests = [] }) => {
  const mobileSliderRef = useRef(null);
  const desktopSliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const hasMoved = useRef(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Triple items for continuous loop on mobile
  const mobileCarouselItems = guests.length > 0 
    ? [...guests, ...guests, ...guests] 
    : [];

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteracting.current && mobileSliderRef.current && mobileCarouselItems.length > 0) {
        const speed = 0.045; // pixels/ms
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

  useEffect(() => {
    checkDesktopScrollBounds();
    const handleResize = () => checkDesktopScrollBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [guests.length]);

  const scrollDesktop = (direction) => {
    if (!desktopSliderRef.current) return;
    const scrollAmount = 364; // card width (340px) + gap (24px)
    desktopSliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkDesktopScrollBounds, 350);
  };

  if (guests.length === 0) return null;

  return (
    <section className="section-padding" id="invitados" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="section-title" style={{ marginBottom: 0, textAlign: 'left' }}>
            <h2 style={{ textAlign: 'left' }}>Invitados <span className="text-neon-pink">Especiales</span></h2>
            <p style={{ textAlign: 'left', maxWidth: '600px' }}>Conoce a los cosplayers oficiales, jurados de la pasarela y artistas destacados que nos acompañarán en Otakonce 2026.</p>
          </div>

          {/* Desktop Navigation Arrows (Only shown when > 3 guests) */}
          {guests.length > 3 && (
            <div className="guests-desktop-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => scrollDesktop('left')}
                disabled={!canScrollLeft}
                aria-label="Invitados anteriores"
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
                aria-label="Siguientes invitados"
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

        {/* Desktop View (>= 768px): Framed inside container */}
        <div className="guests-desktop-wrapper">
          {guests.length <= 3 ? (
            <div className="guests-desktop-grid">
              {guests.map((guest) => (
                <GuestCard key={guest.id} guest={guest} />
              ))}
            </div>
          ) : (
            <div 
              ref={desktopSliderRef}
              className="guests-desktop-slider"
              onScroll={checkDesktopScrollBounds}
            >
              {guests.map((guest) => (
                <div key={guest.id} style={{ flex: '0 0 340px' }}>
                  <GuestCard guest={guest} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile View (< 768px): Continuous gentle drift + Touch Swipe */}
      <div className="guests-mobile-wrapper">
        <div 
          ref={mobileSliderRef}
          className="guests-mobile-slider"
          onTouchStart={() => {
            pauseInteraction();
            hasMoved.current = false;
          }}
          onTouchEnd={() => resumeInteractionAfterDelay(2500)}
          onTouchCancel={() => resumeInteractionAfterDelay(2500)}
        >
          {mobileCarouselItems.map((guest, index) => (
            <div 
              key={`${guest.id}-${index}`}
              className="guest-mobile-card-wrapper"
            >
              <GuestCard guest={guest} hasMovedRef={hasMoved} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .guests-desktop-wrapper {
            display: block !important;
          }
          .guests-mobile-wrapper {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .guests-desktop-wrapper {
            display: none !important;
          }
          .guests-mobile-wrapper {
            display: block !important;
          }
        }

        .guests-desktop-grid {
          display: grid;
          grid-template-columns: repeat(${Math.min(guests.length, 3)}, 1fr);
          gap: 24px;
          width: 100%;
        }

        .guests-desktop-slider {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          padding: 8px 4px 16px;
        }
        .guests-desktop-slider::-webkit-scrollbar {
          display: none;
        }

        .guest-card {
          width: 100%;
          height: 480px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
          user-select: none;
        }
        .guest-card:hover {
          transform: translateY(-6px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
        }

        .guests-mobile-slider {
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
        .guests-mobile-slider::-webkit-scrollbar {
          display: none;
        }
        .guest-mobile-card-wrapper {
          flex: 0 0 280px;
          width: 280px;
        }
        .guest-mobile-card-wrapper .guest-card {
          height: 420px;
        }
      `}</style>
    </section>
  );
};

export default GuestsSection;
