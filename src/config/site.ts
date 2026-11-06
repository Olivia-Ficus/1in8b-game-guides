/**
 * Site-wide brand configuration. Individual game metadata belongs in
 * src/content/games/*.json and must never be added here.
 */

export interface SiteConfig {
  /** Full site name, used in <title> suffix and Organization JSON-LD. */
  name: string;
  /** Short name for PWA manifest, mobile logo, and the long-title <title> suffix (>50 chars). e.g. "AQ Wiki" */
  shortName: string;
  /** Site description for Organization JSON-LD and og:site_name. */
  description: string;
  /** Domain without protocol or trailing slash. e.g. "anvilquestwiki.wiki" */
  domain: string;
  /** Hero tagline shown under the site title. */
  tagline: string;
  /** Copyright / legal disclaimer line shown in footer. */
  legalNotice: string;
  /**
   * Optional public contact email — rendered as a mailto link on the contact
   * page when set. AdSense reviewers look for a reachable contact channel;
   * if you run no social channels, set this.
   */
  contactEmail?: string;
  social: {
    official: string;
    discord?: string;
    youtube?: string;
    twitter?: string;
    reddit?: string;
  };
  /**
   * Canonical URLs about the GAME (Steam page, official site, Wikipedia entry…).
   * Emitted as Organization JSON-LD `sameAs` — helps Google / AI engines link
   * this wiki to the game's knowledge-graph entity.
   */
  sameAs?: string[];
  /**
   * Dimensions of the default OG/Twitter share image (public/images/hero.webp).
   * Emitted as og:image:width / og:image:height so social crawlers can render
   * the share card without downloading the image first.
   */
  ogImageWidth: number;
  ogImageHeight: number;
  /** Default author name for articles without an explicit `author` in frontmatter (E-E-A-T signal). */
  defaultAuthor?: string;
  /**
   * Build-time site-type signal, written by apply-template for the non-default
   * presets only ('coupon-hub' | 'tutorial-hub'). Game-wiki forks carry NO
   * line at all (absent = game-wiki), keeping the zero-breaking output
   * byte-identical. Read by presentation-layer variants — e.g. the coupon
   * deals overview on the codes list page.
   */
  siteType?: 'coupon-hub' | 'tutorial-hub';
}

export const site: SiteConfig = {
  name: '1in8b Game Guides',
  shortName: '1in8b',
  description: 'Discover trending games, find where to play, and get practical guides, tips, and answers to common player questions.',
  domain: '1in8b-game-guides.pages.dev',
  tagline: 'Discover trending games, find where to play, and get practical guides, tips, and answers to common player questions.',
  legalNotice: '1in8b Game Guides is an independent editorial resource and is not affiliated with game publishers or developers.',
  // Set a real address if you run no social channels — the contact page
  // renders it as a mailto link.
  contactEmail: '',
  social: {
    official: 'https://1in8b.online/',
  },
  // og:image dims of the SHIPPED hero.webp — if you replace public/images/hero.webp,
  // update these in src/config/site.ts to match (wrong dims mis-crop share cards).
  ogImageWidth: 1200,
  ogImageHeight: 630,
};

/** Absolute site URL (no trailing slash). Falls back to the Astro `site` config. */
export const siteUrl: string = (process.env.SITE_URL || `https://${site.domain}`).replace(
  /\/$/,
  '',
);

/** Resolved site type — an absent `siteType` line means the default game wiki. */
export const siteType: 'game-wiki' | 'coupon-hub' | 'tutorial-hub' = site.siteType ?? 'game-wiki';
