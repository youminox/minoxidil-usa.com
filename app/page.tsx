import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import InteractiveCategoryExplorer from '@/components/InteractiveCategoryExplorer';
import YouMinoxSpotlight from '@/components/YouMinoxSpotlight';
import AdSenseUnit from '@/components/AdSenseUnit';
import { getAllPosts, getCategories, Post } from '@/lib/posts';

const CATEGORY_META: Record<string, { icon: string; badge: string }> = {
  comparison: { icon: '⚖️', badge: 'Most Popular' },
  faq: { icon: '❓', badge: 'Quick Answers' },
  hair: { icon: '💇‍♂️', badge: 'Scalp Regrowth' },
  'side-effects': { icon: '🛡️', badge: 'Safety First' },
  women: { icon: '👩', badge: 'Female Regrowth' },
  beard: { icon: '🧔', badge: 'Facial Hair' },
  usage: { icon: '💧', badge: 'Step-by-Step' },
  reviews: { icon: '⭐', badge: 'Top Rated' },
  science: { icon: '🧬', badge: 'Clinical Data' },
};

export default function HomePage() {
  const posts = getAllPosts();
  const categories = getCategories();

  const editorsPicks = posts.slice(0, 6);
  const beardGuides = posts.filter((p) => p.category === 'beard').slice(0, 4);
  const hairAndWomenGuides = posts
    .filter((p) => p.category === 'hair' || p.category === 'women')
    .slice(0, 4);

  // Build map of top 6 posts per category for the InteractiveCategoryExplorer
  const postsByCategory: Record<string, Post[]> = {};
  categories.forEach((cat) => {
    postsByCategory[cat.slug] = posts.filter((p) => p.category === cat.slug).slice(0, 6);
  });

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://minoxidil-usa.com/#website',
        name: 'Minoxidil USA',
        url: 'https://minoxidil-usa.com/',
        description:
          'Learn everything about Minoxidil USA: how it works, benefits, side effects, and the best cream-based products by You Minox for hair and beard growth.',
        inLanguage: 'en-US',
        publisher: {
          '@id': 'https://minoxidil-usa.com/#organization',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://minoxidil-usa.com/#organization',
        name: 'Minoxidil USA — Powered by You Minox',
        url: 'https://minoxidil-usa.com/',
        sameAs: ['https://youminox.com/'],
        founder: {
          '@type': 'Person',
          name: 'Charlie Lingan',
        },
        sponsor: {
          '@type': 'Organization',
          name: 'You Minox',
          url: 'https://youminox.com/',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Interactive Modern Hero Section */}
      <section
        className="relative py-20 md:py-28 px-4 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #0f766e 85%, #0f172a 100%)',
        }}
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 25%, rgba(52, 211, 153, 0.22) 0%, transparent 65%)',
          }}
        />
        <div className="hero-bubbles">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="hero-bubble" />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Brand Attribution Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs sm:text-sm text-white mb-6 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <span>🇺🇸 #1 US Hair &amp; Beard Knowledge Hub</span>
            <span className="text-white/40">&bull;</span>
            <span>
              Created by{' '}
              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-primary-300 hover:text-white underline decoration-primary-400"
              >
                You Minox (youminox.com)
              </a>
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.12]">
            The Ultimate US Guide to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-emerald-200 to-teal-300">
              Minoxidil Hair &amp; Beard Growth
            </span>
          </h1>

          <p className="text-slate-200 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Explore <strong className="text-white">1,252+ clinical &amp; practical articles</strong> on scalp regrowth, beard enhancement, cream-based vs. liquid formulations, dosages, and side effect prevention—proudly powered by{' '}
            <a
              href="https://youminox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 font-semibold underline hover:text-white"
            >
              You Minox
            </a>
            .
          </p>

          {/* Instant Live Search Bar */}
          <SearchBar />
        </div>
      </section>

      {/* Interactive Stats Bar */}
      <section className="bg-white border-b border-slate-200/80 py-10 px-4 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary-700 mb-1">1,252+</div>
            <div className="text-slate-500 uppercase tracking-wider text-xs font-bold">
              In-Depth Guides
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary-700 mb-1">9</div>
            <div className="text-slate-500 uppercase tracking-wider text-xs font-bold">
              Specialized Categories
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary-700 mb-1">600K+</div>
            <div className="text-slate-500 uppercase tracking-wider text-xs font-bold">
              You Minox Followers
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-primary-50/80 border border-primary-100">
            <a
              href="https://youminox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-800 group-hover:text-primary-600 transition-colors mb-1">
                YouMinox.com ↗
              </div>
              <div className="text-primary-700 uppercase tracking-wider text-xs font-bold">
                Official Brand Sponsor
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Editor's Picks Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-800 mb-3">
                Editor&apos;s Picks
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Essential Minoxidil Guides for Men &amp; Women
              </h2>
            </div>
            <Link
              href="/hair/"
              className="inline-flex items-center gap-1.5 text-primary-700 font-bold hover:text-primary-900 transition-colors"
            >
              Explore Hair Regrowth Guides &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {editorsPicks.map((post, index) => (
              <ArticleCard key={post.slug} post={post} priority={index < 3} />
            ))}
          </div>

          <div className="mt-12">
            <AdSenseUnit format="auto" minHeight="250px" />
          </div>
        </div>
      </section>

      {/* Flagship You Minox & Charlie Lingan Brand Spotlight */}
      <YouMinoxSpotlight variant="home" />

      {/* Interactive Category Explorer with Live Filtering Tabs */}
      <InteractiveCategoryExplorer
        categories={categories}
        postsByCategory={postsByCategory}
      />

      {/* All 9 Categories Grid */}
      <section className="py-20 px-4 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Explore All 9 Knowledge Hubs
            </h2>
            <p className="text-slate-600 text-base md:text-lg">
              Every aspect of Minoxidil therapy organized by goal, safety profile, and clinical evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.slug] || { icon: '📘', badge: 'Guides' };
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}/`}
                  className="card-hover bg-white p-6 rounded-2xl border border-slate-200/90 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {meta.icon}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary-100 group-hover:text-primary-800 transition-colors">
                        {cat.count} Articles
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {cat.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-700">
                    <span>{meta.badge}</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      Browse {cat.name} &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Beard Growth Special Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-3">
                🧔 Facial Hair Mastery
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Beard Growth with Minoxidil
              </h2>
            </div>
            <Link
              href="/beard/"
              className="inline-flex items-center gap-1.5 text-primary-700 font-bold hover:text-primary-900 transition-colors"
            >
              View All 83 Beard Guides &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {beardGuides.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Hair & Women's Regrowth Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-800 mb-3">
                ✨ Scalp &amp; Female Hair Restoration
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Popular Scalp &amp; Women&apos;s Hair Loss Guides
              </h2>
            </div>
            <Link
              href="/women/"
              className="inline-flex items-center gap-1.5 text-primary-700 font-bold hover:text-primary-900 transition-colors"
            >
              Explore Women&apos;s Guides &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hairAndWomenGuides.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
