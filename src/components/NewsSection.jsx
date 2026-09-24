import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Calendar, Clock, X, Newspaper } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { cardSrc } from '../services/media';
import { safeUrlOr } from '../utils/sanitize';

const NewsSection = ({ newsList = [], onSelectArticle, isHomePreview = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Lock body scroll + Escape to close for selectedArticle
  useEffect(() => {
    if (!selectedArticle) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedArticle(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedArticle]);

  const categories = ['Todas', 'Anuncio', 'Cosplay', 'Comunidad'];

  // Filter and Search logic (null-safe)
  const filteredNews = newsList.filter(article => {
    const matchesCategory = selectedCategory === 'Todas' || (article.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (article.title || '').toLowerCase().includes(q) || 
      (article.summary || '').toLowerCase().includes(q) || 
      (article.content || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeClass = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'anuncio': return 'badge-announcement';
      case 'cosplay': return 'badge-cosplay';
      case 'comunidad': return 'badge-community';
      default: return '';
    }
  };

  const getPlaceholderGradient = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'anuncio': return 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)';
      case 'cosplay': return 'linear-gradient(135deg, #EC4899 0%, #D946EF 100%)';
      case 'comunidad': return 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)';
      default: return 'linear-gradient(135deg, #1F2937 0%, #111827 100%)';
    }
  };

  return (
    <section className="section-padding" id="news" style={{ minHeight: isHomePreview ? 'auto' : '80vh', padding: isHomePreview ? '36px 0 20px' : undefined }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <h2>Noticias & <span className="text-neon-pink">Anuncios</span></h2>
          <p>Entérate de las últimas novedades, cronogramas y comunicados oficiales sobre Otakonce 2026.</p>
        </div>

        {/* Filter Controls */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '40px',
            width: '100%'
          }}
          className="filter-controls-container"
        >
          {/* Categories Tab list */}
          <div className="category-scroll-list">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="category-btn"
                style={{
                  background: selectedCategory === cat ? 'var(--filter-btn-active-bg)' : 'var(--filter-btn-bg)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--border-pop)' : 'var(--filter-btn-border)',
                  color: selectedCategory === cat ? 'var(--filter-btn-active-text)' : 'var(--filter-btn-text)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div 
            style={{
              position: 'relative',
              width: '100%'
            }}
          >
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  background: 'var(--bg-surface-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  transition: 'var(--transition-fast)'
              }}
              className="search-input"
            />
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} 
            />
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid-responsive">
            {filteredNews.map((article) => (
              <article 
                key={article.id}
                className="glass-card"
                onClick={() => {
                  if (onSelectArticle) {
                    onSelectArticle(article);
                  } else {
                    setSelectedArticle(article);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onSelectArticle) onSelectArticle(article);
                    else setSelectedArticle(article);
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={`Leer noticia: ${article.title}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {/* News Image / Gradient Fallback */}
                <div 
                  role="img"
                  aria-label={`Imagen ilustrativa de la noticia: ${article.title}`}
                  style={{
                    height: '200px',
                    width: '100%',
                    background: getPlaceholderGradient(article.category),
                    backgroundImage: safeUrlOr(article.image) ? `url(${cardSrc(article.image)})` : getPlaceholderGradient(article.category),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                  className="image-loader-bg"
                >
                  <span 
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      zIndex: 2
                    }}
                    className={`badge ${getCategoryBadgeClass(article.category)}`}
                  >
                    {article.category}
                  </span>
                </div>

                {/* News Details */}
                <div 
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    gap: '12px'
                  }}
                >
                  {/* Meta (Date / Read time) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {article.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {article.readTime || '3 min'}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
                    {article.summary}
                  </p>

                  {/* Read More button */}
                  <a
                    href={`#noticia/${slugify(article.title)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onSelectArticle) onSelectArticle(article);
                      else setSelectedArticle(article);
                    }}
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', minHeight: '44px' }}
                  >
                    Leer noticia completa &rarr;
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div 
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              border: '1px dashed var(--border-color)',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.01)'
            }}
          >
            <Newspaper size={40} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No se encontraron noticias</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px' }}>Intenta cambiando el filtro de categoría o reescribiendo la búsqueda en la barra superior.</p>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 5, 10, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(12px, 3vw, 24px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            animation: 'fadeIn var(--transition-fast)'
          }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface-solid)',
              border: '2px solid var(--border-color)',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: 'min(90vh, 680px)',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
              animation: 'slideInUp var(--transition-smooth)',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            className="modal-body"
          >
            {/* Modal Image Header */}
            <div 
              role="img"
              aria-label={`Imagen de cabecera de la noticia: ${selectedArticle.title}`}
              style={{
                height: 'clamp(180px, 25vh, 240px)',
                width: '100%',
                background: getPlaceholderGradient(selectedArticle.category),
                backgroundImage: selectedArticle.image ? `url(${selectedArticle.image})` : getPlaceholderGradient(selectedArticle.category),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
              className="image-loader-bg"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedArticle(null)}
                aria-label="Cerrar noticia"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 10,
                  background: 'rgba(8, 7, 17, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  minHeight: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'var(--transition-fast)'
                }}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>

              <span 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '20px',
                  zIndex: 2
                }}
                className={`badge ${getCategoryBadgeClass(selectedArticle.category)}`}
              >
                {selectedArticle.category}
              </span>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 'clamp(18px, 3vw, 32px)' }} className="modal-content-area">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {selectedArticle.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {selectedArticle.readTime || '3 min'}
                </span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.25 }}>
                {selectedArticle.title}
              </h2>

              <p 
                style={{ 
                  fontSize: '0.95rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.6, 
                  whiteSpace: 'pre-wrap'
                }}
              >
                {selectedArticle.content}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .modal-close-btn:hover {
          background: var(--secondary) !important;
          border-color: transparent !important;
        }
        .category-scroll-list {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          width: 100%;
        }
        .category-btn {
          padding: 12px 4px;
          min-height: 44px;
          font-size: clamp(0.72rem, 2.5vw, 0.85rem);
          text-align: center;
          border-radius: 10px;
          white-space: nowrap;
          width: 100%;
        }
        .category-scroll-list::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 640px) {
          .category-scroll-list {
            display: flex;
            gap: 8px;
            width: auto;
          }
          .category-btn {
            padding: 8px 18px;
            font-size: 0.85rem;
            width: auto;
          }
        }
        @media (min-width: 768px) {
          .filter-controls-container {
            flex-direction: row !important;
            justify-content: space-between;
          }
          .search-input {
            width: 320px !important;
          }
          .modal-content-area {
            padding: 32px 40px !important;
          }
          .modal-body {
            max-height: 80vh !important;
          }
        }
      `}</style>
    </section>
  );
};

export default NewsSection;
