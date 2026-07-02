// 이미지 최적화 파이프라인 (기획서 §10.2)
// 원본 PNG(public/*-v2)를 리사이즈 WebP로 변환해 public/optimized/에 생성한다.
// 산출물은 커밋 대상 — CI에서 재실행할 필요 없음.
// cards-v2/mature-backgrounds(사용 금지)와 cards-v2/backs(v1 미사용)는 입력에서 제외.
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');
const OUT = path.join(PUB, 'optimized');

/** @type {Array<{src: string, out: string, width: number, quality?: number}>} */
const JOBS = [
  { src: 'backgrounds-v2', out: 'backgrounds', width: 1080, quality: 78 },
  { src: 'cells-v2', out: 'cells', width: 720 },
  { src: 'cells-v2/individual', out: 'cells/thumb', width: 128 },
  { src: 'cells-v2/individual', out: 'cells/mid', width: 512 },
  { src: 'cards-v2/backgrounds', out: 'cards', width: 1080, quality: 78 },
  { src: 'icons-v2', out: 'icons', width: 160 },
  { src: 'decor-v2', out: 'decor', width: 160 },
  { src: 'props-v2', out: 'props', width: 160 },
];

let inBytes = 0;
let outBytes = 0;
let count = 0;

for (const job of JOBS) {
  const srcDir = path.join(PUB, job.src);
  const outDir = path.join(OUT, job.out);
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(srcDir)).filter((f) => f.endsWith('.png'));
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const outPath = path.join(outDir, file.replace(/\.png$/, '.webp'));
    await sharp(srcPath)
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: job.quality ?? 80 })
      .toFile(outPath);
    inBytes += (await stat(srcPath)).size;
    outBytes += (await stat(outPath)).size;
    count++;
  }
  console.log(`${job.src} -> optimized/${job.out} (${files.length} files, w${job.width})`);
}

// PWA 아이콘: emotion pose-01 기반 192/512(+maskable), 파스텔 배경 패딩
const iconSrc = path.join(PUB, 'cells-v2/individual/emotion-01.png');
const iconOut = path.join(PUB, 'icons');
await mkdir(iconOut, { recursive: true });
const BG = { r: 255, g: 240, b: 246, alpha: 1 }; // #FFF0F6

async function pwaIcon(size, pad, name) {
  const inner = Math.round(size * (1 - pad * 2));
  const cell = await sharp(iconSrc)
    .resize({ width: inner, height: inner, fit: 'contain', background: { ...BG, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: cell, gravity: 'centre' }])
    .png()
    .toFile(path.join(iconOut, name));
}

await pwaIcon(192, 0.08, 'pwa-192.png');
await pwaIcon(512, 0.08, 'pwa-512.png');
await pwaIcon(512, 0.18, 'maskable-512.png'); // maskable 안전 영역
console.log('PWA icons: icons/pwa-192.png, pwa-512.png, maskable-512.png');

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`\n${count} images: ${mb(inBytes)}MB -> ${mb(outBytes)}MB (${Math.round((1 - outBytes / inBytes) * 100)}% saved)`);
