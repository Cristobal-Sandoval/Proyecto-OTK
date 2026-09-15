/**
 * Cliente Supabase vía REST (sin dependencias: solo fetch nativo de Node 18+).
 * Usa la SERVICE ROLE KEY — SOLO server-side (nunca exponer con prefijo VITE_).
 * Tablas esperadas (ver supabase/schema.sql):
 * - app_state (key TEXT PK, value JSONB)
 * - cosplay_applications (postulaciones con PII, sin acceso público)
 * - cosplayers (galería publicada, lectura pública vía RLS)
 */

const URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseConfigured() {
  return Boolean(URL && KEY);
}

async function sb(path, { method = 'GET', body = null, query = '', prefer = null } = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}${query}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 200)}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// --- Estado global (tema) ---
export async function sbGetState(key) {
  const rows = await sb('app_state', { query: `?key=eq.${encodeURIComponent(key)}&select=value` });
  return Array.isArray(rows) && rows[0] ? rows[0].value : null;
}

export async function sbSetState(key, value) {
  await sb('app_state', {
    method: 'POST',
    body: { key, value },
    prefer: 'resolution=merge-duplicates',
  });
}

// --- Postulaciones ---
export async function sbListApplications() {
  return sb('cosplay_applications', { query: '?select=*&order=created_at.desc&limit=500' });
}

export async function sbGetApplication(id) {
  const rows = await sb('cosplay_applications', { query: `?id=eq.${encodeURIComponent(id)}&select=*&limit=1` });
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function sbInsertApplication(app) {
  const rows = await sb('cosplay_applications', {
    method: 'POST',
    body: app,
    prefer: 'return=representation',
  });
  return Array.isArray(rows) && rows[0] ? rows[0] : app;
}

export async function sbDeleteApplication(id) {
  await sb('cosplay_applications', { method: 'DELETE', query: `?id=eq.${encodeURIComponent(id)}` });
}

// --- Galería publicada ---
export async function sbListPublished() {
  return sb('cosplayers', { query: '?select=*&order=created_at.desc&limit=500' });
}

export async function sbInsertPublished(entry) {
  const rows = await sb('cosplayers', {
    method: 'POST',
    body: entry,
    prefer: 'return=representation',
  });
  return Array.isArray(rows) && rows[0] ? rows[0] : entry;
}
