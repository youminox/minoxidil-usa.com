import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticPage } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and Conditions for using Minoxidil USA (minoxidil-usa.com).',
  alternates: {
    canonical: 'https://minoxidil-usa.com/terms-and-conditions/',
  },
};

export default function TermsAndConditionsPage() {
  const page = getStaticPage('terms-and-conditions');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms and Conditions' }]} />
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
          Terms and Conditions
        </h1>
        <div
          className="article-content prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{
            __html: page?.content || '<p>Terms and Conditions for Minoxidil USA.</p>',
          }}
        />
      </div>
    </div>
  );
}
