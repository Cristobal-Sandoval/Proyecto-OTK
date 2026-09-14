const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/User/.gemini/antigravity/brain/7b33883d-ccb3-4db4-97bd-2f9f618a4c6f/media__1783534839478.jpg';

async function vectorize() {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width; const h = info.height;
  const yellowMask = Buffer.alloc(w * h);
  const pinkMask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i*3]; const g = data[i*3+1]; const b = data[i*3+2];
    const x = i % w; const y = Math.floor(i / w);
    const inArea = (x > 60 && x < 965 && y > 45 && y < 575);
    const isY = inArea && (r > 170 && g > 140 && b < 100 && r > b + 80);
    const isP = inArea && (r > 160 && g < 110 && b > 60 && r > g + 60);
    yellowMask[i] = isY ? 0 : 255;
    pinkMask[i]   = isP ? 0 : 255;
  }
  const traceP = (buf, opt) => new Promise((ok, fail) =>
    potrace.trace(buf, Object.assign({optTolerance:0.3,threshold:128},opt), (e,s)=> e?fail(e):ok(s)));
  const yPng = await sharp(yellowMask,{raw:{width:w,height:h,channels:1}}).png().toBuffer();
  const pPng = await sharp(pinkMask,  {raw:{width:w,height:h,channels:1}}).png().toBuffer();
  console.log('Tracing yellow letters...');
  const ySvg = await traceP(yPng, {turdSize:15});
  console.log('Tracing pink characters...');
  const pSvg = await traceP(pPng, {turdSize:4});
  const paths = function(s) {
    var re = /d="([^"]+)"/g, m, out = [];
    while ((m = re.exec(s)) !== null) out.push(m[1]);
    return out.join(' ');
  };
  const yp = paths(ySvg); const pp = paths(pSvg);

  function makeLogoG(yp, pp) {
    return '<path d="' + yp + '" fill="#FEDC00" stroke="#0F172A" stroke-width="22" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"/>'
         + '<path d="' + pp + '" fill="#FD3484" stroke="#0F172A" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"/>';
  }

  var logoG = makeLogoG(yp, pp);

  var standaloneS = '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="65 45 895 525" width="100%" height="100%">'
    + '<g id="otakonce-vector-logo">' + logoG + '</g>'
    + '</svg>';

  var clouds = '<g filter="url(#cloudBlur)" opacity="0.88">'
    + '<ellipse cx="100" cy="90" rx="130" ry="100" fill="#FEDC00"/>'
    + '<ellipse cx="230" cy="65" rx="100" ry="70" fill="#FEDC00"/>'
    + '<ellipse cx="940" cy="110" rx="140" ry="110" fill="#FEDC00"/>'
    + '<ellipse cx="840" cy="55" rx="90" ry="65" fill="#FEDC00"/>'
    + '<ellipse cx="950" cy="515" rx="150" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="90" cy="535" rx="150" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="510" cy="590" rx="120" ry="85" fill="#FEDC00"/>'
    + '</g>';

  var fullS = '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%">'
    + '<defs>'
    + '<radialGradient id="skyGrad" cx="50%" cy="50%" r="65%">'
    + '<stop offset="0%" stop-color="#0095FF"/>'
    + '<stop offset="100%" stop-color="#0075E8"/>'
    + '</radialGradient>'
    + '<filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">'
    + '<feGaussianBlur stdDeviation="22"/>'
    + '</filter>'
    + '</defs>'
    + '<rect width="' + w + '" height="' + h + '" rx="32" fill="url(#skyGrad)"/>'
    + clouds
    + '<g id="logo-letters">' + logoG + '</g>'
    + '</svg>';

  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-logo.svg'), standaloneS);
  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-banner-badge.svg'), fullS);
  fs.writeFileSync(path.join(process.cwd(),'public','favicon.svg'), fullS);
  console.log('Done! SVGs generated using paint-order stroke technique.');
}
vectorize().catch(console.error);
