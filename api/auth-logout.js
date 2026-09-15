import { clearSessionCookie } from './_lib/auth.js';
import { send } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Método no permitido.' });
  }
  clearSessionCookie(res);
  return send(res, 200, { ok: true });
}
