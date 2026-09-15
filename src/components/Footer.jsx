import React, { useRef } from 'react';
import { ArrowUp, Cat } from 'lucide-react';

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

const Footer = ({ setActiveTab }) => {
  const pressTimerRef = useRef(null);

  const triggerAdminPortal = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }
    sessionStorage.removeItem('otakonce_admin_auth');
    window.location.hash = 'stf-portal';
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartPress = () => {
    // Requiere mantener presionado durante 5 segundos completos
    pressTimerRef.current = setTimeout(() => {
      triggerAdminPortal();
    }, 5000);
  };

  const handleEndPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleBrandClick = () => {
    handleNavClick('home');
  };

  const handleBrandKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrandClick();
    }
  };

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      style={{
        background: 'var(--bg-surface-solid)',
        borderTop: '2px solid var(--border-color)',
        padding: '48px 20px 24px',
        marginTop: '60px'
      }}
    >
      <div 
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          textAlign: 'center'
        }}
      >
        {/* Branding & Logo with secret stealth admin access (5-second hold) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 
            role="button"
            tabIndex={0}
            onClick={handleBrandClick}
            onKeyDown={handleBrandKeyDown}
            onTouchStart={handleStartPress}
            onTouchEnd={handleEndPress}
            onTouchCancel={handleEndPress}
            onMouseDown={handleStartPress}
            onMouseUp={handleEndPress}
            onMouseLeave={handleEndPress}
            aria-label="Otakonce 2026 — ir al inicio"
            style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
            className="text-gradient"
            title="Otakonce 2026"
          >
            OTAKONCE
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.4 }}>
            El evento de anime, cosplay y videojuegos gratuito más grande del sur de Chile, organizado por y para la comunidad en Concepción.
          </p>
        </div>

        {/* Navigation links */}
        <nav 
          aria-label="Navegación secundaria"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}
          className="footer-nav"
        >
          <a href="#home" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Inicio</a>
          <a href="#news" onClick={(e) => { e.preventDefault(); handleNavClick('news'); }}>Noticias</a>
          <a href="#invitados" onClick={(e) => { e.preventDefault(); handleNavClick('invitados'); }}>Invitados</a>
          <a href="#cosplay" onClick={(e) => { e.preventDefault(); handleNavClick('cosplay'); }}>Pasarela Cosplay</a>
          <a href="#communities" onClick={(e) => { e.preventDefault(); handleNavClick('communities'); }}>Comunidades</a>
          <a href="#schedule" onClick={(e) => { e.preventDefault(); handleNavClick('schedule'); }}>Cronograma</a>
        </nav>

        {/* Social Media Link */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nuestras Redes Oficiales
          </span>
          <a 
            href="https://www.instagram.com/laotakonce/" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram oficial de Otakonce"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(236,72,153,0.3)',
              transition: 'var(--transition-smooth)'
            }}
            className="social-btn"
          >
            <Instagram size={20} aria-hidden="true" />
          </a>
        </div>

        {/* Bottom copyright line */}
        <div 
          style={{
            width: '100%',
            borderTop: '1px solid rgba(255,255,255,0.03)',
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '16px',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
          className="footer-bottom"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>&copy; {currentYear} Otakonce Staff. Todos los derechos reservados.</span>
            <span style={{ opacity: 0.35 }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              hecho por{' '}
              <a 
                href="https://cristobalsandoval-portafolio.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  minWidth: '44px',
                  transition: 'color var(--transition-fast)'
                }}
                className="hover-glow"
                title="Portafolio de Cristóbal Sandoval"
                aria-label="Portafolio de Cristóbal Sandoval"
              >
                <Cat size={16} aria-hidden="true" style={{ display: 'inline' }} />
              </a>
            </span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver arriba"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'var(--transition-fast)'
            }}
            className="top-btn"
          >
            Volver Arriba
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <style>{`
        .footer-nav a {
          padding: 8px 4px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
        }
        .footer-nav a:hover {
          color: var(--text-primary);
        }
        .social-btn:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 6px 20px rgba(139,92,246,0.6);
        }
        .top-btn:hover {
          background: rgba(255,255,255,0.08);
          color: var(--text-primary);
          border-color: var(--primary);
        }
        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row !important;
            justify-content: space-between;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
