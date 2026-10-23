import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp, vibrant Super Mario style Star / Spell Quest block icon
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="blockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="10%" stop-color="#fbbf24"/>
      <stop offset="90%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="#0369a1" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Background Base with rounded squircle -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)"/>

  <!-- Question Block Frame -->
  <g filter="url(#shadow)">
    <rect x="76" y="76" width="360" height="360" rx="36" fill="url(#blockGrad)" stroke="#78350f" stroke-width="14"/>
    <!-- Inner corner rivets -->
    <circle cx="112" cy="112" r="12" fill="#78350f"/>
    <circle cx="110" cy="110" r="6" fill="#fde68a"/>
    <circle cx="400" cy="112" r="12" fill="#78350f"/>
    <circle cx="398" cy="110" r="6" fill="#fde68a"/>
    <circle cx="112" cy="400" r="12" fill="#78350f"/>
    <circle cx="110" cy="398" r="6" fill="#fde68a"/>
    <circle cx="400" cy="400" r="12" fill="#78350f"/>
    <circle cx="398" cy="398" r="6" fill="#fde68a"/>

    <!-- High-gloss top highlight -->
    <path d="M 120 96 L 392 96 A 14 14 0 0 1 406 110 L 406 130 A 14 14 0 0 1 392 144 L 120 144 A 14 14 0 0 1 106 130 L 106 110 A 14 14 0 0 1 120 96 Z" fill="#fef3c7" opacity="0.6"/>

    <!-- Invincible Mario Star In Center -->
    <polygon points="256,135 285,210 365,215 303,265 323,345 256,300 189,345 209,265 147,215 227,210"
             fill="url(#starGrad)" stroke="#78350f" stroke-width="12" stroke-linejoin="round"/>

    <!-- Star eyes (classic cartoon vertical pill eyes) -->
    <ellipse cx="238" cy="242" rx="7" ry="16" fill="#1e293b"/>
    <circle cx="237" cy="236" r="3.5" fill="#ffffff"/>
    <ellipse cx="274" cy="242" rx="7" ry="16" fill="#1e293b"/>
    <circle cx="273" cy="236" r="3.5" fill="#ffffff"/>

    <!-- "S" Spell Quest Badge on Star -->
    <text x="256" y="388" font-family="'Fredoka', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" stroke="#78350f" stroke-width="8" text-anchor="middle" letter-spacing="2">QUEST</text>
  </g>
</svg>
`.trim();

// Maskable version: Has full bleed background and all elements within central 80% safe zone (center 400x400)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="blockGradMask" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="10%" stop-color="#fbbf24"/>
      <stop offset="90%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="starGradMask" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
  </defs>

  <!-- Full-bleed background for Android adaptive shapes -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>

  <!-- Centered safe-zone block (scaled to 75% to guarantee no clipping) -->
  <g transform="translate(64, 64) scale(0.75)">
    <rect x="76" y="76" width="360" height="360" rx="36" fill="url(#blockGradMask)" stroke="#78350f" stroke-width="14"/>
    <circle cx="112" cy="112" r="12" fill="#78350f"/>
    <circle cx="110" cy="110" r="6" fill="#fde68a"/>
    <circle cx="400" cy="112" r="12" fill="#78350f"/>
    <circle cx="398" cy="110" r="6" fill="#fde68a"/>
    <circle cx="112" cy="400" r="12" fill="#78350f"/>
    <circle cx="110" cy="398" r="6" fill="#fde68a"/>
    <circle cx="400" cy="400" r="12" fill="#78350f"/>
    <circle cx="398" cy="398" r="6" fill="#fde68a"/>

    <polygon points="256,135 285,210 365,215 303,265 323,345 256,300 189,345 209,265 147,215 227,210"
             fill="url(#starGradMask)" stroke="#78350f" stroke-width="12" stroke-linejoin="round"/>

    <ellipse cx="238" cy="242" rx="7" ry="16" fill="#1e293b"/>
    <circle cx="237" cy="236" r="3.5" fill="#ffffff"/>
    <ellipse cx="274" cy="242" rx="7" ry="16" fill="#1e293b"/>
    <circle cx="273" cy="236" r="3.5" fill="#ffffff"/>

    <text x="256" y="388" font-family="'Fredoka', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" stroke="#78350f" stroke-width="8" text-anchor="middle" letter-spacing="2">QUEST</text>
  </g>
</svg>
`.trim();

fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);

async function generatePngs() {
  const iconBuffer = Buffer.from(iconSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 192x192
  await sharp(iconBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(iconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 maskable with safe margin
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple Touch Icon 180x180
  await sharp(iconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon 32x32
  await sharp(iconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('All PWA icons generated successfully in /public');
}

generatePngs().catch(console.error);
