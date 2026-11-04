import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import SearchBar from '@/components/SearchBar';
import YouMinoxSpotlight from '@/components/YouMinoxSpotlight';
import AdSenseUnit from '@/components/AdSenseUnit';

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'content', 'categories.json');
  if (!fs.existsSync(filePath)) return [];
  const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return categories.map((cat: any) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  const filePath = path.join(process.cwd(), 'content', 'categories.json');
  if (!fs.existsSync(filePath)) return {};

  const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const catData = categories.find((c: any) => c.slug === category);

  if (!catData) return {};

  return {
    title: `Minoxidil ${catData.name} Guides (${catData.count} Expert Articles)`,
    description:
      catData.description ||
      `Explore ${catData.count} science-backed guides about Minoxidil ${catData.name} in the USA. Sponsored by You Minox (youminox.com).`,
    alternates: {
      canonical: `https://minoxidil-usa.com/${category}/`,
    },
    openGraph: {
      title: `Minoxidil ${catData.name} Guides | Minoxidil USA`,
      description:
        catData.description ||
        `Explore ${catData.count} science-backed guides about Minoxidil ${catData.name}.`,
      url: `https://minoxidil-usa.com/${category}/`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Minoxidil USA',
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  const categoriesPath = path.join(process.cwd(), 'content', 'categories.json');
  if (!fs.existsSync(categoriesPath)) return notFound();
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const catData = categories.find((c: any) => c.slug === category);

  if (!catData) return notFound();

  const indexPath = path.join(process.cwd(), 'content', 'index.json');
  let categoryPosts: any[] = [];
  if (fs.existsSync(indexPath)) {
    const allPosts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    categoryPosts = allPosts
      .filter((p: any) => p.category === category)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Category Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white py-14 px-4 mb-10">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-400/30 mb-3">
            {catData.count} Specialized Guides &bull; Powered by YouMinox.com
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Minoxidil {catData.name} Guides
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {catData.description}
          </p>
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: catData.name },
          ]}
        />

        <AdSenseUnit format="auto" minHeight="250px" />

        {categoryPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {categoryPosts.map((post: any, idx: number) => (
              <ArticleCard key={post.slug} post={post} priority={idx < 3} />
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No articles found in this category.</p>
        )}

        <div className="mt-16">
          <YouMinoxSpotlight variant="article" />
        </div>
      </div>
    </div>
  );
}
