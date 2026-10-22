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
  X, 
  ExternalLink, 
  Globe, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Languages as LanguagesIcon,
  Award
} from 'lucide-react';

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

export default function FullEditProfileClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const isApproved = initialData?.status === 'ACTIVE';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    bio: initialData?.bio || draft.bio || '',
    
    // Skills & Languages
    languages: (initialData?.userLanguages?.length ? initialData.userLanguages.map((l: any) => l.language?.name || l.languageId) : draft.languages) || ['Hindi', 'English'],
    skills: (initialData?.userSkills?.length ? initialData.userSkills.map((s: any) => s.skill?.name || s.skillId) : draft.skills) || ['Commercial Modeling', 'Content Creation'],
    
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
  const dynamicFields = primaryCategory?.fields || [];

  // Handlers for file selection
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
    toast.success('Video attached');
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateData({ resume: file, resumeName: file.name });
    toast.success(`Resume attached: ${file.name}`);
  };

  const handleCompCardSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateData({ compCard: file, compCardName: file.name });
    toast.success(`Comp Card attached: ${file.name}`);
  };

  // Toggle skills & languages
  const toggleSkill = (skill: string) => {
    if (data.skills.includes(skill)) {
      updateData({ skills: data.skills.filter(s => s !== skill) });
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
      updateData({ languages: data.languages.filter(l => l !== lang) });
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
      updateData({ secondaryTalentIds: data.secondaryTalentIds.filter(id => id !== catId) });
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

      // 4. Upload Resume Document
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

      // 5. Upload Comp Card Document
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

      // 6. Direct Next.js Database Persistence API endpoint /api/talent/submit
      const res = await fetch('/api/talent/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const submitRes = await res.json().catch(() => null);

      if (!res.ok && !submitRes?.success) {
        throw new Error(submitRes?.message || 'Failed to update profile in database');
      }

      // Cache locally for instant preview across browser tabs
      if (typeof window !== 'undefined') {
        const fullSavedProfile = {
          ...initialData,
          ...payload,
          avatarUrl: finalProfilePhotoUrl,
          coverBannerUrl: finalCoverBannerUrl,
          portfolioMedia: finalGalleryImages.map((g: any, i: number) => ({ id: g.id || `pm-${i}`, url: g.url, type: 'PORTFOLIO_IMAGE' })),
          draftData: payload,
        };
        const keysToSet = [
          initialData?.id ? `talent_profile_override_${initialData.id}` : null,
          initialData?.userId ? `talent_profile_override_${initialData.userId}` : null,
          initialData?.slug ? `talent_profile_override_${initialData.slug}` : null,
          initialData?.slug ? `talent_profile_override_${initialData.slug.trim()}` : null,
          'talent_profile_override_draft',
          'talent_profile_override_me',
          'talent_profile_draft',
        ].filter(Boolean) as string[];

        keysToSet.forEach((key) => {
          try {
            localStorage.setItem(key, JSON.stringify(fullSavedProfile));
          } catch {}
        });

        // Broadcast cross-tab and cross-component update event
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28">

      {/* Hidden file inputs */}
      <input type="file" ref={profilePhotoInputRef} onChange={handleProfilePhotoSelect} accept="image/*" className="hidden" />
      <input type="file" ref={coverBannerInputRef} onChange={handleCoverBannerSelect} accept="image/*" className="hidden" />
      <input type="file" ref={galleryInputRef} onChange={handleGalleryAdd} accept="image/*" multiple className="hidden" />
      <input type="file" ref={videoInputRef} onChange={handleVideoSelect} accept="video/*" className="hidden" />
      <input type="file" ref={resumeInputRef} onChange={handleResumeSelect} accept=".pdf,.doc,.docx" className="hidden" />
      <input type="file" ref={compCardInputRef} onChange={handleCompCardSelect} accept=".pdf,image/*" className="hidden" />

      {/* ── TOP ACTION BAR ── */}
      <div className="flex items-center justify-between py-2 border-b border-border/80 pb-3">
        <Link
          href="/talent-dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2.5">
          <Link
            href={`/talent/${initialData?.slug || initialData?.id || 'me'}`}
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-card hover:bg-surface text-foreground transition-all shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-brand" /> View Preview
          </Link>
          <button
            type="button"
            onClick={() => handleSave('save')}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-full bg-brand text-white text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* ── 1. INSTAGRAM-STYLE VISUAL HEADER (Banner + Avatar) ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs relative">
        {/* Cover Banner Area */}
        <div className="relative h-40 sm:h-52 w-full bg-neutral-900 overflow-hidden group">
          {data.coverBannerPreview ? (
            <img
              src={data.coverBannerPreview}
              alt="Cover Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-1 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900">
              <ImageIcon className="w-6 h-6 opacity-30" />
              <span className="text-[11px] font-medium">Add a cover banner</span>
            </div>
          )}

          {/* Change Banner Overlay Button */}
          <button
            type="button"
            onClick={() => coverBannerInputRef.current?.click()}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-white/10"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{data.coverBannerPreview ? 'Change Banner' : 'Add Banner'}</span>
          </button>
        </div>

        {/* Profile Avatar & Quick Identity Row */}
        <div className="px-6 pb-6 pt-2 sm:pt-3 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 text-center sm:text-left min-w-0">
            {/* Avatar Circle with Camera badge - cleanly overlapping banner */}
            <div className="relative group/avatar shrink-0 -mt-14 sm:-mt-16">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-card bg-surface overflow-hidden shadow-lg shrink-0 flex items-center justify-center">
                {data.profilePhotoPreview ? (
                  <img
                    src={data.profilePhotoPreview}
                    alt={data.stageName || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand/10 text-brand font-bold text-3xl flex items-center justify-center uppercase font-serif">
                    {data.stageName?.[0] || 'T'}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => profilePhotoInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-brand text-white shadow-md hover:brightness-110 transition-transform hover:scale-105 cursor-pointer border-2 border-card"
                title="Change Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stage Name & Subtitle right beside avatar - cleanly on card surface */}
            <div className="space-y-1 mb-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-foreground tracking-tight whitespace-nowrap">
                  {data.stageName || 'Your Name'}
                </h1>
                <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand/10 text-brand border border-brand/20">
                  {primaryCategory?.name || 'Talent'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => profilePhotoInputRef.current?.click()}
                className="text-xs text-brand hover:underline font-semibold cursor-pointer block"
              >
                Change profile photo
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0 mb-1">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              isApproved
                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
            }`}>
              {isApproved ? '✓ Active on Roster' : 'Draft / Under Review'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. INSTAGRAM-STYLE BASIC PROFILE FIELDS ── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
          Profile Information
        </h3>

        <div className="space-y-4 text-xs">
          {/* Stage Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground text-xs">Full Name / Stage Name</label>
            <input
              type="text"
              value={data.stageName}
              onChange={(e) => updateData({ stageName: e.target.value })}
              placeholder="e.g. Kanika Aggarwal"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-brand"
            />
          </div>

          {/* Primary Talent / Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground text-xs">Bio</label>
              <span className="text-[11px] text-muted-foreground font-mono">{data.bio.length}/1000</span>
            </div>
            <textarea
              rows={4}
              value={data.bio}
              onChange={(e) => updateData({ bio: e.target.value })}
              placeholder="Write a brief professional bio describing your experience, style, and accomplishments..."
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm leading-relaxed focus:outline-none focus:border-brand resize-y"
            />
          </div>

          {/* Secondary Talents Pills */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-foreground text-xs block">
              Additional Talents &amp; Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== data.primaryTalentId)
                .map((cat) => {
                  const isSelected = data.secondaryTalentIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleSecondaryTalent(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. PORTFOLIO & MEDIA (INSTAGRAM GALLERY GRID) ── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Portfolio Gallery
            </h3>
            <span className="text-xs text-muted-foreground">Upload your photos, headshots &amp; editorial images</span>
          </div>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-brand/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photos</span>
          </button>
        </div>

        {/* Instagram Grid of Photos */}
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
              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand text-muted-foreground hover:text-brand flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer bg-muted/10 hover:bg-brand/5"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[11px] font-bold">+ Add More</span>
            </button>
          </div>
        )}

        {/* Video & Documents Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          {/* Introduction Video */}
          <div className="space-y-2">
            <label className="font-semibold text-foreground text-xs block">Introduction Video</label>
            {data.introductionVideoPreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black">
                <video src={data.introductionVideoPreview} controls playsInline className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => updateData({ introductionVideo: null, introductionVideoPreview: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white cursor-pointer"
                  title="Remove Video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full p-4 border border-dashed border-border hover:border-brand rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors cursor-pointer bg-muted/10"
              >
                <Video className="w-4 h-4" />
                <span>Upload Intro Video (.mp4 / .mov)</span>
              </button>
            )}
          </div>

          {/* Resume & Comp Card */}
          <div className="space-y-3">
            <label className="font-semibold text-foreground text-xs block">Documents</label>
            
            {/* Resume Button */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-brand shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">
                  {data.resumeName || 'No resume uploaded'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                className="text-[11px] font-bold text-brand hover:underline shrink-0 ml-2 cursor-pointer"
              >
                {data.resumeName ? 'Replace' : 'Upload'}
              </button>
            </div>

            {/* Comp Card Button */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-2 min-w-0">
                <Award className="w-4 h-4 text-brand shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">
                  {data.compCardName || 'No comp card uploaded'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => compCardInputRef.current?.click()}
                className="text-[11px] font-bold text-brand hover:underline shrink-0 ml-2 cursor-pointer"
              >
                {data.compCardName ? 'Replace' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. SKILLS & LANGUAGES ── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
          Skills &amp; Languages
        </h3>

        {/* Skills */}
        <div className="space-y-2">
          <label className="font-semibold text-foreground text-xs block">Skills</label>
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
                      ? 'bg-brand text-white shadow-2xs'
                      : 'bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
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

        {/* Languages */}
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
                      ? 'bg-brand text-white shadow-2xs'
                      : 'bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 pt-1 max-w-sm">
            <input
              type="text"
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              placeholder="Add other language..."
              className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomLanguage();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomLanguage}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-muted text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. SOCIAL MEDIA LINKS ── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
          Social Links &amp; Handles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Instagram */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Handle / URL
            </label>
            <input
              type="text"
              value={data.instagram}
              onChange={(e) => updateData({ instagram: e.target.value })}
              placeholder="e.g. instagram.com/username or @username"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand font-mono"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Channel
            </label>
            <input
              type="text"
              value={data.youtube}
              onChange={(e) => updateData({ youtube: e.target.value })}
              placeholder="e.g. youtube.com/@channel"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand font-mono"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-blue-500" /> LinkedIn
            </label>
            <input
              type="text"
              value={data.linkedin}
              onChange={(e) => updateData({ linkedin: e.target.value })}
              placeholder="e.g. linkedin.com/in/username"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand font-mono"
            />
          </div>

          {/* Website */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" /> Personal Website / Portfolio
            </label>
            <input
              type="text"
              value={data.website}
              onChange={(e) => updateData({ website: e.target.value })}
              placeholder="e.g. https://yourportfolio.com"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand font-mono"
            />
          </div>
        </div>
      </div>

      {/* ── 6. PRICING & AVAILABILITY ── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
          Pricing &amp; Booking Availability
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground text-xs">Day Rate (₹ INR)</label>
            <input
              type="number"
              value={data.pricingAmount}
              onChange={(e) => updateData({ pricingAmount: e.target.value })}
              placeholder="e.g. 25000"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono font-bold text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="font-semibold text-foreground text-xs block">Travel &amp; Availability</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isAvailableForTravel}
                  onChange={(e) => updateData({ isAvailableForTravel: e.target.checked })}
                  className="rounded text-brand focus:ring-brand"
                />
                <span className="text-foreground">Ready for outstation / international travel</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isAvailableImmediate}
                  onChange={(e) => updateData({ isAvailableImmediate: e.target.checked })}
                  className="rounded text-brand focus:ring-brand"
                />
                <span className="text-foreground">Available for immediate commercial bookings</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── FIXED BOTTOM ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-background/95 backdrop-blur-md border-t border-border shadow-lg z-50 flex items-center justify-between gap-4 md:px-12 lg:px-24">
        <button 
          type="button"
          onClick={() => router.push('/talent-dashboard')}
          className="px-5 py-2 rounded-full border border-border font-medium hover:bg-surface transition-colors text-muted-foreground hover:text-foreground text-xs cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => handleSave('save')}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-full bg-brand text-white font-bold hover:brightness-110 transition-all text-xs flex items-center gap-1.5 shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
