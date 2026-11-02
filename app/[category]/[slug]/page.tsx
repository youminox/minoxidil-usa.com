import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import YouMinoxSpotlight from '@/components/YouMinoxSpotlight';

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

  const description =
    post.excerpt?.substring(0, 158) ||
    `Complete guide on ${post.title}. Learn how Minoxidil works for hair and beard growth with You Minox.`;

  const imageUrl = post.featuredImage
    ? post.featuredImage.startsWith('/')
      ? `https://minoxidil-usa.com${post.featuredImage}`
      : post.featuredImage
    : 'https://minoxidil-usa.com/images/brand/you-minox.webp';

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `https://minoxidil-usa.com/${category}/${slug}/`,
    },
    openGraph: {
      title: post.title,
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
      title: post.title,
      description,
      images: [imageUrl],
    },
  };
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

  // Related articles from same category
  const indexPath = path.join(process.cwd(), 'content', 'index.json');
  let relatedPosts: any[] = [];
  if (fs.existsSync(indexPath)) {
    const allPosts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    relatedPosts = allPosts
      .filter((p: any) => p.category === category && p.slug !== slug)
      .slice(0, 4);
  }

  const imageUrl = post.featuredImage
    ? post.featuredImage.startsWith('/')
      ? `https://minoxidil-usa.com${post.featuredImage}`
      : post.featuredImage
    : 'https://minoxidil-usa.com/images/brand/you-minox.webp';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
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
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Breadcrumbs with Schema.org BreadcrumbList */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: post.categoryName, href: `/${category}/` },
          { label: post.title },
        ]}
      />

      {/* Article Header */}
      <div className="mb-8 mt-4">
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
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight tracking-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200/80 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/charlie-lingan.webp"
              alt="Charlie Lingan"
              width={40}
              height={40}
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
                Published on{' '}
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
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary-50 text-primary-800 hover:bg-primary-100 px-3.5 py-2 rounded-xl border border-primary-200 transition-colors"
          >
            Sponsored by You Minox ↗
          </a>
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-lg bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featuredImage}
            alt={post.title}
            width={800}
            height={500}
            className="w-full h-auto object-cover max-h-[500px]"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      )}

      {/* Article Body Content (includes inline "You might also be interested in:" cards & YouTube videos) */}
      <div
        className="article-content prose prose-lg max-w-none mb-12 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* You Minox Official Brand Recommendation Box */}
      <YouMinoxSpotlight variant="article" />

      {/* Google AdSense Placement with reserved height to prevent CLS */}
      <div className="my-8 flex flex-col items-center bg-white py-4 border border-slate-200/80 rounded-2xl min-h-[280px]">
        <p className="text-xs text-slate-400 mb-2 text-center w-full block uppercase tracking-wider">
          Advertisement
        </p>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center', width: '100%' } as React.CSSProperties}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-1070738569472471"
        />
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
    </article>
  );
}
