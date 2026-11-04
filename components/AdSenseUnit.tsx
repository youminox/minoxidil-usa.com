'use client';

import { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  format?: 'auto' | 'fluid' | 'rectangle';
  layout?: 'in-article';
  className?: string;
  minHeight?: string;
  label?: string;
}

export default function AdSenseUnit({
  format = 'auto',
  layout,
  className = '',
  minHeight = '250px',
  label = 'Advertisement',
}: AdSenseUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;

    const pushAd = () => {
      if (pushedRef.current) return;
      pushedRef.current = true;
      try {
        // @ts-expect-error adsbygoogle is injected globally by Google AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    };

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              pushAd();
              observer.disconnect();
            }
          });
        },
        { rootMargin: '250px' }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      pushAd();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`my-8 flex flex-col items-center justify-center bg-white py-3 px-4 border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm ${className}`}
      style={{ minHeight }}
    >
      <span className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-widest text-center block w-full">
        {label}
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', textAlign: 'center' }}
        data-ad-client="ca-pub-1070738569472471"
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}
