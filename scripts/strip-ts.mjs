/**
 * Strip TypeScript from all .js/.jsx files in src/
 * Uses @babel/core to parse + re-emit without types.
 */
import { transformFileSync } from '@babel/core';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const BABEL_OPTS = {
  configFile: false,
  babelrc: false,
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
  ],
  retainLines: true,
  compact: false,
  comments: true,
};

let ok = 0, fail = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry)) continue;
      walk(full);
    } else {
      const ext = extname(full);
      if (ext !== '.js' && ext !== '.jsx') continue;
      try {
        const result = transformFileSync(full, BABEL_OPTS);
        if (result && result.code) {
          writeFileSync(full, result.code, 'utf8');
          ok++;
        }
      } catch (e) {
        console.error(`FAIL: ${full}\n  ${e.message}`);
        fail++;
      }
    }
  }
}

walk('src');
console.log(`\nDone: ${ok} converted, ${fail} failed`);
