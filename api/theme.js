import { isAuthenticated } from './_lib/auth.js';
import { validateTheme, readJson, send } from './_lib/validate.js';
import { getTheme, setTheme } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return send(res, 200, await getTheme());
  }
  if (req.method === 'PUT') {
    if (!isAuthenticated(req)) return send(res, 401, { error: 'No autenticado.' });
    const body = await readJson(req);
    if (!body) return send(res, 400, { error: 'Solicitud inválida.' });
    const v = validateTheme(body);
    if (v.error) return send(res, 400, { error: v.error });
    return send(res, 200, await setTheme(v.themeMode));
  }
  res.setHeader('Allow', 'GET, PUT');
  return send(res, 405, { error: 'Método no permitido.' });
}
