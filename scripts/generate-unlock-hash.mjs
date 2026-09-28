/**
 * Genera el hash SHA-256 de la palabra de desbloqueo del panel staff.
 * Uso: npm run gen:unlock -- "tu-palabra-secreta"
 * Pega la salida en UNLOCK_WORD_HASH (src/hooks/useStealthAdmin.js).
 * La palabra solo vive en tu cabeza: nunca la escribas en el repo.
 */
import crypto from 'node:crypto';

const word = process.argv[2];
if (!word) {
  console.error('Uso: node scripts/generate-unlock-hash.mjs "tu-palabra-secreta"');
  process.exit(1);
}
if (word.length < 4) {
  console.error('La palabra debe tener mínimo 4 caracteres (solo letras/números).');
  process.exit(1);
}
console.log(crypto.createHash('sha256').update(word.toLowerCase(), 'utf8').digest('hex'));
