import React, { useState } from 'react';
import { 
  Lock, LayoutDashboard, Settings, Megaphone, Newspaper, Camera, Users, Calendar, 
  Trash2, Edit, Plus, Check, LogOut, Upload, Image as ImageIcon, Sparkles, Copy, CheckCircle2, Shield 
} from 'lucide-react';
import { SEASONAL_THEMES } from '../data/defaults';

const AdminDashboard = ({
  eventConfig, setEventConfig,
  banners, setBanners,
  floatingBanner, setFloatingBanner,
  newsList, setNewsList,
  cosplayers, setCosplayers,
  communities, setCommunities,
  schedule, setSchedule
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('otakonce_admin_auth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard Sub-navigation Tabs
  const [adminTab, setAdminTab] = useState('themes'); // themes, config, hero_banners, banner, news, cosplayers, communities, schedule
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [themeSuccessMsg, setThemeSuccessMsg] = useState('');

  // Form states
  const [configForm, setConfigForm] = useState({ ...eventConfig });
  const [bannerForm, setBannerForm] = useState({ ...floatingBanner });

  const handleCopySecretUrl = () => {
    const secretUrl = `${window.location.origin}/#stf-portal`;
    navigator.clipboard.writeText(secretUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleSelectTheme = (themeId) => {
    const updated = { ...configForm, themeMode: themeId };
    setConfigForm(updated);
    setEventConfig(updated);
    const themeName = SEASONAL_THEMES.find(t => t.id === themeId)?.name || themeId;
    setThemeSuccessMsg(`¡${themeName} activado exitosamente!`);
    setTimeout(() => setThemeSuccessMsg(''), 4000);
  };
  
  // Hero Banners CRUD state
  const [editingHeroBanner, setEditingHeroBanner] = useState(null);
  const [heroBannerForm, setHeroBannerForm] = useState({
    title: '', subtitle: '', image: '', titleColor: '', subtitleColor: '',
    badge: '', alignmentX: 'left', badgeBgColor: '', linkUrl: '', linkLabel: ''
  });

  // News CRUD state
  const [editingNews, setEditingNews] = useState(null); // article object if editing, null if creating
  const [newsForm, setNewsForm] = useState({
    title: '', summary: '', content: '', category: 'Anuncio', date: '', image: '', readTime: ''
  });

  // Cosplayer CRUD state
  const [editingCosplayer, setEditingCosplayer] = useState(null);
  const [cosplayerForm, setCosplayerForm] = useState({
    name: '', character: '', instagram: '', image: '', bio: ''
  });

  // Community CRUD state
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [communityForm, setCommunityForm] = useState({
    name: '', type: '', description: '', logo: '', instagram: ''
  });

  // Schedule CRUD state
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    time: '', title: '', stage: 'Escenario Principal', description: ''
  });

  // Handle image conversion to Base64
  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const hashPassword = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const expectedHash = import.meta.env.VITE_ADMIN_HASH || 'd33d224668fd2090897bb907c3b73e4dd42a1c9aac76b7b6590d329276a235ba';
    const computedHash = await hashPassword(password);
    if (computedHash === expectedHash) {
      setIsAuthenticated(true);
      sessionStorage.setItem('otakonce_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('otakonce_admin_auth');
  };

  // 1. Save general config
  const handleSaveConfig = (e) => {
    e.preventDefault();
    setEventConfig(configForm);
    alert('¡Configuración guardada correctamente!');
  };

  // 2. Save floating banner settings
  const handleSaveBanner = (e) => {
    e.preventDefault();
    setFloatingBanner(bannerForm);
    alert('¡Banner flotante actualizado!');
  };

  // 3. News CRUD handlers
  const handleNewsSubmit = (e) => {
    e.preventDefault();
    if (editingNews) {
      // Update
      const updatedList = newsList.map(n => n.id === editingNews.id ? { ...editingNews, ...newsForm } : n);
      setNewsList(updatedList);
      setEditingNews(null);
      alert('Noticia actualizada.');
    } else {
      // Create
      const newArticle = {
        id: Date.now(),
        ...newsForm,
        date: newsForm.date || new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setNewsList([newArticle, ...newsList]);
      alert('Noticia creada.');
    }
    // reset
    setNewsForm({ title: '', summary: '', content: '', category: 'Anuncio', date: '', image: '', readTime: '' });
  };

  const handleEditNews = (article) => {
    setEditingNews(article);
    setNewsForm({ ...article });
  };

  const handleDeleteNews = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta noticia?')) {
      setNewsList(newsList.filter(n => n.id !== id));
    }
  };

  // 4. Cosplayer CRUD handlers
  const handleCosplayerSubmit = (e) => {
    e.preventDefault();
    if (editingCosplayer) {
      const updatedList = cosplayers.map(c => c.id === editingCosplayer.id ? { ...editingCosplayer, ...cosplayerForm } : c);
      setCosplayers(updatedList);
      setEditingCosplayer(null);
      alert('Cosplayer actualizado.');
    } else {
      const newCos = { id: Date.now(), ...cosplayerForm };
      setCosplayers([...cosplayers, newCos]);
      alert('Cosplayer agregado.');
    }
    setCosplayerForm({ name: '', character: '', instagram: '', image: '', bio: '' });
  };

  const handleEditCosplayer = (cos) => {
    setEditingCosplayer(cos);
    setCosplayerForm({ ...cos });
  };

  const handleDeleteCosplayer = (id) => {
    if (window.confirm('¿Seguro que deseas quitar a este cosplayer de la galería?')) {
      setCosplayers(cosplayers.filter(c => c.id !== id));
    }
  };

  // 5. Community CRUD handlers
  const handleCommunitySubmit = (e) => {
    e.preventDefault();
    if (editingCommunity) {
      const updatedList = communities.map(c => c.id === editingCommunity.id ? { ...editingCommunity, ...communityForm } : c);
      setCommunities(updatedList);
      setEditingCommunity(null);
      alert('Comunidad actualizada.');
    } else {
      const newComm = { id: Date.now(), ...communityForm };
      setCommunities([...communities, newComm]);
      alert('Comunidad agregada.');
    }
    setCommunityForm({ name: '', type: '', description: '', logo: '', instagram: '' });
  };

  const handleEditCommunity = (comm) => {
    setEditingCommunity(comm);
    setCommunityForm({ ...comm });
  };

  const handleDeleteCommunity = (id) => {
    if (window.confirm('¿Seguro que deseas quitar esta comunidad?')) {
      setCommunities(communities.filter(c => c.id !== id));
    }
  };

  // 6. Schedule CRUD handlers
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (editingSchedule) {
      const updatedList = schedule.map(s => s.id === editingSchedule.id ? { ...editingSchedule, ...scheduleForm } : s);
      // Sort by time
      updatedList.sort((a,b) => a.time.localeCompare(b.time));
      setSchedule(updatedList);
      setEditingSchedule(null);
      alert('Actividad actualizada.');
    } else {
      const newEvent = { id: Date.now(), ...scheduleForm };
      const updatedList = [...schedule, newEvent];
      updatedList.sort((a,b) => a.time.localeCompare(b.time));
      setSchedule(updatedList);
      alert('Actividad agregada al cronograma.');
    }
    setScheduleForm({ time: '', title: '', stage: 'Escenario Principal', description: '' });
  };

  const handleEditSchedule = (item) => {
    setEditingSchedule(item);
    setScheduleForm({ ...item });
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta actividad del cronograma?')) {
      setSchedule(schedule.filter(s => s.id !== id));
    }
  };

  // Hero Banners CRUD handlers
  const handleHeroBannerSubmit = (e) => {
    e.preventDefault();
    if (!heroBannerForm.image) {
      alert('Por favor selecciona una imagen para el banner.');
      return;
    }

    if (editingHeroBanner) {
      const updated = banners.map(b => b.id === editingHeroBanner.id ? { ...b, ...heroBannerForm } : b);
      setBanners(updated);
      setEditingHeroBanner(null);
      alert('Banner de inicio actualizado.');
    } else {
      const newBanner = {
        id: Date.now(),
        ...heroBannerForm
      };
      setBanners([...banners, newBanner]);
      alert('Banner de inicio agregado.');
    }
    setHeroBannerForm({ title: '', subtitle: '', image: '', titleColor: '', subtitleColor: '', badge: '', alignmentX: 'left', badgeBgColor: '', linkUrl: '', linkLabel: '' });
  };

  const handleEditHeroBanner = (banner) => {
    setEditingHeroBanner(banner);
    setHeroBannerForm({ 
      title: banner.title, 
      subtitle: banner.subtitle, 
      image: banner.image,
      titleColor: banner.titleColor || '',
      subtitleColor: banner.subtitleColor || '',
      badge: banner.badge || '',
      alignmentX: banner.alignmentX || 'left',
      badgeBgColor: banner.badgeBgColor || '',
      linkUrl: banner.linkUrl || '',
      linkLabel: banner.linkLabel || ''
    });
  };

  const handleDeleteHeroBanner = (id) => {
    if (banners.length <= 1) {
      alert('Debes mantener al menos un banner activo para mostrar en la página principal.');
      return;
    }
    if (window.confirm('¿Seguro que deseas eliminar este banner?')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleHeroBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El límite recomendado es de 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setHeroBannerForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Login view if not authenticated
  if (!isAuthenticated) {
    return (
      <section className="section-padding" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          <div className="glass-card" style={{ padding: '36px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'inline-flex', alignSelf: 'center', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', padding: '16px', borderRadius: '50%' }}>
              <Lock size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: 'var(--text-primary)', marginBottom: '8px' }}>Staff Otakonce</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ingresa la contraseña del panel de administración para gestionar contenidos.</p>
            </div>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div className="form-group">
                <label>Contraseña del Administrador</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Introduce la contraseña..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>{loginError}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Entrar al Panel
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Dashboard layout once authenticated
  return (
    <section className="section-padding" style={{ minHeight: '90vh' }}>
      <div className="container">
        
        {/* Dashboard Title Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }} className="admin-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LayoutDashboard size={24} style={{ color: 'var(--primary)' }} />
              Panel de <span className="text-neon-pink">Control</span>
            </h2>
            <button 
              className="btn btn-secondary" 
              onClick={handleLogout}
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', gap: '6px' }}
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestiona la información de Otakonce 2026. Todas las modificaciones se guardan localmente y se reflejan de inmediato en la web pública.
          </p>
        </div>

        {/* Dashboard Nav Tabs */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '28px',
            width: '100%'
          }}
          className="admin-tabs-list"
        >
          {[
            { id: 'themes', label: 'Modos & Fechas', icon: Sparkles },
            { id: 'config', label: 'Evento Principal', icon: Settings },
            { id: 'hero_banners', label: 'Banners de Inicio', icon: ImageIcon },
            { id: 'banner', label: 'Alerta Flotante', icon: Megaphone },
            { id: 'news', label: 'Noticias', icon: Newspaper },
            { id: 'cosplayers', label: 'Cosplayers', icon: Camera },
            { id: 'communities', label: 'Comunidades', icon: Users },
            { id: 'schedule', label: 'Cronograma', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, var(--cyan) 0%, var(--secondary) 100%)' 
                    : 'var(--bg-surface-solid)',
                  border: '1.5px solid',
                  borderColor: isActive ? 'transparent' : 'var(--border-color)',
                  color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 15px rgba(0, 136, 255, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'var(--transition-fast)'
                }}
                className="admin-tab-btn"
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="glass-card" style={{ padding: '24px', minHeight: '400px' }}>
          
          {/* TAB 0: SEASONAL THEMES & CHILEAN FESTIVITIES */}
          {adminTab === 'themes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Sparkles size={22} color="var(--primary)" /> Modos de Temporada & Fechas Importantes de Chile
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Activa con un solo clic la ambientación de la página. El tema, los colores y las decoraciones visuales (nieve, murciélagos, volantines, etc.) se aplican y sincronizan al instante en toda la web.
                </p>
              </div>

              {themeSuccessMsg && (
                <div 
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10B981',
                    color: '#10B981',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                  className="animate-fade-in"
                >
                  <CheckCircle2 size={20} />
                  {themeSuccessMsg}
                </div>
              )}

              {/* Theme Cards Grid */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}
              >
                {SEASONAL_THEMES.map((theme) => {
                  const isActive = (configForm.themeMode || 'normal') === theme.id;
                  return (
                    <div
                      key={theme.id}
                      style={{
                        background: isActive ? 'var(--bg-surface-hover)' : 'rgba(255, 255, 255, 0.03)',
                        border: '2px solid',
                        borderColor: isActive ? 'var(--primary)' : 'var(--border-color)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px',
                        boxShadow: isActive ? '0 8px 25px var(--primary-glow)' : 'none',
                        transition: 'all var(--transition-fast)',
                        position: 'relative'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '2.2rem' }}>{theme.emoji}</span>
                          {isActive ? (
                            <span 
                              style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                fontSize: '0.72rem',
                                fontWeight: 900,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                letterSpacing: '0.04em'
                              }}
                            >
                              <Check size={14} /> ACTIVO AHORA
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              Inactivo
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px' }}>
                          {theme.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cyan)', marginBottom: '10px' }}>
                          {theme.tagline}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                          {theme.description}
                        </p>

                        {/* Palette Previews */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Paleta:</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span title="Color Primario" style={{ width: '18px', height: '18px', borderRadius: '50%', background: theme.primaryColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                            <span title="Color Secundario" style={{ width: '18px', height: '18px', borderRadius: '50%', background: theme.secondaryColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                            <span title="Color Acento" style={{ width: '18px', height: '18px', borderRadius: '50%', background: theme.accentColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectTheme(theme.id)}
                        disabled={isActive}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: isActive ? 'default' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: isActive 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : 'linear-gradient(135deg, var(--cyan) 0%, var(--secondary) 100%)',
                          color: isActive ? '#10B981' : '#FFFFFF',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        {isActive ? 'Modo en Uso' : 'Activar este Modo'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Secret Link Access Card */}
              <div 
                style={{
                  marginTop: '16px',
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="var(--primary)" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
                    Acceso Secreto y Seguridad del Panel
                  </h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  El botón de administración ha sido <strong>completamente removido</strong> del pie de página público. Solo quienes conozcan el enlace secreto o el atajo de teclado pueden acceder:
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/#stf-portal`}
                    style={{
                      flex: '1 1 280px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    onClick={handleCopySecretUrl}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  >
                    {copiedUrl ? <CheckCircle2 size={16} color="#10B981" /> : <Copy size={16} />}
                    {copiedUrl ? '¡Copiado!' : 'Copiar Enlace Secreto'}
                  </button>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  💡 <strong>Atajo de teclado invisible:</strong> Presiona <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + Shift + A</kbd> (o <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Cmd + Shift + A</kbd> en Mac) en cualquier pantalla para abrir o cerrar el panel.
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: EVENT CONFIGURATION */}
          {adminTab === 'config' && (
            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>Configuración del Evento</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                <div className="form-group">
                  <label>Título del Evento</label>
                  <input 
                    type="text" className="form-control" 
                    value={configForm.title} 
                    onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Inauguración (Countdown target)</label>
                  <input 
                    type="datetime-local" className="form-control" 
                    value={configForm.countdownDate.substring(0, 16)} 
                    onChange={(e) => setConfigForm({ ...configForm, countdownDate: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción / Subtítulo</label>
                <textarea 
                  className="form-control" rows="2"
                  value={configForm.subtitle} 
                  onChange={(e) => setConfigForm({ ...configForm, subtitle: e.target.value })} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                <div className="form-group">
                  <label>Texto de Fecha</label>
                  <input 
                    type="text" className="form-control" 
                    value={configForm.date} 
                    onChange={(e) => setConfigForm({ ...configForm, date: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Lugar / Recinto</label>
                  <input 
                    type="text" className="form-control" 
                    value={configForm.location} 
                    onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Banner Principal (Imagen de Fondo)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  {configForm.bannerImage && (
                    <div style={{ width: '120px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={configForm.bannerImage} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <label 
                    className="btn btn-secondary" 
                    style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem', display: 'flex', gap: '6px' }}
                  >
                    <Upload size={16} /> Subir nueva imagen
                    <input 
                      type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, (base64) => setConfigForm({ ...configForm, bannerImage: base64 }))} 
                    />
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                <Check size={18} /> Guardar Cambios
              </button>
            </form>
          )}

          {/* TAB: HERO BANNERS CAROUSEL MANAGER */}
          {adminTab === 'hero_banners' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Form to Create/Edit Banners */}
              <form onSubmit={handleHeroBannerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(0,163,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  <Plus size={18} style={{ color: 'var(--secondary)' }} />
                  {editingHeroBanner ? 'Editar Banner de Inicio' : 'Agregar Nuevo Banner de Inicio'}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Título del Banner</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.title} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, title: e.target.value })} 
                      placeholder="Título llamativo..."
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtítulo / Descripción</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.subtitle} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, subtitle: e.target.value })} 
                      placeholder="Breve explicación o llamado..."
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Color del Título (Opcional, ej: #FF3B6C o vacío para degradado)</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.titleColor || ''} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, titleColor: e.target.value })} 
                      placeholder="Dejar vacío o ej: #FF3B6C"
                    />
                  </div>
                  <div className="form-group">
                    <label>Color del Subtítulo (Opcional, ej: #0F172A o vacío para gris)</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.subtitleColor || ''} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, subtitleColor: e.target.value })} 
                      placeholder="Dejar vacío o ej: #475569"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-3-col">
                  <div className="form-group">
                    <label>Alineación del Texto</label>
                    <select 
                      className="form-control"
                      value={heroBannerForm.alignmentX || 'left'}
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, alignmentX: e.target.value })}
                    >
                      <option value="left">Izquierda</option>
                      <option value="center">Centrado</option>
                      <option value="right">Derecha</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Etiqueta / Badge (Ej: CONCURSO)</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.badge || ''} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, badge: e.target.value })} 
                      placeholder="Dejar vacío o ej: REGISTRO"
                    />
                  </div>
                  <div className="form-group">
                    <label>Color de Etiqueta (Ej: #FF3B6C)</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.badgeBgColor || ''} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, badgeBgColor: e.target.value })} 
                      placeholder="Dejar vacío o ej: #FFE200"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Enlace / Link del Botón (Ej: #cosplay)</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.linkUrl || ''} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, linkUrl: e.target.value })} 
                      placeholder="Dejar vacío o ej: #schedule"
                    />
                  </div>
                  <div className="form-group">
                    <label>Texto del Botón (Ej: Ver Más)</label>
                    <input 
                      type="text" className="form-control" 
                      value={heroBannerForm.linkLabel || ''} 
                      onChange={(e) => setHeroBannerForm({ ...heroBannerForm, linkLabel: e.target.value })} 
                      placeholder="Dejar vacío o ej: Saber Más"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Imagen del Banner (Formato Widescreen Recomendado)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                    {heroBannerForm.image && (
                      <div style={{ width: '160px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #0F172A', boxShadow: '4px 4px 0px rgba(15,23,42,0.1)' }}>
                        <img src={heroBannerForm.image} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <label 
                      className="btn btn-secondary" 
                      style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem', display: 'flex', gap: '6px' }}
                    >
                      <Upload size={16} /> Seleccionar Imagen
                      <input 
                        type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={handleHeroBannerImageUpload} 
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">
                    <Check size={18} /> {editingHeroBanner ? 'Guardar Cambios' : 'Agregar Banner'}
                  </button>
                  {editingHeroBanner && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingHeroBanner(null);
                        setHeroBannerForm({ title: '', subtitle: '', image: '', titleColor: '', subtitleColor: '', badge: '', alignmentX: 'left', badgeBgColor: '', linkUrl: '', linkLabel: '' });
                      }}
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </form>

              {/* List of active banners */}
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Banners Activos en el Carrusel</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {banners && banners.map((banner) => (
                    <div 
                      key={banner.id}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-surface-solid)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                        <div style={{ width: '100px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                          <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <h5 style={{ fontWeight: '800', fontSize: '0.95rem' }}>{banner.title}</h5>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{banner.subtitle}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleEditHeroBanner(banner)}
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', gap: '4px' }}
                        >
                          <Edit size={14} /> Editar
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleDeleteHeroBanner(banner.id)}
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', gap: '4px', color: 'var(--secondary)', borderColor: 'rgba(255, 59, 108, 0.2)' }}
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLOATING BANNER */}
          {adminTab === 'banner' && (
            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>Gestión de Alerta Flotante</h3>

              <div className="checkbox-group">
                <input 
                  type="checkbox" id="bannerActive" 
                  checked={bannerForm.active} 
                  onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })} 
                />
                <label htmlFor="bannerActive" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Activar Banner Flotante de Emergencia</label>
              </div>

              <div className="form-group">
                <label>Texto del Anuncio</label>
                <textarea 
                  className="form-control" rows="2" maxLength="120"
                  value={bannerForm.text} 
                  onChange={(e) => setBannerForm({ ...bannerForm, text: e.target.value })} 
                  placeholder="Escribe un anuncio corto y llamativo..."
                  required={bannerForm.active}
                />
              </div>

              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label>Enlace de Destino (Ancla ej. #cosplay o URL externa)</label>
                <input 
                  type="text" className="form-control" 
                  value={bannerForm.link} 
                  onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} 
                  placeholder="ej: #cosplay o https://instagram.com/..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                <Check size={18} /> Actualizar Banner
              </button>
            </form>
          )}

          {/* TAB 3: NEWS CRUD */}
          {adminTab === 'news' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Add/Edit Form */}
              <form onSubmit={handleNewsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <Plus size={18} style={{ color: 'var(--secondary)' }} />
                  {editingNews ? 'Editar Noticia' : 'Crear Nueva Noticia'}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Título de la Noticia</label>
                    <input 
                      type="text" className="form-control" 
                      value={newsForm.title} 
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select 
                      className="form-control" 
                      value={newsForm.category} 
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    >
                      <option value="Anuncio">Anuncio</option>
                      <option value="Cosplay">Cosplay</option>
                      <option value="Comunidad">Comunidad</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Resumen Corto (Para tarjetas)</label>
                    <input 
                      type="text" className="form-control" 
                      value={newsForm.summary} 
                      onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tiempo de Lectura (ej: 3 min)</label>
                    <input 
                      type="text" className="form-control" 
                      value={newsForm.readTime} 
                      onChange={(e) => setNewsForm({ ...newsForm, readTime: e.target.value })} 
                      placeholder="ej: 3 min"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contenido de la Noticia (Completo)</label>
                  <textarea 
                    className="form-control" rows="5"
                    value={newsForm.content} 
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Imagen Ilustrativa</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                    {newsForm.image && (
                      <div style={{ width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={newsForm.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <label 
                      className="btn btn-secondary" 
                      style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem', display: 'flex', gap: '6px' }}
                    >
                      <Upload size={16} /> Seleccionar Imagen
                      <input 
                        type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(e, (base64) => setNewsForm({ ...newsForm, image: base64 }))} 
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    {editingNews ? 'Guardar Cambios' : 'Publicar Noticia'}
                  </button>
                  {editingNews && (
                    <button 
                      type="button" className="btn btn-secondary" 
                      onClick={() => {
                        setEditingNews(null);
                        setNewsForm({ title: '', summary: '', content: '', category: 'Anuncio', date: '', image: '', readTime: '' });
                      }}
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* News List Table */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.1rem' }}>Artículos Publicados</h4>
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '14px 16px' }}>Imagen</th>
                        <th style={{ padding: '14px 16px' }}>Título</th>
                        <th style={{ padding: '14px 16px' }}>Categoría</th>
                        <th style={{ padding: '14px 16px' }}>Fecha</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsList.map((article) => (
                        <tr key={article.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row-hover">
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ width: '50px', height: '35px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                              {article.image ? <img src={article.image} alt="News Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}><ImageIcon size={14} style={{color:'var(--text-muted)'}} /></div>}
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</td>
                          <td style={{ padding: '10px 16px' }}><span className="badge badge-announcement" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{article.category}</span></td>
                          <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{article.date}</td>
                          <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleEditNews(article)} 
                                style={{ background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteNews(article.id)} 
                                style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COSPLAYERS CRUD */}
          {adminTab === 'cosplayers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <form onSubmit={handleCosplayerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <Plus size={18} style={{ color: 'var(--secondary)' }} />
                  {editingCosplayer ? 'Editar Ficha Cosplayer' : 'Agregar Invitado Cosplayer'}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Nombre del Cosplayer</label>
                    <input 
                      type="text" className="form-control" 
                      value={cosplayerForm.name} 
                      onChange={(e) => setCosplayerForm({ ...cosplayerForm, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Personaje Destacado</label>
                    <input 
                      type="text" className="form-control" 
                      value={cosplayerForm.character} 
                      onChange={(e) => setCosplayerForm({ ...cosplayerForm, character: e.target.value })} 
                      placeholder="ej: Frieren"
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Enlace de Instagram</label>
                    <input 
                      type="url" className="form-control" 
                      value={cosplayerForm.instagram} 
                      onChange={(e) => setCosplayerForm({ ...cosplayerForm, instagram: e.target.value })} 
                      placeholder="https://instagram.com/usuario"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Foto de Cosplay</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                      {cosplayerForm.image && (
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img src={cosplayerForm.image} alt="Cosplay Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <label 
                        className="btn btn-secondary" 
                        style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem', display: 'flex', gap: '6px' }}
                      >
                        <Upload size={16} /> Subir Imagen
                        <input 
                          type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, (base64) => setCosplayerForm({ ...cosplayerForm, image: base64 }))} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Biografía Corta (Presentación en web)</label>
                  <textarea 
                    className="form-control" rows="3"
                    value={cosplayerForm.bio} 
                    onChange={(e) => setCosplayerForm({ ...cosplayerForm, bio: e.target.value })} 
                    placeholder="Cuéntale un poco de ti o de tus logros a los asistentes..."
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    {editingCosplayer ? 'Guardar Ficha' : 'Agregar Cosplayer'}
                  </button>
                  {editingCosplayer && (
                    <button 
                      type="button" className="btn btn-secondary" 
                      onClick={() => {
                        setEditingCosplayer(null);
                        setCosplayerForm({ name: '', character: '', instagram: '', image: '', bio: '' });
                      }}
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Cosplayers List */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.1rem' }}>Invitados Agregados</h4>
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '14px 16px' }}>Foto</th>
                        <th style={{ padding: '14px 16px' }}>Nombre</th>
                        <th style={{ padding: '14px 16px' }}>Personaje</th>
                        <th style={{ padding: '14px 16px' }}>Instagram</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cosplayers.map((cos) => (
                        <tr key={cos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row-hover">
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                              {cos.image ? <img src={cos.image} alt="Cos Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}><ImageIcon size={14} style={{color:'var(--text-muted)'}} /></div>}
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{cos.name}</td>
                          <td style={{ padding: '10px 16px' }}>{cos.character}</td>
                          <td style={{ padding: '10px 16px', color: 'var(--cyan)' }}>@{cos.instagram.split('/').pop()}</td>
                          <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleEditCosplayer(cos)} 
                                style={{ background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCosplayer(cos.id)} 
                                style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMMUNITIES CRUD */}
          {adminTab === 'communities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <form onSubmit={handleCommunitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <Plus size={18} style={{ color: 'var(--secondary)' }} />
                  {editingCommunity ? 'Editar Comunidad' : 'Agregar Agrupación/Comunidad'}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Nombre de la Agrupación</label>
                    <input 
                      type="text" className="form-control" 
                      value={communityForm.name} 
                      onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Comunidad</label>
                    <input 
                      type="text" className="form-control" 
                      value={communityForm.type} 
                      onChange={(e) => setCommunityForm({ ...communityForm, type: e.target.value })} 
                      placeholder="ej: TCG o Danza & Performance"
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Enlace Instagram</label>
                    <input 
                      type="url" className="form-control" 
                      value={communityForm.instagram} 
                      onChange={(e) => setCommunityForm({ ...communityForm, instagram: e.target.value })} 
                      placeholder="https://instagram.com/comunidad"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Logo de la Agrupación</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                      {communityForm.logo && (
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img src={communityForm.logo} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <label 
                        className="btn btn-secondary" 
                        style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem', display: 'flex', gap: '6px' }}
                      >
                        <Upload size={16} /> Subir Logo
                        <input 
                          type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, (base64) => setCommunityForm({ ...communityForm, logo: base64 }))} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción de Actividades</label>
                  <textarea 
                    className="form-control" rows="3"
                    value={communityForm.description} 
                    onChange={(e) => setCommunityForm({ ...communityForm, description: e.target.value })} 
                    placeholder="Qué actividades o torneos realizarán en el evento..."
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    {editingCommunity ? 'Guardar Comunidad' : 'Agregar Comunidad'}
                  </button>
                  {editingCommunity && (
                    <button 
                      type="button" className="btn btn-secondary" 
                      onClick={() => {
                        setEditingCommunity(null);
                        setCommunityForm({ name: '', type: '', description: '', logo: '', instagram: '' });
                      }}
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Communities Table */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.1rem' }}>Comunidades Registradas</h4>
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '14px 16px' }}>Logo</th>
                        <th style={{ padding: '14px 16px' }}>Nombre</th>
                        <th style={{ padding: '14px 16px' }}>Categoría</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {communities.map((comm) => (
                        <tr key={comm.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row-hover">
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ width: '35px', height: '35px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                              {comm.logo ? <img src={comm.logo} alt="Logo Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'0.7rem' }}>TCG</div>}
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{comm.name}</td>
                          <td style={{ padding: '10px 16px' }}><span className="badge badge-community" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{comm.type}</span></td>
                          <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleEditCommunity(comm)} 
                                style={{ background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCommunity(comm.id)} 
                                style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SCHEDULE TIMELINE CRUD */}
          {adminTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <Plus size={18} style={{ color: 'var(--secondary)' }} />
                  {editingSchedule ? 'Editar Actividad' : 'Agregar Actividad al Bloque Horario'}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-3-col">
                  <div className="form-group">
                    <label>Hora de Bloque (Format: HH:MM)</label>
                    <input 
                      type="text" className="form-control" 
                      value={scheduleForm.time} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} 
                      placeholder="ej: 14:30"
                      maxLength="5"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Título del Bloque / Actividad</label>
                    <input 
                      type="text" className="form-control" 
                      value={scheduleForm.title} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} 
                      placeholder="ej: Concurso Cosplay Pasarela"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Escenario / Sala</label>
                    <input 
                      type="text" className="form-control" 
                      value={scheduleForm.stage} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, stage: e.target.value })} 
                      placeholder="ej: Escenario Principal"
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Detalle o Descripción de la Actividad</label>
                  <textarea 
                    className="form-control" rows="3"
                    value={scheduleForm.description} 
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })} 
                    placeholder="Detalles sobre las reglas, los premios, los animadores, etc..."
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    {editingSchedule ? 'Guardar Cambios' : 'Agregar Actividad'}
                  </button>
                  {editingSchedule && (
                    <button 
                      type="button" className="btn btn-secondary" 
                      onClick={() => {
                        setEditingSchedule(null);
                        setScheduleForm({ time: '', title: '', stage: 'Escenario Principal', description: '' });
                      }}
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Schedule Table */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.1rem' }}>Cronograma Programado</h4>
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '14px 16px' }}>Hora</th>
                        <th style={{ padding: '14px 16px' }}>Actividad</th>
                        <th style={{ padding: '14px 16px' }}>Escenario</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row-hover">
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--secondary)' }}>{item.time} hrs</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--cyan)' }}>{item.stage}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleEditSchedule(item)} 
                                style={{ background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSchedule(item.id)} 
                                style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .admin-tab-btn:hover {
          transform: translateY(-2px);
          border-color: var(--cyan) !important;
        }
        .table-row-hover:hover {
          background: rgba(255,255,255,0.01) !important;
        }
        @media (min-width: 768px) {
          .grid-2-col {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .grid-3-col {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default AdminDashboard;
