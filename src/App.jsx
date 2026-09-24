import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FloatingBanner from './components/FloatingBanner';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import SeasonalOverlay from './components/SeasonalOverlay';

import NewsSection from './components/NewsSection';
import GuestsSection from './components/GuestsSection';
import CosplayerGallery from './components/CosplayerGallery';
import CommunityList from './components/CommunityList';
import ScheduleTimeline from './components/ScheduleTimeline';
import EventsShowcase from './components/EventsShowcase';
import PhotoGallery from './components/PhotoGallery';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import UpcomingEventSection from './components/UpcomingEventSection';

// Code-split infrequent and heavy secondary routes
const NewsDetail = lazy(() => import('./components/NewsDetail'));
const GuestDetail = lazy(() => import('./components/GuestDetail'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

import { slugify } from './utils/slugify';
import {
  getEventConfig, saveEventConfig,
  getFloatingBanner, saveFloatingBanner,
  getNews, saveNews,
  getCosplayers, saveCosplayers,
  getCommunities, saveCommunities,
  getSchedule, saveSchedule,
  getBanners, saveBanners,
  getEvents, saveEvents,
  getPhotos, savePhotos,
  getAboutConfig, saveAboutConfig,
  getContactConfig, saveContactConfig
} from './services/db';
import { getGlobalTheme, getPublicCosplayers, mergePublishedCosplayers, getPublicCommunities, mergePublishedCommunities } from './services/cloudSync';

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
      if (['#news', '#communities', '#schedule', '#about', '#events', '#past-events', '#gallery', '#contact'].includes(hash)) {
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
  const [events, setEventsState] = useState(() => getEvents());
  const [photos, setPhotosState] = useState(() => getPhotos());
  const [aboutConfig, setAboutConfigState] = useState(() => getAboutConfig());
  const [contactConfig, setContactConfigState] = useState(() => getContactConfig());
  
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
  const setEvents = (val) => {
    setEventsState(val);
    saveEvents(val);
  };
  const setPhotos = (val) => {
    setPhotosState(val);
    savePhotos(val);
  };
  const setAboutConfig = (val) => {
    setAboutConfigState(val);
    saveAboutConfig(val);
  };
  const setContactConfig = (val) => {
    setContactConfigState(val);
    saveContactConfig(val);
  };

  // Merge published cosplayers (admin-approved) so they appear on every device
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [publishedCos, publishedComm] = await Promise.all([
          getPublicCosplayers(),
          getPublicCommunities(),
        ]);
        if (!isMounted) return;
        if (publishedCos.length > 0) {
          setCosplayersState(prev => {
            const merged = mergePublishedCosplayers(prev, publishedCos);
            if (merged.length !== prev.length) {
              saveCosplayers(merged);
              return merged;
            }
            return prev;
          });
        }
        if (publishedComm.length > 0) {
          setCommunitiesState(prev => {
            const merged = mergePublishedCommunities(prev, publishedComm);
            if (merged.length !== prev.length) {
              saveCommunities(merged);
              return merged;
            }
            return prev;
          });
        }
      } catch {
        // Offline / sin backend: se mantienen las listas locales
      }
    })();
    return () => { isMounted = false; };
  }, []);

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

  // Synchronize document.title + meta/OG dinámico para SEO y social sharing
  useEffect(() => {
    const setMeta = (selector, attr, value) => {
      if (!value) return;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          el.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
        } else {
          el.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    const setJsonLd = (id, data) => {
      if (!data) {
        document.getElementById(id)?.remove();
        return;
      }
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    };

    const baseUrl = window.location.origin;
    let title = 'Otakonce 2026';
    let desc = 'Ven a Otakonce 2026, el mayor punto de encuentro en el sur de Chile para anime, cosplay, videojuegos y comunidades del Biobío.';
    let url = `${baseUrl}/`;
    let image = `${baseUrl}/assets/hero_banner.webp`;
    let jsonLd = null;

    if (activeTab === 'news-detail' && selectedArticle) {
      title = `${selectedArticle.title} | Otakonce 2026`;
      desc = selectedArticle.summary || desc;
      url = `${baseUrl}/#noticia/${slugify(selectedArticle.title)}`;
      image = selectedArticle.image?.startsWith('http') ? selectedArticle.image : `${baseUrl}${selectedArticle.image || '/assets/hero_banner.webp'}`;
      jsonLd = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: selectedArticle.title, description: desc, image: [image], datePublished: selectedArticle.date || '2026-01-01', author: { '@type': 'Organization', name: 'Otakonce Staff' } };
    } else if (activeTab === 'guest-detail' && selectedGuest) {
      title = `${selectedGuest.name} (${selectedGuest.character}) | Invitados Otakonce 2026`;
      desc = selectedGuest.bio?.slice(0, 160) || `Conoce a ${selectedGuest.name} cosplayando ${selectedGuest.character} en Otakonce 2026.`;
      url = `${baseUrl}/#invitado/${slugify(selectedGuest.name)}`;
      image = selectedGuest.image?.startsWith('http') ? selectedGuest.image : `${baseUrl}${selectedGuest.image || '/assets/hero_banner.webp'}`;
      jsonLd = { '@context': 'https://schema.org', '@type': 'Person', name: selectedGuest.name, description: desc, image };
    } else {
      const titles = {
        home: 'Otakonce 2026 | El Evento de Anime y Cultura Geek de Concepción',
        about: '¿Qué es Otakonce? | Otakonce 2026',
        events: 'Próximos Eventos | Otakonce 2026',
        'past-events': 'Todos Nuestros Eventos | Otakonce 2026',
        gallery: 'Galería de Fotos | Otakonce 2026',
        contact: 'Contáctanos | Otakonce 2026',
        news: 'Noticias y Comunicados | Otakonce 2026',
        invitados: 'Invitados Especiales | Otakonce 2026',
        cosplay: 'Pasarela Cosplay & Comunidad | Otakonce 2026',
        communities: 'Comunidades y Agrupaciones | Otakonce 2026',
        schedule: 'Cronograma de Actividades | Otakonce 2026',
        admin: 'Acceso Administrativo | Otakonce Staff'
      };
      title = titles[activeTab] || 'Otakonce 2026';
      const hashMap = {
        about: '#about',
        events: '#events',
        'past-events': '#past-events',
        gallery: '#gallery',
        contact: '#contact',
        news: '#news',
        invitados: '#invitados',
        cosplay: '#cosplay',
        communities: '#communities',
        schedule: '#schedule'
      };
      if (hashMap[activeTab]) url = `${baseUrl}/${hashMap[activeTab]}`;
    }

    document.title = title;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    setMeta('meta[name="twitter:image"]', 'content', image);
    setJsonLd('seo-dynamic-jsonld', jsonLd);

    if (activeTab === 'home') {
      if (window.location.hash && window.location.hash !== '#home' && !window.location.hash.startsWith('#cosplay/')) {
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
      } else if (hash === '#cosplay') {
        setActiveTab('cosplay');
      } else if (hash.startsWith('#cosplay/')) {
        // Only switch to cosplay tab if not already on home
        setActiveTab(prev => (prev === 'home' ? 'home' : 'cosplay'));
      } else if (['#news', '#communities', '#schedule', '#about', '#events', '#past-events', '#gallery', '#contact'].includes(hash)) {
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
        paddingTop: isAnnouncementVisible ? '44px' : '0px',
        transition: 'padding var(--transition-smooth)',
        '--announcement-height': isAnnouncementVisible ? '44px' : '0px'
      }}
    >
      {/* Visual Festive Theme Overlay (Halloween bats/webs, Christmas snowfall/lights, Teletón heart, Fiestas Patrias) */}
      <SeasonalOverlay theme={activeTab === 'admin' ? 'normal' : (eventConfig.themeMode || 'normal')} />

      {/* Top Floating Announcement Bar */}
      {isAnnouncementVisible && (
        <FloatingBanner config={floatingBanner} onNavigate={handleNavigate} onDismiss={() => setBannerDismissed(true)} />
      )}
      
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} topOffset={isAnnouncementVisible ? '44px' : '0px'} />

      {/* Main Content Area */}
      <main id="main-content" style={{ flex: 1 }}>
        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === 'home' && (
            <>
              {/* 1. Header / Banners Hero */}
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

                {/* 3. Galería de Fotos (Preview) */}
                <PhotoGallery photos={photos} mode="preview" onNavigate={handleNavigate} />

                {/* 4. Noticias y Anuncios (Preview 3) */}
                <NewsSection newsList={newsList.slice(0, 3)} onSelectArticle={handleSelectArticle} isHomePreview={true} />
                <div style={{ textAlign: 'center', marginTop: '28px', marginBottom: '40px' }}>
                  <button className="btn btn-secondary" onClick={() => handleNavigate('news')}>
                    Ver todas las noticias &rarr;
                  </button>
                </div>

                {/* 5. Galería Cosplay */}
                <CosplayerGallery cosplayers={cosplayers.filter(c => c.type !== 'guest')} onNavigate={handleNavigate} activeTab={activeTab} />
                
                {/* 6. Comunidades Locales */}
                <CommunityList communities={communities.slice(0, 3)} />
                <div style={{ textAlign: 'center', marginTop: '28px', marginBottom: '40px' }}>
                  <button className="btn btn-secondary" onClick={() => handleNavigate('communities')}>
                    Ver todas las comunidades &rarr;
                  </button>
                </div>

                {/* 7. Todos Nuestros Eventos (Preview) */}
                <EventsShowcase events={events} mode="preview" onNavigate={handleNavigate} />
              </div>
            </>
          )}

          {/* Full Section Tabs */}
          {activeTab === 'about' && (
            <AboutSection config={eventConfig} aboutConfig={aboutConfig} />
          )}

          {activeTab === 'events' && (
            <>
              <UpcomingEventSection config={eventConfig} />
              <ScheduleTimeline schedule={schedule} />
            </>
          )}

          {activeTab === 'past-events' && (
            <EventsShowcase events={events} mode="grid" onNavigate={handleNavigate} />
          )}

          {activeTab === 'gallery' && (
            <PhotoGallery photos={photos} mode="full" onNavigate={handleNavigate} />
          )}

          {activeTab === 'contact' && (
            <ContactSection contactConfig={contactConfig} />
          )}

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
            <CosplayerGallery cosplayers={cosplayers.filter(c => c.type !== 'guest')} onNavigate={handleNavigate} activeTab={activeTab} />
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
              events={events}
              setEvents={setEvents}
              photos={photos}
              setPhotos={setPhotos}
              aboutConfig={aboutConfig}
              setAboutConfig={setAboutConfig}
              contactConfig={contactConfig}
              setContactConfig={setContactConfig}
            />
          )}
        </Suspense>
      </main>

      {/* Footer Branding & Links */}
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} contactConfig={contactConfig} />
    </div>
  );
}

export default App;
