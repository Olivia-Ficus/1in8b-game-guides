/**
 * T05 static SEO output gate. Run after astro build via postbuild.
 * Checks the built pages, sitemap and Cloudflare routing files, without
 * touching or querying the live production domain.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const origin = 'https://1in8b.online';
const read = (relativePath) => readFileSync(join(dist, relativePath), 'utf8');
const requireFile = (relativePath) => {
  assert.ok(existsSync(join(dist, relativePath)), 'Missing built file: ' + relativePath);
  return read(relativePath);
};
const extractCanonical = (html) =>
  html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] ?? '';
const isNoindex = (html) =>
  /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);

for (const [file, canonical] of [
  ['index.html', origin + '/'],
  ['games/index.html', origin + '/games/'],
  ['games/dirtbound/index.html', origin + '/games/dirtbound/'],
]) {
  const html = requireFile(file);
  assert.equal(extractCanonical(html), canonical, 'Incorrect canonical in ' + file);
  assert.ok(!isNoindex(html), 'Public page is marked noindex: ' + file);
}
const robots = requireFile('robots.txt');
assert.ok(robots.includes('Sitemap: ' + origin + '/sitemap-index.xml'));
const headers = requireFile('_headers');
assert.ok(!/^\s*X-Robots-Tag:\s*noindex/im.test(headers), 'Global noindex would block the production domain');
const redirects = requireFile('_redirects');
assert.match(redirects, /^\/en\/games\/dirtbound\/\s+\/games\/dirtbound\/\s+301\s*$/m);
assert.match(redirects, /^\/sitemap\.xml\s+\/sitemap-index\.xml\s+301\s*$/m);
assert.ok(!/^\/games\/dirtbound\/\s+\/\s+301\s*$/m.test(redirects), 'Reverse legacy redirect remains');

const sitemapIndex = requireFile('sitemap-index.xml');
const sitemapFiles = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f));
assert.ok(sitemapFiles.length && sitemapIndex.includes('sitemap-0.xml'), 'Missing sitemap child');
const locs = sitemapFiles.flatMap((file) =>
  [...read(file).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&')),
);
assert.ok(locs.length > 0, 'Sitemap has no URLs');
const paths = new Set();
for (const loc of locs) {
  const parsed = new URL(loc);
  assert.equal(parsed.origin, origin, 'Wrong sitemap host: ' + loc);
  const pathname = parsed.pathname;
  assert.ok(!paths.has(pathname), 'Duplicate sitemap path: ' + pathname);
  paths.add(pathname);
  assert.ok(!pathname.includes('sample-frontier'), 'Test game leaked into sitemap');
  assert.ok(!pathname.includes('draft-lab'), 'Draft game leaked into sitemap');
  assert.ok(!/^\/games\/dirtbound\/(controls|modes-and-penalties|driving-tips-and-track-editor)\/?$/.test(pathname),
    'Removed DirtBound subpage remains in sitemap');
  const file = pathname === '/' ? 'index.html' : join(pathname.slice(1), 'index.html');
  if (existsSync(join(dist, file))) {
    assert.ok(!isNoindex(read(file)), 'Sitemap contains a noindex page: ' + pathname);
  }
}
for (const pathname of ['/', '/games/', '/games/dirtbound/']) {
  assert.ok(paths.has(pathname), 'Missing public URL in sitemap: ' + pathname);
}
const sampleFile = join(dist, 'games/sample-frontier/index.html');
if (existsSync(sampleFile)) {
  assert.ok(isNoindex(read('games/sample-frontier/index.html')), 'Test fixture must remain noindex');
}
console.log('[T05 SEO] Verified ' + locs.length + ' public sitemap URLs, canonical, robots, and redirects.');
