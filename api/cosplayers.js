import { listPublished } from './_lib/store.js';
import { send } from './_lib/validate.js';

/**
 * GET público: cosplayers publicados por el admin (incluye aprobados de la pasarela).
 * Sin PII: las filas publicadas no contienen `contact`.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'Método no permitido.' });
  }
  try {
    const published = await listPublished();
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return send(res, 200, { cosplayers: published });
  } catch {
    return send(res, 200, { cosplayers: [] });
  }
}
