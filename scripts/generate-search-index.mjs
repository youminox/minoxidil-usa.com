/**
 * Generate a lightweight search index JSON for the interactive SearchBar component.
 * Run: node scripts/generate-search-index.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'content');
const publicDir = path.join(__dirname, '..', 'public');

const indexPath = path.join(contentDir, 'index.json');

if (!fs.existsSync(indexPath)) {
  console.error('❌ content/index.json not found. Run the migration first.');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

const searchIndex = posts.map(post => ({
  slug: post.slug,
  title: post.title,
  category: post.category,
  categoryName: post.categoryName,
}));

const outputPath = path.join(publicDir, 'search-index.json');
fs.writeFileSync(outputPath, JSON.stringify(searchIndex));

const sizeKB = (Buffer.byteLength(JSON.stringify(searchIndex)) / 1024).toFixed(1);
console.log(`✅ Search index generated: ${outputPath} (${searchIndex.length} posts, ${sizeKB} KB)`);
