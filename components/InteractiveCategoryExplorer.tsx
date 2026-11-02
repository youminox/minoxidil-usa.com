'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArticleCard from './ArticleCard';
import type { Post, Category } from '@/lib/posts';

interface InteractiveCategoryExplorerProps {
  categories: Category[];
  postsByCategory: Record<string, Post[]>;
}

const CATEGORY_ICONS: Record<string, string> = {
  comparison: '⚖️',
  faq: '❓',
  hair: '💇‍♂️',
  'side-effects': '🛡️',
  women: '👩',
  beard: '🧔',
  usage: '💧',
  reviews: '⭐',
  science: '🧬',
};

export default function InteractiveCategoryExplorer({
  categories,
  postsByCategory,
}: InteractiveCategoryExplorerProps) {
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.slug || 'hair');

  const activeCategory = categories.find((c) => c.slug === activeTab) || categories[0];
  const activePosts = postsByCategory[activeTab] || [];

  return (
    <section className="py-20 px-4 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200 mb-3">
            Interactive Topic Explorer
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Browse 1,252+ Guides by Topic
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Select any specialized category below to preview the top clinical and practical guides instantly.
          </p>
        </div>

        {/* Interactive Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {categories.map((cat) => {
            const isActive = cat.slug === activeTab;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveTab(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                <span>{CATEGORY_ICONS[cat.slug] || '📘'}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Description Banner */}
        {activeCategory && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-2xl flex items-center justify-center flex-shrink-0">
                {CATEGORY_ICONS[activeCategory.slug] || '📘'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {activeCategory.name} Guides ({activeCategory.count} Articles)
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {activeCategory.description}
                </p>
              </div>
            </div>
            <Link
              href={`/${activeCategory.slug}/`}
              className="inline-flex items-center gap-2 bg-white hover:bg-primary-600 text-primary-700 hover:text-white border border-primary-200 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap"
            >
              View All {activeCategory.count} {activeCategory.name} Guides &rarr;
            </Link>
          </div>
        )}

        {/* Filtered Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {activePosts.slice(0, 6).map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
