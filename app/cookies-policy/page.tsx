import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticPage } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Cookies Policy',
  description: 'Cookies Policy for Minoxidil USA (minoxidil-usa.com).',
  alternates: {
    canonical: 'https://minoxidil-usa.com/cookies-policy/',
  },
};

export default function CookiesPolicyPage() {
  const page = getStaticPage('cookies-policy');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cookies Policy' }]} />
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">Cookies Policy</h1>
        <div
          className="article-content prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{
            __html: page?.content || '<p>Cookies Policy for Minoxidil USA.</p>',
          }}
        />
      </div>
    </div>
  );
}
