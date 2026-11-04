/**
 * Deep SEO & CTR Optimization Script for Minoxidil-USA.com:
 * 1. Cleans all 1,262 post excerpts (removes glued H2 headings from the start of excerpts for high-CTR meta descriptions).
 * 2. Adds anchor IDs to all <h2> headings in post.content and extracts a Table of Contents (`toc`) array.
 * 3. Extracts FAQ question/answer pairs (`faqs`) from<h3> headings for Schema.org FAQPage Rich Results.
 * 4. Maps all 160+ legacy URLs from Google Search Console (Páginas.csv) + /wp-sitemap.xml to 301 redirects in vercel.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const INDEX_PATH = path.join(ROOT, 'content', 'index.json');
const VERCEL_JSON_PATH = path.join(ROOT, 'vercel.json');
const GSC_ZIP_PATH =
  '/Users/charlie/.gemini/antigravity/brain/8217db58-01e7-47d9-8a9a-e43b27bcd4fb/.user_uploaded/media_1793800585546_20688fad.zip';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function stripTags(html) {
  return html
    .replace(/<div class="related-inline-card"[\s\S]*?<\/div>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&rarr;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('🚀 Optimizing all post files (Excerpts, TOC anchor IDs, and FAQ Schema extraction)...');

const postFiles = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.json'));
const excerptMap = {};
let totalFaqsExtracted = 0;
let totalTocsExtracted = 0;

for (const file of postFiles) {
  const filePath = path.join(POSTS_DIR, file);
  const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let html = post.content || '';

  // 1. Add id="..." to all <h2> headings & build TOC
  const toc = [];
  const usedIds = new Set();
  html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, innerText) => {
    const cleanText = stripTags(innerText);
    if (!cleanText) return match;
    let id = slugify(cleanText) || 'section';
    if (usedIds.has(id)) {
      let counter = 2;
      while (usedIds.has(`${id}-${counter}`)) counter++;
      id = `${id}-${counter}`;
    }
    usedIds.add(id);
    toc.push({ id, text: cleanText });

    // Remove existing id attribute if any
    const cleanedAttrs = attrs.replace(/\s*id=['"][^'"]*['"]/gi, '');
    return `<h2${cleanedAttrs} id="${id}">${innerText}</h2>`;
  });

  if (toc.length > 0) totalTocsExtracted++;

  // 2. Extract FAQ pairs from <h3> questions (especially those ending with '?' or in FAQ section)
  const faqs = [];
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*(?:<p[^>]*>)?([\s\S]*?)(?=<h2|<h3|<div|$)/gi;
  let m;
  while ((m = h3Regex.exec(html)) !== null) {
    const q = stripTags(m[1]);
    const a = stripTags(m[2]).substring(0, 380);
    if (q && a && a.length > 40 && (q.endsWith('?') || /^(how|what|why|when|can|does|is|should|will|are)\b/i.test(q))) {
      faqs.push({ question: q.endsWith('?') ? q : `${q}?`, answer: a });
    }
  }
  if (faqs.length > 0) totalFaqsExtracted += faqs.length;

  // 3. Build a clean, high-CTR excerpt (removing H2/H3 headers before extracting paragraph text)
  const htmlWithoutHeaders = html
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ')
    .replace(/<div class="related-inline-card"[\s\S]*?<\/div>/gi, ' ');
  const cleanBodyText = stripTags(htmlWithoutHeaders);

  // If the post is one of our 10 custom-crafted posts, keep its custom excerpt; otherwise use clean paragraph text
  if (post.excerpt && post.excerpt.includes('?') && !post.excerpt.startsWith('Understanding ')) {
    // Keep custom excerpt if it wasn't glued
  }
  const firstH2Text = toc[0]?.text || '';
  if (firstH2Text && post.excerpt.startsWith(firstH2Text)) {
    post.excerpt = cleanBodyText.substring(0, 160).trim() + '...';
  } else if (/^(Understanding|What is|How Minoxidil|Analyzing|Discover)\b/.test(post.excerpt) && cleanBodyText.length > 60) {
    post.excerpt = cleanBodyText.substring(0, 160).trim() + '...';
  }

  post.content = html;
  post.toc = toc;
  post.faqs = faqs.slice(0, 6);
  excerptMap[post.slug] = post.excerpt;

  fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
}

// Update index.json with cleaned excerpts
const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
for (const entry of indexData) {
  if (excerptMap[entry.slug]) {
    entry.excerpt = excerptMap[entry.slug];
  }
}
fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2));

console.log(`✅ Updated ${postFiles.length} posts with TOCs (${totalTocsExtracted} posts) and ${totalFaqsExtracted} FAQ Schema items!`);

// 4. Generate 301 Redirects for legacy Search Console URLs + /wp-sitemap.xml
console.log('🔗 Building 301 redirects for legacy Google Search Console URLs...');
const redirects = [
  {
    source: '/wp-sitemap.xml',
    destination: '/sitemap.xml',
    permanent: true,
  },
  {
    source: '/sitemap_index.xml',
    destination: '/sitemap.xml',
    permanent: true,
  },
  {
    source: '/category/:slug/',
    destination: '/:slug/',
    permanent: true,
  },
  {
    source: '/category/:slug',
    destination: '/:slug/',
    permanent: true,
  },
];

if (fs.existsSync(GSC_ZIP_PATH)) {
  const pyOut = execFileSync('python3', [
    '-c',
    `
import zipfile, csv, io, json

zpath = "${GSC_ZIP_PATH}"
with zipfile.ZipFile(zpath, "r") as z:
    p_data = list(csv.DictReader(io.StringIO(z.read("Páginas.csv").decode("utf-8"))))

index_posts = json.load(open("content/index.json"))
valid_paths = set("/" + p["category"] + "/" + p["slug"] + "/" for p in index_posts)
static_paths = {"/", "/privacy-policy/", "/terms-and-conditions/", "/cookies-policy/", "/legal-notice/"}
for c in set(p["category"] for p in index_posts):
    static_paths.add("/" + c + "/")

# Build keyword matching per category
by_cat = {}
for p in index_posts:
    by_cat.setdefault(p["category"], []).append(p)

redirects = []
seen_sources = set()

for r in p_data:
    u = r["Páginas principales"].replace("https://minoxidil-usa.com", "")
    if not u.startswith("/"): u = "/" + u
    if not u.endswith("/"): u += "/"
    if u in valid_paths or u in static_paths or u.startswith("/category/"):
        continue
    if u in seen_sources:
        continue
    seen_sources.add(u)

    parts = u.strip("/").split("/")
    if len(parts) == 2:
        cat, old_slug = parts
        old_words = set(old_slug.split("-"))
        candidates = by_cat.get(cat, index_posts)
        best_url = "/" + cat + "/" if cat in by_cat else "/"
        best_score = 0
        for cand in candidates:
            c_words = set(cand["slug"].split("-"))
            score = len(old_words & c_words)
            if score > best_score:
                best_score = score
                best_url = "/" + cand["category"] + "/" + cand["slug"] + "/"
        redirects.append({"source": u, "destination": best_url, "permanent": True})

print(json.dumps(redirects))
`,
  ]).toString();

  const gscRedirects = JSON.parse(pyOut);
  redirects.push(...gscRedirects);
  console.log(`✅ Mapped ${gscRedirects.length} legacy Google Search Console URLs to 301 permanent redirects!`);
}

const vercelConfig = {
  redirects,
  headers: [
    {
      source: '/images/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

fs.writeFileSync(VERCEL_JSON_PATH, JSON.stringify(vercelConfig, null, 2));
console.log(`✅ Wrote ${redirects.length} total redirects to vercel.json!`);
