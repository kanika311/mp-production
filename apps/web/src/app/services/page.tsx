"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Button } from '@/components/ui/Button';
import { SponsoredSidebarCard } from '@/components/ui/sponsored-sidebar-card';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Filter,
  RotateCcw,
  Tag,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronLeft,
  Star,
  Megaphone,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  desc: string;
  category: string;
  img: string;
  features: string[];
  pricing: string;
  rawPrice: number;
}

interface SponsoredPartner {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  badge: string;
  ctaText: string;
  isPublished: boolean;
}

const DEFAULT_SPONSORED: SponsoredPartner[] = [
  {
    id: 'sp-1',
    title: 'RED Digital Cinema',
    tagline: 'Official 8K Camera Rental Partner',
    description: 'Special 15% equipment discount for all MP Production certified shoots and creators.',
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

const CATEGORY_IMAGES: Record<string, string> = {
  Production: '/assets/service_production.webp',
  Video: '/assets/project-commercial.webp',
  Photography: '/assets/fashion_lookbook.webp',
  Content: '/assets/project-fashion.webp',
  Events: '/assets/project-music.webp',
  Talent: '/assets/service_casting.webp',
  'Post-Production': '/assets/service_post_production.webp',
  Marketing: '/assets/project-corporate.webp',
};

const BUDGET_OPTIONS = [
  { label: 'All Budgets', value: 'all' },
  { label: 'Under ₹50,000', value: 'under_50k' },
  { label: '₹50,000 - ₹1,50,000', value: '50k_150k' },
  { label: '₹1,50,000 - ₹3,00,000', value: '150k_300k' },
  { label: '₹3,00,000+ (High-End)', value: 'above_300k' },
];

const SORT_OPTIONS = [
  { label: 'Featured First', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name (A-Z)', value: 'name_asc' },
];

const DEFAULT_SERVICES_LIST: ServiceItem[] = [
  {
    id: 'commercial-cinema',
    slug: 'commercial-cinema',
    title: 'Commercial Cinema & TVC',
    desc: 'Full-scale cinematic brand film production with storytelling, 4K/8K anamorphic cinematography, and professional color grading.',
    category: 'Video',
    img: '/assets/hero_cinematic_dark.webp',
    features: ['4K/8K Cinema', 'Master Gaffer Lighting', 'RED & ARRI Packages'],
    pricing: '₹5,00,000',
    rawPrice: 500000,
  },
  {
    id: 'pre-production',
    slug: 'pre-production',
    title: 'Pre-Production & Creative Direction',
    desc: 'Scriptwriting, visual storyboarding, moodboarding, location scouting, and comprehensive casting for luxury lookbooks and commercial cinema.',
    category: 'Production',
    img: '/assets/service_pre_production.webp',
    features: ['Storyboarding', 'Location Scouting', 'Comprehensive Casting'],
    pricing: '₹1,50,000',
    rawPrice: 150000,
  },
  {
    id: 'high-fashion-lookbooks',
    slug: 'high-fashion-lookbooks',
    title: 'High-Fashion Lookbooks & Editorial',
    desc: 'Editorial and runway campaigns for luxury fashion ateliers with full art direction, prime glass, and high-end retouching.',
    category: 'Photography',
    img: '/assets/fashion_lookbook.webp',
    features: ['Runway & Ateliers', 'High-End Retouching', 'Art Direction'],
    pricing: '₹4,00,000',
    rawPrice: 400000,
  },
  {
    id: 'post-color-grade',
    slug: 'post-color-grade',
    title: 'Post-Production & Dolby Vision Color',
    desc: 'Theatrical editing, Kodak 2383 film emulation, Dolby Vision HDR color grading, motion graphics, and immersive sound design.',
    category: 'Post-Production',
    img: '/assets/service_post_production.webp',
    features: ['Dolby Vision HDR', 'Kodak 2383 Emulation', 'Spatial Sound Design'],
    pricing: '₹2,00,000',
    rawPrice: 200000,
  },
  {
    id: 'casting-roster',
    slug: 'casting-roster',
    title: 'Talent Roster & Representation',
    desc: 'Direct exclusive access to over 1,200 verified models, dramatic actors, and visual directors with secure escrow contract protections.',
    category: 'Talent',
    img: '/assets/service_casting.webp',
    features: ['1,200+ Verified Roster', 'Escrow Contract Protection', 'Direct Agency Access'],
    pricing: '₹1,50,000',
    rawPrice: 150000,
  },
  {
    id: 'digital-campaigns',
    slug: 'digital-campaigns',
    title: 'Digital Campaigns & Viral Reels',
    desc: 'High-retention 9:16 social-first campaign reels, algorithm-tailored hooks, and content suites built for maximum reach and brand conversion.',
    category: 'Marketing',
    img: '/assets/project-fashion.webp',
    features: ['9:16 Cinematic Reels', 'Algorithm Hook Testing', 'Omnichannel Assets'],
    pricing: '₹2,50,000',
    rawPrice: 250000,
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES_LIST);
  const [sponsoredPartners, setSponsoredPartners] = useState<SponsoredPartner[]>(DEFAULT_SPONSORED);
  const [loading, setLoading] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sponsored Auto-Scroll Horizontal Carousel State
  const [activeSponsorIdx, setActiveSponsorIdx] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isSponsorPaused, setIsSponsorPaused] = useState(false);

  // Auto-scroll / rotate sponsored card horizontally every 4.5 seconds
  useEffect(() => {
    if (sponsoredPartners.length <= 1 || isSponsorPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveSponsorIdx((prev) => (prev + 1) % sponsoredPartners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [sponsoredPartners.length, isSponsorPaused]);

  const handleNextSponsor = () => {
    if (sponsoredPartners.length <= 1) return;
    setDirection(1);
    setActiveSponsorIdx((prev) => (prev + 1) % sponsoredPartners.length);
  };

  const handlePrevSponsor = () => {
    if (sponsoredPartners.length <= 1) return;
    setDirection(-1);
    setActiveSponsorIdx((prev) => (prev - 1 + sponsoredPartners.length) % sponsoredPartners.length);
  };

  useEffect(() => {
    Promise.all([
      fetchAPI('/cms/services').catch(() => null),
      fetchAPI('/cms/config/sponsored').catch(() => null),
    ])
      .then(([servicesRes, sponsoredRes]) => {
        const servicesData = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          const mapped: ServiceItem[] = servicesData.map((s: any) => {
            const rawPrice = s.basePrice ? Number(s.basePrice) / 100 : (Number(s.price) || 0);
            const category = s.category || 'Production';
            const fallbackImg = CATEGORY_IMAGES[category] || '/assets/service_production.webp';

            return {
              id: s.id || s.slug || '',
              slug: s.slug || '',
              title: s.name || s.title || '',
              desc: s.description || s.shortDesc || s.desc || '',
              category,
              img: s.imageUrl || s.img || s.coverImage || fallbackImg,
              features: Array.isArray(s.features)
                ? s.features
                : (typeof s.features === 'string'
                  ? (() => { try { return JSON.parse(s.features); } catch { return []; } })()
                  : []),
              pricing: rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : 'Custom Quote',
              rawPrice,
            };
          });
          setServices(mapped);
        }

        // Sponsored partners from CMS / Super Admin
        if (sponsoredRes?.data) {
          const val = typeof sponsoredRes.data === 'string'
            ? (() => { try { return JSON.parse(sponsoredRes.data); } catch { return null; } })()
            : sponsoredRes.data;
          const items = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : null;
          if (items && items.length > 0) {
            const published = items.filter((p: SponsoredPartner) => p.isPublished !== false);
            if (published.length > 0) {
              setSponsoredPartners(published);
            }
          }
        }
      })
      .catch(() => {
        // Silently preserve DEFAULT_SERVICES_LIST without breaking UI
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute available categories dynamically with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { All: services.length };
    services.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [services]);

  const categoryList = useMemo(() => {
    return Object.keys(categoriesWithCounts);
  }, [categoriesWithCounts]);

  // Filtered & sorted services
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchDesc = s.desc.toLowerCase().includes(q);
          const matchCategory = s.category.toLowerCase().includes(q);
          const matchFeatures = s.features.some(f => f.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCategory && !matchFeatures) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && s.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Budget filter
        if (selectedBudget === 'under_50k' && (s.rawPrice <= 0 || s.rawPrice > 50000)) return false;
        if (selectedBudget === '50k_150k' && (s.rawPrice <= 50000 || s.rawPrice > 150000)) return false;
        if (selectedBudget === '150k_300k' && (s.rawPrice <= 150000 || s.rawPrice > 300000)) return false;
        if (selectedBudget === 'above_300k' && s.rawPrice <= 300000) return false;

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'price_asc') return a.rawPrice - b.rawPrice;
        if (selectedSort === 'price_desc') return b.rawPrice - a.rawPrice;
        if (selectedSort === 'name_asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [services, searchQuery, selectedCategory, selectedBudget, selectedSort]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBudget('all');
    setSelectedSort('recommended');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedBudget !== 'all' || selectedSort !== 'recommended';

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground pt-[172px] sm:pt-[180px]">
        
        {/* ═══════════════════════════════════════════════════════════
            FIXED SEARCH & QUICK PILLS BAR (Pinned at top below Navbar)
            ═══════════════════════════════════════════════════════════ */}
        <section className="fixed top-16 sm:top-[64px] left-0 right-0 z-40 bg-background border-b border-border shadow-xs">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 space-y-2.5">
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services, deliverables, 4K RED, lighting, color grading..."
                  className="w-full pl-10 pr-9 py-2 rounded-full border border-border bg-card/80 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-full border border-border bg-card text-foreground text-xs font-semibold hover:border-brand/60 transition-colors shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-brand" />
                )}
              </button>

              {/* Counter Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-mono font-medium text-muted-foreground shrink-0">
                <span className="text-foreground font-bold">{filteredServices.length}</span>
                <span>Services</span>
              </div>
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categoryList.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = categoriesWithCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide transition-all ${
                      isSelected
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-surface/80 hover:bg-surface text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {cat}
                    <span className={`ml-1.5 opacity-75 text-[10px] ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            3-COLUMN FULL-WIDTH EDGE-TO-EDGE LAYOUT
            Left: Attached Filters | Center: Expanded Services | Right: Attached Sponsored
            ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] xl:grid-cols-[300px_1fr_340px] 2xl:grid-cols-[320px_1fr_360px] gap-5 xl:gap-6 items-start">
            
            {/* ── COLUMN 1: LEFT FILTER PANEL (ATTACHED TO LEFT & STICKY) ────────────────── */}
            <aside className={`w-full lg:sticky lg:top-[180px] self-start ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div 
                data-lenis-prevent
                className="rounded-2xl border border-border bg-card/90 backdrop-blur-md p-5 space-y-5 shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-brand/50"
              >
                
                {/* Filter Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-base text-foreground">
                    <SlidersHorizontal className="w-4 h-4 text-brand" />
                    <span>Filter Services</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] font-mono text-brand hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Categories (No nested scroll trap) */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                    Category
                  </label>
                  <div className="space-y-1.5">
                    {categoryList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                          selectedCategory === cat
                            ? 'bg-brand/10 text-brand font-bold'
                            : 'text-foreground/80 hover:bg-surface hover:text-foreground'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {categoriesWithCounts[cat] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div className="space-y-2.5 border-t border-border pt-4">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                    Budget Tier
                  </label>
                  <div className="space-y-1.5">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedBudget(opt.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                          selectedBudget === opt.value
                            ? 'bg-brand/10 text-brand font-bold'
                            : 'text-foreground/80 hover:bg-surface hover:text-foreground'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedBudget === opt.value && (
                          <Check className="w-3.5 h-3.5 text-brand" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div className="space-y-2.5 border-t border-border pt-4">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                    Sort By
                  </label>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Direct Booking Link Note */}
                <div className="border-t border-border pt-4 text-[11px] text-muted-foreground font-light leading-relaxed">
                  Need a multi-camera bespoke production or live streaming rig?{' '}
                  <Link href="/contact" className="text-brand font-medium hover:underline">
                    Inquire directly →
                  </Link>
                </div>
              </div>
            </aside>

            {/* ── COLUMN 2: CENTER EXPANDED SERVICE CARDS (1FR MAXIMIZED SPACE) ─────────────────── */}
            <div className="w-full min-w-0 space-y-6">
              
              {/* Active filters summary */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">
                  Showing <strong className="text-foreground">{filteredServices.length}</strong> service{filteredServices.length === 1 ? '' : 's'}
                </span>
                {hasActiveFilters && (
                  <span className="text-[11px] font-mono text-brand">
                    Filters applied
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="rounded-3xl border border-border bg-card p-6 animate-pulse space-y-4">
                      <div className="h-44 bg-surface rounded-2xl w-full" />
                      <div className="h-6 bg-surface rounded w-2/3" />
                      <div className="h-12 bg-surface rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                /* Empty state when no service matches criteria */
                <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">No Services Found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    No services matched your current filters. Try resetting the search or category filters.
                  </p>
                  <Button onClick={handleResetFilters} variant="outline" size="sm">
                    Reset All Filters
                  </Button>
                </div>
              ) : (
                /* Services Cards List */
                <div className="space-y-6">
                  {filteredServices.map((svc) => (
                    <article
                      key={svc.id}
                      className="group rounded-3xl border border-border bg-card overflow-hidden hover:border-brand/60 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col"
                    >
                      {/* Image Banner */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
                        <Image
                          src={svc.img}
                          alt={svc.title}
                          fill
                          unoptimized={svc.img.startsWith('data:') || svc.img.startsWith('http')}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        {/* Top Category Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand text-white shadow-md">
                            {svc.category}
                          </span>
                        </div>

                        {/* Bottom Title on Image */}
                        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
                          <h3 className="font-serif text-2xl font-bold text-white leading-tight drop-shadow-md">
                            {svc.title}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-white/10 shrink-0">
                            {svc.pricing}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                          {svc.desc}
                        </p>

                        {/* Key Features Bullets */}
                        {svc.features && svc.features.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-border">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                              What&apos;s Included:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {svc.features.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="text-xs text-muted-foreground font-mono">
                            <span>Base Rate: </span>
                            <strong className="text-foreground font-bold">{svc.pricing}</strong>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/contact?service=${encodeURIComponent(svc.title)}`}
                              className="px-4 py-2 rounded-full border border-border bg-surface text-foreground text-xs font-semibold hover:border-brand/60 transition-colors"
                            >
                              Inquire
                            </Link>
                            <Link
                              href="/login"
                              className="px-4 py-2 rounded-full bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-all shadow-xs flex items-center gap-1.5"
                            >
                              <span>Book Service</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* ── COLUMN 3: RIGHT SPONSORED PANEL (ADMIN-CONFIGURED SPONSORED CARD) ── */}
            <aside className="w-full lg:sticky lg:top-[180px] self-start h-[calc(100vh-195px)] min-h-[480px] max-h-[660px]">
              <SponsoredSidebarCard context="services" className="h-full" />
            </aside>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            BOTTOM COMPACT BOOKING BAR (Fixes Second Screenshot Space Wastage)
            Single line inline layout: Question + Text + Button
            ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 pb-14 pt-4">
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:border-brand/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="font-serif text-lg sm:text-xl font-bold text-foreground shrink-0">
                Ready to start your project?
              </span>
              <span className="hidden sm:inline text-muted-foreground/30 font-light text-xl">|</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
                Log into the client portal to generate a custom quote, view availability, and secure your production dates instantly.
              </span>
            </div>
            <Button href="/login" size="sm" variant="accent" className="shrink-0 whitespace-nowrap shadow-md font-semibold">
              Launch Client Portal →
            </Button>
          </div>
        </section>

      </main>
    </>
  );
}
