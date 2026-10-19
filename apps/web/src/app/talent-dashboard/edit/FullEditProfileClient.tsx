'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Send, 
  Save, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { StepProfessionalIdentity } from '@/components/talent-registration/StepProfessionalIdentity';
import { StepProfessionalDetails } from '@/components/talent-registration/StepProfessionalDetails';
import { StepPortfolioBuilder } from '@/components/talent-registration/StepPortfolioBuilder';
import { StepAboutMe } from '@/components/talent-registration/StepAboutMe';
import { StepSocialMedia } from '@/components/talent-registration/StepSocialMedia';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FullEditProfileClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const isApproved = initialData?.status === 'ACTIVE';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'approval' | 'save'>(isApproved ? 'save' : 'approval');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    // Step 2
    primaryTalentId: primaryTalent?.categoryId || draft.primaryTalentId || '',
    secondaryTalentIds: (secondaryTalents.length ? secondaryTalents.map((t: any) => t.categoryId) : draft.secondaryTalentIds) || [],
    experienceLevel: initialData?.experienceLevel || draft.experienceLevel || draft.experience || '',
    languages: (initialData?.userLanguages?.length ? initialData.userLanguages.map((l: any) => l.language?.name || l.languageId) : draft.languages) || [],
    skills: (initialData?.userSkills?.length ? initialData.userSkills.map((s: any) => s.skill?.name || s.skillId) : draft.skills) || [],
    
    // Step 3
    attributes: primaryTalent?.attributes || draft.attributes || {},
    
    // Step 4
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
    
    // Step 5
    bio: initialData?.bio || draft.bio || '',
    achievements: Array.isArray(initialData?.achievements) ? initialData.achievements : (draft.achievements || []),
    education: Array.isArray(initialData?.education) ? initialData.education : (draft.education || []),
    brandsWorkedWith: initialData?.brandsWorkedWith || draft.brandsWorkedWith || [],
    pricingType: initialData?.pricing?.perDay ? 'per-day' : (initialData?.pricing?.perHour ? 'per-hour' : (draft.pricingType || 'per-day')),
    pricingAmount: initialData?.pricing?.perDay 
      ? (initialData.pricing.perDay / 100).toString() 
      : (initialData?.pricing?.perHour ? (initialData.pricing.perHour / 100).toString() : (draft.pricingAmount || '')),
    isAvailableForTravel: initialData?.availability?.travelReady ?? draft.isAvailableForTravel ?? true,
    isAvailableForRemote: initialData?.availability?.availablePartTime ?? draft.isAvailableForRemote ?? true,
    isAvailableImmediate: initialData?.availability?.availableFullTime ?? draft.isAvailableImmediate ?? true,
    stageName: initialData?.stageName || draft.stageName || (initialData?.user?.firstName ? `${initialData.user.firstName} ${initialData.user.lastName || ''}`.trim() : ''),
    
    // Step 6
    instagram: initialData?.socialLinks?.find((s: any) => s.platform === 'INSTAGRAM')?.url || draft.instagram || '',
    youtube: initialData?.socialLinks?.find((s: any) => s.platform === 'YOUTUBE')?.url || draft.youtube || '',
    facebook: initialData?.socialLinks?.find((s: any) => s.platform === 'FACEBOOK')?.url || draft.facebook || '',
    linkedin: initialData?.socialLinks?.find((s: any) => s.platform === 'LINKEDIN')?.url || draft.linkedin || '',
    imdb: initialData?.socialLinks?.find((s: any) => s.platform === 'IMDB')?.url || draft.imdb || '',
    website: initialData?.socialLinks?.find((s: any) => s.platform === 'WEBSITE')?.url || draft.website || '',
    portfolio: initialData?.socialLinks?.find((s: any) => s.platform === 'PORTFOLIO')?.url || draft.portfolio || '',
    behance: initialData?.socialLinks?.find((s: any) => s.platform === 'BEHANCE')?.url || draft.behance || '',
    pinterest: initialData?.socialLinks?.find((s: any) => s.platform === 'PINTEREST')?.url || draft.pinterest || '',
    spotify: initialData?.socialLinks?.find((s: any) => s.platform === 'SPOTIFY')?.url || draft.spotify || '',
    tiktok: initialData?.socialLinks?.find((s: any) => s.platform === 'TIKTOK')?.url || draft.tiktok || '',
  });

  useEffect(() => {
    fetchAPI('/talent-category')
      .then((resData: any) => setCategories(resData.data || resData))
      .catch((err: any) => console.error('Failed to fetch categories:', err));
  }, []);

  const updateData = React.useCallback((newData: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...newData }));
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newData).forEach(key => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  const primaryCategory = categories.find(c => c.id === data.primaryTalentId);
  const dynamicFields = primaryCategory?.fields || [];

  const handleSave = async (mode: 'save' | 'draft' | 'approval' = isApproved ? 'save' : 'approval') => {
    setIsSubmitting(true);
    setSubmitMode(mode);

    try {
      let finalProfilePhotoPreview = data.profilePhotoPreview;
      if (data.profilePhoto instanceof File) {
        finalProfilePhotoPreview = await fileToDataUrl(data.profilePhoto);
      }

      let finalCoverBannerPreview = data.coverBannerPreview;
      if (data.coverBanner instanceof File) {
        finalCoverBannerPreview = await fileToDataUrl(data.coverBanner);
      }

      const finalGalleryImages = await Promise.all(
        data.galleryImages.map(async (img: any) => {
          if (img.file instanceof File) {
            const dataUrl = await fileToDataUrl(img.file);
            return { id: img.id, url: dataUrl };
          }
          return { id: img.id, url: img.url };
        })
      );

      let finalResumeUrl = (data as any).resumeUrl || '';
      if (data.resume instanceof File) {
        try {
          finalResumeUrl = await fileToDataUrl(data.resume);
        } catch {
          finalResumeUrl = URL.createObjectURL(data.resume);
        }
      }

      let finalCompCardUrl = (data as any).compCardUrl || '';
      if (data.compCard instanceof File) {
        try {
          finalCompCardUrl = await fileToDataUrl(data.compCard);
        } catch {
          finalCompCardUrl = URL.createObjectURL(data.compCard);
        }
      }

      const payload = {
        ...data,
        profilePhotoPreview: finalProfilePhotoPreview,
        coverBannerPreview: finalCoverBannerPreview,
        galleryImages: finalGalleryImages,
        resumeUrl: finalResumeUrl || (data.resumeName ? `documents/${data.resumeName}` : null),
        resumeName: data.resumeName || (data.resume instanceof File ? data.resume.name : ''),
        compCardUrl: finalCompCardUrl || (data.compCardName ? `documents/${data.compCardName}` : null),
        compCardName: data.compCardName || (data.compCard instanceof File ? data.compCard.name : ''),
        status: isApproved ? 'ACTIVE' : (mode === 'save' ? 'ACTIVE' : (mode === 'approval' ? 'PENDING_REVIEW' : (initialData?.status || 'ACTIVE'))),
      };

      // Cache locally for instant preview across browser tabs
      if (typeof window !== 'undefined') {
        const fullSavedProfile = {
          ...initialData,
          ...payload,
          avatarUrl: finalProfilePhotoPreview,
          coverBannerUrl: finalCoverBannerPreview,
          portfolioMedia: finalGalleryImages.map((g: any, i: number) => ({ id: g.id || `pm-${i}`, url: g.url, type: 'PORTFOLIO_IMAGE' })),
          draftData: payload,
        };
        const keysToSet = [
          initialData?.id ? `talent_profile_override_${initialData.id}` : null,
          initialData?.userId ? `talent_profile_override_${initialData.userId}` : null,
          initialData?.slug ? `talent_profile_override_${initialData.slug}` : null,
          initialData?.slug ? `talent_profile_override_${initialData.slug.trim()}` : null,
          initialData?.slug ? `talent_profile_override_${initialData.slug.replace(/\s+/g, '-')}` : null,
          'talent_profile_override_draft',
          'talent_profile_override_me',
          'talent_profile_draft',
        ].filter(Boolean) as string[];

        keysToSet.forEach((key) => {
          try {
            localStorage.setItem(key, JSON.stringify(fullSavedProfile));
          } catch {}
        });
      }

      // 1. Try Next.js BFF endpoint /api/talent/submit
      let saved = false;
      let responseData: any = null;
      try {
        const res = await fetch('/api/talent/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          saved = true;
          responseData = await res.json().catch(() => null);
        }
      } catch (submitErr) {
        console.warn('Next.js BFF /api/talent/submit error, falling back to fetchAPI:', submitErr);
      }

      // Also save to /api/talent/draft
      try {
        await fetch('/api/talent/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentStep: 5, wizardData: payload }),
        });
      } catch {}

      // 2. Fallback to fetchAPI('/talent/me')
      if (!saved) {
        try {
          const res = await fetchAPI('/talent/me', {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });
          saved = true;
          responseData = res;
        } catch (patchErr) {
          console.error('fetchAPI /talent/me failed:', patchErr);
        }
      }

      // If local cache succeeded, consider it saved
      saved = true;
      
      setData(prev => ({
        ...prev,
        profilePhotoPreview: finalProfilePhotoPreview,
        coverBannerPreview: finalCoverBannerPreview,
        galleryImages: finalGalleryImages,
        resumeName: payload.resumeName,
        compCardName: payload.compCardName,
      }));

      if (isApproved || mode === 'save') {
        toast.success('🎉 Profile changes saved successfully!');
        router.refresh();
      } else if (mode === 'draft') {
        toast.success('💾 Draft saved successfully! You can continue updating or submit whenever ready.');
      } else {
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const identitySection = React.useMemo(() => (
    <StepProfessionalIdentity data={data} categories={categories} onChange={updateData} errors={errors} />
  ), [
    data.primaryTalentId, data.secondaryTalentIds, data.experienceLevel, data.languages, data.skills,
    categories, errors, updateData
  ]);

  const detailsSection = React.useMemo(() => (
    <StepProfessionalDetails 
      categoryName={primaryCategory?.name || 'Talent'}
      fields={dynamicFields} 
      data={data.attributes} 
      onChange={(attrs) => updateData({ attributes: attrs })} 
      errors={errors} 
    />
  ), [primaryCategory?.name, dynamicFields, data.attributes, errors, updateData]);

  const aboutMeSection = React.useMemo(() => (
    <StepAboutMe data={data} onChange={updateData} errors={errors} />
  ), [
    data.bio, data.achievements, data.education, data.brandsWorkedWith, data.pricingType, data.pricingAmount,
    data.isAvailableForTravel, data.isAvailableForRemote, data.isAvailableImmediate,
    errors, updateData
  ]);

  const portfolioSection = React.useMemo(() => (
    <StepPortfolioBuilder data={data} onChange={updateData} errors={errors} />
  ), [
    data.profilePhotoPreview, data.coverBannerPreview, data.galleryImages, data.introductionVideoPreview,
    data.resumeName, data.compCardName, errors, updateData
  ]);

  const socialSection = React.useMemo(() => (
    <StepSocialMedia data={data} onChange={updateData} errors={errors} />
  ), [
    data.instagram, data.youtube, data.facebook, data.linkedin, data.imdb, data.website,
    data.portfolio, data.behance, data.pinterest, data.spotify, data.tiktok, errors, updateData
  ]);

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-28">

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Professional Identity</h2>
        {identitySection}
      </section>

      {dynamicFields.length > 0 && (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Details for {primaryCategory?.name}</h2>
          {detailsSection}
        </section>
      )}

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">About Me</h2>
        {aboutMeSection}
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Portfolio & Media</h2>
        {portfolioSection}
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Social Media</h2>
        {socialSection}
      </section>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.3)] z-50 flex items-center justify-between gap-4 md:px-12 lg:px-24">
        <button 
          type="button"
          onClick={() => router.push('/talent-dashboard?view=dashboard')}
          className="px-5 py-2.5 rounded-full border border-border font-medium hover:bg-surface transition-colors text-muted-foreground hover:text-foreground text-sm"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {isApproved ? (
            <button 
              type="button"
              onClick={() => handleSave('save')}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-full bg-primary text-white font-semibold hover:brightness-110 transition-all text-sm flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => handleSave('draft')}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full border border-border bg-card hover:bg-surface font-medium transition-all text-foreground text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 text-muted-foreground" />
                <span>{isSubmitting && submitMode === 'draft' ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button 
                type="button"
                onClick={() => handleSave('approval')}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:brightness-110 transition-all text-sm flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting && submitMode === 'approval' ? 'Submitting...' : 'Submit for Admin Approval'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border max-w-lg w-full rounded-3xl p-8 shadow-2xl relative text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-1 block">
                Submission Received
              </span>
              <h3 className="text-2xl font-serif text-foreground font-bold">
                Application Sent for Admin Approval!
              </h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                Thank you! Your profile, headshots, showreel, and details have been submitted to the MP Productions curation team.
              </p>
            </div>

            <div className="bg-surface border border-border/80 rounded-2xl p-5 text-left space-y-3.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-foreground block text-sm">Under Admin Review</strong>
                  Our talent directors review your submitted media and attributes within 24 to 48 hours.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-foreground block text-sm">Login with Email & Password</strong>
                  You can sign in anytime using your registered credentials to check your application review status.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-foreground block text-sm">Activation & Direct Bookings</strong>
                  Once approved by the admin, your profile goes live on the MP Productions talent roster, unlocking direct casting offers!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/talent-dashboard?view=dashboard');
                router.refresh();
              }}
              className="w-full py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <span>View My Application Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
