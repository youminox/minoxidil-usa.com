/**
 * Publishes the next article from content/queue/ into content/posts/,
 * updates content/index.json, content/categories.json, and public/search-index.json.
 *
 * Usage:
 *   node scripts/publish-next.mjs          # Respects 25-min cooldown guard
 *   node scripts/publish-next.mjs --force  # Publishes immediately
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const QUEUE_DIR = path.join(ROOT, 'content', 'queue');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const INDEX_PATH = path.join(ROOT, 'content', 'index.json');
const CATEGORIES_PATH = path.join(ROOT, 'content', 'categories.json');
const SEARCH_INDEX_PATH = path.join(ROOT, 'public', 'search-index.json');
const STATE_PATH = path.join(QUEUE_DIR, '.state.json');

const force = process.argv.includes('--force');

if (!fs.existsSync(QUEUE_DIR)) {
  console.log('ℹ️ Queue directory does not exist. Nothing to publish.');
  process.exit(0);
}

const queueFiles = fs
  .readdirSync(QUEUE_DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
  .sort();

if (queueFiles.length === 0) {
  console.log('✅ Queue is empty — all scheduled articles have been published!');
  process.exit(0);
}

// Cooldown guard (25 minutes) so dual triggers never double-publish
if (!force && fs.existsSync(STATE_PATH)) {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    const elapsedMinutes = (Date.now() - state.lastPublishedAt) / 60000;
    if (elapsedMinutes < 25) {
      console.log(`⏳ Last article was published ${elapsedMinutes.toFixed(1)} min ago (< 25 min). Skipping.`);
      process.exit(0);
    }
  } catch {
    // ignore corrupt state
  }
}

const nextFile = queueFiles[0];
const nextFilePath = path.join(QUEUE_DIR, nextFile);
const post = JSON.parse(fs.readFileSync(nextFilePath, 'utf8'));

// Stamp current date (YYYY-MM-DD)
const now = new Date();
post.date = now.toISOString().split('T')[0];

// 1. Write to content/posts/{slug}.json
const destPostPath = path.join(POSTS_DIR, `${post.slug}.json`);
fs.writeFileSync(destPostPath, JSON.stringify(post, null, 2));

// 2. Prepend to content/index.json (without content field)
const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
const { content, ...indexEntry } = post;
const filteredIndex = index.filter((p) => p.slug !== post.slug);
filteredIndex.unshift(indexEntry);
fs.writeFileSync(INDEX_PATH, JSON.stringify(filteredIndex, null, 2));

// 3. Update category counts in content/categories.json
const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
categories.forEach((cat) => {
  cat.count = filteredIndex.filter((p) => p.category === cat.slug).length;
});
categories.sort((a, b) => b.count - a.count);
fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));

// 4. Regenerate public/search-index.json
const searchIndex = filteredIndex.map((p) => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  categoryName: p.categoryName,
}));
fs.writeFileSync(SEARCH_INDEX_PATH, JSON.stringify(searchIndex));

// 5. Remove from queue & update state timestamp
fs.unlinkSync(nextFilePath);
fs.writeFileSync(
  STATE_PATH,
  JSON.stringify(
    {
      lastPublishedAt: Date.now(),
      lastPublishedIso: now.toISOString(),
      lastPublishedSlug: post.slug,
      remainingInQueue: queueFiles.length - 1,
    },
    null,
    2
  )
);

console.log(`🚀 Published: "${post.title}"`);
console.log(`🔗 URL: https://minoxidil-usa.com/${post.category}/${post.slug}/`);
console.log(`📋 Remaining in queue: ${queueFiles.length - 1}`);
