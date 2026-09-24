const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generatePlaceholders() {
  const assetsDir = path.join(__dirname, '..', 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'otakonce-logo.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // Resize logo for 600x800 card
  const resizedLogo = await sharp(logoBuffer)
    .resize(320, null, { fit: 'inside' })
    .toBuffer();

  const themes = [
    {
      filename: 'cosplay_kaelu.jpg',
      bg1: '#111827',
      bg2: '#0088FF',
      accent: '#0088FF',
      tag: 'PASARELA COSPLAY 2026',
      sub: 'EXPONENTE REGIONAL'
    },
    {
      filename: 'cosplay_nico.jpg',
      bg1: '#180B24',
      bg2: '#FD3484',
      accent: '#FD3484',
      tag: 'PASARELA COSPLAY 2026',
      sub: 'EXPONENTE BIOBÍO'
    },
    {
      filename: 'cosplay_aki.jpg',
      bg1: '#1A1505',
      bg2: '#FEDC00',
      accent: '#FEDC00',
      tag: 'PASARELA COSPLAY 2026',
      sub: 'EXPONENTE NACIONAL'
    },
    {
      filename: 'cosplay_placeholder.jpg',
      bg1: '#0F172A',
      bg2: '#3B82F6',
      accent: '#0088FF',
      tag: 'OTAKONCE COSPLAY',
      sub: 'FICHA OFICIAL'
    }
  ];

  for (const t of themes) {
    const svgOverlay = `
      <svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${t.bg1}" />
            <stop offset="50%" stop-color="#0a0a14" />
            <stop offset="100%" stop-color="${t.bg2}" stop-opacity="0.35" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.25" />
            <stop offset="100%" stop-color="transparent" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Background -->
        <rect width="600" height="800" fill="url(#bg)" />
        <rect width="600" height="800" fill="url(#glow)" />

        <!-- Cyber Grid Lines -->
        <circle cx="300" cy="360" r="180" fill="none" stroke="${t.accent}" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.4" />
        <circle cx="300" cy="360" r="230" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

        <!-- Header Tag -->
        <rect x="180" y="80" width="240" height="34" rx="17" fill="rgba(15,23,42,0.8)" stroke="${t.accent}" stroke-width="1.5" />
        <text x="300" y="102" font-family="'Outfit', sans-serif, Arial" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">
          ${t.tag}
        </text>

        <!-- Subtitle Bottom Badge -->
        <rect x="160" y="660" width="280" height="42" rx="12" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="300" y="686" font-family="'Outfit', sans-serif, Arial" font-size="13" font-weight="700" fill="${t.accent}" text-anchor="middle" letter-spacing="3">
          ${t.sub}
        </text>
        <text x="300" y="730" font-family="'Inter', sans-serif, Arial" font-size="11" font-weight="500" fill="#94A3B8" text-anchor="middle">
          CONCEPCIÓN · 2026
        </text>
      </svg>
    `;

    const outputPath = path.join(assetsDir, t.filename);

    await sharp(Buffer.from(svgOverlay))
      .composite([
        {
          input: resizedLogo,
          top: 310,
          left: 140
        }
      ])
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }
}

generatePlaceholders().catch(console.error);
