import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FloatingBanner from './components/FloatingBanner';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import SeasonalOverlay from './components/SeasonalOverlay';

// Code-split non-critical and heavy components
const NewsSection = lazy(() => import('./components/NewsSection'));
const NewsDetail = lazy(() => import('./components/NewsDetail'));
const GuestDetail = lazy(() => import('./components/GuestDetail'));
const GuestsSection = lazy(() => import('./components/GuestsSection'));
const CosplayerGallery = lazy(() => import('./components/CosplayerGallery'));
const CommunityList = lazy(() => import('./components/CommunityList'));
const ScheduleTimeline = lazy(() => import('./components/ScheduleTimeline'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

import { slugify } from './utils/slugify';
import {
  getEventConfig, saveEventConfig,
  getFloatingBanner, saveFloatingBanner,
  getNews, saveNews,
  getCosplayers, saveCosplayers,
  getCommunities, saveCommunities,
  getSchedule, saveSchedule,
  getBanners, saveBanners
} from './services/db';
import { getGlobalTheme } from './services/cloudSync';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#stf-portal' || hash === '#staff-access' || hash === '#admin') {
        return 'admin';
      }
      if (hash.startsWith('#noticia/') || hash.startsWith('#news/')) {
        return 'news-detail';
      }
      if (hash.startsWith('#invitado/') || hash.startsWith('#guest/')) {
        return 'guest-detail';
      }
      if (hash === '#invitados' || hash === '#guests') {
        return 'invitados';
      }
      if (hash.startsWith('#cosplay/') || hash === '#cosplay') {
        return 'cosplay';
      }
      if (['#news', '#communities', '#schedule'].includes(hash)) {
        return hash.replace('#', '');
      }
    }
    return 'home';
  });

  // Load state from local storage or fallback to defaults
  const [eventConfig, setEventConfigState] = useState(() => getEventConfig());
  const [banners, setBannersState] = useState(() => getBanners());
  const [floatingBanner, setFloatingBannerState] = useState(() => getFloatingBanner());
  const [newsList, setNewsListState] = useState(() => getNews());
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [cosplayers, setCosplayersState] = useState(() => getCosplayers());
  const [communities, setCommunitiesState] = useState(() => getCommunities());
  const [schedule, setScheduleState] = useState(() => getSchedule());
  
  // Banner visibility state (closes announcements bar)
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // State wrappers with localStorage synchronization
  const setEventConfig = (val) => {
    setEventConfigState(val);
    saveEventConfig(val);
  };
  const setBanners = (val) => {
    setBannersState(val);
    saveBanners(val);
  };
  const setFloatingBanner = (val) => {
    setFloatingBannerState(val);
    saveFloatingBanner(val);
  };
  const setNewsList = (val) => {
    setNewsListState(val);
    saveNews(val);
  };
  const setCosplayers = (val) => {
    setCosplayersState(val);
    saveCosplayers(val);
  };
  const setCommunities = (val) => {
    setCommunitiesState(val);
    saveCommunities(val);
  };
  const setSchedule = (val) => {
    setScheduleState(val);
    saveSchedule(val);
  };

  // Synchronize documentElement data-theme attribute with active seasonal theme
  useEffect(() => {
    const currentTheme = eventConfig.themeMode || 'normal';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [eventConfig.themeMode]);

  // Synchronize global theme from cloud across devices on mount, focus, and interval
  useEffect(() => {
    let isMounted = true;
    const syncTheme = async () => {
      try {
        const remoteTheme = await getGlobalTheme();
        if (remoteTheme && isMounted) {
          setEventConfigState(prev => {
            if (prev.themeMode !== remoteTheme) {
              const updated = { ...prev, themeMode: remoteTheme };
              saveEventConfig(updated);
              return updated;
            }
            return prev;
          });
        }
      } catch {
        // Fallback silently if offline
      }
    };

    syncTheme();
    const interval = setInterval(syncTheme, 15000);
    window.addEventListener('focus', syncTheme);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', syncTheme);
    };
  }, []);

  // Synchronize document.title dynamically for SEO and browser history
  useEffect(() => {
    if (activeTab === 'news-detail' && selectedArticle) {
      document.title = `${selectedArticle.title} | Otakonce 2026`;
      return;
    }
    if (activeTab === 'guest-detail' && selectedGuest) {
      document.title = `${selectedGuest.name} (${selectedGuest.character}) | Invitados Otakonce 2026`;
      return;
    }

    const titles = {
      home: 'Otakonce 2026 | El Evento de Anime y Cultura Geek de Concepción',
      news: 'Noticias y Comunicados | Otakonce 2026',
      invitados: 'Invitados Especiales | Otakonce 2026',
      cosplay: 'Pasarela Cosplay & Comunidad | Otakonce 2026',
      communities: 'Comunidades y Agrupaciones | Otakonce 2026',
      schedule: 'Cronograma de Actividades | Otakonce 2026',
      admin: 'Acceso Administrativo | Otakonce Staff'
    };
    document.title = titles[activeTab] || 'Otakonce 2026';

    if (activeTab === 'home') {
      if (window.location.hash && window.location.hash !== '#home') {
        history.replaceState(null, '', window.location.pathname);
      }
    } else if (activeTab !== 'admin' && activeTab !== 'news-detail' && activeTab !== 'guest-detail') {
      if (activeTab === 'cosplay' && window.location.hash.startsWith('#cosplay/')) {
        // Preserve specific cosplayer modal slug in URL
      } else if (window.location.hash !== `#${activeTab}`) {
        history.replaceState(null, '', `#${activeTab}`);
      }
    }
  }, [activeTab, selectedArticle, selectedGuest]);

  // Handle article resolution from hash (e.g. #noticia/slug-de-la-noticia)
  useEffect(() => {
    const resolveHashArticle = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#noticia/') || hash.startsWith('#news/')) {
        const slug = hash.replace(/^#(noticia|news)\//, '').toLowerCase();
        const found = newsList.find(n => slugify(n.title) === slug || String(n.id) === slug);
        if (found) {
          setSelectedArticle(found);
          setActiveTab('news-detail');
        }
      }
    };
    resolveHashArticle();
  }, [newsList]);

  // Handle guest resolution from hash (e.g. #invitado/slug-del-invitado)
  useEffect(() => {
    const resolveHashGuest = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#invitado/') || hash.startsWith('#guest/')) {
        const slug = hash.replace(/^#(invitado|guest)\//, '').toLowerCase();
        const found = cosplayers.find(c => slugify(c.name) === slug || String(c.id) === slug);
        if (found) {
          setSelectedGuest(found);
          setActiveTab('guest-detail');
        }
      }
    };
    resolveHashGuest();
  }, [cosplayers]);

  // Listen for stealth admin shortcut (Ctrl+Shift+A or Cmd+Shift+A) or stealth hash (#stf-portal / #staff-access)
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#stf-portal' || hash === '#staff-access' || hash === '#admin') {
        setActiveTab('admin');
      } else if (hash === '#invitados' || hash === '#guests') {
        setActiveTab('invitados');
      } else if (hash.startsWith('#cosplay/') || hash === '#cosplay') {
        setActiveTab('cosplay');
      } else if (['#news', '#communities', '#schedule'].includes(hash)) {
        setActiveTab(hash.replace('#', ''));
      } else if (hash.startsWith('#noticia/') || hash.startsWith('#news/')) {
        const slug = hash.replace(/^#(noticia|news)\//, '').toLowerCase();
        const found = newsList.find(n => slugify(n.title) === slug || String(n.id) === slug);
        if (found) {
          setSelectedArticle(found);
          setActiveTab('news-detail');
        }
      } else if (hash.startsWith('#invitado/') || hash.startsWith('#guest/')) {
        const slug = hash.replace(/^#(invitado|guest)\//, '').toLowerCase();
        const found = cosplayers.find(c => slugify(c.name) === slug || String(c.id) === slug);
        if (found) {
          setSelectedGuest(found);
          setActiveTab('guest-detail');
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setActiveTab(prev => (prev === 'admin' ? 'home' : 'admin'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [newsList, cosplayers]);

  // Nav helper for components
  const handleNavigate = (tabId) => {
    if (tabId !== 'news-detail') {
      setSelectedArticle(null);
    }
    if (tabId !== 'guest-detail') {
      setSelectedGuest(null);
    }
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select article and navigate to dedicated news view with slug URL
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setActiveTab('news-detail');
    const slug = slugify(article.title);
    window.location.hash = `noticia/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select guest and navigate to dedicated guest profile view with slug URL
  const handleSelectGuest = (guest) => {
    setSelectedGuest(guest);
    setActiveTab('guest-detail');
    const slug = slugify(guest.name);
    window.location.hash = `invitado/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAnnouncementVisible = floatingBanner.active && !bannerDismissed;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        position: 'relative',
        paddingTop: isAnnouncementVisible ? '32px' : '0px',
        transition: 'padding var(--transition-smooth)',
        '--announcement-height': isAnnouncementVisible ? '32px' : '0px'
      }}
    >
      {/* Visual Festive Theme Overlay (Halloween bats/webs, Christmas snowfall/lights, Teletón heart, Fiestas Patrias) */}
      <SeasonalOverlay theme={activeTab === 'admin' ? 'normal' : (eventConfig.themeMode || 'normal')} />

      {/* Top Floating Announcement Bar */}
      {isAnnouncementVisible && (
        <FloatingBanner config={floatingBanner} onNavigate={handleNavigate} onDismiss={() => setBannerDismissed(true)} />
      )}
      
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} topOffset={isAnnouncementVisible ? '32px' : '0px'} />

      {/* Main Content Area */}
      <main id="main-content" key={activeTab} style={{ flex: 1 }} className="animate-fade-in">
        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === 'home' && (
            <>
              {/* Widescreen Hero & Countdown Carousel */}
              <Hero config={eventConfig} onNavigate={handleNavigate} banners={banners} />
              
              {/* Quick Public Previews of sub-pages */}
              <div style={{ background: 'rgba(255, 255, 255, 0.005)' }}>
                
                {/* 2. Invitados Especiales (VIP & Jurados - Carrusel en Home) */}
                <GuestsSection 
                  guests={cosplayers.filter(c => c.type === 'guest')} 
                  onNavigate={handleNavigate} 
                  onSelectGuest={handleSelectGuest}
                  mode="carousel" 
                />

                {/* 3. Noticias y Anuncios */}
                <NewsSection newsList={newsList.slice(0, 3)} onSelectArticle={handleSelectArticle} />
                <div style={{ textAlign: 'center', marginTop: '-30px', marginBottom: '60px' }}>
                  <button className="btn btn-secondary" onClick={() => handleNavigate('news')}>
                    Ver todas las noticias &rarr;
                  </button>
                </div>

                {/* 4. Pasarela Cosplay & Comunidad (Regional & Local) */}
                <CosplayerGallery cosplayers={cosplayers.filter(c => c.type !== 'guest')} />
                
                {/* 5. Comunidades Locales */}
                <CommunityList communities={communities.slice(0, 3)} />
                {communities.length > 3 && (
                  <div style={{ textAlign: 'center', marginTop: '-30px', marginBottom: '60px' }}>
                    <button className="btn btn-secondary" onClick={() => handleNavigate('communities')}>
                      Ver todas las comunidades &rarr;
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Full Section Tabs */}
          {activeTab === 'news' && (
            <NewsSection newsList={newsList} onSelectArticle={handleSelectArticle} />
          )}

          {/* Dedicated Individual News Article Page */}
          {activeTab === 'news-detail' && selectedArticle && (
            <NewsDetail 
              article={selectedArticle} 
              newsList={newsList} 
              onBack={() => handleNavigate('news')} 
              onSelectArticle={handleSelectArticle} 
            />
          )}

          {/* Dedicated Individual Guest Profile Page */}
          {activeTab === 'guest-detail' && selectedGuest && (
            <GuestDetail 
              guest={selectedGuest} 
              guestsList={cosplayers.filter(c => c.type === 'guest')} 
              onBack={() => handleNavigate('invitados')} 
              onSelectGuest={handleSelectGuest} 
            />
          )}

          {activeTab === 'invitados' && (
            <GuestsSection 
              guests={cosplayers.filter(c => c.type === 'guest')} 
              mode="grid" 
              onNavigate={handleNavigate} 
              onSelectGuest={handleSelectGuest}
            />
          )}

          {activeTab === 'cosplay' && (
            <CosplayerGallery cosplayers={cosplayers.filter(c => c.type !== 'guest')} />
          )}

          {activeTab === 'communities' && (
            <CommunityList communities={communities} />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTimeline schedule={schedule} />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              eventConfig={eventConfig}
              setEventConfig={setEventConfig}
              banners={banners}
              setBanners={setBanners}
              floatingBanner={floatingBanner}
              setFloatingBanner={setFloatingBanner}
              newsList={newsList}
              setNewsList={setNewsList}
              cosplayers={cosplayers}
              setCosplayers={setCosplayers}
              communities={communities}
              setCommunities={setCommunities}
              schedule={schedule}
              setSchedule={setSchedule}
              onNavigate={handleNavigate}
            />
          )}
        </Suspense>
      </main>

      {/* Footer Branding & Links */}
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
