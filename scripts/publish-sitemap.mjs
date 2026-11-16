/**
 * Expose the single Astro-generated URL set at /sitemap.xml without
 * redirecting through a sitemap index. Fail rather than silently omit
 * URLs if the site grows beyond one generated sitemap.
 */
import assert from 'node:assert/strict';
import { copyFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const children = readdirSync(dist).filter((file) => /^sitemap-\d+\.xml$/.test(file));
assert.deepEqual(
  children,
  ['sitemap-0.xml'],
  'Expected one sitemap child. Update the flat sitemap publisher if multiple children are generated.',
);
copyFileSync(join(dist, 'sitemap-0.xml'), join(dist, 'sitemap.xml'));
console.log('[sitemap] Published direct URL set at /sitemap.xml.');
