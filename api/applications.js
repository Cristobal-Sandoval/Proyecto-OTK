import crypto from 'node:crypto';
import { isAuthenticated, rateLimit, clientIp } from './_lib/auth.js';
import { validateApplication, readJson, send } from './_lib/validate.js';
import { listApps, addApp, removeApp } from './_lib/store.js';

export default async function handler(req, res) {
  // GET = solo admin (la PII como `contact` jamás queda expuesta al público)
  if (req.method === 'GET') {
    if (!isAuthenticated(req)) return send(res, 401, { error: 'No autenticado.' });
    return send(res, 200, { applications: await listApps() });
  }

  // POST = inscripción pública con validación + rate-limit
  if (req.method === 'POST') {
    const rl = rateLimit(`apply:${clientIp(req)}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      res.setHeader('Retry-After', String(rl.retryAfter || 60));
      return send(res, 429, { error: 'Límite de postulaciones alcanzado. Intenta más tarde.' });
    }
    const body = await readJson(req);
    if (!body) return send(res, 400, { error: 'Solicitud inválida.' });
    const v = validateApplication(body);
    if (v.error) return send(res, 400, { error: v.error });
    const app = {
      id: `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      ...v.app,
    };
    const created = await addApp(app);
    // Devuelve sin eco innecesario; el panel admin (autenticado) lista el resto.
    return send(res, 201, { ok: true, id: created.id || app.id });
  }

  // DELETE ?id=xxx = solo admin
  if (req.method === 'DELETE') {
    if (!isAuthenticated(req)) return send(res, 401, { error: 'No autenticado.' });
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id');
    if (!id) return send(res, 400, { error: 'Falta id.' });
    const removed = await removeApp(id);
    if (!removed) return send(res, 404, { error: 'No encontrada.' });
    return send(res, 200, { ok: true, applications: await listApps() });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return send(res, 405, { error: 'Método no permitido.' });
}
