import crypto from 'node:crypto';
import { isAuthenticated } from './_lib/auth.js';
import { readJson, send, isSafeHttpUrl } from './_lib/validate.js';
import { getCommunityApp, removeCommunityApp, addPublishedCommunity, listCommunityApps } from './_lib/store.js';

/**
 * POST admin { id }: aprueba la postulación de una comunidad y la publica
 * en la página con los datos entregados. Operación del servidor =>
 * visible en todos los dispositivos (no solo en el navegador del admin).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Método no permitido.' });
  }
  if (!isAuthenticated(req)) return send(res, 401, { error: 'No autenticado.' });

  const body = await readJson(req);
  const id = body?.id;
  if (!id) return send(res, 400, { error: 'Falta id.' });

  const app = await getCommunityApp(id);
  if (!app) return send(res, 404, { error: 'Postulación no encontrada.' });

  // Logo único y seguro: solo https o vacío
  const logo = typeof app.logo === 'string' && isSafeHttpUrl(app.logo) ? app.logo : '';

  const entry = {
    id: `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: String(app.name || '').slice(0, 80),
    type: String(app.type || 'Otro').slice(0, 60),
    description: String(app.description || '').slice(0, 400),
    logo,
    instagram: typeof app.instagram === 'string' && isSafeHttpUrl(app.instagram) ? app.instagram : '',
  };

  const created = await addPublishedCommunity(entry);
  await removeCommunityApp(id);
  return send(res, 200, {
    ok: true,
    community: created?.id ? created : entry,
    applications: await listCommunityApps(),
  });
}
