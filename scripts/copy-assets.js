/**
 * Copies static (non-TypeScript) assets from src/ to dist/ after tsc compilation.
 */
const fs = require('fs');
const path = require('path');

const assets = [
  ['src/renderer/index.html', 'dist/renderer/index.html'],
  ['src/renderer/renderer.js', 'dist/renderer/renderer.js'],
];

for (const [src, dest] of assets) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} → ${dest}`);
}
