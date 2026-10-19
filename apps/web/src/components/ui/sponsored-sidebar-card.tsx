'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { fetchAPI } from '@/lib/api-client';

export interface SponsoredPartner {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  badge: string;
  ctaText: string;
  isPublished?: boolean;
}

export const DEFAULT_SPONSORED_PARTNERS: SponsoredPartner[] = [
  {
    id: 'sp-1',
    title: 'RED Digital Cinema',
    tagline: 'Official 8K Camera Rental Partner',
    description: 'Special 15% equipment discount for all MP Production certified shoots, casting reels, and creators.',
    imageUrl: '/assets/project-commercial.webp',
    linkUrl: 'https://www.red.com',
    badge: 'OFFICIAL PARTNER',
    ctaText: 'Explore Gear ↗',
    isPublished: true,
  },
  {
    id: 'sp-2',
    title: 'DaVinci Resolve Studio',
    tagline: 'Hollywood Grade Color Suite',
    description: 'Industry-standard color grading and Fairlight audio post-production pipeline.',
    imageUrl: '/assets/service_post_production.webp',
    linkUrl: 'https://www.blackmagicdesign.com',
    badge: 'PROMO DEAL',
    ctaText: 'Learn More ↗',
    isPublished: true,
  },
  {
    id: 'sp-3',
    title: 'ARRI Alexa 35 Suite',
    tagline: 'Premium Cinema Prime Packages',
    description: 'Full anamorphic lens kits and high-speed motion rigs available on demand.',
    imageUrl: '/assets/service_production.webp',
    linkUrl: 'https://www.arri.com',
    badge: 'EXCLUSIVE GEAR',
    ctaText: 'View Packages ↗',
    isPublished: true,
  },
];

interface SponsoredSidebarCardProps {
  context?: 'blog' | 'services' | 'talent' | 'projects';
  className?: string;
  showAdvertiseLink?: boolean;
}

export function SponsoredSidebarCard({
  context = 'services',
  className = '',
  showAdvertiseLink = false,
}: SponsoredSidebarCardProps) {
  const [partners, setPartners] = useState<SponsoredPartner[]>(DEFAULT_SPONSORED_PARTNERS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Load Admin Sponsored Config from /api/cms/config/sponsored
  useEffect(() => {
    let isMounted = true;

    async function loadSponsored() {
      // 1. Try Next.js BFF API first
      try {
        const res = await fetch('/api/cms/config/sponsored', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const val = typeof json?.data === 'string'
            ? (() => { try { return JSON.parse(json.data); } catch { return null; } })()
            : json?.data;
          const items = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : null;
          if (items && items.length > 0) {
            const published = items.filter((p: SponsoredPartner) => p.isPublished !== false && p.title);
            if (published.length > 0 && isMounted) {
              setPartners(published);
              return;
            }
          }
        }
      } catch {}

      // 2. Fallback to fetchAPI direct
      try {
        const res = await fetchAPI('/cms/config/sponsored');
        if (res?.data) {
          const val = typeof res.data === 'string'
            ? (() => { try { return JSON.parse(res.data); } catch { return null; } })()
            : res.data;
          const items = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : null;
          if (items && items.length > 0) {
            const published = items.filter((p: SponsoredPartner) => p.isPublished !== false && p.title);
            if (published.length > 0 && isMounted) {
              setPartners(published);
            }
          }
        }
      } catch {}
    }

    loadSponsored();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll carousel every 4.5s
  useEffect(() => {
    if (partners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIdx((prev) => (prev + 1) % partners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [partners.length, isPaused]);

  const handleNext = useCallback(() => {
    if (partners.length <= 1) return;
    setDirection(1);
    setActiveIdx((prev) => (prev + 1) % partners.length);
  }, [partners.length]);

  const handlePrev = useCallback(() => {
    if (partners.length <= 1) return;
    setDirection(-1);
    setActiveIdx((prev) => (prev - 1 + partners.length) % partners.length);
  }, [partners.length]);

  if (partners.length === 0) return null;

  const current = partners[activeIdx] || partners[0];

  const advertiseLabel =
    context === 'talent'
      ? 'Partner with MP Talent?'
      : context === 'blog'
      ? 'Partner with MP Studio?'
      : 'Want to feature here?';

  return (
    <div className={`flex flex-col space-y-2.5 select-none ${className}`}>
      {/* Top Header Pill & Pagination Dots */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Sponsored</span>
        </div>

        {partners.length > 1 && (
          <div className="flex items-center gap-1.5">
            {partners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > activeIdx ? 1 : -1);
                  setActiveIdx(i);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  i === activeIdx
                    ? 'w-4 h-1.5 bg-amber-500 shadow-xs'
                    : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Full-Height Card */}
      <div
        className="relative w-full min-h-[460px] max-h-[640px] flex-1 rounded-3xl border border-border bg-card overflow-hidden shadow-lg group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Progress Line Indicator */}
        {partners.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
            <motion.div
              key={`${activeIdx}-${isPaused}`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: isPaused ? 0 : 4.5,
                ease: 'linear',
              }}
              className={`h-full ${isPaused ? 'bg-amber-400/40' : 'bg-amber-500'}`}
            />
          </div>
        )}

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIdx}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 320 : -320,
                opacity: 0,
                scale: 0.96,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
                transition: {
                  x: { type: 'spring', stiffness: 280, damping: 28 },
                  opacity: { duration: 0.25 },
                  scale: { duration: 0.25 },
                },
              },
              exit: (dir: number) => ({
                x: dir > 0 ? -320 : 320,
                opacity: 0,
                scale: 0.96,
                transition: {
                  x: { type: 'spring', stiffness: 280, damping: 28 },
                  opacity: { duration: 0.25 },
                  scale: { duration: 0.25 },
                },
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col justify-between"
          >
            {/* Background Image / Banner */}
            <div className="absolute inset-0 z-0">
              {current?.imageUrl ? (
                <Image
                  src={current.imageUrl}
                  alt={current.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-cover brightness-[0.65] group-hover:brightness-[0.75] group-hover:scale-105 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-950/40 via-card to-background" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-10" />
            </div>

            {/* Top Overlay Badge & Index */}
            <div className="relative z-20 p-5 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-black shadow-md">
                {current?.badge || 'OFFICIAL PARTNER'}
              </span>

              <span className="text-[10px] font-mono text-white/70 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                {activeIdx + 1} / {partners.length}
              </span>
            </div>

            {/* Manual Next / Prev arrows on hover */}
            {partners.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrev();
                  }}
                  className="pointer-events-auto h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors shadow-md cursor-pointer"
                  title="Previous Partner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="pointer-events-auto h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors shadow-md cursor-pointer"
                  title="Next Partner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Overlay Content */}
            <div className="relative z-20 p-6 space-y-3 mt-auto">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-2xl text-white leading-tight drop-shadow-md">
                  {current?.title}
                </h4>
                {current?.tagline && (
                  <p className="text-xs font-semibold text-amber-400">
                    {current.tagline}
                  </p>
                )}
              </div>

              {current?.description && (
                <p className="text-xs text-white/80 font-normal leading-relaxed line-clamp-3">
                  {current.description}
                </p>
              )}

              {/* CTA Link Button */}
              {current?.linkUrl && (
                <a
                  href={current.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>{current?.ctaText || 'Explore Partner'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Advertise Link (Optional) */}
      {showAdvertiseLink && (
        <div className="shrink-0 flex items-center justify-between px-2 pt-0.5 text-[11px] font-mono text-muted-foreground">
          <span>{advertiseLabel}</span>
          <Link href="/contact" className="text-brand font-bold hover:underline">
            Advertise →
          </Link>
        </div>
      )}
    </div>
  );
}
