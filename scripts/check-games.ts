import * as fs from 'node:fs';
import * as path from 'node:path';
import { walkFiles } from './lib/walk';

const root = process.cwd();
const gamesDir = path.join(root, 'src/content/games');
const guidesDir = path.join(root, 'src/content/game-guides');
let errors = 0;
const fail = (message: string) => { console.error(`  ❌ ${message}`); errors++; };
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const games = new Set<string>();
console.log('\n🎮 Multi-game content validation\n');
for (const file of fs.readdirSync(gamesDir).filter((file) => file.endsWith('.json'))) {
  let data: Record<string, unknown>;
  try { data = JSON.parse(fs.readFileSync(path.join(gamesDir, file), 'utf8')); } catch { fail(`${file} is not valid JSON`); continue; }
  for (const key of ['name', 'slug', 'description', 'updatedAt', 'status']) if (!data[key]) fail(`${file} is missing required ${key}`);
  if (typeof data.slug !== 'string' || !slug.test(data.slug)) fail(`${file} has invalid slug`);
  else if (games.has(data.slug)) fail(`duplicate game slug: ${data.slug}`); else games.add(data.slug);
  if (data.status !== 'published' && data.status !== 'draft') fail(`${file} has invalid status`);
  if (data.officialUrl) try { new URL(String(data.officialUrl)); } catch { fail(`${file} has invalid officialUrl`); }
}
for (const file of walkFiles(guidesDir, { exts: ['.mdx'] })) {
  const rel = path.relative(guidesDir, file).replace(/\.mdx$/, '').split(path.sep);
  if (rel.length !== 3) { fail(`${path.relative(root, file)} must use <locale>/<game>/<topic>.mdx`); continue; }
  const [, game, topic] = rel;
  const frontmatter = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const field = (key: string) => frontmatter.match(new RegExp(`^${key}:\\s*["']?([^\\n"']+)`, 'm'))?.[1]?.trim();
  if (!games.has(game)) fail(`${path.relative(root, file)} references missing game directory "${game}"`);
  if (field('game') !== game) fail(`${path.relative(root, file)} frontmatter game must equal directory "${game}"`);
  if (field('topic') !== topic) fail(`${path.relative(root, file)} frontmatter topic must equal filename "${topic}"`);
  if (!slug.test(topic)) fail(`${path.relative(root, file)} has invalid topic slug`);
}
if (errors) { console.error(`\n❌ ${errors} multi-game validation error(s).`); process.exit(1); }
console.log(`✅ ${games.size} game record(s) and scoped MDX content are valid.`);
