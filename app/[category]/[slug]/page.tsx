import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import YouMinoxSpotlight from '@/components/YouMinoxSpotlight';
import AdSenseUnit from '@/components/AdSenseUnit';

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'content', 'index.json');
  if (!fs.existsSync(filePath)) return [];

  const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return posts.map((post: any) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const postPath = path.join(process.cwd(), 'content', 'posts', `${slug}.json`);
  if (!fs.existsSync(postPath)) return {};

  const post = JSON.parse(fs.readFileSync(postPath, 'utf8'));
  if (post.category !== category) return {};

  const seoTitle = post.seoTitle || post.title;
  const description =
    post.excerpt?.substring(0, 158) ||
    `Complete US clinical guide on ${post.title}. Learn how Minoxidil works for hair and beard growth with You Minox.`;

  const imageUrl = post.featuredImage
    ? post.featuredImage.startsWith('/')
      ? `https://minoxidil-usa.com${post.featuredImage}`
      : post.featuredImage
    : 'https://minoxidil-usa.com/images/brand/you-minox.webp';

  return {
    title: seoTitle,
    description,
    alternates: {
      canonical: `https://minoxidil-usa.com/${category}/${slug}/`,
    },
    openGraph: {
      title: seoTitle,
      description,
      url: `https://minoxidil-usa.com/${category}/${slug}/`,
      type: 'article',
      publishedTime: post.date,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 500,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      siteName: 'Minoxidil USA',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Splits article HTML after the 2nd <h2> section so we can place a high-viewability
 * mid-article AdSense unit and Clinical Comparison Table right in the middle of the reading experience.
 */
function splitContentForMidAd(html: string): [string, string] {
  const h2Matches = Array.from(html.matchAll(/<h2[^>]*>/gi));
  if (h2Matches.length >= 3 && h2Matches[2].index !== undefined) {
    const splitIdx = h2Matches[2].index;
    return [html.slice(0, splitIdx), html.slice(splitIdx)];
  }
  return [html, ''];
}

function hashSlug(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const postPath = path.join(process.cwd(), 'content', 'posts', `${slug}.json`);
  if (!fs.existsSync(postPath)) return notFound();

  const post = JSON.parse(fs.readFileSync(postPath, 'utf8'));
  if (post.category !== category) return notFound();

  // Smart Internal Linking: prioritize Search Console Power Pages & High-Impression Guides
  const indexPath = path.join(process.cwd(), 'content', 'index.json');
  let relatedPosts: any[] = [];
  let sidebarPosts: any[] = [];
  let powerHubPosts: any[] = [];

  if (fs.existsSync(indexPath)) {
    const allPosts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const seed = hashSlug(slug);

    // Sort same-category posts by Power Page & GSC impressions
    const sameCategory = allPosts
      .filter((p: any) => p.category === category && p.slug !== slug)
      .sort((a: any, b: any) => {
        const scoreA = (a.isPowerPage ? 5000 : 0) + (a.gscImpressions || 0);
        const scoreB = (b.isPowerPage ? 5000 : 0) + (b.gscImpressions || 0);
        return scoreB - scoreA;
      });

    // Top pool of category power pages rotated deterministically by slug seed
    const catPool = sameCategory.slice(0, Math.min(20, sameCategory.length));
    const startIdx = catPool.length > 0 ? seed % catPool.length : 0;
    const rotatedCat: any[] = [];
    for (let i = 0; i < catPool.length; i++) {
      rotatedCat.push(catPool[(startIdx + i) % catPool.length]);
    }

    sidebarPosts = rotatedCat.slice(0, 5);
    relatedPosts = rotatedCat.slice(5, 9);
    if (relatedPosts.length < 4) {
      relatedPosts = sameCategory.slice(0, 4);
    }

    // Cross-category Power Hub (top 65 GSC Power Pages across the entire site)
    const allPowerPages = allPosts.filter(
      (p: any) => p.isPowerPage && p.slug !== slug
    );
    if (allPowerPages.length > 0) {
      const hubStart = seed % allPowerPages.length;
      for (let i = 0; i < Math.min(6, allPowerPages.length); i++) {
        powerHubPosts.push(allPowerPages[(hubStart + i * 3) % allPowerPages.length]);
      }
    }
  }

  const imageUrl = post.featuredImage
    ? post.featuredImage.startsWith('/')
      ? `https://minoxidil-usa.com${post.featuredImage}`
      : post.featuredImage
    : 'https://minoxidil-usa.com/images/brand/you-minox.webp';

  const [firstHalfContent, secondHalfContent] = splitContentForMidAd(post.content || '');
  const toc: Array<{ id: string; text: string }> = post.toc || [];
  const faqs: Array<{ question: string; answer: string }> = post.faqs || [];
  const clinicalTable: { title: string; headers: string[]; rows: string[][] } | undefined =
    post.clinicalTable;

  // Combined Article + FAQPage Schema.org JSON-LD for Google Rich Results
  const graphSchemas: any[] = [
    {
      '@type': 'Article',
      '@id': `https://minoxidil-usa.com/${category}/${slug}/#article`,
      headline: post.seoTitle || post.title,
      description: post.excerpt,
      image: [imageUrl],
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: 'en-US',
      author: {
        '@type': 'Person',
        name: 'Charlie Lingan',
        url: 'https://youminox.com/',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Minoxidil USA — Powered by You Minox',
        url: 'https://minoxidil-usa.com/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://minoxidil-usa.com/images/brand/minoxidil-usa-logo.webp',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://minoxidil-usa.com/${category}/${slug}/`,
      },
    },
  ];

  if (faqs.length > 0) {
    graphSchemas.push({
      '@type': 'FAQPage',
      '@id': `https://minoxidil-usa.com/${category}/${slug}/#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  const jsonLdPayload = {
    '@context': 'https://schema.org',
    '@graph': graphSchemas,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPayload) }}
      />

      {/* Breadcrumbs with Schema.org BreadcrumbList */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: post.categoryName, href: `/${category}/` },
          { label: post.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-4">
        {/* Main Article Column (8 cols) */}
        <article className="lg:col-span-8 min-w-0">
          {/* Article Header */}
          <div className="mb-7">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link
                href={`/${category}/`}
                className="inline-block bg-primary-50 text-primary-800 border border-primary-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold hover:bg-primary-100 transition-colors"
              >
                {post.categoryName}
              </Link>
              {post.readingTime && (
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  ⏱️ {post.readingTime} min read
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                ✓ Medically Reviewed Guide (USA)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 mb-5 leading-[1.15] tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200/80 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brand/charlie-lingan.webp"
                  alt="Charlie Lingan"
                  width={42}
                  height={42}
                  className="w-10 h-10 rounded-full object-cover border border-primary-300"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    By Charlie Lingan &bull;{' '}
                    <a
                      href="https://youminox.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-700 hover:underline"
                    >
                      YouMinox.com
                    </a>
                  </div>
                  <time className="text-xs text-slate-500" dateTime={post.date}>
                    Updated{' '}
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </div>

              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Try Cream-Based Minoxidil ↗
              </a>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage}
                alt={post.title}
                width={800}
                height={500}
                className="w-full h-auto object-cover max-h-[480px]"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          )}

          {/* AdSense Slot #1: Above the Fold / Below Featured Image (Highest Viewability & CPC) */}
          <AdSenseUnit format="auto" minHeight="250px" label="Sponsored Advertisement" />

          {/* Clinical Quick Answer Box (Targets Google Position #0 Featured Snippet) */}
          {post.quickAnswer && (
            <div className="my-6 bg-gradient-to-br from-emerald-50/90 via-white to-primary-50/60 border-l-4 border-primary-600 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary-800 mb-2">
                <span>⚡</span>
                <span>Clinical Quick Answer (Key Takeaway)</span>
              </div>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                {post.quickAnswer}
              </p>
            </div>
          )}

          {/* Interactive Table of Contents (Enables Google Jump-to Sitelinks in SERPs) */}
          {toc.length >= 2 && (
            <nav
              aria-label="Table of Contents"
              className="my-7 bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base sm:text-lg mb-3">
                <span className="text-primary-600">📑</span>
                <span>Table of Contents (Quick Jump)</span>
              </div>
              <ol className="space-y-2 text-sm sm:text-base">
                {toc.map((item, idx) => (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <span className="font-bold text-primary-600 min-w-[20px]">{idx + 1}.</span>
                    <a
                      href={`#${item.id}`}
                      className="text-slate-700 hover:text-primary-700 font-medium hover:underline transition-colors"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Article Body Part 1 */}
          <div
            className={`article-content prose prose-lg max-w-none bg-white p-6 sm:p-10 ${
              secondHalfContent ? 'rounded-t-2xl border-b-0' : 'rounded-2xl mb-8'
            } border border-slate-200/80 shadow-sm`}
            dangerouslySetInnerHTML={{ __html: firstHalfContent }}
          />

          {/* Clinical Data Table (Captures Google Table Snippets & Increases Time on Page) */}
          {clinicalTable && (
            <div className="bg-white px-6 sm:px-10 py-4 border-x border-slate-200/80">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white px-4 py-3 text-sm sm:text-base font-extrabold flex items-center justify-between">
                  <span>📊 {clinicalTable.title}</span>
                  <span className="text-[11px] font-semibold text-primary-300 uppercase tracking-wider">
                    US Clinical Standard
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                        {clinicalTable.headers.map((h, i) => (
                          <th key={i} className="py-3 px-4 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {clinicalTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-3 px-4 ${
                                cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-700'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AdSense Slot #2: Mid-Article In-Content Placement */}
          {secondHalfContent && (
            <>
              <div className="bg-white px-6 sm:px-10 py-2 border-x border-slate-200/80">
                <AdSenseUnit
                  format="fluid"
                  layout="in-article"
                  minHeight="250px"
                  className="my-4"
                />
              </div>
              <div
                className="article-content prose prose-lg max-w-none bg-white p-6 sm:p-10 pt-4 rounded-b-2xl border border-t-0 border-slate-200/80 shadow-sm mb-8"
                dangerouslySetInnerHTML={{ __html: secondHalfContent }}
              />
            </>
          )}

          {/* Visible FAQ Accordion Section (Matches FAQPage Schema 100%) */}
          {faqs.length > 0 && (
            <section
              aria-label="Frequently Asked Questions"
              className="my-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-2xl">❓</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Frequently Asked Questions (Clinical FAQ)
                </h2>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* You Minox Official Brand Recommendation Box */}
          <YouMinoxSpotlight variant="article" />

          {/* AdSense Slot #3: End of Article */}
          <AdSenseUnit format="auto" minHeight="280px" />

          {/* Internal PageRank Hub: Links directly to Top Search Console Power Pages */}
          {powerHubPosts.length > 0 && (
            <section className="mt-10 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <span>🇺🇸</span>
                  <span>Most Searched Minoxidil Clinical Guides in the USA</span>
                </h2>
                <span className="text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  Essential Reading
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {powerHubPosts.map((pp: any) => (
                  <Link
                    key={pp.slug}
                    href={`/${pp.category}/${pp.slug}/`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                  >
                    <span className="text-primary-400 font-extrabold text-sm">→</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-primary-300 line-clamp-2 leading-snug">
                      {pp.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sticky Sidebar Column (4 cols) — High Desktop RPM + You Minox Funnel */}
        <aside className="lg:col-span-4 space-y-8">
          {/* You Minox Product Card */}
          <div className="bg-gradient-to-b from-slate-900 to-primary-950 text-white rounded-2xl p-6 shadow-xl border border-primary-500/30">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-400/30 mb-3">
              #1 Recommended Formula
            </span>
            <div className="bg-white rounded-xl p-3 mb-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/you-minox.webp"
                alt="You Minox Cream-Based Minoxidil"
                width={240}
                height={188}
                loading="lazy"
                className="w-40 h-auto object-contain"
              />
            </div>
            <h3 className="text-xl font-extrabold mb-2">
              Upgrade to Cream-Based Minoxidil
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Stop scalp &amp; beard flaking caused by harsh liquid alcohol. Experience smooth, irritation-free growth with <strong>You Minox</strong>.
            </p>
            <ul className="text-xs text-primary-200 space-y-1.5 mb-5">
              <li>✓ Zero Propylene Glycol Irritation</li>
              <li>✓ Ideal for Patchy Beards &amp; Scalps</li>
              <li>✓ Trusted by 600,000+ Followers</li>
            </ul>
            <a
              href="https://youminox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-slate-950 font-extrabold py-3 px-5 rounded-xl text-sm shadow-lg transition-all"
            >
              Shop at YouMinox.com ↗
            </a>
          </div>

          {/* Trending Power Pages in Category Box (Increases Pages/Session & Ad Impressions) */}
          {sidebarPosts.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                🔥 Most Read in {post.categoryName}
              </h3>
              <ul className="space-y-4">
                {sidebarPosts.map((sp: any) => (
                  <li key={sp.slug}>
                    <Link
                      href={`/${sp.category}/${sp.slug}/`}
                      className="flex items-start gap-3 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sp.featuredImage || '/images/brand/you-minox.webp'}
                        alt={sp.title}
                        width={80}
                        height={56}
                        loading="lazy"
                        className="w-20 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-100 group-hover:opacity-90 transition-opacity"
                      />
                      <span className="text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
                        {sp.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sticky Desktop AdSense Unit (High Viewability) */}
          <div className="sticky top-28">
            <AdSenseUnit format="auto" minHeight="300px" label="Sponsored" className="my-0" />
          </div>
        </aside>
      </div>

      {/* Related Articles Grid (Like Recetasdeperu.com) */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              You Might Also Like
            </h2>
            <Link
              href={`/${category}/`}
              className="text-sm font-bold text-primary-700 hover:text-primary-900"
            >
              More in {post.categoryName} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedPosts.map((rp: any) => (
              <ArticleCard key={rp.slug} post={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
