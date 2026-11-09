/** Published game updates, from the active game collection (not the retired wiki feed). */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site, siteUrl } from '~/config/site';
import { getPublishedGames } from '~/lib/games';
import { defaultLocale } from '~/i18n/routing';
import { gamePath } from '~/lib/url';

export const GET: APIRoute = async (context) => {
  const games = (await getPublishedGames())
    .filter((game) => !game.data.noindex)
    .sort((a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime())
    .slice(0, 50);

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? siteUrl,
    items: games.map((game) => ({
      title: game.data.name,
      description: game.data.description,
      pubDate: game.data.updatedAt,
      link: `${siteUrl}${gamePath(game.data.slug, defaultLocale)}`,
      categories: game.data.genre ? [game.data.genre] : ['Games'],
    })),
    customData: `<language>${defaultLocale}</language>`,
  });
};
export const prerender = true;
