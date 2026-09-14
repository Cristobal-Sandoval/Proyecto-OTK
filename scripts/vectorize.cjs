const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/User/.gemini/antigravity/brain/7b33883d-ccb3-4db4-97bd-2f9f618a4c6f/media__1783534839478.jpg';

async function vectorize() {
  // Upscale 2x + sharpen to remove JPG compression noise
  const processed = await sharp(imgPath)
    .resize({ width: 2048, kernel: 'lanczos3' })
    .sharpen({ sigma: 1.5, m1: 1.0, m2: 6.0 })
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
    const inArea = (x > 120 && x < 1930 && y > 90 && y < 1150);
    // Wider yellow threshold - captures all yellow tones in bubble letters
    // Original yellow: #FEDC00 = rgb(254,220,0)
    const isY = inArea && (r > 140 && g > 110 && b < 120 && r > b + 50 && g > b + 30);
    // Pink threshold: #FD3484 = rgb(253,52,132)
    const isP = inArea && (r > 150 && g < 110 && b > 40 && b < 200 && r > g + 60);
    yellowMask[i] = isY ? 0 : 255;
    pinkMask[i]   = isP ? 0 : 255;
  }

  // Morphological CLOSE: blur > threshold to fill small interior holes
  const closeMask = async function(buf, blurRadius, thresholdVal) {
    return sharp(buf, {raw:{width:w,height:h,channels:1}})
      .blur(blurRadius)
      .threshold(thresholdVal)
      .negate()  // invert: 0=fg -> 255=fg for second blur
      .blur(blurRadius)
      .threshold(thresholdVal)
      .negate()  // back to 0=fg (black = letter)
      .png()
      .toBuffer();
  };

  console.log('Processing masks...');
  const yPng = await closeMask(yellowMask, 4, 80);
  const pPng = await closeMask(pinkMask, 2, 100);

  const traceP = function(buf, opt) {
    var cfg = Object.assign({optTolerance:0.4,alphaMax:1.2,threshold:128,turdSize:30}, opt);
    return new Promise(function(ok,fail){
      potrace.trace(buf, cfg, function(e,s){ if(e)fail(e); else ok(s); });
    });
  };

  console.log('Tracing yellow letters...');
  const ySvg = await traceP(yPng, {turdSize:30});
  console.log('Tracing pink characters...');
  const pSvg = await traceP(pPng, {turdSize:8});

  const paths = function(s) {
    var re=/d="([^"]+)"/g, m, out=[];
    while((m=re.exec(s))!==null) out.push(m[1]);
    return out.join(' ');
  };

  var yp = paths(ySvg);
  var pp = paths(pSvg);

  // feMorphology: creates mathematically clean, uniform black outline
  // fill-rule='nonzero': fills ALL enclosed areas (no more holes in letters!)
  var filterDefs =
    '<defs>'
    + '<filter id="oy" x="-15%" y="-15%" width="130%" height="130%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="11" result="d"/>'
    + '<feFlood flood-color="#0F172A" result="c"/>'
    + '<feComposite in="c" in2="d" operator="in" result="o"/>'
    + '<feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '<filter id="op" x="-20%" y="-20%" width="140%" height="140%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/>'
    + '<feFlood flood-color="#0F172A" result="c"/>'
    + '<feComposite in="c" in2="d" operator="in" result="o"/>'
    + '<feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '</defs>';

  // KEY FIX: fill-rule='nonzero' fills ALL enclosed areas -> no holes!
  var logoG =
    '<g transform="scale(0.5)" shape-rendering="geometricPrecision">'
    + '<path d="' + yp + '" fill="#FEDC00" fill-rule="nonzero" filter="url(#oy)"/>'
    + '<path d="' + pp + '" fill="#FD3484" fill-rule="nonzero" filter="url(#op)"/>'
    + '</g>';

  // Standalone SVG (transparent background)
  var standaloneS =
    '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="65 45 895 525" width="100%" height="100%">'
    + filterDefs
    + logoG
    + '</svg>';

  // Badge SVG (blue bg + clouds)
  var bgDefs =
    '<defs>'
    + '<radialGradient id="sg" cx="50%" cy="50%" r="65%">'
    + '<stop offset="0%" stop-color="#0095FF"/>'
    + '<stop offset="100%" stop-color="#0075E8"/>'
    + '</radialGradient>'
    + '<filter id="cb" x="-30%" y="-30%" width="160%" height="160%">'
    + '<feGaussianBlur stdDeviation="22"/>'
    + '</filter>'
    + '<filter id="oy" x="-15%" y="-15%" width="130%" height="130%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="11" result="d"/>'
    + '<feFlood flood-color="#0F172A" result="c"/>'
    + '<feComposite in="c" in2="d" operator="in" result="o"/>'
    + '<feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '<filter id="op" x="-20%" y="-20%" width="140%" height="140%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/>'
    + '<feFlood flood-color="#0F172A" result="c"/>'
    + '<feComposite in="c" in2="d" operator="in" result="o"/>'
    + '<feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter>'
    + '</defs>';

  var fullS =
    '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 618" width="100%" height="100%">'
    + bgDefs
    + '<rect width="1024" height="618" rx="32" fill="url(#sg)"/>'
    + '<g filter="url(#cb)" opacity="0.88">'
    + '<ellipse cx="100" cy="90" rx="130" ry="100" fill="#FEDC00"/>'
    + '<ellipse cx="230" cy="65" rx="100" ry="70" fill="#FEDC00"/>'
    + '<ellipse cx="940" cy="110" rx="140" ry="110" fill="#FEDC00"/>'
    + '<ellipse cx="840" cy="55" rx="90" ry="65" fill="#FEDC00"/>'
    + '<ellipse cx="950" cy="515" rx="150" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="90" cy="535" rx="150" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="510" cy="590" rx="120" ry="85" fill="#FEDC00"/>'
    + '</g>'
    + '<g id="logo-letters">' + logoG + '</g>'
    + '</svg>';

  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-logo.svg'), standaloneS);
  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-banner-badge.svg'), fullS);
  fs.writeFileSync(path.join(process.cwd(),'public','favicon.svg'), fullS);
  console.log('Done! fill-rule=nonzero + feMorphology outline.');
}
vectorize().catch(console.error);
