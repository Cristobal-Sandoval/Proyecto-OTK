import React, { useRef, useMemo, useEffect } from 'react';
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
  const sliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Repeat items for seamless continuous loop
  const carouselItems = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    if (guests.length <= 2) return [...guests, ...guests, ...guests, ...guests, ...guests, ...guests];
    if (guests.length <= 4) return [...guests, ...guests, ...guests, ...guests];
    return [...guests, ...guests, ...guests];
  }, [guests]);

  // RequestAnimationFrame continuous slow auto-drift
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteracting.current && sliderRef.current && carouselItems.length > 0) {
        const speed = 0.045; // pixels/ms (~45px per second)
        sliderRef.current.scrollLeft += speed * delta;

        const { scrollLeft, scrollWidth } = sliderRef.current;
        const repeatCount = carouselItems.length / guests.length;
        const singleSetWidth = scrollWidth / repeatCount;

        if (singleSetWidth > 0 && scrollLeft >= singleSetWidth * (repeatCount - 1)) {
          sliderRef.current.scrollLeft -= singleSetWidth;
        } else if (singleSetWidth > 0 && scrollLeft <= 0) {
          sliderRef.current.scrollLeft += singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [carouselItems.length, guests.length]);

  const pauseInteraction = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    isInteracting.current = true;
  };

  const resumeInteractionAfterDelay = (delayMs = 2200) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, delayMs);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    isMouseDown.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftStart.current = sliderRef.current.scrollLeft;
    pauseInteraction();
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.25;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      resumeInteractionAfterDelay(2000);
    }
  };

  // Manual scroll with arrow buttons
  const scrollManual = (direction) => {
    if (!sliderRef.current) return;
    pauseInteraction();
    const cardWidth = window.innerWidth < 768 ? 296 : 344;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth'
    });
    resumeInteractionAfterDelay(3000);
  };

  if (guests.length === 0) return null;

  return (
    <section className="section-padding" id="invitados" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header with Arrows */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="section-title" style={{ marginBottom: 0, textAlign: 'left' }}>
            <h2 style={{ textAlign: 'left' }}>Invitados <span className="text-neon-pink">Especiales</span></h2>
            <p style={{ textAlign: 'left', maxWidth: '600px' }}>Conoce a los cosplayers oficiales, jurados de la pasarela y artistas destacados que nos acompañarán en Otakonce 2026.</p>
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => scrollManual('left')}
              aria-label="Invitados anteriores"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--bg-surface-solid)',
                border: '1.5px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              className="hover-glow"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollManual('right')}
              aria-label="Siguientes invitados"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--bg-surface-solid)',
                border: '1.5px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              className="hover-glow"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Edge-to-Edge Infinite Carousel Track with Soft Borders */}
      <div className="guests-infinite-container">
        <div 
          ref={sliderRef}
          className="guests-infinite-track"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={() => {
            handleMouseUpOrLeave();
            resumeInteractionAfterDelay(1500);
          }}
          onTouchStart={() => {
            pauseInteraction();
            hasMoved.current = false;
          }}
          onTouchEnd={() => resumeInteractionAfterDelay(2200)}
          onTouchCancel={() => resumeInteractionAfterDelay(2200)}
        >
          {carouselItems.map((guest, index) => (
            <div 
              key={`${guest.id}-${index}`}
              className="guest-infinite-item"
            >
              <GuestCard guest={guest} hasMovedRef={hasMoved} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Infinite Carousel Outer Container with edge masking */
        .guests-infinite-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 3%, black 97%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 3%, black 97%, transparent);
        }

        /* Continuous Smooth Track */
        .guests-infinite-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 12px 24px 24px;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          touch-action: pan-x pan-y pinch-zoom;
        }
        .guests-infinite-track:active {
          cursor: grabbing;
        }
        .guests-infinite-track::-webkit-scrollbar {
          display: none;
        }

        /* Item Width */
        .guest-infinite-item {
          flex: 0 0 320px;
          width: 320px;
        }

        /* Card Styling */
        .guest-card {
          width: 100%;
          height: 480px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .guest-card:hover {
          transform: translateY(-6px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
        }

        /* Mobile Adjustments */
        @media (max-width: 767px) {
          .guests-infinite-container {
            mask-image: none;
            -webkit-mask-image: none;
          }
          .guests-infinite-track {
            gap: 16px;
            padding: 8px 16px 20px;
          }
          .guest-infinite-item {
            flex: 0 0 280px;
            width: 280px;
          }
          .guest-card {
            height: 420px;
            border-radius: 20px;
          }
        }
      `}</style>
    </section>
  );
};

export default GuestsSection;
