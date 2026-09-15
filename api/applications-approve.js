import crypto from 'node:crypto';
import { isAuthenticated } from './_lib/auth.js';
import { readJson, send, isSafeHttpUrl } from './_lib/validate.js';
import { getApp, removeApp, addPublished, listApps } from './_lib/store.js';

/**
 * POST admin { id }: aprueba una postulación y la publica en la galería
 * con los datos entregados por el cosplayer. Operación del servidor =>
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

  const app = await getApp(id);
  if (!app) return send(res, 404, { error: 'Postulación no encontrada.' });

  // Foto única y segura: solo https o vacía (las data: se resolvieron a Cloudinary en el envío)
  const image = typeof app.photo === 'string' && isSafeHttpUrl(app.photo) ? app.photo : '';

  const entry = {
    id: `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: String(app.name || '').slice(0, 80),
    character: String(app.character || '').slice(0, 120),
    city: String(app.city || 'Concepción').slice(0, 60),
    image,
    instagram: typeof app.instagram === 'string' && isSafeHttpUrl(app.instagram) ? app.instagram : '',
    bio: String(app.bio || '').slice(0, 280),
    role: 'Pasarela Individual',
    type: 'community',
    featured: false,
  };

  const created = await addPublished(entry);
  await removeApp(id);
  return send(res, 200, {
    ok: true,
    cosplayer: created?.id ? created : entry,
    applications: await listApps(),
  });
}
