import React, { useState } from 'react';
import { 
  ArrowLeft, Star, MapPin, Share2, Copy, Check, ExternalLink, Image as ImageIcon, Sparkles, Heart
} from 'lucide-react';
import { slugify } from '../utils/slugify';

// SVG Icons
const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.21-.17-.46-.29z"/>
  </svg>
);

const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.74 4.54 6.27 6.27 0 0 0 1.94-4.54V9.06a8.28 8.28 0 0 0 4.83 1.54V7.17a4.84 4.84 0 0 1-1.06-.48z" />
  </svg>
);

const XTwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GuestDetail = ({ guest, guestsList = [], onBack, onSelectGuest }) => {
  const [copied, setCopied] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  if (!guest) return null;

  // Canonical share URL pointing directly to this guest's dedicated page
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#invitado/${slugify(guest.name)}`
    : `https://laotakonce.cl/#invitado/${slugify(guest.name)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareText = encodeURIComponent(`¡Conoce a ${guest.name} (${guest.character}) en Otakonce 2026! 🌸`);
  const shareUrlEncoded = encodeURIComponent(currentUrl);
  const shareWhatsappUrl = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrlEncoded}`;
  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrlEncoded}`;

  // Gallery of photos: combines guest.photos (if configured) or fallback variations
  const photos = Array.isArray(guest.photos) && guest.photos.length > 0
    ? guest.photos
    : [guest.image].filter(Boolean);

  // Other related guests
  const otherGuests = guestsList.filter(g => g.id !== guest.id).slice(0, 3);

  return (
    <div style={{ minHeight: '90vh', padding: '32px 16px 80px' }} className="guest-detail-view animate-fade-in">
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Navigation Breadcrumb / Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '0.88rem',
              fontWeight: 750,
              minHeight: '40px'
            }}
          >
            <ArrowLeft size={16} /> Volver a Invitados
          </button>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Invitados Otakonce 2026 &gt; <strong style={{ color: 'var(--text-primary)' }}>{guest.name}</strong>
          </span>
        </div>

        {/* Main Profile Container Card */}
        <article
          style={{
            background: 'var(--bg-surface-solid)',
            border: '2px solid var(--border-color)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
            marginBottom: '48px'
          }}
        >
          {/* Header Banner Image */}
          <div 
            style={{ 
              width: '100%', 
              height: 'clamp(260px, 45vw, 460px)', 
              position: 'relative', 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)' 
            }}
          >
            {guest.image && (
              <img 
                src={guest.image} 
                alt={guest.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} 
              />
            )}
            
            {/* Gradient Overlay */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, var(--bg-surface-solid) 0%, rgba(8, 7, 17, 0.6) 45%, rgba(0,0,0,0.2) 100%)'
              }}
            />

            {/* Badges on Top */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #00A3FF 0%, #7C3AED 100%)',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0, 163, 255, 0.45)'
                }}
              >
                <Star size={13} fill="#FFFFFF" />
                {guest.role || 'Invitado Especial'}
              </span>

              {guest.city && (
                <span
                  style={{
                    background: 'rgba(8, 7, 17, 0.88)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <MapPin size={13} color="var(--cyan)" />
                  {guest.city}
                </span>
              )}
            </div>

            {/* Character Pill on Bottom of Image */}
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 2 }}>
              <span
                style={{
                  background: 'rgba(8, 7, 17, 0.95)',
                  border: '2px solid var(--secondary)',
                  borderRadius: '10px',
                  padding: '5px 14px',
                  fontSize: '0.86rem',
                  fontWeight: 850,
                  color: '#FFFFFF',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 14px rgba(253, 52, 132, 0.3)'
                }}
              >
                Personaje: {guest.character}
              </span>
            </div>
          </div>

          {/* Profile Details Body */}
          <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
            
            {/* Title & Role Info */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {guest.role || 'Invitado Oficial Otakonce 2026'}
              </span>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', fontWeight: 900, margin: '4px 0 12px', lineHeight: 1.15, color: 'var(--text-primary)' }}>
                {guest.name}
              </h1>
            </div>

            {/* Resumen / Biografía completa */}
            <div style={{ marginBottom: '36px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--secondary)" /> Reseña & Trayectoria
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {guest.bio}
              </p>
            </div>

            {/* Mini Galería de Fotos */}
            {photos.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} color="var(--primary)" /> Galería de Cosplays & Presentaciones
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {photos.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveLightboxImg(imgUrl)}
                      style={{
                        height: '240px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1.5px solid var(--border-color)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        position: 'relative'
                      }}
                      className="hover-glow"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${guest.name} - Foto ${idx + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        className="gallery-photo"
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.2)',
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        className="gallery-overlay"
                      >
                        <span style={{ background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '6px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                          Ampliar Foto
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Redes Sociales Oficiales */}
            <div style={{ marginBottom: '36px', padding: '24px', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={17} color="var(--secondary)" /> Redes Sociales & Contacto
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {guest.instagram && (
                  <a
                    href={guest.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem' }}
                  >
                    <InstagramIcon size={18} />
                    Instagram ({guest.instagram.split('/').filter(Boolean).pop() ? `@${guest.instagram.split('/').filter(Boolean).pop()}` : 'Instagram'})
                    <ExternalLink size={13} style={{ opacity: 0.8 }} />
                  </a>
                )}

                {guest.tiktok && (
                  <a
                    href={guest.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.9rem' }}
                  >
                    <TikTokIcon size={17} />
                    TikTok
                    <ExternalLink size={13} style={{ opacity: 0.8 }} />
                  </a>
                )}

                {guest.twitter && (
                  <a
                    href={guest.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.9rem' }}
                  >
                    <XTwitterIcon size={16} />
                    Twitter / X
                    <ExternalLink size={13} style={{ opacity: 0.8 }} />
                  </a>
                )}
              </div>
            </div>

            {/* Compartir Ficha (con enlace real directo a esta página) */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Share2 size={16} color="var(--secondary)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                    Comparte el perfil de {guest.name}:
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* WhatsApp */}
                  <a
                    href={shareWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#25D366', fontSize: '0.84rem', padding: '8px 14px' }}
                  >
                    <WhatsAppIcon size={16} /> WhatsApp
                  </a>

                  {/* Twitter / X */}
                  <a
                    href={shareTwitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '8px 14px' }}
                  >
                    <XTwitterIcon size={15} /> Compartir
                  </a>

                  {/* Copiar enlace directo a esta página */}
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '8px 14px' }}
                  >
                    {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                    {copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </article>

        {/* Otros Invitados que te pueden interesar */}
        {otherGuests.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                Otros Invitados <span className="text-neon-pink">Especiales</span>
              </h2>
              <button 
                onClick={onBack}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                Ver todos &rarr;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {otherGuests.map((other) => (
                <div
                  key={other.id}
                  onClick={() => onSelectGuest(other)}
                  className="glass-card hover-glow"
                  style={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1.5px solid var(--border-color)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ height: '170px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={other.image} 
                      alt={other.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--secondary)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                      {other.character}
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase' }}>
                      {other.role}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                      {other.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {other.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Preview Modal for Photos */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          className="animate-fade-in"
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={activeLightboxImg} 
              alt="Foto ampliada" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }} 
            />
            <button
              onClick={() => setActiveLightboxImg(null)}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Cerrar ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        .gallery-photo:hover {
          transform: scale(1.05);
        }
        div:hover > .gallery-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default GuestDetail;
