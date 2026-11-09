/**
 * A concise, truthful inventory of published 1in8b game pages.
 * Unlike the original AnvilWiki endpoint, reads the active games collection.
 */
import type { APIRoute } from 'astro';
import { site, siteUrl } from '~/config/site';
import { getPublishedGames } from '~/lib/games';
import { defaultLocale } from '~/i18n/routing';
import { gamePath } from '~/lib/url';

const escapeLinkText = (value: string) => value.replace(/[\\[\]]/g, '\\$&');
const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim();

export const GET: APIRoute = async () => {
  const games = (await getPublishedGames())
    .filter((game) => !game.data.noindex)
    .sort((a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime());

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    'Independent game discovery, official play links, and practical player help.',
    '',
    '## Games',
    '',
    ...games.map((game) =>
      `- [${escapeLinkText(game.data.name)}](${siteUrl}${gamePath(game.data.slug, defaultLocale)}): ${oneLine(game.data.description)}`,
    ),
  ];
  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
