// scripts/build.ts
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.displayName || pkg.name}
 *
 * Description: ${pkg.description}
 * Author: ${pkg.author.name || 'Unknown'} <${pkg.author.email || 'Unknown'}>
 * Homepage: ${pkg.homepage || 'Unknown'}
 * License: ${pkg.license || 'MIT'}
 */\n`;

console.log('Running ncc build...');

execSync('pnpm exec ncc build ./src/index.ts -o dist', { stdio: 'inherit' });

// Prepend banner
const outFile = path.join('dist', 'index.js');
const code = readFileSync(outFile, 'utf-8');
writeFileSync(outFile, banner + code);

console.log('✅ Build complete with banner injected.');
