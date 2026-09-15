import { getStoredHash, verifyPassword, signSession, setSessionCookie, rateLimit, clientIp, getSessionSecret } from './_lib/auth.js';
import { readJson, send } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Método no permitido.' });
  }
  if (!getStoredHash() || !getSessionSecret()) {
    return send(res, 500, { error: 'Panel no configurado en el servidor (faltan secretos).' });
  }
  const rl = rateLimit(`login:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter || 60));
    return send(res, 429, { error: 'Demasiados intentos. Reintenta en unos minutos.' });
  }
  const body = await readJson(req);
  if (!body || typeof body.password !== 'string') return send(res, 400, { error: 'Solicitud inválida.' });

  const ok = verifyPassword(body.password, getStoredHash());
  if (!ok) return send(res, 401, { error: 'Contraseña incorrecta.', remaining: rl.remaining });

  const token = signSession();
  if (!token) return send(res, 500, { error: 'No se pudo crear la sesión.' });
  setSessionCookie(res, token);
  return send(res, 200, { ok: true });
}
