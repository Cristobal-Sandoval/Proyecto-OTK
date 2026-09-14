import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FloatingBanner from './components/FloatingBanner';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import SeasonalOverlay from './components/SeasonalOverlay';

// Code-split non-critical and heavy components
const NewsSection = lazy(() => import('./components/NewsSection'));
const CosplayerGallery = lazy(() => import('./components/CosplayerGallery'));
const CommunityList = lazy(() => import('./components/CommunityList'));
const ScheduleTimeline = lazy(() => import('./components/ScheduleTimeline'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

import {
  getEventConfig, saveEventConfig,
  getFloatingBanner, saveFloatingBanner,
  getNews, saveNews,
  getCosplayers, saveCosplayers,
  getCommunities, saveCommunities,
  getSchedule, saveSchedule,
  getBanners, saveBanners
} from './services/db';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#stf-portal' || hash === '#staff-access' || hash === '#admin') {
        return 'admin';
      }
      if (['#news', '#cosplay', '#communities', '#schedule'].includes(hash)) {
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

  // Synchronize document.title dynamically for SEO and browser history
  useEffect(() => {
    const titles = {
      home: 'Otakonce 2026 | El Evento de Anime y Cultura Geek de Concepción',
      news: 'Noticias y Comunicados | Otakonce 2026',
      cosplay: 'Pasarela Cosplay & Invitados | Otakonce 2026',
      communities: 'Comunidades y Agrupaciones | Otakonce 2026',
      schedule: 'Cronograma de Actividades | Otakonce 2026',
      admin: 'Acceso Administrativo | Otakonce Staff'
    };
    document.title = titles[activeTab] || 'Otakonce 2026';

    if (activeTab === 'home') {
      if (window.location.hash && window.location.hash !== '#home') {
        history.replaceState(null, '', window.location.pathname);
      }
    } else if (activeTab !== 'admin') {
      if (window.location.hash !== `#${activeTab}`) {
        history.replaceState(null, '', `#${activeTab}`);
      }
    }
  }, [activeTab]);

  // Listen for stealth admin shortcut (Ctrl+Shift+A or Cmd+Shift+A) or stealth hash (#stf-portal / #staff-access)
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#stf-portal' || hash === '#staff-access' || hash === '#admin') {
        setActiveTab('admin');
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
  }, []);

  // Nav helper for components
  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
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
      <SeasonalOverlay theme={eventConfig.themeMode || 'normal'} />

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
                
                {/* News Preview */}
                <NewsSection newsList={newsList.slice(0, 3)} />
                <div style={{ textAlign: 'center', marginTop: '-30px', marginBottom: '60px' }}>
                  <button className="btn btn-secondary" onClick={() => handleNavigate('news')}>
                    Ver todas las noticias &rarr;
                  </button>
                </div>

                {/* Cosplayer Preview */}
                <CosplayerGallery cosplayers={cosplayers} />
                
                {/* Communities Preview */}
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
            <NewsSection newsList={newsList} />
          )}

          {activeTab === 'cosplay' && (
            <CosplayerGallery cosplayers={cosplayers} />
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
