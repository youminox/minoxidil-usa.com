import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Minoxidil USA — #1 Guide to Hair & Beard Regrowth | Powered by You Minox',
    template: '%s | Minoxidil USA',
  },
  description:
    'Learn everything about Minoxidil in the USA: how it works, cream-based vs liquid formulas, beard growth routines, side effects, and clinical comparisons. Created by You Minox (youminox.com).',
  metadataBase: new URL('https://minoxidil-usa.com'),
  alternates: {
    canonical: 'https://minoxidil-usa.com/',
  },
  openGraph: {
    locale: 'en_US',
    type: 'website',
    siteName: 'Minoxidil USA',
    url: 'https://minoxidil-usa.com/',
    title: 'Minoxidil USA — Hair & Beard Growth Knowledge Hub by You Minox',
    description:
      'Explore 1,252+ science-backed guides on Minoxidil for hair and beard growth, side effects, usage, and product comparisons. Sponsored by You Minox (youminox.com).',
    images: [
      {
        url: 'https://minoxidil-usa.com/images/brand/you-minox.webp',
        width: 600,
        height: 472,
        alt: 'Minoxidil USA - Powered by You Minox',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1070738569472471"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-sans flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-[96px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
