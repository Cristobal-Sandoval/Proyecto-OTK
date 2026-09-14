const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/User/.gemini/antigravity/brain/7b33883d-ccb3-4db4-97bd-2f9f618a4c6f/media__1783534839478.jpg';

async function removeBackground() {
  const { data, info } = await sharp(imgPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width; const h = info.height;
  const out = Buffer.alloc(w * h * 4);

  for (let i = 0; i < w * h; i++) {
    const r = data[i*4]; const g = data[i*4+1]; const b = data[i*4+2];
    const x = i % w; const y = Math.floor(i / w);

    // Sky blue: dominant blue, not yellow/pink/white (sky: ~rgb(0,134,255))
    const isSky = (b > 130 && b > r + 50 && b > g*0.7 && r < 140);

    // Remove the 4 corner cloud blobs (yellow #FEDC00 in corner regions)
    // Top-left cloud: measured avg rgb(220,199,18) - large blob ~300x200px
    const inTL = (x < 320 && y < 220);
    // Top-right cloud: measured avg rgb(231,205,11)
    const inTR = (x > 720 && y < 220);
    // Bottom-right cloud: measured avg rgb(175,181,53)
    const inBR = (x > 720 && y > 400);
    // Bottom-left corner (more sky colored here)
    const inBL = (x < 280 && y > 420);

    // In corner regions: remove yellowish pixels (cloud blobs)
    const isCloud = ((inTL || inTR || inBR || inBL) && (r > 130 && g > 110 && b < 130 && r > b + 30));

    if (isSky || isCloud) {
      out[i*4]=0; out[i*4+1]=0; out[i*4+2]=0; out[i*4+3]=0;
    } else {
      out[i*4]=r; out[i*4+1]=g; out[i*4+2]=b; out[i*4+3]=255;
    }
  }

  // Save transparent PNG
  const pngBuf = await sharp(out, {raw:{width:w,height:h,channels:4}}).png({compressionLevel:8}).toBuffer();
  const webpBuf = await sharp(pngBuf).webp({quality:92}).toBuffer();
  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-logo.png'), pngBuf);
  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-logo.webp'), webpBuf);
  console.log('Logo PNG KB:', Math.round(pngBuf.length/1024));
  console.log('Logo WebP KB:', Math.round(webpBuf.length/1024));

  // Embed in SVG wrappers
  const b64 = pngBuf.toString('base64');
  const standaloneSvg = '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
    + ' viewBox="0 0 1024 618" width="100%" height="100%">'
    + '<image href="data:image/png;base64,' + b64 + '" x="0" y="0" width="1024" height="618"/>'
    + '</svg>';
  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-logo.svg'), standaloneSvg);

  const badgeSvg = '<?xml version="1.0" encoding="UTF-8"?>'
    + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
    + ' viewBox="0 0 1024 618" width="100%" height="100%">'
    + '<defs>'
    + '<radialGradient id="sg" cx="50%" cy="50%" r="65%">'
    + '<stop offset="0%" stop-color="#0095FF"/><stop offset="100%" stop-color="#0075E8"/>'
    + '</radialGradient>'
    + '<filter id="cb" x="-30%" y="-30%" width="160%" height="160%">'
    + '<feGaussianBlur stdDeviation="25"/>'
    + '</filter>'
    + '</defs>'
    + '<rect width="1024" height="618" rx="28" fill="url(#sg)"/>'
    + '<g filter="url(#cb)" opacity="0.92">'
    + '<ellipse cx="90" cy="80" rx="160" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="240" cy="50" rx="110" ry="75" fill="#FEDC00"/>'
    + '<ellipse cx="950" cy="90" rx="150" ry="120" fill="#FEDC00"/>'
    + '<ellipse cx="830" cy="40" rx="100" ry="70" fill="#FEDC00"/>'
    + '<ellipse cx="960" cy="540" rx="160" ry="130" fill="#FEDC00"/>'
    + '<ellipse cx="80" cy="550" rx="160" ry="130" fill="#FEDC00"/>'
    + '</g>'
    + '<image href="data:image/png;base64,' + b64 + '" x="0" y="0" width="1024" height="618" preserveAspectRatio="xMidYMid meet"/>'
    + '</svg>';
  fs.writeFileSync(path.join(process.cwd(),'public','otakonce-banner-badge.svg'), badgeSvg);
  fs.writeFileSync(path.join(process.cwd(),'public','favicon.svg'), badgeSvg);
  console.log('Done! All files written.');
}
removeBackground().catch(console.error);
