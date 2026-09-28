import { useEffect, useRef } from 'react';

// Acceso de staff — Otakonce
// ─────────────────────────────────────────────────────────────
// Sin atajos de teclado con modificadores (nada de Ctrl/Alt/Fn),
// sin hashes públicos en la URL y sin literales reveladores.
// Dos vías, ambas abren el login EN MEMORIA (sin cambiar el hash):
//   1) Taps: 10 toques en el encabezado de Contáctanos (<5s).
//   2) Palabra tipeada fuera de inputs, verificada por SHA-256.
// La palabra NUNCA se escribe en este archivo: genera su hash con
//   npm run gen:unlock -- "tu-palabra-secreta"
// y pégalo en UNLOCK_WORD_HASH. Vacío = vía palabra desactivada.
// La puerta real sigue siendo el password server-side (scrypt).

const UNLOCK_WORD_HASH = '';

const TAP_WINDOW_MS = 5000;
const TAPS_NEEDED = 10;
const HOTSPOT_ID = 'contacto';
const WORD_BUFFER_MAX = 32;
const WORD_IDLE_RESET_MS = 3000;

async function sha256Hex(str) {
  try {
    const c = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
    if (!c?.subtle) return '';
    const digest = await c.subtle.digest('SHA-256', new TextEncoder().encode(String(str)));
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '';
  }
}

function timingSafeEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (!sa || !sb || sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return diff === 0;
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = (el.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

export function useStealthAdmin(onUnlock) {
  const tapsRef = useRef({});
  const wordBufRef = useRef('');
  const wordTimerRef = useRef(null);
  const unlockRef = useRef(onUnlock);
  unlockRef.current = onUnlock;

  useEffect(() => {
    const fire = () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
      } catch { /* noop */ }
      unlockRef.current?.();
    };

    const onClick = (e) => {
      const t = e.target?.closest?.('[data-admin-hotspot]');
      if (!t || t.getAttribute('data-admin-hotspot') !== HOTSPOT_ID) return;
      const now = Date.now();
      const prev = tapsRef.current;
      const count = prev && now - prev.firstAt < TAP_WINDOW_MS ? prev.count + 1 : 1;
      tapsRef.current = { count, firstAt: prev && now - prev.firstAt < TAP_WINDOW_MS ? prev.firstAt : now };
      if (count >= TAPS_NEEDED) {
        tapsRef.current = { count: 0, firstAt: 0 };
        fire();
      }
    };

    const onKeyDown = async (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key.length !== 1) return;
      const ch = e.key.toLowerCase();
      if (!/[a-z0-9]/.test(ch)) return;
      wordBufRef.current = (wordBufRef.current + ch).slice(-WORD_BUFFER_MAX);
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      wordTimerRef.current = setTimeout(() => { wordBufRef.current = ''; }, WORD_IDLE_RESET_MS);
      if (UNLOCK_WORD_HASH && wordBufRef.current.length >= 4) {
        const h = await sha256Hex(wordBufRef.current);
        if (h && timingSafeEqual(h, UNLOCK_WORD_HASH.toLowerCase())) {
          wordBufRef.current = '';
          fire();
        }
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    };
  }, []);
}
