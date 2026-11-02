import Link from 'next/link';

interface ArticleCardProps {
  post: {
    slug: string;
    title: string;
    category: string;
    categoryName: string;
    date: string;
    readingTime?: number;
    excerpt: string;
    featuredImage: string;
  };
  priority?: boolean;
}

export default function ArticleCard({ post, priority = false }: ArticleCardProps) {
  return (
    <Link
      href={`/${post.category}/${post.slug}/`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-1.5 h-full"
    >
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary-600 via-brand-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.featuredImage || '/images/brand/you-minox.webp'}
          alt={post.title}
          width={800}
          height={500}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent opacity-70" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-primary-800 shadow-sm">
            {post.categoryName}
          </span>
          {post.readingTime && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/75 text-white backdrop-blur-sm">
              {post.readingTime} min read
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5 line-clamp-2 group-hover:text-primary-700 transition-colors leading-snug">
          {post.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
          {post.excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-400 font-medium">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="font-bold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Read Guide
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
