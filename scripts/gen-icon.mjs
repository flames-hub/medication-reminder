// のみごろ アイコン生成スクリプト
// デザイン: さくらピンク背景 + 薬カプセル + 時計の針
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { mkdirSync } from 'fs';

// 1024x1024 SVG デザイン
function makeSvg(size) {
  const c = size / 2;
  const r = size * 0.42; // 背景円の半径

  // カプセルのサイズ
  const capsuleW = size * 0.28;
  const capsuleH = size * 0.13;
  const capsuleR = capsuleH / 2;
  const capsuleX = c - capsuleW / 2;
  const capsuleY = c - capsuleH / 2 - size * 0.06;

  // 時計の針
  const clockCX = c;
  const clockCY = c + size * 0.06;
  const clockR = size * 0.10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#F2899A"/>
      <stop offset="100%" stop-color="#D9607A"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size*0.015}" stdDeviation="${size*0.02}" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <!-- 背景 (角なし・透明なし = App Store Connect用) -->
  <rect width="${size}" height="${size}" fill="url(#bg)"/>

  <!-- 背景の光沢 -->
  <ellipse cx="${c * 0.85}" cy="${size * 0.28}" rx="${size * 0.28}" ry="${size * 0.14}" fill="rgba(255,255,255,0.12)"/>

  <!-- カプセル (薬) -->
  <g filter="url(#shadow)">
    <!-- カプセル左半分 (白) -->
    <clipPath id="leftClip">
      <rect x="${capsuleX}" y="${capsuleY}" width="${capsuleW/2}" height="${capsuleH}"/>
    </clipPath>
    <rect x="${capsuleX}" y="${capsuleY}" width="${capsuleW}" height="${capsuleH}" rx="${capsuleR}" fill="white"/>
    <!-- カプセル右半分 (薄ピンク) -->
    <clipPath id="rightClip">
      <rect x="${capsuleX + capsuleW/2}" y="${capsuleY}" width="${capsuleW/2}" height="${capsuleH}"/>
    </clipPath>
    <rect x="${capsuleX}" y="${capsuleY}" width="${capsuleW}" height="${capsuleH}" rx="${capsuleR}" fill="white" clip-path="url(#leftClip)"/>
    <rect x="${capsuleX}" y="${capsuleY}" width="${capsuleW}" height="${capsuleH}" rx="${capsuleR}" fill="#FFB3C0" clip-path="url(#rightClip)"/>
    <!-- カプセル中心線 -->
    <line x1="${c}" y1="${capsuleY + 2}" x2="${c}" y2="${capsuleY + capsuleH - 2}" stroke="rgba(200,100,120,0.25)" stroke-width="${size*0.005}"/>
  </g>

  <!-- 時計 -->
  <g filter="url(#shadow)">
    <circle cx="${clockCX}" cy="${clockCY}" r="${clockR}" fill="white" opacity="0.95"/>
    <!-- 時計の針 (11時55分イメージ = 飲み頃!) -->
    <!-- 短針 -->
    <line x1="${clockCX}" y1="${clockCY}"
          x2="${clockCX + clockR * 0.45 * Math.sin(-30 * Math.PI/180)}"
          y2="${clockCY - clockR * 0.45 * Math.cos(-30 * Math.PI/180)}"
          stroke="#D9607A" stroke-width="${size*0.012}" stroke-linecap="round"/>
    <!-- 長針 -->
    <line x1="${clockCX}" y1="${clockCY}"
          x2="${clockCX + clockR * 0.65 * Math.sin(-6 * Math.PI/180)}"
          y2="${clockCY - clockR * 0.65 * Math.cos(-6 * Math.PI/180)}"
          stroke="#D9607A" stroke-width="${size*0.009}" stroke-linecap="round"/>
    <!-- 中心点 -->
    <circle cx="${clockCX}" cy="${clockCY}" r="${size*0.012}" fill="#D9607A"/>
  </g>

  <!-- チェックマーク (小さく右下) -->
  <circle cx="${c + size*0.26}" cy="${c + size*0.26}" r="${size*0.09}" fill="rgba(255,255,255,0.22)"/>
  <polyline
    points="${c + size*0.215},${c + size*0.26} ${c + size*0.245},${c + size*0.295} ${c + size*0.305},${c + size*0.23}"
    fill="none" stroke="white" stroke-width="${size*0.022}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

async function generate() {
  mkdirSync('assets', { recursive: true });
  mkdirSync('scripts', { recursive: true });

  const sizes = [
    { file: 'assets/icon.png', size: 1024 },
    { file: 'assets/adaptive-icon.png', size: 1024 },
    { file: 'assets/favicon.png', size: 48 },
    { file: 'assets/splash-icon.png', size: 200 },
  ];

  for (const { file, size } of sizes) {
    const svg = makeSvg(size);
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .flatten({ background: '#D9607A' }) // Alpha完全除去
      .toFile(file);
    console.log(`✓ ${file} (${size}x${size})`);
  }
  console.log('\nDone! アイコン生成完了 🎉');
}

generate().catch(console.error);
