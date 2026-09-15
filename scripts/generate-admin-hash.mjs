/**
 * Genera ADMIN_PASSWORD_HASH (scrypt) para el backend.
 * Uso: npm run gen:hash -- "tu-clave-larga"
 * Copia la salida a ADMIN_PASSWORD_HASH en Vercel / .env.local (server-only).
 */
import crypto from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/generate-admin-hash.mjs "tu-clave-larga"');
  process.exit(1);
}
if (password.length < 8) {
  console.error('La clave debe tener mínimo 8 caracteres.');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password.slice(0, 200), salt, 64);
console.log(`scrypt$${salt.toString('hex')}$${hash.toString('hex')}`);
