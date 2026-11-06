# 1in8b Game Guides

The development foundation for the next `1in8b.online` game-discovery and
player-information site.

> Discover trending games, find where to play, and get practical guides, tips,
> and answers to common player questions.

This repository is intentionally independent from
[`Olivia-Ficus/1in8b-offline`](https://github.com/Olivia-Ficus/1in8b-offline).
It does not control `1in8b.online`, bind the production domain, or deploy to
the existing production Pages project.

## Status

T01 establishes a clean, noindex Cloudflare Pages preview and a minimal
development placeholder. No game database, game detail routes, player-facing
content, advertising, accounts, or dynamic services are included yet.

## Development

Requirements: Node.js `22.23.4+` and pnpm `11`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

The static output directory is `dist/`. Cloudflare Pages builds with
`pnpm build`; no Pages Functions or Workers are required.

## Deployment

The isolated Pages project is named `1in8b-game-guides` and its public preview
uses the `*.pages.dev` domain configured in `src/config/site.ts` and
`wrangler.toml`. The global `X-Robots-Tag: noindex, nofollow` header in
`public/_headers` is intentional for this pre-production environment and must
remain until an approved production launch.

## Upstream attribution

This project began from
[AnvilWiki v2.39.0](https://github.com/PNGTRID/AnvilWiki/tree/v2.39.0), an
Astro + Cloudflare Pages template licensed under MIT. The upstream MIT
license is preserved in [LICENSE](LICENSE).
