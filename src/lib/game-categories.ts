import { type GameEntry } from '~/lib/games';
import { type Locale } from '~/i18n/routing';
import { localizePath } from '~/lib/url';

export const GAME_CATEGORIES = [
  {
    slug: 'browser',
    label: 'Browser',
    title: 'Browser Games',
    description: 'Play free browser games without a download. Explore the games, official play links, and our player guides.',
  },
  {
    slug: 'new',
    label: 'New',
    title: 'Newly Added Games',
    description: 'The latest additions to the 1in8b catalog, ordered by the date they were first listed here—not by the game release date.',
  },
  {
    slug: 'indie',
    label: 'Indie',
    title: 'Indie Games',
    description: 'Discover independently developed games, from browser experiments to downloadable indie releases.',
  },
  {
    slug: 'mobile',
    label: 'Mobile',
    title: 'Mobile Browser Games',
    description: 'Games in our catalog with verified mobile-browser support. Check each game page for controls and device details.',
  },
] as const;

export type GameCategorySlug = (typeof GAME_CATEGORIES)[number]['slug'];

export function gameCategoryPath(slug: GameCategorySlug, locale: Locale): string {
  return localizePath(`/games/${slug}`, locale);
}

export function isBrowserGame(game: GameEntry): boolean {
  return game.data.platforms.some((platform) => /browser/i.test(platform));
}

function matchesCategory(game: GameEntry, slug: GameCategorySlug): boolean {
  switch (slug) {
    case 'browser':
      return isBrowserGame(game);
    case 'mobile':
      return game.data.platforms.some((platform) => /mobile/i.test(platform));
    case 'indie':
      return game.data.indie;
    case 'new':
      return !!game.data.listedAt;
  }
}

export function gamesInCategory(games: GameEntry[], slug: GameCategorySlug): GameEntry[] {
  const filtered = games.filter((game) => matchesCategory(game, slug));
  return slug === 'new'
    ? filtered.sort(
        (a, b) =>
          (b.data.listedAt?.getTime() ?? 0) - (a.data.listedAt?.getTime() ?? 0) ||
          a.data.name.localeCompare(b.data.name),
      )
    : filtered;
}

/** Listing date is when a game entered the site; updatedAt tracks later content edits. */
export function gamesListedThisWeek(games: GameEntry[], now = new Date()): GameEntry[] {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return gamesInCategory(games, 'new')
    .filter((game) => {
      const age = now.getTime() - game.data.listedAt!.getTime();
      return age >= 0 && age < weekMs;
    })
    .slice(0, 6);
}
