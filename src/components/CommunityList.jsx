import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, X, Sparkles, Upload, Loader2, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { submitCommunityApplication } from '../services/cloudSync';
import { COMMUNITY_TYPES, COMM_DESC_MAX_LENGTH } from '../data/defaults';
import { dataUrlToFile } from '../services/media';
import { uploadToCloudinary, isCloudinaryConfigured } from '../services/cloudinary';
import { trimStr, isValidEmail, validateImageFile, isSafeHttpUrl } from '../utils/sanitize';

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
  // Registration Form State (postulación de comunidades)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [logoName, setLogoName] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    type: 'Danza & Performance',
    description: '',
    instagram: '',
    contact: '',
    logo: ''
  });
  const closeBtnRef = useRef(null);

  // Lock body scroll + Escape to close + focus management
  useEffect(() => {
    if (!isRegisterOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && !registerLoading) setIsRegisterOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => closeBtnRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isRegisterOpen, registerLoading]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateImageFile(file, 8);
    if (err) {
      alert(err);
      e.target.value = '';
      return;
    }
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRegisterForm(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setRegisterForm(prev => ({ ...prev, logo: '' }));
    setLogoName('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const name = trimStr(registerForm.name, 80);
    const type = trimStr(registerForm.type, 60);
    const description = trimStr(registerForm.description, COMM_DESC_MAX_LENGTH);
    const instagram = trimStr(registerForm.instagram, 200);
    const contact = trimStr(registerForm.contact, 160);
    if (!name || !type || !description || !contact) {
      setRegisterError('Por favor completa todos los campos requeridos (*).');
      return;
    }
    if (!COMMUNITY_TYPES.includes(type)) {
      setRegisterError('Selecciona un tipo de comunidad válido.');
      return;
    }
    if (!isValidEmail(contact)) {
      setRegisterError('Ingresa un email válido para que el staff pueda contactarte.');
      return;
    }
    if (instagram && !isSafeHttpUrl(instagram) && !/^@?[A-Za-z0-9._]{1,60}$/.test(instagram.trim())) {
      setRegisterError('El Instagram debe ser una URL https válida o un @usuario.');
      return;
    }
    const normInstagram = instagram && !isSafeHttpUrl(instagram)
      ? `https://instagram.com/${instagram.trim().replace(/^@/, '')}`
      : instagram;
    if (registerForm.logo && registerForm.logo.startsWith('data:') && registerForm.logo.length > 2_800_000) {
      setRegisterError('El logo es muy pesado. Sube una imagen menor a 2MB o usa una URL https.');
      return;
    }
    setRegisterLoading(true);
    setRegisterError('');
    try {
      // Logo único: si es archivo local y Cloudinary está configurado, súbelo al CDN
      let logoToSend = typeof registerForm.logo === 'string' && (isSafeHttpUrl(registerForm.logo) || registerForm.logo.startsWith('data:image/')) ? registerForm.logo : '';
      if (logoToSend.startsWith('data:')) {
        if (isCloudinaryConfigured()) {
          try {
            const file = dataUrlToFile(logoToSend, `comunidad-${Date.now()}.jpg`);
            const uploaded = await uploadToCloudinary(file);
            logoToSend = uploaded.url;
          } catch (uploadErr) {
            setRegisterError(`No se pudo subir el logo al CDN: ${uploadErr?.message || 'error de subida'}. Prueba con una imagen más liviana o una URL https.`);
            setRegisterLoading(false);
            return;
          }
        } else if (logoToSend.length > 900_000) {
          setRegisterError('El logo es muy pesado y el CDN aún no está configurado. Usa una imagen menor a 700KB o una URL https.');
          setRegisterLoading(false);
          return;
        }
      }
      await submitCommunityApplication({ name, type, description, instagram: normInstagram, contact, logo: logoToSend });
      setRegisterSubmitted(true);
      setLogoName('');
      setRegisterForm({ name: '', type: 'Danza & Performance', description: '', instagram: '', contact: '', logo: '' });
      setTimeout(() => {
        setRegisterSubmitted(false);
        setIsRegisterOpen(false);
      }, 3500);
    } catch (err) {
      setRegisterError(err?.message || 'Hubo un problema al enviar la postulación. Intenta nuevamente.');
    } finally {
      setRegisterLoading(false);
    }
  };

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
          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                minHeight: '44px',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '30px',
                boxShadow: '0 4px 18px rgba(0, 136, 255, 0.35)'
              }}
            >
              <Users size={18} aria-hidden="true" /> Inscribe a tu Comunidad
            </button>
          </div>
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

      {/* Registration Modal for Communities (portal: evita stacking-context de la sección) */}
      {isRegisterOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => !registerLoading && setIsRegisterOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 5, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '12px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
          className="animate-fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-register-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface-solid)',
              border: '2px solid var(--border-color)',
              borderRadius: '20px',
              width: 'min(560px, 100%)',
              margin: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              position: 'relative',
              padding: 'clamp(20px, 4vw, 32px)',
              boxSizing: 'border-box'
            }}
          >
            <button
              ref={closeBtnRef}
              onClick={() => setIsRegisterOpen(false)}
              disabled={registerLoading}
              aria-label="Cerrar formulario de inscripción"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '44px',
                height: '44px',
                minHeight: '44px',
                borderRadius: '50%',
                background: 'rgba(127, 127, 150, 0.12)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} aria-hidden="true" />
            </button>

            {registerSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={36} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 850, margin: 0 }}>
                  ¡Postulación Enviada con Éxito!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '380px', margin: 0 }}>
                  Hemos recibido la inscripción de tu comunidad para <strong>Otakonce 2026</strong>. El equipo la evaluará y pronto la verás publicada en esta sección.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '12px', minHeight: '48px', padding: '12px 32px' }}
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="register-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ paddingRight: '48px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    <Sparkles size={15} aria-hidden="true" /> Otakonce 2026
                  </div>
                  <h3 id="community-register-title" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 850, margin: '0 0 6px', lineHeight: 1.25 }}>
                    Inscribe a tu Comunidad
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    ¿Tienen una agrupación de gaming, danza, TCG o anime? Postulen y aparezcan en la página oficial.
                  </p>
                </div>

                {registerError && (
                  <div style={{ background: 'rgba(255, 59, 108, 0.12)', border: '1px solid rgba(255, 59, 108, 0.3)', color: 'var(--secondary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
                    <span>{registerError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="comm-name" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Nombre de la Comunidad <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    id="comm-name"
                    type="text"
                    required
                    placeholder="El nombre con que los conoce la comunidad"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="comm-type" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Tipo de Comunidad <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <select
                    id="comm-type"
                    required
                    value={registerForm.type}
                    onChange={(e) => setRegisterForm({ ...registerForm, type: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  >
                    {COMMUNITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="comm-desc" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <span>Qué hace tu comunidad <span style={{ color: 'var(--secondary)' }}>*</span></span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: (registerForm.description?.length || 0) >= COMM_DESC_MAX_LENGTH ? 'var(--secondary)' : 'var(--text-muted)' }} aria-live="polite">
                      {registerForm.description?.length || 0}/{COMM_DESC_MAX_LENGTH}
                    </span>
                  </label>
                  <textarea
                    id="comm-desc"
                    rows={3}
                    required
                    maxLength={COMM_DESC_MAX_LENGTH}
                    placeholder="Una breve presentación de su agrupación y actividades. Por seguridad, no incluyan datos sensibles como teléfono, dirección o RUT."
                    value={registerForm.description}
                    onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="comm-instagram" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                      Instagram
                    </label>
                    <input
                      id="comm-instagram"
                      type="text"
                      placeholder="El @ de su comunidad"
                      value={registerForm.instagram}
                      onChange={(e) => setRegisterForm({ ...registerForm, instagram: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="comm-email" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                      Email de Contacto <span style={{ color: 'var(--secondary)' }}>*</span>
                    </label>
                    <input
                      id="comm-email"
                      type="email"
                      required
                      placeholder="su@correo.com"
                      value={registerForm.contact}
                      onChange={(e) => setRegisterForm({ ...registerForm, contact: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                    />
                  </div>
                </div>
                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-8px', display: 'block' }}>
                  Solo lo verá el staff organizador para coordinar su participación.
                </small>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <span id="comm-logo-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
                    Logo de la Comunidad <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(máx. 1 imagen)</span>
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <label
                        htmlFor="comm-logo-input"
                        className="btn btn-secondary"
                        style={{ minHeight: '44px', padding: '10px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}
                      >
                        <Upload size={16} aria-hidden="true" />
                        {registerForm.logo && registerForm.logo.startsWith('data:') ? 'Cambiar logo' : 'Subir logo'}
                      </label>
                      <input
                        id="comm-logo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleLogoUpload}
                        aria-labelledby="comm-logo-label"
                        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: logoName ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {logoName || 'JPG, PNG, WEBP o GIF · máx 8MB'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>O URL:</span>
                      <input
                        type="url"
                        inputMode="url"
                        placeholder="https://ejemplo.com/logo.jpg"
                        value={registerForm.logo && !registerForm.logo.startsWith('data:') ? registerForm.logo : ''}
                        onChange={(e) => { setRegisterForm({ ...registerForm, logo: e.target.value }); setLogoName(''); }}
                        className="form-control"
                        style={{ flex: 1, minWidth: 0, padding: '10px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                      />
                    </div>
                  </div>
                  {registerForm.logo && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '72px', height: '72px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <img src={registerForm.logo} alt="Vista previa del logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <button
                        type="button"
                        onClick={clearLogo}
                        aria-label="Quitar logo seleccionado"
                        className="btn btn-secondary"
                        style={{ minHeight: '44px', padding: '8px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <X size={14} aria-hidden="true" />
                        Quitar
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={registerLoading}
                    onClick={() => setIsRegisterOpen(false)}
                    className="btn btn-secondary"
                    style={{ flex: '1 1 140px', minHeight: '48px', padding: '12px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="btn btn-primary"
                    style={{ flex: '2 1 200px', minHeight: '48px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {registerLoading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
                    {registerLoading ? 'Enviando...' : 'Enviar Postulación'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .register-form .form-group { margin-bottom: 0; }
        .register-form .form-control { width: 100%; box-sizing: border-box; }
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
