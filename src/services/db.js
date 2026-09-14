import {
  defaultEventConfig,
  defaultBanners,
  defaultFloatingBanner,
  defaultNews,
  defaultCosplayers,
  defaultCommunities,
  defaultSchedule
} from '../data/defaults';

const KEYS = {
  EVENT_CONFIG: 'otakonce_event_config',
  BANNERS: 'otakonce_banners',
  FLOATING_BANNER: 'otakonce_floating_banner',
  NEWS: 'otakonce_news',
  COSPLAYERS: 'otakonce_cosplayers',
  COMMUNITIES: 'otakonce_communities',
  SCHEDULE: 'otakonce_schedule'
};

let _initialized = false;

export const initializeDB = () => {
  if (_initialized) return;
  _initialized = true;

  const savedConfig = localStorage.getItem(KEYS.EVENT_CONFIG);
  if (!savedConfig || savedConfig.includes('.png')) {
    localStorage.setItem(KEYS.EVENT_CONFIG, JSON.stringify(defaultEventConfig));
  }
  if (!localStorage.getItem(KEYS.BANNERS)) {
    localStorage.setItem(KEYS.BANNERS, JSON.stringify(defaultBanners));
  } else {
    try {
      const currentBanners = JSON.parse(localStorage.getItem(KEYS.BANNERS));
      if (!Array.isArray(currentBanners) || currentBanners.length < 3 || currentBanners.some(b => b.image.includes('.png') || b.image.includes('.jpg') || b.alignmentX === undefined || b.titleColor === '#FFE200' || b.subtitleColor === '#FFE200')) {
        localStorage.setItem(KEYS.BANNERS, JSON.stringify(defaultBanners));
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!localStorage.getItem(KEYS.FLOATING_BANNER)) {
    localStorage.setItem(KEYS.FLOATING_BANNER, JSON.stringify(defaultFloatingBanner));
  }
  if (!localStorage.getItem(KEYS.NEWS)) {
    localStorage.setItem(KEYS.NEWS, JSON.stringify(defaultNews));
  }
  if (!localStorage.getItem(KEYS.COSPLAYERS)) {
    localStorage.setItem(KEYS.COSPLAYERS, JSON.stringify(defaultCosplayers));
  }
  if (!localStorage.getItem(KEYS.COMMUNITIES)) {
    localStorage.setItem(KEYS.COMMUNITIES, JSON.stringify(defaultCommunities));
  }
  if (!localStorage.getItem(KEYS.SCHEDULE)) {
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(defaultSchedule));
  }
};

// Config
export const getEventConfig = () => {
  initializeDB();
  try {
    const cfg = JSON.parse(localStorage.getItem(KEYS.EVENT_CONFIG));
    if (cfg && !cfg.themeMode) {
      cfg.themeMode = 'normal';
      localStorage.setItem(KEYS.EVENT_CONFIG, JSON.stringify(cfg));
    }
    return cfg || defaultEventConfig;
  } catch (e) {
    console.error(e);
    return defaultEventConfig;
  }
};

export const saveEventConfig = (config) => {
  localStorage.setItem(KEYS.EVENT_CONFIG, JSON.stringify(config));
  return config;
};

// Floating Banner
export const getFloatingBanner = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.FLOATING_BANNER));
};

export const saveFloatingBanner = (banner) => {
  localStorage.setItem(KEYS.FLOATING_BANNER, JSON.stringify(banner));
  return banner;
};

// News
export const getNews = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.NEWS));
};

export const saveNews = (news) => {
  localStorage.setItem(KEYS.NEWS, JSON.stringify(news));
  return news;
};

// Cosplayers
export const getCosplayers = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.COSPLAYERS));
};

export const saveCosplayers = (cosplayers) => {
  localStorage.setItem(KEYS.COSPLAYERS, JSON.stringify(cosplayers));
  return cosplayers;
};

// Communities
export const getCommunities = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.COMMUNITIES));
};

export const saveCommunities = (communities) => {
  localStorage.setItem(KEYS.COMMUNITIES, JSON.stringify(communities));
  return communities;
};

// Schedule
export const getSchedule = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.SCHEDULE));
};

export const saveSchedule = (schedule) => {
  localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
  return schedule;
};

// Banners
export const getBanners = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.BANNERS));
};

export const saveBanners = (banners) => {
  localStorage.setItem(KEYS.BANNERS, JSON.stringify(banners));
  return banners;
};
