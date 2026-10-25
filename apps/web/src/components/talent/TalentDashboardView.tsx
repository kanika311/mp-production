'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  Film, 
  Camera, 
  Video, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink, 
  Eye, 
  SlidersHorizontal, 
  HelpCircle, 
  Share2, 
  Award, 
  Flame, 
  ChevronRight, 
  Calendar, 
  Check, 
  X, 
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  FolderOpen,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { SponsoredSidebarCard } from '@/components/ui/sponsored-sidebar-card';

interface TalentDashboardViewProps {
  profile: any;
  user: any;
  isApproved: boolean;
}

export function TalentDashboardView({ profile, user, isApproved }: TalentDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'castings' | 'media' | 'settings'>('overview');
  const [liveProfile, setLiveProfile] = useState<any>(profile);
  const [inboundRequests, setInboundRequests] = useState(profile.hireRequests || []);
  const [castingApplications, setCastingApplications] = useState(profile.castingApplications || []);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('mdms_auth_token');
      localStorage.removeItem('mdms_auth_role');
      localStorage.removeItem('mdms_auth_user');
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'mdms_auth_token=; path=/; max-age=0';
      document.cookie = 'next-auth.session-token=; path=/; max-age=0';
      toast.success('Logged out successfully');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncOverride = () => {
        try {
          const raw = localStorage.getItem(`talent_profile_override_${profile.id}`) ||
            localStorage.getItem(`talent_profile_override_${profile.userId}`) ||
            localStorage.getItem('talent_profile_override_me');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed) {
              setLiveProfile((prev: any) => ({
                ...prev,
                ...parsed,
                user: {
                  ...(prev.user || {}),
                  avatarUrl: parsed.avatarUrl || parsed.profilePhotoPreview || prev.user?.avatarUrl,
                },
                coverBannerUrl: parsed.coverBannerUrl || parsed.coverBannerPreview || prev.coverBannerUrl,
              }));
            }
          }
        } catch {}
      };
      syncOverride();
      window.addEventListener('talent_profile_updated', syncOverride);
      return () => window.removeEventListener('talent_profile_updated', syncOverride);
    }
  }, [profile.id, profile.userId]);

  const currentProfile = liveProfile || profile;
  const stageName = currentProfile.stageName || user?.name || 'Talent Member';
  const email = currentProfile.user?.email || user?.email;
  const phone = currentProfile.user?.phone || 'Not provided';
  const location = currentProfile.location || 'Mumbai, India';
  const category = currentProfile.userTalents?.[0]?.category?.name || (currentProfile.primaryTalentId ? 'Actor' : 'Actor / Creator');
  const experience = currentProfile.experienceLevel || 'Professional';
  const viewsCount = currentProfile.profileViews || 0;
  const projectsCount = currentProfile.projectCount || 0;
  const avatarUrl = currentProfile.user?.avatarUrl || currentProfile.avatarUrl || currentProfile.portfolioMedia?.[0]?.url;

  const handleAction = (type: 'accept' | 'decline', reqId: string) => {
    setInboundRequests((prev: any[]) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: type === 'accept' ? 'ACCEPTED' : 'DECLINED' } : r))
    );
    toast.success(type === 'accept' ? 'Booking inquiry accepted!' : 'Booking inquiry declined.');
  };

  const renderSidebarContent = (isDrawer = false) => (
    <div className="space-y-4">
      {/* Profile Identity Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-brand/20 via-brand-gold/15 to-amber-500/10 pointer-events-none" />

        <div className="relative flex flex-col items-center text-center pt-4">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand/40 bg-muted shadow-md flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={stageName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand/80 to-brand-glow text-white font-extrabold text-2xl flex items-center justify-center">
                  {stageName.charAt(0)}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border border-border shadow-xs">
              {isApproved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              )}
            </span>
          </div>

          <h3 className="font-serif font-bold text-lg text-foreground tracking-tight">{stageName}</h3>
          <span className="text-xs uppercase font-extrabold tracking-wider text-brand mt-0.5">{category}</span>

          {/* Status Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isApproved 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {isApproved ? 'Approved & Live' : 'Under Review'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border text-muted-foreground">
              {experience}
            </span>
          </div>

          {/* Quick Info List */}
          <div className="w-full mt-4 pt-4 border-t border-border/70 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Location</span>
              <span className="font-semibold text-foreground truncate max-w-[130px]">{location}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-primary" /> Profile Views</span>
              <span className="font-semibold text-foreground">{viewsCount}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" /> Shoots Done</span>
              <span className="font-semibold text-foreground">{projectsCount}</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="w-full mt-4 flex gap-2">
            <Link
              href="/talent-dashboard/edit"
              onClick={() => isDrawer && setIsMobileDrawerOpen(false)}
              className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all"
            >
              Edit Profile
            </Link>
            <Link
              href={`/talent/${profile.slug || profile.id || ''}`}
              target="_blank"
              onClick={() => isDrawer && setIsMobileDrawerOpen(false)}
              className="py-2 px-3 rounded-xl text-center text-xs font-bold border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center"
              title="Public Profile"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation Panel (Like Reference Screenshot) */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Talent Panel
        </div>

        <button
          onClick={() => {
            setActiveTab('overview');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-brand text-white shadow-xs'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4" />
            <span>Overview &amp; Activity</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          onClick={() => {
            setActiveTab('requests');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-brand text-white shadow-xs'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4" />
            <span>Inbound Direct Requests</span>
          </div>
          {inboundRequests.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'requests' ? 'bg-white text-brand' : 'bg-brand/10 text-brand'
            }`}>
              {inboundRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('castings');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'castings'
              ? 'bg-brand text-white shadow-xs'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4" />
            <span>Casting Applications</span>
          </div>
          {castingApplications.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'castings' ? 'bg-white text-brand' : 'bg-muted text-muted-foreground'
            }`}>
              {castingApplications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('media');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'bg-brand text-white shadow-xs'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Camera className="w-4 h-4" />
            <span>Portfolio &amp; Showreel</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        <Link
          href="/talent"
          onClick={() => isDrawer && setIsMobileDrawerOpen(false)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Browse Live Casting Board</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </Link>

        <Link
          href="/talent-dashboard/edit"
          onClick={() => isDrawer && setIsMobileDrawerOpen(false)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Profile Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </Link>

        <div className="pt-1.5 mt-1 border-t border-border/60">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Logout</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-70 text-rose-500/60" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-background text-foreground pt-20 pb-16">
      {/* ── Sub-header / Breadcrumb Bar (Full Width, No Empty Margins) ── */}
      <div className="border-b border-border/80 bg-surface/50 backdrop-blur-md sticky top-[60px] z-30 shadow-xs">
        <div className="w-full px-3 md:px-5 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* ── Mobile Filter Drawer Trigger Icon (Matching User Reference Image 2) ── */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden w-10 h-10 rounded-2xl border-2 border-brand bg-card hover:bg-brand/10 text-brand shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
              title="Open Talent Menu & Filters"
              aria-label="Open Sidebar Menu"
            >
              <SlidersHorizontal className="w-5 h-5 text-brand stroke-[2.4]" />
            </button>

            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Talent Command Center
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/talent" className="hover:text-foreground transition-colors">Talent Directory</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/talent/${profile.slug || profile.id || ''}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-xs font-bold transition-all text-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">View Public Profile</span>
            </Link>
            <Link
              href="/talent-dashboard/edit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand text-white hover:bg-brand/90 text-xs font-bold shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Edit Profile</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all cursor-pointer"
              title="Logout from Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Floating Filter Button (Bottom-Left Quick Access, Matching Image 2) ── */}
      <div className="fixed bottom-6 left-5 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl border-2 border-brand bg-card/95 backdrop-blur-md text-brand shadow-xl shadow-brand/25 flex items-center justify-center transition-all active:scale-90 hover:scale-105 cursor-pointer ring-4 ring-brand/15"
          title="Open Talent Menu & Filters"
          aria-label="Open Sidebar Menu"
        >
          <SlidersHorizontal className="w-6 h-6 stroke-[2.4] text-brand" />
        </button>
      </div>

      {/* ── Mobile Slide-over Drawer (Opens on Filter Icon Click) ── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide Drawer Content */}
            <motion.div
              data-lenis-prevent="true"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 h-[100dvh] max-h-[100dvh] w-[88%] max-w-[340px] bg-background border-r border-border shadow-2xl z-50 flex flex-col overflow-hidden"
              style={{
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Bar (Fixed Header) */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl border-2 border-brand bg-brand/10 text-brand flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-foreground">Talent Menu</h4>
                    <p className="text-[10px] text-muted-foreground">Profile &amp; Navigation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div 
                data-lenis-prevent="true"
                className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 space-y-4 pb-20 select-text"
                style={{
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {/* Render identical Left Panel content inside Drawer */}
                {renderSidebarContent(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main 3-Column Layout: Full Window Width & Sticky Sidebars ── */}
      <div className="w-full px-2 sm:px-3 lg:px-4 mt-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start">

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 1 (LEFT SIDEBAR): Desktop Only (Hidden on Mobile, Opens as Drawer)
              ══════════════════════════════════════════════════════════════════ */}
          <aside 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="hidden lg:block lg:col-span-3 lg:sticky lg:top-[115px] lg:h-[calc(100vh-130px)] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto overscroll-contain touch-pan-y pr-1 pb-16 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {renderSidebarContent(false)}
          </aside>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 2 (CENTER): Main Content, Feed & Cards
              ══════════════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-6 space-y-6">
            {/* Quick Broadcast / Work Showcase Card (Like Reference Screenshot post box) */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                  {stageName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">Quick Action Studio</p>
                  <p className="text-sm font-bold text-foreground">What would you like to update today, {stageName}?</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                <Link
                  href="/talent-dashboard/edit"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface hover:bg-muted text-xs font-bold text-foreground transition-all border border-border/70"
                >
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>Add Photos</span>
                </Link>
                <Link
                  href="/talent-dashboard/edit"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface hover:bg-muted text-xs font-bold text-foreground transition-all border border-border/70"
                >
                  <Video className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Attach Reel</span>
                </Link>
                <Link
                  href="/talent"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand text-white hover:bg-brand/90 text-xs font-bold transition-all shadow-xs"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Apply Roles</span>
                </Link>
              </div>
            </div>

            {/* Performance Metric Counters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Roster Status
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="font-serif font-bold text-sm sm:text-base text-foreground truncate">
                    {isApproved ? 'Active Roster' : 'Under Review'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Profile Views
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-lg sm:text-xl text-foreground">{viewsCount}</span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Bookings
                </span>
                <span className="font-serif font-bold text-lg sm:text-xl text-foreground">{projectsCount}</span>
              </div>
            </div>

            {/* Inbound Direct Requests Section */}
            {(activeTab === 'overview' || activeTab === 'requests') && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">Inbound Direct Requests</h4>
                    <p className="text-xs text-muted-foreground">Direct booking and shoot inquiries from verified clients</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand">
                    {inboundRequests.length} Inquiries
                  </span>
                </div>

                {inboundRequests.length > 0 ? (
                  <div className="space-y-3">
                    {inboundRequests.map((hr: any) => (
                      <div key={hr.id} className="p-4 rounded-xl border border-border bg-surface/50 hover:bg-surface transition-all space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-sm text-foreground">{hr.requesterName || 'Production Client'}</h5>
                            <p className="text-xs text-muted-foreground mt-0.5">{hr.projectType || 'Commercial Shoot'}</p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            hr.status === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-500' :
                            hr.status === 'DECLINED' ? 'bg-rose-500/15 text-rose-500' :
                            'bg-amber-500/15 text-amber-500'
                          }`}>
                            {hr.status || 'NEW'}
                          </span>
                        </div>

                        {hr.message && (
                          <p className="text-xs text-foreground/80 bg-background/80 p-2.5 rounded-lg border border-border/60 italic">
                            &ldquo;{hr.message}&rdquo;
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary" /> {hr.shootDate || 'Flexible Dates'}
                          </span>

                          {(!hr.status || hr.status === 'NEW' || hr.status === 'PENDING') && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction('accept', hr.id)}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Accept
                              </button>
                              <button
                                onClick={() => handleAction('decline', hr.id)}
                                className="px-3 py-1 rounded-lg text-xs font-bold border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-surface/30">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-2">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">No pending direct hire requests</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      When production clients book you directly from the talent directory, inquiries will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Active Casting Applications Section */}
            {(activeTab === 'overview' || activeTab === 'castings') && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">Active Casting Applications</h4>
                    <p className="text-xs text-muted-foreground">Track roles and auditions you have applied for</p>
                  </div>
                  <Link
                    href="/talent"
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                  >
                    <span>Browse All</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {castingApplications.length > 0 ? (
                  <div className="space-y-3">
                    {castingApplications.map((app: any) => (
                      <div key={app.id} className="p-4 rounded-xl border border-border bg-surface/50 hover:bg-surface transition-all flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-sm text-foreground">{app.castingCall?.title || 'Audition Application'}</h5>
                          <span className="text-[11px] text-muted-foreground mt-0.5 block">
                            {app.castingCall?.projectType || 'Digital / Commercial'} • Applied {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          app.status === 'SHORTLISTED' ? 'bg-primary text-white' :
                          app.status === 'SELECTED' ? 'bg-emerald-500 text-white' :
                          'bg-surface-elevated text-muted-foreground border border-border'
                        }`}>
                          {app.status || 'SUBMITTED'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-surface/30">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-2">
                      <Film className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">You haven&apos;t applied to any castings yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-4">
                      Explore live character roles, commercial shoots, and fashion campaigns on our casting board.
                    </p>
                    <Link
                      href="/talent"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand/90 transition-all shadow-xs"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Browse Live Auditions</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Portfolio & Media Preview Section */}
            {(activeTab === 'overview' || activeTab === 'media') && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">Media & Showreels</h4>
                    <p className="text-xs text-muted-foreground">Assets visible to casting directors and brand managers</p>
                  </div>
                  <Link
                    href="/talent-dashboard/edit"
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                  >
                    <span>Manage Media</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {profile.portfolioMedia && profile.portfolioMedia.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {profile.portfolioMedia.map((m: any, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted group">
                        <img src={m.url} alt="Media asset" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-[10px] text-white font-bold uppercase truncate">{m.title || 'Photo'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border bg-surface/30">
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-bold text-foreground">No media assets uploaded yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">Upload headshots and showreel to attract 3x more casting calls.</p>
                    <Link
                      href="/talent-dashboard/edit"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      <span>Upload Headshots</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 3 (RIGHT SIDEBAR): Full-Height Sponsored Partner Panel
              ══════════════════════════════════════════════════════════════════ */}
          <aside 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full lg:col-span-3 lg:sticky lg:top-[115px] self-start h-[calc(100vh-130px)] min-h-[500px]"
          >
            <SponsoredSidebarCard context="talent" showAdvertiseLink={true} className="h-full" />
          </aside>

        </div>
      </div>
    </div>
  );
}
