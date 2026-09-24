import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { heroSrc } from '../services/media';
const OtakonceLogo = ({ size = '260px' }) => (
  <div 
    style={{
      width: size,
      maxWidth: 'min(75vw, 320px)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      animation: 'float 5s ease-in-out infinite',
      flexShrink: 0,
      margin: '0 auto',
      filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.4))'
    }}
    className="otakonce-main-logo"
  >
    <img 
      src="/otakonce-logo.svg" 
      alt="Otakonce 2026 Logo Oficial" 
      width="260"
      height="120"
      fetchpriority="high"
      decoding="async"
      style={{ width: '100%', height: 'auto', display: 'block' }} 
    />
  </div>
);

/**
 * Texto legible sobre cualquier color de badge: oscuro sobre fondos claros,
 * blanco sobre fondos oscuros (ej. amarillo #FFE200 => texto oscuro).
 */
const getBadgeTextColor = (bg) => {
  if (!bg || !/^#[0-9a-fA-F]{6}$/.test(bg)) return '#FFFFFF';
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#0F172A' : '#FFFFFF';
};

const Hero = ({ config, onNavigate, banners }) => {  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  // Precarga todas las imágenes para que el crossfade nunca muestre blanco
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    banners.forEach((b) => {
      if (!b?.image) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = heroSrc(b.image);
    });
  }, [banners]);

  useEffect(() => {
    const targetDate = new Date(config.countdownDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [config.countdownDate]);

  // Auto-rotate banners (siempre activo)
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000); // 6 seconds slide duration
    return () => clearInterval(interval);
  }, [banners]);

  const activeBanner = banners && banners.length > 0 && banners[currentSlide]
    ? banners[currentSlide]
    : { title: config.title, subtitle: config.subtitle, image: config.bannerImage || '/assets/hero_banner.webp' };

  return (
    <section 
      aria-label="Portada Otakonce 2026"
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--header-height) - var(--announcement-height, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowX: 'hidden',
        backgroundColor: 'var(--bg-deep)'
      }}
      className="hero-section"
    >
      {/* Widescreen Background Slider (cross-fade transition) with dynamic alignment gradient mask */}
      {(banners && banners.length > 0 ? banners : [{ id: 'default', image: config.bannerImage || '/assets/hero_banner.webp', alignmentX: 'left' }]).map((banner, idx) => {
        const isActive = (banners && banners.length > 0 ? idx === currentSlide : true);
        
        // Define overlay gradient based on text alignment (legibilidad reforzada)
        let overlayGradient = 'linear-gradient(to right, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.6) 55%, rgba(15, 23, 42, 0.15) 100%)';
        if (banner.alignmentX === 'right') {
          overlayGradient = 'linear-gradient(to left, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.6) 55%, rgba(15, 23, 42, 0.15) 100%)';
        } else if (banner.alignmentX === 'center') {
          overlayGradient = 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.62) 55%, rgba(15, 23, 42, 0.3) 100%)';
        }

        return (
          <div
            key={banner.id || idx}
            aria-hidden={!isActive}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              // Solo opacidad (sin visibility): el navegador mantiene las imágenes
              // cargadas y el fundido es continuo, sin flash blanco entre banners
              opacity: isActive ? 1 : 0,
              transition: 'opacity 1.6s ease-in-out',
              willChange: 'opacity',
              zIndex: isActive ? 2 : 1,
              pointerEvents: 'none'
            }}
          >
            {/* Background Image */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${heroSrc(banner.image)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1
              }}
            />
            {/* Legibility Gradient Overlay */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: overlayGradient,
                zIndex: 2
              }}
            />
          </div>
        );
      })}

      {/* Decorative Glowing Orbs */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '15%', left: '15%', width: '120px', height: '120px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.15, pointerEvents: 'none', zIndex: 2 }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '15%', right: '15%', width: '150px', height: '150px', background: 'var(--cyan)', filter: 'blur(90px)', opacity: 0.1, pointerEvents: 'none', zIndex: 2 }} />

      <div 
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'calc(100vh - var(--header-height) - var(--announcement-height, 0px) - 48px)',
          zIndex: 10,
          gap: '24px',
          width: '100%'
        }}
      >
        {/* CSS Official Logo Replica */}
        <div style={{ marginTop: '12px' }}>
          <OtakonceLogo size="140px" />
        </div>

        {/* Dynamic pop-art text overlay (keyed on currentSlide to trigger slide-in / fade-in animation) */}
        <div
          key={currentSlide}
          style={{
            width: '100%',
            maxWidth: '1200px',
            // Altura mínima fija: el bloque ocupa siempre lo mismo y la barra
            // inferior (fecha + contador) no se mueve entre banners
            minHeight: 'clamp(230px, 32vh, 320px)',
            justifyContent: 'center',
            textAlign: activeBanner.alignmentX === 'right' ? 'right' : activeBanner.alignmentX === 'center' ? 'center' : 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: activeBanner.alignmentX === 'right' ? 'flex-end' : activeBanner.alignmentX === 'center' ? 'center' : 'flex-start',
            gap: '12px',
            marginTop: '20px',
            marginBottom: '40px',
            animation: 'fadeIn var(--transition-fast)'
          }}
          className="hero-text-overlay"
        >
          {/* Optional Badge */}
          {activeBanner.badge && (
            <span 
              style={{
                background: activeBanner.badgeBgColor || 'var(--cyan)',
                color: getBadgeTextColor(activeBanner.badgeBgColor),
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: '2px solid #0F172A',
                boxShadow: '3px 3px 0px #0F172A',
                display: 'inline-block'
              }}
            >
              {activeBanner.badge}
            </span>
          )}

          {/* Title */}
          <h1 
            style={{
              fontSize: 'clamp(1.8rem, 5.5vw, 3.4rem)',
              fontWeight: 950,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: activeBanner.titleColor || '#FFFFFF',
              textShadow: '2px 2px 0px #0F172A, -2px -2px 0px #0F172A, 2px -2px 0px #0F172A, -2px 2px 0px #0F172A, 5px 5px 0px rgba(15, 23, 42, 0.45)',
              maxWidth: '750px',
              margin: 0
            }}
          >
            {activeBanner.title}
          </h1>

          {/* Subtitle */}
          <p 
            style={{
              fontSize: 'clamp(0.9rem, 2.2vw, 1.15rem)',
              color: activeBanner.subtitleColor || '#FFFFFF',
              fontWeight: 650,
              lineHeight: 1.45,
              textShadow: '1px 1px 0px #0F172A, -1px -1px 0px #0F172A, 1px -1px 0px #0F172A, -1px 1px 0px #0F172A, 3px 3px 0px rgba(15, 23, 42, 0.4)',
              maxWidth: '550px',
              margin: 0,
              marginLeft: activeBanner.alignmentX === 'right' ? 'auto' : activeBanner.alignmentX === 'center' ? 'auto' : '0',
              marginRight: activeBanner.alignmentX === 'left' ? 'auto' : activeBanner.alignmentX === 'center' ? 'auto' : '0'
            }}
          >
            {activeBanner.subtitle}
          </p>

          {/* CTA Button */}
          {activeBanner.linkUrl && activeBanner.linkUrl !== '#' && (
            <a 
              href={activeBanner.linkUrl}
              onClick={(e) => {
                if (activeBanner.linkUrl.startsWith('#')) {
                  e.preventDefault();
                  onNavigate(activeBanner.linkUrl.substring(1));
                }
              }}
              style={{
                background: 'var(--primary)',
                color: '#0F172A',
                padding: '12px 22px',
                minHeight: '44px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: '2px solid #0F172A',
                boxShadow: '3px 3px 0px #0F172A',
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'var(--transition-fast)'
              }}
              className="banner-cta-btn"
            >
              {activeBanner.linkLabel || 'Saber Más'}
              <ChevronRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Carousel Indicators (Dots) */}
        {banners && banners.length > 1 && (
          <div role="group" aria-label="Selector de banner" style={{ display: 'flex', gap: '4px', justifyContent: 'center', margin: '4px 0', zIndex: 12, alignItems: 'center' }}>
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0
                }}
                aria-label={idx === currentSlide ? `Banner ${idx + 1} de ${banners.length} (actual)` : `Ir al banner ${idx + 1} de ${banners.length}`}
                aria-current={idx === currentSlide ? 'true' : undefined}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'block',
                    width: idx === currentSlide ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === currentSlide ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.5)',
                    border: idx === currentSlide ? '1px solid #0F172A' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Bottom sticky bar containing Date, Location, and Countdown */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            width: '100%',
            background: 'var(--bg-surface-solid)',
            border: '3px solid var(--border-pop, #0F172A)',
            borderRadius: '28px',
            padding: '20px 32px',
            boxShadow: '8px 8px 0px var(--shadow-pop, rgba(15, 23, 42, 0.15))',
            zIndex: 10,
            marginTop: 'auto',
            marginBottom: 'max(32px, env(safe-area-inset-bottom, 32px))'
          }}
          className="hero-bottom-bar"
        >
          {/* Date & Location column */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }} className="hero-bottom-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={22} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', fontWeight: 850, color: 'var(--text-primary)' }}>{config.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={22} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', fontWeight: 850, color: 'var(--text-primary)' }}>{config.location}</span>
            </div>
          </div>

          {/* Countdown column */}
          {!timeLeft.expired ? (
            <div className="hero-countdown-container hero-bottom-col" role="timer" aria-live="off" aria-label={`Faltan ${timeLeft.days} días, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos`}>
              <span style={{ fontSize: '0.8rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>Faltan:</span>
              <div className="hero-countdown-grid">
                {[
                  { val: timeLeft.days, unit: 'días' },
                  { val: timeLeft.hours, unit: 'hrs' },
                  { val: timeLeft.minutes, unit: 'min' },
                  { val: timeLeft.seconds, unit: 'seg' }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="hero-countdown-box"
                    style={{ 
                      background: 'var(--countdown-box-bg, rgba(15, 23, 42, 0.04))', 
                      border: '2px solid var(--countdown-box-border, var(--border-pop, #0F172A))', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'baseline', 
                      justifyContent: 'center',
                      gap: '3px',
                      boxShadow: '2px 2px 0px var(--shadow-pop, rgba(15, 23, 42, 0.05))'
                    }}
                  >
                    <span style={{ fontWeight: 950, fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)', fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums', color: 'var(--countdown-num-color, var(--text-primary))', lineHeight: 1 }}>{String(item.val).padStart(2, '0')}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--countdown-unit-color, var(--text-secondary))', textTransform: 'uppercase' }}>{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hero-bottom-col">
              <span 
                style={{ 
                  background: 'var(--btn-primary-bg, var(--primary))', 
                  color: 'var(--btn-primary-text, #FFFFFF)', 
                  border: '2px solid var(--border-pop, #0F172A)', 
                  boxShadow: '3px 3px 0px var(--border-pop, #0F172A)', 
                  padding: '8px 18px', 
                  borderRadius: '14px', 
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', 
                  fontWeight: 900,
                  letterSpacing: '0.02em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Próximamente más información
              </span>
            </div>
          )}

          {/* Action buttons column */}
          <div style={{ display: 'flex', gap: '12px' }} className="hero-bottom-actions hero-bottom-col">
            <button 
              className="btn btn-primary" 
              onClick={() => onNavigate('schedule')}
              style={{ minHeight: '44px', padding: '8px 24px', fontSize: '0.9rem' }}
            >
              Cronograma
              <ChevronRight size={16} />
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => onNavigate('news')}
              style={{ minHeight: '44px', padding: '8px 24px', fontSize: '0.9rem' }}
            >
              Noticias
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .banner-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px #0F172A;
        }
        .hero-btn-secondary:hover {
          background-color: var(--primary) !important;
          color: #0F172A !important;
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px rgba(15, 23, 42, 0.25) !important;
        }
        .hero-countdown-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hero-countdown-grid {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .hero-countdown-box {
          padding: 6px 12px;
          min-width: 46px;
        }
        .hero-bottom-bar {
          flex-direction: column;
          align-items: stretch !important;
          gap: 16px !important;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .hero-bottom-bar {
            flex-direction: row;
            align-items: center !important;
            margin-bottom: 56px !important;
          }
        }
        @media (max-width: 767px) {
          .hero-bottom-bar {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding: 20px 16px !important;
            border-radius: 22px !important;
            box-shadow: 4px 4px 0px var(--shadow-pop, rgba(15, 23, 42, 0.15)) !important;
          }
          .hero-countdown-container {
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .hero-countdown-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px !important;
            width: 100% !important;
            max-width: 320px !important;
          }
          .hero-countdown-box {
            padding: 8px 4px !important;
            border-radius: 10px !important;
            width: 100% !important;
          }
          .hero-bottom-col {
            justify-content: center;
            display: flex;
          }
          .hero-bottom-actions {
            width: 100%;
          }
          .hero-bottom-actions button {
            flex: 1;
          }
        }
        @media (max-width: 380px) {
          .hero-bottom-bar {
            padding: 16px 10px !important;
            border-radius: 18px !important;
          }
          .hero-countdown-grid {
            gap: 5px !important;
          }
          .hero-countdown-box {
            padding: 6px 2px !important;
          }
        }
        @media (min-width: 768px) {
          .hero-section {
            padding: 80px 0 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
