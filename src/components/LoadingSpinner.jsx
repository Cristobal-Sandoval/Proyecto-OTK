import React from 'react';

const SkeletonCard = () => (
  <div 
    aria-hidden="true"
    style={{
      background: 'rgba(255, 255, 255, 0.7)',
      border: '2px solid rgba(15, 23, 42, 0.1)',
      borderRadius: '20px',
      padding: '24px',
      height: '240px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}
  >
    <div style={{ width: '40%', height: '24px', background: 'rgba(0, 163, 255, 0.15)', borderRadius: '8px' }} />
    <div style={{ width: '80%', height: '16px', background: 'rgba(15, 23, 42, 0.08)', borderRadius: '6px' }} />
    <div style={{ width: '60%', height: '16px', background: 'rgba(15, 23, 42, 0.08)', borderRadius: '6px' }} />
    <div style={{ marginTop: 'auto', width: '30%', height: '36px', background: 'rgba(255, 59, 108, 0.12)', borderRadius: '10px' }} />
  </div>
);

const LoadingSpinner = () => {
  return (
    <div className="section-padding" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }} role="status" aria-live="polite" aria-label="Cargando contenido">
          <div 
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid rgba(0, 163, 255, 0.2)',
              borderTopColor: 'var(--cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} 
          />
          <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Cargando contenido...
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}
        >
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
