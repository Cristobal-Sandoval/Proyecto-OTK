import React from 'react';
import { Calendar, MapPin, Sparkles, Clock, Ticket } from 'lucide-react';

const UpcomingEventSection = ({ config = {} }) => {
  const title = config.title || 'Otakonce 2026';
  const subtitle = config.subtitle || 'El evento de anime, videojuegos y cultura geek más grande de Concepción.';
  const date = config.date || '14 y 15 de Noviembre, 2026';
  const location = config.location || 'Gimnasio USM Sede Concepción';
  const image = config.bannerImage || '/assets/hero_banner.webp';

  return (
    <section
      aria-label="Próximo Evento Otakonce"
      className="section-padding"
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        paddingBottom: '20px'
      }}
    >
      {/* Encabezado */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(253, 52, 132, 0.12)',
            border: '1px solid rgba(253, 52, 132, 0.3)',
            borderRadius: '20px',
            padding: '5px 14px',
            color: 'var(--secondary)',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '12px',
            letterSpacing: '0.04em'
          }}
        >
          <Sparkles size={14} /> PRÓXIMA EDICIÓN
        </div>
        <h1
          className="text-gradient"
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: '0 0 10px 0'
          }}
        >
          {title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          {subtitle}
        </p>
      </div>

      {/* Tarjeta del evento con imagen destacada (no banner fullscreen) */}
      <div
        className="glass-card"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Contenedor de la Imagen */}
        <div
          style={{
            width: '100%',
            position: 'relative',
            maxHeight: '440px',
            overflow: 'hidden',
            background: '#0B0F19'
          }}
          className="upcoming-image-wrapper"
        >
          <img
            src={image}
            alt={`Afiche de ${title}`}
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '440px',
              objectFit: 'cover',
              objectPosition: 'center',
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
              height: '320px',
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C0519 100%)',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700
            }}
          >
            🌟 Afiche Oficial {title}
          </div>

          {/* Badges superpuestos sobre la imagen */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              zIndex: 2
            }}
          >
            <div
              style={{
                background: 'rgba(8, 7, 17, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(254, 220, 0, 0.4)',
                color: 'var(--primary)',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <Calendar size={15} />
              {date}
            </div>

            <div
              style={{
                background: 'rgba(8, 7, 17, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(0, 163, 255, 0.4)',
                color: '#FFF',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <MapPin size={15} color="var(--cyan)" />
              {location}
            </div>

            <div
              style={{
                background: 'rgba(253, 52, 132, 0.88)',
                color: '#FFF',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(253, 52, 132, 0.4)'
              }}
            >
              <Ticket size={15} />
              Entrada Liberada
            </div>
          </div>
        </div>

        {/* Barra inferior con resumen informativo */}
        <div
          style={{
            padding: '24px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#FFF', fontWeight: 800 }}>
              ¡Todo listo para vivir la experiencia Otakonce!
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Revisa el cronograma completo de actividades más abajo para no perderte nada.
            </p>
          </div>
          <a
            href="#schedule"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'var(--primary)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(254, 220, 0, 0.3)',
              transition: 'transform 0.2s ease'
            }}
            className="hover-glow"
          >
            <Clock size={16} /> Ver Horarios
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .upcoming-image-wrapper {
            max-height: 280px !important;
          }
          .upcoming-image-wrapper img {
            max-height: 280px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default UpcomingEventSection;
