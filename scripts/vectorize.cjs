const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/User/.gemini/antigravity/brain/7b33883d-ccb3-4db4-97bd-2f9f618a4c6f/media__1783534839478.jpg';

async function vectorize() {
  // Pre-process: upscale 2x then sharpen to clean up JPG compression artifacts
  const processed = await sharp(imgPath)
    .resize({ width: 2048, kernel: 'lanczos3' })
    .sharpen({ sigma: 2.0, m1: 1.5, m2: 8.0 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = processed.info.width;
  const h = processed.info.height;
  const data = processed.data;

  const yellowMask = Buffer.alloc(w * h);
  const pinkMask   = Buffer.alloc(w * h);

  for (let i = 0; i < w * h; i++) {
    const r = data[i*3]; const g = data[i*3+1]; const b = data[i*3+2];
    const x = i % w; const y = Math.floor(i / w);
    // Scale the logo area to match the 2x upscaled image
    const inArea = (x > 120 && x < 1930 && y > 90 && y < 1150);
    // Yellow: #FEDC00 - broad threshold to capture anti-aliased edges
    const isY = inArea && (r > 160 && g > 130 && b < 100 && r > g*0.85 && g > b*2.0);
    // Pink: #FD3484 - high red, low green, mid blue
    const isP = inArea && (r > 155 && g < 100 && b > 50 && b < 180 && r > g + 70);
    yellowMask[i] = isY ? 0 : 255;
    pinkMask[i]   = isP ? 0 : 255;
  }

  // Apply small Gaussian blur to masks before tracing to smooth jagged edges
  const smoothMask = async (buf) => {
    return sharp(buf, {raw:{width:w,height:h,channels:1}})
      .blur(2.5)
      .threshold(100)
      .png()
      .toBuffer();
  };

  const yPng = await smoothMask(yellowMask);
  const pPng = await smoothMask(pinkMask);

  const traceP = function(buf, opt) {
    var defaults = {optTolerance: 0.4, alphaMax: 1.2, threshold: 128, turdSize: 20};
    var cfg = Object.assign({}, defaults, opt);
    return new Promise(function(ok, fail) {
      potrace.trace(buf, cfg, function(e, s) { if(e) fail(e); else ok(s); });
    });
  };

  console.log('Tracing yellow letters...');
  const ySvg = await traceP(yPng, {turdSize: 25});
  console.log('Tracing pink characters...');
  const pSvg = await traceP(pPng, {turdSize: 8});

  const paths = function(s) {
    var re = /d="([^"]+)"/g, m, out = [];
    while ((m = re.exec(s)) !== null) out.push(m[1]);
    return out.join(' ');
  };

  var yp = paths(ySvg);
  var pp = paths(pSvg);

  // Scale from the 2x processing space back to original coords
  // viewBox covers the logo area: original was 895x525 starting at 65,45
  // The 2x image doubles all coords, so scale transform = 0.5
  // We embed the paths inside a <g transform='scale(0.5)'> to fit the original viewBox

  // feMorphology outline: dilate SourceAlpha + flood #0F172A + merge under SourceGraphic
  // This creates a MATHEMATICALLY PERFECT uniform outline with no path artifacts
  var filters =
    '<defs>'
    + '<filter id="outline_y" x="-15%" y="-15%" width="130%" height="130%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="11" result="dilated"/>'
    + '<feFlood flood-color="#0F172A" result="black"/>'
    + '<feComposite in="black" in2="dilated" operator="in" result="outline"/>'
    + '<feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '<filter id="outline_p" x="-15%" y="-15%" width="130%" height="130%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dilated"/>'
    + '<feFlood flood-color="#0F172A" result="black"/>'
    + '<feComposite in="black" in2="dilated" operator="in" result="outline"/>'
    + '<feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '</defs>';

  // Logo group with scale(0.5) because we traced at 2x resolution
  var logoGroup =
    '<g transform="scale(0.5)" shape-rendering="geometricPrecision">'
    + '<path d="' + yp + '" fill="#FEDC00" filter="url(#outline_y)"/>'
    + '<path d="' + pp + '" fill="#FD3484" filter="url(#outline_p)"/>'
    + '</g>';

  // Standalone (transparent background) - viewBox matches original image coords
  var standaloneS =
    '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="65 45 895 525" width="100%" height="100%">'
    + filters
    + logoGroup
    + '</svg>';

  var clouds =
    '<defs>'
    + '<radialGradient id="skyGrad" cx="50%" cy="50%" r="65%">'
    + '<stop offset="0%" stop-color="#0095FF"/>'
    + '<stop offset="100%" stop-color="#0075E8"/>'
    + '</radialGradient>'
    + '<filter id="cloudBlur" x="-30%" y="-30%" width="160%" height="160%">'
    + '<feGaussianBlur stdDeviation="22"/>'
    + '</filter>'
    + '<filter id="outline_y" x="-15%" y="-15%" width="130%" height="130%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="11" result="dilated"/>'
    + '<feFlood flood-color="#0F172A" result="black"/>'
    + '<feComposite in="black" in2="dilated" operator="in" result="outline"/>'
    + '<feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '<filter id="outline_p" x="-15%" y="-15%" width="130%" height="130%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dilated"/>'
    + '<feFlood flood-color="#0F172A" result="black"/>'
    + '<feComposite in="black" in2="dilated" operator="in" result="outline"/>'
    + '<feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '</defs>'
    + '<rect width="1024" height="618" rx="32" fill="url(#skyGrad)"/>'
    + '<g filter="url(#cloudBlur)" opacity="0.88">'
    + '<ellipse cx="100" cy="90" rx="130" ry="100" fill="#FEDC00"/>'
    + '<ellipse cx="230" cy="65" rx="100" ry="70" fill="#FEDC00"/>'
    + '<ellipse cx="940" cy="110" rx="140" ry="110" fill="#FEDC00"/>'
    + '<ellipse cx="840" cy="55" rx="90" ry="65" fill="#FEDC00"/>'
    + '<ellipse cx="950" cy="515" rx="150" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="90" cy="535" rx="150" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="510" cy="590" rx="120" ry="85" fill="#FEDC00"/>'
    + '</g>';

  var fullS =
    '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 618" width="100%" height="100%">'
    + clouds
    + '<g id="logo-letters">' + logoGroup + '</g>'
    + '</svg>';

  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-logo.svg'), standaloneS);
  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-banner-badge.svg'), fullS);
  fs.writeFileSync(path.join(process.cwd(),'public','favicon.svg'), fullS);
  console.log('Done! feMorphology outline technique applied.');
}
vectorize().catch(console.error);
