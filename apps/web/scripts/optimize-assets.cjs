const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeImages() {
  const publicDir = path.join(__dirname, '../public');
  console.log('Optimizing images in:', publicDir);

  // 1. Optimize logo.webp
  const logoPath = path.join(publicDir, 'logo.webp');
  if (fs.existsSync(logoPath)) {
    const inputBuf = fs.readFileSync(logoPath);
    const origSize = inputBuf.length;
    const buf = await sharp(inputBuf)
      .resize({ width: 360, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();
    fs.writeFileSync(logoPath, buf);
    console.log(`logo.webp: ${(origSize / 1024).toFixed(1)}KB -> ${(buf.length / 1024).toFixed(1)}KB`);
  }

  // 2. Optimize services-lighting.jpg and services-lighting.webp
  const servicesLightingJpg = path.join(publicDir, 'images/services-lighting.jpg');
  const servicesLightingWebp = path.join(publicDir, 'images/services-lighting.webp');
  if (fs.existsSync(servicesLightingWebp)) {
    const inputBuf = fs.readFileSync(servicesLightingWebp);
    const origSize = inputBuf.length;
    const buf = await sharp(inputBuf)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75, effort: 6 })
      .toBuffer();
    fs.writeFileSync(servicesLightingWebp, buf);
    console.log(`services-lighting.webp: ${(origSize / 1024).toFixed(1)}KB -> ${(buf.length / 1024).toFixed(1)}KB`);

    // Replace the 3.4MB jpg with a lightweight webp or compressed jpg
    if (fs.existsSync(servicesLightingJpg)) {
      const jpgBuf = await sharp(buf).jpeg({ quality: 75 }).toBuffer();
      fs.writeFileSync(servicesLightingJpg, jpgBuf);
      console.log(`services-lighting.jpg replaced: ${(jpgBuf.length / 1024).toFixed(1)}KB`);
    }
  }

  // 3. Optimize other key public/assets
  const assetsDir = path.join(publicDir, 'assets');
  const keyAssets = [
    'commercial_car_shoot.webp',
    'service_production.webp',
    'service_pre_production.webp',
    'hero_cinematic_dark.webp',
    'fashion_lookbook.webp',
    'abstract_studio.webp',
    'cinematic-16-9.webp',
    'service_post_production.webp',
    'service_casting.webp'
  ];

  for (const filename of keyAssets) {
    const filePath = path.join(assetsDir, filename);
    if (fs.existsSync(filePath)) {
      const inputBuf = fs.readFileSync(filePath);
      const origSize = inputBuf.length;
      const maxWidth = filename.includes('hero') ? 1600 : 1000;
      const targetQuality = filename.includes('hero') ? 78 : 74;
      const buf = await sharp(inputBuf)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: targetQuality, effort: 6 })
        .toBuffer();
      fs.writeFileSync(filePath, buf);
      console.log(`${filename}: ${(origSize / 1024).toFixed(1)}KB -> ${(buf.length / 1024).toFixed(1)}KB`);
    }
  }

  // 4. Optimize huge images in public/images
  const imagesDir = path.join(publicDir, 'images');
  const hugeImages = [
    'about-bts.webp',
    'about-hero.webp',
    'careers-meeting.webp',
    'careers-office.webp',
    'contact-studio.webp',
    'projects-outdoor.webp',
    'services-1.webp',
    'services-2.webp',
    'services-3.webp'
  ];

  for (const filename of hugeImages) {
    const filePath = path.join(imagesDir, filename);
    if (fs.existsSync(filePath)) {
      const inputBuf = fs.readFileSync(filePath);
      const origSize = inputBuf.length;
      const buf = await sharp(inputBuf)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 75, effort: 6 })
        .toBuffer();
      fs.writeFileSync(filePath, buf);
      console.log(`${filename}: ${(origSize / 1024).toFixed(1)}KB -> ${(buf.length / 1024).toFixed(1)}KB`);
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
