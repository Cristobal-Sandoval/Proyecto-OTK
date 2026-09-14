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

          {/* Flying Volantín Chileno con Bandera de Chile y Cola Fluida */}
          <div
            className="seasonal-volantin"
            style={{
              position: 'absolute',
              top: '11vh',
              right: '6vw',
              width: '74px',
              height: '150px',
              animation: 'volantinFloat 6s ease-in-out infinite',
              filter: 'drop-shadow(0 8px 18px rgba(0, 57, 166, 0.22))',
              pointerEvents: 'none',
              zIndex: 92
            }}
          >
            <svg
              viewBox="0 0 80 160"
              width="100%"
              height="100%"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              {/* Kite Body (Rombo / Cuadrado Volantín Bandera Chilena) */}
              <g id="volantin-kite-body">
                {/* 1. Cantón Azul Superior Izquierdo */}
                <polygon
                  points="8,40 40,8 40,40"
                  fill="#0039A6"
                  stroke="#002D80"
                  strokeWidth="0.8"
                />

                {/* Estrella Blanca Solitaria de 5 puntas */}
                <polygon
                  points="26,23.5 27.1,26.8 30.5,26.8 27.8,28.8 28.8,32.2 26,30.1 23.2,32.2 24.2,28.8 21.5,26.8 24.9,26.8"
                  fill="#FFFFFF"
                />

                {/* 2. Campo Blanco Superior Derecho */}
                <polygon
                  points="40,8 72,40 40,40"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="0.8"
                />

                {/* 3. Campo Rojo Inferior Completo */}
                <polygon
                  points="8,40 72,40 40,72"
                  fill="#D52B1E"
                  stroke="#B91C1C"
                  strokeWidth="0.8"
                />

                {/* Borde exterior del rombo */}
                <polygon
                  points="40,8 72,40 40,72 8,40"
                  fill="none"
                  stroke="#001A4D"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />

                {/* Maderos Tradicionales de Coligüe */}
                {/* Madero central recto */}
                <line
                  x1="40"
                  y1="8"
                  x2="40"
                  y2="72"
                  stroke="#78350F"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                {/* Arco curvo flexible superior */}
                <path
                  d="M 8,40 Q 40,20 72,40"
                  fill="none"
                  stroke="#92400E"
                  strokeWidth="1.2"
                  opacity="0.85"
                />

                {/* Tirantes de Hilo de Volantín */}
                <path
                  d="M 40,24 L 30,42 M 40,58 L 30,42 M 30,42 L 18,80"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="0.75"
                  strokeDasharray="2,2"
                />
              </g>

              {/* Cola del Volantín: Conectada EXACTAMENTE al vértice inferior (40, 72) */}
              <g
                style={{
                  transformOrigin: '40px 72px',
                  animation: 'volantinTail 3s ease-in-out infinite alternate',
                }}
              >
                {/* Línea ondeante de la cola */}
                <path
                  d="M 40,72 C 46,88 28,102 44,118 C 54,130 32,142 38,158"
                  fill="none"
                  stroke="#0039A6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Lazo 1: Azul de la bandera chilena */}
                <g transform="translate(35, 95) rotate(-15)">
                  <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#0039A6" />
                  <ellipse cx="0" cy="0" rx="2.5" ry="5" fill="#0039A6" opacity="0.85" />
                  <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
                </g>

                {/* Lazo 2: Blanco cordillera */}
                <g transform="translate(42, 118) rotate(20)">
                  <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
                  <ellipse cx="0" cy="0" rx="2.5" ry="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" opacity="0.85" />
                  <circle cx="0" cy="0" r="1.5" fill="#0039A6" />
                </g>

                {/* Lazo 3: Rojo patrio */}
                <g transform="translate(36, 142) rotate(-10)">
                  <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#D52B1E" />
                  <ellipse cx="0" cy="0" rx="2.5" ry="5" fill="#D52B1E" opacity="0.85" />
                  <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
                </g>
              </g>
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export default SeasonalOverlay;
