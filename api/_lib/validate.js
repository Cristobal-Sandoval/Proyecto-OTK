/**
 * Validación autoritativa server-side (no confiar en el cliente).
 * Espejo de src/utils/sanitize.js para el backend.
 */
export const VALID_THEMES = ['normal', 'halloween', 'navidad', 'teleton', 'fiestas_patrias'];

const trim = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function isSafeHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const t = url.trim();
  if (!t) return false;
  if (t.startsWith('/')) return !t.toLowerCase().startsWith('//');
  try {
    const u = new URL(t);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isValidEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim().slice(0, 160));
}

export function isValidPhone(v) {
  if (typeof v !== 'string') return false;
  const d = v.replace(/\D/g, '');
  return d.length >= 8 && d.length <= 12;
}

export const isValidContact = (v) => isValidEmail(v) || isValidPhone(v);

export function validateTheme(body) {
  const themeMode = trim(body?.themeMode, 40);
  if (!VALID_THEMES.includes(themeMode)) return { error: 'Tema inválido.' };
  return { themeMode };
}

export function validateApplication(body) {
  const name = trim(body?.name, 80);
  const character = trim(body?.character, 120);
  const city = trim(body?.city, 60) || 'Concepción';
  const contact = trim(body?.contact, 160);
  let instagram = trim(body?.instagram, 200);
  const bio = trim(body?.bio, 280); // Presentación corta: máx. 280 caracteres
  // Foto única: una sola URL https o un solo data:image (nunca arreglos)
  const photo = typeof body?.photo === 'string' ? body.photo : '';

  if (!name || !character || !contact) return { error: 'Nombre, personaje y email son obligatorios.' };
  if (!isValidEmail(contact)) return { error: 'Ingresa un email de contacto válido.' };
  if (instagram && !isSafeHttpUrl(instagram)) {
    if (/^@?[A-Za-z0-9._]{1,60}$/.test(instagram)) {
      instagram = `https://instagram.com/${instagram.replace(/^@/, '')}`;
    } else {
      return { error: 'Instagram inválido.' };
    }
  }
  if (photo) {
    const isHttps = isSafeHttpUrl(photo);
    const isDataImg = photo.startsWith('data:image/jpeg;base64,') || photo.startsWith('data:image/png;base64,') || photo.startsWith('data:image/webp;base64,') || photo.startsWith('data:image/gif;base64,');
    if (!isHttps && !isDataImg) return { error: 'Foto inválida.' };
    // Límite estricto server-side: data: URL max ~700KB (rechaza Base64 gigantes que antes iban a localStorage/API pública)
    if (!isHttps && photo.length > 950_000) return { error: 'Foto muy pesada: usa una imagen menor a 700KB o una URL https.' };
    if (isHttps && photo.length > 500) return { error: 'URL de foto muy larga.' };
  }
  return { app: { name, character, city, contact, instagram, bio, photo } };
}

export function readJson(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      // Corta cuerpos abusivos (>1MB)
      if (raw.length > 1_000_000) {
        try { req.destroy(); } catch { /* noop */ }
        resolve(null);
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

export function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
