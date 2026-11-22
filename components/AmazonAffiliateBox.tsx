'use client';

import { useEffect, useState } from 'react';
import {
  AmazonProductRecommendation,
  AmazonStoreRegion,
  buildAmazonUrl,
  detectUserAmazonRegion,
} from '@/lib/amazon';

interface AmazonAffiliateBoxProps {
  variant: 'inline' | 'showcase' | 'sidebar';
  sectionTitle: string;
  sectionSubtitle: string;
  products: [
    AmazonProductRecommendation,
    AmazonProductRecommendation,
    AmazonProductRecommendation,
  ];
}

function CategoryIcon({
  type,
}: {
  type: AmazonProductRecommendation['categoryType'];
}) {
  const iconEmoji =
    type === 'microneedling'
      ? '⚡'
      : type === 'shampoo'
      ? '🚿'
      : type === 'beard'
      ? '🧔'
      : type === 'supplement'
      ? '💊'
      : type === 'applicator'
      ? '🎯'
      : type === 'skincare'
      ? '🧴'
      : '⭐';

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 border border-amber-300/70 text-2xl shadow-2xs">
      <span aria-hidden="true">{iconEmoji}</span>
    </div>
  );
}

export default function AmazonAffiliateBox({
  variant,
  sectionTitle,
  sectionSubtitle,
  products,
}: AmazonAffiliateBoxProps) {
  const [region, setRegion] = useState<AmazonStoreRegion>('US');

  useEffect(() => {
    setRegion(detectUserAmazonRegion());
  }, []);

  const primaryProduct = products[0];
  const storeName = region === 'ES' ? 'Amazon.es' : 'Amazon.com';
  const activeTag = region === 'ES' ? 'minoxidilusa-21' : 'minoxidilusa-20';

  // 1. INLINE VARIANT (Mid-article featured men's grooming product card)
  if (variant === 'inline') {
    const url = buildAmazonUrl(primaryProduct, region);

    return (
      <aside
        aria-label="Featured Men's Grooming Recommendation on Amazon"
        className="my-8 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-br from-[#fffdf9] via-[#fef9ec] to-[#f9f1de] p-5 sm:p-6 shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-extrabold text-amber-950 border border-amber-400/50">
            {primaryProduct.badge}
          </span>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            <span>Store:</span>
            <button
              type="button"
              onClick={() => setRegion('US')}
              className={`px-1.5 py-0.5 rounded-full transition cursor-pointer ${
                region === 'US'
                  ? 'bg-amber-500 text-slate-950 font-extrabold'
                  : 'hover:text-slate-900'
              }`}
              title="Shop on Amazon USA (minoxidilusa-20)"
            >
              🇺🇸 US
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => setRegion('ES')}
              className={`px-1.5 py-0.5 rounded-full transition cursor-pointer ${
                region === 'ES'
                  ? 'bg-amber-500 text-slate-950 font-extrabold'
                  : 'hover:text-slate-900'
              }`}
              title="Shop on Amazon Spain/Europe (minoxidilusa-21)"
            >
              🇪🇸 ES
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <CategoryIcon type={primaryProduct.categoryType} />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {primaryProduct.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {primaryProduct.subtitle}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-amber-600">
                  ★★★★★ {primaryProduct.rating}/5
                </span>
                <span className="text-slate-500 font-medium">
                  ({primaryProduct.reviewsCount} verified ratings)
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  ✓ Fast Prime Shipping on {storeName}
                </span>
              </div>
            </div>
          </div>

          <div className="sm:shrink-0">
            <a
              href={url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-sm transition hover:from-amber-400 hover:to-amber-500 hover:shadow-md"
            >
              <span>{primaryProduct.ctaLabel}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // 2. SIDEBAR VARIANT (Right column on desktop)
  if (variant === 'sidebar') {
    return (
      <div className="rounded-2xl border-2 border-amber-400/70 bg-gradient-to-b from-[#fffdf8] to-[#f9f1e2] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
            🛒 Men&apos;s Grooming on {storeName}
          </span>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => setRegion('US')}
              className={`cursor-pointer ${
                region === 'US' ? 'text-amber-700 font-extrabold underline' : ''
              }`}
            >
              🇺🇸 US
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setRegion('ES')}
              className={`cursor-pointer ${
                region === 'ES' ? 'text-amber-700 font-extrabold underline' : ''
              }`}
            >
              🇪🇸 ES
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {products.slice(0, 2).map((prod) => {
            const url = buildAmazonUrl(prod, region);
            return (
              <div
                key={prod.id}
                className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs"
              >
                <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                  {prod.badge}
                </span>
                <h4 className="mt-1.5 text-xs font-extrabold text-slate-900 leading-snug">
                  {prod.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-amber-600">★★★★★ {prod.rating}</span>
                  <span className="text-slate-400">({prod.reviewsCount})</span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-amber-400"
                >
                  <span>Check on {storeName}</span>
                  <span>↗</span>
                </a>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] text-slate-500 leading-tight text-center">
          Official Amazon Associate Picks ({activeTag}).
        </p>
      </div>
    );
  }

  // 3. SHOWCASE VARIANT (Full 3-product comparison grid)
  return (
    <section
      aria-label="Recommended Men's Hair and Beard Grooming Products on Amazon"
      className="my-10 rounded-3xl border-2 border-amber-400/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#052e22] p-6 sm:p-8 text-white shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-extrabold text-amber-300 border border-amber-400/30">
            🛒 Official Men&apos;s Grooming Picks &bull; Available on {storeName}
          </span>
          <h2 className="mt-2.5 text-xl sm:text-2xl font-extrabold text-white">
            {sectionTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            {sectionSubtitle}
          </p>
        </div>

        {/* Store Switcher (Auto-detected + Manual Override) */}
        <div className="shrink-0 self-start sm:self-center rounded-xl bg-white/10 p-1.5 border border-white/15 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRegion('US')}
              className={`rounded-lg px-2.5 py-1.5 font-bold transition cursor-pointer ${
                region === 'US'
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🇺🇸 Amazon.com
            </button>
            <button
              type="button"
              onClick={() => setRegion('ES')}
              className={`rounded-lg px-2.5 py-1.5 font-bold transition cursor-pointer ${
                region === 'ES'
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🇪🇸 Amazon.es
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {products.map((product, index) => {
          const url = buildAmazonUrl(product, region);
          const isFeatured = index === 0;

          return (
            <div
              key={product.id}
              className={`flex flex-col justify-between rounded-2xl p-5 transition ${
                isFeatured
                  ? 'bg-gradient-to-b from-amber-50 to-white text-slate-900 border-2 border-amber-400 shadow-lg'
                  : 'bg-white/95 text-slate-900 border border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                      isFeatured
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {product.badge}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <CategoryIcon type={product.categoryType} />
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {product.title}
                  </h3>
                </div>

                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  {product.subtitle}
                </p>

                <ul className="mt-3.5 space-y-1.5 border-t border-slate-200/80 pt-3 text-xs text-slate-700">
                  {product.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-extrabold">✓</span>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-600">
                    ★★★★★ {product.rating}/5 ({product.reviewsCount})
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    ✓ Prime
                  </span>
                </div>

                <a
                  href={url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-extrabold transition shadow-xs ${
                    isFeatured
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{product.ctaLabel}</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-[11px] text-slate-400">
        * As an Amazon Associate, Minoxidil-USA.com earns from qualifying purchases at no additional cost to you ({activeTag}).
      </p>
    </section>
  );
}
