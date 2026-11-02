import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticPage } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Legal Notice',
  description: 'Legal Notice and Ownership Information for Minoxidil USA (minoxidil-usa.com).',
  alternates: {
    canonical: 'https://minoxidil-usa.com/legal-notice/',
  },
};

export default function LegalNoticePage() {
  const page = getStaticPage('legal-notice');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Legal Notice' }]} />
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">Legal Notice</h1>
        <div
          className="article-content prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{
            __html: page?.content || '<p>Legal Notice for Minoxidil USA.</p>',
          }}
        />
      </div>
    </div>
  );
}
