import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  MapPin, Share2, Check, X, User, ChevronLeft, ChevronRight, 
  Sparkles, AlertCircle, CheckCircle2, Loader2, Upload, Pin, ArrowRight
} from 'lucide-react';
import { slugify } from '../utils/slugify';
import { submitCosplayApplication } from '../services/cloudSync';
import { cardSrc, dataUrlToFile } from '../services/media';
import { uploadToCloudinary, isCloudinaryConfigured } from '../services/cloudinary';
import { trimStr, isValidEmail, validateImageFile, isSafeHttpUrl } from '../utils/sanitize';

export const BIO_MAX_LENGTH = 280;

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

const CosplayerGallery = ({ cosplayers = [], onNavigate, _onNavigate, activeTab = 'home', mode }) => {
  const navigate = onNavigate || _onNavigate;
  const isLanding = mode === 'preview' || activeTab === 'home';
  const [activeModalCosplayer, setActiveModalCosplayer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Registration Form State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    character: '',
    city: 'Concepción',
    instagram: '',
    contact: '',
    photo: '',
    bio: ''
  });
  const [photoName, setPhotoName] = useState('');
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Lock body scroll + Escape to close + focus management
  useEffect(() => {
    if (!isRegisterModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && !registerLoading) setIsRegisterModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    // Focus the dialog for screen readers / keyboard users
    const t = setTimeout(() => closeBtnRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isRegisterModalOpen, registerLoading]);

  const lastClosedCosplayAt = useRef(0);

  // Close cosplayer modal and restore URL state seamlessly
  const handleCloseCosplayer = useCallback((e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    lastClosedCosplayAt.current = Date.now();
    setActiveModalCosplayer(null);
    try {
      if (activeTab === 'cosplay') {
        history.replaceState(null, '', '#cosplay');
      } else {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {
      // ignore
    }
  }, [activeTab]);

  // Lock body scroll + Escape to close for activeModalCosplayer profile
  useEffect(() => {
    if (!activeModalCosplayer) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') handleCloseCosplayer();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeModalCosplayer, handleCloseCosplayer]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateImageFile(file, 8);
    if (err) {
      alert(err);
      e.target.value = '';
      return;
    }
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRegisterForm(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setRegisterForm(prev => ({ ...prev, photo: '' }));
    setPhotoName('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const name = trimStr(registerForm.name, 80);
    const character = trimStr(registerForm.character, 120);
    const contact = trimStr(registerForm.contact, 160);
    const instagram = trimStr(registerForm.instagram, 200);
    const bio = trimStr(registerForm.bio, BIO_MAX_LENGTH);
    if (!name || !character || !contact) {
      setRegisterError('Por favor completa todos los campos requeridos (*).');
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
    // Normaliza @usuario a URL https para evitar href inseguros
    const normInstagram = instagram && !isSafeHttpUrl(instagram)
      ? `https://instagram.com/${instagram.trim().replace(/^@/, '')}`
      : instagram;
    // Evita fotos data: gigantes (>2MB aprox en base64) — pide URL o imagen menor
    if (registerForm.photo && registerForm.photo.startsWith('data:') && registerForm.photo.length > 2_800_000) {
      setRegisterError('La foto es muy pesada para el registro local. Sube una imagen menor a 2MB o usa una URL https.');
      return;
    }
    setRegisterLoading(true);
    setRegisterError('');
    try {
      // Foto única: si es archivo local y Cloudinary está configurado, súbela al CDN
      // y envía la URL (así la postulación queda liviana y la imagen optimizada).
      let photoToSend = typeof registerForm.photo === 'string' && (isSafeHttpUrl(registerForm.photo) || registerForm.photo.startsWith('data:image/')) ? registerForm.photo : '';
      if (photoToSend.startsWith('data:')) {
        if (isCloudinaryConfigured()) {
          try {
            const file = dataUrlToFile(photoToSend, `pasarela-${Date.now()}.jpg`);
            const uploaded = await uploadToCloudinary(file);
            photoToSend = uploaded.url;
          } catch (uploadErr) {
            setRegisterError(`No se pudo subir la foto al CDN: ${uploadErr?.message || 'error de subida'}. Prueba con una imagen más liviana o una URL https.`);
            setRegisterLoading(false);
            return;
          }
        } else if (photoToSend.length > 900_000) {
          setRegisterError('La foto es muy pesada y el CDN aún no está configurado. Usa una imagen menor a 700KB o una URL https.');
          setRegisterLoading(false);
          return;
        }
      }
      await submitCosplayApplication({
        name,
        character,
        city: trimStr(registerForm.city, 60) || 'Concepción',
        instagram: normInstagram,
        contact,
        photo: photoToSend,
        bio,
      });
      setRegisterSubmitted(true);
      setPhotoName('');
      setRegisterForm({
        name: '',
        character: '',
        city: 'Concepción',
        instagram: '',
        contact: '',
        photo: '',
        bio: ''
      });
      setTimeout(() => {
        setRegisterSubmitted(false);
        setIsRegisterModalOpen(false);
      }, 3500);
    } catch {
      setRegisterError('Hubo un problema al enviar la postulación. Intenta nuevamente.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const sliderRef = useRef(null);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Filter only community / general cosplayers (non-guest)
  const communityList = useMemo(() => {
    const list = cosplayers.filter(c => c.type !== 'guest');
    return list.length > 0 ? list : cosplayers;
  }, [cosplayers]);

  // Sort cosplayers: pinned items always appear first
  const sortedCosplayers = useMemo(() => {
    return [...communityList].sort((a, b) => {
      const aPinned = Boolean(a.pinned);
      const bPinned = Boolean(b.pinned);
      if (bPinned && !aPinned) return 1;
      if (!bPinned && aPinned) return -1;
      return 0;
    });
  }, [communityList]);

  const filteredCosplayers = sortedCosplayers;

  // 4 de ancho x 3 de largo = 12 cosplayers por página
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const gridAnchorRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(sortedCosplayers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedCosplayers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedCosplayers.slice(start, start + PAGE_SIZE);
  }, [sortedCosplayers, safePage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safePage) return;
    setCurrentPage(newPage);
    if (gridAnchorRef.current) {
      gridAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Infinite carousel items repetition
  const carouselItems = useMemo(() => {
    if (!filteredCosplayers || filteredCosplayers.length === 0) return [];
    if (filteredCosplayers.length === 1) return [...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers];
    if (filteredCosplayers.length <= 3) return [...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers];
    return [...filteredCosplayers, ...filteredCosplayers, ...filteredCosplayers];
  }, [filteredCosplayers]);

  // RequestAnimationFrame slow continuous drift (pausa fuera de viewport / pestaña oculta)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();
    let isVisible = true;
    let inViewport = true;
    const onVisibility = () => { isVisible = !document.hidden; lastTime = performance.now(); };
    document.addEventListener('visibilitychange', onVisibility);
    let observer;
    if (typeof IntersectionObserver !== 'undefined' && sliderRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting;
        lastTime = performance.now();
      }, { rootMargin: '350px' });
      observer.observe(sliderRef.current);
    }

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteracting.current && isVisible && inViewport && sliderRef.current && carouselItems.length > 0) {
        const speed = 0.052; // pixels/ms (~52px/sec) — smooth, balanced showcase drift
        sliderRef.current.scrollLeft += speed * delta;

        const { scrollLeft, scrollWidth } = sliderRef.current;
        const repeatCount = carouselItems.length / filteredCosplayers.length;
        const singleSetWidth = scrollWidth / repeatCount;

        if (singleSetWidth > 0 && scrollLeft >= singleSetWidth * (repeatCount - 1)) {
          sliderRef.current.scrollLeft -= singleSetWidth;
        } else if (singleSetWidth > 0 && scrollLeft <= 0) {
          sliderRef.current.scrollLeft += singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [carouselItems.length, filteredCosplayers.length]);

  // Initial scroll position to the middle clone for bidirectional infinite scrolling
  useEffect(() => {
    const track = sliderRef.current;
    if (!track || !filteredCosplayers.length) return;
    const timeout = setTimeout(() => {
      const repeatCount = carouselItems.length / filteredCosplayers.length;
      const singleSetWidth = track.scrollWidth / repeatCount;
      if (singleSetWidth > 0 && track.scrollLeft === 0) {
        track.scrollLeft = singleSetWidth;
      }
    }, 80);
    return () => clearTimeout(timeout);
  }, [carouselItems.length, filteredCosplayers.length]);

  const pauseInteraction = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    isInteracting.current = true;
  };

  const resumeInteractionAfterDelay = (delayMs = 1800) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, delayMs);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    isMouseDown.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftStart.current = sliderRef.current.scrollLeft;
    pauseInteraction();
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.25;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      resumeInteractionAfterDelay(1500);
    }
  };

  // Manual scroll with arrow buttons (avanza ~80% del viewport visible)
  const scrollManual = (direction) => {
    if (!sliderRef.current) return;
    pauseInteraction();
    const step = Math.max(240, sliderRef.current.clientWidth * 0.8);
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    });
    resumeInteractionAfterDelay(2500);
  };

  // Open / Close modal with URL state synchronization without anchor jumps or unmounting home
  const handleOpenCosplayer = (cosplayer) => {
    if (Date.now() - lastClosedCosplayAt.current < 450) return;
    setActiveModalCosplayer(cosplayer);
    const slug = slugify(cosplayer.name);
    try {
      history.replaceState(null, '', `#cosplay/${slug}`);
    } catch {
      // ignore
    }
  };

  // Sync modal state from URL hash (#cosplay/:slug) on load & hashchange
  useEffect(() => {
    const checkCosplayHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#cosplay/')) {
        const slug = hash.replace('#cosplay/', '').toLowerCase();
        const found = cosplayers.find(c => slugify(c.name) === slug || String(c.id) === slug);
        if (found) {
          setActiveModalCosplayer(found);
        }
      }
    };
    checkCosplayHash();
    window.addEventListener('hashchange', checkCosplayHash);
    return () => window.removeEventListener('hashchange', checkCosplayHash);
  }, [cosplayers]);

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

  return (
    <section className="section-padding" id="cosplay" style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header - Centrado y Uniforme */}
        <div className="section-title">
          <h2>Pasarela <span className="text-neon-pink">Cosplay</span> & Comunidad</h2>
          <p>El talento de Concepción y de todo el país reunido en un solo lugar. Conoce a los exponentes, apóyalos en sus redes y comparte sus fichas.</p>
          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '30px',
                boxShadow: '0 4px 18px rgba(0, 136, 255, 0.35)'
              }}
            >
              <Sparkles size={18} /> Inscríbete a la Pasarela Cosplay
            </button>
          </div>
        </div>

        {/* Infinite Carousel Track strictly contained within .container */}
        {filteredCosplayers.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <User size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No se encontraron cosplayers</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Intenta seleccionar otra ciudad o limpiar el término de búsqueda.</p>
          </div>
        ) : (
          <div className="cosplay-infinite-container group-carousel">
            {/* Floating Left Arrow (CardPoint style) */}
            <button
              onClick={() => scrollManual('left')}
              aria-label="Cosplayer anterior"
              className="carousel-floating-btn carousel-floating-left"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </button>

            {/* Floating Right Arrow (CardPoint style) */}
            <button
              onClick={() => scrollManual('right')}
              aria-label="Siguiente cosplayer"
              className="carousel-floating-btn carousel-floating-right"
            >
              <ChevronRight size={22} className="stroke-[2.5]" />
            </button>

            <div 
              ref={sliderRef}
              className="cosplay-infinite-track"
              onMouseEnter={pauseInteraction}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={() => {
                handleMouseUpOrLeave();
                resumeInteractionAfterDelay(1500);
              }}
              onTouchStart={() => {
                pauseInteraction();
                hasMoved.current = false;
              }}
              onTouchEnd={() => resumeInteractionAfterDelay(1800)}
              onTouchCancel={() => resumeInteractionAfterDelay(1800)}
            >
            {carouselItems.map((cosplayer, index) => (
              <div 
                key={`${cosplayer.id}-${index}`}
                className="cosplay-infinite-item"
              >
                <div 
                  onClick={() => {
                    if (!hasMoved.current) {
                      handleOpenCosplayer(cosplayer);
                    }
                  }}
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
                      backgroundImage: isSafeHttpUrl(cosplayer.image) ? `url(${cardSrc(cosplayer.image)})` : 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center 20%',
                      position: 'relative'
                    }}
                    className="image-loader-bg"
                  >
                    {/* Top Badges: City on Left, Character & Pinned on Right */}
                    <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, gap: '8px' }}>
                      {/* City Badge located at TOP LEFT */}
                      {cosplayer.city ? (
                        <span
                          style={{
                            background: 'rgba(8, 7, 17, 0.88)',
                            border: '1px solid rgba(0, 163, 255, 0.45)',
                            color: 'var(--cyan)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 750,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(6px)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <MapPin size={11} color="var(--cyan)" />
                          {cosplayer.city}
                        </span>
                      ) : <div />}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '65%' }}>
                        {cosplayer.pinned && (
                          <span 
                            style={{
                              background: 'linear-gradient(135deg, rgba(253, 52, 132, 0.95), rgba(255, 90, 95, 0.95))',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '0.70rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 10px rgba(253, 52, 132, 0.4)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Pin size={10} style={{ transform: 'rotate(-25deg)' }} /> Destacado
                          </span>
                        )}

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
                            backdropFilter: 'blur(6px)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {cosplayer.character}
                        </span>
                      </div>
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

                      {/* Card Actions: Instagram on Left, Share Button on Right */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px' }}>
                        {isSafeHttpUrl(cosplayer.instagram) ? (
                          <a 
                            href={cosplayer.instagram}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            aria-label={`Instagram de ${cosplayer.name}`}
                            onClick={(e) => {
                              if (hasMoved.current) {
                                e.preventDefault();
                                return;
                              }
                              e.stopPropagation();
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: 'var(--secondary)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'rgba(253, 52, 132, 0.12)',
                              maxWidth: '82%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            className="hover-glow"
                          >
                            <Instagram size={13} aria-hidden="true" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              @{cosplayer.instagram.split('/').filter(Boolean).pop()}
                            </span>
                          </a>
                        ) : <div />}

                        <button
                          onClick={(e) => {
                            if (hasMoved.current) {
                              e.preventDefault();
                              return;
                            }
                            handleShareCosplayer(e, cosplayer);
                          }}
                          title="Compartir"
                          aria-label="Compartir ficha"
                          style={{
                            background: copiedId === cosplayer.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                            color: copiedId === cosplayer.id ? '#10B981' : '#FFFFFF',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '6px 9px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
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
        </div>
      )}

      {/* Si estamos en el Landing (activeTab === 'home'), solo dejamos el carrusel de cosplayers y agregamos el botón para ver todos */}
      {isLanding ? (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate && navigate('cosplay')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '0.92rem' }}
          >
            Ver todos los cosplayers <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* 4x3 Grid Section Anchor (Solo visible en la sección dedicada #cosplay) */
        sortedCosplayers.length > 0 && (
          <div ref={gridAnchorRef} style={{ marginTop: '54px', scrollMarginTop: '100px' }}>
            {/* Header of Grid: Title + Total count badge + Page indicator */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end', 
              flexWrap: 'wrap', 
              gap: '14px', 
              marginBottom: '26px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  <Sparkles size={14} /> Directorio de Exponentes
                </div>
                <h3 style={{ fontSize: 'clamp(1.25rem, 2.8vw, 1.6rem)', fontWeight: 850, margin: 0, color: 'var(--text-primary)' }}>
                  Todos los Cosplayers ({sortedCosplayers.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Participantes de la pasarela y comunidad. Haz clic en cualquier tarjeta para abrir su ficha completa.
                </p>
              </div>

              {totalPages > 1 && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.82rem', 
                  fontWeight: 700, 
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)'
                }}>
                  Página <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{safePage}</span> de <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{totalPages}</span>
                </div>
              )}
            </div>

            {/* 4x3 Grid (4 columns wide x 3 rows tall = 12 items) */}
            <div className="cosplay-grid-4x3">
              {paginatedCosplayers.map((cosplayer) => (
                <div
                  key={`grid-card-${cosplayer.id}`}
                  onClick={() => handleOpenCosplayer(cosplayer)}
                  className="community-cosplay-card glass-card cosplay-grid-card"
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    role="img"
                    aria-label={`Foto de ${cosplayer.name}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                      backgroundImage: isSafeHttpUrl(cosplayer.image) ? `url(${cardSrc(cosplayer.image)})` : 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center 20%',
                      position: 'relative'
                    }}
                    className="image-loader-bg"
                  >
                    {/* Top Badges: City on Left, Character & Pinned on Right */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, gap: '8px' }}>
                      {/* City Badge located at TOP LEFT */}
                      {cosplayer.city ? (
                        <span
                          style={{
                            background: 'rgba(8, 7, 17, 0.88)',
                            border: '1px solid rgba(0, 163, 255, 0.45)',
                            color: 'var(--cyan)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 750,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(6px)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <MapPin size={10} color="var(--cyan)" />
                          {cosplayer.city}
                        </span>
                      ) : <div />}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '65%' }}>
                        {cosplayer.pinned && (
                          <span 
                            style={{
                              background: 'linear-gradient(135deg, rgba(253, 52, 132, 0.95), rgba(255, 90, 95, 0.95))',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '0.70rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 10px rgba(253, 52, 132, 0.4)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Pin size={10} style={{ transform: 'rotate(-25deg)' }} /> Destacado
                          </span>
                        )}

                        {/* Character Tag */}
                        <span 
                          style={{
                            background: 'rgba(8,7,17,0.85)',
                            border: '1.5px solid var(--secondary)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            backdropFilter: 'blur(6px)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {cosplayer.character}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Content Gradient */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '70%',
                        background: 'linear-gradient(to top, rgba(8, 7, 17, 0.98) 0%, rgba(8, 7, 17, 0.72) 45%, transparent 100%)',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '16px',
                        gap: '5px'
                      }}
                    >
                      {cosplayer.role && (
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {cosplayer.role}
                        </span>
                      )}

                      <h4 style={{ fontSize: '1.18rem', fontWeight: 850, color: '#FFFFFF', lineHeight: 1.2, margin: 0 }}>
                        {cosplayer.name}
                      </h4>

                      <p style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.4, margin: '2px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cosplayer.bio}
                      </p>

                      {/* Card Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px' }}>
                        {isSafeHttpUrl(cosplayer.instagram) ? (
                          <a 
                            href={cosplayer.instagram}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            aria-label={`Instagram de ${cosplayer.name}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--secondary)',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '5px 9px',
                              borderRadius: '7px',
                              background: 'rgba(253, 52, 132, 0.12)',
                              maxWidth: '82%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            className="hover-glow"
                          >
                            <Instagram size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              @{cosplayer.instagram.split('/').filter(Boolean).pop()}
                            </span>
                          </a>
                        ) : <div />}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareCosplayer(e, cosplayer);
                          }}
                          title="Compartir"
                          aria-label="Compartir ficha"
                          style={{
                            background: copiedId === cosplayer.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                            color: copiedId === cosplayer.id ? '#10B981' : '#FFFFFF',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '5px 7px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {copiedId === cosplayer.id ? <Check size={12} /> : <Share2 size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '16px',
                padding: '16px 0'
              }}>
                <button
                  type="button"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Página anterior"
                  className="btn btn-secondary pagination-btn"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    opacity: safePage <= 1 ? 0.35 : 1,
                    cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    minHeight: '42px',
                    borderRadius: '12px'
                  }}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>

                {/* Page Numbers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      aria-label={`Ir a página ${pageNum}`}
                      aria-current={safePage === pageNum ? 'page' : undefined}
                      style={{
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: safePage === pageNum ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                        background: safePage === pageNum ? 'linear-gradient(135deg, var(--secondary) 0%, #ff5277 100%)' : 'rgba(255,255,255,0.04)',
                        color: safePage === pageNum ? '#FFFFFF' : 'var(--text-secondary)',
                        boxShadow: safePage === pageNum ? '0 4px 14px rgba(253, 52, 132, 0.4)' : 'none'
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Página siguiente"
                  className="btn btn-secondary pagination-btn"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    opacity: safePage >= totalPages ? 0.35 : 1,
                    cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    minHeight: '42px',
                    borderRadius: '12px'
                  }}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )
      )}
      </div>

      {/* Modal Profile View (Rendered via Portal on document.body to ensure it sits on top of Header, Footer, and page content) */}
      {activeModalCosplayer && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCloseCosplayer();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 5, 10, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(12px, 3vw, 24px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
          className="animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="cosplayer-modal-card"
          >
            {/* Close Button in top right */}
            <button
              type="button"
              onClick={handleCloseCosplayer}
              aria-label="Cerrar modal"
              className="cosplayer-modal-close-btn"
            >
              <X size={20} style={{ pointerEvents: 'none' }} />
            </button>

            {/* LEFT COLUMN: FULL PHOTO BOX */}
            <div className="cosplayer-modal-photo-box">
              <img 
                src={cardSrc(activeModalCosplayer.image || '/assets/cosplay_placeholder.jpg')} 
                alt={`Foto de ${activeModalCosplayer.name} como ${activeModalCosplayer.character || 'cosplay'}`} 
                loading="eager"
                decoding="async"
                onError={(e) => { 
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/cosplay_placeholder.jpg'; 
                }}
                className="cosplayer-modal-img"
              />
              
              {/* Overlay Badges on the photo */}
              <div className="cosplayer-modal-badges">
                <span className="badge-char">
                  {activeModalCosplayer.character}
                </span>
                {activeModalCosplayer.city && (
                  <span className="badge-city">
                    <MapPin size={11} color="var(--cyan)" /> {activeModalCosplayer.city}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: INFO & ACTIONS BOX */}
            <div className="cosplayer-modal-info-box">

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '36px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeModalCosplayer.role || 'Pasarela Cosplay 2026'}
                </span>
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.85rem)', fontWeight: 850, margin: '2px 0 0', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {activeModalCosplayer.name}
                </h2>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--secondary)' }}>
                  {activeModalCosplayer.character}
                </span>
              </div>

              {/* Bio area with smooth scrolling */}
              <div className="cosplayer-modal-bio">
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {activeModalCosplayer.bio || 'Cosplayer participante de la Pasarela Cosplay de La Otakonce 2026 en Concepción.'}
                </p>
              </div>

              {/* Action Buttons at bottom of info box */}
              <div className="cosplayer-modal-actions">
                {activeModalCosplayer.instagram && isSafeHttpUrl(activeModalCosplayer.instagram) && (
                  <a
                    href={activeModalCosplayer.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      width: '100%', 
                      textDecoration: 'none', 
                      minHeight: '44px', 
                      fontWeight: 800,
                      fontSize: '0.92rem'
                    }}
                  >
                    <Instagram size={17} /> Seguir en Instagram
                  </a>
                )}

                <button
                  onClick={(e) => handleShareCosplayer(e, activeModalCosplayer)}
                  className="btn btn-secondary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    width: '100%', 
                    minHeight: '44px', 
                    fontWeight: 700,
                    fontSize: '0.92rem'
                  }}
                >
                  {copiedId === activeModalCosplayer.id ? <Check size={16} /> : <Share2 size={16} />}
                  {copiedId === activeModalCosplayer.id ? '¡Enlace Copiado!' : 'Compartir Ficha en Redes'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Registration Modal for Pasarela Cosplay (portal: evita stacking-context de la sección) */}
      {isRegisterModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => !registerLoading && setIsRegisterModalOpen(false)}
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pasarela-register-title"
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
            {/* Close Button */}
            <button
              ref={closeBtnRef}
              onClick={() => setIsRegisterModalOpen(false)}
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
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 850, margin: 0 }}>
                  ¡Postulación Enviada con Éxito!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '380px', margin: 0 }}>
                  Hemos recibido tu inscripción para la <strong>Pasarela Cosplay Otakonce 2026</strong>. El equipo organizador la evaluará y pronto te verás en la galería oficial.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '12px', minHeight: '48px', padding: '12px 32px' }}
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} noValidate={false} className="register-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ paddingRight: '48px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    <Sparkles size={15} aria-hidden="true" /> Otakonce 2026
                  </div>
                  <h3 id="pasarela-register-title" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 850, margin: '0 0 6px', lineHeight: 1.25 }}>
                    Inscripción a la Pasarela Cosplay
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Comparte tu talento con toda la comunidad. Llena los datos a continuación para postular.
                  </p>
                </div>

                {registerError && (
                  <div style={{ background: 'rgba(255, 59, 108, 0.12)', border: '1px solid rgba(255, 59, 108, 0.3)', color: 'var(--secondary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{registerError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Nombre o Apodo Cosplay <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nick, tal como te conoce la comunidad"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Personaje y Serie / Videojuego <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Frieren (Sousou no Frieren)"
                    value={registerForm.character}
                    onChange={(e) => setRegisterForm({ ...registerForm, character: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                      Ciudad de Origen <span style={{ color: 'var(--secondary)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="La ciudad desde donde vienes"
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                      Instagram
                    </label>
                    <input
                      type="text"
                      placeholder="@tucuenta"
                      value={registerForm.instagram}
                      onChange={(e) => setRegisterForm({ ...registerForm, instagram: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                    />
                  </div>
                </div>

                <div className="form-group register-contact-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="register-email" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Email de Contacto <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={registerForm.contact}
                    onChange={(e) => setRegisterForm({ ...registerForm, contact: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  />
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Solo lo verá el staff organizador para coordinar tu participación.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <span id="register-photo-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
                    Foto de tu Cosplay o Traje <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(máx. 1 foto)</span>
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <label
                        htmlFor="register-photo-input"
                        className="btn btn-secondary"
                        style={{ minHeight: '44px', padding: '10px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}
                      >
                        <Upload size={16} aria-hidden="true" />
                        {registerForm.photo && registerForm.photo.startsWith('data:') ? 'Cambiar foto' : 'Subir foto'}
                      </label>
                      <input
                        id="register-photo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handlePhotoUpload}
                        aria-labelledby="register-photo-label"
                        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: photoName ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {photoName || 'JPG, PNG, WEBP o GIF · máx 8MB'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>O URL:</span>
                      <input
                        type="url"
                        inputMode="url"
                        placeholder="https://ejemplo.com/mifoto.jpg"
                        value={registerForm.photo && !registerForm.photo.startsWith('data:') ? registerForm.photo : ''}
                        onChange={(e) => { setRegisterForm({ ...registerForm, photo: e.target.value }); setPhotoName(''); }}
                        className="form-control"
                        style={{ flex: 1, minWidth: 0, padding: '10px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                      />
                    </div>
                  </div>
                  {registerForm.photo && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '90px', height: '110px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <img src={registerForm.photo} alt="Vista previa de tu foto de cosplay" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <button
                        type="button"
                        onClick={clearPhoto}
                        aria-label="Quitar foto seleccionada"
                        className="btn btn-secondary"
                        style={{ minHeight: '44px', padding: '8px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <X size={14} aria-hidden="true" />
                        Quitar
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group register-bio-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="register-bio" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <span>Breve Presentación o Propuesta en Escenario</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: (registerForm.bio?.length || 0) >= BIO_MAX_LENGTH ? 'var(--secondary)' : 'var(--text-muted)' }} aria-live="polite">
                      {registerForm.bio?.length || 0}/{BIO_MAX_LENGTH}
                    </span>
                  </label>
                  <textarea
                    id="register-bio"
                    rows={3}
                    maxLength={BIO_MAX_LENGTH}
                    placeholder="Una breve presentación de tu traje o tu show. Por tu seguridad, no incluyas datos sensibles como teléfono, dirección o RUT."
                    value={registerForm.bio}
                    onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', resize: 'vertical' }}
                  />
                  <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Máximo {BIO_MAX_LENGTH} caracteres: breve y al grano.
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={registerLoading}
                    onClick={() => setIsRegisterModalOpen(false)}
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
      `}</style>

      <style>{`
        /* Infinite Carousel Contained Inside .container */
        .cosplay-infinite-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
        }

        /* Continuous Smooth Track */
        .cosplay-infinite-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: auto !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 8px 4px 16px;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          touch-action: pan-x pan-y pinch-zoom;
        }
        .cosplay-infinite-track:active {
          cursor: grabbing;
        }
        .cosplay-infinite-track::-webkit-scrollbar {
          display: none;
        }

        /* Item Width inside Container */
        .cosplay-infinite-item {
          flex: 0 0 350px;
          width: 350px;
        }

        /* Card Styling */
        .community-cosplay-card {
          width: 100%;
          height: 460px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .community-cosplay-card:hover {
          transform: translateY(-6px);
          border-color: var(--secondary) !important;
          box-shadow: 0 16px 36px rgba(253, 52, 132, 0.25) !important;
        }

        /* Floating Navigation Buttons like CardPoint */
        .carousel-floating-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 25;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          color: #0F172A;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease;
          user-select: none;
        }
        .carousel-floating-left {
          left: 14px;
        }
        .carousel-floating-right {
          right: 14px;
        }
        .carousel-floating-btn:hover {
          transform: translateY(-50%) scale(1.12);
          background: #FFFFFF;
          color: var(--secondary);
          box-shadow: 0 10px 28px rgba(253, 52, 132, 0.4), 0 0 14px rgba(0, 136, 255, 0.3);
        }
        .carousel-floating-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        /* Mobile Adjustments */
        @media (max-width: 767px) {
          .carousel-floating-btn {
            width: 44px;
            height: 44px;
          }
          .carousel-floating-left {
            left: 6px;
          }
          .carousel-floating-right {
            right: 6px;
          }
          .cosplay-infinite-track {
            gap: 14px;
            padding: 4px 2px 16px;
          }
          .cosplay-infinite-item {
            flex: 0 0 min(280px, 78vw);
            width: min(280px, 78vw);
          }
          .community-cosplay-card {
            height: 410px;
            border-radius: 18px;
          }
        }

        /* 4x3 Cosplay Grid */
        .cosplay-grid-4x3 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .cosplay-grid-card {
          height: 430px;
        }

        .pagination-btn:hover:not(:disabled) {
          background: rgba(253, 52, 132, 0.15) !important;
          border-color: var(--secondary) !important;
          color: #FFFFFF !important;
        }

        @media (max-width: 1080px) {
          .cosplay-grid-4x3 {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .cosplay-grid-card {
            height: 410px;
          }
        }

        @media (max-width: 767px) {
          .cosplay-grid-4x3 {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .cosplay-grid-card {
            height: 380px;
            border-radius: 16px;
          }
        }

        @media (max-width: 480px) {
          .cosplay-grid-4x3 {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .cosplay-grid-card {
            height: 400px;
          }
        }

        /* 2-in-1 Cosplayer Modal Card */
        .cosplayer-modal-card {
          background: var(--bg-surface-solid);
          border: 2px solid var(--border-color);
          border-radius: 24px;
          width: min(840px, 94vw);
          max-height: min(88vh, 520px);
          display: flex;
          flex-direction: row;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.65), 0 0 35px rgba(253, 52, 132, 0.2);
          position: relative;
          margin: auto;
        }

        .cosplayer-modal-photo-box {
          flex: 0 0 46%;
          max-width: 46%;
          position: relative;
          background: linear-gradient(135deg, #1e1b4b 0%, #4c0519 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justifyContent: center;
        }

        .cosplayer-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cosplayer-modal-badges {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          justifyContent: space-between;
          align-items: center;
          gap: 8px;
          z-index: 5;
          flex-wrap: wrap;
        }

        .badge-char {
          background: var(--secondary);
          color: #FFFFFF;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.80rem;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }

        .badge-city {
          background: rgba(8, 7, 17, 0.88);
          color: #FFFFFF;
          border: 1px solid rgba(0, 136, 255, 0.35);
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.76rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(4px);
        }

        .cosplayer-modal-info-box {
          flex: 1 1 54%;
          display: flex;
          flex-direction: column;
          padding: 32px 28px;
          overflow-y: auto;
          position: relative;
          gap: 16px;
        }

        .cosplayer-modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 42px !important;
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          border-radius: 50% !important;
          background: rgba(15, 23, 42, 0.08);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 50;
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
          padding: 0 !important;
        }
        .cosplayer-modal-close-btn:hover {
          background: var(--secondary) !important;
          color: #FFFFFF !important;
          border-color: transparent !important;
          transform: scale(1.08);
        }
        .cosplayer-modal-close-btn:active {
          transform: scale(0.94);
        }

        .cosplayer-modal-bio {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 4px;
        }

        .cosplayer-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: auto;
        }

        /* Responsive Mobile Layout: 1 column on screens below 680px */
        @media (max-width: 679px) {
          .cosplayer-modal-card {
            flex-direction: column !important;
            width: min(450px, 94vw) !important;
            max-height: min(90vh, 640px) !important;
          }
          .cosplayer-modal-photo-box {
            flex: 0 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            height: clamp(190px, 28vh, 240px) !important;
          }
          .cosplayer-modal-info-box {
            padding: 20px 18px !important;
            gap: 12px !important;
          }
          .cosplayer-modal-close-btn {
            top: 12px !important;
            right: 12px !important;
            background: rgba(8, 7, 17, 0.75) !important;
            color: #FFFFFF !important;
            border-color: rgba(255, 255, 255, 0.25) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CosplayerGallery;
