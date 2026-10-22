'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { HoverFooter as Footer } from '@/components/ui/hover-footer';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import { issueStudentSessionToken } from '@/lib/security';
import {
  Play,
  Sparkles,
  Video,
  Zap,
  TrendingUp,
  Award,
  CheckCircle2,
  Users,
  Film,
  ArrowRight,
  Star,
  Download,
  Lock,
  Search,
  Sliders,
  ChevronRight,
  BookOpen,
  Eye,
  Tv,
  Instagram,
  Youtube,
  Megaphone,
  Layers,
  Clock,
  Check,
  X,
  FileText,
  DollarSign,
  MessageCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CourseModule {
  title: string;
  duration: string;
  lessonsCount: number;
}

interface Blueprint {
  id: string;
  title: string;
  category: 'YOUTUBER' | 'REELER' | 'CREATOR' | 'INFLUENCER' | 'EDITING' | 'MONETIZATION';
  categoryLabel: string;
  badgeColor: string;
  duration: string;
  lessonsCount: number;
  level: 'Beginner' | 'Creator' | 'Pro Master';
  rating: number;
  enrolledCount: number;
  price: string;
  originalPrice: string;
  image: string;
  trailerVideoUrl: string;
  description: string;
  topics: string[];
  modules: CourseModule[];
  resources: string[];
  instructor: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
}

const ACADEMY_COURSES: Blueprint[] = [
  {
    id: 'course-youtuber',
    title: 'How to Become a YouTuber: 100K Algorithm & 4K Setup',
    category: 'YOUTUBER',
    categoryLabel: 'YouTube Masterclass',
    badgeColor: 'bg-red-600 text-white',
    duration: '4.5 Hours',
    lessonsCount: 18,
    level: 'Creator',
    rating: 5.0,
    enrolledCount: 6890,
    price: '₹4,999',
    originalPrice: '₹12,999',
    image: '/images/services-lighting.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Master the exact 4K studio lighting, Sony/Canon Log camera profiles, 3-second retention hooks, and CTR thumbnail psychology that triggered 100K+ channel pushes.',
    topics: ['Sony & Canon 10-Bit Log Setup', '3-Point Studio & Ambient Lighting', 'Audience Retention Graph Hacking', 'High-CTR Thumbnail Design'],
    modules: [
      { title: 'Module 1: Camera Gear, Log Profiles & Studio Lighting', duration: '55 mins', lessonsCount: 4 },
      { title: 'Module 2: The 3-Second Hook & Audience Retention Graph', duration: '60 mins', lessonsCount: 5 },
      { title: 'Module 3: High-CTR Thumbnail Design & A/B Testing', duration: '45 mins', lessonsCount: 4 },
      { title: 'Module 4: DaVinci Resolve Exporting for YouTube 4K', duration: '50 mins', lessonsCount: 5 },
    ],
    resources: [
      'MP Production 4K Sony/Canon LUT Pack',
      'High-CTR Photoshop Thumbnail Templates (PSD)',
      '100K YouTube Creator Checklist & Script Format',
      'Studio Lighting Blueprint & Equipment List',
    ],
    instructor: {
      name: 'Rohan Verma',
      role: 'Head of Cinematography & YouTube Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Scaled 12+ channels past 100K subscribers with over 40 Million views generated across tech, lifestyle, and luxury visual storytelling.',
    },
  },
  {
    id: 'course-reeler',
    title: 'How to Become an Instagram Reeler: Viral 9:16 Secrets',
    category: 'REELER',
    categoryLabel: 'Instagram Reels',
    badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    duration: '3.5 Hours',
    lessonsCount: 15,
    level: 'Beginner',
    rating: 4.9,
    enrolledCount: 8420,
    price: '₹3,499',
    originalPrice: '₹8,999',
    image: '/assets/project-fashion.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: 'Learn 9:16 vertical composition, beat-sync editing, trending audio selection, fast-paced transitions, and Instagram algorithm Explore page triggers.',
    topics: ['9:16 Vertical Framing Secrets', 'Beat-Sync Transitions & SFX Layering', 'Trending Audio Selection Hacks', 'Instagram Explore Page Algorithm'],
    modules: [
      { title: 'Module 1: Mobile & Mirrorless 9:16 Framing & Lighting', duration: '40 mins', lessonsCount: 4 },
      { title: 'Module 2: Beat-Sync Editing & High-Energy Transitions', duration: '55 mins', lessonsCount: 5 },
      { title: 'Module 3: Audio Selection & Viral Hook Audio Design', duration: '45 mins', lessonsCount: 3 },
      { title: 'Module 4: Reels Growth Strategy & Daily Upload System', duration: '40 mins', lessonsCount: 3 },
    ],
    resources: [
      '25+ Premiere Pro & CapCut Seamless Transitions',
      'Viral Reels Sound FX Pack (Whooshes, Risers, Pops)',
      'Instagram Reels Algorithm Strategy E-Book',
      'Trending Audio Discovery Sheet',
    ],
    instructor: {
      name: 'Aanya Kapoor',
      role: 'Short-Form Content Strategist',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: 'Short-form content creator with over 150M Reels views and 850K Instagram followers across personal and brand handles.',
    },
  },
  {
    id: 'course-creator',
    title: 'How to Become a Content Creator: Zero to Production House',
    category: 'CREATOR',
    categoryLabel: 'Content Creator',
    badgeColor: 'bg-emerald-600 text-white',
    duration: '5.2 Hours',
    lessonsCount: 22,
    level: 'Creator',
    rating: 4.9,
    enrolledCount: 4150,
    price: '₹5,999',
    originalPrice: '₹14,999',
    image: '/images/about-bts.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    description: 'A complete end-to-end blueprint to turn solo content creation into a multi-platform media brand with scriptwriting, multi-cam setups, and automated workflows.',
    topics: ['Scriptwriting & Storyboarding', 'Solo Creator Multi-Cam Setup', 'Multi-Platform Repurposing', 'Notion Creator OS Management'],
    modules: [
      { title: 'Module 1: Storytelling, Scriptwriting & Idea Generation', duration: '60 mins', lessonsCount: 5 },
      { title: 'Module 2: Solo Creator Gear: Audio, Camera & Gimbal', duration: '55 mins', lessonsCount: 5 },
      { title: 'Module 3: Multi-Platform Repurposing (YouTube, IG, X)', duration: '50 mins', lessonsCount: 6 },
      { title: 'Module 4: Creator OS: Managing Editors, Clients & Schedule', duration: '60 mins', lessonsCount: 6 },
    ],
    resources: [
      'Notion Creator OS Template (Full Production Dashboard)',
      'Equipment Buying Guide for Every Budget ($500 - $5,000)',
      'Scriptwriting & Storyboard Template (PDF/Word)',
      'Multi-Platform Content Repurposing Flowchart',
    ],
    instructor: {
      name: 'Karan Malhotra',
      role: 'Executive Producer, MP Production',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Executive Producer behind 500+ commercial and digital campaigns for global fashion, automotive, and tech brands.',
    },
  },
  {
    id: 'course-influencer',
    title: 'How to Become a High-Paid Influencer: Brand Deals & Media Kits',
    category: 'INFLUENCER',
    categoryLabel: 'Influencer & Brand',
    badgeColor: 'bg-amber-600 text-white',
    duration: '3.8 Hours',
    lessonsCount: 16,
    level: 'Pro Master',
    rating: 4.8,
    enrolledCount: 3920,
    price: '₹4,499',
    originalPrice: '₹11,999',
    image: '/assets/service_casting.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    description: 'Learn how to position your personal brand for luxury sponsors, create high-converting media kits, negotiate rate cards, and secure 6-figure brand contracts.',
    topics: ['Personal Brand Aesthetic Positioning', 'Designing High-Converting Media Kits', 'Cold Emailing PR Agencies & Brands', 'Contract Escrow & Usage Rights'],
    modules: [
      { title: 'Module 1: Personal Brand Positioning & Niche Dominance', duration: '45 mins', lessonsCount: 4 },
      { title: 'Module 2: Media Kit Architecture & Rate Card Formula', duration: '50 mins', lessonsCount: 4 },
      { title: 'Module 3: Cold Pitching Luxury Brands & PR Agencies', duration: '55 mins', lessonsCount: 4 },
      { title: 'Module 4: Contract Negotiation, Usage Rights & Payment', duration: '50 mins', lessonsCount: 4 },
    ],
    resources: [
      'Editable Canva & Figma Media Kit Templates',
      'Cold Email Pitch Scripts for PR Agencies & Brands',
      'Influencer Rate Card Calculator (Excel/Sheets)',
      'Sponsorship Contract & Usage Rights Legal Checklist',
    ],
    instructor: {
      name: 'Priya Sundaram',
      role: 'Head of Talent Relations & Agency Partnerships',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bio: 'Managed over 200 international cover models and digital influencers, facilitating $3M+ in brand sponsorship deals.',
    },
  },
  {
    id: 'course-davinci',
    title: 'DaVinci Resolve Hollywood Color Grading & FX Masterclass',
    category: 'EDITING',
    categoryLabel: 'Editing & VFX',
    badgeColor: 'bg-cyan-600 text-white',
    duration: '5.0 Hours',
    lessonsCount: 22,
    level: 'Pro Master',
    rating: 4.9,
    enrolledCount: 2150,
    price: '₹3,999',
    originalPrice: '₹9,999',
    image: '/images/about-bts.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    description: 'Transform flat 10-bit camera footage into rich, filmic 35mm aesthetics using node trees, LUT customization, skin tone isolation, and Kodak emulation.',
    topics: ['Node Graph Architecture', 'Skin Tone Qualifier Isolation', 'Kodak 2383 Film Emulation', 'Dolby Vision HDR Export'],
    modules: [
      { title: 'Module 1: Node Graph Setup & Color Management', duration: '60 mins', lessonsCount: 5 },
      { title: 'Module 2: Secondary Color Correction & Skin Tones', duration: '50 mins', lessonsCount: 5 },
      { title: 'Module 3: Kodak 2383 Emulation, Grain & Halation', duration: '55 mins', lessonsCount: 6 },
      { title: 'Module 4: Exporting for Cinema & Web HDR', duration: '40 mins', lessonsCount: 6 },
    ],
    resources: [
      '5 Premium Film Emulation LUTs (Kodak/Fuji)',
      'DaVinci Resolve PowerGrade Node Tree Templates',
      '35mm Film Grain & Halation Overlay Assets',
      'Color Grading Keyboard Shortcuts Cheat Sheet',
    ],
    instructor: {
      name: 'Vikramaditya Roy',
      role: 'Senior Colorist & Post Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Lead colorist at MP Production for commercials and feature films. Certified DaVinci Resolve Master Trainer.',
    },
  },
  {
    id: 'course-shorts',
    title: 'Viral Shorts & Micro-Video Hacking (TikTok & Shorts)',
    category: 'REELER',
    categoryLabel: 'Reels & Shorts',
    badgeColor: 'bg-rose-600 text-white',
    duration: '3.0 Hours',
    lessonsCount: 12,
    level: 'Beginner',
    rating: 5.0,
    enrolledCount: 7310,
    price: '₹2,999',
    originalPrice: '₹7,999',
    image: '/images/portfolio-equipment.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    description: 'Crack the 0.5-second visual hook rule, auto-captions, sound effect layering, and cross-platform automation for YouTube Shorts and TikTok.',
    topics: ['0.5-Second Visual Triggers', 'Dynamic Auto-Captions & Motion Text', 'Sound FX Layering for Micro-Videos', 'Cross-Platform Automation'],
    modules: [
      { title: 'Module 1: Micro-Hook Psychology: 0.5s Triggers', duration: '35 mins', lessonsCount: 3 },
      { title: 'Module 2: Dynamic Auto-Captions & Motion Text', duration: '45 mins', lessonsCount: 3 },
      { title: 'Module 3: SFX Layering & Pacing Secrets', duration: '40 mins', lessonsCount: 3 },
      { title: 'Module 4: Batch Creation & Cross-Posting System', duration: '40 mins', lessonsCount: 3 },
    ],
    resources: [
      '50+ High-Impact Sound Effects (Pops, Swooshes, Dings)',
      'Premiere Pro Auto-Caption Motion Text Preset',
      'Batch Content Calendar Template',
      'Short-Form Script Hook Bank (100+ Proven Hooks)',
    ],
    instructor: {
      name: 'Aanya Kapoor',
      role: 'Short-Form Content Strategist',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: 'Generated 150M+ views on vertical video formats across YouTube Shorts and Instagram Reels.',
    },
  },
  {
    id: 'course-podcast',
    title: 'Podcast & Audio Creator Blueprint: Studio Setup & Spotify',
    category: 'CREATOR',
    categoryLabel: 'Podcast & Audio',
    badgeColor: 'bg-purple-600 text-white',
    duration: '4.0 Hours',
    lessonsCount: 16,
    level: 'Creator',
    rating: 4.8,
    enrolledCount: 1840,
    price: '₹3,499',
    originalPrice: '₹8,499',
    image: '/images/careers-meeting.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    description: 'Setup broadcast-grade microphones, acoustic treatment, multi-cam video switching, and distribute your show to Spotify, Apple Podcasts, and YouTube.',
    topics: ['Shure SM7B & Audio Interface Setup', 'Multi-Cam Video Podcast Lighting', 'DAW Audio Processing (EQ & Compression)', 'Spotify & Apple Podcast Distribution'],
    modules: [
      { title: 'Module 1: Microphones, Interfaces & Acoustic Setup', duration: '45 mins', lessonsCount: 4 },
      { title: 'Module 2: Multi-Cam Studio Video Switching & Lighting', duration: '50 mins', lessonsCount: 4 },
      { title: 'Module 3: Audio Mastering (Noise Gate, EQ, Compression)', duration: '45 mins', lessonsCount: 4 },
      { title: 'Module 4: RSS Distribution & Guest Outreach System', duration: '40 mins', lessonsCount: 4 },
    ],
    resources: [
      'DAW Audio Processing Chain Preset (Adobe Audition/Logic)',
      'High-Profile Guest Pitch Email Templates',
      'Video Podcast Studio Equipment Guide',
      'Podcast Launch & RSS Distribution Checklist',
    ],
    instructor: {
      name: 'David Chen',
      role: 'Audio Engineer & Podcast Director',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      bio: 'Grammy-nominated audio engineer who has engineered top 10 podcasts on Apple Podcasts and Spotify.',
    },
  },
  {
    id: 'course-monetization',
    title: '6-Figure Brand Deals & Escrow Negotiation Masterclass',
    category: 'MONETIZATION',
    categoryLabel: 'Business & Revenue',
    badgeColor: 'bg-emerald-600 text-white',
    duration: '4.2 Hours',
    lessonsCount: 14,
    level: 'Pro Master',
    rating: 4.9,
    enrolledCount: 2890,
    price: '₹4,999',
    originalPrice: '₹12,999',
    image: '/images/projects-outdoor.webp',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'Learn pricing models (Flat Fee vs Affiliate vs Deliverables), inbound sponsor lead filtering, retainer deal contracts, and 12-month brand retainers.',
    topics: ['Sponsorship Pricing Models', 'Inbound Lead Filtering & VIP Pitching', '12-Month Brand Retainer Agreements', 'Legal Escrow & Payment Protection'],
    modules: [
      { title: 'Module 1: Sponsorship Pricing Models & Rate Math', duration: '50 mins', lessonsCount: 3 },
      { title: 'Module 2: Pitching & VIP Client Onboarding Flow', duration: '55 mins', lessonsCount: 4 },
      { title: 'Module 3: Retainer Deal Contracts (12-Month Deals)', duration: '60 mins', lessonsCount: 4 },
      { title: 'Module 4: Legal Escrow, NDAs & Copyright Terms', duration: '45 mins', lessonsCount: 3 },
    ],
    resources: [
      '12-Month Brand Retainer Contract PDF/Doc',
      'Sponsorship Rate Calculator Spreadsheet',
      'Inbound Lead Filtering Quiz & Script',
      'Legal Escrow & Licensing Usage Agreement',
    ],
    instructor: {
      name: 'Karan Malhotra',
      role: 'Executive Producer, MP Production',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Executive Producer overseeing $5M+ in creator partnerships and agency campaigns.',
    },
  },
];

// Map a DB Course row (from GET /cms/courses) to the Blueprint shape the UI uses.
function mapCourseRowToBlueprint(row: any): Blueprint {
  return {
    id: row.slug || row.id,
    title: row.title,
    category: (row.category || 'CREATOR') as Blueprint['category'],
    categoryLabel: row.categoryLabel || 'Masterclass',
    badgeColor: row.badgeColor || 'bg-brand text-white',
    duration: row.duration || '',
    lessonsCount: Number(row.lessonsCount) || 0,
    level: (row.level || 'Creator') as Blueprint['level'],
    rating: Number(row.rating) || 5,
    enrolledCount: Number(row.enrolledCount) || 0,
    price: row.price || '',
    originalPrice: row.originalPrice || '',
    image: row.image || '/images/services-lighting.webp',
    trailerVideoUrl: row.trailerVideoUrl || '',
    description: row.description || '',
    topics: Array.isArray(row.topics) ? row.topics : [],
    modules: Array.isArray(row.modules) ? row.modules : [],
    resources: Array.isArray(row.resources) ? row.resources : [],
    instructor: {
      name: row.instructorName || 'MP Instructor',
      role: row.instructorRole || '',
      avatar: row.instructorAvatar || '',
      bio: row.instructorBio || '',
    },
  };
}

export default function BecomeAYouTuberPage({ defaultCategory = 'ALL' }: { defaultCategory?: string }) {
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Start empty — CMS / DB is the source of truth. Static catalog is only used
  // if the API is completely unreachable.
  const [courses, setCourses] = useState<Blueprint[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [previewBlueprint, setPreviewBlueprint] = useState<Blueprint | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'overview' | 'syllabus' | 'resources' | 'instructor'>('overview');
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false);
  const [accessForm, setAccessForm] = useState({ name: '', email: '', phone: '', channelUrl: '' });
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [leadSuccessData, setLeadSuccessData] = useState<{
    leadId: string;
    name: string;
    email: string;
    phone: string;
    courseTitle: string;
    price: string;
    channelUrl: string;
  } | null>(null);

  React.useEffect(() => {
    if (previewBlueprint || showCheckoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewBlueprint, showCheckoutModal]);

  // Load published courses from Nest CMS. Empty API = empty storefront.
  // Static catalog only if the request throws (API down).
  React.useEffect(() => {
    let cancelled = false;
    setCoursesLoading(true);
    fetchAPI('/cms/courses?limit=100', { cache: 'no-store' })
      .then((res: any) => {
        if (cancelled) return;
        const rows = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];
        setCourses(rows.map(mapCourseRowToBlueprint));
      })
      .catch(() => {
        if (!cancelled) setCourses(ACADEMY_COURSES);
      })
      .finally(() => {
        if (!cancelled) setCoursesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPlaybooks = courses.filter(bp => {
    const matchesCat = activeCategory === 'ALL' || bp.category === activeCategory;
    const matchesSearch = bp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bp.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const router = useRouter();

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!accessForm.name || !accessForm.email || !accessForm.phone) {
      toast.error('Please fill in required fields: Name, Email, and WhatsApp Phone.');
      return;
    }

    setIsSubmittingLead(true);
    try {
      const courseTitle = previewBlueprint?.title || 'MP Creator Academy';
      const price = previewBlueprint?.price || '₹4,999';
      const courseId = previewBlueprint?.id || 'course-youtuber';

      // Generate 256-Bit Cryptographic Signed Student Session Token
      const secToken = await issueStudentSessionToken(
        accessForm.name.trim(),
        accessForm.email.trim(),
        accessForm.phone.trim()
      );

      // Save user details & set 256-bit encrypted student state for Checkout & Navbar
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mp_student_name', accessForm.name.trim());
        sessionStorage.setItem('mp_student_email', accessForm.email.trim());
        sessionStorage.setItem('mp_student_phone', accessForm.phone.trim());
        sessionStorage.setItem('mp_student_logged_in', 'true');
        sessionStorage.setItem('mp_sec_token', secToken);
      }

      // Post real sales lead to NestJS backend API (/cms/contact)
      await fetchAPI('/cms/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: accessForm.name.trim(),
          email: accessForm.email.trim(),
          phone: accessForm.phone.trim(),
          subject: `Creator Academy Lead: ${courseTitle}`,
          message: `User Registered Lead:\nCourse: ${courseTitle}\nPrice: ${price}\nChannel: ${accessForm.channelUrl.trim() || 'N/A'}\nPhone: ${accessForm.phone.trim()}`,
        }),
      });

      toast.success(`🎉 Details Registered! Redirecting to Cart & Checkout...`);
      setShowCheckoutModal(false);

      // Immediately redirect user to Cart & Checkout Page!
      router.push(`/checkout?courseId=${courseId}`);
    } catch (err) {
      toast.error('Error proceeding to checkout. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  }

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-10 overflow-hidden bg-background text-foreground isolate border-b border-border/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/15 via-brand/5 to-transparent rounded-full pointer-events-none transform-gpu -z-10" />
        
        <div className="mx-auto max-w-7xl">
          <Reveal direction="up">
            <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/15 border border-brand/40 text-brand text-xs font-bold uppercase tracking-[0.3em]">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>MP Creator Academy & Blueprint Store</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.05] sm:leading-[0.95] text-foreground">
                Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-rose-500 to-amber-500">Creator</span>
              </h1>

              <p className="text-lg sm:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                Whether you want to become a **YouTuber**, **Instagram Reeler**, **Full-Time Content Creator**, or **High-Paid Influencer** — access MP Production&apos;s battle-tested masterclasses, 4K setups, color grading, and 6-figure sponsorship playbooks.
              </p>

              {/* Stats Badge Bar */}
              <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                <div className="border border-border rounded-2xl p-4 bg-card/80 backdrop-blur-md shadow-md">
                  <p className="text-3xl font-serif font-bold text-amber-500 dark:text-amber-400">10,000+</p>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Creators Trained</p>
                </div>
                <div className="border border-border rounded-2xl p-4 bg-card/80 backdrop-blur-md shadow-md">
                  <p className="text-3xl font-serif font-bold text-emerald-500 dark:text-emerald-400">4.9 ★</p>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Average Rating</p>
                </div>
                <div className="border border-border rounded-2xl p-4 bg-card/80 backdrop-blur-md shadow-md">
                  <p className="text-3xl font-serif font-bold text-brand">150M+</p>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Views Generated</p>
                </div>
                <div className="border border-border rounded-2xl p-4 bg-card/80 backdrop-blur-md shadow-md">
                  <p className="text-3xl font-serif font-bold text-purple-500 dark:text-purple-400">8 Courses</p>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Full Blueprints</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Main Blueprints Directory */}
      <section className="py-12 sm:py-20 px-4 sm:px-10 mx-auto max-w-7xl space-y-8 sm:space-y-12">
        {/* Category Filters & Search */}
        <Reveal direction="up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {[
                { id: 'ALL', label: 'All Masterclasses' },
                { id: 'YOUTUBER', label: 'YouTube Creator' },
                { id: 'REELER', label: 'Instagram Reels & Shorts' },
                { id: 'CREATOR', label: 'Content Creator & Podcast' },
                { id: 'INFLUENCER', label: 'Influencer & Personal Brand' },
                { id: 'EDITING', label: 'DaVinci & VFX' },
                { id: 'MONETIZATION', label: 'Brand Deals & Revenue' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-brand text-white shadow-md'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search YouTuber, Reeler, Influencer..."
                className="pl-10 text-xs rounded-full bg-card border-border text-foreground"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Reveal>

        {/* Blueprint Cards Grid */}
        <Reveal direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coursesLoading && (
              <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
                Loading masterclasses…
              </div>
            )}
            {!coursesLoading && filteredPlaybooks.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-2">
                <p className="text-lg font-serif text-foreground">No masterclasses published yet</p>
                <p className="text-sm text-muted-foreground">
                  Courses added in Super Admin → CMS → Creator Courses will appear here when Published.
                </p>
              </div>
            )}
            {filteredPlaybooks.map(bp => (
              <div key={bp.id} className="group border border-border rounded-3xl overflow-hidden bg-card hover:border-brand/60 transition-[border-color,box-shadow,transform] duration-300 shadow-sm hover:shadow-xl flex flex-col h-full transform-gpu">
                {/* Card Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  <Image
                    src={bp.image}
                    alt={bp.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md ${bp.badgeColor}`}>
                      {bp.categoryLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white border border-white/20 shadow-md">
                      {bp.level}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-white text-[11px] sm:text-xs font-medium z-10">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-amber-400" /> {bp.lessonsCount} Modules</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Tv className="w-3.5 h-3.5 text-emerald-400" /> {bp.duration}</span>
                    </div>
                    <span className="text-amber-400 font-bold flex items-center gap-1 whitespace-nowrap">
                      ★ {bp.rating} ({bp.enrolledCount.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold font-serif text-foreground group-hover:text-brand transition-colors">
                        {bp.title}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {bp.description}
                    </p>

                    {/* Topics Checklist */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      {bp.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-foreground min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA Buttons */}
                  <div className="pt-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-serif text-brand">{bp.price}</span>
                        <span className="text-xs text-muted-foreground line-through">{bp.originalPrice}</span>
                      </div>
                      <p className="text-[10px] text-emerald-500 font-bold">Lifetime VIP Access</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => {
                          setPreviewBlueprint(bp);
                          setActivePreviewTab('overview');
                          setIsPlayingTrailer(false);
                        }}
                        variant="outline"
                        className="flex-1 sm:flex-none justify-center text-xs font-bold rounded-full px-4 py-2 flex items-center gap-1.5 border-border"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand" />
                        <span>Mini Preview</span>
                      </Button>

                      <Button
                        onClick={() => {
                          setPreviewBlueprint(bp);
                          setShowCheckoutModal(true);
                        }}
                        className="flex-1 sm:flex-none justify-center bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-full px-4 py-2 flex items-center gap-1.5 shadow-md"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         INTERACTIVE COURSE MINI PREVIEW LIGHTBOX MODAL (EXPANDED UI & TYPOGRAPHY)
         ═══════════════════════════════════════════════════════════ */}
      {previewBlueprint && !showCheckoutModal && (
        <div 
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewBlueprint(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
        >
          <div 
            data-lenis-prevent
            className="bg-card border border-border rounded-3xl max-w-4xl sm:max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-foreground relative"
          >
            
            {/* Floating Close Button */}
            <button
              onClick={() => setPreviewBlueprint(null)}
              className="absolute top-4 right-4 z-30 h-10 w-10 rounded-full bg-black/80 text-white hover:bg-brand flex items-center justify-center border border-white/20 transition-all shadow-xl cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content Container */}
            <div data-lenis-prevent className="overflow-y-auto flex-1 space-y-0 scrollbar-thin">
              
              {/* Video Trailer / Image Banner (Proportional 21/9 Aspect) */}
              <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full bg-black overflow-hidden shrink-0">
                {isPlayingTrailer ? (
                  <video
                    src={previewBlueprint.trailerVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Image
                      src={previewBlueprint.image}
                      alt={previewBlueprint.title}
                      fill
                      className="object-cover opacity-85"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3 z-10">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg ${previewBlueprint.badgeColor}`}>
                        {previewBlueprint.categoryLabel}
                      </span>
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-black/80 text-white border border-white/25 shadow-lg">
                        Level: {previewBlueprint.level}
                      </span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setIsPlayingTrailer(true)}
                        className="group h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-brand text-white flex items-center justify-center shadow-[0_0_50px_rgba(229,9,20,0.8)] hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white ml-1" />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-sm font-medium">
                      <span className="font-bold flex items-center gap-2 text-xs sm:text-sm">
                        <Play className="w-4 h-4 text-brand" /> Watch 2-Min Course Trailer Preview
                      </span>
                      <span className="text-amber-400 font-extrabold text-xs sm:text-sm">★ {previewBlueprint.rating} Rating</span>
                    </div>
                  </>
                )}
              </div>

              {/* Course Title & Meta */}
              <div className="p-6 sm:p-8 border-b border-border space-y-4 bg-card">
                <h2 className="text-2xl sm:text-4xl font-bold font-serif leading-tight text-foreground">
                  {previewBlueprint.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4.5 h-4.5 text-amber-500" /> {previewBlueprint.lessonsCount} Modules</span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4.5 h-4.5 text-emerald-500" /> {previewBlueprint.duration} Total</span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4.5 h-4.5 text-brand" /> {previewBlueprint.enrolledCount.toLocaleString()} Enrolled Creators</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-border bg-muted/30 px-6 sm:px-8 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'Course Overview' },
                  { id: 'syllabus', label: 'Full Syllabus' },
                  { id: 'resources', label: 'Included Toolkits & LUTs' },
                  { id: 'instructor', label: 'Instructor Bio' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id as any)}
                    className={`px-6 py-4 text-sm sm:text-base font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                      activePreviewTab === tab.id
                        ? 'border-brand text-brand'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Body Content */}
              <div className="p-6 sm:p-8 space-y-6 text-sm sm:text-base">
                {activePreviewTab === 'overview' && (
                  <div className="space-y-5">
                    <p className="text-base sm:text-lg text-foreground/90 font-normal leading-relaxed">
                      {previewBlueprint.description}
                    </p>
                    
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand pt-2">What You Will Learn:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {previewBlueprint.topics.map((topic, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm sm:text-base font-semibold text-foreground">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePreviewTab === 'syllabus' && (
                  <div className="space-y-4">
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand">Course Modules & Breakdown:</h4>
                    <div className="space-y-3">
                      {previewBlueprint.modules.map((mod, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-border bg-muted/30 flex items-center justify-between gap-4 text-sm sm:text-base">
                          <div className="flex items-center gap-3">
                            <span className="h-7 w-7 rounded-full bg-brand/15 text-brand font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              0{i + 1}
                            </span>
                            <span className="font-bold text-foreground">{mod.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground text-xs sm:text-sm font-medium shrink-0">
                            <span>{mod.lessonsCount} Lessons</span>
                            <span>·</span>
                            <span className="text-emerald-500 font-bold">{mod.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePreviewTab === 'resources' && (
                  <div className="space-y-4">
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand">Downloadable VIP Resources Included:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {previewBlueprint.resources.map((res, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-border bg-muted/30 flex items-center gap-3 text-sm sm:text-base font-bold">
                          <Download className="w-5 h-5 text-amber-500 shrink-0" />
                          <span>{res}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePreviewTab === 'instructor' && (
                  <div className="flex items-start gap-5 p-5 rounded-2xl border border-border bg-muted/30">
                    <img
                      src={previewBlueprint.instructor.avatar}
                      alt={previewBlueprint.instructor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-brand shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold font-serif">{previewBlueprint.instructor.name}</h4>
                      <p className="text-xs sm:text-sm font-bold text-brand">{previewBlueprint.instructor.role}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                        {previewBlueprint.instructor.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* STICKY BOTTOM FOOTER CTA BAR (ALWAYS VISIBLE) */}
            <div className="p-5 sm:p-6 border-t border-border bg-card shrink-0 flex items-center justify-between gap-6 shadow-xl">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold font-serif text-brand">{previewBlueprint.price}</span>
                  <span className="text-sm sm:text-base text-muted-foreground line-through">{previewBlueprint.originalPrice}</span>
                </div>
                <p className="text-xs text-emerald-500 font-bold">Lifetime VIP Access · 100% Satisfaction Guarantee</p>
              </div>

              <Button
                onClick={() => setShowCheckoutModal(true)}
                className="bg-brand hover:bg-brand/90 text-white font-bold rounded-full px-8 py-3.5 text-base sm:text-lg shadow-xl flex items-center gap-2 transform hover:scale-105 transition-all"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         SALES LEAD ENROLLMENT & CMS INQUIRY MODAL
         ═══════════════════════════════════════════════════════════ */}
      {showCheckoutModal && previewBlueprint && (
        <div 
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCheckoutModal(false);
              setLeadSuccessData(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div data-lenis-prevent className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-foreground relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">OFFICIAL CREATOR ACADEMY ENROLLMENT</span>
                <h3 className="text-lg font-bold font-serif text-foreground line-clamp-1">{previewBlueprint.title}</h3>
              </div>
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setLeadSuccessData(null);
                }}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {leadSuccessData ? (
              /* ── Clean Customer Confirmation Screen ── */
              <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Request Received Successfully</span>
                  </div>
                  <h4 className="text-2xl font-bold font-serif text-foreground">
                    Enrollment Request Submitted!
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground bg-muted/60 py-1.5 px-3 rounded-lg inline-block font-semibold">
                    Request Ref ID: <span className="text-brand font-bold">{leadSuccessData.leadId}</span>
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border text-xs sm:text-sm text-left space-y-3">
                  <p className="text-foreground leading-relaxed font-medium">
                    Thank you <strong className="text-brand font-bold">{leadSuccessData.name}</strong>! Your enrollment request for <strong className="text-foreground">{leadSuccessData.courseTitle}</strong> ({leadSuccessData.price}) has been received.
                  </p>
                  
                  <div className="pt-2.5 border-t border-border/60 space-y-2 text-muted-foreground">
                    <p className="flex items-center justify-between">
                      <span>WhatsApp Phone:</span>
                      <strong className="text-foreground font-semibold">{leadSuccessData.phone}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Email Address:</span>
                      <strong className="text-foreground font-semibold">{leadSuccessData.email}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Channel / Handle:</span>
                      <strong className="text-foreground font-semibold">{leadSuccessData.channelUrl}</strong>
                    </p>
                  </div>
                </div>

                {/* Clear 3-Step Course Delivery Process */}
                <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 text-xs sm:text-sm text-left space-y-2">
                  <h5 className="font-bold text-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider text-brand">
                    <Sparkles className="w-4 h-4" /> How You Will Receive Your Course & VIP Assets:
                  </h5>
                  <div className="space-y-2 text-muted-foreground text-xs font-medium pt-1">
                    <div className="flex items-start gap-2">
                      <span className="h-4 w-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span><strong>Instant Email & WhatsApp Notification:</strong> Confirmation email & SMS sent to <strong>{leadSuccessData.email}</strong> and <strong>{leadSuccessData.phone}</strong>.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="h-4 w-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span><strong>Invoice & Payment Link:</strong> Complete payment via UPI, GPay, PhonePe, or Card to unlock all 4K video modules.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="h-4 w-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span><strong>VIP Toolkits & Downloads:</strong> Sony/Canon LUTs, Presets & Notion templates delivered directly to your inbox & portal.</span>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Advisor Button */}
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi MP Production Team! I submitted an enrollment request for "${leadSuccessData.courseTitle}" (${leadSuccessData.price}).\nRequest ID: ${leadSuccessData.leadId}\nName: ${leadSuccessData.name}\nPhone: ${leadSuccessData.phone}\nEmail: ${leadSuccessData.email}\nChannel: ${leadSuccessData.channelUrl}\n\nPlease send my invoice and instant payment link.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg text-sm transition-all transform hover:scale-[1.02]"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Chat on WhatsApp for Instant Invoice & VIP Pass</span>
                </a>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setLeadSuccessData(null);
                    }}
                    className="flex-1 bg-card hover:bg-muted text-foreground border border-border font-bold rounded-2xl py-2.5 px-4 text-xs text-center transition-colors"
                  >
                    <span>Sign In to Student Portal →</span>
                  </Link>

                  <Button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setLeadSuccessData(null);
                    }}
                    variant="outline"
                    className="flex-1 rounded-2xl py-2.5 text-xs font-semibold border-border"
                  >
                    Close Window
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Form: Lead Data Input ── */
              <>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <p className="font-bold text-foreground">{previewBlueprint.categoryLabel}</p>
                    <p className="text-muted-foreground text-xs">Official Course Invoice & Lifetime VIP Access</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand font-serif">{previewBlueprint.price}</p>
                    <p className="text-xs text-muted-foreground line-through">{previewBlueprint.originalPrice}</p>
                  </div>
                </div>

                <form onSubmit={handleEnroll} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">Your Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={accessForm.name}
                      onChange={e => setAccessForm({ ...accessForm, name: e.target.value })}
                      className="rounded-xl border-border bg-card"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">Email Address (For Invoice & Course Access) *</label>
                    <Input
                      type="email"
                      required
                      placeholder="rahul@creator.com"
                      value={accessForm.email}
                      onChange={e => setAccessForm({ ...accessForm, email: e.target.value })}
                      className="rounded-xl border-border bg-card"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">WhatsApp Number (For Instant Payment Link) *</label>
                    <Input
                      required
                      placeholder="+91 98765 43210"
                      value={accessForm.phone}
                      onChange={e => setAccessForm({ ...accessForm, phone: e.target.value })}
                      className="rounded-xl border-border bg-card"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">YouTube Channel / IG Handle (Optional)</label>
                    <Input
                      placeholder="@yourchannel"
                      value={accessForm.channelUrl}
                      onChange={e => setAccessForm({ ...accessForm, channelUrl: e.target.value })}
                      className="rounded-xl border-border bg-card"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCheckoutModal(false)}
                      className="rounded-xl px-5"
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmittingLead}
                      className="bg-brand hover:bg-brand/90 text-white font-bold rounded-xl px-6 py-2.5 shadow-md flex items-center gap-2"
                    >
                      {isSubmittingLead ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Registering Lead...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enrollment Lead →</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
