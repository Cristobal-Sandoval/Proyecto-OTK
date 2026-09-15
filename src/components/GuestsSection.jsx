import React, { useRef, useMemo, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, Search, X, User } from 'lucide-react';

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

const GuestsSection = ({ guests = [], mode = 'carousel', onNavigate, onSelectGuest }) => {
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalGuest, setActiveModalGuest] = useState(null);

  // Carousel refs & state
  const sliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Repeat items for seamless continuous loop in carousel mode
  const carouselItems = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    if (guests.length <= 2) return [...guests, ...guests, ...guests, ...guests, ...guests, ...guests];
    if (guests.length <= 4) return [...guests, ...guests, ...guests, ...guests];
    return [...guests, ...guests, ...guests];
  }, [guests]);

  // RequestAnimationFrame continuous slow auto-drift (only active in carousel mode)
  useEffect(() => {
    if (mode !== 'carousel') return;
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
    };
  }, [mode, carouselItems, guests.length]);

  // Pause on user manual interaction, resume smoothly after 2.5s
  const pauseInteraction = () => {
    isInteracting.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const resumeInteractionAfterDelay = (ms = 2500) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, ms);
  };

  // Mouse Drag / Touch Swipe Handlers for carousel
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

  // Manual scroll with CardPoint floating arrows
  const scrollManual = (direction) => {
    if (!sliderRef.current) return;
    pauseInteraction();
    const cardWidth = window.innerWidth < 768 ? 296 : 374;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth'
    });
    resumeInteractionAfterDelay(3500);
  };

  // Grid filtering & searching
  const categories = ['Todos', 'Jurados', 'Invitados VIP', 'Cosmakers'];

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch = 
        (guest.name && guest.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (guest.character && guest.character.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (guest.role && guest.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (guest.city && guest.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (guest.bio && guest.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCategory = true;
      if (selectedFilter === 'Jurados') {
        matchesCategory = (guest.role || '').toLowerCase().includes('jurado');
      } else if (selectedFilter === 'Invitados VIP') {
        matchesCategory = (guest.role || '').toLowerCase().includes('vip') || (guest.role || '').toLowerCase().includes('estelar') || (guest.role || '').toLowerCase().includes('invitada') || (guest.role || '').toLowerCase().includes('invitado');
      } else if (selectedFilter === 'Cosmakers') {
        matchesCategory = (guest.role || '').toLowerCase().includes('cosmaker') || (guest.bio || '').toLowerCase().includes('cosmaker') || (guest.bio || '').toLowerCase().includes('confección');
      }

      return matchesSearch && matchesCategory;
    });
  }, [guests, searchQuery, selectedFilter]);

  if (guests.length === 0) return null;

  return (
    <section className="section-padding" id="invitados" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* =========================================================================
            HEADER FOR CAROUSEL MODE (Home Page)
            ========================================================================= */}
        {mode === 'carousel' ? (
          <div className="section-title">
            <h2>Invitados <span className="text-neon-pink">Especiales</span></h2>
            <p>Conoce a los cosplayers oficiales, jurados de la pasarela y artistas destacados que nos acompañarán en Otakonce 2026.</p>
          </div>
        ) : (
          /* =========================================================================
             HEADER FOR DEDICATED GRID MODE (#invitados tab - Like News Section)
             ========================================================================= */
          <div>
            <div className="section-title">
              <h2>Invitados Especiales & <span className="text-neon-pink">Jurados</span></h2>
              <p>
                Conoce en profundidad a cada uno de nuestros exponentes oficiales: su trayectoria, personajes estelares, roles en la competencia y redes sociales.
              </p>
            </div>

            {/* Filter Controls: Role Pills + Search Bar */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '36px',
                width: '100%'
              }}
              className="guest-filter-controls"
            >
              {/* Category Pills */}
              <div className="guest-category-list" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    style={{
                      background: selectedFilter === cat ? 'linear-gradient(135deg, var(--secondary) 0%, #7C3AED 100%)' : 'var(--bg-surface-solid)',
                      border: '1.5px solid',
                      borderColor: selectedFilter === cat ? 'transparent' : 'var(--border-color)',
                      color: selectedFilter === cat ? '#FFFFFF' : 'var(--text-secondary)',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: selectedFilter === cat ? '0 4px 14px rgba(253, 52, 132, 0.3)' : 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {cat === 'Todos' ? <Star size={13} fill="currentColor" /> : null}
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre, personaje o rol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px 11px 40px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-solid)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                />
                <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CAROUSEL VIEW (Used on Home: Infinite drift with CardPoint floating arrows)
            ========================================================================= */}
        {mode === 'carousel' ? (
          <div>
            <div className="guests-infinite-container group-carousel">
              {/* CardPoint-style Floating Left Arrow */}
              <button
                onClick={() => scrollManual('left')}
                aria-label="Invitado anterior"
                className="carousel-floating-btn carousel-floating-left"
              >
                <ChevronLeft size={22} className="stroke-[2.5]" />
              </button>

              {/* CardPoint-style Floating Right Arrow */}
              <button
                onClick={() => scrollManual('right')}
                aria-label="Siguiente invitado"
                className="carousel-floating-btn carousel-floating-right"
              >
                <ChevronRight size={22} className="stroke-[2.5]" />
              </button>

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
                    onClick={() => {
                      if (!hasMoved.current) {
                        if (onSelectGuest) {
                          onSelectGuest(guest);
                        } else {
                          setActiveModalGuest(guest);
                        }
                      }
                    }}
                  >
                    <div className="guest-card glass-card">
                      {/* Background Guest Image */}
                      <div
                        role="img"
                        aria-label={`Foto de invitado ${guest.name} como ${guest.character}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                          backgroundImage: guest.image ? `url(${guest.image})` : 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center 20%',
                          position: 'relative'
                        }}
                        className="image-loader-bg"
                      >
                        {/* Top Floating Badges */}
                        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, gap: '8px', flexWrap: 'wrap' }}>
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

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <a 
                              href={guest.instagram}
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
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(253, 52, 132, 0.12)'
                              }}
                              className="hover-glow"
                            >
                              <Instagram size={14} />
                              @{guest.instagram ? guest.instagram.split('/').filter(Boolean).pop() : 'instagram'}
                            </a>

                            <button
                              onClick={(e) => {
                                if (hasMoved.current) {
                                  e.preventDefault();
                                  return;
                                }
                                e.stopPropagation();
                                if (onSelectGuest) {
                                  onSelectGuest(guest);
                                } else {
                                  setActiveModalGuest(guest);
                                }
                              }}
                              className="btn btn-secondary"
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.78rem',
                                fontWeight: 750,
                                borderRadius: '8px',
                                minHeight: 'unset',
                                height: '28px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Ver Ficha &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Button linking to detailed grid */}
            {onNavigate && (
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => onNavigate('invitados')}
                  style={{ padding: '10px 24px', fontSize: '0.92rem' }}
                >
                  Conoce a cada invitado en detalle &rarr;
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             GRID VIEW (Dedicated #invitados page - News format with detailed explanation)
             ========================================================================= */
          <div>
            {filteredGuests.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <User size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No se encontraron invitados</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Intenta cambiar el filtro o limpiar el término de búsqueda.</p>
              </div>
            ) : (
              <div className="grid-responsive">
                {filteredGuests.map((guest) => (
                  <article
                    key={guest.id}
                    className="glass-card guest-news-card"
                    onClick={() => {
                      if (onSelectGuest) {
                        onSelectGuest(guest);
                      } else {
                        setActiveModalGuest(guest);
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      borderRadius: '22px',
                      border: '1.5px solid var(--border-color)',
                      transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
                      background: 'var(--bg-surface-solid)'
                    }}
                  >
                    {/* Top Image Banner */}
                    <div
                      role="img"
                      aria-label={`Foto de ${guest.name}`}
                      style={{
                        height: '240px',
                        width: '100%',
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                        backgroundImage: guest.image ? `url(${guest.image})` : 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 20%',
                        position: 'relative'
                      }}
                      className="image-loader-bg"
                    >
                      {/* Top Badges */}
                      <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, gap: '8px' }}>
                        <span 
                          style={{
                            background: 'linear-gradient(135deg, #00A3FF 0%, #7C3AED 100%)',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            letterSpacing: '0.03em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 10px rgba(0, 163, 255, 0.4)'
                          }}
                        >
                          <Star size={11} fill="#FFFFFF" />
                          {guest.role || 'Invitado Especial'}
                        </span>

                        {guest.city && (
                          <span 
                            style={{
                              background: 'rgba(8, 7, 17, 0.85)',
                              color: '#E2E8F0',
                              borderRadius: '8px',
                              padding: '4px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <MapPin size={11} color="var(--cyan)" />
                            {guest.city}
                          </span>
                        )}
                      </div>

                      {/* Character Pill on Bottom of Image */}
                      <div style={{ position: 'absolute', bottom: '12px', left: '14px', zIndex: 2 }}>
                        <span 
                          style={{
                            background: 'rgba(8, 7, 17, 0.92)',
                            border: '1.5px solid var(--secondary)',
                            borderRadius: '8px',
                            padding: '3px 10px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            backdropFilter: 'blur(6px)'
                          }}
                        >
                          {guest.character}
                        </span>
                      </div>
                    </div>

                    {/* Card Body - Brief Explanation */}
                    <div 
                      style={{
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.25 }}>
                          {guest.name}
                        </h3>
                        
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                          {guest.bio}
                        </p>
                      </div>

                      {/* Card Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-color)', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                          href={guest.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'var(--secondary)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: 'rgba(253, 52, 132, 0.12)'
                          }}
                          className="hover-glow"
                        >
                          <Instagram size={14} />
                          @{guest.instagram ? guest.instagram.split('/').filter(Boolean).pop() : 'instagram'}
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectGuest) {
                              onSelectGuest(guest);
                            } else {
                              setActiveModalGuest(guest);
                            }
                          }}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem', minHeight: 'unset', height: '34px', fontWeight: 800 }}
                        >
                          Ver Ficha Completa &rarr;
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          INTERACTIVE MODAL PROFILE (Full bio, image, actions)
          ========================================================================= */}
      {activeModalGuest && (
        <div 
          onClick={() => setActiveModalGuest(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 5, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          className="animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface-solid)',
              border: '2px solid var(--border-color)',
              borderRadius: '24px',
              maxWidth: '460px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            {/* Modal Header Image */}
            <div style={{ height: '240px', position: 'relative', background: 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)' }}>
              {activeModalGuest.image && (
                <img 
                  src={activeModalGuest.image} 
                  alt={activeModalGuest.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              )}
              
              <button
                onClick={() => setActiveModalGuest(null)}
                aria-label="Cerrar modal"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>

              <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--secondary)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                  {activeModalGuest.character}
                </span>
                {activeModalGuest.city && (
                  <span style={{ background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--cyan)" /> {activeModalGuest.city}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={12} fill="currentColor" /> {activeModalGuest.role || 'Invitado Especial'}
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 850, margin: '2px 0 8px' }}>
                  {activeModalGuest.name}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {activeModalGuest.bio}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <a
                  href={activeModalGuest.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Instagram size={18} />
                  Seguir en Instagram ({activeModalGuest.instagram ? `@${activeModalGuest.instagram.split('/').filter(Boolean).pop()}` : '@instagram'})
                </a>

                <button
                  onClick={() => {
                    const targetGuest = activeModalGuest;
                    setActiveModalGuest(null);
                    if (onSelectGuest) {
                      onSelectGuest(targetGuest);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontWeight: 700 }}
                >
                  Ver Ficha Completa & Galería &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STYLES
          ========================================================================= */}
      <style>{`
        /* Infinite Carousel Contained Inside .container */
        .guests-infinite-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
        }

        /* Continuous Smooth Track */
        .guests-infinite-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 8px 4px 16px;
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

        /* Item Width inside Carousel */
        .guest-infinite-item {
          flex: 0 0 350px;
          width: 350px;
        }

        /* Card Styling for Carousel */
        .guest-card {
          width: 100%;
          height: 460px;
          border-radius: 20px;
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

        /* Card Styling for Grid Mode (News-like) */
        .guest-news-card:hover {
          transform: translateY(-6px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.22) !important;
        }

        /* Floating Navigation Buttons like CardPoint */
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
          left: 14px;
        }
        .carousel-floating-right {
          right: 14px;
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

        /* Filters list styling */
        .guest-filter-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .guest-category-list {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .guest-category-list::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 768px) {
          .guest-filter-controls {
            flex-direction: row !important;
            justify-content: space-between;
            align-items: center;
          }
        }

        /* Mobile Adjustments */
        @media (max-width: 767px) {
          .carousel-floating-btn {
            width: 40px;
            height: 40px;
          }
          .carousel-floating-left {
            left: 8px;
          }
          .carousel-floating-right {
            right: 8px;
          }
          .guests-infinite-track {
            gap: 16px;
            padding: 4px 0 16px;
          }
          .guest-infinite-item {
            flex: 0 0 280px;
            width: 280px;
          }
          .guest-card {
            height: 410px;
            border-radius: 18px;
          }
        }
      `}</style>
    </section>
  );
};

export default GuestsSection;
