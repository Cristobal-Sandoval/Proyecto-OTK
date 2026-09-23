/**
 * Auth server-side: scrypt + sesión firmada HMAC en cookie httpOnly.
 * Secretos SOLO en variables de entorno (sin prefijo VITE_ => nunca al bundle):
 * - ADMIN_PASSWORD_HASH: formato `scrypt$<saltHex>$<hashHex>` (generar con scripts/generate-admin-hash.mjs)
 * - ADMIN_SESSION_SECRET: string aleatorio largo (>=32 chars)
 */
import crypto from 'node:crypto';

const SESSION_COOKIE = 'otakonce_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function b64urlEncode(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

export function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

export function getStoredHash() {
  // Permite override en memoria tras cambio de clave (efímero; para persistir actualiza el env).
  if (globalThis.__OTK_ADMIN_HASH_OVERRIDE__) return globalThis.__OTK_ADMIN_HASH_OVERRIDE__;
  // Preferencia: hash scrypt. Alternativa para entornos de prueba: clave en texto plano
  // (server-only, nunca viaja al navegador; la comparación es en el servidor).
  return process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || '';
}

export function setStoredHashOverride(hash) {
  globalThis.__OTK_ADMIN_HASH_OVERRIDE__ = hash;
}

export function parseStoredHash(stored) {
  // scrypt$saltHex$hashHex
  if (!stored || typeof stored !== 'string') return null;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return null;
  try {
    return { salt: Buffer.from(parts[1], 'hex'), hash: Buffer.from(parts[2], 'hex') };
  } catch {
    return null;
  }
}

export function verifyPassword(password, stored) {
  if (typeof password !== 'string' || !password || !stored) return false;
  const parsed = parseStoredHash(stored);
  if (parsed) {
    try {
      const derived = crypto.scryptSync(password.slice(0, 200), parsed.salt, parsed.hash.length);
      return derived.length === parsed.hash.length && crypto.timingSafeEqual(derived, parsed.hash);
    } catch {
      return false;
    }
  }
  // Fallback: secreto en texto plano (solo para entornos de prueba).
  // Se compara con timingSafeEqual sobre HMAC para no filtrar por longitud.
  try {
    const secret = getSessionSecret() || 'otakonce-compare-fallback';
    const a = crypto.createHmac('sha256', secret).update(password.slice(0, 200)).digest();
    const b = crypto.createHmac('sha256', secret).update(stored.slice(0, 200)).digest();
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function hashPasswordScrypt(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password.slice(0, 200), salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function signSession() {
  const secret = getSessionSecret();
  if (!secret) return null;
  const payload = JSON.stringify({ v: 1, iat: Date.now(), exp: Date.now() + SESSION_TTL_MS });
  const p = b64urlEncode(payload);
  const sig = b64urlEncode(crypto.createHmac('sha256', secret).update(p).digest());
  return `${p}.${sig}`;
}

export function verifySessionToken(token) {
  try {
    const secret = getSessionSecret();
    if (!secret || !token || typeof token !== 'string') return false;
    const [p, sig] = token.split('.');
    if (!p || !sig) return false;
    const expected = b64urlEncode(crypto.createHmac('sha256', secret).update(p).digest());
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const payload = JSON.parse(b64urlDecode(p).toString('utf8'));
    return payload && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getSessionToken(req) {
  const header = req.headers?.cookie || '';
  const m = header.match(/(?:^|;\s*)otakonce_session=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

export function isAuthenticated(req) {
  return verifySessionToken(getSessionToken(req));
}

export function setSessionCookie(res, token) {
  const secure = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${secure ? '; Secure' : ''}`
  );
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

// Rate-limit en memoria por IP (suficiente como defensa básica; para multi-instancia usa KV).
const buckets = globalThis.__OTK_RATELIMIT__ || (globalThis.__OTK_RATELIMIT__ = new Map());

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function clientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}
