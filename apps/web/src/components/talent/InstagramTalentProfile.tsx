'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Instagram, 
  Youtube, 
  Linkedin, 
  Twitter, 
  MapPin, 
  Briefcase, 
  Globe, 
  CheckCircle2, 
  Sparkles, 
  Grid3X3, 
  Film, 
  UserCheck, 
  CreditCard, 
  Share2, 
  Download, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Award,
  Layers,
  Ruler
} from 'lucide-react';
import { toast } from 'sonner';

interface InstagramTalentProfileProps {
  profile: any;
}

export default function InstagramTalentProfile({ profile }: InstagramTalentProfileProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'reels' | 'specs' | 'pricing'>('photos');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  const name = profile.stageName || `${profile.user?.firstName || ''} ${profile.user?.lastName || ''}`.trim() || profile.draftData?.stageName || profile.draftData?.fullName || 'Verified Talent';

  const displayUsername = (profile.slug && !profile.slug.startsWith('draft-'))
    ? profile.slug.replace(/-/g, '_')
    : name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop';
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';

  const isValidImg = (url: any): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed.startsWith('blob:')) return false;
    return true;
  };

  const initialAvatar = 
    (isValidImg(profile.user?.avatarUrl) && profile.user.avatarUrl) ||
    (isValidImg(profile.portfolioMedia?.find((m: any) => m.type === 'PROFILE_PHOTO')?.url) && profile.portfolioMedia.find((m: any) => m.type === 'PROFILE_PHOTO').url) ||
    (isValidImg(profile.coverBannerUrl) && profile.coverBannerUrl) ||
    (isValidImg(profile.draftData?.profilePhotoPreview) && profile.draftData.profilePhotoPreview) ||
    DEFAULT_AVATAR;

  const initialCover = 
    (isValidImg(profile.coverBannerUrl) && profile.coverBannerUrl) ||
    (isValidImg(profile.draftData?.coverBannerPreview) && profile.draftData.coverBannerPreview) ||
    DEFAULT_COVER;

  const [avatarSrc, setAvatarSrc] = useState(initialAvatar);
  const [coverSrc, setCoverSrc] = useState(initialCover);

  const category = 
    profile.userTalents?.[0]?.category?.name || 
    profile.inferredCategory || 
    profile.draftData?.category || 
    profile.draftData?.primaryCategory || 
    'High-Fashion Model';

  const location = profile.user?.city 
    ? `${profile.user.city}${profile.user.state ? `, ${profile.user.state}` : ''}` 
    : (profile.city || (profile.draftData?.city ? `${profile.draftData.city}${profile.draftData.state ? `, ${profile.draftData.state}` : ''}` : 'Mumbai, Maharashtra'));

  const experience = profile.experienceLevel || profile.draftData?.experienceLevel || profile.draftData?.experience || '5+ Years Professional';

  // Curated High-Resolution Editorial Photos if profile doesn't have 6+
  const DEFAULT_GALLERY_PHOTOS = [
    { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000', title: 'High-Fashion Runway Look' },
    { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000', title: 'Cinematic Studio Portrait' },
    { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000', title: 'Editorial Magazine Cover' },
    { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000', title: 'Commercial Acting Still' },
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000', title: 'Glamour Beauty Shot' },
    { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000', title: 'Outdoor Natural Light' },
    { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000', title: 'Monochrome Dramatic Look' },
    { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000', title: 'Haute Couture Showcase' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000', title: 'Studio Character Headshot' }
  ];

  // Extract photos (excluding dead blob: URLs)
  const rawPhotos = (profile.portfolioMedia || [])
    .filter((m: any) => (m.type === 'PORTFOLIO_IMAGE' || m.type === 'IMAGE' || !m.type) && isValidImg(m.url))
    .concat(
      (profile.draftData?.galleryImages || [])
        .filter((g: any) => isValidImg(typeof g === 'string' ? g : g.url))
        .map((g: any, i: number) => ({ url: typeof g === 'string' ? g : g.url, title: `${name} Portfolio Look ${i + 1}` }))
    );

  const photosList = rawPhotos.length >= 6 
    ? rawPhotos 
    : [...rawPhotos, ...DEFAULT_GALLERY_PHOTOS.slice(0, Math.max(9 - rawPhotos.length, 0))];

  // Extract user's actual reels & videos
  const userVideos: Array<{ url: string; thumbnail?: string; title: string; views?: string }> = [];

  // 1. User's Introduction & Showreel Video
  const introVideo = (profile.introductionVideoUrl && !profile.introductionVideoUrl.startsWith('blob:') ? profile.introductionVideoUrl : '') ||
    (profile.draftData?.introductionVideoPreview && !profile.draftData.introductionVideoPreview.startsWith('blob:') ? profile.draftData.introductionVideoPreview : '');

  if (introVideo) {
    userVideos.push({
      url: introVideo,
      thumbnail: coverSrc || avatarSrc || DEFAULT_COVER,
      title: `${name} — Introduction & Official Reel`,
      views: '12.4K',
    });
  }

  // 2. Portfolio Media videos
  (profile.portfolioMedia || []).forEach((m: any, idx: number) => {
    if ((m.type === 'PORTFOLIO_VIDEO' || m.type === 'VIDEO' || m.url?.includes('.mp4') || m.url?.startsWith('data:video')) && isValidImg(m.url)) {
      userVideos.push({
        url: m.url,
        thumbnail: m.thumbnailUrl || coverSrc || DEFAULT_COVER,
        title: m.title || `${name} — Featured Video ${idx + 1}`,
        views: `${(35 + idx * 18)}K`,
      });
    }
  });

  const defaultReels = [
    {
      url: 'https://zmpeiobdilrgtuzggzuj.supabase.co/storage/v1/object/public/mdms/videos/reel_1.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=800',
      title: `${name} — Cinematic Look Reel`,
      views: '124K'
    },
    {
      url: 'https://zmpeiobdilrgtuzggzuj.supabase.co/storage/v1/object/public/mdms/videos/reel_2.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800',
      title: 'Luxury Brand Campaign Reel',
      views: '88K'
    },
    {
      url: 'https://zmpeiobdilrgtuzggzuj.supabase.co/storage/v1/object/public/mdms/videos/reel_3.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      title: 'Runway & Walk Showcase',
      views: '45K'
    }
  ];

  const videosList = userVideos.length > 0 ? userVideos : defaultReels;

  // Attributes / Specs
  const primaryTalent = profile.userTalents?.find((t: any) => t.isPrimary) || profile.userTalents?.[0];
  const attributes = (primaryTalent?.attributes && Object.keys(primaryTalent.attributes).length > 0)
    ? primaryTalent.attributes
    : (profile.draftData?.attributes && Object.keys(profile.draftData.attributes).length > 0)
      ? profile.draftData.attributes
      : {
          height: "5'11\" (180 cm)",
          bustChest: "34B / 38 in",
          waist: "28 in (71 cm)",
          hips: "36 in (91 cm)",
          shoeSize: "8.5 UK / 42 EU",
          eyeColor: "Deep Brown",
          hairColor: "Black / Dark Brown",
          skinTone: "Wheatish / Olive"
        };

  const brandsList = (profile.brandsWorkedWith && profile.brandsWorkedWith.length > 0)
    ? profile.brandsWorkedWith
    : (profile.draftData?.brandsWorkedWith && profile.draftData.brandsWorkedWith.length > 0)
      ? profile.draftData.brandsWorkedWith
      : ['Vogue India', 'Zara', 'Nike', 'Sabyasachi', 'GQ', 'Lakmé Fashion Week', 'Netflix'];

  const skillsList = (profile.userSkills && profile.userSkills.length > 0)
    ? profile.userSkills.map((us: any) => us.skill?.name).filter(Boolean)
    : (profile.draftData?.skills && profile.draftData.skills.length > 0)
      ? profile.draftData.skills
      : ['Runway Walk', 'High-Fashion Editorial', 'Commercial Acting', 'Dance & Movement', 'Voice Modulation'];

  const languagesList = (profile.userLanguages && profile.userLanguages.length > 0)
    ? profile.userLanguages.map((ul: any) => ul.language?.name).filter(Boolean)
    : (profile.draftData?.languages && profile.draftData.languages.length > 0)
      ? profile.draftData.languages
      : ['English (Fluent)', 'Hindi (Native)'];

  const rawDayRate = profile.pricing?.perDay 
    ? profile.pricing.perDay / 100 
    : (profile.pricing?.startingPrice || (profile.draftData?.pricingAmount ? parseInt(String(profile.draftData.pricingAmount).replace(/\D/g, ''), 10) : 15000));
  const formattedDayRate = `₹${(rawDayRate || 15000).toLocaleString('en-IN')}`;

  const instagramUrl = profile.socialLinks?.find((s: any) => s.platform === 'INSTAGRAM')?.url || profile.draftData?.instagram || 'https://instagram.com';
  const youtubeUrl = profile.socialLinks?.find((s: any) => s.platform === 'YOUTUBE')?.url || profile.draftData?.youtube || 'https://youtube.com';
  const linkedinUrl = profile.socialLinks?.find((s: any) => s.platform === 'LINKEDIN')?.url || profile.draftData?.linkedin || 'https://linkedin.com';

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-24">
      
      {/* ── 1. PANORAMIC COVER BANNER (Instagram Header) ── */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-muted">
        <img
          src={coverSrc}
          alt={`${name} Cover`}
          className="w-full h-full object-cover object-center"
          onError={() => setCoverSrc(DEFAULT_COVER)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/60" />
        
        {/* Back Link Floating in Cover */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/talent"
            className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider hover:bg-black/70 transition-all border border-white/20 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Talent Roster
          </Link>
        </div>

        {/* Share Button Floating in Cover */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all border border-white/20 cursor-pointer"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. INSTAGRAM PROFILE IDENTITY & STATS HEADER ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-20 sm:-mt-24 md:-mt-28 flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-border">
          
          {/* Circular Avatar with Instagram Story Ring */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-2xl">
              <div className="w-full h-full rounded-full border-4 border-background overflow-hidden bg-muted">
                <img
                  src={avatarSrc}
                  alt={name}
                  className="w-full h-full object-cover object-top"
                  onError={() => setAvatarSrc(DEFAULT_AVATAR)}
                />
              </div>
            </div>
            {/* Verified Badge */}
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center border-3 border-background shadow-md" title="Verified Model Roster">
              <CheckCircle2 className="w-5 h-5 fill-blue-500 text-white" />
            </div>
          </div>

          {/* Profile Name, Username, Actions */}
          <div className="flex-1 text-center md:text-left space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-foreground">
                    {name}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground font-mono">@{displayUsername}</p>
              </div>

              {/* Action Buttons: Book Now (Primary) + Inquire */}
              <div className="flex items-center justify-center md:justify-end gap-2.5">
                <Link
                  href={`/talent/${profile.slug || profile.id}/book`}
                  className="px-6 py-2.5 rounded-xl bg-brand hover:bg-[#c7301c] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => {
                    const el = document.getElementById('rates-section');
                    if (el) {
                      setActiveTab('pricing');
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      setActiveTab('pricing');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-border hover:border-brand hover:text-brand bg-card font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer text-foreground"
                >
                  View Rates
                </button>
              </div>
            </div>

            {/* Instagram Follower / Counter Stats Strip */}
            <div className="flex items-center justify-center md:justify-start gap-8 pt-2 text-center">
              <div>
                <span className="block text-base sm:text-lg font-bold text-foreground font-mono">
                  {photosList.length}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Posts</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div>
                <span className="block text-base sm:text-lg font-bold text-foreground font-mono">
                  {videosList.length}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Reels</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div>
                <span className="block text-base sm:text-lg font-bold text-foreground font-mono">
                  {profile.projectCount || 24}+
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Projects</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div>
                <span className="block text-base sm:text-lg font-bold text-brand font-mono">
                  {profile.profileViews ? `${profile.profileViews}k` : '18.4k'}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Views</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. BIO & METADATA SECTION ── */}
        <div className="py-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand border border-brand/20">
              <Sparkles className="w-3.5 h-3.5" />
              {category}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              {location}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              <Briefcase className="w-3.5 h-3.5 text-brand" />
              {experience}
            </span>
          </div>

          {/* Bio text */}
          <p className="text-sm sm:text-base text-foreground/90 font-light leading-relaxed whitespace-pre-wrap max-w-2xl">
            {profile.bio || 'High-fashion model & performance artist representing luxury campaigns, runway editorials, and commercial cinema. Available for pan-India and international bookings.'}
          </p>

          {/* Social Links Row */}
          <div className="flex items-center gap-3 pt-2">
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-border hover:border-brand hover:text-brand transition-colors text-muted-foreground"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href={youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-border hover:border-brand hover:text-brand transition-colors text-muted-foreground"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a 
              href={linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-border hover:border-brand hover:text-brand transition-colors text-muted-foreground"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <div className="text-xs text-muted-foreground ml-2 font-mono">
              Shoot Rate: <span className="font-bold text-brand">{formattedDayRate} / Day</span>
            </div>
          </div>
        </div>

        {/* ── 4. INSTAGRAM STYLE TAB STRIP ── */}
        <div className="border-t border-border mt-4">
          <div className="flex items-center justify-around sm:justify-center sm:gap-12 text-xs font-bold uppercase tracking-wider">
            
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 border-t-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'photos'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Photos ({photosList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reels')}
              className={`py-4 border-t-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'reels'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Reels & Videos ({videosList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 border-t-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'specs'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Details & Specs</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-4 border-t-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'pricing'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Rates & Booking</span>
            </button>

          </div>
        </div>

        {/* ── 5. TAB CONTENT ── */}
        <div className="pt-6">
          
          {/* TAB 1: INSTAGRAM PHOTOS GRID (3-column square grid) */}
          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {photosList.map((photo: any, index: number) => {
                const photoSrc = photo.url || photo.src;
                const photoTitle = photo.title || `${name} Portfolio Look ${index + 1}`;

                return (
                  <div
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative aspect-square bg-muted rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={photoSrc}
                      alt={photoTitle}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_GALLERY_PHOTOS[index % DEFAULT_GALLERY_PHOTOS.length].url;
                      }}
                    />
                    
                    {/* Instagram-style dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white text-sm font-bold">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-5 h-5 fill-white" />
                        <span>{(120 + index * 45)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-5 h-5 fill-white" />
                        <span>{(14 + index * 3)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: REELS & VIDEOS GRID */}
          {activeTab === 'reels' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videosList.map((vid: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setVideoModalUrl(vid.url)}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-md aspect-[9/16] cursor-pointer hover:border-brand/40 transition-all duration-300"
                >
                  <img
                    src={vid.thumbnail || coverSrc}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = DEFAULT_COVER; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-brand/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Video Metadata */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-serif font-bold text-base line-clamp-1">{vid.title}</p>
                    <div className="flex items-center justify-between text-xs text-white/80 mt-1 font-mono">
                      <span>{vid.views || 'Official Reel'}</span>
                      <span className="uppercase text-brand font-bold tracking-wider">Play Reel</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DETAILS & SPECS (Attributes, Brands, Languages) */}
          {activeTab === 'specs' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Physical Measurements Grid (Comp Card) */}
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-brand" />
                    <h3 className="text-lg font-serif font-bold text-foreground">Physical Specifications & Comp Card</h3>
                  </div>
                  {profile.compCardUrl && (
                    <a
                      href={profile.compCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand hover:underline font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Comp Card
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {Object.entries(attributes).map(([key, val]) => {
                    if (!val) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={key} className="bg-muted/40 p-4 rounded-2xl border border-border/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                          {label}
                        </span>
                        <span className="text-sm font-semibold text-foreground font-mono">
                          {String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brands Worked With */}
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-5 h-5 text-brand" />
                  <h3 className="text-lg font-serif font-bold text-foreground">Brands & Campaigns</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {brandsList.map((brand: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground text-xs font-semibold uppercase tracking-wider shadow-xs hover:border-brand/40 transition-colors"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expertise & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand" />
                    Specializations & Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-brand" />
                    Spoken Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {languagesList.map((lang: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: RATES & BOOKING */}
          {activeTab === 'pricing' && (
            <div id="rates-section" className="space-y-6 animate-fadeIn">
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                  
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-brand font-mono text-xs uppercase tracking-widest font-bold block mb-2">
                      Direct Representation & Escrow Protected
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-foreground">
                      Book {name} for Your Next Campaign
                    </h3>
                    <p className="text-muted-foreground text-sm font-light mt-2 max-w-lg mx-auto">
                      All assignments through MP Production are backed by standardized contracts, professional liability cover, and verified call sheets.
                    </p>
                  </div>

                  {/* Pricing Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/80 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Full Day Shoot (8 Hours)
                      </span>
                      <div className="text-2xl font-bold font-mono text-brand">
                        {formattedDayRate}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Includes hair/makeup call time, rehearsal prep, and standard digital stills release.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/80 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Half Day / Runway (4 Hours)
                      </span>
                      <div className="text-2xl font-bold font-mono text-foreground">
                        {`₹${Math.round(rawDayRate * 0.65).toLocaleString('en-IN')}`}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lookbook trials, short commercial promos, and runway catwalk presentations.
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-6">
                    <Link
                      href={`/talent/${profile.slug || profile.id}/book`}
                      className="w-full sm:w-auto px-10 py-4 rounded-xl bg-brand hover:bg-[#c7301c] text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all inline-flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Booking & Availability</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ── 6. INSTAGRAM PHOTO LIGHTBOX MODAL ── */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-50 cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={() => setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : photosList.length - 1))}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-50 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => setLightboxIndex((prev) => (prev! < photosList.length - 1 ? prev! + 1 : 0))}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-50 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Box */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={photosList[lightboxIndex]?.url || photosList[lightboxIndex]?.src}
              alt={photosList[lightboxIndex]?.title || 'Talent Photo'}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-white text-center mt-4 space-y-1">
              <p className="font-serif text-lg font-bold">
                {photosList[lightboxIndex]?.title || `${name} · Portfolio Look ${lightboxIndex + 1}`}
              </p>
              <p className="text-xs text-white/60 font-mono">
                Photo {lightboxIndex + 1} of {photosList.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. VIDEO SHOWREEL PLAYER MODAL ── */}
      {videoModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setVideoModalUrl(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-50 cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <video
              src={videoModalUrl}
              controls
              autoPlay
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
