import { describe, expect, test } from 'vitest';
import { gamesInCategory, gamesListedThisWeek, isBrowserGame } from '../src/lib/game-categories';
import type { GameEntry } from '../src/lib/games';

function fixture(name: string, platforms: string[], listedAt: string, indie = true): GameEntry {
  return {
    data: {
      name,
      slug: name.toLowerCase().replace(/ /g, '-'),
      platforms,
      listedAt: new Date(listedAt),
      updatedAt: new Date('2026-11-18'),
      indie,
    },
  } as GameEntry;
}

const fixtures = [
  fixture('DirtBound', ['Web browser', 'Desktop', 'Mobile'], '2026-11-06'),
  fixture('Drink the Ocean', ['Desktop browser'], '2026-11-16'),
  fixture('Slotbound', ['Windows', 'macOS'], '2026-11-17'),
];

describe('browser game directory classification', () => {
  test('Steam-only games are excluded from the browser category', () => {
    expect(fixtures.filter(isBrowserGame).map((game) => game.data.name))
      .toEqual(['DirtBound', 'Drink the Ocean']);
  });

  test('category navigation returns real playable game subsets', () => {
    expect(gamesInCategory(fixtures, 'browser')).toHaveLength(2);
    expect(gamesInCategory(fixtures, 'mobile').map((game) => game.data.name))
      .toEqual(['DirtBound']);
    expect(gamesInCategory(fixtures, 'indie')).toHaveLength(3);
  });

  test('new additions use original listing date, not later guide updates', () => {
    const newGames = gamesListedThisWeek(fixtures, new Date('2026-11-18T12:00:00Z'));
    expect(newGames.map((game) => game.data.name)).toEqual(['Slotbound', 'Drink the Ocean']);
    expect(gamesInCategory(fixtures, 'new').map((game) => game.data.name))
      .toEqual(['Slotbound', 'Drink the Ocean', 'DirtBound']);
  });

  test('latest catalog addition takes precedence over manual featured flags and guide updates', () => {
    const older = fixture('Older', ['Web browser'], '2026-11-06');
    older.data.featured = true;
    older.data.updatedAt = new Date('2026-11-30');
    const newest = fixture('Newest', ['Windows'], '2026-11-26');
    expect(gamesInCategory([older, newest], 'new')[0]).toBe(newest);
  });

  test('no listing remains new after its first week', () => {
    expect(gamesListedThisWeek(fixtures, new Date('2026-12-01T12:00:00Z')))
      .toEqual([]);
  });
});
