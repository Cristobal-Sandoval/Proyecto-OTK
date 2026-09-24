import React from 'react';
import { Star, Camera, Users, Calendar, Heart, User, ShieldCheck } from 'lucide-react';

const iconMap = { Star, Camera, Users, Calendar, Heart, ShieldCheck };

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

const AboutSection = ({ config, aboutConfig }) => {
  const about = aboutConfig || {};
  const photos = about.photos || [];
  const staff = about.staff || [];
  const showPhotos = about.showPhotos !== false && photos.length > 0;
  const showStaff = about.showStaff === true && staff.length > 0;

  return (
    <section
      aria-label="Sobre Otakonce"
      className="section-padding"
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        width: '100%',
        paddingTop: '60px',
        paddingBottom: '80px'
      }}
    >
      <div className="container">
        {/* Título de Sección */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            className="text-gradient"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3rem)',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '16px'
            }}
          >
            {about.title || '¿Qué es Otakonce?'}
          </h1>

          {/* Descripción principal */}
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.12rem',
              lineHeight: 1.75,
              maxWidth: '780px',
              margin: '0 auto'
            }}
          >
            {about.description || ''}
          </p>
        </div>

        {/* Imagen Destacada Placeholder (Editable por Admin) */}
        <div
          className="glass-card"
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '40px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            position: 'relative'
          }}
        >
          <div style={{ position: 'relative', width: '100%', maxHeight: '440px', overflow: 'hidden' }}>
            <img
              src={about.heroImage || '/assets/otakonce_about_hero.jpg'}
              alt={about.title || '¿Qué es Otakonce?'}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'flex';
                }
              }}
            />
            <div
              style={{
                display: 'none',
                width: '100%',
                height: '300px',
                background: 'linear-gradient(135deg, #1E1B4B 0%, #4C0519 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            >
              🌟 Otakonce — El Mayor Encuentro Geek de Concepción
            </div>

            {/* Badges superpuestos sobre la imagen */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <span
                style={{
                  background: 'rgba(8, 7, 17, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                Concepción, Chile
              </span>
              <span
                style={{
                  background: 'rgba(253, 52, 132, 0.9)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(253, 52, 132, 0.4)'
                }}
              >
                ¡Entrada Liberada!
              </span>
            </div>
          </div>
        </div>

        {/* Misión destacada */}
        {about.mission && (
          <div
            className="glass-card"
            style={{
              borderRadius: '20px',
              padding: '28px 32px',
              marginBottom: '44px',
              textAlign: 'center',
              border: '1px solid rgba(254, 220, 0, 0.25)',
              background: 'linear-gradient(135deg, rgba(254, 220, 0, 0.04) 0%, rgba(253, 52, 132, 0.04) 100%)'
            }}
          >
            <h3
              style={{
                color: 'var(--primary)',
                fontSize: '1.15rem',
                fontWeight: 850,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Nuestra Misión
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto' }}>
              {about.mission}
            </p>
          </div>
        )}

        {/* Highlights / Pilares */}
        {about.highlights && about.highlights.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px',
              marginBottom: '56px'
            }}
          >
            {about.highlights.map((h, i) => {
              const Icon = iconMap[h.icon] || Star;
              return (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    borderRadius: '16px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'rgba(254, 220, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px'
                    }}
                  >
                    <Icon size={26} color="var(--primary)" />
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>
                    {h.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                    {h.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            ESPACIO PARA FOTOS DESTACADAS (¿Qué es Otakonce?)
            ========================================================================= */}
        {showPhotos && (
          <div style={{ marginBottom: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h3
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 850,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.03em',
                  marginBottom: '8px'
                }}
              >
                Momentos <span className="text-neon-pink">Inolvidables</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Una pequeña muestra de la energía y alegría que se vive en cada rincón de Otakonce.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}
            >
              {photos.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="glass-card"
                  style={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    transition: 'transform 0.25s ease'
                  }}
                >
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img
                      src={item.url}
                      alt={item.caption || 'Foto Otakonce'}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div
                      style={{
                        display: 'none',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, #1E1B4B 0%, #4C0519 100%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      📷 Foto Otakonce
                    </div>
                  </div>
                  {item.caption && (
                    <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.4)' }}>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 650, lineHeight: 1.4 }}>
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECCIÓN STAFF (Desactivada por defecto, activable desde Admin)
            ========================================================================= */}
        {showStaff && (
          <div style={{ marginBottom: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0, 163, 255, 0.12)',
                  border: '1px solid rgba(0, 163, 255, 0.3)',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  color: 'var(--cyan)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: '10px'
                }}
              >
                <Users size={14} /> EQUIPO OFICIAL
              </div>
              <h3
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 850,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.03em',
                  marginBottom: '8px'
                }}
              >
                Staff & <span className="text-neon-cyan">Organización</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Las personas y coordinadores que hacen posible la experiencia de Otakonce.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px'
              }}
            >
              {staff.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="glass-card"
                  style={{
                    borderRadius: '18px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* Foto o Avatar */}
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: '14px',
                      border: '2px solid var(--secondary)',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(253, 52, 132, 0.25)'
                    }}
                  >
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={38} color="var(--text-muted)" />
                    )}
                  </div>

                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                    {member.name}
                  </h4>
                  <span
                    style={{
                      background: 'rgba(0, 163, 255, 0.12)',
                      color: 'var(--cyan)',
                      border: '1px solid rgba(0, 163, 255, 0.3)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 750,
                      marginBottom: '12px'
                    }}
                  >
                    {member.role}
                  </span>

                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--secondary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(253, 52, 132, 0.08)'
                      }}
                    >
                      <Instagram size={14} /> Instagram
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Datos del evento actual */}
        {config && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '40px',
              color: 'var(--text-muted)',
              fontSize: '0.92rem',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {config.date && (
              <p style={{ marginBottom: '6px' }}>
                📅 Próxima edición: <strong style={{ color: 'var(--text-primary)' }}>{config.date}</strong>
              </p>
            )}
            {config.location && <p style={{ margin: 0 }}>📍 {config.location}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;
