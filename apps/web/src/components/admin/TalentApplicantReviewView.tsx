'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Check,
  X,
  MapPin,
  Mail,
  Phone,
  Calendar,
  FileText,
  Video,
  Image as ImageIcon,
  Award,
  GraduationCap,
  Briefcase,
  DollarSign,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Tag
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TalentApplicantReviewViewProps {
  initialProfile: any;
  backHref?: string;
}

export function TalentApplicantReviewView({ initialProfile, backHref = '/studio-8f2k/moderation' }: TalentApplicantReviewViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(initialProfile);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-2xl font-serif text-foreground font-bold">Applicant Profile Not Found</h2>
        <p className="text-muted-foreground text-sm">
          The requested talent profile could not be loaded or may have already been moderated.
        </p>
        <Link href={backHref}>
          <Button variant="outline" className="gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" /> Back to Moderation Queue
          </Button>
        </Link>
      </div>
    );
  }

  // Consolidated Data Extraction
  const user = profile.user || {};
  const draft = profile.draftData || {};

  const isGenericAdmin = user.email?.includes('superadmin@') || user.email?.includes('admin@mpproduction');
  const rawUserFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  const name =
    profile.stageName?.trim() ||
    draft.fullName?.trim() ||
    draft.stageName?.trim() ||
    (!isGenericAdmin && rawUserFullName ? rawUserFullName : '') ||
    (!isGenericAdmin && user.name ? user.name : '') ||
    rawUserFullName ||
    user.name ||
    'Talent Applicant';

  const stageName = profile.stageName || draft.stageName || name;
  const email =
    draft.email ||
    profile.email ||
    (!isGenericAdmin && user.email ? user.email : (draft.email || profile.email || user.email)) ||
    'N/A';

  const phone =
    draft.phone ||
    draft.mobile ||
    profile.phone ||
    user.phone ||
    'N/A';

  const city = profile.city || draft.city || user.city || 'Unspecified';
  const state = profile.state || draft.state || user.state || '';
  const country = profile.country || draft.country || user.country || 'India';
  const locationStr = [city, state, country].filter(Boolean).join(', ');

  const dateOfBirth = user.dateOfBirth || draft.dateOfBirth;
  const gender = user.gender || draft.gender;
  const bio = profile.bio || draft.bio || '';
  const experienceLevel = profile.experienceLevel || draft.experienceLevel || '';

  // Photos & Banner
  const avatarUrl = user.avatarUrl || draft.profilePhotoPreview || profile.coverBannerUrl;
  const coverUrl = profile.coverBannerUrl || draft.coverBannerPreview || '';
  const videoUrl = profile.introductionVideoUrl || draft.introductionVideoPreview || '';
  const resumeUrl = profile.resumeUrl || draft.resumeName || '';
  const compCardUrl = profile.compCardUrl || draft.compCardName || '';

  // Gallery
  const galleryImages: string[] = [];
  if (profile.portfolioMedia && Array.isArray(profile.portfolioMedia)) {
    profile.portfolioMedia.forEach((m: any) => {
      if (m.url) galleryImages.push(m.url);
    });
  }
  if (draft.galleryImages && Array.isArray(draft.galleryImages)) {
    draft.galleryImages.forEach((img: any) => {
      const u = typeof img === 'string' ? img : img.url;
      if (u && !galleryImages.includes(u)) galleryImages.push(u);
    });
  }

  // Categories & Professions
  const primaryTalent =
    profile.userTalents?.find((t: any) => t.isPrimary)?.category?.name ||
    profile.type ||
    draft.primaryTalentName ||
    'Talent Applicant';

  const secondaryTalents =
    profile.userTalents
      ?.filter((t: any) => !t.isPrimary)
      .map((t: any) => t.category?.name)
      .filter(Boolean) || draft.secondaryTalentNames || [];

  // Dynamic Attributes
  const attributes = profile.userTalents?.find((t: any) => t.isPrimary)?.attributes || draft.attributes || {};

  // Achievements, Education, Brands
  const achievements = Array.isArray(profile.achievements)
    ? profile.achievements
    : Array.isArray(draft.achievements)
      ? draft.achievements
      : [];

  const education = Array.isArray(profile.education)
    ? profile.education
    : Array.isArray(draft.education)
      ? draft.education
      : [];

  const brands = Array.isArray(profile.brandsWorkedWith)
    ? profile.brandsWorkedWith
    : Array.isArray(draft.brandsWorkedWith)
      ? draft.brandsWorkedWith
      : [];

  // Skills & Languages
  const skills: string[] = [];
  if (profile.userSkills && Array.isArray(profile.userSkills)) {
    profile.userSkills.forEach((s: any) => {
      if (s.skill?.name) skills.push(s.skill.name);
    });
  }
  if (draft.skills && Array.isArray(draft.skills)) {
    draft.skills.forEach((s: string) => {
      if (!skills.includes(s)) skills.push(s);
    });
  }

  const languages: string[] = [];
  if (profile.userLanguages && Array.isArray(profile.userLanguages)) {
    profile.userLanguages.forEach((l: any) => {
      if (l.language?.name) languages.push(l.language.name);
    });
  }
  if (draft.languages && Array.isArray(draft.languages)) {
    draft.languages.forEach((l: string) => {
      if (!languages.includes(l)) languages.push(l);
    });
  }

  // Social Links
  const socialMap: Record<string, string> = {};
  if (profile.socialLinks && Array.isArray(profile.socialLinks)) {
    profile.socialLinks.forEach((s: any) => {
      if (s.platform && s.url) {
        socialMap[s.platform.toLowerCase()] = s.url;
      }
    });
  }
  ['instagram', 'youtube', 'linkedin', 'facebook', 'imdb', 'website', 'portfolio', 'behance', 'pinterest', 'spotify', 'tiktok'].forEach((key) => {
    if (draft[key] && !socialMap[key]) {
      socialMap[key] = draft[key];
    }
  });

  // Rates & Availability
  const startingPrice = profile.pricing?.startingPrice || draft.pricingAmount || '';
  const travelWilling = profile.availability?.travelWilling ?? draft.isAvailableForTravel ?? true;
  const remoteWilling = draft.isAvailableForRemote ?? true;
  const immediateAvailable = draft.isAvailableImmediate ?? true;

  const handleModerate = async (action: 'APPROVE' | 'REJECT') => {
    const isApprove = action === 'APPROVE';
    const status = isApprove ? 'ACTIVE' : 'SUSPENDED';
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/talent/${profile.id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNote: reviewNote.trim() || (isApprove ? 'Approved by Admin' : 'Rejected during moderation review'),
        }),
      });

      const json = await res.json();

      if (res.ok && (json.success || json.ok)) {
        toast.success(isApprove ? '🎉 Talent Profile APPROVED live on MP Production!' : 'Talent Application REJECTED.');
        router.push(backHref);
        router.refresh();
      } else {
        toast.error(json.error || json.message || 'Failed to update moderation decision.');
      }
    } catch (err) {
      toast.error('Network error processing moderation decision.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border bg-background sticky top-0 z-30 pt-2 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-surface text-foreground text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-brand" /> Back to Queue
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              Applicant Dossier: <span className="text-brand">{name}</span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Status: <span className="font-semibold text-amber-500 uppercase tracking-wider">{profile.status || 'PENDING_REVIEW'}</span>
            </p>
          </div>
        </div>

        {/* Quick Decision Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleModerate('REJECT')}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Reject
          </button>
          <button
            onClick={() => handleModerate('APPROVE')}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Approve & Publish Live
          </button>
        </div>
      </div>

      {/* Hero Header Card with Cover Banner & Profile Avatar */}
      <Card className="overflow-hidden border-border bg-card shadow-lg relative">
        {/* Cover Banner */}
        <div className="w-full h-56 sm:h-72 lg:h-80 relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Cover Banner"
              className="w-full h-full object-cover object-center cursor-pointer hover:scale-105 transition-transform duration-700"
              onClick={() => setPreviewMediaUrl(coverUrl)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
              No Cover Banner Uploaded
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>

        {/* Profile Card Overlay */}
        <div className="px-6 sm:px-10 pb-8 relative -top-16 sm:-top-20 mb-[-3.5rem] sm:mb-[-4.5rem]">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            
            {/* Avatar Headshot */}
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-card bg-surface overflow-hidden shadow-2xl shrink-0 flex items-center justify-center cursor-pointer relative group"
              onClick={() => avatarUrl && setPreviewMediaUrl(avatarUrl)}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform" />
              ) : (
                <span className="text-4xl font-serif font-bold text-muted-foreground">{name[0] || 'T'}</span>
              )}
              {avatarUrl && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                  <Eye className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Profile Identity Details */}
            <div className="flex-1 space-y-2 pt-2 sm:pt-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-foreground">
                  {name}
                </h2>
                {stageName && stageName !== name && (
                  <span className="text-sm text-muted-foreground font-mono">
                    (&quot;{stageName}&quot;)
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
                  {primaryTalent}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-muted text-muted-foreground">
                  {experienceLevel ? experienceLevel.replace(/-/g, ' ') : 'Experience Unspecified'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-light">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="w-4 h-4 text-brand" /> {locationStr}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-brand" /> {email}
                </span>
                {phone !== 'N/A' && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-brand" /> {phone}
                  </span>
                )}
              </div>

              {secondaryTalents.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Also Available As:</span>
                  {secondaryTalents.map((t: string) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full text-[11px] bg-surface border border-border text-foreground font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Bio, Media, Video, Documents, Achievements */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Biography / Pitch */}
          <Card className="p-6 border-border bg-card space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
              <FileText className="w-4 h-4" /> Biography & Professional Pitch
            </h3>
            {bio ? (
              <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap font-light bg-muted/20 p-4 rounded-xl border border-border/60">
                {bio}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs italic">No biography provided by applicant.</p>
            )}
          </Card>

          {/* Introduction Video */}
          <Card className="p-6 border-border bg-card space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
              <Video className="w-4 h-4" /> Introduction Video / Showreel
            </h3>
            {videoUrl ? (
              <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border max-w-2xl">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster={coverUrl || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs font-light">
                No introduction video uploaded.
              </div>
            )}
          </Card>

          {/* Uploaded Documents: Resume & Comp Card */}
          <Card className="p-6 border-border bg-card space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documents & Comp Cards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resume Card */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">Official Resume / CV</p>
                    <p className="text-[11px] text-muted-foreground truncate">{resumeUrl ? 'Document Attached' : 'Not Uploaded'}</p>
                  </div>
                </div>
                {resumeUrl ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-border text-foreground text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-brand" /> View
                  </a>
                ) : (
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">None</span>
                )}
              </div>

              {/* Comp Card */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">Casting Comp Card</p>
                    <p className="text-[11px] text-muted-foreground truncate">{compCardUrl ? 'Comp Card Available' : 'Not Uploaded'}</p>
                  </div>
                </div>
                {compCardUrl ? (
                  <a
                    href={compCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-border text-foreground text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" /> View
                  </a>
                ) : (
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">None</span>
                )}
              </div>
            </div>
          </Card>

          {/* Portfolio Gallery Images */}
          <Card className="p-6 border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Portfolio Gallery ({galleryImages.length} Images)
              </h3>
            </div>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewMediaUrl(imgUrl)}
                    className="aspect-square rounded-xl overflow-hidden bg-surface border border-border group cursor-pointer relative shadow-sm"
                  >
                    <img
                      src={imgUrl}
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No additional gallery photos provided.</p>
            )}
          </Card>

          {/* Dynamic Category Attributes (Actor / Model / Photographer specifics) */}
          {Object.keys(attributes).length > 0 && (
            <Card className="p-6 border-border bg-card space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
                <Layers className="w-4 h-4" /> Profession Specific Details ({primaryTalent})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(attributes).map(([key, val]) => {
                  if (val === undefined || val === null || val === '') return null;
                  const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
                  return (
                    <div key={key} className="p-3 rounded-lg border border-border bg-muted/15">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block truncate">
                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-foreground mt-0.5 block truncate">
                        {displayVal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Professional Achievements & Awards */}
          {achievements.length > 0 && (
            <Card className="p-6 border-border bg-card space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
                <Award className="w-4 h-4" /> Achievements & Honors
              </h3>
              <div className="space-y-3">
                {achievements.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/15 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded bg-brand/10 text-brand font-mono text-xs font-bold shrink-0">
                      {item.year || 'Honor'}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.title}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education & Training */}
          {education.length > 0 && (
            <Card className="p-6 border-border bg-card space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Education & Training
              </h3>
              <div className="space-y-3">
                {education.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/15 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.degree || item.course || 'Degree'}</p>
                      <p className="text-xs text-muted-foreground">{item.institution}</p>
                    </div>
                    {item.year && (
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{item.year}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Brands Worked With */}
          {brands.length > 0 && (
            <Card className="p-6 border-border bg-card space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Brands & Clients
              </h3>
              <div className="flex flex-wrap gap-2">
                {brands.map((b: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-full border border-border bg-muted/20 text-xs font-medium text-foreground">
                    {b}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar Column (1 Col): Personal Dossier, Skills, Pricing, Social, Action */}
        <div className="space-y-8">
          
          {/* Executive Decision Action Box */}
          <Card className="p-6 border-brand/30 bg-card shadow-md space-y-4 ring-1 ring-brand/10">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Moderation Decision
            </h3>
            <p className="text-xs text-muted-foreground">
              Review all submitted details above before approving for casting directors and live booking.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                Review Note (Optional for audit log)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="e.g. Verified headshots and verified contact."
                rows={2}
                className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand resize-none"
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleModerate('APPROVE')}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve & Publish Live
              </button>

              <button
                onClick={() => handleModerate('REJECT')}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Reject Application
              </button>
            </div>
          </Card>

          {/* Personal Information Dossier */}
          <Card className="p-6 border-border bg-card space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold">
              Personal Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-semibold text-foreground text-right">{name}</span>
              </div>
              {stageName && (
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Stage Name:</span>
                  <span className="font-semibold text-foreground text-right">{stageName}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Email:</span>
                <a href={`mailto:${email}`} className="font-semibold text-brand text-right hover:underline">{email}</a>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Phone:</span>
                <a href={`tel:${phone}`} className="font-semibold text-foreground text-right">{phone}</a>
              </div>
              {dateOfBirth && (
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-semibold text-foreground text-right">{new Date(dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {gender && (
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-semibold text-foreground text-right capitalize">{gender}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">City / Region:</span>
                <span className="font-semibold text-foreground text-right">{city}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Country:</span>
                <span className="font-semibold text-foreground text-right">{country}</span>
              </div>
            </div>
          </Card>

          {/* Pricing & Availability */}
          <Card className="p-6 border-border bg-card space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Pricing & Availability
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Starting Rate:</span>
                <span className="font-bold text-foreground">
                  {startingPrice ? `₹${Number(startingPrice).toLocaleString()}` : 'Negotiable / Unset'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Travel Available:</span>
                <span className={`font-semibold ${travelWilling ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {travelWilling ? 'Yes, Available' : 'No'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Remote Work:</span>
                <span className={`font-semibold ${remoteWilling ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {remoteWilling ? 'Yes, Available' : 'No'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Immediate Joining:</span>
                <span className={`font-semibold ${immediateAvailable ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {immediateAvailable ? 'Available Now' : 'Requires Notice'}
                </span>
              </div>
            </div>
          </Card>

          {/* Skills & Languages */}
          <Card className="p-6 border-border bg-card space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
              <Tag className="w-4 h-4" /> Skills & Languages
            </h3>
            
            {skills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Languages Spoken</span>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((l, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md bg-brand/10 border border-brand/20 text-[11px] text-brand font-medium">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Social Media & External Handles */}
          <Card className="p-6 border-border bg-card space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand font-bold flex items-center gap-2">
              <Globe className="w-4 h-4" /> Social & Online Presence
            </h3>
            {Object.keys(socialMap).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(socialMap).map(([platform, handleUrl]) => {
                  if (!handleUrl) return null;
                  const formattedUrl = handleUrl.startsWith('http') ? handleUrl : `https://${platform}.com/${handleUrl.replace(/^@/, '')}`;
                  return (
                    <a
                      key={platform}
                      href={formattedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg border border-border bg-muted/15 hover:bg-surface flex items-center justify-between text-xs text-foreground group transition-colors"
                    >
                      <span className="font-semibold uppercase tracking-wider font-mono text-[10px] text-brand">
                        {platform}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground group-hover:text-brand truncate max-w-[180px]">
                        {handleUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No social links provided.</p>
            )}
          </Card>

        </div>
      </div>

      {/* Media Lightbox Zoom Modal */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-neutral-900 border border-border p-2">
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewMediaUrl} alt="Preview" className="max-w-full max-h-[85vh] object-contain mx-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
