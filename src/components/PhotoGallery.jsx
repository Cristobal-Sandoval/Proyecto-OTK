import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const PhotoGallery = ({ photos = [], mode = 'preview', onNavigate }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Carousel refs & state for preview mode
  const sliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  const categories = ['Todas', ...new Set(photos.map(p => p.category).filter(Boolean))];

  const filteredPhotos = mode === 'full' && selectedCategory !== 'Todas'
    ? photos.filter(p => p.category === selectedCategory)
    : photos;

  // Repeat photos for seamless infinite carousel loop in preview mode
  const carouselItems = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    if (photos.length <= 2) return [...photos, ...photos, ...photos, ...photos, ...photos, ...photos];
    if (photos.length <= 4) return [...photos, ...photos, ...photos, ...photos];
    return [...photos, ...photos, ...photos];
  }, [photos]);

  // RequestAnimationFrame continuous slow drift in preview mode
  useEffect(() => {
    if (mode !== 'preview') return;
    let animationFrameId;
    let lastTime = performance.now();
    let isVisible = true;
    let inViewport = true;

    const onVisibility = () => { isVisible = !document.hidden; lastTime = performance.now(); };
    document.addEventListener('visibilitychange', onVisibility);
    let observer;
    if (typeof IntersectionObserver !== 'undefined' && sliderRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting;
        lastTime = performance.now();
      }, { rootMargin: '350px' });
      observer.observe(sliderRef.current);
    }

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteracting.current && isVisible && inViewport && sliderRef.current && carouselItems.length > 0) {
        const speed = 0.050; // pixels/ms (~50px/sec) — calm, elegant gallery drift
        sliderRef.current.scrollLeft += speed * delta;

        const { scrollLeft, scrollWidth } = sliderRef.current;
        const repeatCount = carouselItems.length / photos.length;
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
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [mode, carouselItems, photos.length]);

  // Initial scroll position to the middle clone for bidirectional infinite scrolling
  useEffect(() => {
    if (mode !== 'preview') return;
    const track = sliderRef.current;
    if (!track || !photos.length) return;
    const timeout = setTimeout(() => {
      const repeatCount = carouselItems.length / photos.length;
      const singleSetWidth = track.scrollWidth / repeatCount;
      if (singleSetWidth > 0 && track.scrollLeft === 0) {
        track.scrollLeft = singleSetWidth;
      }
    }, 80);
    return () => clearTimeout(timeout);
  }, [mode, carouselItems.length, photos.length]);

  const pauseInteraction = () => {
    isInteracting.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const resumeInteractionAfterDelay = (ms = 1800) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, ms);
  };

  // Mouse & Touch drag handlers
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

  // Manual scroll with floating arrows
  const scrollManual = (direction) => {
    if (!sliderRef.current) return;
    pauseInteraction();
    const step = Math.max(260, sliderRef.current.clientWidth * 0.75);
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    });
    resumeInteractionAfterDelay(3500);
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const currentList = mode === 'preview' ? photos : filteredPhotos;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : currentList.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < currentList.length - 1 ? prev + 1 : 0));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, mode, photos, filteredPhotos]);

  if (!photos || photos.length === 0) return null;

  const currentList = mode === 'preview' ? photos : filteredPhotos;
  const activePhoto = lightboxIndex !== null && lightboxIndex < currentList.length ? currentList[lightboxIndex] : null;

  return (
    <section
      aria-label="Galería de fotos"
      className="section-padding"
      id="galeria"
      style={{
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.008)',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Encabezado estandarizado .section-title */}
        <div className="section-title">
          <h2>Galería de <span className="text-neon-pink">Fotos</span></h2>
          <p>Revive los mejores instantes, cosplays y momentos compartidos en cada edición de Otakonce.</p>
        </div>

        {/* Categorías en modo full */}
        {mode === 'full' && categories.length > 1 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '32px'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '24px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1.5px solid var(--border-color)',
                  background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === cat ? '0 4px 16px rgba(254, 220, 0, 0.3)' : 'none'
                }}
              >
                {cat === 'Todas' ? <Filter size={13} style={{ display: 'inline', marginRight: '6px' }} /> : null}
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* =========================================================================
            PREVIEW MODE: INFINITE CAROUSEL SLIDER (Strictly contained within .container)
            ========================================================================= */}
        {mode === 'preview' ? (
          <div>
            <div className="photo-infinite-container group-carousel">
              {/* CardPoint-style Floating Left Arrow */}
              <button
                onClick={() => scrollManual('left')}
                aria-label="Foto anterior"
                className="carousel-floating-btn carousel-floating-left"
              >
                <ChevronLeft size={22} className="stroke-[2.5]" />
              </button>

              {/* CardPoint-style Floating Right Arrow */}
              <button
                onClick={() => scrollManual('right')}
                aria-label="Foto siguiente"
                className="carousel-floating-btn carousel-floating-right"
              >
                <ChevronRight size={22} className="stroke-[2.5]" />
              </button>

              <div
                ref={sliderRef}
                className="photo-infinite-track"
                onMouseEnter={pauseInteraction}
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
                onTouchEnd={() => resumeInteractionAfterDelay(1800)}
                onTouchCancel={() => resumeInteractionAfterDelay(1800)}
              >
                {carouselItems.map((photo, index) => {
                  const originalIndex = index % photos.length;
                  return (
                    <div
                      key={`${photo.id || originalIndex}-${index}`}
                      className="photo-infinite-item"
                      onClick={() => {
                        if (!hasMoved.current) {
                          setLightboxIndex(originalIndex);
                        }
                      }}
                    >
                      <div className="photo-card glass-card">
                        <img
                          src={photo.src}
                          alt={photo.alt || 'Foto Otakonce'}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          style={{
                            display: 'none',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, #1E1B4B 0%, #4C0519 100%)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}
                        >
                          📷 Foto Otakonce
                        </div>

                        {/* Gradient Overlay & Category Badge */}
                        <div className="photo-card-overlay">
                          {photo.category && (
                            <span className="photo-category-badge">
                              {photo.category}
                            </span>
                          )}
                          {photo.alt && (
                            <p className="photo-card-title">
                              {photo.alt}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigate && onNavigate('gallery')}
                style={{ padding: '9px 22px', fontSize: '0.9rem' }}
              >
                Ver galería completa &rarr;
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              FULL MODE: DEDICATED RESPONSIVE GRID
              ========================================================================= */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '18px'
            }}
          >
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id || index}
                onClick={() => setLightboxIndex(index)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  position: 'relative',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
                className="gallery-item-hover"
              >
                <img
                  src={photo.src}
                  alt={photo.alt || 'Foto Otakonce'}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
                <div
                  style={{
                    display: 'none',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  📷 Foto próximamente
                </div>
                <div className="photo-card-overlay">
                  {photo.category && (
                    <span className="photo-category-badge">
                      {photo.category}
                    </span>
                  )}
                  {photo.alt && (
                    <p className="photo-card-title">
                      {photo.alt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal con Portal */}
      {activePhoto && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.96)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar vista completa"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10002
            }}
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev > 0 ? prev - 1 : currentList.length - 1));
            }}
            aria-label="Foto anterior"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10002
            }}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev < currentList.length - 1 ? prev + 1 : 0));
            }}
            aria-label="Foto siguiente"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10002
            }}
          >
            <ChevronRight size={28} />
          </button>

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <img
              src={activePhoto.src}
              alt={activePhoto.alt || 'Foto ampliada'}
              style={{
                maxWidth: '92vw',
                maxHeight: '74vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'flex';
                }
              }}
            />
            <div
              style={{
                display: 'none',
                width: '320px',
                height: '240px',
                background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem',
                borderRadius: '12px'
              }}
            >
              📷 Foto no disponible
            </div>
            {activePhoto.alt && (
              <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '14px', fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>
                {activePhoto.alt}
              </p>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
              {lightboxIndex + 1} / {currentList.length}
            </span>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        /* Infinite Carousel Layout strictly contained inside .container */
        .photo-infinite-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
        }

        .photo-infinite-track {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: auto !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 8px 4px 16px;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          touch-action: pan-x pan-y pinch-zoom;
        }
        .photo-infinite-track:active {
          cursor: grabbing;
        }
        .photo-infinite-track::-webkit-scrollbar {
          display: none;
        }

        .photo-infinite-item {
          flex: 0 0 340px;
          width: 340px;
        }

        .photo-card {
          width: 100%;
          height: 250px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .photo-card:hover {
          transform: translateY(-5px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
        }

        .photo-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8, 7, 17, 0.88) 0%, rgba(8, 7, 17, 0.15) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          justifyContent: flex-end;
          padding: 16px;
          gap: 6px;
          pointer-events: none;
        }

        .photo-category-badge {
          align-self: flex-start;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          color: var(--primary);
          border: 1px solid rgba(254, 220, 0, 0.3);
          padding: 3px 9px;
          border-radius: 8px;
          font-size: 0.74rem;
          font-weight: 750;
        }

        .photo-card-title {
          color: #FFF;
          font-size: 0.88rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gallery-item-hover:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: var(--secondary) !important;
          box-shadow: 0 12px 30px rgba(253, 52, 132, 0.25);
        }

        /* Floating Navigation Buttons */
        .carousel-floating-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 25;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          color: #0F172A;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease;
          user-select: none;
        }
        .carousel-floating-left {
          left: 12px;
        }
        .carousel-floating-right {
          right: 12px;
        }
        .carousel-floating-btn:hover {
          transform: translateY(-50%) scale(1.12);
          background: #FFFFFF;
          color: var(--secondary);
          box-shadow: 0 10px 28px rgba(253, 52, 132, 0.4), 0 0 14px rgba(0, 136, 255, 0.3);
        }
        .carousel-floating-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        /* Mobile Responsive Adjustments */
        @media (max-width: 767px) {
          .carousel-floating-btn {
            width: 44px;
            height: 44px;
          }
          .carousel-floating-left {
            left: 6px;
          }
          .carousel-floating-right {
            right: 6px;
          }
          .photo-infinite-track {
            gap: 14px;
            padding: 4px 2px 14px;
          }
          .photo-infinite-item {
            flex: 0 0 min(280px, 78vw);
            width: min(280px, 78vw);
          }
          .photo-card {
            height: 205px;
            border-radius: 16px;
          }
        }
      `}</style>
    </section>
  );
};

export default PhotoGallery;
