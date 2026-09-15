import { ExternalLink } from 'lucide-react';

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

const CommunityList = ({ communities = [] }) => {

  const getLogoFallback = (name) => {
    // Generate a simple abbreviation
    const words = name.split(' ');
    const initials = words.map(w => w[0]).join('').slice(0, 3).toUpperCase();
    return (
      <div 
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'white',
          boxShadow: 'var(--shadow-neon)'
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <section className="section-padding" id="communities">
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <h2>Comunidades <span className="text-neon-cyan">Locales</span></h2>
          <p>El núcleo de Otakonce son las agrupaciones del Biobío. Conoce a los colectivos de gaming, danza, TCG y anime que participan activamente.</p>
        </div>

        {/* Communities Grid */}
        <div className="grid-responsive" style={{ gap: '24px' }}>
          {communities.map((comm) => (
            <div 
              key={comm.id}
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative'
              }}
              className="glass-card community-card"
            >
              {/* Header card area */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Logo or Fallback */}
                {comm.logo && !comm.logo.includes('placeholder') ? (
                  <img 
                    src={comm.logo} 
                    alt={`Logo oficial de la agrupación: ${comm.name}`}
                    loading="lazy"
                    decoding="async"
                    width="60"
                    height="60"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{ display: comm.logo ? 'none' : 'flex' }}>
                  {getLogoFallback(comm.name)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span 
                    style={{ 
                      fontSize: '0.7rem', 
                      background: 'rgba(6, 182, 212, 0.1)', 
                      color: 'var(--cyan)', 
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      alignSelf: 'flex-start'
                    }}
                  >
                    {comm.type}
                  </span>
                  <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {comm.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, flexGrow: 1 }}>
                {comm.description}
              </p>

              {/* Link */}
              {comm.instagram ? (
              <a 
                href={comm.instagram}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`Instagram de ${comm.name}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--cyan)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                  marginTop: '8px',
                  minHeight: '44px',
                  padding: '6px 4px'
                }}
                className="community-link"
              >
                <Instagram size={14} aria-hidden="true" />
                Ver Instagram
                <ExternalLink size={10} style={{ opacity: 0.7 }} aria-hidden="true" />
              </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .community-card:hover {
          border-color: var(--border-cyan) !important;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.2), var(--shadow-card) !important;
          transform: translateY(-3px);
        }
        .community-link:hover {
          color: white;
        }
      `}</style>
    </section>
  );
};

export default CommunityList;
