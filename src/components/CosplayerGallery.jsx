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

const CosplayerGallery = ({ cosplayers = [] }) => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Interaction tracking for pausing the gentle auto-scroll
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);

  // Mouse drag-to-scroll state for desktop
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Triplicate list for endless, continuous scrolling without walls
  const carouselItems = cosplayers.length > 0 
    ? [...cosplayers, ...cosplayers, ...cosplayers] 
    : [];

  // Slow, gentle continuous auto-scroll loop (40-45px per second)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteracting.current && sliderRef.current && carouselItems.length > 0) {
        // Slow, elegant cinematic drift speed
        const speed = 0.045; // pixels per millisecond (~45px/sec)
        sliderRef.current.scrollLeft += speed * delta;

        const { scrollLeft, scrollWidth } = sliderRef.current;
        const singleSetWidth = scrollWidth / 3;

        // Loop seamlessly when passing the second set
        if (singleSetWidth > 0 && scrollLeft >= singleSetWidth * 2) {
          sliderRef.current.scrollLeft -= singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [carouselItems.length]);

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

  const checkScrollBounds = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollBounds();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollBounds, { passive: true });
      window.addEventListener('resize', checkScrollBounds);
    }
    return () => {
      if (slider) slider.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [cosplayers]);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    pauseInteraction();
    const cardWidth = sliderRef.current.querySelector('.cosplayer-swipe-card')?.offsetWidth || 300;
    const scrollAmount = (cardWidth + 20) * 1.5;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    resumeInteractionAfterDelay(3500);
  };

  // Mouse drag handlers (Desktop enhancement)
  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('a') || e.target.closest('button')) return;
    pauseInteraction();
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftStart.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    resumeInteractionAfterDelay(2500);
  };

  // Touch handlers for mobile
  const handleTouchStart = () => {
    pauseInteraction();
    hasMoved.current = false;
  };

  const handleTouchEnd = () => {
    resumeInteractionAfterDelay(2500);
  };

  return (
    <section className="section-padding" id="cosplay" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header with Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="section-title" style={{ marginBottom: 0, textAlign: 'left' }}>
            <h2 style={{ textAlign: 'left' }}>Pasarela <span className="text-neon-pink">Cosplay</span></h2>
            <p style={{ textAlign: 'left', maxWidth: '600px' }}>Conoce a los artistas del cosplay que darán vida a tus personajes favoritos en Otakonce 2026.</p>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="cosplay-nav-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => scroll('left')}
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
              onClick={() => scroll('right')}
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
        </div>
      </div>

      {/* Auto-moving + Touch & Drag Horizontal Slider */}
      <div 
        ref={sliderRef}
        className="cosplay-touch-slider"
        onMouseEnter={pauseInteraction}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {carouselItems.map((cosplayer, index) => (
          <div 
            key={`${cosplayer.id}-${index}`}
            className="cosplayer-swipe-card glass-card"
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
                  onClick={(e) => {
                    if (hasMoved.current) {
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
        ))}
      </div>

      <style>{`
        .cosplay-touch-slider {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 10px 20px 24px;
          width: 100%;
          cursor: grab;
          scrollbar-width: none;
          -ms-overflow-style: none;
          touch-action: pan-x pan-y pinch-zoom;
        }
        .cosplay-touch-slider::-webkit-scrollbar {
          display: none;
        }
        .cosplay-touch-slider:active {
          cursor: grabbing;
        }
        .cosplayer-swipe-card {
          flex: 0 0 280px;
          width: 280px;
          height: 420px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
          user-select: none;
        }
        .cosplayer-swipe-card:hover {
          transform: translateY(-4px);
          border-color: var(--secondary) !important;
          box-shadow: 0 14px 30px rgba(253, 52, 132, 0.22) !important;
        }
        @media (min-width: 768px) {
          .cosplay-touch-slider {
            gap: 24px;
            padding: 12px calc((100vw - 1200px) / 2 + 20px) 28px;
          }
          .cosplayer-swipe-card {
            flex: 0 0 310px;
            width: 310px;
            height: 460px;
          }
        }
        @media (max-width: 640px) {
          .cosplay-nav-controls {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CosplayerGallery;
