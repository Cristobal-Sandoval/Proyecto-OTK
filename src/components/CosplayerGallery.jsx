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

const CosplayerGallery = ({ cosplayers = [] }) => {
  return (
    <section className="section-padding" id="cosplay" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <h2>Pasarela <span className="text-neon-pink">Cosplay</span></h2>
          <p>Descubre a algunos de los talentosos artistas del cosplay que darán vida a tus personajes favoritos en esta edición.</p>
        </div>

        {/* Swipeable List in Mobile, Grid in Desktop */}
        <div 
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '20px',
            paddingRight: '20px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--primary) transparent'
          }}
          className="cosplay-scroll-container"
        >
          {cosplayers.map((cosplayer) => (
            <div 
              key={cosplayer.id}
              style={{
                flex: '0 0 85%',
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                height: '420px'
              }}
              className="cosplay-card glass-card"
            >
              {/* Background Cosplay Image / Fallback Gradient */}
              <div
                role="img"
                aria-label={`Foto de cosplay de ${cosplayer.name} como ${cosplayer.character}`}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
                  backgroundImage: cosplayer.image ? `url(${cosplayer.image})` : 'linear-gradient(135deg, #4c1d95 0%, #831843 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 20%',
                  position: 'relative'
                }}
                className="image-loader-bg"
              >
                {/* Floating Character Tag */}
                <span 
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 2,
                    background: 'rgba(8,7,17,0.8)',
                    border: '1px solid var(--secondary)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'white',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  {cosplayer.character}
                </span>

                {/* Bottom Overlay Gradient */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(8, 7, 17, 0.95) 0%, rgba(8, 7, 17, 0.7) 40%, transparent 100%)',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '24px',
                    gap: '8px'
                  }}
                  className="cosplay-details"
                >
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {cosplayer.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0' }}>
                    {cosplayer.bio}
                  </p>

                  <a 
                    href={cosplayer.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      alignSelf: 'flex-start',
                      marginTop: '6px'
                    }}
                    className="instagram-link"
                  >
                    <Instagram size={14} />
                    @{cosplayer.instagram.split('/').pop() || 'instagram'}
                    <ExternalLink size={10} style={{ opacity: 0.7 }} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cosplay-scroll-container {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        .cosplay-card:hover {
          transform: translateY(-5px);
          border-color: var(--secondary) !important;
          box-shadow: var(--shadow-neon-pink), var(--shadow-card) !important;
        }
        .instagram-link:hover {
          color: var(--secondary) !important;
          opacity: 0.8;
        }
        @media (min-width: 640px) {
          .cosplay-card {
            flex: 0 0 calc(50% - 12px) !important;
          }
        }
        @media (min-width: 1024px) {
          .cosplay-scroll-container {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            overflow-x: visible !important;
            scroll-snap-type: none !important;
            padding-bottom: 0 !important;
          }
          .cosplay-card {
            flex: none !important;
            height: 480px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CosplayerGallery;
