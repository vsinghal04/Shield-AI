/**
 * After `vite build`, zips dist/ for manual Chrome Web Store upload.
 * Usage: node scripts/package-extension.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run npm run build first.');
  process.exit(1);
}

const out = path.join(root, 'shieldai-extension.zip');
try {
  fs.unlinkSync(out);
} catch {
  /* */
}

const isWin = process.platform === 'win32';
if (isWin) {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${dist}\\*' -DestinationPath '${out}' -Force"`,
    { stdio: 'inherit' },
  );
} else {
  execSync(`cd ${JSON.stringify(dist)} && zip -r ${JSON.stringify(out)} .`, { stdio: 'inherit' });
}

console.log('Created', out);
