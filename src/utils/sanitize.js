/**
 * Sanitización y validación centralizada.
 * Evita javascript: URLs, data: gigantes y strings sin límite.
 */

const MAX_SHORT = 120;
const MAX_TEXT = 2000;
const MAX_BIO = 1000;

export const trimStr = (v, max = MAX_SHORT) => {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
};

export const isSafeHttpUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const t = url.trim();
  if (t === '' ) return false;
  // Permite rutas locales /assets/... y https/http. Bloquea javascript:, data:, blob:, vbscript:
  if (t.startsWith('/')) return !t.toLowerCase().startsWith('//');
  try {
    const u = new URL(t);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

export const safeUrlOr = (url, fallback = '') => {
  return isSafeHttpUrl(url) ? url.trim() : fallback;
};

export const isValidEmail = (v) => {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim().slice(0, 160));
};

export const isValidPhoneCL = (v) => {
  if (!v) return false;
  const digits = v.replace(/\D/g, '');
  // Acepta 8-12 dígitos (móvil CL 9 + email fallback lo cubre isValidEmail)
  return digits.length >= 8 && digits.length <= 12;
};

export const isValidContact = (v) => isValidEmail(v) || isValidPhoneCL(v);

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const validateImageFile = (file, maxMB = 10) => {
  if (!file || !(file instanceof File)) return 'No se proporcionó un archivo válido.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato no soportado. Usa JPG, PNG, WEBP o GIF.';
  }
  if (file.size > maxMB * 1024 * 1024) {
    return `La imagen excede el límite de ${maxMB}MB.`;
  }
  return null;
};

export const sanitizeNews = (f) => ({
  title: trimStr(f.title, 140),
  summary: trimStr(f.summary, 280),
  content: typeof f.content === 'string' ? f.content.trim().slice(0, 8000) : '',
  category: trimStr(f.category, 40) || 'Anuncio',
  date: trimStr(f.date, 40),
  image: safeUrlOr(f.image, ''),
  readTime: trimStr(f.readTime, 20),
});

export const sanitizeCosplayer = (f) => ({
  name: trimStr(f.name, 80),
  character: trimStr(f.character, 120),
  instagram: safeUrlOr(f.instagram, ''),
  tiktok: safeUrlOr(f.tiktok, ''),
  twitter: safeUrlOr(f.twitter, ''),
  image: safeUrlOr(f.image, ''),
  photos: Array.isArray(f.photos) ? f.photos.filter(isSafeHttpUrl).slice(0, 8) : [],
  bio: typeof f.bio === 'string' ? f.bio.trim().slice(0, MAX_BIO) : '',
  type: f.type === 'community' ? 'community' : 'guest',
  role: trimStr(f.role, 80),
  city: trimStr(f.city, 60),
});

export const sanitizeCommunity = (f) => ({
  name: trimStr(f.name, 80),
  type: trimStr(f.type, 60),
  description: typeof f.description === 'string' ? f.description.trim().slice(0, MAX_TEXT) : '',
  logo: safeUrlOr(f.logo, ''),
  instagram: safeUrlOr(f.instagram, ''),
});

export const sanitizeSchedule = (f) => ({
  time: trimStr(f.time, 10),
  title: trimStr(f.title, 140),
  stage: trimStr(f.stage, 80),
  description: typeof f.description === 'string' ? f.description.trim().slice(0, 500) : '',
});

export const sanitizeBanner = (f) => ({
  title: trimStr(f.title, 80),
  subtitle: trimStr(f.subtitle, 160),
  image: safeUrlOr(f.image, ''),
  titleColor: /^#[0-9a-fA-F]{6}$/.test(f.titleColor || '') ? f.titleColor : '#FFFFFF',
  subtitleColor: /^#[0-9a-fA-F]{6}$/.test(f.subtitleColor || '') ? f.subtitleColor : '#FFFFFF',
  badge: trimStr(f.badge, 30),
  alignmentX: ['left', 'center', 'right'].includes(f.alignmentX) ? f.alignmentX : 'left',
  badgeBgColor: /^#[0-9a-fA-F]{6}$/.test(f.badgeBgColor || '') ? f.badgeBgColor : '#FF3B6C',
  linkUrl: typeof f.linkUrl === 'string' && (f.linkUrl.startsWith('#') || isSafeHttpUrl(f.linkUrl)) ? f.linkUrl.slice(0, 200) : '#',
  linkLabel: trimStr(f.linkLabel, 40),
});
