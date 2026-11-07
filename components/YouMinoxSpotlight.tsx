interface YouMinoxSpotlightProps {
  variant?: 'home' | 'article';
}

export default function YouMinoxSpotlight({ variant = 'home' }: YouMinoxSpotlightProps) {
  if (variant === 'article') {
    return (
      <div className="my-10 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-primary-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white p-2 flex-shrink-0 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/you-minox.webp"
              alt="You Minox Cream-Based Minoxidil"
              width={200}
              height={200}
              loading="lazy"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-grow text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-400/30 mb-2">
              Official Sponsor &bull; YouMinox.com
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              Looking for Gentle, Cream-Based Minoxidil for Hair &amp; Beard?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
              This guide is proudly brought to you by <strong className="text-white">You Minox</strong>, founded by{' '}
              <a
                href="https://charlielingan.com/en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-300 hover:text-primary-200 underline font-semibold"
              >
                Charlie Lingan
              </a>
              . Discover why over 600,000+ followers trust You Minox cream formulations to stimulate thicker beard and scalp growth without harsh alcohol dryness.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]"
              >
                Visit Official YouMinox.com
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a
                href="https://charlielingan.com/en/emprendedor/how-i-created-you-minox-number-1-cream-minoxidil-in-peru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all"
              >
                Read Founder&apos;s Story (CharlieLingan.com) &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-950 via-primary-950 to-slate-950 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.35) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.25) 0%, transparent 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Badge */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary-500/20 text-primary-300 border border-primary-500/40 mb-4">
            ✨ Created &amp; Sponsored by You Minox (youminox.com)
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Powered by <span className="text-primary-400">You Minox</span> — The Cream-Based Minoxidil Pioneers
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            You Minox proudly created and sponsors Minoxidil-USA.com to provide honest, science-backed education for everyone on their hair and beard restoration journey.
          </p>
        </div>

        {/* 2-Column Showcase: You Minox Brand + Charlie Lingan Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card: You Minox Product & Social Proof */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl bg-white p-3 flex-shrink-0 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brand/you-minox.webp"
                  alt="You Minox Cream-Based Minoxidil"
                  width={300}
                  height={236}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 uppercase tracking-wider mb-2">
                  Official Brand Spotlight
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Why Cream-Based Minoxidil by You Minox?
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                  Traditional liquid solutions rely on harsh propylene glycol and alcohol that leave your face and scalp dry, flaky, and irritated. <strong className="text-white">You Minox</strong> engineered a specialized cream-based formula designed to nourish the skin while delivering consistent follicular stimulation.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold bg-primary-500/20 text-primary-300 px-3 py-1 rounded-lg border border-primary-500/30">
                    ✓ No Alcohol Dryness
                  </span>
                  <span className="text-xs font-semibold bg-primary-500/20 text-primary-300 px-3 py-1 rounded-lg border border-primary-500/30">
                    ✓ Beard &amp; Scalp Formula
                  </span>
                  <span className="text-xs font-semibold bg-primary-500/20 text-primary-300 px-3 py-1 rounded-lg border border-primary-500/30">
                    ✓ Smooth Daily Absorption
                  </span>
                </div>
              </div>
            </div>

            {/* Social Community Stats from WordPress Home */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-lg">
                  🎵
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white leading-tight">500k+</div>
                  <div className="text-xs text-slate-400">TikTok @You_minox</div>
                </div>
              </a>

              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg">
                  📸
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white leading-tight">100k+</div>
                  <div className="text-xs text-slate-400">Instagram @youminox</div>
                </div>
              </a>

              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-lg">
                  ▶️
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white leading-tight">2k+</div>
                  <div className="text-xs text-slate-400">YouTube @You_minox</div>
                </div>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <span className="text-xs sm:text-sm text-slate-300">
                Ready to experience the #1 Cream-Based Minoxidil brand?
              </span>
              <a
                href="https://youminox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-brand-500 hover:from-primary-400 hover:to-brand-400 text-slate-950 font-extrabold px-7 py-3.5 rounded-xl text-sm shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02]"
              >
                Visit Official Website: YouMinox.com
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Card: Founder Story (Charlie Lingan) */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary-400 shadow-lg flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/brand/charlie-lingan.webp"
                    alt="Charlie Lingan - Founder of Minoxidil USA & You Minox"
                    width={160}
                    height={160}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
                    Founder&apos;s Message
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    <a
                      href="https://charlielingan.com/en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-300 transition-colors"
                    >
                      Charlie Lingan
                    </a>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Creator of Minoxidil-USA.com &amp; You Minox
                  </p>
                </div>
              </div>

              <blockquote className="text-slate-200 text-sm sm:text-base leading-relaxed italic border-l-4 border-primary-400 pl-4 py-1 mb-6">
                &ldquo;This website was created by Charlie Lingan with the genuine intention of sharing simple, honest, and real experiences about using cream-based minoxidil and improving facial hair. I built this space to help every reader who is looking for clear information, practical guidance, and a friendly voice throughout their journey. Every article here is written with care, so you can find useful answers, real recommendations, and true support as you work toward the results you want.&rdquo;
              </blockquote>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 space-y-2.5">
              <div className="text-xs font-semibold text-slate-400">
                Official Brand Ecosystem &amp; Founder Blog
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">You Minox Official Store</span>
                <a
                  href="https://youminox.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary-400 hover:text-primary-300 underline"
                >
                  https://youminox.com &rarr;
                </a>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs sm:text-sm font-bold text-slate-200">Charlie Lingan Official Site</span>
                <a
                  href="https://charlielingan.com/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary-400 hover:text-primary-300 underline"
                >
                  charlielingan.com &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
