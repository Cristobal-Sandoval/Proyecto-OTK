const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/User/.gemini/antigravity/brain/7b33883d-ccb3-4db4-97bd-2f9f618a4c6f/media__1783534839478.jpg';

async function vectorize() {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // 1. Full silhouette mask: any pixel that is black stroke, yellow letter, or pink text
  // 2. Yellow letters mask
  // 3. Pink Japanese text mask
  const silhouetteMask = Buffer.alloc(w * h);
  const yellowMask = Buffer.alloc(w * h);
  const pinkMask = Buffer.alloc(w * h);

  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    const x = i % w;
    const y = Math.floor(i / w);

    // Is it in the logo bounding area? (exclude background clouds in corners)
    const inLogoArea = (x > 60 && x < 965 && y > 45 && y < 575);

    const isBlack = inLogoArea && (r < 80 && g < 80 && b < 80);
    const isYellow = inLogoArea && (r > 185 && g > 155 && b < 90);
    const isPink = inLogoArea && (r > 185 && g < 120 && b > 65);

    if (isBlack || isYellow || isPink) {
      silhouetteMask[i] = 0; // Black for potrace
    } else {
      silhouetteMask[i] = 255;
    }

    if (isYellow) {
      yellowMask[i] = 0;
    } else {
      yellowMask[i] = 255;
    }

    if (isPink) {
      pinkMask[i] = 0;
    } else {
      pinkMask[i] = 255;
    }
  }

  const tracePromise = (buf, opt = {}) => new Promise((res, rej) => {
    potrace.trace(buf, { optTolerance: 0.25, threshold: 128, ...opt }, (err, svg) => {
      if (err) rej(err); else res(svg);
    });
  });

  const silhouettePng = await sharp(silhouetteMask, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
  const yellowPng = await sharp(yellowMask, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
  const pinkPng = await sharp(pinkMask, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();

  console.log('Tracing solid silhouette...');
  const silhouetteSvg = await tracePromise(silhouettePng, { turdSize: 30 });
  console.log('Tracing yellow letters...');
  const yellowSvg = await tracePromise(yellowPng, { turdSize: 20 });
  console.log('Tracing pink characters...');
  const pinkSvg = await tracePromise(pinkPng, { turdSize: 5 });

  const extractPaths = (svg) => {
    const matches = [...svg.matchAll(/<path\s+d="([^"]+)"/g)];
    return matches.map(m => m[1]).join(' ');
  };

  const silhouettePath = extractPaths(silhouetteSvg);
  const yellowPath = extractPaths(yellowSvg);
  const pinkPath = extractPaths(pinkSvg);

  // Standalone vector logo: letters on transparent background
  // Bounding box: x=65 y=45 width=895 height=525
  const standaloneSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="65 45 895 525" width="100%" height="100%">
  <g id="otakonce-vector-logo">
    <!-- Solid black continuous backing and outer border -->
    <path d="${silhouettePath}" fill="#0F172A" />
    <!-- Yellow core bubble letters -->
    <path d="${yellowPath}" fill="#FEDC00" />
    <!-- Pink Japanese text -->
    <path d="${pinkPath}" fill="#FD3484" />
  </g>
</svg>`;

  // Full badge with sky blue canvas and yellow organic clouds
  const fullBadgeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
  <defs>
    <radialGradient id="skyGrad" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#0095FF" />
      <stop offset="100%" stop-color="#0075E8" />
    </radialGradient>
    <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="22" />
    </filter>
  </defs>
  
  <!-- Electric Sky Blue Canvas -->
  <rect width="${w}" height="${h}" rx="32" fill="url(#skyGrad)" />
  
  <!-- Organic Yellow Clouds in corners -->
  <g filter="url(#cloudBlur)" opacity="0.88">
    <ellipse cx="100" cy="90" rx="130" ry="100" fill="#FEDC00" />
    <ellipse cx="230" cy="65" rx="100" ry="70" fill="#FEDC00" />
    <ellipse cx="940" cy="110" rx="140" ry="110" fill="#FEDC00" />
    <ellipse cx="840" cy="55" rx="90" ry="65" fill="#FEDC00" />
    <ellipse cx="950" cy="515" rx="150" ry="120" fill="#FEDC00" />
    <ellipse cx="90" cy="535" rx="150" ry="120" fill="#FEDC00" />
    <ellipse cx="510" cy="590" rx="120" ry="85" fill="#FEDC00" />
  </g>

  <!-- Complete Vectorized Logo -->
  <g id="logo-letters">
    <path d="${silhouettePath}" fill="#0F172A" />
    <path d="${yellowPath}" fill="#FEDC00" />
    <path d="${pinkPath}" fill="#FD3484" />
  </g>
</svg>`;

  fs.writeFileSync(path.join(process.cwd(), 'public', 'otakonce-logo.svg'), standaloneSvg);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'otakonce-banner-badge.svg'), fullBadgeSvg);
  
  // Also update favicon.svg to use the new official vector badge!
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.svg'), fullBadgeSvg);

  console.log('Successfully generated public/otakonce-logo.svg, public/otakonce-banner-badge.svg, and updated public/favicon.svg');
}

vectorize().catch(console.error);
