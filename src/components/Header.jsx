import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Newspaper, LayoutDashboard, Archive, Mail, CalendarDays, Sparkles, Users } from 'lucide-react';

const Header = ({ activeTab, setActiveTab, topOffset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cierre con Escape + retorno de foco accesible
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) return () => { document.body.style.overflow = ''; };
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: null },
    { id: 'about', label: '¿Qué es Otakonce?', icon: null },
    { id: 'events', label: 'Próximos Eventos', icon: CalendarDays },
    { id: 'past-events', label: 'Eventos Anteriores', icon: Archive },
    { id: 'cosplay', label: 'Pasarela Cosplay', icon: Sparkles },
    { id: 'communities', label: 'Comunidades', icon: Users },
    { id: 'news', label: 'Blog', icon: Newspaper },
    { id: 'contact', label: 'Contáctanos', icon: Mail },
    ...(activeTab === 'admin' ? [{ id: 'admin', label: 'Admin', icon: LayoutDashboard }] : [])
  ];

  const handleNavClick = (id) => {
    const isSameTab = activeTab === id;
    setActiveTab(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: isSameTab ? 'smooth' : 'auto' });
  };

  return (
      <header 
        style={{
          position: 'sticky',
          top: topOffset || 0,
          left: 0,
          width: '100%',
          height: 'var(--header-height)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          background: scrolled ? 'var(--bg-surface)' : 'transparent',
          borderBottom: '1px solid',
          borderColor: scrolled ? 'var(--border-color)' : 'transparent',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          transition: 'var(--transition-smooth)',
          paddingTop: 'var(--safe-area-top)'
        }}
      >
      <div 
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Logo */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0
          }}
          aria-label="Otakonce 2026 Inicio"
        >
          <img 
            src="/otakonce-logo.svg" 
            alt="Otakonce 2026 — inicio" 
            width="120"
            height="36"
            fetchpriority="low"
            decoding="async"
            style={{ 
              height: '36px', 
              width: 'auto', 
              display: 'block',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))'
            }} 
          />
          <span style={{ 
            fontSize: '0.70rem', 
            fontWeight: 900, 
            border: '2px solid var(--border-pop, #0F172A)', 
            padding: '2px 6px', 
            borderRadius: '6px', 
            color: '#FFFFFF', 
            background: 'var(--secondary)', 
            boxShadow: '2px 2px 0px var(--border-pop, #0F172A)',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap'
          }}>
            2026
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav 
          aria-label="Navegación principal"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '3px',
            marginLeft: 'auto',
            flexWrap: 'nowrap'
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  background: isActive ? 'rgba(0, 163, 255, 0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--cyan)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '6px 8px',
                  minHeight: '34px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 750 : 600,
                  fontSize: '0.80rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition-fast)'
                }}
                className={isActive ? 'nav-active' : ''}
              >
                {Icon && <Icon size={13} style={{ color: isActive ? 'var(--cyan)' : 'inherit' }} />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
          style={{
            display: 'flex',
            background: 'rgba(0, 163, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '10px',
            minHeight: '44px',
            minWidth: '44px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            cursor: 'pointer',
            zIndex: 110
          }}
          className="mobile-menu-btn"
        >
          {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer (Rendered at root document.body via Portal to eliminate stacking context clipping) */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú de navegación"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.65)',
                zIndex: 9998,
                animation: 'fadeIn var(--transition-fast)',
                border: 'none',
                cursor: 'pointer'
              }}
            />
          )}

          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            aria-hidden={!isOpen}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 'min(300px, 86vw)',
              height: '100dvh',
              maxHeight: '100dvh',
              background: 'var(--bg-surface-solid)',
              borderLeft: '1px solid var(--border-color)',
              zIndex: 9999,
              padding: 'clamp(10px, 1.8vh, 16px) clamp(12px, 3vw, 18px) max(clamp(12px, 2vh, 18px), env(safe-area-inset-bottom, 12px))',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(3px, 0.7vh, 6px)',
              transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform var(--transition-smooth)',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
              overflowY: 'auto',
              pointerEvents: isOpen ? 'auto' : 'none'
            }}
            className="mobile-nav-drawer"
          >
            {/* Drawer Top Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingBottom: 'clamp(6px, 1.2vh, 10px)', 
              borderBottom: '1px solid var(--border-color)', 
              marginBottom: 'clamp(2px, 0.5vh, 4px)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1rem, 2.2vh, 1.15rem)', color: 'var(--text-primary)' }}>Menú</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'var(--secondary)', color: '#FFF' }}>2026</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
                style={{
                  background: 'rgba(0, 163, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '36px',
                  minWidth: '36px'
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, rgba(0, 163, 255, 0.15) 0%, rgba(255, 59, 108, 0.08) 100%)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-color)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: 'clamp(6px, 1.2vh, 9px) clamp(10px, 2.5vw, 14px)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: isActive ? 750 : 600,
                    fontSize: 'clamp(0.82rem, 1.8vh, 0.90rem)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    minHeight: 'clamp(36px, 4.6vh, 42px)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={16} style={{ color: isActive ? 'var(--secondary)' : 'var(--text-muted)', flexShrink: 0 }} />}
                    {item.label}
                  </span>
                  {isActive && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary-glow)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}

      {/* CSS injection for responsive navbar layout */}
      <style>{`
        @media (min-width: 1120px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-nav-drawer {
            display: none !important;
          }
        }
        @media (min-width: 1280px) {
          .desktop-nav button {
            padding: 6px 11px !important;
            font-size: 0.83rem !important;
            gap: 5px !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
