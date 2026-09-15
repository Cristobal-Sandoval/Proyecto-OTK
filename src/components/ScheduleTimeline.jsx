import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const ScheduleTimeline = ({ schedule = [] }) => {
  return (
    <section className="section-padding" id="schedule" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Section Header */}
        <div className="section-title">
          <h2>Cronograma <span className="text-neon-cyan">Actividades</span></h2>
          <p>Planifica tu visita y no te pierdas ningún bloque de actividades durante Otakonce 2026.</p>
        </div>

        {/* Timeline body */}
        <div 
          style={{
            position: 'relative',
            paddingLeft: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}
          className="timeline-container"
        >
          {/* Vertical central line */}
          <div 
            style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              left: '9px',
              width: '2px',
              background: 'linear-gradient(to bottom, var(--cyan), var(--primary), var(--secondary))'
            }}
          />

          {schedule.length > 0 ? (
            schedule.map((item) => (
              <div 
                key={item.id}
                style={{
                  position: 'relative',
                  animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
                className="timeline-item"
              >
                {/* Timeline node/marker */}
                <div 
                  style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--bg-deep)',
                    border: '3px solid var(--cyan)',
                    boxShadow: '0 0 10px var(--cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}
                  className="timeline-marker"
                />

                {/* Event details card */}
                <div 
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                  className="glass-card"
                >
                  {/* Meta (Time / Stage) */}
                  <div 
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    <span 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--secondary)',
                        background: 'rgba(236, 72, 153, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      <Clock size={12} />
                      {item.time} hrs
                    </span>
                    <span 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--cyan)',
                        background: 'rgba(6, 182, 212, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      <MapPin size={12} />
                      {item.stage}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.2rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div 
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              No hay actividades programadas por el momento.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .timeline-item:hover .timeline-marker {
          border-color: var(--secondary) !important;
          box-shadow: 0 0 12px var(--secondary) !important;
          transform: scale(1.1);
        }
      `}</style>
    </section>
  );
};

export default ScheduleTimeline;
