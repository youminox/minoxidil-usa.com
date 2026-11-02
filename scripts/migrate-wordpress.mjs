/**
 * WordPress XML to JSON Migration Script for Minoxidil-USA.com
 * Parses minoxidilusa.WordPress.2026-11-02.xml and generates:
 * - content/posts/{slug}.json — individual post files with cleaned HTML, inline related cards, and YouTube embeds
 * - content/index.json — lightweight index of all 1,252 posts
 * - content/categories.json — category metadata
 * - content/pages.json — static legal pages (Privacy, Terms, Cookies, Legal Notice)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const XML_PATH = join(ROOT, 'minoxidilusa.WordPress.2026-11-02.xml');
const CONTENT_DIR = join(ROOT, 'content');
const POSTS_DIR = join(CONTENT_DIR, 'posts');

[CONTENT_DIR, POSTS_DIR].forEach(dir => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

console.log('📖 Reading WordPress XML export...');
const xmlData = readFileSync(XML_PATH, 'utf-8');

console.log('🔄 Parsing XML...');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '__cdata',
  isArray: (name) => {
    return ['item', 'category', 'wp:postmeta', 'wp:category', 'wp:term'].includes(name);
  },
});

const parsed = parser.parse(xmlData);
const channel = parsed.rss.channel;
const items = channel.item || [];

console.log(`📦 Found ${items.length} total items in XML`);

// ── Extract categories from XML header ────────────────────────
const wpCategories = channel['wp:category'] || [];
const categoriesMap = {};

const categoryDescriptions = {
  'comparison': 'Side-by-side comparisons of Minoxidil against finasteride, nanoxidil, redensyl, rosemary oil, hair transplants, and more.',
  'faq': 'Clear, science-backed answers to the most frequently asked questions about Minoxidil safety, timelines, and daily use.',
  'hair': 'Complete guides on scalp hair regrowth, Norwood scale stages, shedding phases, and maximizing hair density.',
  'side-effects': 'Honest medical insights on managing dryness, shedding, irritation, and systemic side effects safely.',
  'women': 'Specialized guides on female pattern hair loss, hormonal thinning, hairline restoration, and safe dosages for women.',
  'beard': 'Step-by-step routines to transform patchy facial hair into a thick, full beard using topical and cream-based Minoxidil.',
  'usage': 'Best practices, dosage measurements, derma-rolling routines, and application techniques for optimal absorption.',
  'reviews': 'Unbiased reviews of the best Minoxidil brands, cream formulations, foams, and hair growth serums in the US.',
  'science': 'Deep dives into vasodilation, potassium channels, follicular cellular mechanisms, and clinical studies.',
};

wpCategories.forEach(cat => {
  const slug = extractCdata(cat['wp:category_nicename']);
  const name = extractCdata(cat['wp:cat_name']);
  if (slug && name) {
    categoriesMap[slug] = {
      slug,
      name,
      description: categoryDescriptions[slug] || `Expert articles and guides about Minoxidil ${name.toLowerCase()}.`,
      count: 0,
    };
  }
});

console.log(`📂 Found ${Object.keys(categoriesMap).length} categories`);

// ── Build attachment map (post_id → image URL) ───────────────
console.log('🖼️  Building attachment map...');
const attachmentMap = {};
items.forEach(item => {
  const postType = extractCdata(item['wp:post_type']);
  if (postType === 'attachment') {
    const postId = String(extractCdata(item['wp:post_id']));
    const url = extractCdata(item['wp:attachment_url']);
    if (postId && url) {
      attachmentMap[postId] = url;
    }
  }
});
console.log(`🖼️  Mapped ${Object.keys(attachmentMap).length} attachments`);

// ── Process posts & pages ─────────────────────────────────────
console.log('📝 Processing posts and legal pages...');
const posts = [];
const pages = {};
const slugsSeen = new Set();
let duplicates = 0;
let shortcodesConverted = 0;
let videosConverted = 0;

items.forEach(item => {
  const postType = extractCdata(item['wp:post_type']);
  const status = extractCdata(item['wp:status']);
  const title = decodeEntities(extractCdata(item.title) || '');
  const slug = extractCdata(item['wp:post_name']) || '';
  const rawContent = extractCdata(item['content:encoded']) || '';
  const dateStr = extractCdata(item['wp:post_date']) || '';
  const link = extractCdata(item.link) || '';

  // Extract static legal pages (including Legal Notice draft)
  if (postType === 'page' && slug !== 'home') {
    const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (['privacy-policy', 'terms-and-conditions', 'cookies-policy', 'legal-notice'].includes(pageSlug)) {
      pages[pageSlug] = {
        slug: pageSlug,
        title,
        date: dateStr ? dateStr.split(' ')[0] : '2025-05-21',
        content: cleanWordPressContent(rawContent),
      };
    }
    return;
  }

  // Only process published blog posts
  if (postType !== 'post' || status !== 'publish') return;
  if (!slug) return;

  if (slugsSeen.has(slug)) {
    duplicates++;
    return;
  }
  slugsSeen.add(slug);

  // Extract category from item
  let category = 'hair';
  let categoryName = 'Hair';

  const cats = item.category;
  if (cats) {
    const catArray = Array.isArray(cats) ? cats : [cats];
    const mainCat = catArray.find(c =>
      c['@_domain'] === 'category' && c['@_nicename']
    );
    if (mainCat) {
      category = mainCat['@_nicename'];
      categoryName = decodeEntities(extractCdata(mainCat) || mainCat['#text'] || category);
    }
  }

  // Fallback category from URL
  if (typeof link === 'string') {
    const urlMatch = link.match(/minoxidil-usa\.com\/([^/]+)\/[^/]+\/?$/);
    if (urlMatch && urlMatch[1] !== slug && categoriesMap[urlMatch[1]]) {
      category = urlMatch[1];
      categoryName = categoriesMap[category].name;
    }
  }

  // Get featured image URL from _thumbnail_id
  let featuredImage = '';
  const postMeta = item['wp:postmeta'];
  if (postMeta) {
    const metaArray = Array.isArray(postMeta) ? postMeta : [postMeta];
    const thumbnailMeta = metaArray.find(m =>
      extractCdata(m['wp:meta_key']) === '_thumbnail_id'
    );
    if (thumbnailMeta) {
      const thumbnailId = String(extractCdata(thumbnailMeta['wp:meta_value']));
      if (thumbnailId && attachmentMap[thumbnailId]) {
        featuredImage = attachmentMap[thumbnailId];
      }
    }
  }

  // Clean content, convert [aib_post_related] shortcodes and YouTube video containers
  const { html: cleanedContent, scCount, vidCount } = transformPostContent(rawContent);
  shortcodesConverted += scCount;
  videosConverted += vidCount;

  // Generate clean excerpt
  const plainText = stripHtml(cleanedContent);
  const excerpt = plainText.substring(0, 185).trim() + (plainText.length > 185 ? '...' : '');

  // Parse date
  const date = dateStr ? dateStr.split(' ')[0] : '2025-05-21';

  // Estimate reading time
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(3, Math.ceil(wordCount / 200));

  if (categoriesMap[category]) {
    categoriesMap[category].count++;
  } else {
    categoriesMap[category] = {
      slug: category,
      name: categoryName,
      description: `Expert articles and guides about Minoxidil ${categoryName.toLowerCase()}.`,
      count: 1,
    };
  }

  posts.push({
    slug,
    title,
    category,
    categoryName,
    date,
    readingTime,
    excerpt,
    featuredImage,
    content: cleanedContent,
  });
});

console.log(`✅ Processed ${posts.length} published posts (${duplicates} duplicates skipped)`);
console.log(`🔗 Converted ${shortcodesConverted} [aib_post_related] internal link cards`);
console.log(`🎬 Converted ${videosConverted} YouTube video embeds`);
console.log(`📄 Extracted ${Object.keys(pages).length} static legal pages:`, Object.keys(pages).join(', '));

// Sort posts by date (newest first)
posts.sort((a, b) => b.date.localeCompare(a.date));

// Write individual post JSON files
console.log('💾 Writing individual post JSON files...');
posts.forEach((post, i) => {
  const filePath = join(POSTS_DIR, `${post.slug}.json`);
  writeFileSync(filePath, JSON.stringify(post, null, 2));
  if ((i + 1) % 400 === 0) {
    console.log(`   ...wrote ${i + 1}/${posts.length} posts`);
  }
});

// Write index.json (without full HTML content)
const index = posts.map(({ content, ...rest }) => rest);
writeFileSync(join(CONTENT_DIR, 'index.json'), JSON.stringify(index, null, 2));

// Write categories.json
const categoriesList = Object.values(categoriesMap)
  .filter(c => c.count > 0)
  .sort((a, b) => b.count - a.count);
writeFileSync(join(CONTENT_DIR, 'categories.json'), JSON.stringify(categoriesList, null, 2));

// Write pages.json
writeFileSync(join(CONTENT_DIR, 'pages.json'), JSON.stringify(pages, null, 2));

console.log('\n✨ Migration complete!');
categoriesList.forEach(cat => {
  console.log(`   ${cat.name} (/${cat.slug}/): ${cat.count} posts`);
});

// ── Helper functions ──────────────────────────────────────────

function extractCdata(node) {
  if (node === undefined || node === null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (node.__cdata !== undefined) {
    if (typeof node.__cdata === 'string') return node.__cdata;
    if (Array.isArray(node.__cdata)) return node.__cdata.join('');
    return String(node.__cdata);
  }
  if (node['#text'] !== undefined) return String(node['#text']);
  return '';
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function stripHtml(html) {
  return html
    .replace(/<div class="related-inline-card"[\s\S]*?<\/div>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&rarr;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanWordPressContent(html) {
  return html
    .replace(/<!-- wp:[^>]*-->/g, '')
    .replace(/<!-- \/wp:[^>]*-->/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function transformPostContent(rawHtml) {
  let html = cleanWordPressContent(rawHtml);
  let scCount = 0;
  let vidCount = 0;

  // 1. Convert [aib_post_related url='...' title='...' relatedtext='...']
  const shortcodeRegex = /\[aib_post_related\s+url=['"](.*?)['"]\s+title=['"](.*?)['"]\s+relatedtext=['"](.*?)['"]\s*\]/g;
  html = html.replace(shortcodeRegex, (match, url, title) => {
    scCount++;
    let cleanUrl = url.trim().replace(/^https?:\/\/minoxidil-usa\.com/i, '');
    if (!cleanUrl.startsWith('/')) cleanUrl = '/' + cleanUrl;
    if (!cleanUrl.endsWith('/')) cleanUrl = cleanUrl + '/';

    return `<div class="related-inline-card" style="background:#ecfdf5;border-left:4px solid #059669;padding:16px 20px;margin:24px 0;border-radius:10px;">
<p style="font-size:13px;color:#065f46;margin:0 0 6px 0;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;">You might also be interested in:</p>
<a href="${cleanUrl}" style="color:#059669;font-weight:700;text-decoration:none;font-size:16px;">${decodeEntities(title)} &rarr;</a>
</div>`;
  });

  // 2. Convert <div id='video-container' data-video-id='...'>...</div>
  const videoRegex = /<div[^>]*id=['"]video-container['"][^>]*data-video-id=['"]([a-zA-Z0-9_-]+)['"][^>]*>[\s\S]*?<\/noscript>\s*<\/div>/gi;
  html = html.replace(videoRegex, (match, videoId) => {
    vidCount++;
    return `<div class="video-embed-container" style="position:relative;width:100%;max-width:680px;margin:28px auto;aspect-ratio:16/9;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.12);background:#0f172a;">
<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="Minoxidil Video Guide" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>`;
  });

  return { html, scCount, vidCount };
}
