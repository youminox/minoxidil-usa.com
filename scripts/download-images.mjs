/**
 * Download all featured images and brand assets from WordPress and convert directly to WebP (max 800px, q80).
 * Updates content/posts/*.json and content/index.json to point to /images/posts/{slug}.webp.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const POSTS_DIR = join(ROOT, 'content', 'posts');
const IMAGES_DIR = join(ROOT, 'public', 'images', 'posts');
const BRAND_DIR = join(ROOT, 'public', 'images', 'brand');
const INDEX_PATH = join(ROOT, 'content', 'index.json');

const CONCURRENCY = 20;
const TIMEOUT_MS = 20000;
const MAX_RETRIES = 3;

[IMAGES_DIR, BRAND_DIR].forEach(dir => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

function fetchBuffer(url, retries = 0) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(encodeURI(decodeURI(url)), { timeout: TIMEOUT_MS }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(res.headers.location, retries).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        if (retries < MAX_RETRIES) {
          setTimeout(() => fetchBuffer(url, retries + 1).then(resolve).catch(reject), 800 * (retries + 1));
          return;
        }
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', err => {
        if (retries < MAX_RETRIES) {
          setTimeout(() => fetchBuffer(url, retries + 1).then(resolve).catch(reject), 800 * (retries + 1));
        } else {
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      if (retries < MAX_RETRIES) {
        setTimeout(() => fetchBuffer(url, retries + 1).then(resolve).catch(reject), 800 * (retries + 1));
      } else {
        reject(new Error(`Timeout for ${url}`));
      }
    });

    req.on('error', err => {
      if (retries < MAX_RETRIES) {
        setTimeout(() => fetchBuffer(url, retries + 1).then(resolve).catch(reject), 800 * (retries + 1));
      } else {
        reject(err);
      }
    });
  });
}

// 1. Download Brand Assets
const brandAssets = [
  {
    url: 'https://minoxidil-usa.com/wp-content/uploads/2025/05/cropped-MINOXIDIL-USA.png',
    dest: join(BRAND_DIR, 'minoxidil-usa-logo.webp'),
    width: 534,
  },
  {
    url: 'https://minoxidil-usa.com/wp-content/uploads/2025/05/You-Minox.jpg',
    dest: join(BRAND_DIR, 'you-minox.webp'),
    width: 600,
  },
  {
    url: 'https://minoxidil-usa.com/wp-content/uploads/2025/05/Minoxidil-USA.jpg',
    dest: join(BRAND_DIR, 'charlie-lingan.webp'),
    width: 600,
  },
];

console.log('🌟 Downloading brand assets (You Minox, Charlie Lingan, Logo)...');
for (const asset of brandAssets) {
  try {
    if (!existsSync(asset.dest)) {
      const buf = await fetchBuffer(asset.url);
      await sharp(buf)
        .resize(asset.width, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 85 })
        .toFile(asset.dest);
    }
    console.log(`   ✅ Saved ${asset.dest}`);
  } catch (err) {
    console.error(`   ⚠️ Failed brand asset ${asset.url}:`, err.message);
  }
}

// 2. Collect all post images
console.log('\n📂 Reading post files...');
const postFiles = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
console.log(`   Found ${postFiles.length} posts`);

const downloadQueue = [];
const postsWithoutImage = [];

for (const file of postFiles) {
  const postPath = join(POSTS_DIR, file);
  const post = JSON.parse(readFileSync(postPath, 'utf-8'));

  const localRelPath = `/images/posts/${post.slug}.webp`;
  const localAbsPath = join(IMAGES_DIR, `${post.slug}.webp`);

  if (!post.featuredImage || !post.featuredImage.startsWith('http')) {
    if (!existsSync(localAbsPath)) {
      postsWithoutImage.push({ slug: post.slug, category: post.category, localAbsPath });
    }
    continue;
  }

  downloadQueue.push({
    url: post.featuredImage,
    localAbsPath,
    localRelPath,
    slug: post.slug,
    category: post.category,
  });
}

console.log(`📥 ${downloadQueue.length} post images queued for download & WebP conversion (${CONCURRENCY} concurrent)...\n`);

let completed = 0;
let skipped = 0;
let failed = 0;
const total = downloadQueue.length;
const startTime = Date.now();
const categorySampleImage = {};

async function worker(queue) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;

    try {
      if (existsSync(item.localAbsPath)) {
        skipped++;
        if (!categorySampleImage[item.category]) {
          categorySampleImage[item.category] = item.localAbsPath;
        }
      } else {
        const buffer = await fetchBuffer(item.url);
        await sharp(buffer)
          .resize(800, null, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 80 })
          .toFile(item.localAbsPath);

        if (!categorySampleImage[item.category]) {
          categorySampleImage[item.category] = item.localAbsPath;
        }
      }
      completed++;
      if (completed % 100 === 0 || completed === total) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (completed / Math.max(0.1, parseFloat(elapsed))).toFixed(1);
        console.log(`   ✅ ${completed}/${total} (${skipped} cached, ${failed} failed) — ${rate} img/s — ${elapsed}s`);
      }
    } catch (err) {
      failed++;
      completed++;
      console.log(`   ❌ Failed: ${item.slug} — ${err.message}`);
      postsWithoutImage.push({ slug: item.slug, category: item.category, localAbsPath: item.localAbsPath });
    }
  }
}

const queueCopy = [...downloadQueue];
const workers = Array.from({ length: CONCURRENCY }, () => worker(queueCopy));
await Promise.all(workers);

// 3. Handle any post without a thumbnail by copying a category fallback image
const anyFallback = Object.values(categorySampleImage)[0];
for (const missing of postsWithoutImage) {
  const src = categorySampleImage[missing.category] || anyFallback;
  if (src && existsSync(src) && !existsSync(missing.localAbsPath)) {
    copyFileSync(src, missing.localAbsPath);
    console.log(`   🔄 Assigned category fallback WebP for: ${missing.slug}`);
  }
}

// 4. Update all post JSON files & index.json to point to /images/posts/{slug}.webp
console.log('\n📝 Updating post JSON files and index.json with local .webp paths...');
let updatedPosts = 0;

for (const file of postFiles) {
  const postPath = join(POSTS_DIR, file);
  const post = JSON.parse(readFileSync(postPath, 'utf-8'));
  const webpAbs = join(IMAGES_DIR, `${post.slug}.webp`);
  if (existsSync(webpAbs)) {
    post.featuredImage = `/images/posts/${post.slug}.webp`;
    writeFileSync(postPath, JSON.stringify(post, null, 2));
    updatedPosts++;
  }
}

const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
let updatedIndex = 0;
for (const entry of index) {
  const webpAbs = join(IMAGES_DIR, `${entry.slug}.webp`);
  if (existsSync(webpAbs)) {
    entry.featuredImage = `/images/posts/${entry.slug}.webp`;
    updatedIndex++;
  }
}
writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

console.log(`✅ Updated ${updatedPosts} post files and ${updatedIndex} index entries to .webp!`);
