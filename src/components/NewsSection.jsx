import React, { useState } from 'react';
import { Search, Calendar, Clock, X, Newspaper } from 'lucide-react';

const NewsSection = ({ newsList = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['Todas', 'Anuncio', 'Cosplay', 'Comunidad'];

  // Filter and Search logic
  const filteredNews = newsList.filter(article => {
    const matchesCategory = selectedCategory === 'Todas' || article.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeClass = (category) => {
    switch (category.toLowerCase()) {
      case 'anuncio': return 'badge-announcement';
      case 'cosplay': return 'badge-cosplay';
      case 'comunidad': return 'badge-community';
      default: return '';
    }
  };

  const getPlaceholderGradient = (category) => {
    switch (category.toLowerCase()) {
      case 'anuncio': return 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)';
      case 'cosplay': return 'linear-gradient(135deg, #EC4899 0%, #D946EF 100%)';
      case 'comunidad': return 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)';
      default: return 'linear-gradient(135deg, #1F2937 0%, #111827 100%)';
    }
  };

  return (
    <section className="section-padding" id="news" style={{ minHeight: '80vh' }}>
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
          <div 
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            className="category-scroll-list"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'transparent' : 'var(--border-color)',
                  color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
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
                onClick={() => setSelectedArticle(article)}
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
                    backgroundImage: article.image ? `url(${article.image})` : getPlaceholderGradient(article.category),
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                    Leer noticia completa &rarr;
                  </span>
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
      {selectedArticle && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn var(--transition-fast)'
          }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface-solid)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
              animation: 'slideInUp var(--transition-smooth)'
            }}
            onClick={(e) => e.stopPropagation()}
            className="modal-body"
          >
            {/* Modal Image Header */}
            <div 
              role="img"
              aria-label={`Imagen de cabecera de la noticia: ${selectedArticle.title}`}
              style={{
                height: '240px',
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
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10,
                  background: 'rgba(8, 7, 17, 0.7)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                className="modal-close-btn"
              >
                <X size={18} />
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
            <div style={{ padding: '24px 20px' }} className="modal-content-area">
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

              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
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
        </div>
      )}

      <style>{`
        .modal-close-btn:hover {
          background: var(--secondary) !important;
          border-color: transparent !important;
        }
        .category-scroll-list::-webkit-scrollbar {
          display: none;
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
