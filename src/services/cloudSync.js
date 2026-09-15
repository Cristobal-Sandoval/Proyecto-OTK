// Sincronización contra backend propio (/api/*) con sesión httpOnly.
// - GET /api/theme es público ( visitantes ven el tema sin exponer nada ).
// - PUT /api/theme requiere sesión admin.
// - POST /api/applications es público con validación + rate-limit server-side.
// - GET/DELETE /api/applications requieren sesión admin (la PII `contact` jamás es pública).
// Se mantiene fallback a localStorage solo para modo offline/dev sin backend.

const LOCAL_KEYS = {
  THEME: 'otakonce_cloud_theme',
};

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  return res;
}

export const getGlobalTheme = async () => {
  try {
    const res = await apiFetch('/api/theme', { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
    if (res.ok) {
      const json = await res.json();
      if (json && typeof json.themeMode === 'string') {
        localStorage.setItem(LOCAL_KEYS.THEME, json.themeMode);
        return json.themeMode;
      }
    }
  } catch (err) {
    console.warn('Could not fetch theme from backend, falling back to local storage:', err);
  }
  return localStorage.getItem(LOCAL_KEYS.THEME) || 'normal';
};

export const saveGlobalTheme = async (themeMode) => {
  localStorage.setItem(LOCAL_KEYS.THEME, themeMode);
  try {
    const res = await apiFetch('/api/theme', {
      method: 'PUT',
      body: JSON.stringify({ themeMode }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save theme to backend:', err);
    return false;
  }
};

/**
 * Solo admin autenticado puede listar. Visitantes reciben [] sin exponer PII.
 */
export const getCosplayApplications = async () => {
  try {
    const res = await apiFetch('/api/applications', { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.applications)) return json.applications;
    }
    if (res.status === 401) return [];
  } catch (err) {
    console.warn('Could not fetch applications:', err);
  }
  return [];
};

/**
 * Inscripción pública. No guarda copia local con PII: el servidor valida y responde.
 * Lanza Error con el mensaje del servidor para mostrarlo en el formulario.
 */
export const submitCosplayApplication = async (application) => {
  let res;
  try {
    res = await apiFetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  } catch {
    throw new Error('Sin conexión con el servidor. Intenta nuevamente.');
  }
  if (!res.ok) {
    let msg = 'No se pudo enviar la postulación.';
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch { /* noop */ }
    if (res.status === 429) msg = 'Límite de postulaciones alcanzado. Intenta más tarde.';
    throw new Error(msg);
  }
  const json = await res.json().catch(() => ({}));
  return { id: json.id, status: 'pending', ...application };
};

/**
 * Solo admin. Retorna la lista actualizada.
 */
export const removeCosplayApplication = async (applicationId) => {
  try {
    const res = await apiFetch(`/api/applications?id=${encodeURIComponent(applicationId)}`, { method: 'DELETE' });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.applications)) return json.applications;
    }
    if (res.status === 401) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
  } catch (err) {
    console.warn('Could not remove application:', err);
    throw err;
  }
  return [];
};

/**
 * Galería publicada por el admin (incluye aprobados de la pasarela).
 * Pública y sin PII. Fallback [] si no hay backend.
 */
export const getPublicCosplayers = async () => {
  try {
    const res = await fetch('/api/cosplayers', { headers: { 'Cache-Control': 'no-cache' } });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.cosplayers)) return json.cosplayers;
    }
  } catch (err) {
    console.warn('Could not fetch published cosplayers:', err);
  }
  return [];
};

/**
 * Fusiona la lista local con la publicada en el servidor (dedupe por id).
 * Así un aprobado aparece en todos los dispositivos aunque el admin lo haya
 * aceptado desde otro navegador.
 */
export const mergePublishedCosplayers = (localList = [], published = []) => {
  if (!Array.isArray(published) || published.length === 0) return localList;
  const ids = new Set(localList.map((c) => String(c.id)));
  const missing = published.filter((c) => c && !ids.has(String(c.id)));
  if (missing.length === 0) return localList;
  return [...localList, ...missing];
};

/**
 * Aprueba en el servidor: publica con los datos entregados y saca de la bandeja.
 * Retorna { cosplayer, applications }.
 */
export const approveCosplayApplication = async (applicationId) => {
  let res;
  try {
    res = await apiFetch('/api/applications-approve', {
      method: 'POST',
      body: JSON.stringify({ id: applicationId }),
    });
  } catch {
    throw new Error('Sin conexión con el servidor.');
  }
  if (!res.ok) {
    let msg = 'No se pudo aprobar la postulación.';
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch { /* noop */ }
    if (res.status === 401) msg = 'Sesión expirada. Vuelve a iniciar sesión.';
    throw new Error(msg);
  }
  return res.json();
};

export const authMe = async () => {
  try {
    const res = await apiFetch('/api/auth-me', { method: 'GET' });
    if (res.ok) {
      const j = await res.json();
      return Boolean(j.authenticated);
    }
  } catch { /* sin backend (dev vite) => false */ }
  return false;
};

export const authLogin = async (password) => {
  const res = await apiFetch('/api/auth-login', { method: 'POST', body: JSON.stringify({ password }) });
  if (res.ok) return { ok: true };
  let msg = 'Contraseña incorrecta.';
  try {
    const j = await res.json();
    if (j?.error) msg = j.error;
  } catch { /* noop */ }
  const err = new Error(msg);
  err.status = res.status;
  throw err;
};

export const authLogout = async () => {
  try {
    await apiFetch('/api/auth-logout', { method: 'POST' });
  } catch { /* noop */ }
};

export const authChangePassword = async (currentPass, newPass) => {
  const res = await apiFetch('/api/auth-change-password', { method: 'POST', body: JSON.stringify({ currentPass, newPass }) });
  if (res.ok) return true;
  let msg = 'No se pudo cambiar la contraseña.';
  try {
    const j = await res.json();
    if (j?.error) msg = j.error;
  } catch { /* noop */ }
  throw new Error(msg);
};
