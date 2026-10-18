'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Briefcase, 
  Globe, 
  MapPin, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  Filter, 
  RotateCcw, 
  ArrowRight, 
  Eye, 
  DollarSign, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAPI } from '@/lib/api-client';

export interface TalentItem {
  id: string;
  slug?: string;
  stageName?: string;
  bio?: string;
  city?: string;
  state?: string;
  experienceLevel?: string;
  projectCount?: number;
  profileViews?: number;
  brandsWorkedWith?: string[];
  coverBannerUrl?: string;
  introductionVideoUrl?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    city?: string;
    state?: string;
    gender?: string;
  };
  userTalents?: Array<{
    isPrimary?: boolean;
    category?: { id?: string; name: string; slug?: string };
    attributes?: Record<string, any>;
  }>;
  userSkills?: Array<{ skill?: { id?: string; name: string } }>;
  userLanguages?: Array<{ language?: { id?: string; name: string } }>;
  pricing?: {
    perDay?: number;
    perHour?: number;
    startingPrice?: number;
  };
  portfolioMedia?: Array<{
    id?: string;
    url: string;
    type?: string;
    isFeatured?: boolean;
  }>;
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

interface TalentDiscoveryFeedProps {
  initialTalents: TalentItem[];
}

const DEFAULT_TALENT_SPONSORED: SponsoredPartner[] = [
  {
    id: 'sp-t1',
    title: 'Elite Model Management',
    tagline: 'Global Premier Casting Agency',
    description: 'Direct runway casting and high-fashion editorial representation for international luxury brand campaigns.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    linkUrl: '/contact',
    badge: 'EXCLUSIVE AGENCY',
    ctaText: 'Inquire Representation ↗',
    isPublished: true,
  },
  {
    id: 'sp-t2',
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
    id: 'sp-t3',
    title: 'Bollywood Casting Studio',
    tagline: 'Leading Actors & Commercials Roster',
    description: 'Verified audition access for feature films, web series, and major TV commercial campaigns across Mumbai.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    linkUrl: '/contact',
    badge: 'FEATURED CASTING',
    ctaText: 'View Auditions ↗',
    isPublished: true,
  },
];

const CATEGORY_OPTIONS = [
  'All Types',
  'Model',
  'Actor',
  'Influencer',
  'Dancer',
  'Musician',
  'Voice Artist',
  'Photographer',
  'Comedian',
  'Creator',
];

const EXPERIENCE_OPTIONS = [
  'All Experience',
  'Fresher',
  '1-3 Years',
  '3-5 Years',
  '5+ Years',
  'Celebrity / Elite',
];

const GENDER_OPTIONS = ['All Genders', 'Female', 'Male', 'Non-Binary'];

const CITY_OPTIONS = [
  'All Cities',
  'Mumbai',
  'Delhi NCR',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Kolkata',
  'Chandigarh',
  'Goa',
  'Chennai',
  'Ahmedabad',
];

const SORT_OPTIONS = [
  { label: 'Featured First', value: 'featured' },
  { label: 'Most Viewed', value: 'views' },
  { label: 'Newest Roster', value: 'newest' },
  { label: 'Rate: Low to High', value: 'rate_asc' },
  { label: 'Rate: High to Low', value: 'rate_desc' },
];

const PRICE_TIERS = [
  { label: 'Any Budget', value: 'all' },
  { label: 'Under ₹5,000 / day', value: 'under_5k' },
  { label: '₹5,000 - ₹15,000 / day', value: '5k_15k' },
  { label: '₹15,000 - ₹30,000 / day', value: '15k_30k' },
  { label: '₹30,000+ / day (Celebrity)', value: 'above_30k' },
];

export default function TalentDiscoveryFeed({ initialTalents }: TalentDiscoveryFeedProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Types');
  const [selectedExperience, setSelectedExperience] = useState('All Experience');
  const [selectedGender, setSelectedGender] = useState('All Genders');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [selectedPriceTier, setSelectedPriceTier] = useState('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 profiles per row x 3 rows = 9 per page

  // Sponsored Carousel State
  const [sponsoredPartners, setSponsoredPartners] = useState<SponsoredPartner[]>(DEFAULT_TALENT_SPONSORED);
  const [activeSponsorIdx, setActiveSponsorIdx] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isSponsorPaused, setIsSponsorPaused] = useState(false);

  // Fallback high-res profile placeholders
  const fallbackAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
  ];

  // Fetch sponsored partners from CMS
  useEffect(() => {
    fetchAPI('/cms/config/sponsored')
      .then((res) => {
        if (res?.data) {
          const val = typeof res.data === 'string'
            ? (() => { try { return JSON.parse(res.data); } catch { return null; } })()
            : res.data;
          const items = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : null;
          if (items && items.length > 0) {
            const published = items.filter((p: SponsoredPartner) => p.isPublished !== false);
            if (published.length > 0) {
              setSponsoredPartners(published);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll / rotate sponsored card horizontally every 4.5 seconds
  useEffect(() => {
    if (sponsoredPartners.length <= 1 || isSponsorPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveSponsorIdx((prev) => (prev + 1) % sponsoredPartners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [sponsoredPartners.length, isSponsorPaused]);

  const handleNextSponsor = useCallback(() => {
    if (sponsoredPartners.length <= 1) return;
    setDirection(1);
    setActiveSponsorIdx((prev) => (prev + 1) % sponsoredPartners.length);
  }, [sponsoredPartners.length]);

  const handlePrevSponsor = useCallback(() => {
    if (sponsoredPartners.length <= 1) return;
    setDirection(-1);
    setActiveSponsorIdx((prev) => (prev - 1 + sponsoredPartners.length) % sponsoredPartners.length);
  }, [sponsoredPartners.length]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedExperience,
    selectedGender,
    selectedCity,
    selectedSort,
    selectedPriceTier,
  ]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Types');
    setSelectedExperience('All Experience');
    setSelectedGender('All Genders');
    setSelectedCity('All Cities');
    setSelectedSort('featured');
    setSelectedPriceTier('all');
    setCurrentPage(1);
  };

  const isFiltered = 
    searchQuery !== '' ||
    selectedCategory !== 'All Types' ||
    selectedExperience !== 'All Experience' ||
    selectedGender !== 'All Genders' ||
    selectedCity !== 'All Cities' ||
    selectedSort !== 'featured' ||
    selectedPriceTier !== 'all';

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Types': initialTalents?.length || 0 };
    if (Array.isArray(initialTalents)) {
      initialTalents.forEach((t) => {
        const primaryCat = t.userTalents?.[0]?.category?.name;
        if (primaryCat) {
          CATEGORY_OPTIONS.forEach((opt) => {
            if (opt !== 'All Types' && primaryCat.toLowerCase().includes(opt.toLowerCase())) {
              counts[opt] = (counts[opt] || 0) + 1;
            }
          });
        }
      });
    }
    return counts;
  }, [initialTalents]);

  // Filter and Sort Logic
  const filteredTalents = useMemo(() => {
    if (!Array.isArray(initialTalents)) return [];

    return initialTalents.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (t.stageName || `${t.user?.firstName || ''} ${t.user?.lastName || ''}`).toLowerCase();
        const bio = (t.bio || '').toLowerCase();
        const city = (t.city || t.user?.city || '').toLowerCase();
        const category = (t.userTalents?.[0]?.category?.name || '').toLowerCase();
        const skills = (t.userSkills?.map((s) => s.skill?.name || '').join(' ') || '').toLowerCase();

        if (
          !name.includes(query) &&
          !bio.includes(query) &&
          !city.includes(query) &&
          !category.includes(query) &&
          !skills.includes(query)
        ) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'All Types') {
        const target = selectedCategory.toLowerCase();
        const primaryCat = (t.userTalents?.[0]?.category?.name || '').toLowerCase();
        const allCats = t.userTalents?.map((ut) => (ut.category?.name || '').toLowerCase()) || [];
        if (!primaryCat.includes(target) && !allCats.some((c) => c.includes(target))) {
          return false;
        }
      }

      // 3. Experience
      if (selectedExperience !== 'All Experience') {
        const exp = (t.experienceLevel || '').toLowerCase();
        const targetExp = selectedExperience.toLowerCase();
        if (targetExp.includes('fresher') && !exp.includes('fresh')) return false;
        if (targetExp.includes('1-3') && !exp.includes('1-3') && !exp.includes('2') && !exp.includes('junior')) return false;
        if (targetExp.includes('3-5') && !exp.includes('3-5') && !exp.includes('4') && !exp.includes('mid')) return false;
        if (targetExp.includes('5+') && !exp.includes('5') && !exp.includes('senior') && !exp.includes('expert') && !exp.includes('pro')) return false;
      }

      // 4. Gender
      if (selectedGender !== 'All Genders') {
        const gender = (t.user?.gender || '').toLowerCase();
        if (!gender.includes(selectedGender.toLowerCase())) return false;
      }

      // 5. City
      if (selectedCity !== 'All Cities') {
        const city = (t.city || t.user?.city || '').toLowerCase();
        if (!city.includes(selectedCity.toLowerCase())) return false;
      }

      // 6. Price Tier
      if (selectedPriceTier !== 'all') {
        const rate = (t.pricing?.perDay ? t.pricing.perDay / 100 : (t.pricing?.startingPrice || 4999));
        if (selectedPriceTier === 'under_5k' && rate > 5000) return false;
        if (selectedPriceTier === '5k_15k' && (rate < 5000 || rate > 15000)) return false;
        if (selectedPriceTier === '15k_30k' && (rate < 15000 || rate > 30000)) return false;
        if (selectedPriceTier === 'above_30k' && rate < 30000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'views') {
        return (b.profileViews || 0) - (a.profileViews || 0);
      }
      if (selectedSort === 'newest') {
        return (b.id || '').localeCompare(a.id || '');
      }
      if (selectedSort === 'rate_asc') {
        const rateA = a.pricing?.perDay ? a.pricing.perDay / 100 : (a.pricing?.startingPrice || 4999);
        const rateB = b.pricing?.perDay ? b.pricing.perDay / 100 : (b.pricing?.startingPrice || 4999);
        return rateA - rateB;
      }
      if (selectedSort === 'rate_desc') {
        const rateA = a.pricing?.perDay ? a.pricing.perDay / 100 : (a.pricing?.startingPrice || 4999);
        const rateB = b.pricing?.perDay ? b.pricing.perDay / 100 : (b.pricing?.startingPrice || 4999);
        return rateB - rateA;
      }
      return 0; // Default featured
    });
  }, [
    initialTalents,
    searchQuery,
    selectedCategory,
    selectedExperience,
    selectedGender,
    selectedCity,
    selectedSort,
    selectedPriceTier,
  ]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredTalents.length / itemsPerPage) || 1;
  const paginatedTalents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTalents.slice(start, start + itemsPerPage);
  }, [filteredTalents, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      
      {/* ═══════════════════════════════════════════════════════════
          FIXED TOP SEARCH & CATEGORY PILLS BAR (Pinned below Navbar)
          ═══════════════════════════════════════════════════════════ */}
      <section className="fixed top-16 sm:top-[64px] left-0 right-0 z-40 bg-background border-b border-border shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 space-y-2.5">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search talent by name, profession, city, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-full border border-border bg-card/80 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
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
              {isFiltered && <span className="w-2 h-2 rounded-full bg-brand" />}
            </button>

            {/* Counter Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-mono font-medium text-muted-foreground shrink-0">
              <span className="text-foreground font-bold">{filteredTalents.length}</span>
              <span>Verified Profiles</span>
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="hidden md:flex items-center gap-1 text-xs font-mono text-brand hover:underline cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide transition-all cursor-pointer ${
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
          Left: Attached Filters | Center: 3 Profiles Per Row + Pagination | Right: Attached Sponsored
          ═══════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 py-5 pt-[172px] sm:pt-[180px]">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] xl:grid-cols-[300px_1fr_340px] 2xl:grid-cols-[320px_1fr_360px] gap-5 xl:gap-6 items-start">
          
          {/* ── COLUMN 1: LEFT FILTER PANEL (ATTACHED TO LEFT & STICKY) ── */}
          <aside className={`w-full lg:sticky lg:top-[180px] self-start ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div 
              data-lenis-prevent
              className="rounded-2xl border border-border bg-card/90 backdrop-blur-md p-5 space-y-5 shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-brand/50"
            >
              
              {/* Filter Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 font-serif font-bold text-base text-foreground">
                  <SlidersHorizontal className="w-4 h-4 text-brand" />
                  <span>Filter Talent</span>
                </div>
                {isFiltered && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] font-mono text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* 1. Category */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                  Talent Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 2. Experience Level */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                  Experience Level
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* 3. Gender */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* 4. Location / City */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                  Location / City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* 5. Day Rate Tier */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                  Day Rate Budget
                </label>
                <select
                  value={selectedPriceTier}
                  onChange={(e) => setSelectedPriceTier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  {PRICE_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>

              {/* 6. Sort By */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                  Sort By
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Direct Booking note */}
              <div className="border-t border-border pt-4 text-[11px] text-muted-foreground font-light leading-relaxed">
                Looking for exclusive celebrity casting or confidential agency bookings?{' '}
                <Link href="/contact" className="text-brand font-medium hover:underline">
                  Inquire directly →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── COLUMN 2: CENTER EXPANDED COLUMN (3 PROFILES PER ROW + PAGINATION) ── */}
          <div className="w-full min-w-0 space-y-6">
            
            {/* Feed Status Summary */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">
                Showing <strong className="text-foreground">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredTalents.length)} - {Math.min(currentPage * itemsPerPage, filteredTalents.length)}</strong> of <strong className="text-foreground">{filteredTalents.length}</strong> profile{filteredTalents.length === 1 ? '' : 's'}
              </span>
              {isFiltered && (
                <span className="text-[11px] font-mono text-brand font-semibold">
                  Filters applied
                </span>
              )}
            </div>

            {/* Profile Cards Grid (3 Per Row on Desktop / xl) */}
            {filteredTalents.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center space-y-4">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
                <h3 className="text-xl font-serif font-bold text-foreground">No Talents Found</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  No profiles match your active search filters. Try clearing your category, city, or experience criteria.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 rounded-full bg-brand text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-110 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedTalents.map((talent, idx) => {
                  const name = talent.stageName || `${talent.user?.firstName || ''} ${talent.user?.lastName || ''}`.trim() || 'Verified Talent';
                  const avatar = 
                    talent.user?.avatarUrl || 
                    talent.portfolioMedia?.find((m) => m.type === 'PROFILE_PHOTO')?.url ||
                    talent.coverBannerUrl || 
                    fallbackAvatars[idx % fallbackAvatars.length];
                  
                  const category = 
                    talent.userTalents?.[0]?.category?.name || 
                    'Fashion Model';

                  const location = 
                    talent.city || 
                    talent.user?.city ? 
                    `${talent.city || talent.user?.city}${talent.state || talent.user?.state ? `, ${talent.state || talent.user?.state}` : ''}` : 
                    'Mumbai, India';

                  const experience = talent.experienceLevel || '3+ Years Experience';
                  
                  const languages = 
                    talent.userLanguages && talent.userLanguages.length > 0
                      ? talent.userLanguages.map((l) => l.language?.name).filter(Boolean).join(' • ')
                      : 'English • Hindi';

                  const skillsStr = 
                    talent.userSkills && talent.userSkills.length > 0
                      ? talent.userSkills.slice(0, 2).map((s) => s.skill?.name).filter(Boolean).join(' • ')
                      : (talent.brandsWorkedWith && talent.brandsWorkedWith.length > 0
                          ? talent.brandsWorkedWith.slice(0, 2).join(' • ')
                          : 'Editorial • Commercial');

                  const rawRate = talent.pricing?.perDay ? talent.pricing.perDay / 100 : (talent.pricing?.startingPrice || 4999);
                  const formattedRate = rawRate ? `₹${rawRate.toLocaleString('en-IN')}` : '₹4,999';
                  const profileUrl = `/talent/${talent.slug || talent.id}`;

                  return (
                    <div
                      key={talent.id}
                      className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-brand/50 relative overflow-hidden"
                    >
                      {/* Top Section: Avatar + Name + Category */}
                      <div className="space-y-3.5 text-center">
                        
                        {/* Circular Headshot */}
                        <Link href={profileUrl} className="block relative mx-auto w-24 h-24 group-hover:scale-105 transition-transform duration-300">
                          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand to-amber-500 shadow-md overflow-hidden">
                            <img
                              src={avatar}
                              alt={name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-card shadow-sm" title="Verified Roster">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        </Link>

                        {/* Name & Category */}
                        <div>
                          <Link href={profileUrl} className="block">
                            <h3 className="text-base font-serif font-bold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                              {name}
                            </h3>
                          </Link>
                          
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                              <span>{category}</span>
                              <Sparkles className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>

                        {/* Key Attributes */}
                        <div className="text-left space-y-1.5 text-xs text-muted-foreground pt-3 border-t border-border/60 font-light">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-brand shrink-0" />
                            <span className="line-clamp-1 font-medium text-foreground/90 text-[11px]">{experience}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-brand shrink-0" />
                            <span className="line-clamp-1 text-[11px]">{languages}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                            <span className="line-clamp-1 text-[11px]">{location}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-brand shrink-0" />
                            <span className="line-clamp-1 text-[10px] opacity-80">{skillsStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section: Rate & Action Buttons */}
                      <div className="pt-4 mt-4 border-t border-border space-y-3">
                        <div className="text-center">
                          <div className="text-sm font-bold text-foreground font-mono">
                            <span className="text-brand text-base">{formattedRate}</span>
                            <span className="text-xs text-muted-foreground font-sans font-normal"> / Day</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            Direct Booking • Escrow Protected
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-0.5">
                          <Link
                            href={`/talent/${talent.slug || talent.id}/book`}
                            className="w-full py-2 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={profileUrl}
                            className="w-full py-1.5 rounded-xl border border-border hover:border-brand hover:text-brand bg-surface font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-foreground"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Profile</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-mono text-muted-foreground">
                  Page <span className="font-bold text-foreground">{currentPage}</span> of <span className="font-bold text-foreground">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:border-brand disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Only show first, last, and window around current page
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        const isActive = page === currentPage;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-brand text-white shadow-xs'
                                : 'bg-surface hover:bg-card border border-border text-foreground'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="text-muted-foreground text-xs px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:border-brand disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── COLUMN 3: RIGHT SPONSORED PANEL (ATTACHED TO RIGHT & STICKY FULL-HEIGHT AUTO-SCROLL) ── */}
          <aside className="w-full lg:sticky lg:top-[180px] self-start h-[calc(100vh-195px)] min-h-[480px] max-h-[660px] flex flex-col space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between px-1 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sponsored</span>
              </div>

              {/* Pagination Dots with Active indicator */}
              {sponsoredPartners.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {sponsoredPartners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > activeSponsorIdx ? 1 : -1);
                        setActiveSponsorIdx(i);
                      }}
                      className={`transition-all rounded-full cursor-pointer ${
                        i === activeSponsorIdx
                          ? 'w-4 h-1.5 bg-amber-500 shadow-xs'
                          : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      }`}
                      title={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Full Height Auto-Scrolling Card */}
            <div
              className="relative flex-1 w-full rounded-3xl border border-border bg-card overflow-hidden shadow-lg group select-none"
              onMouseEnter={() => setIsSponsorPaused(true)}
              onMouseLeave={() => setIsSponsorPaused(false)}
            >
              {/* Horizontal Auto-Scroll Progress Line Indicator */}
              {sponsoredPartners.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
                  <motion.div
                    key={`${activeSponsorIdx}-${isSponsorPaused}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: isSponsorPaused ? 0 : 4.5,
                      ease: 'linear',
                    }}
                    className={`h-full ${isSponsorPaused ? 'bg-amber-400/40' : 'bg-amber-500'}`}
                  />
                </div>
              )}

              <AnimatePresence initial={false} custom={direction}>
                {sponsoredPartners.length > 0 && (
                  <motion.div
                    key={activeSponsorIdx}
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
                    {/* Full Bleed Background Image / Banner */}
                    <div className="absolute inset-0 z-0">
                      {sponsoredPartners[activeSponsorIdx]?.imageUrl ? (
                        <Image
                          src={sponsoredPartners[activeSponsorIdx].imageUrl}
                          alt={sponsoredPartners[activeSponsorIdx].title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 25vw"
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
                        {sponsoredPartners[activeSponsorIdx]?.badge || 'FEATURED AGENCY'}
                      </span>

                      <span className="text-[10px] font-mono text-white/70 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                        {activeSponsorIdx + 1} / {sponsoredPartners.length}
                      </span>
                    </div>

                    {/* Manual Next / Prev arrows on hover */}
                    {sponsoredPartners.length > 1 && (
                      <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handlePrevSponsor();
                          }}
                          className="pointer-events-auto h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors shadow-md cursor-pointer"
                          title="Previous Partner"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleNextSponsor();
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
                          {sponsoredPartners[activeSponsorIdx]?.title}
                        </h4>
                        {sponsoredPartners[activeSponsorIdx]?.tagline && (
                          <p className="text-xs font-semibold text-amber-400">
                            {sponsoredPartners[activeSponsorIdx].tagline}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-white/80 font-normal leading-relaxed line-clamp-3">
                        {sponsoredPartners[activeSponsorIdx]?.description}
                      </p>

                      {/* CTA Link */}
                      {sponsoredPartners[activeSponsorIdx]?.linkUrl && (
                        <a
                          href={sponsoredPartners[activeSponsorIdx].linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          <span>{sponsoredPartners[activeSponsorIdx]?.ctaText || 'Visit Partner'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Advertise With Us Link */}
            <div className="shrink-0 flex items-center justify-between px-2 pt-0.5 text-[11px] font-mono text-muted-foreground">
              <span>Partner with MP Talent?</span>
              <Link href="/contact" className="text-brand font-bold hover:underline">
                Advertise →
              </Link>
            </div>
          </aside>

        </div>
      </section>

    </div>
  );
}
