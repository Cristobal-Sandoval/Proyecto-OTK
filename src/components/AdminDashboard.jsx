import React, { useState, useEffect } from 'react';
import { 
  Lock, LayoutDashboard, Settings, Megaphone, Newspaper, Camera, Users, Calendar, 
  Trash2, Edit, Plus, Check, LogOut, Upload, Image as ImageIcon, Sparkles, Copy, CheckCircle2, Shield,
  Cloud, ExternalLink, Loader2, AlertCircle, ChevronDown, Layers, Star, MapPin, UserCheck, RefreshCw
} from 'lucide-react';
import { SEASONAL_THEMES } from '../data/defaults';
import { 
  uploadToCloudinary, isCloudinaryConfigured, getCloudinaryConfig, saveCloudinaryConfig 
} from '../services/cloudinary';
import { 
  saveGlobalTheme, getCosplayApplications, removeCosplayApplication 
} from '../services/cloudSync';

const AdminDashboard = ({
  eventConfig, setEventConfig,
  banners, setBanners,
  floatingBanner, setFloatingBanner,
  newsList, setNewsList,
  cosplayers, setCosplayers,
  communities, setCommunities,
  schedule, setSchedule,
  onNavigate
}) => {
  // Always prompt for password whenever the secret portal is accessed
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Rate limiting & brute force protection
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(sessionStorage.getItem('otakonce_login_attempts') || '0', 10);
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    return parseInt(sessionStorage.getItem('otakonce_login_lockout') || '0', 10);
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    const updateCooldown = () => {
      const remainingMs = lockoutUntil - Date.now();
      if (remainingMs > 0) {
        setLockoutRemaining(Math.ceil(remainingMs / 1000));
      } else {
        setLockoutRemaining(0);
        if (lockoutUntil > 0) {
          sessionStorage.removeItem('otakonce_login_lockout');
          setLockoutUntil(0);
        }
      }
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);
  
  // Dashboard Sub-navigation Tabs
  const [adminTab, setAdminTab] = useState('themes'); // themes, config, hero_banners, banner, news, cosplayers, communities, schedule
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [themeSuccessMsg, setThemeSuccessMsg] = useState('');

  // Form states
  const [configForm, setConfigForm] = useState({ ...eventConfig });
  const [bannerForm, setBannerForm] = useState({ ...floatingBanner });

  // Change Password States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

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
    saveGlobalTheme(themeId);
    const themeName = SEASONAL_THEMES.find(t => t.id === themeId)?.name || themeId;
    setThemeSuccessMsg(`¡${themeName} activado y sincronizado globalmente!`);
    setTimeout(() => setThemeSuccessMsg(''), 4000);
  };

  // Cosplay Applications State (Cloud Synchronized)
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const data = await getCosplayApplications();
      setApplications(data || []);
    } catch {
      // ignore
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated]);

  const handleApproveApplication = async (app) => {
    const newCosplayer = {
      id: Date.now(),
      name: app.name,
      character: app.character,
      city: app.city || 'Concepción',
      image: app.photo || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      instagram: app.instagram || '',
      bio: app.bio || '',
      role: 'Pasarela Individual',
      type: 'community',
      featured: false,
      presentationTime: '16:00'
    };
    setCosplayers([...cosplayers, newCosplayer]);
    const updated = await removeCosplayApplication(app.id);
    setApplications(updated || applications.filter(a => a.id !== app.id));
    alert(`¡Postulación de "${app.name}" aprobada! Ha sido incorporada a la galería de la pasarela.`);
  };

  const handleRejectApplication = async (appId) => {
    if (window.confirm('¿Seguro que deseas descartar esta postulación?')) {
      const updated = await removeCosplayApplication(appId);
      setApplications(updated || applications.filter(a => a.id !== appId));
    }
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
  const [cosplayerAdminFilter, setCosplayerAdminFilter] = useState('all'); // 'all' | 'guest' | 'community'
  const [cosplayerForm, setCosplayerForm] = useState({
    name: '', character: '', instagram: '', tiktok: '', twitter: '', image: '', photos: [], bio: '',
    type: 'guest',
    role: 'Invitado Especial',
    city: 'Concepción'
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

  // Cloudinary State & Settings
  const [cloudinarySettings, setCloudinarySettings] = useState(() => getCloudinaryConfig());
  const [cloudinarySaveSuccess, setCloudinarySaveSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [testUploadResult, setTestUploadResult] = useState(null);
  const [testUploadLoading, setTestUploadLoading] = useState(false);
  const [testUploadError, setTestUploadError] = useState('');

  // Smart Image Upload: Cloudinary CDN with graceful Base64 local fallback
  const handleSmartImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El límite recomendado es de 10MB.');
      return;
    }

    if (isCloudinaryConfigured()) {
      try {
        setUploadingImage(true);
        setUploadStatusMsg('Subiendo imagen a Cloudinary CDN...');
        const result = await uploadToCloudinary(file);
        callback(result.url);
        setUploadStatusMsg('¡Imagen subida a Cloudinary exitosamente!');
        setTimeout(() => setUploadStatusMsg(''), 4000);
      } catch (err) {
        alert('Error al subir a Cloudinary: ' + err.message + '\n\nGuardando copia local en Base64 temporalmente.');
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result);
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
      }
    } else {
      // Local Base64 fallback when Cloudinary is not yet configured
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCloudinaryConfig = (e) => {
    e.preventDefault();
    saveCloudinaryConfig(cloudinarySettings);
    setCloudinarySaveSuccess(true);
    setTimeout(() => setCloudinarySaveSuccess(false), 4000);
    alert('Configuración de Cloudinary guardada correctamente.');
  };

  const handleTestCloudinaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTestUploadLoading(true);
    setTestUploadError('');
    setTestUploadResult(null);
    try {
      const res = await uploadToCloudinary(file);
      setTestUploadResult(res);
    } catch (err) {
      setTestUploadError(err.message);
    } finally {
      setTestUploadLoading(false);
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
    if (lockoutRemaining > 0) return;

    // Use custom admin hash if changed, otherwise fallback to env or factory default
    const expectedHash = localStorage.getItem('otakonce_admin_hash') || import.meta.env.VITE_ADMIN_HASH || 'd33d224668fd2090897bb907c3b73e4dd42a1c9aac76b7b6590d329276a235ba';
    const computedHash = await hashPassword(password);
    if (computedHash === expectedHash) {
      setIsAuthenticated(true);
      sessionStorage.removeItem('otakonce_login_attempts');
      sessionStorage.removeItem('otakonce_login_lockout');
      setFailedAttempts(0);
      setLockoutUntil(0);
      setLoginError('');
      setPassword('');
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      sessionStorage.setItem('otakonce_login_attempts', String(nextAttempts));
      if (nextAttempts >= 3) {
        const lockoutTime = Date.now() + 30000; // 30 seconds cooldown
        setLockoutUntil(lockoutTime);
        sessionStorage.setItem('otakonce_login_lockout', String(lockoutTime));
        setLoginError('Demasiados intentos fallidos (3/3). Acceso bloqueado temporalmente por 30 segundos.');
      } else {
        const remaining = 3 - nextAttempts;
        setLoginError(`Contraseña incorrecta. (${remaining} intento${remaining === 1 ? '' : 's'} restante${remaining === 1 ? '' : 's'})`);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    const expectedHash = localStorage.getItem('otakonce_admin_hash') || import.meta.env.VITE_ADMIN_HASH || 'd33d224668fd2090897bb907c3b73e4dd42a1c9aac76b7b6590d329276a235ba';
    const computedCurrentHash = await hashPassword(currentPass);

    if (computedCurrentHash !== expectedHash) {
      setPassError('La contraseña actual ingresada es incorrecta.');
      return;
    }

    if (newPass.length < 6) {
      setPassError('La nueva contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsChangingPass(true);
    try {
      const newHash = await hashPassword(newPass);
      localStorage.setItem('otakonce_admin_hash', newHash);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setPassSuccess('¡Contraseña de administrador actualizada con éxito! Recuerda usar tu nueva clave en el próximo inicio de sesión.');
    } catch {
      setPassError('Ocurrió un error al procesar el cambio de contraseña.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleResetDefaultPassword = () => {
    if (window.confirm('¿Seguro que deseas restablecer la contraseña a la clave predeterminada de fábrica?')) {
      localStorage.removeItem('otakonce_admin_hash');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setPassError('');
      setPassSuccess('La contraseña ha sido restablecida a la predeterminada de fábrica.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('otakonce_admin_auth');
    window.location.hash = '';
    if (typeof onNavigate === 'function') {
      onNavigate('home');
    }
  };

  // 1. Save general config
  const handleSaveConfig = (e) => {
    e.preventDefault();
    setEventConfig(configForm);
    if (configForm.themeMode) {
      saveGlobalTheme(configForm.themeMode);
    }
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
    const photosArray = Array.isArray(cosplayerForm.photos) ? cosplayerForm.photos : [];
    const formData = {
      ...cosplayerForm,
      photos: photosArray,
      tiktok: cosplayerForm.tiktok || '',
      twitter: cosplayerForm.twitter || ''
    };

    if (editingCosplayer) {
      const updatedList = cosplayers.map(c => c.id === editingCosplayer.id ? { ...editingCosplayer, ...formData } : c);
      setCosplayers(updatedList);
      setEditingCosplayer(null);
      alert('Ficha de cosplayer actualizada.');
    } else {
      const newCos = { 
        id: Date.now(), 
        type: cosplayerForm.type || 'guest',
        role: cosplayerForm.role || (cosplayerForm.type === 'guest' ? 'Invitado Especial' : 'Pasarela Individual'),
        city: cosplayerForm.city || 'Concepción',
        ...formData 
      };
      setCosplayers([...cosplayers, newCos]);
      alert(cosplayerForm.type === 'guest' ? 'Invitado Especial agregado.' : 'Cosplayer de Pasarela agregado.');
    }
    setCosplayerForm({ 
      name: '', character: '', instagram: '', tiktok: '', twitter: '', image: '', photos: [], bio: '', 
      type: 'guest', role: 'Invitado Especial', city: 'Concepción' 
    });
  };

  const handleEditCosplayer = (cos) => {
    setEditingCosplayer(cos);
    setCosplayerForm({
      name: cos.name || '',
      character: cos.character || '',
      instagram: cos.instagram || '',
      tiktok: cos.tiktok || '',
      twitter: cos.twitter || '',
      image: cos.image || '',
      photos: Array.isArray(cos.photos) ? cos.photos : (cos.image ? [cos.image] : []),
      bio: cos.bio || '',
      type: cos.type || 'community',
      role: cos.role || (cos.type === 'guest' ? 'Invitado Especial' : 'Pasarela Individual'),
      city: cos.city || 'Concepción'
    });
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
    handleSmartImageUpload(e, (url) => {
      setHeroBannerForm(prev => ({ ...prev, image: url }));
    });
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
                  disabled={lockoutRemaining > 0}
                  required
                />
              </div>

              {loginError && (
                <div style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{lockoutRemaining > 0 ? `Bloqueo de seguridad: espera ${lockoutRemaining}s para volver a intentar` : loginError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={lockoutRemaining > 0}
                style={{ width: '100%', marginTop: '8px', opacity: lockoutRemaining > 0 ? 0.6 : 1 }}
              >
                {lockoutRemaining > 0 ? `Bloqueado (${lockoutRemaining}s)` : 'Entrar al Panel'}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }} className="admin-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '10px', background: 'rgba(0, 136, 255, 0.1)', color: 'var(--primary)', flexShrink: 0 }}>
                <LayoutDashboard size={22} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4.5vw, 1.85rem)', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Panel de <span className="text-neon-pink">Control</span>
              </h2>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={handleLogout}
              style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0, borderRadius: '10px' }}
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.4 }}>
            Gestiona la información de Otakonce 2026. Todas las modificaciones se guardan localmente y se reflejan de inmediato en la web pública.
          </p>
        </div>

        {/* Dashboard Nav Tabs - Hybrid Mobile Dropdown + Horizontal Pill Strip & Desktop Wrap */}
        <div className="admin-tabs-wrapper" style={{ marginBottom: '24px' }}>
          {/* Mobile Selector Dropdown (< 768px): Takes only 1 clean row */}
          <div className="admin-mobile-tab-dropdown">
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Layers size={13} color="var(--primary)" /> Sección del Administrador:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={adminTab}
                onChange={(e) => setAdminTab(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-solid)',
                  border: '2px solid var(--primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 750,
                  appearance: 'none',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
                  cursor: 'pointer'
                }}
              >
                {[
                  { id: 'themes', label: '✨ Modos & Fechas' },
                  { id: 'applications', label: `📋 Postulaciones Pasarela (${applications.length})` },
                  { id: 'security', label: '🛡️ Seguridad & Clave' },
                  { id: 'cloudinary', label: '☁️ Cloudinary CDN' },
                  { id: 'config', label: '⚙️ Evento Principal' },
                  { id: 'hero_banners', label: '🖼️ Banners de Inicio' },
                  { id: 'banner', label: '📢 Alerta Flotante' },
                  { id: 'news', label: '📰 Noticias' },
                  { id: 'cosplayers', label: '🎭 Invitados & Pasarela' },
                  { id: 'communities', label: '👥 Comunidades' },
                  { id: 'schedule', label: '📅 Cronograma' }
                ].map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }} />
            </div>
          </div>

          {/* Tab Button Pills: Horizontal scroll on mobile, wrap on desktop */}
          <div className="admin-tabs-list">
            {[
              { id: 'themes', label: 'Modos & Fechas', icon: Sparkles },
              { id: 'applications', label: 'Postulaciones Pasarela', icon: UserCheck, badge: applications.length },
              { id: 'security', label: 'Seguridad & Clave', icon: Shield },
              { id: 'cloudinary', label: 'Cloudinary CDN', icon: Cloud },
              { id: 'config', label: 'Evento Principal', icon: Settings },
              { id: 'hero_banners', label: 'Banners de Inicio', icon: ImageIcon },
              { id: 'banner', label: 'Alerta Flotante', icon: Megaphone },
              { id: 'news', label: 'Noticias', icon: Newspaper },
              { id: 'cosplayers', label: 'Invitados & Pasarela', icon: Camera },
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
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span style={{
                    background: isActive ? '#FFFFFF' : 'var(--secondary)',
                    color: isActive ? 'var(--secondary)' : '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    marginLeft: '2px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
          </div>
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

          {/* TAB: COSPLAY PASARELA APPLICATIONS */}
          {adminTab === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <UserCheck size={24} color="var(--primary)" /> Postulaciones a la Pasarela Cosplay
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Revisa las inscripciones enviadas por la comunidad. Al aprobar una postulación, se integrará automáticamente a la galería oficial de la Pasarela Cosplay.
                  </p>
                </div>
                <button
                  onClick={loadApplications}
                  disabled={loadingApps}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={16} className={loadingApps ? 'animate-spin' : ''} />
                  Actualizar Lista
                </button>
              </div>

              {applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                  <UserCheck size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '14px' }} />
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '6px', color: 'var(--text-primary)' }}>No hay postulaciones pendientes</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto' }}>
                    Cuando los cosplayers envíen su inscripción desde el botón de la web, aparecerán aquí para tu aprobación.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="glass-card"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '16px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <img
                          src={app.photo || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80'}
                          alt={app.name}
                          style={{
                            width: '80px',
                            height: '95px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.04em' }}>
                            {app.city || 'Concepción'}
                          </span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.name}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.character}
                          </p>
                          {app.instagram && (
                            <a
                              href={`https://instagram.com/${app.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                            >
                              <ExternalLink size={12} /> {app.instagram.startsWith('@') ? app.instagram : `@${app.instagram}`}
                            </a>
                          )}
                        </div>
                      </div>

                      {app.contact && (
                        <div style={{ fontSize: '0.82rem', background: 'rgba(0,0,0,0.15)', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-primary)' }}>
                          <strong>Contacto:</strong> {app.contact}
                        </div>
                      )}

                      {app.bio && (
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                          "{app.bio}"
                        </p>
                      )}

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Fecha de postulación: {app.createdAt || 'Reciente'}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                        <button
                          type="button"
                          onClick={() => handleApproveApplication(app)}
                          className="btn btn-primary"
                          style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.84rem', padding: '8px 12px' }}
                        >
                          <Check size={16} /> Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectApplication(app.id)}
                          className="btn btn-secondary"
                          style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.84rem', padding: '8px 12px', color: 'var(--secondary)', borderColor: 'rgba(255, 59, 108, 0.3)' }}
                        >
                          <Trash2 size={16} /> Descartar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SECURITY & PASSWORD CONFIGURATION */}
          {adminTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Shield size={24} color="var(--primary)" /> Seguridad del Panel & Cambio de Contraseña
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Administra las credenciales de acceso del staff organizador de Otakonce. Tu contraseña se procesa con encriptación criptográfica unidireccional SHA-256.
                </p>
              </div>

              {/* Status Overview Card */}
              <div
                style={{
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1.5px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '18px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Estado de la Contraseña
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: localStorage.getItem('otakonce_admin_hash') ? '#10B981' : '#00A3FF' }} />
                    <strong style={{ fontSize: '0.95rem' }}>
                      {localStorage.getItem('otakonce_admin_hash') ? 'Contraseña Personalizada Activa' : 'Contraseña de Fábrica'}
                    </strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Protección Anti-Fuerza Bruta
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#10B981' }}>
                      Activa (Máximo 3 intentos)
                    </strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Bloqueo de 30s al tercer intento fallido
                    </p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Atajo Invisible
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    <kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      Ctrl + Shift + A
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <div 
                style={{
                  background: 'var(--bg-surface-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '24px',
                  maxWidth: '560px'
                }}
              >
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="var(--primary)" /> Actualizar Contraseña del Administrador
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Ingresa tu contraseña actual y define la nueva contraseña para proteger el acceso a este panel.
                </p>

                {passSuccess && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10B981',
                      color: '#10B981',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem'
                    }}
                    className="animate-fade-in"
                  >
                    <CheckCircle2 size={18} />
                    {passSuccess}
                  </div>
                )}

                {passError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #EF4444',
                      color: '#EF4444',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem'
                    }}
                    className="animate-fade-in"
                  >
                    <AlertCircle size={18} />
                    {passError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Contraseña Actual</label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Ingresa la clave que usaste para entrar"
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', background: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', background: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', background: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                    >
                      {isChangingPass ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                      Guardar Nueva Contraseña
                    </button>

                    {localStorage.getItem('otakonce_admin_hash') && (
                      <button
                        type="button"
                        onClick={handleResetDefaultPassword}
                        className="btn btn-outline"
                        style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                      >
                        Restablecer a Clave de Fábrica
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: CLOUDINARY CDN CONFIGURATION */}
          {adminTab === 'cloudinary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Cloud size={24} color="var(--cyan)" /> Conexión con Cloudinary (Almacenamiento CDN en la Nube)
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Cloudinary permite que todas las fotos que subas desde este panel se guarden en la nube con entrega global ultrarrápida (CDN) y formato WebP optimizado, quedando disponibles para todos los visitantes al desplegar en <strong>Vercel</strong>.
                </p>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  background: isCloudinaryConfigured() ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                  border: `1.5px solid ${isCloudinaryConfigured() ? '#10B981' : '#EAB308'}`,
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isCloudinaryConfigured() ? (
                    <CheckCircle2 size={24} color="#10B981" />
                  ) : (
                    <AlertCircle size={24} color="#EAB308" />
                  )}
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: isCloudinaryConfigured() ? '#10B981' : '#EAB308' }}>
                      {isCloudinaryConfigured() 
                        ? '🟢 Cloudinary está Activo y Conectado' 
                        : '🟡 Modo Local Activo (Base64)'}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {isCloudinaryConfigured()
                        ? `Las nuevas imágenes se subirán directamente a la nube "${cloudinarySettings.cloudName}" (carpeta: ${cloudinarySettings.folder}).`
                        : 'Las imágenes se están guardando temporalmente en el navegador (Base64). Ingresa tus datos abajo para activar Cloudinary.'}
                    </p>
                  </div>
                </div>

                {cloudinarySettings.isFromEnv && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(0, 136, 255, 0.12)', color: 'var(--cyan)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                    Configurado vía .env / Vercel
                  </span>
                )}
              </div>

              {/* Form Settings */}
              <form onSubmit={handleSaveCloudinaryConfig} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Credenciales de Cloudinary</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                  <div className="form-group">
                    <label>Cloud Name (Nombre de tu nube) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: dxyz1234 o otakonce-cloud"
                      value={cloudinarySettings.cloudName}
                      onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, cloudName: e.target.value })}
                      required
                    />
                    <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lo encuentras en la parte superior izquierda de tu Dashboard en Cloudinary.</small>
                  </div>

                  <div className="form-group">
                    <label>Upload Preset (Modo Unsigned) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: otakonce_unsigned"
                      value={cloudinarySettings.uploadPreset}
                      onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, uploadPreset: e.target.value })}
                      required
                    />
                    <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Debe estar configurado en modo <strong>Unsigned</strong> (sin firma) en Settings &gt; Upload.</small>
                  </div>
                </div>

                <div className="form-group" style={{ maxWidth: '400px' }}>
                  <label>Carpeta en Cloudinary (Opcional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="otakonce"
                    value={cloudinarySettings.folder}
                    onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, folder: e.target.value })}
                  />
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organiza tus fotos dentro de esta carpeta en Cloudinary (por defecto: otakonce).</small>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px' }}>
                    <Check size={18} /> Guardar Configuración
                  </button>

                  {cloudinarySaveSuccess && (
                    <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={18} /> ¡Configuración guardada!
                    </span>
                  )}
                </div>
              </form>

              {/* Test Upload Box */}
              <div style={{ background: 'rgba(0, 136, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={18} color="var(--cyan)" /> Probar Subida en Vivo a Cloudinary
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Selecciona una imagen pequeña para comprobar que tu Cloud Name y Upload Preset funcionen correctamente antes de publicar.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <label className="btn btn-secondary" style={{ cursor: testUploadLoading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    {testUploadLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {testUploadLoading ? 'Subiendo a Cloudinary...' : 'Seleccionar imagen de prueba'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={testUploadLoading} onChange={handleTestCloudinaryUpload} />
                  </label>
                </div>

                {testUploadError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem' }}>
                    ❌ <strong>Error:</strong> {testUploadError}
                  </div>
                )}

                {testUploadResult && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={testUploadResult.url} alt="Prueba" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981', margin: '0 0 4px 0' }}>¡Subida Exitosa a Cloudinary CDN!</p>
                      <a href={testUploadResult.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--cyan)', textDecoration: 'underline', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {testUploadResult.url} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Step by step instructions guide */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>📖 Guía Rápida: Cómo obtener tu Cloud Name y Upload Preset gratis (2 min)</h4>
                
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li>
                    Regístrate gratis en <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)', fontWeight: 700, textDecoration: 'underline' }}>cloudinary.com <ExternalLink size={12} style={{ display: 'inline' }} /></a> (Tier gratis permanente de 25 GB).
                  </li>
                  <li>
                    En tu Dashboard principal, copia tu <strong>Cloud Name</strong> que aparece en la esquina superior izquierda.
                  </li>
                  <li>
                    Haz clic en el engranaje de <strong>Settings</strong> (abajo a la izquierda) y ve a la pestaña <strong>Upload</strong>.
                  </li>
                  <li>
                    Baja hasta la sección <strong>Upload presets</strong> y haz clic en <strong>Add upload preset</strong>.
                  </li>
                  <li>
                    En <strong>Signing Mode</strong> selecciona <strong>Unsigned</strong> (¡muy importante!).
                  </li>
                  <li>
                    (Opcional) En <strong>Folder</strong> escribe <code>otakonce</code>.
                  </li>
                  <li>
                    Haz clic en <strong>Save</strong> (Guardar) arriba a la derecha y copia el nombre del Preset (ej: <code>my_preset_name</code>).
                  </li>
                  <li>
                    Pega esos dos datos aquí arriba y haz clic en <strong>Guardar Configuración</strong>. ¡Todas las fotos se subirán automáticamente a Cloudinary!
                  </li>
                </ol>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '4px' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>🚀 Para desplegar en Vercel:</h5>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    En tu proyecto de Vercel ve a <strong>Settings &gt; Environment Variables</strong> y agrega:<br />
                    <code>VITE_CLOUDINARY_CLOUD_NAME = tu_cloud_name</code><br />
                    <code>VITE_CLOUDINARY_UPLOAD_PRESET = tu_upload_preset</code><br />
                    ¡Y listo! Vercel compilará la web con conexión directa al CDN de Cloudinary.
                  </p>
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
                      onChange={(e) => handleSmartImageUpload(e, (url) => setConfigForm({ ...configForm, bannerImage: url }))} 
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
                        onChange={(e) => handleSmartImageUpload(e, (url) => setNewsForm({ ...newsForm, image: url }))} 
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

              {/* News List Table & Mobile Cards */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.1rem' }}>Artículos Publicados ({newsList.length})</h4>
                
                {/* Desktop View */}
                <div className="admin-table-desktop" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
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
                                aria-label="Editar noticia"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteNews(article.id)} 
                                style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                                aria-label="Eliminar noticia"
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

                {/* Mobile Cards View */}
                <div className="admin-cards-mobile">
                  {newsList.map((article) => (
                    <div 
                      key={article.id}
                      style={{
                        background: 'var(--bg-surface-solid)',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '64px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                          {article.image ? <img src={article.image} alt="News Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}><ImageIcon size={16} style={{color:'var(--text-muted)'}} /></div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="badge badge-announcement" style={{ fontSize: '0.68rem', padding: '2px 8px', marginBottom: '4px' }}>{article.category}</span>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{article.title}</h5>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{article.date}</span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                        <button
                          type="button"
                          onClick={() => handleEditNews(article)}
                          className="btn btn-secondary"
                          style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNews(article.id)}
                          className="btn btn-secondary"
                          style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--secondary)', borderColor: 'rgba(255, 59, 108, 0.3)' }}
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COSPLAYERS CRUD */}
          {adminTab === 'cosplayers' && (() => {
            const guestList = cosplayers.filter(c => c.type === 'guest');
            const communityList = cosplayers.filter(c => c.type !== 'guest');
            const displayedCosplayers = cosplayers.filter(c => {
              if (cosplayerAdminFilter === 'guest') return c.type === 'guest';
              if (cosplayerAdminFilter === 'community') return c.type !== 'guest';
              return true;
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <form onSubmit={handleCosplayerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <Plus size={18} style={{ color: 'var(--secondary)' }} />
                    {editingCosplayer ? 'Editar Ficha Cosplayer / Invitado' : 'Agregar Cosplayer / Invitado'}
                  </h4>

                  {/* Row 1: Nombre & Personaje */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                    <div className="form-group">
                      <label>Nombre del Cosplayer / Artista</label>
                      <input 
                        type="text" className="form-control" 
                        value={cosplayerForm.name} 
                        onChange={(e) => setCosplayerForm({ ...cosplayerForm, name: e.target.value })} 
                        placeholder="ej: HaneAme, Danu Cosplay..."
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Personaje Destacado</label>
                      <input 
                        type="text" className="form-control" 
                        value={cosplayerForm.character} 
                        onChange={(e) => setCosplayerForm({ ...cosplayerForm, character: e.target.value })} 
                        placeholder="ej: Frieren, Gojo Satoru..."
                        required 
                      />
                    </div>
                  </div>

                  {/* Row 2: Sección/Tipo & Rol */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                    <div className="form-group">
                      <label>Sección / Destino en la Web</label>
                      <select
                        className="form-control"
                        value={cosplayerForm.type || 'guest'}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setCosplayerForm({
                            ...cosplayerForm,
                            type: newType,
                            role: newType === 'guest' ? 'Invitado Especial' : 'Pasarela Individual'
                          });
                        }}
                      >
                        <option value="guest">⭐ Invitado Especial / Jurado (Sección Invitados)</option>
                        <option value="community">🎭 Pasarela Cosplay & Comunidad (Pasarela y Filtro por Ciudad)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Rol o Título (Badge)</label>
                      <input 
                        type="text" className="form-control" 
                        value={cosplayerForm.role || ''} 
                        onChange={(e) => setCosplayerForm({ ...cosplayerForm, role: e.target.value })} 
                        placeholder="ej: Jurado Pasarela, Invitado VIP, Pasarela Individual..."
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: Ciudad & Instagram */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                    <div className="form-group">
                      <label>Ciudad de Origen</label>
                      <input 
                        type="text" className="form-control" 
                        value={cosplayerForm.city || ''} 
                        onChange={(e) => setCosplayerForm({ ...cosplayerForm, city: e.target.value })} 
                        placeholder="ej: Concepción, Chillán, Temuco, Santiago, Viña del Mar..."
                        required 
                      />
                    </div>
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
                  </div>

                  {/* Row 3b: Redes Opcionales (TikTok & Twitter/X) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="grid-2-col">
                    <div className="form-group">
                      <label>Enlace de TikTok (Opcional)</label>
                      <input 
                        type="url" className="form-control" 
                        value={cosplayerForm.tiktok || ''} 
                        onChange={(e) => setCosplayerForm({ ...cosplayerForm, tiktok: e.target.value })} 
                        placeholder="https://tiktok.com/@usuario"
                      />
                    </div>
                    <div className="form-group">
                      <label>Enlace de X / Twitter (Opcional)</label>
                      <input 
                        type="url" className="form-control" 
                        value={cosplayerForm.twitter || ''} 
                        onChange={(e) => setCosplayerForm({ ...cosplayerForm, twitter: e.target.value })} 
                        placeholder="https://twitter.com/usuario"
                      />
                    </div>
                  </div>

                  {/* Row 4: Foto Principal */}
                  <div className="form-group">
                    <label>Foto Principal de Cosplay</label>
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
                        <Upload size={16} /> Subir Imagen Principal
                        <input 
                          type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => handleSmartImageUpload(e, (url) => setCosplayerForm({ ...cosplayerForm, image: url }))} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Row 4b: Mini Galería de Fotos Adicionales (para la ficha del invitado) */}
                  <div className="form-group">
                    <label>
                      Mini Galería de Fotos de la Ficha ({Array.isArray(cosplayerForm.photos) ? cosplayerForm.photos.length : 0} fotos)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      {Array.isArray(cosplayerForm.photos) && cosplayerForm.photos.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img src={url} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = cosplayerForm.photos.filter((_, i) => i !== idx);
                              setCosplayerForm({ ...cosplayerForm, photos: updated });
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(0,0,0,0.75)',
                              color: '#FF3B6C',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 900
                            }}
                            title="Quitar foto"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <label 
                        className="btn btn-secondary" 
                        style={{ cursor: 'pointer', padding: '8px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Upload size={14} /> + Agregar Foto a la Galería
                        <input 
                          type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => handleSmartImageUpload(e, (url) => {
                            const prev = Array.isArray(cosplayerForm.photos) ? cosplayerForm.photos : [];
                            setCosplayerForm({ ...cosplayerForm, photos: [...prev, url] });
                          })} 
                        />
                      </label>
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>
                      💡 Estas fotos se muestran en la galería individual del invitado y pueden ampliarse a pantalla completa al hacer clic.
                    </small>
                  </div>

                  {/* Row 5: Biografía / Explicación */}
                  <div className="form-group">
                    <label>Explicación / Biografía del Invitado (Presentación en la web)</label>
                    <textarea 
                      className="form-control" rows="4"
                      value={cosplayerForm.bio} 
                      onChange={(e) => setCosplayerForm({ ...cosplayerForm, bio: e.target.value })} 
                      placeholder="Explica brevemente quién es el invitado, su trayectoria, qué personaje interpretará y su rol en Otakonce 2026..."
                      required 
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      💡 Esta explicación se muestra destacada en la sección de Invitados (formato tipo noticias), en la ficha individual y en el carrusel de inicio.
                    </small>
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
                          setCosplayerForm({ 
                            name: '', character: '', instagram: '', tiktok: '', twitter: '', image: '', photos: [], bio: '', 
                            type: 'guest', role: 'Invitado Especial', city: 'Concepción' 
                          });
                        }}
                        style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                {/* Sub-Tabs / Filter Buttons */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>
                      Listado de Cosplayers ({displayedCosplayers.length})
                    </h4>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setCosplayerAdminFilter('all')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: cosplayerAdminFilter === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                          color: cosplayerAdminFilter === 'all' ? '#0F172A' : 'var(--text-secondary)',
                          border: '1px solid',
                          borderColor: cosplayerAdminFilter === 'all' ? 'var(--primary)' : 'var(--border-color)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        Todos ({cosplayers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCosplayerAdminFilter('guest')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: cosplayerAdminFilter === 'guest' ? 'linear-gradient(135deg, #FFE200 0%, #FF3B6C 100%)' : 'rgba(255,255,255,0.04)',
                          color: cosplayerAdminFilter === 'guest' ? '#0F172A' : 'var(--text-secondary)',
                          border: '1px solid',
                          borderColor: cosplayerAdminFilter === 'guest' ? 'transparent' : 'var(--border-color)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        ⭐ Invitados VIP ({guestList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCosplayerAdminFilter('community')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: cosplayerAdminFilter === 'community' ? 'var(--cyan)' : 'rgba(255,255,255,0.04)',
                          color: cosplayerAdminFilter === 'community' ? '#0F172A' : 'var(--text-secondary)',
                          border: '1px solid',
                          borderColor: cosplayerAdminFilter === 'community' ? 'var(--cyan)' : 'var(--border-color)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        🎭 Pasarela & Comunidad ({communityList.length})
                      </button>
                    </div>
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="admin-table-desktop" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '14px 16px' }}>Foto</th>
                          <th style={{ padding: '14px 16px' }}>Nombre & Ciudad</th>
                          <th style={{ padding: '14px 16px' }}>Personaje</th>
                          <th style={{ padding: '14px 16px' }}>Sección / Rol</th>
                          <th style={{ padding: '14px 16px' }}>Instagram</th>
                          <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedCosplayers.map((cos) => (
                          <tr key={cos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row-hover">
                            <td style={{ padding: '10px 16px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                                {cos.image ? <img src={cos.image} alt="Cos Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}><ImageIcon size={14} style={{color:'var(--text-muted)'}} /></div>}
                              </div>
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cos.name}</div>
                              {cos.city && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <MapPin size={11} color="var(--cyan)" /> {cos.city}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '10px 16px' }}>{cos.character}</td>
                            <td style={{ padding: '10px 16px' }}>
                              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: cos.type === 'guest' ? 'rgba(255, 59, 108, 0.15)' : 'rgba(0, 163, 255, 0.15)',
                                  color: cos.type === 'guest' ? 'var(--secondary)' : 'var(--cyan)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {cos.type === 'guest' ? <><Star size={10} /> Invitado VIP</> : '🎭 Pasarela'}
                                </span>
                                {cos.role && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{cos.role}</span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '10px 16px', color: 'var(--cyan)' }}>@{cos.instagram ? cos.instagram.split('/').filter(Boolean).pop() : 'instagram'}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleEditCosplayer(cos)} 
                                  style={{ background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', padding: '6px' }}
                                  aria-label="Editar cosplayer"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCosplayer(cos.id)} 
                                  style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                                  aria-label="Eliminar cosplayer"
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

                  {/* Mobile Cards */}
                  <div className="admin-cards-mobile">
                    {displayedCosplayers.map((cos) => (
                      <div 
                        key={cos.id}
                        style={{
                          background: 'var(--bg-surface-solid)',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--border-color)', flexShrink: 0 }}>
                            {cos.image ? <img src={cos.image} alt="Cos Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}><ImageIcon size={18} style={{color:'var(--text-muted)'}} /></div>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: cos.type === 'guest' ? 'rgba(255, 59, 108, 0.15)' : 'rgba(0, 163, 255, 0.15)',
                                color: cos.type === 'guest' ? 'var(--secondary)' : 'var(--cyan)'
                              }}>
                                {cos.type === 'guest' ? '⭐ Invitado VIP' : 'Pasarela'}
                              </span>
                              {cos.city && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <MapPin size={10} color="var(--cyan)" /> {cos.city}
                                </span>
                              )}
                            </div>
                            <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{cos.name}</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personaje: <strong style={{ color: 'var(--text-primary)' }}>{cos.character}</strong></p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>@{cos.instagram ? cos.instagram.split('/').filter(Boolean).pop() : 'instagram'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                          <button
                            type="button"
                            onClick={() => handleEditCosplayer(cos)}
                            className="btn btn-secondary"
                            style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
                          >
                            <Edit size={16} /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCosplayer(cos.id)}
                            className="btn btn-secondary"
                            style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--secondary)', borderColor: 'rgba(255, 59, 108, 0.3)' }}
                          >
                            <Trash2 size={16} /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

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
                          onChange={(e) => handleSmartImageUpload(e, (url) => setCommunityForm({ ...communityForm, logo: url }))} 
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

              {/* Communities Table & Mobile Cards */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.1rem' }}>Comunidades Registradas ({communities.length})</h4>
                
                {/* Desktop Table */}
                <div className="admin-table-desktop" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
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
                                aria-label="Editar comunidad"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCommunity(comm.id)} 
                                style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                                aria-label="Eliminar comunidad"
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

                {/* Mobile Cards */}
                <div className="admin-cards-mobile">
                  {communities.map((comm) => (
                    <div 
                      key={comm.id}
                      style={{
                        background: 'var(--bg-surface-solid)',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid var(--border-color)', flexShrink: 0 }}>
                          {comm.logo ? <img src={comm.logo} alt="Logo Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'0.75rem', fontWeight: 800 }}>TCG</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="badge badge-community" style={{ fontSize: '0.68rem', padding: '2px 8px', marginBottom: '4px' }}>{comm.type}</span>
                          <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{comm.name}</h5>
                          {comm.instagram && <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>@{comm.instagram.split('/').pop()}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                        <button
                          type="button"
                          onClick={() => handleEditCommunity(comm)}
                          className="btn btn-secondary"
                          style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCommunity(comm.id)}
                          className="btn btn-secondary"
                          style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--secondary)', borderColor: 'rgba(255, 59, 108, 0.3)' }}
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
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

              {/* Schedule Table & Mobile Cards */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.1rem' }}>Cronograma Programado ({schedule.length})</h4>
                
                {/* Desktop Table */}
                <div className="admin-table-desktop" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
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
                                aria-label="Editar actividad"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSchedule(item.id)} 
                                style={{ background: 'transparent', color: 'var(--secondary)', cursor: 'pointer', padding: '6px' }}
                                aria-label="Eliminar actividad"
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

                {/* Mobile Cards */}
                <div className="admin-cards-mobile">
                  {schedule.map((item) => (
                    <div 
                      key={item.id}
                      style={{
                        background: 'var(--bg-surface-solid)',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span 
                          style={{
                            background: 'rgba(253, 52, 132, 0.12)',
                            color: 'var(--secondary)',
                            fontWeight: 900,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {item.time} hrs
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 700 }}>{item.stage}</span>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</h5>
                        {item.description && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.description}</p>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                        <button
                          type="button"
                          onClick={() => handleEditSchedule(item)}
                          className="btn btn-secondary"
                          style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="btn btn-secondary"
                          style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--secondary)', borderColor: 'rgba(255, 59, 108, 0.3)' }}
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
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

      {/* Floating Upload Progress Toast */}
      {uploadingImage && (
        <div 
          style={{ 
            position: 'fixed', 
            bottom: '28px', 
            right: '28px', 
            zIndex: 9999, 
            background: 'var(--bg-surface-solid)', 
            border: '2px solid var(--cyan)', 
            padding: '14px 20px', 
            borderRadius: '16px', 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            animation: 'slideInUp var(--transition-fast)'
          }}
        >
          <Loader2 size={22} className="animate-spin" color="var(--cyan)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {uploadStatusMsg || 'Subiendo imagen a Cloudinary CDN...'}
          </span>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
