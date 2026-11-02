import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand & You Minox Attribution */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-extrabold text-lg">
                M
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                MINOXIDIL <span className="text-primary-400">USA</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The premier US educational resource for hair restoration and beard growth. Explore 1,250+ science-backed guides on topical and cream-based Minoxidil, dosages, comparisons, and safe usage.
            </p>
            <div className="bg-slate-900/90 border border-primary-500/30 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-400 mb-1">
                Created &amp; Powered by You Minox
              </p>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Founded by <strong>Charlie Lingan</strong> and proudly sponsored by{' '}
                <a
                  href="https://youminox.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 font-semibold underline hover:text-primary-300"
                >
                  You Minox (youminox.com)
                </a>{' '}
                to share honest, real experiences about cream-based Minoxidil.
              </p>
              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-primary-400 hover:bg-primary-300 px-3.5 py-2 rounded-lg transition-colors"
              >
                Explore YouMinox.com &rarr;
              </a>
            </div>
          </div>

          {/* Categories Col 1 */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5">
              Main Categories
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/hair/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Hair Regrowth Guides (161)
                </Link>
              </li>
              <li>
                <Link href="/beard/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Beard Growth &amp; Care (83)
                </Link>
              </li>
              <li>
                <Link href="/comparison/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Treatment Comparisons (400)
                </Link>
              </li>
              <li>
                <Link href="/women/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Minoxidil for Women (129)
                </Link>
              </li>
              <li>
                <Link href="/side-effects/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Side Effects &amp; Safety (131)
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Col 2 */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5">
              Science &amp; Guides
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Frequently Asked Questions (236)
                </Link>
              </li>
              <li>
                <Link href="/usage/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Usage &amp; Application (55)
                </Link>
              </li>
              <li>
                <Link href="/reviews/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Product Reviews (33)
                </Link>
              </li>
              <li>
                <Link href="/science/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Cellular Science (24)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Brand Links */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5">
              Legal &amp; Official Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy-policy/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies-policy/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link href="/legal-notice/" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Legal Notice
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href="https://youminox.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                >
                  Official Sponsor: YouMinox.com ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="py-6 border-b border-slate-900 text-xs text-slate-500 leading-relaxed">
          <strong>Medical Disclaimer:</strong> The content published on Minoxidil-USA.com is for informational and educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified physician or dermatologist with any questions regarding hair loss treatments or medical conditions.
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            &copy; {currentYear} Minoxidil USA (minoxidil-usa.com). All rights reserved.
          </p>
          <p>
            Developed by{' '}
            <a
              href="https://youminox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 font-semibold"
            >
              You Minox (youminox.com)
            </a>{' '}
            &bull; Founded by Charlie Lingan
          </p>
        </div>
      </div>
    </footer>
  );
}
