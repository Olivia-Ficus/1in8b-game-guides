import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '~/i18n/routing';

export type GameEntry = CollectionEntry<'games'>;
export type GameGuideEntry = CollectionEntry<'gameGuides'>;
const isDev = import.meta.env.DEV;
const published = (game: GameEntry) => game.data.status === 'published' || isDev;
const publishedGuide = (guide: GameGuideEntry) => !guide.data.draft || isDev;

export function parseGameGuideId(id: string): { locale: Locale; game: string; topic: string } | null {
  const parts = id.replace(/\.mdx$/, '').split('/');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
  return { locale: parts[0] as Locale, game: parts[1], topic: parts[2] };
}

/** Throws during static generation instead of allowing invalid references or
 * duplicate public URLs to silently produce arbitrary pages. */
export async function getPublishedGames(): Promise<GameEntry[]> {
  const allGames = await getCollection('games');
  const seen = new Set<string>();
  for (const game of allGames) {
    if (seen.has(game.data.slug)) throw new Error(`Duplicate game slug: "${game.data.slug}"`);
    seen.add(game.data.slug);
  }
  for (const guide of await getCollection('gameGuides')) {
    const parsed = parseGameGuideId(guide.id);
    if (!parsed) throw new Error(`Invalid game guide path: ${guide.id}`);
    if (parsed.game !== guide.data.game) throw new Error(`Guide game mismatch in ${guide.id}`);
    if (parsed.topic !== guide.data.topic) throw new Error(`Guide topic mismatch in ${guide.id}`);
    if (!seen.has(guide.data.game)) throw new Error(`Guide ${guide.id} references missing game: "${guide.data.game}"`);
  }
  return allGames.filter(published).sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export async function getGameBySlug(slug: string): Promise<GameEntry | null> {
  return (await getPublishedGames()).find((game) => game.data.slug === slug) ?? null;
}

export async function getGameGuides(gameSlug: string, locale: Locale = defaultLocale): Promise<GameGuideEntry[]> {
  const game = await getGameBySlug(gameSlug);
  if (!game) return [];
  const guides = (await getCollection('gameGuides')).filter((guide) => {
    const parsed = parseGameGuideId(guide.id);
    return publishedGuide(guide) && parsed?.locale === locale && parsed.game === gameSlug && guide.data.game === gameSlug;
  });
  const seen = new Set<string>();
  for (const guide of guides) {
    const parsed = parseGameGuideId(guide.id)!;
    if (parsed.topic !== guide.data.topic) throw new Error(`Guide topic mismatch in ${guide.id}`);
    if (seen.has(guide.data.topic)) throw new Error(`Duplicate guide topic for ${gameSlug}: "${guide.data.topic}"`);
    seen.add(guide.data.topic);
  }
  return guides.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getGameGuide(gameSlug: string, topic: string, locale: Locale = defaultLocale) {
  return (await getGameGuides(gameSlug, locale)).find((guide) => guide.data.topic === topic) ?? null;
}

export async function getRelatedGameGuides(current: GameGuideEntry, locale: Locale, limit = 3) {
  const guides = await getGameGuides(current.data.game, locale);
  return guides
    .filter((guide) => guide.id !== current.id)
    .sort((a, b) => {
      const sharedA = a.data.tags.filter((tag) => current.data.tags.includes(tag)).length;
      const sharedB = b.data.tags.filter((tag) => current.data.tags.includes(tag)).length;
      return sharedB - sharedA || b.data.date.getTime() - a.data.date.getTime();
    })
    .slice(0, limit);
}
