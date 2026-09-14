import React, { useEffect, useRef } from 'react';

/**
 * SeasonalOverlay Component
 * Non-intrusive, pure aesthetic visual overlays for special dates.
 * Zero floating pill badges at bottom (per user request).
 * All overlays use pointer-events: none so they never block user clicks.
 */
const SeasonalOverlay = ({ theme = 'normal' }) => {
  const canvasRef = useRef(null);

  // --- Christmas Snowfall Canvas Effect ---
  useEffect(() => {
    if (theme !== 'navidad') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const flakes = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1,
      speedY: Math.random() * 0.9 + 0.5,
      speedX: Math.sin(Math.random() * Math.PI) * 0.4,
      opacity: Math.random() * 0.6 + 0.35,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.speedY;
        f.x += f.speedX;

        if (f.y > height + 5) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width + 5) f.x = -5;
        if (f.x < -5) f.x = width + 5;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  if (theme === 'normal') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 90,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* 1. HALLOWEEN OVERLAY (Noche de Brujas & Vampiros) */}
      {theme === 'halloween' && (
        <>
          {/* Top-Left Spiderweb SVG */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '130px',
              height: '130px',
              opacity: 0.45,
            }}
            viewBox="0 0 100 100"
            fill="none"
            stroke="#A855F7"
            strokeWidth="1.2"
          >
            <path d="M0,0 L100,0 M0,0 L90,40 M0,0 L70,70 M0,0 L40,90 M0,0 L0,100" />
            <path d="M20,0 Q18,8 14,14 Q8,18 0,20" />
            <path d="M40,0 Q36,16 28,28 Q16,36 0,40" />
            <path d="M60,0 Q54,24 42,42 Q24,54 0,60" />
            <path d="M80,0 Q72,32 56,56 Q32,72 0,80" />
            <path d="M100,0 Q90,40 70,70 Q40,90 0,100" />
          </svg>

          {/* Top-Right Spiderweb SVG */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '130px',
              height: '130px',
              transform: 'scaleX(-1)',
              opacity: 0.45,
            }}
            viewBox="0 0 100 100"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="1.2"
          >
            <path d="M0,0 L100,0 M0,0 L90,40 M0,0 L70,70 M0,0 L40,90 M0,0 L0,100" />
            <path d="M20,0 Q18,8 14,14 Q8,18 0,20" />
            <path d="M40,0 Q36,16 28,28 Q16,36 0,40" />
            <path d="M60,0 Q54,24 42,42 Q24,54 0,60" />
            <path d="M80,0 Q72,32 56,56 Q32,72 0,80" />
          </svg>

          {/* Flying Bats */}
          <div
            style={{
              position: 'absolute',
              top: '16vh',
              left: 0,
              width: '44px',
              height: '22px',
              animation: 'batFlyHorizontal 14s ease-in-out infinite',
            }}
          >
            <svg
              viewBox="0 0 50 25"
              fill="#FF6B00"
              style={{ width: '100%', height: '100%', animation: 'batWingFlap 0.35s ease-in-out infinite' }}
            >
              <path d="M25,12 C18,0 8,2 0,8 C5,14 12,14 15,22 C18,17 22,17 25,24 C28,17 32,17 35,22 C38,14 45,14 50,8 C42,2 32,0 25,12 Z" />
            </svg>
          </div>

          <div
            style={{
              position: 'absolute',
              top: '30vh',
              left: 0,
              width: '34px',
              height: '17px',
              animation: 'batFlyHorizontal 19s ease-in-out infinite 5s',
            }}
          >
            <svg
              viewBox="0 0 50 25"
              fill="#A855F7"
              style={{ width: '100%', height: '100%', animation: 'batWingFlap 0.4s ease-in-out infinite' }}
            >
              <path d="M25,12 C18,0 8,2 0,8 C5,14 12,14 15,22 C18,17 22,17 25,24 C28,17 32,17 35,22 C38,14 45,14 50,8 C42,2 32,0 25,12 Z" />
            </svg>
          </div>
        </>
      )}

      {/* 2. NAVIDAD OVERLAY (Anime Christmas & Nieve) */}
      {theme === 'navidad' && (
        <>
          {/* Real-time Snowfall Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />

          {/* Fairy Lights Garland along the Header */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              padding: '0 10px',
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => {
              const colors = ['#DC2626', '#EAB308', '#15803D', '#38BDF8', '#F43F5E'];
              const color = colors[i % colors.length];
              return (
                <div
                  key={i}
                  style={{
                    width: '9px',
                    height: '13px',
                    borderRadius: '50% 50% 60% 60%',
                    background: color,
                    color: color,
                    marginTop: i % 2 === 0 ? '2px' : '5px',
                    animation: `lightTwinkle 1.8s ease-in-out infinite ${i * 0.15}s`,
                  }}
                />
              );
            })}
          </div>
        </>
      )}

      {/* 3. TELET?N OVERLAY - Atmospheric and clean */}
      {theme === 'teleton' && null}

      {/* 4. FIESTAS PATRIAS OVERLAY (18 de Septiembre Chileno) */}
      {theme === 'fiestas_patrias' && (
        <>
          {/* Tricolor Garland Bunting along Top */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              display: 'flex',
              overflow: 'hidden',
              height: '14px',
              animation: 'garlandWave 3s ease-in-out infinite',
            }}
          >
            {Array.from({ length: 32 }).map((_, i) => {
              const flags = ['#0039A6', '#FFFFFF', '#D52B1E'];
              const bg = flags[i % 3];
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '12px',
                    background: bg,
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    borderTop: '2px solid rgba(0,0,0,0.1)',
                  }}
                />
              );
            })}
          </div>

          {/* Flying Volant?n Chileno in Upper Hero Background */}
          <div
            style={{
              position: 'absolute',
              top: '12vh',
              right: '8vw',
              width: '50px',
              height: '50px',
              animation: 'volantinSway 4s ease-in-out infinite',
            }}
          >
            {/* Volant?n Square Diamond Shape with Chilean Flag quadrants */}
            <div
              style={{
                width: '38px',
                height: '38px',
                transform: 'rotate(45deg)',
                position: 'relative',
                boxShadow: '0 4px 15px rgba(0, 57, 166, 0.25)',
                border: '1.5px solid #0039A6',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                overflow: 'hidden',
              }}
            >
              <div style={{ background: '#0039A6' }} />
              <div style={{ background: '#FFFFFF' }} />
              <div style={{ background: '#D52B1E' }} />
              <div style={{ background: '#0039A6' }} />
            </div>
            {/* Volant?n Tail */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '19px',
                width: '3px',
                height: '42px',
                background: 'linear-gradient(to bottom, #D52B1E, #0039A6, #FEDC00)',
                transformOrigin: 'top center',
                animation: 'volantinSway 2s ease-in-out infinite reverse',
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SeasonalOverlay;
