import { isAuthenticated } from './_lib/auth.js';
import { send } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'Método no permitido.' });
  }
  return send(res, 200, { authenticated: isAuthenticated(req) });
}
