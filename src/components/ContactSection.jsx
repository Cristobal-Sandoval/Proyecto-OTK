import React from 'react';
import { Mail, MapPin } from 'lucide-react';

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

const ContactSection = ({ contactConfig }) => {
  const contact = contactConfig || {};

  const cards = [
    contact.instagram && {
      icon: <Instagram size={28} />,
      label: 'Instagram',
      value: '@laotakonce',
      href: contact.instagram,
      gradient: 'linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)'
    },
    contact.email && {
      icon: <Mail size={28} />,
      label: 'Email Oficial',
      value: contact.email,
      href: `mailto:${contact.email}`,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)'
    },
    contact.location && {
      icon: <MapPin size={28} />,
      label: 'Ubicación',
      value: contact.location,
      subtitle: contact.locationDetail,
      href: null,
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
    }
  ].filter(Boolean);

  return (
    <section
      aria-label="Información de contacto"
      style={{
        padding: '80px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2
          className="text-gradient"
          style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            textAlign: 'center',
            marginBottom: '16px',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Contáctanos
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          ¿Tienes dudas, deseas participar con tu agrupación o colaborar con Otakonce? ¡Estamos aquí para ti!
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}
      >
        {cards.map((card, i) => {
          const content = (
            <>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: card.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
                }}
              >
                {card.icon}
              </div>
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                {card.label}
              </span>
              <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>
                {card.value}
              </span>
              {card.subtitle && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {card.subtitle}
                </span>
              )}
            </>
          );

          if (card.href) {
            return (
              <a
                key={i}
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '36px 24px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textDecoration: 'none',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
                className="contact-card-hover"
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={i}
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '36px 24px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
              className="contact-card-hover"
            >
              {content}
            </div>
          );
        })}
      </div>

      <style>{`
        .contact-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>
    </section>
  );
};

export default ContactSection;
