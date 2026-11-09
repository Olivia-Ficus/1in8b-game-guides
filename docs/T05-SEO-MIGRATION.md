# T05 — SEO and legacy URL migration

## URL contract

| Old URL | New behavior at T07 cutover |
| --- | --- |
| `/` (old DirtBound single-page guide) | New game-portal homepage, HTTP 200; link visibly to `/games/dirtbound/`. No redirect: the root is still needed. |
| `/games/dirtbound/` (old 301 → `/`) | New complete DirtBound single page, HTTP 200. Do NOT copy the old reverse redirect. |
| `/en/games/dirtbound/` | 301 to `/games/dirtbound/` (same relevant game content). |
| `/sitemap.xml` | 301 to `/sitemap-index.xml`. |
| Old life simulator / removed unrelated game routes | HTTP 404 (or 410 if explicitly configured later). No blanket redirect to the portal and no restoration of removed content. |
| `/games/dirtbound/#controls` etc. | Client-side anchors on the single page. Fragments are not redirect targets. |

An old root-page ranking for DirtBound is **not** guaranteed to transfer to the new URL: the root is changing purpose rather than redirecting to equivalent content.

## Source of truth and environments

- Canonical and sitemap host: `https://1in8b.online` (build-time `SITE_URL`).
- Astro generates `/sitemap-index.xml`, `/sitemap-0.xml`, and `/robots.txt`.
- Pages automatically sets `X-Robots-Tag: noindex` on **Preview deployments**; do not add a global `noindex` rule to `public/_headers`, because it would also apply on the eventual live custom domain.
- Test/draft routes are not included in sitemap. A single noindex guide must not hide a game's own page.
- `pnpm build` runs `scripts/check-seo-migration.mjs` to gate public canonical, sitemap URLs, outdated topic paths and redirects.

## T07 release checklist — NOT done in T05

1. Confirm the latest T05 branch is reviewed and merged without overwriting T02–T04B work; no changes to the existing `1in8b-offline` source are required.
2. Verify screenshot/media reuse permission and complete any necessary corrections before publishing DirtBound.
3. Switch `1in8b.online` and `www.1in8b.online` custom-domain binding from old `1in8b-offline` to new `1in8b-game-guides` Pages project. Keep the existing zone-level www→apex 301.
4. Confirm live `/`, `/games/`, `/games/dirtbound/` all return 200, and old `/games/dirtbound/` → `/` redirect is absent. Verify `/en/games/dirtbound/` and `/sitemap.xml` return the intended 301.
5. Check live HTTP response headers (no global `X-Robots-Tag: noindex`), canonical/OG URLs, robots.txt, sitemap and JSON-LD. Check Cloudflare-generated Preview noindex on a branch-specific URL.
6. Verify removed historical content stays 404/410; investigate unexpected redirects or soft 404s.
7. Submit `https://1in8b.online/sitemap-index.xml` in Google Search Console. Track indexing of the new homepage and DirtBound URL; crawling and ranking changes are not immediately predictable.

**T05 does not edit the existing production Pages project, its rules, or custom-domain bindings.**
