import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');
const TARGET_DIRS = [
  PUBLIC_DIR,
  path.join(PUBLIC_DIR, 'images'),
  path.join(PUBLIC_DIR, 'assets'),
];

async function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return null;

  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);
  const webpPath = path.join(dirName, `${baseName}.webp`);

  const statBefore = fs.statSync(filePath);
  const sizeBeforeKB = (statBefore.size / 1024).toFixed(1);

  try {
    const isPng = ext === '.png';
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let pipeline = sharp(filePath);
    if (metadata.width && metadata.width > 2560) {
      pipeline = pipeline.resize({ width: 2560, withoutEnlargement: true });
    }

    await pipeline
      .webp({
        quality: isPng ? 85 : 82,
        effort: 3,
      })
      .toFile(webpPath);

    const statAfter = fs.statSync(webpPath);
    const sizeAfterKB = (statAfter.size / 1024).toFixed(1);
    const reduction = (((statBefore.size - statAfter.size) / statBefore.size) * 100).toFixed(1);

    console.log(`✓ ${path.relative(PUBLIC_DIR, filePath)} (${sizeBeforeKB} KB) -> ${path.relative(PUBLIC_DIR, webpPath)} (${sizeAfterKB} KB) [${reduction}% saved]`);
    return { before: statBefore.size, after: statAfter.size };
  } catch (err) {
    console.error(`✗ Error converting ${filePath}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('🚀 Starting optimized WebP conversion...');
  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for (const dir of TARGET_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        const res = await convertFile(fullPath);
        if (res) {
          totalBefore += res.before;
          totalAfter += res.after;
          count++;
        }
      }
    }
  }

  const savedMB = ((totalBefore - totalAfter) / (1024 * 1024)).toFixed(2);
  const totalBeforeMB = (totalBefore / (1024 * 1024)).toFixed(2);
  const totalAfterMB = (totalAfter / (1024 * 1024)).toFixed(2);
  const overallSaved = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);

  console.log(`\n🎉 Converted ${count} images!`);
  console.log(`Total original size: ${totalBeforeMB} MB`);
  console.log(`Total WebP size:     ${totalAfterMB} MB`);
  console.log(`Total bandwidth saved: ${savedMB} MB (${overallSaved}% reduction)\n`);
}

run();
