#!/usr/bin/env node
/**
 * Give every talent, campaign and client page its own link preview.
 *
 * The site is a single-page app: vercel.json rewrites every path to index.html,
 * so WhatsApp, Facebook and other link crawlers - which do not run JavaScript -
 * saw the same site-wide title and image for every URL. Runs after `vite build`
 * and writes dist/<route>/index.html copies of the built index.html with that
 * page's title, description and image. Vercel serves real files before applying
 * rewrites, so crawlers get the specific copy; the app boots from it unchanged
 * because only <head> meta differs.
 *
 * Data comes from the same JSON the app imports, so the nightly metrics rebuild
 * keeps previews current with no extra step.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
// The bare domain 307-redirects to www; point previews at www directly so
// crawlers fetch images without a redirect hop.
const SITE = 'https://www.butterfly-talent.com';
const BRAND = 'Butterfly Talent Agency';
const DEFAULT_IMAGE = { path: '/og/default.jpg', width: 1200, height: 630 };

const readJson = (name) => JSON.parse(readFileSync(join(ROOT, 'src', 'data', name), 'utf8'));

const escapeAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A string opening with a Latin letter makes WhatsApp lay the whole line out
// left-to-right, scrambling the Hebrew around it. A leading RLM keeps it RTL.
const rtlSafe = (s) => (/^[A-Za-z]/.test(s) ? `\u200F${s}` : s);

const truncate = (s, max = 160) => {
  const text = String(s).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : max)}…`;
};

function setMeta(html, attr, key, value) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(value)}" />`;
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
  // Replacement functions, not strings: a bio containing "$&" or "$'" would
  // otherwise be read as a replacement pattern and splice page HTML into the tag.
  return re.test(html) ? html.replace(re, () => tag) : html.replace('</head>', () => `    ${tag}\n  </head>`);
}

function render(template, { title, description, url, image, card }) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttr(title)}</title>`);
  // The template's canonical points at the homepage; left as-is it would tell
  // search engines every detail page is a duplicate of it.
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, () => `<link rel="canonical" href="${escapeAttr(url)}" />`);
  const desc = rtlSafe(description);
  const imageUrl = `${SITE}${encodeURI(image.path)}`;
  const tags = [
    ['name', 'description', desc],
    ['property', 'og:title', title],
    ['property', 'og:description', desc],
    ['property', 'og:url', url],
    ['property', 'og:image', imageUrl],
    ['property', 'og:image:width', String(image.width)],
    ['property', 'og:image:height', String(image.height)],
    ['property', 'og:image:type', 'image/jpeg'],
    ['name', 'twitter:card', card],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', desc],
    ['name', 'twitter:image', imageUrl],
  ];
  for (const [attr, key, value] of tags) html = setMeta(html, attr, key, value);
  return html;
}

// Written as <route>.html and served extensionless via vercel.json "cleanUrls".
// A <route>/index.html directory index is not reliably served for a path with no
// trailing slash, whereas cleanUrls is explicit on Vercel and matches what
// `vite preview` does locally, so the two behave the same.
function write(route, html) {
  const file = join(DIST, `${route}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// Ids become path segments; anything beyond a plain slug keeps the default
// preview rather than risk a path the router and the file system disagree on.
const safeId = (id) => /^[\w.-]+$/.test(String(id));

function main() {
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  const talents = readJson('talents.json');
  const campaigns = readJson('campaigns.json');
  const clients = readJson('clients.json');
  const counts = { talent: 0, campaign: 0, client: 0, skipped: 0 };

  for (const t of talents) {
    if (!safeId(t.id)) { counts.skipped++; continue; }
    const square = `/og/talents/${t.id}.jpg`;
    const hasSquare = existsSync(join(DIST, square));
    write(`talent/${t.id}`, render(template, {
      title: `${t.name} | ${BRAND}`,
      description: truncate(t.bio || t.category || ''),
      url: `${SITE}/talent/${t.id}`,
      image: hasSquare ? { path: square, width: 600, height: 600 } : DEFAULT_IMAGE,
      card: hasSquare ? 'summary' : 'summary_large_image',
    }));
    counts.talent++;
  }

  for (const c of campaigns) {
    if (!safeId(c.id)) { counts.skipped++; continue; }
    write(`campaign/${c.id}`, render(template, {
      title: `${c.title} | ${BRAND}`,
      description: truncate(c.description || ''),
      url: `${SITE}/campaign/${c.id}`,
      image: DEFAULT_IMAGE,
      card: 'summary_large_image',
    }));
    counts.campaign++;
  }

  // Client pages use the site card: most logos are remote, several are SVG
  // (which previews do not render), and wide logos make poor preview images.
  for (const c of clients) {
    if (!safeId(c.id)) { counts.skipped++; continue; }
    write(`client/${c.id}`, render(template, {
      title: `${c.name} | ${BRAND}`,
      description: `קמפיינים נבחרים שלנו עבור ${c.name}`,
      url: `${SITE}/client/${c.id}`,
      image: DEFAULT_IMAGE,
      card: 'summary_large_image',
    }));
    counts.client++;
  }

  console.log(
    `prerender-meta: ${counts.talent} talent, ${counts.campaign} campaign, ${counts.client} client pages` +
      (counts.skipped ? `, ${counts.skipped} skipped (non-slug id)` : ''),
  );
}

main();
