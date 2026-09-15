import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, Clock, Share2, Copy, Check 
} from 'lucide-react';
import { slugify } from '../utils/slugify';
import { heroSrc, cardSrc } from '../services/media';
import { safeUrlOr } from '../utils/sanitize';

// SVG Icons for social platforms
const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.21-.17-.46-.29z"/>
  </svg>
);

const XTwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const NewsDetail = ({ article, newsList = [], onBack, onSelectArticle }) => {
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  // Generate full canonical sharing URL
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/#noticia/${slugify(article.title)}`
    : `https://laotakonce.cl/#noticia/${slugify(article.title)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback para navegadores sin clipboard API
      const ta = document.createElement('textarea');
      ta.value = currentUrl;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* noop */ }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const shareText = encodeURIComponent(`${article.title} - Otakonce 2026`);
  const shareUrlEncoded = encodeURIComponent(currentUrl);

  const shareWhatsappUrl = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrlEncoded}`;
  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrlEncoded}`;
  const shareFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`;

  // Other related articles (excluding the current one)
  const relatedNews = newsList.filter(n => n.id !== article.id).slice(0, 3);

  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'anuncio': return 'badge-announcement';
      case 'cosplay': return 'badge-cosplay';
      case 'comunidad': return 'badge-community';
      default: return 'badge-announcement';
    }
  };

  return (
    <div style={{ minHeight: '90vh', padding: '32px 16px 80px' }} className="news-detail-view">
      <div className="container" style={{ maxWidth: '840px' }}>
        
        {/* Navigation Breadcrumb / Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '0.88rem',
              fontWeight: 750,
              minHeight: '40px'
            }}
          >
            <ArrowLeft size={16} /> Volver a Noticias
          </button>
        </div>

        {/* Article Container Card */}
        <article 
          style={{
            background: 'var(--bg-surface-solid)',
            border: '2px solid var(--border-color)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Article Header Banner */}
          {safeUrlOr(article.image) ? (
            <div style={{ width: '100%', height: 'clamp(220px, 40vw, 420px)', position: 'relative', overflow: 'hidden' }}>
              <img 
                src={heroSrc(article.image)} 
                alt={article.title}
                fetchpriority="high"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%)'
                }} 
              />
              <span 
                className={`badge ${getCategoryBadgeClass(article.category)}`}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '24px',
                  fontSize: '0.85rem',
                  padding: '6px 14px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                {article.category}
              </span>
            </div>
          ) : (
            <div style={{ padding: '24px 24px 0' }}>
              <span className={`badge ${getCategoryBadgeClass(article.category)}`}>
                {article.category}
              </span>
            </div>
          )}

          {/* Article Header Info & Meta */}
          <div style={{ padding: '28px 24px 16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Calendar size={15} style={{ color: 'var(--cyan)' }} />
                {article.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Clock size={15} style={{ color: 'var(--secondary)' }} />
                {article.readTime || '3 min'} de lectura
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--text-primary)', fontWeight: 900, lineHeight: 1.25, marginBottom: '16px' }}>
              {article.title}
            </h1>

            {article.summary && (
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500, borderLeft: '4px solid var(--secondary)', paddingLeft: '14px', marginBottom: '24px' }}>
                {article.summary}
              </p>
            )}

            {/* Social Share Bar */}
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                padding: '16px 20px',
                background: 'rgba(0, 136, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                marginBottom: '32px'
              }}
              className="share-bar"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={18} style={{ color: 'var(--secondary)' }} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Compartir noticia:</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {/* WhatsApp */}
                <a 
                  href={shareWhatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="share-btn share-whatsapp"
                  title="Compartir en WhatsApp"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <WhatsAppIcon size={16} /> WhatsApp
                </a>

                {/* X / Twitter */}
                <a 
                  href={shareTwitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="share-btn share-x"
                  title="Compartir en X"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <XTwitterIcon size={14} /> X
                </a>

                {/* Facebook */}
                <a 
                  href={shareFacebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="share-btn share-facebook"
                  title="Compartir en Facebook"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#1877F2',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <FacebookIcon size={14} /> Facebook
                </a>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: copied ? 'var(--cyan)' : 'var(--bg-surface-solid)',
                    border: '1.5px solid var(--border-color)',
                    color: copied ? '#FFFFFF' : 'var(--text-primary)',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: '36px',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div 
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '28px',
                marginBottom: '40px'
              }}
              className="article-content-body"
            >
              {article.content ? (
                article.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} style={{ margin: 0 }}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>{article.summary}</p>
              )}
            </div>

            {/* Bottom Back Button */}
            <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={onBack}
                className="btn btn-primary"
                style={{ padding: '12px 32px', fontSize: '0.95rem' }}
              >
                <ArrowLeft size={18} /> Volver al listado de noticias
              </button>
            </div>
          </div>
        </article>

        {/* Related / More News Section */}
        {relatedNews.length > 0 && (
          <div style={{ marginTop: '56px' }}>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '20px' }}>
              Más Comunicados y Novedades
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {relatedNews.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderRadius: '16px'
                  }}
                >
                  {rel.image && (
                    <div style={{ width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={cardSrc(rel.image)} alt={rel.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <span className={`badge ${getCategoryBadgeClass(rel.category)}`} style={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}>
                    {rel.category}
                  </span>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {rel.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rel.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        .share-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default NewsDetail;
