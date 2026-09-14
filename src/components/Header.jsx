import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Users, Camera, Newspaper, LayoutDashboard } from 'lucide-react';

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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: null },
    { id: 'news', label: 'Noticias', icon: Newspaper },
    { id: 'cosplay', label: 'Cosplayers', icon: Camera },
    { id: 'communities', label: 'Comunidades', icon: Users },
    { id: 'schedule', label: 'Cronograma', icon: Calendar },
    ...(activeTab === 'admin' ? [{ id: 'admin', label: 'Admin', icon: LayoutDashboard }] : [])
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            textDecoration: 'none'
          }}
          aria-label="Otakonce 2026 Inicio"
        >
          <img 
            src="/otakonce-logo.svg" 
            alt="Otakonce" 
            style={{ 
              height: '38px', 
              width: 'auto', 
              display: 'block',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
            }} 
          />
          <span style={{ 
            fontSize: '0.68rem', 
            fontWeight: 900, 
            border: '2px solid var(--border-pop, #0F172A)', 
            padding: '2px 6px', 
            borderRadius: '6px', 
            color: '#FFFFFF', 
            background: 'var(--secondary)', 
            boxShadow: '2px 2px 0px var(--border-pop, #0F172A)',
            letterSpacing: '0.04em'
          }}>
            2026
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav 
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px'
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
                style={{
                  background: isActive ? 'rgba(0, 163, 255, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--border-color)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }}
                className={isActive ? 'nav-active' : ''}
              >
                {Icon && <Icon size={16} />}
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
          style={{
            display: 'flex',
            background: 'rgba(0, 163, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '8px',
            borderRadius: '10px',
            cursor: 'pointer',
            zIndex: 110
          }}
          className="mobile-menu-btn"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 104,
            animation: 'fadeIn var(--transition-fast)'
          }}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '290px',
          height: '100vh',
          background: 'var(--bg-surface-solid)',
          borderLeft: '1px solid var(--border-color)',
          zIndex: 115,
          padding: '24px 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--transition-smooth)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          overflowY: 'auto'
        }}
        className="mobile-nav-drawer"
      >
        {/* Drawer Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Menú</span>
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
            <X size={18} />
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
                padding: '14px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: isActive ? 750 : 600,
                fontSize: '0.98rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                minHeight: '48px',
                transition: 'var(--transition-fast)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {Icon && <Icon size={20} style={{ color: isActive ? 'var(--secondary)' : 'var(--text-muted)' }} />}
                {item.label}
              </span>
              {isActive && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary-glow)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* CSS injection for responsive navbar layout */}
      <style>{`
        @media (min-width: 768px) {
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
      `}</style>
    </header>
  );
};

export default Header;
