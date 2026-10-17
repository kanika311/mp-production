'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  User, 
  DollarSign, 
  SlidersHorizontal,
  Flame,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface TalentDiscoveryFeedProps {
  initialTalents: TalentItem[];
}

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
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Types');
  const [selectedExperience, setSelectedExperience] = useState('All Experience');
  const [selectedGender, setSelectedGender] = useState('All Genders');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [selectedPriceTier, setSelectedPriceTier] = useState('all');

  // Fallback high-res profile placeholders if user hasn't uploaded headshot yet
  const fallbackAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Types');
    setSelectedExperience('All Experience');
    setSelectedGender('All Genders');
    setSelectedCity('All Cities');
    setSelectedSort('featured');
    setSelectedPriceTier('all');
  };

  const isFiltered = 
    searchQuery !== '' ||
    selectedCategory !== 'All Types' ||
    selectedExperience !== 'All Experience' ||
    selectedGender !== 'All Genders' ||
    selectedCity !== 'All Cities' ||
    selectedSort !== 'featured' ||
    selectedPriceTier !== 'all';

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

  return (
    <div className="w-full">
      
      {/* ── STICKY TOP SEARCH BAR (Flush right under Navbar at top-16 with solid background and top mask) ── */}
      <div className="sticky top-16 z-30 bg-background border-b border-border shadow-xs py-3 px-4 sm:px-6 lg:px-8 before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-full before:h-24 before:bg-background before:z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full md:max-w-2xl flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search talent by name, profession, city, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-card border border-border rounded-xl text-foreground text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-xs text-muted-foreground hover:text-foreground font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0">
            <div className="text-xs font-semibold text-muted-foreground">
              Showing <span className="text-foreground font-bold">{filteredTalents.length}</span> Verified Profiles
            </div>

            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-brand hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Sticky Left Filter Panel + Right Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT PANEL: STICKY FILTERS (Exact Yogsathi Style) ── */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-[128px] z-20 space-y-4 self-start">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm lg:max-h-[calc(100vh-148px)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-brand/50">
            
            {/* Filter Header Box */}
            <div className="bg-gradient-to-r from-brand to-[#c7301c] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">FIND YOUR TALENT</span>
              </div>
              {isFiltered && (
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] underline text-white/90 hover:text-white cursor-pointer font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-5 space-y-5 text-sm">
              
              {/* Category / Profession Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Talent Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Experience Level
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
                >
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* City / Location Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Location / City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
                >
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Rate / Budget Tier */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Cost Per Day Shoot
                </label>
                <select
                  value={selectedPriceTier}
                  onChange={(e) => setSelectedPriceTier(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
                >
                  {PRICE_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Sort By
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Action */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2.5 rounded-xl border border-border hover:bg-surface font-semibold text-xs transition-colors flex items-center justify-center gap-2 text-foreground cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL: TALENT CARDS GRID (Exact Yogsathi Style Cards, Center Scroll) ── */}
        <main className="lg:col-span-8 xl:col-span-9 lg:max-h-[calc(100vh-148px)] lg:overflow-y-auto lg:pr-2 pb-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-brand/50">
          {filteredTalents.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
              <h3 className="text-xl font-serif font-bold text-foreground">No Talents Found</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                No profiles match your active search filters. Try clearing your category, city, or experience criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-full bg-brand text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-110"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTalents.map((talent, idx) => {
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
                    ? talent.userSkills.slice(0, 3).map((s) => s.skill?.name).filter(Boolean).join(' • ')
                    : (talent.brandsWorkedWith && talent.brandsWorkedWith.length > 0
                        ? talent.brandsWorkedWith.slice(0, 3).join(' • ')
                        : 'Fashion Editorial • Commercial • Runway');

                const rawRate = talent.pricing?.perDay ? talent.pricing.perDay / 100 : (talent.pricing?.startingPrice || 4999);
                const formattedRate = rawRate ? `₹${rawRate.toLocaleString('en-IN')}` : '₹4,999';

                const profileUrl = `/talent/${talent.slug || talent.id}`;

                return (
                  <div
                    key={talent.id}
                    className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-brand/40 relative overflow-hidden"
                  >
                    {/* Top Section: Centered Circular Avatar + Verified */}
                    <div className="space-y-4 text-center">
                      
                      {/* Avatar Circle (Yogsathi signature circular headshot) */}
                      <Link href={profileUrl} className="block relative mx-auto w-28 h-28 group-hover:scale-105 transition-transform duration-300">
                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-brand to-amber-500 shadow-md overflow-hidden">
                          <img
                            src={avatar}
                            alt={name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-card shadow-sm" title="Verified Roster">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </Link>

                      {/* Name & Profession */}
                      <div>
                        <Link href={profileUrl} className="block">
                          <h3 className="text-lg font-serif font-bold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                            {name}
                          </h3>
                        </Link>
                        
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-brand/10 text-brand border border-brand/20">
                            <span>{category}</span>
                            <Sparkles className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                      {/* Key Meta Items (Icons exactly like Yogsathi) */}
                      <div className="text-left space-y-2 text-xs text-muted-foreground pt-3 border-t border-border/60 font-light">
                        
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span className="line-clamp-1 font-medium text-foreground/90">{experience}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span className="line-clamp-1">{languages}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span className="line-clamp-1">{location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span className="line-clamp-1 text-[11px]">{skillsStr}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Pricing & Actions */}
                    <div className="pt-5 mt-5 border-t border-border space-y-3">
                      
                      {/* Price per Day Shoot */}
                      <div className="text-center">
                        <div className="text-base font-bold text-foreground font-mono">
                          <span className="text-brand text-lg">{formattedRate}</span>
                          <span className="text-xs text-muted-foreground font-sans font-normal"> / Day Shoot</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          Direct Booking • Escrow Protected
                        </span>
                      </div>

                      {/* Action Buttons: Book Now (Primary) + View Profile (Secondary) */}
                      <div className="space-y-2 pt-1">
                        <Link
                          href={`/talent/${talent.slug || talent.id}/book`}
                          className="w-full py-2.5 rounded-xl bg-brand hover:bg-[#c7301c] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Book Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={profileUrl}
                          className="w-full py-2 rounded-xl border border-border hover:border-brand hover:text-brand bg-surface font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-foreground"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>

  </div>
);
}
