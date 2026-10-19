#!/usr/bin/env node
/**
 * Card-sized copies of the talent photos for v2's roster grid.
 *
 * The originals are up to ~1400px tall and 100-330KB, shown in cards ~300px
 * wide. Decoding a dozen of them as the grid scrolls into view stalls weaker
 * machines. Runs after `vite build` and writes a 640px-wide WebP next to the
 * built site at /card/<original path>.webp; src/v2/data.ts (cardImage) builds
 * the same path, and falls back to the original if a copy is missing.
 *
 * Reads the same talents.json the admin panel edits, so a newly uploaded photo
 * gets its copy on the next deploy with no extra step.
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const WIDTH = 640;

// Keep in step with cardImage() in src/v2/data.ts.
const cardPath = (src) => `/card${src.replace(/\.[a-z0-9]+$/i, '')}.webp`;

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  // Never fail the deploy over thumbnails: cards then show the originals.
  console.warn('card-images: sharp unavailable, skipped (cards will use the original photos)');
  process.exit(0);
}

const talents = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'talents.json'), 'utf8'));
const counts = { made: 0, skipped: 0, failed: 0 };

for (const src of new Set(talents.map((t) => t.imageUrl).filter(Boolean))) {
  const input = join(DIST, src);
  if (/^https?:/i.test(src) || !existsSync(input)) {
    counts.skipped++;
    continue;
  }
  const output = join(DIST, cardPath(src));
  try {
    mkdirSync(dirname(output), { recursive: true });
    await sharp(input).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toFile(output);
    counts.made++;
  } catch (err) {
    counts.failed++;
    console.warn(`card-images: ${src}: ${err.message}`);
  }
}

console.log(
  `card-images: ${counts.made} made` +
    (counts.skipped ? `, ${counts.skipped} skipped (remote or missing)` : '') +
    (counts.failed ? `, ${counts.failed} failed` : ''),
);
