import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import AmazonAffiliateBox from '@/components/AmazonAffiliateBox';
import { getAmazonContextForCategory } from '@/lib/amazon';
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
  const amazonContext = getAmazonContextForCategory('legal');

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
        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            Amazon Associates Program Disclosure
          </h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            As an Amazon Associate, <strong>Minoxidil USA</strong> (minoxidil-usa.com) earns from
            qualifying purchases at no extra cost to you. Some links published in our clinical
            guides and product reviews direct readers to Amazon.com (Tracking ID:{' '}
            <code>minoxidilusa-20</code>) or Amazon.es (Tracking ID: <code>minoxidilusa-21</code>).
          </p>
        </section>
      </div>
      <AmazonAffiliateBox
        variant="inline"
        sectionTitle={amazonContext.sectionTitle}
        sectionSubtitle={amazonContext.sectionSubtitle}
        products={amazonContext.products}
      />
    </div>
  );
}
