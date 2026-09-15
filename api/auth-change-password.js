import { isAuthenticated, getStoredHash, verifyPassword, hashPasswordScrypt, setStoredHashOverride } from './_lib/auth.js';
import { readJson, send } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Método no permitido.' });
  }
  if (!isAuthenticated(req)) return send(res, 401, { error: 'No autenticado.' });
  const body = await readJson(req);
  if (!body || typeof body.currentPass !== 'string' || typeof body.newPass !== 'string') {
    return send(res, 400, { error: 'Solicitud inválida.' });
  }
  if (!verifyPassword(body.currentPass, getStoredHash())) {
    return send(res, 401, { error: 'La contraseña actual es incorrecta.' });
  }
  const np = body.newPass;
  if (np.length < 8 || !/[A-Za-z]/.test(np) || !/[0-9]/.test(np)) {
    return send(res, 400, { error: 'La nueva clave debe tener mínimo 8 caracteres, con letras y números.' });
  }
  const next = hashPasswordScrypt(np);
  setStoredHashOverride(next);
  // Nota: el override vive en memoria de la instancia. Para persistir entre deploys
  // actualiza ADMIN_PASSWORD_HASH en Vercel con el hash generado localmente.
  return send(res, 200, { ok: true, persistent: false });
}
