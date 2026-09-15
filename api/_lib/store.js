/**
 * Almacén server-side con Supabase como fuente de verdad y memoria como fallback.
 * - Tema global y postulaciones: solo visibles para admin (salvo GET theme público).
 * - Galería publicada (`published`): lectura pública, alimenta la página en todos los dispositivos.
 * Sin SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY todo funciona en memoria (efímero:
 * se pierde con redeploys; para producción configura Supabase).
 */
import {
  isSupabaseConfigured,
  sbGetState, sbSetState,
  sbListApplications, sbGetApplication, sbInsertApplication, sbDeleteApplication,
  sbListPublished, sbInsertPublished,
} from './supabase.js';

export const VALID_THEMES = ['normal', 'halloween', 'navidad', 'teleton', 'fiestas_patrias'];

const g = globalThis;
if (!g.__OTK_STORE__) {
  g.__OTK_STORE__ = { themeMode: 'normal', themeUpdatedAt: Date.now(), applications: [], published: [] };
}
const mem = () => g.__OTK_STORE__;

// --- Tema ---
export async function getTheme() {
  if (isSupabaseConfigured()) {
    try {
      const v = await sbGetState('global');
      if (v && typeof v.themeMode === 'string' && VALID_THEMES.includes(v.themeMode)) {
        return { themeMode: v.themeMode, updatedAt: v.updatedAt || Date.now() };
      }
    } catch (err) {
      console.warn('Supabase theme fallback to memory:', err?.message);
    }
  }
  return { themeMode: mem().themeMode || 'normal', updatedAt: mem().themeUpdatedAt || Date.now() };
}

export async function setTheme(themeMode) {
  mem().themeMode = themeMode;
  mem().themeUpdatedAt = Date.now();
  if (isSupabaseConfigured()) {
    try {
      await sbSetState('global', { themeMode, updatedAt: Date.now() });
    } catch (err) {
      console.warn('Supabase setTheme failed, kept in memory:', err?.message);
    }
  }
  return getTheme();
}

// --- Postulaciones (privadas) ---
export async function listApps() {
  if (isSupabaseConfigured()) {
    try {
      return await sbListApplications();
    } catch (err) {
      console.warn('Supabase listApps fallback to memory:', err?.message);
    }
  }
  return [...mem().applications];
}

export async function getApp(id) {
  if (isSupabaseConfigured()) {
    try {
      return await sbGetApplication(id);
    } catch (err) {
      console.warn('Supabase getApp fallback to memory:', err?.message);
    }
  }
  return mem().applications.find((a) => String(a.id) === String(id)) || null;
}

export async function addApp(app) {
  mem().applications = [app, ...mem().applications].slice(0, 500);
  if (isSupabaseConfigured()) {
    try {
      return await sbInsertApplication(app);
    } catch (err) {
      console.warn('Supabase addApp failed, kept in memory:', err?.message);
    }
  }
  return app;
}

export async function removeApp(id) {
  const before = mem().applications.length;
  mem().applications = mem().applications.filter((a) => String(a.id) !== String(id));
  if (isSupabaseConfigured()) {
    try {
      await sbDeleteApplication(id);
    } catch (err) {
      console.warn('Supabase removeApp failed:', err?.message);
    }
  }
  return mem().applications.length !== before;
}

// --- Galería publicada (pública) ---
export async function listPublished() {
  if (isSupabaseConfigured()) {
    try {
      return await sbListPublished();
    } catch (err) {
      console.warn('Supabase listPublished fallback to memory:', err?.message);
    }
  }
  return [...mem().published];
}

export async function addPublished(entry) {
  mem().published = [entry, ...mem().published].slice(0, 500);
  if (isSupabaseConfigured()) {
    try {
      return await sbInsertPublished(entry);
    } catch (err) {
      console.warn('Supabase addPublished failed, kept in memory:', err?.message);
    }
  }
  return entry;
}
