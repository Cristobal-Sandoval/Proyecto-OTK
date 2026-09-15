/**
 * Media centralizado: única puerta para imágenes locales vs Cloudinary.
 * Uso: resolveImage(url, { w: 800 }) en <img src>, nunca background-image para contenido.
 */
import { getOptimizedCloudinaryUrl } from './cloudinary';

export const isCloudinaryUrl = (url) =>
  typeof url === 'string' && url.includes('res.cloudinary.com');

export const resolveImage = (url, { w = null, q = 'auto', f = 'auto' } = {}) => {
  if (!url || typeof url !== 'string') return '';
  // Bloquea javascript:/data: gigantes salvo data:image pequeña ya guardada (migración)
  const t = url.trim();
  if (/^(javascript|vbscript):/i.test(t)) return '';
  if (isCloudinaryUrl(t)) return getOptimizedCloudinaryUrl(t, { width: w, quality: q, format: f });
  return t;
};

export const heroSrc = (url) => resolveImage(url, { w: 1600 });
export const cardSrc = (url) => resolveImage(url, { w: 800 });
export const thumbSrc = (url) => resolveImage(url, { w: 400 });

export const srcSetFor = (url, widths = [400, 800, 1200]) => {
  if (!isCloudinaryUrl(url)) return undefined;
  return widths.map((w) => `${resolveImage(url, { w })} ${w}w`).join(', ');
};

/**
 * Convierte un data:URL (FileReader) a File para subirlo a Cloudinary.
 */
export const dataUrlToFile = (dataUrl, filename = 'cosplay.jpg') => {
  const [meta, base64] = dataUrl.split(',');
  const mime = (meta.match(/data:(.*?);/) || [])[1] || 'image/jpeg';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
};
