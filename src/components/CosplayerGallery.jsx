import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Share2, Check, X, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { slugify } from '../utils/slugify';

const Instagram = ({ size = 18, ...props }) => (
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

const WhatsAppIcon = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const CosplayerGallery = ({ cosplayers = [] }) => {
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCosplayer, setActiveModalCosplayer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const sliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Filter only community / general cosplayers (non-guest)
  const communityList = useMemo(() => {
    const list = cosplayers.filter(c => c.type !== 'guest');
    return list.length > 0 ? list : cosplayers;
  }, [cosplayers]);

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set();
    communityList.forEach(c => {
      if (c.city) set.add(c.city.trim());
    });
    return ['Todas', ...Array.from(set)];
  }, [communityList]);

  // Filtered cosplayers by city and search query
  const filteredCosplayers = useMemo(() => {
    return communityList.filter(c => {
      const matchesCity = selectedCity === 'Todas' || (c.city && c.city.trim() === selectedCity);
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        c.name.toLowerCase().includes(q) || 
        (c.character && c.character.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q));
      return matchesCity && matchesQuery;
    });
  }, [communityList, selectedCity, searchQuery]);

  // Infinite carousel items repetition
  const carouselItems = useMemo(() => {
    if (!filteredCosplayers || filteredCosplayers.length === 0) return [];
    if (filteredCosplayers.length === 1) return [...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers];
    if (filteredCosplayers.length <= 3) return [...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers];
    return [...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers];
  }, [filteredCosplayers]);

  // RequestAnimationFrame slow continuous drift
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteracting.current && sliderRef.current && carouselItems.length > 0) {
        const speed = 0.042; // pixels/ms (~42px/sec)
        sliderRef.current.scrollLeft += speed * delta;

        const { scrollLeft, scrollWidth } = sliderRef.current;
        const repeatCount = carouselItems.length / filteredCosplayers.length;
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
  }, [carouselItems.length, filteredCosplayers.length]);

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
    const cardWidth = window.innerWidth < 768 ? 296 : 374;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth'
    });
    resumeInteractionAfterDelay(3500);
  };

  const handleShareCosplayer = (e, cosplayer) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#cosplay/${slugify(cosplayer.name)}`;
    const text = `¡Mira la ficha de ${cosplayer.name} (${cosplayer.character}) en Otakonce 2026! 🌸 ${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${cosplayer.name} | Otakonce 2026`,
        text: text,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedId(cosplayer.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleWhatsAppShare = (e, cosplayer) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#cosplay/${slugify(cosplayer.name)}`;
    const text = encodeURIComponent(`¡Mira la ficha de ${cosplayer.name} (${cosplayer.character}) en Otakonce 2026! 🌸 ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <section className="section-padding" id="cosplay" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-title" style={{ marginBottom: 0, textAlign: 'left' }}>
            <h2 style={{ textAlign: 'left' }}>Pasarela <span className="text-neon-pink">Cosplay</span> & Comunidad</h2>
            <p style={{ textAlign: 'left', maxWidth: '600px' }}>El talento de Concepción y de todo el país reunido en un solo lugar. Conoce a los exponentes, apóyalos en sus redes y comparte sus fichas.</p>
          </div>
        </div>

        {/* Filter Controls: City Tabs & Search Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', width: '100%' }}>
          {/* City Selector Pills */}
          <div 
            className="cosplay-city-filters"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '4px',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                style={{
                  background: selectedCity === city 
                    ? 'linear-gradient(135deg, var(--cyan) 0%, var(--secondary) 100%)' 
                    : 'var(--bg-surface-solid)',
                  border: '1.5px solid',
                  borderColor: selectedCity === city ? 'transparent' : 'var(--border-color)',
                  color: selectedCity === city ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selectedCity === city ? '0 4px 12px rgba(0, 136, 255, 0.25)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {city !== 'Todas' && <MapPin size={12} />}
                {city}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
            <input
              type="text"
              placeholder="Buscar cosplayer o personaje..."
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

        {/* Infinite Carousel Track strictly contained within .container */}
        {filteredCosplayers.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <User size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No se encontraron cosplayers</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Intenta seleccionar otra ciudad o limpiar el término de búsqueda.</p>
          </div>
        ) : (
          <div className="cosplay-infinite-container group-carousel">
            {/* Floating Left Arrow (CardPoint style) */}
            <button
              onClick={() => scrollManual('left')}
              aria-label="Cosplayer anterior"
              className="carousel-floating-btn carousel-floating-left"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </button>

            {/* Floating Right Arrow (CardPoint style) */}
            <button
              onClick={() => scrollManual('right')}
              aria-label="Siguiente cosplayer"
              className="carousel-floating-btn carousel-floating-right"
            >
              <ChevronRight size={22} className="stroke-[2.5]" />
            </button>

            <div 
              ref={sliderRef}
              className="cosplay-infinite-track"
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
            {carouselItems.map((cosplayer, index) => (
              <div 
                key={`${cosplayer.id}-${index}`}
                className="cosplay-infinite-item"
              >
                <div 
                  onClick={() => {
                    if (!hasMoved.current) {
                      setActiveModalCosplayer(cosplayer);
                    }
                  }}
                  className="community-cosplay-card glass-card"
                >
                  {/* Image Container */}
                  <div
                    role="img"
                    aria-label={`Foto de ${cosplayer.name}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                      backgroundImage: cosplayer.image ? `url(${cosplayer.image})` : 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center 20%',
                      position: 'relative'
                    }}
                    className="image-loader-bg"
                  >
                    {/* Top Badges */}
                    <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, gap: '6px' }}>
                      {/* Character Tag */}
                      <span 
                        style={{
                          background: 'rgba(8,7,17,0.85)',
                          border: '1.5px solid var(--secondary)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          backdropFilter: 'blur(6px)'
                        }}
                      >
                        {cosplayer.character}
                      </span>

                      {/* City Badge */}
                      {cosplayer.city && (
                        <span
                          style={{
                            background: 'rgba(8,7,17,0.85)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#E2E8F0',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <MapPin size={10} color="var(--cyan)" />
                          {cosplayer.city}
                        </span>
                      )}
                    </div>

                    {/* Bottom Content Gradient */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '68%',
                        background: 'linear-gradient(to top, rgba(8, 7, 17, 0.98) 0%, rgba(8, 7, 17, 0.72) 45%, transparent 100%)',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '18px',
                        gap: '6px'
                      }}
                    >
                      {cosplayer.role && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {cosplayer.role}
                        </span>
                      )}

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#FFFFFF', lineHeight: 1.2, margin: 0 }}>
                        {cosplayer.name}
                      </h3>

                      <p style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.4, margin: '2px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cosplayer.bio}
                      </p>

                      {/* Card Actions: Instagram & Share */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px' }}>
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
                            gap: '5px',
                            color: 'var(--secondary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(253, 52, 132, 0.12)'
                          }}
                          className="hover-glow"
                        >
                          <Instagram size={13} />
                          @{cosplayer.instagram ? cosplayer.instagram.split('/').filter(Boolean).pop() : 'instagram'}
                        </a>

                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={(e) => {
                              if (hasMoved.current) {
                                e.preventDefault();
                                return;
                              }
                              handleWhatsAppShare(e, cosplayer);
                            }}
                            title="Compartir por WhatsApp"
                            style={{
                              background: 'rgba(37, 211, 102, 0.15)',
                              color: '#25D366',
                              border: '1px solid rgba(37, 211, 102, 0.3)',
                              padding: '5px 7px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <WhatsAppIcon size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              if (hasMoved.current) {
                                e.preventDefault();
                                return;
                              }
                              handleShareCosplayer(e, cosplayer);
                            }}
                            title="Copiar enlace a su ficha"
                            style={{
                              background: copiedId === cosplayer.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                              color: copiedId === cosplayer.id ? '#10B981' : '#FFFFFF',
                              border: '1px solid rgba(255,255,255,0.15)',
                              padding: '5px 7px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {copiedId === cosplayer.id ? <Check size={13} /> : <Share2 size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Modal Profile View */}
      {activeModalCosplayer && (
        <div 
          onClick={() => setActiveModalCosplayer(null)}
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
              {activeModalCosplayer.image && (
                <img 
                  src={activeModalCosplayer.image} 
                  alt={activeModalCosplayer.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              )}
              
              <button
                onClick={() => setActiveModalCosplayer(null)}
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

              <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                <span style={{ background: 'var(--secondary)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                  {activeModalCosplayer.character}
                </span>
                {activeModalCosplayer.city && (
                  <span style={{ background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--cyan)" /> {activeModalCosplayer.city}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase' }}>
                  {activeModalCosplayer.role || 'Cosplayer Otakonce 2026'}
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 850, margin: '2px 0 8px' }}>
                  {activeModalCosplayer.name}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeModalCosplayer.bio}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <a
                  href={activeModalCosplayer.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', textDecoration: 'none' }}
                >
                  <Instagram size={17} /> Seguir en Instagram
                </a>

                <button
                  onClick={(e) => handleShareCosplayer(e, activeModalCosplayer)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                >
                  {copiedId === activeModalCosplayer.id ? <Check size={16} /> : <Share2 size={16} />}
                  {copiedId === activeModalCosplayer.id ? '¡Enlace Copiado!' : 'Compartir Ficha en Redes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Infinite Carousel Contained Inside .container */
        .cosplay-infinite-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
        }

        /* Continuous Smooth Track */
        .cosplay-infinite-track {
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
        .cosplay-infinite-track:active {
          cursor: grabbing;
        }
        .cosplay-infinite-track::-webkit-scrollbar {
          display: none;
        }

        /* Item Width inside Container */
        .cosplay-infinite-item {
          flex: 0 0 350px;
          width: 350px;
        }

        /* Card Styling */
        .community-cosplay-card {
          width: 100%;
          height: 460px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .community-cosplay-card:hover {
          transform: translateY(-6px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
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
          .cosplay-infinite-track {
            gap: 16px;
            padding: 4px 0 16px;
          }
          .cosplay-infinite-item {
            flex: 0 0 280px;
            width: 280px;
          }
          .community-cosplay-card {
            height: 410px;
            border-radius: 18px;
          }
        }
      `}</style>
    </section>
  );
};

export default CosplayerGallery;
