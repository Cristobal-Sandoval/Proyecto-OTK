import React, { useState, useMemo } from 'react';
import { Search, MapPin, Share2, Check, X, User } from 'lucide-react';
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

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.21-.17-.46-.29z"/>
  </svg>
);

const CosplayerGallery = ({ cosplayers = [] }) => {
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCosplayer, setActiveModalCosplayer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filter only community / general cosplayers (non-guest)
  const communityList = useMemo(() => {
    const list = cosplayers.filter(c => c.type !== 'guest');
    // If no community cosplayers exist yet, fallback to full list
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

  // Filtered cosplayers
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
    <section className="section-padding" id="cosplay" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <h2>Pasarela <span className="text-neon-pink">Cosplay</span> & Comunidad</h2>
          <p>El talento de Concepción y de todo el país reunido en un solo lugar. Conoce a los exponentes, apóyalos en sus redes y comparte sus fichas.</p>
        </div>

        {/* Filter Controls: City Tabs & Search Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px', width: '100%' }}>
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

        {/* Cosplayers Grid */}
        {filteredCosplayers.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <User size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No se encontraron cosplayers</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Intenta seleccionar otra ciudad o limpiar el término de búsqueda.</p>
          </div>
        ) : (
          <div className="community-cosplay-grid">
            {filteredCosplayers.map((cosplayer) => (
              <div 
                key={cosplayer.id}
                onClick={() => setActiveModalCosplayer(cosplayer)}
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
                        onClick={(e) => e.stopPropagation()}
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
                          onClick={(e) => handleWhatsAppShare(e, cosplayer)}
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
                          onClick={(e) => handleShareCosplayer(e, cosplayer)}
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
            ))}
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
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          className="animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              background: 'var(--bg-surface-solid)',
              border: '2px solid var(--border-color)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal Image Header */}
            <div 
              style={{
                width: '100%',
                height: '280px',
                backgroundImage: activeModalCosplayer.image ? `url(${activeModalCosplayer.image})` : 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setActiveModalCosplayer(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.65)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
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
        .community-cosplay-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .community-cosplay-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
          }
        }
        .community-cosplay-card {
          width: 100%;
          height: 400px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .community-cosplay-card:hover {
          transform: translateY(-5px);
          border-color: var(--secondary) !important;
          box-shadow: 0 12px 28px rgba(253, 52, 132, 0.2) !important;
        }
      `}</style>
    </section>
  );
};

export default CosplayerGallery;
