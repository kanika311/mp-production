'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  UploadCloud,
  FileText,
  Sparkles,
  Trash2,
  Plus,
  ExternalLink,
  Eye,
  Video,
  Image as ImageIcon,
  Folder,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  DollarSign,
  Globe,
  Award,
  Briefcase,
  Tag,
  X,
  RefreshCw,
  Sliders,
  Check,
  Presentation,
  Film,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface TalentEditPageProps {
  userId: string;
  basePath?: string; // '/super-admin' or '/admin'
}

type TabSection = 'core' | 'bio' | 'documents' | 'photos' | 'videos' | 'socials';

const TALENT_CATEGORIES = [
  'Actor / Actress',
  'Fashion Model',
  'Commercial Model',
  'Video Creator / Reeler',
  'Content Creator / Influencer',
  'Dancer / Performer',
  'Voiceover Artist',
  'TV / Event Anchor',
  'Fitness Model',
  'Child Artist',
  'Musician / Singer',
  'Stylist / Artist'
];

const EXPERIENCE_LEVELS = [
  'Fresher (0-1 Years)',
  'Rising Talent (1-3 Years)',
  'Experienced (3-5 Years)',
  'Veteran (5-10 Years)',
  'Celebrity / Industry Lead'
];

export function TalentEditPage({ userId, basePath = '/super-admin' }: TalentEditPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabSection>('core');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Core User & Contact state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [stageName, setStageName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TALENT');
  const [isActive, setIsActive] = useState(true);
  const [talentStatus, setTalentStatus] = useState('ACTIVE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Female');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [slug, setSlug] = useState('');

  // Bio & Professional details
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Experienced (3-5 Years)');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [brandsWorkedWith, setBrandsWorkedWith] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState('');

  // Documents: Resume, PPT / Presentation, Comp Card
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioPdfUrl, setPortfolioPdfUrl] = useState(''); // PPT / Presentation
  const [compCardUrl, setCompCardUrl] = useState('');

  // Cover & Media
  const [coverBannerUrl, setCoverBannerUrl] = useState('');
  const [coverBannerType, setCoverBannerType] = useState('image');
  const [introductionVideoUrl, setIntroductionVideoUrl] = useState('');
  const [showreelUrl, setShowreelUrl] = useState('');

  // Portfolio Media Galleries
  const [portfolioPhotos, setPortfolioPhotos] = useState<Array<{ id?: string; url: string; title: string; category: string }>>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');

  const [portfolioVideos, setPortfolioVideos] = useState<Array<{ id?: string; url: string; title: string; category: string }>>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('Commercial Shoot');

  // Social Links
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');

  // Pricing
  const [perDayRate, setPerDayRate] = useState<string>('');
  const [perHourRate, setPerHourRate] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Hidden File Inputs
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const pptFileRef = useRef<HTMLInputElement>(null);
  const compCardFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const photoGalleryFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('mdms_auth_token') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('mdms_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim().replace(/^"|"$/g, '')}`;
      }
    }
    return headers;
  };

  // Fetch full user and talent profile details
  useEffect(() => {
    const fetchTalentDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to load talent user details');
        const json = await res.json();
        const u = json.data;
        if (!u) throw new Error('User not found');

        // User attributes
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setRole(u.role || 'TALENT');
        setIsActive(u.isActive !== undefined ? u.isActive : true);
        setDateOfBirth(u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '');
        setGender(u.gender || 'Female');
        setCity(u.city || '');
        setState(u.state || '');
        setCountry(u.country || 'India');
        setAvatarUrl(u.avatarUrl || '');

        // Talent Profile attributes
        const p = u.talentProfile;
        if (p) {
          setSlug(p.slug || '');
          setStageName(p.stageName || '');
          setTalentStatus(p.status || 'ACTIVE');
          setBio(p.bio || '');
          setExperienceLevel(p.experienceLevel || 'Experienced (3-5 Years)');
          setResumeUrl(p.resumeUrl || '');
          setPortfolioPdfUrl(p.portfolioPdfUrl || '');
          setCompCardUrl(p.compCardUrl || '');
          setCoverBannerUrl(p.coverBannerUrl || '');
          setCoverBannerType(p.coverBannerType || 'image');
          setIntroductionVideoUrl(p.introductionVideoUrl || '');
          setBrandsWorkedWith(Array.isArray(p.brandsWorkedWith) ? p.brandsWorkedWith : []);

          // Categories
          if (Array.isArray(p.userTalents)) {
            const catNames = p.userTalents.map((ut: any) => ut.category?.name).filter(Boolean);
            setSelectedCategories(catNames.length > 0 ? catNames : ['Fashion Model']);
          }

          // Skills
          if (Array.isArray(p.userSkills)) {
            const skillNames = p.userSkills.map((us: any) => us.skill?.name).filter(Boolean);
            setSkills(skillNames);
          }

          // Languages
          if (Array.isArray(p.userLanguages)) {
            const langNames = p.userLanguages.map((ul: any) => ul.language?.name).filter(Boolean);
            setLanguages(langNames.length > 0 ? langNames : ['Hindi', 'English']);
          }

          // Pricing
          if (p.pricing) {
            setPerDayRate(p.pricing.perDay ? String(p.pricing.perDay) : '');
            setPerHourRate(p.pricing.perHour ? String(p.pricing.perHour) : '');
            setIsNegotiable(p.pricing.isNegotiable !== undefined ? p.pricing.isNegotiable : true);
          }

          // Social Links
          if (Array.isArray(p.socialLinks)) {
            p.socialLinks.forEach((sl: any) => {
              if (sl.platform === 'INSTAGRAM') setInstagram(sl.url || '');
              if (sl.platform === 'YOUTUBE') setYoutube(sl.url || '');
              if (sl.platform === 'FACEBOOK') setFacebook(sl.url || '');
              if (sl.platform === 'LINKEDIN') setLinkedin(sl.url || '');
              if (sl.platform === 'WEBSITE' || sl.platform === 'OTHER') setWebsite(sl.url || '');
            });
          }

          // Portfolio Media (Photos vs Videos vs Showreel)
          if (Array.isArray(p.portfolioMedia)) {
            const photos: any[] = [];
            const videos: any[] = [];
            p.portfolioMedia.forEach((m: any) => {
              if (m.type === 'SHOWREEL') {
                setShowreelUrl(m.url);
              } else if (
                m.type === 'PORTFOLIO_VIDEO' ||
                m.type === 'WALK_VIDEO' ||
                m.type === 'DANCE_VIDEO' ||
                (m.url && m.url.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i)) ||
                (m.url && (m.url.includes('youtube.com') || m.url.includes('youtu.be') || m.url.includes('vimeo.com')))
              ) {
                videos.push({ id: m.id, url: m.url, title: m.title || 'Portfolio Video', category: m.category || 'Reel' });
              } else {
                photos.push({ id: m.id, url: m.url, title: m.title || 'Portfolio Photo', category: m.category || 'Editorial' });
              }
            });
            setPortfolioPhotos(photos);
            setPortfolioVideos(videos);
          }
        }
      } catch (err: any) {
        console.error('Error loading talent details:', err);
        toast.error(err.message || 'Error loading talent user details');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTalentDetails();
    }
  }, [userId]);

  // Generic File Upload Handler using /api/upload
  const handleFileUpload = async (file: File, field: string) => {
    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `mdms/talents/${userId}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const json = await res.json();
      const uploadedUrl = json.url;

      if (!uploadedUrl) throw new Error('No URL returned from upload server');

      if (field === 'resume') {
        setResumeUrl(uploadedUrl);
        toast.success('Resume file uploaded successfully!');
      } else if (field === 'ppt') {
        setPortfolioPdfUrl(uploadedUrl);
        toast.success('Presentation / PPT uploaded successfully!');
      } else if (field === 'compCard') {
        setCompCardUrl(uploadedUrl);
        toast.success('Comp Card uploaded successfully!');
      } else if (field === 'avatar') {
        setAvatarUrl(uploadedUrl);
        toast.success('Profile avatar uploaded successfully!');
      } else if (field === 'banner') {
        setCoverBannerUrl(uploadedUrl);
        toast.success('Cover banner uploaded successfully!');
      } else if (field === 'photoGallery') {
        setPortfolioPhotos((prev) => [
          ...prev,
          { url: uploadedUrl, title: file.name.replace(/\.[^/.]+$/, ''), category: 'Portfolio' }
        ]);
        toast.success('Photo added to gallery!');
      } else if (field === 'videoGallery') {
        setPortfolioVideos((prev) => [
          ...prev,
          { url: uploadedUrl, title: file.name.replace(/\.[^/.]+$/, ''), category: 'Reel' }
        ]);
        toast.success('Video added to portfolio!');
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      toast.error(err.message || 'Error uploading file');
    } finally {
      setUploadingField(null);
    }
  };

  // Add Item Helpers
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return;
    if (!languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
    }
    setNewLanguage('');
  };

  const handleAddBrand = () => {
    if (!newBrand.trim()) return;
    if (!brandsWorkedWith.includes(newBrand.trim())) {
      setBrandsWorkedWith([...brandsWorkedWith, newBrand.trim()]);
    }
    setNewBrand('');
  };

  const handleAddPhotoManual = () => {
    if (!newPhotoUrl.trim()) return;
    setPortfolioPhotos((prev) => [
      ...prev,
      { url: newPhotoUrl.trim(), title: newPhotoTitle.trim() || 'Portfolio Photo', category: 'Portfolio' }
    ]);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
  };

  const handleAddVideoManual = () => {
    if (!newVideoUrl.trim()) return;
    setPortfolioVideos((prev) => [
      ...prev,
      { url: newVideoUrl.trim(), title: newVideoTitle.trim() || 'Portfolio Video', category: newVideoCategory }
    ]);
    setNewVideoUrl('');
    setNewVideoTitle('');
  };

  // Save All Changes to Backend API
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firstName.trim()) {
      toast.error('First name is required.');
      setActiveTab('core');
      return;
    }
    if (!email.trim()) {
      toast.error('Email address is required.');
      setActiveTab('core');
      return;
    }
    if (password && password.trim().length > 0 && password.trim().length < 6) {
      toast.error('New password must be at least 6 characters.');
      setActiveTab('core');
      return;
    }

    setSaving(true);
    try {
      // Build portfolio media array combining photos, videos, and showreel
      const portfolioMediaPayload: any[] = [];
      if (showreelUrl && showreelUrl.trim().length > 0) {
        portfolioMediaPayload.push({
          type: 'SHOWREEL',
          url: showreelUrl.trim(),
          title: 'Official Showreel',
          category: 'Showreel',
          order: 0,
        });
      }
      portfolioPhotos.forEach((p, idx) => {
        if (p.url && p.url.trim().length > 0) {
          portfolioMediaPayload.push({
            type: 'PORTFOLIO_IMAGE',
            url: p.url.trim(),
            title: p.title || 'Portfolio Image',
            category: p.category || 'Editorial',
            order: idx + 1,
          });
        }
      });
      portfolioVideos.forEach((v, idx) => {
        if (v.url && v.url.trim().length > 0) {
          portfolioMediaPayload.push({
            type: 'PORTFOLIO_VIDEO',
            url: v.url.trim(),
            title: v.title || 'Portfolio Video',
            category: v.category || 'Commercial',
            order: idx + 50,
          });
        }
      });

      // Build social links
      const socialLinksPayload: any[] = [];
      if (instagram.trim()) socialLinksPayload.push({ platform: 'INSTAGRAM', url: instagram.trim(), handle: instagram.trim().replace(/^.*instagram\.com\//, '@') });
      if (youtube.trim()) socialLinksPayload.push({ platform: 'YOUTUBE', url: youtube.trim() });
      if (facebook.trim()) socialLinksPayload.push({ platform: 'FACEBOOK', url: facebook.trim() });
      if (linkedin.trim()) socialLinksPayload.push({ platform: 'LINKEDIN', url: linkedin.trim() });
      if (website.trim()) socialLinksPayload.push({ platform: 'WEBSITE', url: website.trim() });

      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        role: role,
        isActive: isActive,
        dateOfBirth: dateOfBirth || null,
        gender: gender,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || 'India',
        avatarUrl: avatarUrl.trim() || null,

        // Talent Profile attributes
        stageName: stageName.trim() || null,
        talentStatus: talentStatus,
        bio: bio.trim() || null,
        experienceLevel: experienceLevel,
        resumeUrl: resumeUrl.trim() || null,
        portfolioPdfUrl: portfolioPdfUrl.trim() || null,
        compCardUrl: compCardUrl.trim() || null,
        coverBannerUrl: coverBannerUrl.trim() || null,
        coverBannerType: coverBannerType,
        introductionVideoUrl: introductionVideoUrl.trim() || null,
        brandsWorkedWith: brandsWorkedWith,

        // Pricing
        pricing: {
          perDay: perDayRate ? parseInt(perDayRate, 10) : null,
          perHour: perHourRate ? parseInt(perHourRate, 10) : null,
          isNegotiable: isNegotiable,
          currency: 'INR',
        },

        // Media & dynamic relations
        portfolioMedia: portfolioMediaPayload,
        socialLinks: socialLinksPayload,
        skills: skills,
        languages: languages,
      };

      if (password && password.trim().length >= 6) {
        payload.password = password.trim();
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to update talent profile');
      }

      toast.success(`🎉 Profile updated successfully for ${stageName || firstName}!`);
    } catch (err: any) {
      console.error('Save Error:', err);
      toast.error(err.message || 'Failed to update talent profile');
    } finally {
      setSaving(false);
    }
  };

  const backUrl = `${basePath}?tab=talents`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">Loading Comprehensive Talent Editor...</p>
        <span className="text-xs text-slate-500 mt-1">Fetching resume, presentations, media assets & profile data</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-28">
      {/* ── TOP STICKY NAVBAR & BREADCRUMB ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
              title="Return to Talents List"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Link href={backUrl} className="hover:text-red-600 transition-colors">Talents</Link>
                <span>/</span>
                <span className="text-slate-800 font-bold truncate max-w-[180px] sm:max-w-none">
                  {stageName || `${firstName} ${lastName}` || 'Talent Profile'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  talentStatus === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {talentStatus}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{stageName || `${firstName} ${lastName}`}</span>
                {slug && (
                  <Link
                    href={`/talent/${slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 underline"
                  >
                    <span>View Public Page</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <Link
              href={backUrl}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Saving Everything...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* ── SECTION NAVIGATION TABS ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1 sm:gap-2 py-2">
            {[
              { id: 'core', label: 'Core & Contact', icon: User },
              { id: 'bio', label: 'Bio & Expertise', icon: Award },
              { id: 'documents', label: 'Resume & PPT Decks', icon: Presentation },
              { id: 'photos', label: 'Photos & Banners', icon: Camera },
              { id: 'videos', label: 'Videos & Reels', icon: Film },
              { id: 'socials', label: 'Socials & Rates', icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabSection)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    isCurrent
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <form onSubmit={handleSave} className="space-y-6">

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: CORE & CONTACT INFORMATION                             */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'core' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="text-red-600" size={18} />
                    <span>Core Profile & Identity</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Essential identity, contact credentials, login password, and account security.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Active Status:</span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                    }`}
                  >
                    {isActive ? 'Active' : 'Suspended'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Shweta"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Stage Name / Screen Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Screen / Stage Name</label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="e.g. Shweta V"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Email Address (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shweta@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9891750759"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Verification Review Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Talent Verification Status</label>
                  <select
                    value={talentStatus}
                    onChange={(e) => setTalentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  >
                    <option value="ACTIVE">ACTIVE (Approved &amp; Live)</option>
                    <option value="PENDING_REVIEW">PENDING_REVIEW (Awaiting Approval)</option>
                    <option value="DRAFT">DRAFT (Onboarding Incomplete)</option>
                    <option value="SUSPENDED">SUSPENDED (Hidden from Roster)</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">City Base</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai / Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Reset Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">Reset Password (Optional)</label>
                    <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password to reset"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: BIO & PROFESSIONAL DETAILS                              */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'bio' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="text-red-600" size={18} />
                  <span>Bio, Categories &amp; Expertise</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Craft the complete narrative, acting/modelling categories, skills, and industry brands.
                </p>
              </div>

              {/* Bio Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">Talent Biography / About</label>
                  <span className="text-[10px] text-slate-400 font-mono">{bio.length} characters</span>
                </div>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe talent's background, physical attributes (height, measurements), acting style, reel accomplishments, and work preferences..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm leading-relaxed focus:outline-none focus:border-red-500 focus:bg-white transition-all font-sans"
                />
              </div>

              {/* Experience Level & Specialization Categories */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800">Experience Tier</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {EXPERIENCE_LEVELS.map((lvl) => {
                    const isSelected = experienceLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-50 border-red-500 text-red-600 ring-2 ring-red-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories Pills */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">Talent Categories / Roster Roles</label>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedCategories.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TALENT_CATEGORIES.map((cat) => {
                    const isSel = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (isSel) {
                            setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                          } else {
                            setSelectedCategories([...selectedCategories, cat]);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSel
                            ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSel && <Check size={12} className="stroke-[3]" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800">Skills &amp; Capabilities</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    placeholder="Add skill (e.g. Ramp Walk, Method Acting, Dialects, Stunts) & press Add"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((sk) => sk !== s))}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages Tags */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800">Languages Spoken</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
                    placeholder="Add language (e.g. Hindi, English, Punjabi, French) & press Add"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {languages.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800"
                    >
                      <span>{l}</span>
                      <button
                        type="button"
                        onClick={() => setLanguages(languages.filter((lg) => lg !== l))}
                        className="text-emerald-400 hover:text-red-600 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Brands Worked With */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800">Commercial Brands Worked With</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBrand(); } }}
                    placeholder="Add commercial brand (e.g. Myntra, Nykaa, Zara, Netflix, Lakme) & press Add"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBrand}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {brandsWorkedWith.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800"
                    >
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => setBrandsWorkedWith(brandsWorkedWith.filter((br) => br !== b))}
                        className="text-amber-400 hover:text-red-600 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: RESUME, PPT / PRESENTATION & COMP CARD                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* 1. RESUME SECTION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Talent Resume / Curriculum Vitae</h3>
                      <p className="text-xs text-slate-500">
                        Upload official PDF / DOCX resume or link to cloud document.
                      </p>
                    </div>
                  </div>
                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                    >
                      <span>Open Current Resume</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload Box */}
                  <div
                    onClick={() => resumeFileRef.current?.click()}
                    className="p-6 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl bg-slate-50 hover:bg-red-50/20 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <input
                      ref={resumeFileRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, 'resume');
                      }}
                      className="hidden"
                    />
                    {uploadingField === 'resume' ? (
                      <Loader2 size={24} className="animate-spin text-red-600" />
                    ) : (
                      <UploadCloud size={28} className="text-slate-400 group-hover:text-red-500" />
                    )}
                    <p className="font-bold text-xs text-slate-800">
                      {uploadingField === 'resume' ? 'Uploading Resume to Cloud...' : 'Click to Upload Resume (PDF / DOCX)'}
                    </p>
                    <span className="text-[10px] text-slate-400">Max file size 25MB</span>
                  </div>

                  {/* Direct URL input */}
                  <div className="space-y-2 flex flex-col justify-center">
                    <label className="block text-xs font-bold text-slate-800">Or Paste Direct Resume URL</label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/.../resume.pdf"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                    {resumeUrl && (
                      <button
                        type="button"
                        onClick={() => setResumeUrl('')}
                        className="text-xs text-rose-600 font-bold hover:underline self-start flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Remove Resume</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. PPT / PRESENTATION / PORTFOLIO DECK SECTION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                      <Presentation size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">PPT / Presentation / Portfolio Deck</h3>
                      <p className="text-xs text-slate-500">
                        Upload pitch deck, corporate profile presentation, or brand PDF slides.
                      </p>
                    </div>
                  </div>
                  {portfolioPdfUrl && (
                    <a
                      href={portfolioPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                    >
                      <span>Open Deck / Slides</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload Box */}
                  <div
                    onClick={() => pptFileRef.current?.click()}
                    className="p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl bg-slate-50 hover:bg-indigo-50/20 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <input
                      ref={pptFileRef}
                      type="file"
                      accept=".ppt,.pptx,.pdf,.key"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, 'ppt');
                      }}
                      className="hidden"
                    />
                    {uploadingField === 'ppt' ? (
                      <Loader2 size={24} className="animate-spin text-indigo-600" />
                    ) : (
                      <UploadCloud size={28} className="text-slate-400 group-hover:text-indigo-500" />
                    )}
                    <p className="font-bold text-xs text-slate-800">
                      {uploadingField === 'ppt' ? 'Uploading Presentation...' : 'Click to Upload PPT / Slides (PPTX / PDF)'}
                    </p>
                    <span className="text-[10px] text-slate-400">PowerPoint, Keynote or PDF Slides</span>
                  </div>

                  {/* Direct URL input */}
                  <div className="space-y-2 flex flex-col justify-center">
                    <label className="block text-xs font-bold text-slate-800">Or Paste Presentation Deck URL</label>
                    <input
                      type="url"
                      value={portfolioPdfUrl}
                      onChange={(e) => setPortfolioPdfUrl(e.target.value)}
                      placeholder="https://.../portfolio-deck.pdf or Google Slides link"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                    {portfolioPdfUrl && (
                      <button
                        type="button"
                        onClick={() => setPortfolioPdfUrl('')}
                        className="text-xs text-rose-600 font-bold hover:underline self-start flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Remove Presentation</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. COMP CARD SECTION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Talent Comp Card (Composite Card)</h3>
                      <p className="text-xs text-slate-500">
                        Standard model composite card with headshot, full body look, and stats.
                      </p>
                    </div>
                  </div>
                  {compCardUrl && (
                    <a
                      href={compCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors"
                    >
                      <span>View Comp Card</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload Box */}
                  <div
                    onClick={() => compCardFileRef.current?.click()}
                    className="p-6 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl bg-slate-50 hover:bg-amber-50/20 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <input
                      ref={compCardFileRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, 'compCard');
                      }}
                      className="hidden"
                    />
                    {uploadingField === 'compCard' ? (
                      <Loader2 size={24} className="animate-spin text-amber-600" />
                    ) : (
                      <UploadCloud size={28} className="text-slate-400 group-hover:text-amber-500" />
                    )}
                    <p className="font-bold text-xs text-slate-800">
                      {uploadingField === 'compCard' ? 'Uploading Comp Card...' : 'Click to Upload Comp Card (Image / PDF)'}
                    </p>
                    <span className="text-[10px] text-slate-400">High Resolution Composite Card</span>
                  </div>

                  {/* Direct URL input */}
                  <div className="space-y-2 flex flex-col justify-center">
                    <label className="block text-xs font-bold text-slate-800">Or Paste Comp Card URL</label>
                    <input
                      type="url"
                      value={compCardUrl}
                      onChange={(e) => setCompCardUrl(e.target.value)}
                      placeholder="https://.../comp-card.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    {compCardUrl && (
                      <button
                        type="button"
                        onClick={() => setCompCardUrl('')}
                        className="text-xs text-rose-600 font-bold hover:underline self-start flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Remove Comp Card</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: PHOTOS, AVATAR & BANNERS                               */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Profile Avatar & Cover Banner Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Camera className="text-red-600" size={18} />
                    <span>Avatar &amp; Hero Cover Banner</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Profile headshot icon and wide panoramic cover banner.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Avatar Photo */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Main Profile Avatar
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-200 border-2 border-slate-300 overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => avatarFileRef.current?.click()}
                          disabled={uploadingField === 'avatar'}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {uploadingField === 'avatar' ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                          <span>Upload New Headshot</span>
                        </button>
                        <input
                          ref={avatarFileRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(f, 'avatar');
                          }}
                          className="hidden"
                        />
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="Or paste headshot image URL"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Cover Banner */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        Hero Cover Banner
                      </span>
                      <select
                        value={coverBannerType}
                        onChange={(e) => setCoverBannerType(e.target.value)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200"
                      >
                        <option value="image">Image Banner</option>
                        <option value="video">Video Banner</option>
                      </select>
                    </div>

                    <div className="h-20 w-full rounded-xl bg-slate-200 border border-slate-300 overflow-hidden relative flex items-center justify-center">
                      {coverBannerUrl ? (
                        coverBannerType === 'video' ? (
                          <video src={coverBannerUrl} autoPlay loop muted className="w-full h-full object-cover" />
                        ) : (
                          <img src={coverBannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <span className="text-xs font-medium text-slate-400">No Cover Banner set</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bannerFileRef.current?.click()}
                        disabled={uploadingField === 'banner'}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {uploadingField === 'banner' ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                        <span>Upload Banner</span>
                      </button>
                      <input
                        ref={bannerFileRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(f, 'banner');
                        }}
                        className="hidden"
                      />
                      <input
                        type="url"
                        value={coverBannerUrl}
                        onChange={(e) => setCoverBannerUrl(e.target.value)}
                        placeholder="Or paste banner image/video URL"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. PORTFOLIO PHOTOS GALLERY */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Camera className="text-red-600" size={18} />
                      <span>Portfolio Photo Gallery</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Editorial shoots, runway photos, commercial campaigns, and high-fashion looks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => photoGalleryFileRef.current?.click()}
                      disabled={uploadingField === 'photoGallery'}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {uploadingField === 'photoGallery' ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                      <span>+ Upload Photo</span>
                    </button>
                    <input
                      ref={photoGalleryFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, 'photoGallery');
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Add Photo via URL */}
                <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Or paste external photo image URL (https://...)"
                    className="flex-1 w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="Photo Title / Campaign name"
                    className="w-full sm:w-48 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoManual}
                    className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    Add Photo
                  </button>
                </div>

                {/* Photos Grid */}
                {portfolioPhotos.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Camera size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No portfolio photos added yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Upload photos or paste URLs above to populate talent gallery</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {portfolioPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs aspect-3/4 flex flex-col"
                      >
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white">
                          <p className="text-[11px] font-bold truncate">{photo.title || `Photo #${idx + 1}`}</p>
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/20">
                            <a
                              href={photo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-white hover:underline flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ExternalLink size={10} />
                            </a>
                            <button
                              type="button"
                              onClick={() => setPortfolioPhotos(portfolioPhotos.filter((_, i) => i !== idx))}
                              className="p-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 5: VIDEOS & REELS                                         */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Introduction Video & Showreel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Introduction Video */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Video className="text-red-600" size={18} />
                    <h3 className="font-bold text-sm text-slate-900">Talent Introduction Video</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Official 60-second video introduction, self-tape, or greeting.
                  </p>
                  <input
                    type="url"
                    value={introductionVideoUrl}
                    onChange={(e) => setIntroductionVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or direct MP4 URL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                  {introductionVideoUrl && (
                    <div className="aspect-video w-full rounded-xl bg-slate-900 overflow-hidden relative">
                      {introductionVideoUrl.includes('youtube') || introductionVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={introductionVideoUrl.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video src={introductionVideoUrl} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Official Showreel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Film className="text-red-600" size={18} />
                    <h3 className="font-bold text-sm text-slate-900">Official Cinematic Showreel</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Highlights reel from commercials, films, fashion shows, and TV shoots.
                  </p>
                  <input
                    type="url"
                    value={showreelUrl}
                    onChange={(e) => setShowreelUrl(e.target.value)}
                    placeholder="https://vimeo.com/... or YouTube showreel link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                  {showreelUrl && (
                    <div className="aspect-video w-full rounded-xl bg-slate-900 overflow-hidden relative">
                      {showreelUrl.includes('youtube') || showreelUrl.includes('youtu.be') ? (
                        <iframe
                          src={showreelUrl.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video src={showreelUrl} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. PORTFOLIO VIDEOS & REELS GALLERY */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Film className="text-red-600" size={18} />
                      <span>Portfolio Videos &amp; Reels Gallery</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Commercials, acting scenes, audition tapes, dance videos &amp; YouTube shorts.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => videoFileRef.current?.click()}
                      disabled={uploadingField === 'videoGallery'}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {uploadingField === 'videoGallery' ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                      <span>+ Upload Video</span>
                    </button>
                    <input
                      ref={videoFileRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, 'videoGallery');
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Add Video via URL */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="Video link (YouTube, Vimeo, MP4)..."
                    className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    placeholder="Video Title / Project name"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoManual}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    Add Video
                  </button>
                </div>

                {/* Videos Grid */}
                {portfolioVideos.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Video size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No portfolio videos added yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Upload video clips or paste YouTube/Vimeo links above</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioVideos.map((vid, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-2xs flex flex-col"
                      >
                        <div className="aspect-video w-full relative bg-black flex items-center justify-center">
                          {vid.url.includes('youtube') || vid.url.includes('youtu.be') ? (
                            <iframe
                              src={vid.url.replace('watch?v=', 'embed/')}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          ) : (
                            <video src={vid.url} controls className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                          <div>
                            <p className="text-xs font-bold text-slate-800 truncate">{vid.title || `Video #${idx + 1}`}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{vid.category || 'Portfolio Reel'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPortfolioVideos(portfolioVideos.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Video"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 6: SOCIAL MEDIA & COMMERCIAL RATES                        */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'socials' && (
            <div className="space-y-6">
              {/* 1. Commercial Pricing Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <DollarSign className="text-emerald-600" size={18} />
                    <span>Commercial Booking Rates</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standard booking rates for brand shoots, campaigns, and events.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Full Day Shoot Rate (₹ INR)</label>
                    <input
                      type="number"
                      value={perDayRate}
                      onChange={(e) => setPerDayRate(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Half Day / Hourly Rate (₹ INR)</label>
                    <input
                      type="number"
                      value={perHourRate}
                      onChange={(e) => setPerHourRate(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="block text-xs font-bold text-slate-800 mb-2">Rate Negotiation</label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isNegotiable}
                        onChange={(e) => setIsNegotiable(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-700">Open to budget negotiations</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Social Media Handles */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Globe className="text-red-600" size={18} />
                    <span>Social Media Profiles &amp; Online Portfolios</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified profiles displayed on talent's public casting profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Instagram Profile URL</label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">YouTube Channel URL</label>
                    <input
                      type="url"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="https://youtube.com/@channel"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Facebook / IMDb / Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://imdb.com/name/... or personal website"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* BOTTOM STICKY ACTION BAR                                      */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl py-3.5 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  Editing: <span className="text-slate-900 font-extrabold">{stageName || `${firstName} ${lastName}`}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">({email})</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={backUrl}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/25 cursor-pointer transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{saving ? 'Saving Everything...' : 'Save All Changes'}</span>
                </button>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
