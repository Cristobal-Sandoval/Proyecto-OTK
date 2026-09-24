import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Sparkles, X, Share2, Check, Tag } from 'lucide-react';

const EventsShowcase = ({ events = [], mode = 'preview', onNavigate }) => {
  // Modal state for viewing full event details
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [copiedEventId, setCopiedEventId] = useState(null);

  // Guard against ghost-clicks re-opening modal immediately on close
  const lastClosedAt = useRef(0);

  const handleOpenEvent = (event) => {
    // If modal was closed less than 450ms ago, ignore click (prevents ghost clicks from card behind close button)
    if (Date.now() - lastClosedAt.current < 450) return;
    setActiveModalEvent(event);
  };

  const handleCloseEvent = useCallback((e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    lastClosedAt.current = Date.now();
    setActiveModalEvent(null);
  }, []);

  // Lock body scroll + Escape key to close event modal
  useEffect(() => {
    if (!activeModalEvent) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') handleCloseEvent();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeModalEvent, handleCloseEvent]);

  // Share Event details with native Web Share API or Clipboard copy
  const handleShareEvent = async (e, event) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}#eventos`;
    const shareText = `¡Revive ${event.name} (${event.date}) en La Otakonce Concepción!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          // fallback to clipboard
        } else {
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedEventId(event.id);
      setTimeout(() => setCopiedEventId(null), 2500);
    } catch {
      // ignore
    }
  };

  // Carousel refs & state for preview mode
  const sliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Repeat items for seamless continuous loop in carousel mode
  const carouselItems = useMemo(() => {
    if (!events || events.length === 0) return [];
    if (events.length <= 2) return [...events, ...events, ...events, ...events, ...events, ...events];
    if (events.length <= 4) return [...events, ...events, ...events, ...events];
    return [...events, ...events, ...events];
  }, [events]);

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
        const speed = 0.052; // pixels/ms (~52px/sec) — smooth, balanced showcase drift
        sliderRef.current.scrollLeft += speed * delta;

        const { scrollLeft, scrollWidth } = sliderRef.current;
        const repeatCount = carouselItems.length / events.length;
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
  }, [mode, carouselItems, events.length]);

  // Initial scroll position to the middle clone for bidirectional infinite scrolling
  useEffect(() => {
    if (mode !== 'preview') return;
    const track = sliderRef.current;
    if (!track || !events.length) return;
    const timeout = setTimeout(() => {
      const repeatCount = carouselItems.length / events.length;
      const singleSetWidth = track.scrollWidth / repeatCount;
      if (singleSetWidth > 0 && track.scrollLeft === 0) {
        track.scrollLeft = singleSetWidth;
      }
    }, 80);
    return () => clearTimeout(timeout);
  }, [mode, carouselItems.length, events.length]);

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
    const step = Math.max(280, sliderRef.current.clientWidth * 0.75);
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    });
    resumeInteractionAfterDelay(3500);
  };

  if (!events || events.length === 0) return null;

  return (
    <section
      aria-label="Todos nuestros eventos"
      className="section-padding"
      id="eventos"
      style={{
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.005)',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Encabezado de sección estandarizado .section-title */}
        <div className="section-title">
          <h2>Todos Nuestros <span className="text-neon-cyan">Eventos</span></h2>
          <p>Revive los momentos más épicos y descubre todas las actividades que han marcado la historia de Otakonce.</p>
        </div>

        {/* =========================================================================
            PREVIEW MODE: HORIZONTAL CAROUSEL SLIDER (Strictly contained inside .container)
            ========================================================================= */}
        {mode === 'preview' ? (
          <div>
            <div className="events-infinite-container group-carousel">
              {/* CardPoint-style Floating Left Arrow */}
              <button
                onClick={() => scrollManual('left')}
                aria-label="Evento anterior"
                className="carousel-floating-btn carousel-floating-left"
              >
                <ChevronLeft size={22} className="stroke-[2.5]" />
              </button>

              {/* CardPoint-style Floating Right Arrow */}
              <button
                onClick={() => scrollManual('right')}
                aria-label="Siguiente evento"
                className="carousel-floating-btn carousel-floating-right"
              >
                <ChevronRight size={22} className="stroke-[2.5]" />
              </button>

              <div
                ref={sliderRef}
                className="events-infinite-track"
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
                {carouselItems.map((event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    className="events-infinite-item"
                  >
                    <div 
                      className="event-card-carousel glass-card"
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver detalles del evento ${event.name}`}
                      onClick={() => {
                        if (!hasMoved.current) {
                          handleOpenEvent(event);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenEvent(event);
                        }
                      }}
                    >
                      {/* Imagen del evento con fallback */}
                      <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                        <img
                          src={event.image}
                          alt={event.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
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
                            background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}
                        >
                          <Sparkles size={18} style={{ marginRight: '6px' }} /> Otakonce Event
                        </div>

                        {/* Badge de fecha */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'var(--primary)',
                            color: '#000',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}
                        >
                          <Calendar size={13} /> {event.date}
                        </div>
                      </div>

                      {/* Info del evento */}
                      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
                          {event.name}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.86rem', lineHeight: 1.45, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {event.description}
                        </p>
                        {event.highlights && event.highlights.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '14px' }}>
                            {event.highlights.map((h, i) => (
                              <span
                                key={i}
                                style={{
                                  background: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: 'var(--text-secondary)',
                                  padding: '2px 8px',
                                  borderRadius: '8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 650
                                }}
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón "Ver todos los eventos" */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigate && onNavigate('past-events')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 22px', fontSize: '0.9rem' }}
              >
                Ver todos los eventos <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              GRID MODE: DEDICATED EVENT CARDS GRID (#past-events)
              ========================================================================= */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                className="event-card-hover"
                role="button"
                tabIndex={0}
                aria-label={`Ver detalles del evento ${event.name}`}
                onClick={() => handleOpenEvent(event)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenEvent(event);
                  }
                }}
              >
                {/* Imagen del evento con fallback */}
                <div style={{ position: 'relative', paddingTop: '58%', overflow: 'hidden' }}>
                  <img
                    src={event.image}
                    alt={event.name}
                    loading="lazy"
                    decoding="async"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
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
                      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    <Sparkles size={18} style={{ marginRight: '6px' }} /> Otakonce Event
                  </div>
                  {/* Badge de fecha */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'var(--primary)',
                      color: '#000',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Calendar size={12} /> {event.date}
                  </div>
                </div>

                {/* Info del evento */}
                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
                    {event.name}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                    {event.description}
                  </p>
                  {event.highlights && event.highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                      {event.highlights.map((h, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-secondary)',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-in-1 PAST EVENT DETAILS MODAL (Portal: avoids any parent overflow/stacking issues) */}
      {activeModalEvent && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCloseEvent();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 5, 10, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(12px, 3vw, 24px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
          className="animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="event-modal-card"
          >
            {/* Close Button in top right of modal card */}
            <button
              type="button"
              onClick={handleCloseEvent}
              aria-label="Cerrar modal de evento"
              className="event-modal-close-btn"
            >
              <X size={20} style={{ pointerEvents: 'none' }} />
            </button>

            {/* LEFT COLUMN: FULL EVENT POSTER / PHOTO */}
            <div className="event-modal-photo-box">
              <img
                src={activeModalEvent.image}
                alt={activeModalEvent.name}
                loading="eager"
                decoding="async"
                className="event-modal-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
              <div
                style={{
                  display: 'none',
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <Sparkles size={32} />
                <span>Otakonce Event</span>
              </div>

              {/* Overlay Badges on the photo */}
              <div className="event-modal-badges">
                <span className="badge-event-date">
                  <Calendar size={13} /> {activeModalEvent.date}
                </span>
                <span className="badge-event-tag">
                  <Tag size={12} /> Edición Histórica
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: INFO & ACTIONS BOX */}
            <div className="event-modal-info-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '40px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  HISTORIAL DE EVENTOS OTAKONCE
                </span>
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', fontWeight: 850, margin: '2px 0 0', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                  {activeModalEvent.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--secondary)', marginTop: '2px' }}>
                  <Calendar size={15} /> {activeModalEvent.date}
                </div>
              </div>

              {/* Event description with smooth scrolling */}
              <div className="event-modal-desc">
                <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>
                  {activeModalEvent.description || 'Detalles de esta gran edición de La Otakonce.'}
                </p>

                {/* Highlights / Hitos pills */}
                {activeModalEvent.highlights && activeModalEvent.highlights.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 750, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Hitos & Actividades Destacadas
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeModalEvent.highlights.map((h, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(0, 240, 255, 0.08)',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            color: 'var(--text-primary)',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 650,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          ✨ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons at bottom */}
              <div className="event-modal-actions">
                <button
                  onClick={(e) => handleShareEvent(e, activeModalEvent)}
                  className="btn btn-secondary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    width: '100%', 
                    minHeight: '44px', 
                    fontWeight: 700,
                    fontSize: '0.92rem'
                  }}
                >
                  {copiedEventId === activeModalEvent.id ? <Check size={16} /> : <Share2 size={16} />}
                  {copiedEventId === activeModalEvent.id ? '¡Enlace Copiado al Portapapeles!' : 'Compartir Evento'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        /* Infinite Carousel Layout strictly contained inside .container */
        .events-infinite-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
        }

        .events-infinite-track {
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
        .events-infinite-track:active {
          cursor: grabbing;
        }
        .events-infinite-track::-webkit-scrollbar {
          display: none;
        }

        .events-infinite-item {
          flex: 0 0 340px;
          width: 340px;
        }

        .event-card-carousel {
          width: 100%;
          height: 380px;
          display: flex;
          flex-direction: column;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .event-card-carousel:hover {
          transform: translateY(-5px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
        }

        .event-card-hover:hover {
          transform: translateY(-5px);
          border-color: var(--secondary) !important;
          box-shadow: 0 14px 40px rgba(124,58,237,0.3);
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
          .events-infinite-track {
            gap: 14px;
            padding: 4px 2px 14px;
          }
          .events-infinite-item {
            flex: 0 0 min(280px, 78vw);
            width: min(280px, 78vw);
          }
          .event-card-carousel {
            height: 360px;
            border-radius: 16px;
          }
        }

        /* 2-in-1 Past Event Modal Card */
        .event-modal-card {
          background: var(--bg-surface-solid);
          border: 2px solid var(--border-color);
          border-radius: 24px;
          width: min(860px, 94vw);
          max-height: min(88vh, 560px);
          display: flex;
          flex-direction: row;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.65), 0 0 35px rgba(0, 240, 255, 0.15);
          position: relative;
          margin: auto;
        }

        .event-modal-photo-box {
          flex: 0 0 46%;
          max-width: 46%;
          position: relative;
          background: #0A0D18;
          overflow: hidden;
          display: flex;
          align-items: center;
          justifyContent: center;
        }

        .event-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .event-modal-badges {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          justifyContent: space-between;
          align-items: center;
          gap: 8px;
          z-index: 5;
          flex-wrap: wrap;
        }

        .badge-event-date {
          background: var(--primary);
          color: #000000;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .badge-event-tag {
          background: rgba(8, 7, 17, 0.88);
          color: #FFFFFF;
          border: 1px solid rgba(0, 136, 255, 0.35);
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.76rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(4px);
        }

        .event-modal-info-box {
          flex: 1 1 54%;
          display: flex;
          flex-direction: column;
          padding: 32px 28px;
          overflow-y: auto;
          position: relative;
          gap: 16px;
        }

        .event-modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 42px !important;
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          border-radius: 50% !important;
          background: rgba(15, 23, 42, 0.08);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 50;
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
          padding: 0 !important;
        }
        .event-modal-close-btn:hover {
          background: var(--secondary) !important;
          color: #FFFFFF !important;
          border-color: transparent !important;
          transform: scale(1.08);
        }
        .event-modal-close-btn:active {
          transform: scale(0.94);
        }

        .event-modal-desc {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 4px;
        }

        .event-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: auto;
        }

        /* Mobile Responsive Layout for Event Modal */
        @media (max-width: 679px) {
          .event-modal-card {
            flex-direction: column !important;
            width: min(450px, 94vw) !important;
            max-height: min(90vh, 640px) !important;
          }
          .event-modal-photo-box {
            flex: 0 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            height: clamp(200px, 30vh, 250px) !important;
          }
          .event-modal-info-box {
            padding: 20px 18px !important;
            gap: 12px !important;
          }
          .event-modal-close-btn {
            top: 12px !important;
            right: 12px !important;
            width: 38px !important;
            height: 38px !important;
            min-height: 38px !important;
            max-height: 38px !important;
            background: rgba(8, 7, 17, 0.85) !important;
            color: #FFFFFF !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            z-index: 60 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default EventsShowcase;
