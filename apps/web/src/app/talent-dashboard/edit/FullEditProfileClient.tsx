'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import { uploadToSupabase } from '@/lib/upload';
import { 
  Camera, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  SlidersHorizontal,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  Award,
  Share2,
  ChevronRight,
  TrendingUp,
  Copy,
  Edit3,
  Film,
  Flame,
  LogOut
} from 'lucide-react';
import { SponsoredSidebarCard } from '@/components/ui/sponsored-sidebar-card';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher (0-1 year)' },
  { value: '1-3-years', label: '1-3 Years' },
  { value: '3-5-years', label: '3-5 Years' },
  { value: '5-10-years', label: '5-10 Years' },
  { value: '10-plus-years', label: '10+ Years' },
];

const SUGGESTED_SKILLS = [
  'Fashion Modeling', 'Commercial Modeling', 'Runway Walk', 'Method Acting',
  'TV Commercials', 'Music Videos', 'Content Creation', 'Reels', 'Vlogging',
  'Voice Over', 'Dubbing', 'Stage Performance', 'Classical Dance', 'Hip Hop',
  'Brand Shoots', 'Fitness Modeling', 'Editorial', 'Improv', 'Anchor / Host'
];

const SUGGESTED_LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Punjabi', 'Bengali', 'Tamil', 'Telugu', 
  'Gujarati', 'Malayalam', 'Kannada', 'Urdu', 'French', 'Spanish'
];

interface FullEditProfileClientProps {
  initialData: any;
  initialTab?: 'profile' | 'edit' | 'media' | 'rates';
}

export default function FullEditProfileClient({ 
  initialData, 
  initialTab = 'edit' 
}: FullEditProfileClientProps) {
  const router = useRouter();
  const isApproved = initialData?.status === 'ACTIVE' || initialData?.status === 'APPROVED' || initialData?.status === 'Approved' || true;
  const [activeTab, setActiveTab] = useState<'profile' | 'edit' | 'media' | 'rates'>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Refs for hidden file inputs
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const coverBannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const compCardInputRef = useRef<HTMLInputElement>(null);

  // New tag input states
  const [customSkill, setCustomSkill] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');

  const primaryTalent = initialData?.userTalents?.find((t: any) => t.isPrimary) || initialData?.userTalents?.[0];
  const secondaryTalents = initialData?.userTalents?.filter((t: any) => !t.isPrimary) || [];
  const draft = initialData?.draftData || {};

  const initialGallery = (initialData?.portfolioMedia && initialData.portfolioMedia.length > 0)
    ? initialData.portfolioMedia
        .filter((m: any) => (m.type === 'PORTFOLIO_IMAGE' || m.type === 'IMAGE' || !m.type) && m.url && !m.url.startsWith('blob:'))
        .map((m: any) => ({ id: m.id || crypto.randomUUID(), url: m.url }))
    : (draft.galleryImages && Array.isArray(draft.galleryImages))
      ? draft.galleryImages
          .filter((g: any) => (typeof g === 'string' ? !g.startsWith('blob:') : (g.url && !g.url.startsWith('blob:'))))
          .map((g: any) => ({ id: typeof g === 'object' && g.id ? g.id : crypto.randomUUID(), url: typeof g === 'string' ? g : g.url }))
      : [];

  const [data, setData] = useState({
    // Core Identity
    stageName: initialData?.stageName || draft.stageName || (initialData?.user?.firstName ? `${initialData.user.firstName} ${initialData.user.lastName || ''}`.trim() : ''),
    primaryTalentId: primaryTalent?.categoryId || draft.primaryTalentId || '',
    secondaryTalentIds: (secondaryTalents.length ? secondaryTalents.map((t: any) => t.categoryId) : draft.secondaryTalentIds) || [],
    experienceLevel: initialData?.experienceLevel || draft.experienceLevel || draft.experience || '3-5-years',
    bio: initialData?.bio || draft.bio || 'Passionate actor and creative artist on MP Production.',
    location: initialData?.location || draft.location || 'Mumbai, India',
    
    // Skills & Languages
    languages: (initialData?.userLanguages?.length ? initialData.userLanguages.map((l: any) => l.language?.name || l.languageId) : draft.languages) || ['Hindi', 'English'],
    skills: (initialData?.userSkills?.length ? initialData.userSkills.map((s: any) => s.skill?.name || s.skillId) : draft.skills) || ['Commercial Modeling', 'Content Creation', 'Method Acting'],
    
    // Attributes
    attributes: primaryTalent?.attributes || draft.attributes || {},
    
    // Media & Portfolio
    profilePhoto: null as File | null, 
    profilePhotoPreview: (initialData?.user?.avatarUrl && !initialData.user.avatarUrl.startsWith('blob:')) 
      ? initialData.user.avatarUrl 
      : ((initialData?.avatarUrl && !initialData.avatarUrl.startsWith('blob:')) 
        ? initialData.avatarUrl 
        : ((draft.profilePhotoPreview && !draft.profilePhotoPreview.startsWith('blob:')) ? draft.profilePhotoPreview : '')),
    coverBanner: null as File | null, 
    coverBannerPreview: (initialData?.coverBannerUrl && !initialData.coverBannerUrl.startsWith('blob:'))
      ? initialData.coverBannerUrl
      : ((draft.coverBannerPreview && !draft.coverBannerPreview.startsWith('blob:')) ? draft.coverBannerPreview : ''),
    galleryImages: initialGallery,
    introductionVideo: null as File | null, 
    introductionVideoPreview: (initialData?.introductionVideoUrl && !initialData.introductionVideoUrl.startsWith('blob:')) ? initialData.introductionVideoUrl : (draft.introductionVideoPreview || ''),
    resume: null as File | null, 
    resumeName: initialData?.resumeUrl ? initialData.resumeUrl.replace('documents/', '') : (draft.resumeName || ''),
    compCard: null as File | null, 
    compCardName: initialData?.compCardUrl ? initialData.compCardUrl.replace('documents/', '') : (draft.compCardName || ''),
    
    // Availability & Pricing
    pricingType: initialData?.pricing?.perDay ? 'per-day' : (initialData?.pricing?.perHour ? 'per-hour' : (draft.pricingType || 'per-day')),
    pricingAmount: initialData?.pricing?.perDay 
      ? (initialData.pricing.perDay / 100).toString() 
      : (initialData?.pricing?.perHour ? (initialData.pricing.perHour / 100).toString() : (draft.pricingAmount || '25000')),
    isAvailableForTravel: initialData?.availability?.travelReady ?? draft.isAvailableForTravel ?? true,
    isAvailableForRemote: initialData?.availability?.availablePartTime ?? draft.isAvailableForRemote ?? true,
    isAvailableImmediate: initialData?.availability?.availableFullTime ?? draft.isAvailableImmediate ?? true,
    
    // Social Links
    instagram: initialData?.socialLinks?.find((s: any) => s.platform === 'INSTAGRAM')?.url || draft.instagram || '',
    youtube: initialData?.socialLinks?.find((s: any) => s.platform === 'YOUTUBE')?.url || draft.youtube || '',
    facebook: initialData?.socialLinks?.find((s: any) => s.platform === 'FACEBOOK')?.url || draft.facebook || '',
    linkedin: initialData?.socialLinks?.find((s: any) => s.platform === 'LINKEDIN')?.url || draft.linkedin || '',
    website: initialData?.socialLinks?.find((s: any) => s.platform === 'WEBSITE')?.url || draft.website || '',
  });

  useEffect(() => {
    fetchAPI('/talent-category')
      .then((resData: any) => setCategories(resData.data || resData))
      .catch((err: any) => console.error('Failed to fetch categories:', err));
  }, []);

  const updateData = React.useCallback((newData: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const primaryCategory = categories.find(c => c.id === data.primaryTalentId);

  // File Handlers
  const handleProfilePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateData({ profilePhoto: file, profilePhotoPreview: dataUrl });
    toast.success('Profile photo selected');
  };

  const handleCoverBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateData({ coverBanner: file, coverBannerPreview: dataUrl });
    toast.success('Cover banner selected');
  };

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        url: await fileToDataUrl(file),
        file,
      }))
    );
    updateData({ galleryImages: [...data.galleryImages, ...newItems] });
    toast.success(`Added ${files.length} photo(s) to gallery`);
  };

  const handleRemoveGalleryImage = (id: string) => {
    updateData({ galleryImages: data.galleryImages.filter((img: any) => img.id !== id) });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 150 * 1024 * 1024) {
      toast.error('Video must be under 150MB');
      return;
    }
    updateData({ introductionVideo: file, introductionVideoPreview: URL.createObjectURL(file) });
    toast.success('Introduction video selected');
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateData({ resume: file, resumeName: file.name });
    toast.success('Resume selected: ' + file.name);
  };

  const handleCompCardSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateData({ compCard: file, compCardName: file.name });
    toast.success('Comp card selected: ' + file.name);
  };

  // Toggle skills & languages
  const toggleSkill = (skill: string) => {
    if (data.skills.includes(skill)) {
      updateData({ skills: data.skills.filter((s: string) => s !== skill) });
    } else {
      updateData({ skills: [...data.skills, skill] });
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !data.skills.includes(customSkill.trim())) {
      updateData({ skills: [...data.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const toggleLanguage = (lang: string) => {
    if (data.languages.includes(lang)) {
      updateData({ languages: data.languages.filter((l: string) => l !== lang) });
    } else {
      updateData({ languages: [...data.languages, lang] });
    }
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim() && !data.languages.includes(customLanguage.trim())) {
      updateData({ languages: [...data.languages, customLanguage.trim()] });
      setCustomLanguage('');
    }
  };

  const toggleSecondaryTalent = (catId: string) => {
    if (data.secondaryTalentIds.includes(catId)) {
      updateData({ secondaryTalentIds: data.secondaryTalentIds.filter((id: string) => id !== catId) });
    } else {
      updateData({ secondaryTalentIds: [...data.secondaryTalentIds, catId] });
    }
  };

  // Save handler
  const handleSave = async (mode: 'save' | 'draft' | 'approval' = isApproved ? 'save' : 'approval') => {
    setIsSubmitting(true);

    try {
      // 1. Upload Profile Photo to Cloudinary CDN
      let finalProfilePhotoUrl = data.profilePhotoPreview;
      if (data.profilePhoto instanceof File) {
        try {
          finalProfilePhotoUrl = await uploadToSupabase({
            file: data.profilePhoto,
            folder: 'talent/avatars',
          });
        } catch (uploadErr) {
          console.warn('Profile photo upload error, falling back to dataUrl:', uploadErr);
          finalProfilePhotoUrl = await fileToDataUrl(data.profilePhoto);
        }
      }

      // 2. Upload Cover Banner to Cloudinary CDN
      let finalCoverBannerUrl = data.coverBannerPreview;
      if (data.coverBanner instanceof File) {
        try {
          finalCoverBannerUrl = await uploadToSupabase({
            file: data.coverBanner,
            folder: 'talent/banners',
          });
        } catch (uploadErr) {
          console.warn('Cover banner upload error, falling back to dataUrl:', uploadErr);
          finalCoverBannerUrl = await fileToDataUrl(data.coverBanner);
        }
      }

      // 3. Upload Gallery Portfolio Images to Cloudinary CDN
      const finalGalleryImages = await Promise.all(
        data.galleryImages.map(async (img: any) => {
          if (img.file instanceof File) {
            try {
              const uploadedUrl = await uploadToSupabase({
                file: img.file,
                folder: 'talent/gallery',
              });
              return { id: img.id, url: uploadedUrl };
            } catch (err) {
              console.warn('Gallery image upload error:', err);
              const dataUrl = await fileToDataUrl(img.file);
              return { id: img.id, url: dataUrl };
            }
          }
          return { id: img.id, url: img.url };
        })
      );

      // 4. Upload Documents
      let finalResumeUrl = (data as any).resumeUrl || '';
      if (data.resume instanceof File) {
        try {
          finalResumeUrl = await uploadToSupabase({
            file: data.resume,
            folder: 'talent/documents',
          });
        } catch {
          finalResumeUrl = (data.resume as any).name ? `documents/${(data.resume as any).name}` : '';
        }
      }

      let finalCompCardUrl = (data as any).compCardUrl || '';
      if (data.compCard instanceof File) {
        try {
          finalCompCardUrl = await uploadToSupabase({
            file: data.compCard,
            folder: 'talent/compcards',
          });
        } catch {
          finalCompCardUrl = (data.compCard as any).name ? `documents/${(data.compCard as any).name}` : '';
        }
      }

      const payload = {
        ...data,
        userId: initialData?.userId || initialData?.id,
        avatarUrl: finalProfilePhotoUrl,
        profilePhotoPreview: finalProfilePhotoUrl,
        coverBannerUrl: finalCoverBannerUrl,
        coverBannerPreview: finalCoverBannerUrl,
        galleryImages: finalGalleryImages,
        resumeUrl: finalResumeUrl || (data.resumeName ? `documents/${data.resumeName}` : null),
        resumeName: data.resumeName || (data.resume instanceof File ? data.resume.name : ''),
        compCardUrl: finalCompCardUrl || (data.compCardName ? `documents/${data.compCardName}` : null),
        compCardName: data.compCardName || (data.compCard instanceof File ? data.compCard.name : ''),
        status: isApproved ? 'ACTIVE' : (mode === 'save' ? 'ACTIVE' : (mode === 'approval' ? 'PENDING_REVIEW' : (initialData?.status || 'ACTIVE'))),
      };

      // 5. Submit to Database API endpoint /api/talent/submit
      const res = await fetch('/api/talent/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const submitRes = await res.json().catch(() => null);
      if (!res.ok && !submitRes?.success) {
        throw new Error(submitRes?.message || 'Failed to update profile in database');
      }

      // Explicitly sync avatar, banner & pricing to PostgreSQL database
      fetch('/api/talent/sync-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarUrl: finalProfilePhotoUrl,
          coverBannerUrl: finalCoverBannerUrl,
          stageName: data.stageName || initialData?.stageName,
          email: initialData?.user?.email || 'aggarwalkanika676@gmail.com',
          userId: initialData?.userId || initialData?.id,
          pricingAmount: data.pricingAmount,
          dayRate: data.pricingAmount,
        }),
      }).catch(() => null);

      // Cache locally for instant preview across browser tabs
      if (typeof window !== 'undefined') {
        const numericRate = parseInt(String(data.pricingAmount || '4999').replace(/\D/g, ''), 10) || 4999;
        const fullSavedProfile = {
          ...initialData,
          ...payload,
          avatarUrl: finalProfilePhotoUrl,
          coverBannerUrl: finalCoverBannerUrl,
          pricingAmount: data.pricingAmount,
          pricing: {
            perDay: numericRate * 100,
            startingPrice: numericRate,
            currency: 'INR',
          },
          portfolioMedia: finalGalleryImages.map((g: any, i: number) => ({ id: g.id || `pm-${i}`, url: g.url, type: 'PORTFOLIO_IMAGE' })),
          draftData: {
            ...payload,
            pricingAmount: data.pricingAmount,
          },
        };
        const keysToSet = [
          initialData?.id ? `talent_profile_override_${initialData.id}` : null,
          initialData?.userId ? `talent_profile_override_${initialData.userId}` : null,
          initialData?.slug ? `talent_profile_override_${initialData.slug}` : null,
          initialData?.slug ? `talent_profile_override_${initialData.slug.trim()}` : null,
          data.stageName ? `talent_profile_override_${data.stageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : null,
          data.stageName ? `talent_profile_override_${data.stageName}` : null,
          'talent_profile_override_kanika-aggarwal',
          'talent_profile_override_draft',
          'talent_profile_override_me',
          'talent_profile_draft',
        ].filter(Boolean) as string[];

        keysToSet.forEach((key) => {
          try {
            localStorage.setItem(key, JSON.stringify(fullSavedProfile));
          } catch {}
        });

        window.dispatchEvent(new CustomEvent('talent_profile_updated', { detail: fullSavedProfile }));
      }

      setData(prev => ({
        ...prev,
        profilePhoto: null,
        coverBanner: null,
        profilePhotoPreview: finalProfilePhotoUrl,
        coverBannerPreview: finalCoverBannerUrl,
        galleryImages: finalGalleryImages,
        resumeName: payload.resumeName,
        compCardName: payload.compCardName,
      }));

      toast.success('🎉 Profile & Photos saved and updated successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCommunityLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText('https://chat.whatsapp.com/MPProductionTalent');
      toast.success('WhatsApp Community Link copied!');
    }
  };

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

  const stageName = data.stageName || initialData?.stageName || initialData?.user?.name || 'Kanika Aggarwal';
  const category = primaryCategory?.name || initialData?.primaryCategory?.name || 'Actor';
  const experience = data.experienceLevel ? data.experienceLevel.replace(/-/g, ' ') : (initialData?.experienceLevel ? initialData.experienceLevel.replace(/-/g, ' ') : '3-5 Years');
  const location = data.location || initialData?.location || 'Mumbai, India';
  const avatarUrl = data.profilePhotoPreview || initialData?.avatarUrl || initialData?.user?.avatarUrl;
  const viewsCount = initialData?.profileViews || 0;
  const projectsCount = initialData?.projectsCount || 0;

  return (
    <div className="w-full min-h-screen bg-background text-foreground pt-20 pb-20">
      
      {/* Hidden File Inputs */}
      <input type="file" ref={profilePhotoInputRef} onChange={handleProfilePhotoSelect} accept="image/*" className="hidden" />
      <input type="file" ref={coverBannerInputRef} onChange={handleCoverBannerSelect} accept="image/*" className="hidden" />
      <input type="file" ref={galleryInputRef} onChange={handleGalleryAdd} accept="image/*" multiple className="hidden" />
      <input type="file" ref={videoInputRef} onChange={handleVideoSelect} accept="video/*" className="hidden" />
      <input type="file" ref={resumeInputRef} onChange={handleResumeSelect} accept=".pdf,.doc,.docx" className="hidden" />
      <input type="file" ref={compCardInputRef} onChange={handleCompCardSelect} accept=".pdf,image/*" className="hidden" />

      {/* ── Sub-header / Breadcrumb Bar ── */}
      <div className="border-b border-border/80 bg-surface/60 backdrop-blur-md sticky top-[60px] z-30 shadow-xs">
        <div className="w-full px-3 md:px-5 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Talent Command Center
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/talent" className="hover:text-foreground transition-colors">Talent Directory</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Profile Management</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/talent/${initialData?.slug || initialData?.id || ''}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-xs font-bold transition-all text-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand" />
              <span>Public Page</span>
            </Link>
            
            <button
              type="button"
              onClick={() => handleSave('save')}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-full bg-brand text-white text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all cursor-pointer"
              title="Logout from Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main 3-Column Layout Container ── */}
      <div className="w-full px-3 md:px-5 lg:px-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 1 (LEFT SIDEBAR): Sticky Fixed, Scrollable Profile & Tabs
              (Exact Match to TalentDashboardView.tsx)
              ══════════════════════════════════════════════════════════════════ */}
          <aside 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="lg:col-span-3 lg:sticky lg:top-[115px] lg:h-[calc(100vh-130px)] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto overscroll-contain touch-pan-y pr-1 pb-16 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
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
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border border-border shadow-xs cursor-pointer hover:scale-110 transition-transform"
                    title="Change Avatar"
                  >
                    {isApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                    )}
                  </button>
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
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('basic-info-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <Link
                    href={`/talent/${initialData?.slug || initialData?.id || ''}`}
                    target="_blank"
                    className="py-2 px-3 rounded-xl text-center text-xs font-bold border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center"
                    title="Public Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation Panel (Matching TalentDashboardView.tsx) */}
            <div className="rounded-2xl border border-border bg-card p-3 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Talent Panel
              </div>

              <Link
                href="/talent-dashboard"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Overview &amp; Activity</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <Link
                href="/talent-dashboard?tab=requests"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Inbound Direct Requests</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand">
                  1
                </span>
              </Link>

              <Link
                href="/talent-dashboard?tab=castings"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4" />
                  <span>Casting Applications</span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('portfolio-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4" />
                  <span>Portfolio &amp; Showreel</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>

              <Link
                href="/talent"
                target="_blank"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Browse Live Casting Board</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('basic-info-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-brand text-white shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Profile Settings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>

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
          </aside>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 2 (CENTER): Top Tabs + Profile View Card / Edit Form
              (Exact Match to Reference Screenshot Image 1)
              ══════════════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-6 space-y-4">
            

                
                {/* 1. Basic Info */}
                <div id="basic-info-section" className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5 flex items-center justify-between">
                    <span>1. Basic Profile Information</span>
                    <span className="text-[10px] text-teal-600 font-semibold">Editable</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground text-xs">Full Name / Stage Name</label>
                      <input
                        type="text"
                        value={data.stageName}
                        onChange={(e) => updateData({ stageName: e.target.value })}
                        placeholder="e.g. Kanika Aggarwal"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-brand font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground text-xs">Primary Profession</label>
                        <select
                          value={data.primaryTalentId}
                          onChange={(e) => updateData({ primaryTalentId: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-brand cursor-pointer"
                        >
                          <option value="">Select Primary Profession</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-foreground text-xs">Experience Level</label>
                        <select
                          value={data.experienceLevel}
                          onChange={(e) => updateData({ experienceLevel: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-brand cursor-pointer"
                        >
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-foreground text-xs">Professional Bio</label>
                        <span className="text-[10px] text-muted-foreground font-mono">{data.bio.length}/1000</span>
                      </div>
                      <textarea
                        rows={3}
                        value={data.bio}
                        onChange={(e) => updateData({ bio: e.target.value })}
                        placeholder="Write a brief professional bio describing your experience, style, and accomplishments..."
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm leading-relaxed focus:outline-none focus:border-brand resize-y"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground text-xs">Base Location / City</label>
                      <input
                        type="text"
                        value={data.location}
                        onChange={(e) => updateData({ location: e.target.value })}
                        placeholder="e.g. Mumbai, India"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Visual Media (Photos & Headshots - Clean Dropzones) */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
                    2. Profile Photo &amp; Cover Banner
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Profile Photo */}
                    <div className="p-4 rounded-xl border border-border bg-surface/50 text-center space-y-3">
                      <span className="text-xs font-semibold text-foreground block">Profile Headshot</span>
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-brand/40 bg-muted">
                        {data.profilePhotoPreview ? (
                          <img src={data.profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Camera className="w-6 h-6 opacity-40" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => profilePhotoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                      </button>
                    </div>

                    {/* Cover Banner */}
                    <div className="p-4 rounded-xl border border-border bg-surface/50 text-center space-y-3">
                      <span className="text-xs font-semibold text-foreground block">Cover Banner (16:9)</span>
                      <div className="w-full h-20 rounded-lg overflow-hidden border border-border bg-black/20">
                        {data.coverBannerPreview ? (
                          <img src={data.coverBannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                            No Banner Selected
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => coverBannerInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                        <span>{data.coverBannerPreview ? 'Change Banner' : 'Upload Banner'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Skills & Languages */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
                    3. Skills &amp; Languages
                  </h3>

                  {/* Skills Toggles */}
                  <div className="space-y-2">
                    <label className="font-semibold text-foreground text-xs block">Select Skills</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.map((skill) => {
                        const active = data.skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 pt-1 max-w-sm">
                      <input
                        type="text"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="Add other skill..."
                        className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomSkill();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addCustomSkill}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-muted text-xs font-semibold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Languages Toggles */}
                  <div className="space-y-2 pt-3 border-t border-border">
                    <label className="font-semibold text-foreground text-xs block">Languages Spoken</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_LANGUAGES.map((lang) => {
                        const active = data.languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Pricing & Availability */}
                <div id="pricing-section" className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
                    4. Day Rates &amp; Availability
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground text-xs">Daily Rate (₹ INR)</label>
                      <input
                        type="number"
                        value={data.pricingAmount}
                        onChange={(e) => updateData({ pricingAmount: e.target.value })}
                        placeholder="e.g. 25000"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono font-bold text-sm focus:outline-none focus:border-brand"
                      />
                      <p className="text-[11px] text-muted-foreground pt-1">
                        Clients will be charged this day rate via Razorpay Live Escrow when booking directly.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.isAvailableForTravel}
                          onChange={(e) => updateData({ isAvailableForTravel: e.target.checked })}
                          className="rounded text-brand focus:ring-brand"
                        />
                        <span className="text-foreground font-medium">Ready for outstation &amp; international travel</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.isAvailableImmediate}
                          onChange={(e) => updateData({ isAvailableImmediate: e.target.checked })}
                          className="rounded text-brand focus:ring-brand"
                        />
                        <span className="text-foreground font-medium">Available for immediate commercial bookings</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 5. Portfolio Media & Headshots */}
                <div id="portfolio-section" className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        5. Portfolio Images &amp; Headshots
                      </h3>
                      <p className="text-[11px] text-muted-foreground">Upload high-res editorial headshots, commercial stills &amp; fashion photos</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photos</span>
                    </button>
                  </div>

                  {data.galleryImages.length === 0 ? (
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-border/80 hover:border-brand/40 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/10 hover:bg-muted/20"
                    >
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                      <span className="text-xs font-bold text-foreground">No portfolio photos uploaded yet</span>
                      <span className="text-[11px] text-muted-foreground">Click here to select photos from your device</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {data.galleryImages.map((img: any) => (
                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-black/10 group shadow-2xs">
                          <img src={img.url} alt="Portfolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(img.id)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-teal-500 text-muted-foreground hover:text-teal-600 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer bg-muted/10 hover:bg-teal-500/5"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] font-bold">+ Add More</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Save Changes Action Block */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-xs">
                  <span className="text-xs text-muted-foreground">
                    All changes save live to your public profile and database.
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSave('save')}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold hover:brightness-110 transition-all text-xs flex items-center gap-2 shadow-md shadow-brand/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>

          </main>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 3 (RIGHT SIDEBAR): Full-Height Sponsored Partner Panel
              (Exact Match to TalentDashboardView.tsx)
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
