"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Button } from '@/components/ui/Button';
import { SponsoredSidebarCard } from '@/components/ui/sponsored-sidebar-card';
import Link from 'next/link';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import { SocialShareModal } from '@/components/ui/SocialShareModal';
import Image from 'next/image';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Share2,
  Calendar,
  User,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  X,
  BookOpen,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverImageUrl: string;
  excerpt: string;
  content: string;
  author?: string;
  createdAt: string;
  publishedAt?: string;
  readTime?: string;
  tags?: string[];
}

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'evolution-of-virtual-production',
    title: 'The Evolution of Virtual Production in 2026',
    category: 'Technology',
    coverImageUrl: '/images/blog/blog_ai_filmmaking.webp',
    excerpt: 'How real-time LED volumes, neural rendering, and in-camera visual effects have permanently elevated modern cinematic sets.',
    author: 'Super Admin',
    createdAt: '2026-10-09T00:00:00.000Z',
    readTime: '3 min read',
    tags: ['Virtual Production', 'LED Volume', 'Neural Render', 'Cinema Tech'],
    content: `
      <p class="text-base sm:text-lg leading-relaxed text-foreground font-light mb-6">Virtual production has evolved from a pandemic novelty into the absolute backbone of modern brand cinema. In 2026, the integration of ultra-high-pitch LED volumes with real-time neural render engines allows us to light, shoot, and finalize complex environments directly in-camera.</p>
      
      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">In-Camera Visual Effects & Real-Time Parallax</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">The fundamental shift lies in perspective tracking. As our cinema camera moves on a 15-foot jib, the digital background on the LED wall responds in real-time with flawless spatial parallax. Actors interact naturally with real physical light bouncing off 360-degree LED panels rather than standing in an artificial green screen glow.</p>
      
      <blockquote class="border-l-2 border-brand pl-5 py-3 my-6 italic text-sm sm:text-base text-foreground bg-brand/5 dark:bg-brand/10 rounded-r-xl">
        "Virtual production is no longer just a workaround for location travel — it is a creative superpower that gives directors total control over light, weather, and time of day."
      </blockquote>

      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">Sustainability & Hyper-Efficiency</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">Beyond visual elegance, virtual production drastically reduces corporate carbon footprints. Shooting a dusk scene in a Scottish highland cottage and a sunrise in a Tokyo neon skyscraper on the exact same afternoon eliminates massive crew transport logistics while giving clients guaranteed perfection in every frame.</p>
    `
  },
  {
    id: 'post-2',
    slug: 'anamorphic-glass-and-luxury-commercials',
    title: 'Anamorphic Glass & The Aesthetic of Modern Luxury Commercials',
    category: 'Cinematography',
    coverImageUrl: '/images/blog/blog_cinematic_lighting.webp',
    excerpt: 'Exploring why vintage anamorphic prime lenses and wide aspect ratios remain the ultimate visual signature for luxury ateliers.',
    author: 'Chief Cinematographer',
    createdAt: '2026-09-28T00:00:00.000Z',
    readTime: '4 min read',
    tags: ['Anamorphic', 'Lenses', 'Luxury Cinema', 'Commercials'],
    content: `
      <p class="text-base sm:text-lg leading-relaxed text-foreground font-light mb-6">In an era saturated with ultra-clean digital sharpness, luxury ateliers consistently demand the organic imperfection of anamorphic glass. Vintage cylindrical elements stretch the bokeh into oval orbs, render gentle horizontal streaks, and compress depth of field with incomparable character.</p>
      
      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">The 2.39:1 Cinema Canvas</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">Standard 16:9 aspect ratios often feel like television or social feeds. Framing a luxury automobile, a diamond timepiece, or an haute couture gown at 2.39:1 instantly cues theatrical heritage in the audience's mind. The wide horizon mimics human binocular vision, pulling the eye into negative space.</p>
      
      <blockquote class="border-l-2 border-brand pl-5 py-3 my-6 italic text-sm sm:text-base text-foreground bg-brand/5 dark:bg-brand/10 rounded-r-xl">
        "Sharpness is a technical metric; distortion, falloff, and flare are emotional signatures that make commercial films unforgettable."
      </blockquote>

      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">Pairing Vintage Optics with 8K Sensors</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">The magic sweet spot in modern commercial filmmaking is pairing vintage anamorphic primes with cutting-edge 8K sensors. You capture the resolution and dynamic range required for post-production while retaining the creamy falloff and romantic flare characteristics of traditional cinema glass.</p>
    `
  },
  {
    id: 'post-3',
    slug: 'mastering-high-fashion-editorial-lighting',
    title: 'Mastering High-Fashion Editorial Lighting: Shadows, Contrast & Mood',
    category: 'Fashion',
    coverImageUrl: '/images/blog/blog_fashion_editorial.webp',
    excerpt: 'Step inside the lighting design for high-fashion campaigns: controlling spill, shaping key light, and balancing negative fill.',
    author: 'Creative Director',
    createdAt: '2026-09-15T00:00:00.000Z',
    readTime: '5 min read',
    tags: ['Fashion Lighting', 'Grip & Electric', 'Editorial', 'Studio Shoots'],
    content: `
      <p class="text-base sm:text-lg leading-relaxed text-foreground font-light mb-6">Lighting fashion is never about illuminating a subject; it is about deciding exactly where the shadow falls. High-fashion cinema relies on deliberate contrast ratios, sculpting cheekbones and fabric textures while preserving deep velvety blacks in the wardrobe.</p>
      
      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">Negative Fill: The Secret to High Contrast</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">Most amateur sets suffer from too much ambient light bouncing off walls. By surrounding our set with 12x12 solid black duvetyne floppy flags, we strip away all unmotivated bounce light. This produces dramatic edge roll-off that makes garments pop against minimalist backgrounds.</p>

      <blockquote class="border-l-2 border-brand pl-5 py-3 my-6 italic text-sm sm:text-base text-foreground bg-brand/5 dark:bg-brand/10 rounded-r-xl">
        "Light reveals form, but shadow creates allure. In fashion, allure is the currency of desire."
      </blockquote>

      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">Fresnels vs Softboxes for Texture</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">Silk fabrics, sequins, and jewelry require hard, collimated light from traditional ARRI tungsten Fresnels to create specular highlights, while model skin benefits from double-diffused octabanks. Mastering the hybrid combination is what separates standard commercial shoots from magazine covers.</p>
    `
  },
  {
    id: 'post-4',
    slug: 'mastering-spatial-audio-and-sound-design',
    title: 'Sound Design & Spatial Acoustics: The Invisible 50% of Cinema',
    category: 'Sound Design',
    coverImageUrl: '/images/blog/blog_sound_design.webp',
    excerpt: 'Why audio design drives subconscious audience immersion in commercial campaigns and how Dolby Atmos mixes elevate screen presence.',
    author: 'Lead Sound Engineer',
    createdAt: '2026-08-30T00:00:00.000Z',
    readTime: '4 min read',
    tags: ['Sound Design', 'Dolby Atmos', 'Spatial Audio', 'Foley'],
    content: `
      <p class="text-base sm:text-lg leading-relaxed text-foreground font-light mb-6">George Lucas famously noted that sound is 50% of the movie-going experience. In luxury commercial filmmaking, sound design often carries 70% of the subconscious emotional weight. From the visceral tactile click of an exotic car door to the delicate pour of champagne, spatial audio roots the audience in physical reality.</p>
      
      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">Sub-Bass & Spatial Psychoacoustics</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">Our sound suites craft binaural soundscapes where micro-textures are placed with surgical 3D precision around the listener's head. By balancing sub-bass frequencies below 40Hz with crisp high-end transients, brand commercials evoke physical adrenaline that visuals alone cannot trigger.</p>

      <blockquote class="border-l-2 border-brand pl-5 py-3 my-6 italic text-sm sm:text-base text-foreground bg-brand/5 dark:bg-brand/10 rounded-r-xl">
        "A viewer can look away from a screen, but they cannot close their ears. Master audio captivates without permission."
      </blockquote>

      <h2 class="text-xl sm:text-2xl font-serif text-foreground font-medium mt-8 mb-4">Foley Artistry vs Digital Stock</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">We never rely on generic stock sound libraries. Every garment rustle, leather creak, and footsteps track is physically performed on dedicated foley pits in our Mumbai audio soundstage, capturing organic character that syncs flawlessly with 8K visuals.</p>
    `
  }
];



function formatDate(dateStr?: string) {
  if (!dateStr) return '9 Oct 2026';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '9 Oct 2026';
  }
}

function BlogContent() {
  const searchParams = useSearchParams();
  const querySlug = searchParams?.get('article');

  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_POSTS);
  const [selectedSlug, setSelectedSlug] = useState<string>(DEFAULT_POSTS[0].slug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [fullWindow, setFullWindow] = useState(false);
  const [mobileTab, setMobileTab] = useState<'reader' | 'list'>('reader');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Load from API if available
  useEffect(() => {
    fetchAPI('/cms/blog', { cache: 'no-store' })
      .then((res) => {
        if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
          const apiPosts: BlogPost[] = res.data.map((p: any, idx: number) => ({
            id: p.id || `api-${idx}`,
            slug: p.slug,
            title: p.title,
            category: p.category || 'Production',
            coverImageUrl: p.coverImageUrl || DEFAULT_POSTS[idx % DEFAULT_POSTS.length].coverImageUrl,
            excerpt: p.excerpt || '',
            content: p.content || DEFAULT_POSTS[idx % DEFAULT_POSTS.length].content,
            author: p.author || 'Super Admin',
            createdAt: p.createdAt || new Date().toISOString(),
            publishedAt: p.publishedAt,
            readTime: p.readTime || `${Math.max(2, Math.ceil((p.content?.length || 500) / 450))} min read`,
            tags: Array.isArray(p.tags) ? p.tags : ['Cinema', 'Production']
          }));
          setPosts(apiPosts);
        }
      })
      .catch(() => {});
  }, []);

  // Update selected slug if query param matches
  useEffect(() => {
    if (querySlug && posts.some((p) => p.slug === querySlug)) {
      setSelectedSlug(querySlug);
    }
  }, [querySlug, posts]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  // Filtered posts for left panel
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === 'All' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [posts, searchQuery, selectedCategory]);

  // Current active post
  const activeIndex = useMemo(() => {
    const idx = posts.findIndex((p) => p.slug === selectedSlug);
    return idx >= 0 ? idx : 0;
  }, [posts, selectedSlug]);

  const activePost = posts[activeIndex] || DEFAULT_POSTS[0];

  const handleSelectPost = (slug: string) => {
    setSelectedSlug(slug);
    setMobileTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      handleSelectPost(posts[activeIndex - 1].slug);
    }
  };

  const handleNext = () => {
    if (activeIndex < posts.length - 1) {
      handleSelectPost(posts[activeIndex + 1].slug);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };


  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground pt-24 sm:pt-28 pb-20 relative">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile View Tab Switcher */}
          <div className="lg:hidden flex items-center gap-2 p-1 bg-surface border border-border rounded-xl mb-6">
            <button
              onClick={() => setMobileTab('reader')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mobileTab === 'reader'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen size={14} />
              <span>Article Reader</span>
            </button>
            <button
              onClick={() => setMobileTab('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mobileTab === 'list'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers size={14} />
              <span>All Articles ({posts.length})</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              3-COLUMN PANEL GRID (Left, Center, Right)
              ═══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ─────────────────────────────────────────────────────────
                LEFT PANEL: Article Directory & Search (3 Columns)
                ───────────────────────────────────────────────────────── */}
            <aside
              className={`${
                fullWindow ? 'hidden' : 'block'
              } ${
                mobileTab === 'reader' ? 'hidden lg:block' : 'block'
              } lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-24`}
            >
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs backdrop-blur-sm">
                
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-brand">
                      <Sparkles size={11} className="text-brand" />
                      Wellness & Studio Journal
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-light text-foreground">
                      Blogs
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-brand/10 border border-brand/20 text-brand">
                    {filteredPosts.length}
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search article titles..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Categories Horizontal Pills */}
                {categories.length > 2 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none text-[11px]">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-brand text-white font-semibold shadow-xs'
                            : 'bg-surface hover:bg-surface/80 text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Scrollable Article Cards List */}
                <div className="space-y-2 max-h-[calc(100vh-290px)] overflow-y-auto pr-1">
                  {filteredPosts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No articles match your search.
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const isActive = post.slug === activePost.slug;
                      return (
                        <div
                          key={post.id}
                          onClick={() => handleSelectPost(post.slug)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all relative group ${
                            isActive
                              ? 'bg-brand/10 border-brand/40 shadow-xs ring-1 ring-brand/30'
                              : 'bg-surface/60 hover:bg-surface border-border hover:border-brand/30'
                          }`}
                        >
                          {/* Active Dot Indicator */}
                          {isActive && (
                            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand animate-pulse" />
                          )}

                          <div className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
                            {post.category}
                          </div>

                          <h3
                            className={`text-xs sm:text-sm font-semibold line-clamp-2 leading-snug mb-1.5 transition-colors ${
                              isActive
                                ? 'text-brand'
                                : 'text-foreground group-hover:text-brand'
                            }`}
                          >
                            {post.title}
                          </h3>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                            {post.readTime && <span>{post.readTime}</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </aside>

            {/* ─────────────────────────────────────────────────────────
                CENTER PANEL: Active Article Reader & Header (6 Columns)
                ───────────────────────────────────────────────────────── */}
            <article
              className={`${
                mobileTab === 'list' ? 'hidden lg:block' : 'block'
              } ${
                fullWindow
                  ? 'lg:col-span-12'
                  : 'lg:col-span-8 xl:col-span-6'
              } space-y-5`}
            >
              {/* Top Navigation & Action Controls Bar (Sticky flush below navbar with solid top mask) */}
              <div className="sticky top-[56px] sm:top-[62px] md:top-[66px] z-30 -mt-2 pt-2 pb-2 bg-background/95 backdrop-blur-md before:content-[''] before:absolute before:-top-12 before:inset-x-0 before:h-12 before:bg-background">
                <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
                  {/* Left: Prev / Next / Full Window */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:border-brand/40 disabled:opacity-40 disabled:pointer-events-none transition-all"
                    >
                      <ChevronLeft size={14} />
                      <span>Prev</span>
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={activeIndex === posts.length - 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:border-brand/40 disabled:opacity-40 disabled:pointer-events-none transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => setFullWindow(!fullWindow)}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:border-brand/40 transition-all"
                      title={fullWindow ? "Restore sidebar panels" : "Expand reader full window"}
                    >
                      {fullWindow ? (
                        <>
                          <Minimize2 size={13} />
                          <span>Exit Full Window</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 size={13} />
                          <span>Full Window</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Share Button */}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:text-brand hover:border-brand/40 transition-all"
                  >
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Breadcrumbs Row */}
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-1">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <span>›</span>
                <span className="hover:text-foreground cursor-pointer" onClick={() => setSelectedCategory('All')}>
                  Blogs
                </span>
                <span>›</span>
                <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-md">
                  {activePost.category}
                </span>
              </div>

              {/* Featured Article Header Card */}
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-7 shadow-xs">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  
                  {/* Left: Featured Cover Image */}
                  <div className="relative w-full md:w-56 lg:w-64 aspect-[16/11] md:aspect-[4/3] rounded-xl overflow-hidden border border-border bg-neutral-950 shrink-0 shadow-sm group">
                    <Image
                      src={activePost.coverImageUrl || '/images/blog/blog_ai_filmmaking.webp'}
                      alt={activePost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 300px"
                      priority
                    />
                  </div>

                  {/* Right: Meta & Title Details */}
                  <div className="flex-1 space-y-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-brand/10 border border-brand/20 text-brand">
                      {activePost.category}
                    </span>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-foreground leading-tight tracking-tight">
                      {activePost.title}
                    </h1>

                    <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
                      {activePost.excerpt}
                    </p>

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-2 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-brand" />
                        <span>{formatDate(activePost.publishedAt || activePost.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-brand" />
                        <span>By {activePost.author || 'Super Admin'}</span>
                      </div>
                      {activePost.readTime && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-brand" />
                          <span>{activePost.readTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Article Content Body Card */}
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs">
                
                {/* Rich text / HTML body */}
                <div
                  className="prose dark:prose-invert max-w-none text-foreground/90 font-light leading-relaxed text-sm sm:text-base prose-headings:font-display prose-headings:font-normal prose-h2:text-2xl prose-h2:text-foreground prose-h2:mt-8 prose-h2:mb-4 prose-p:mb-5 prose-blockquote:border-brand prose-a:text-brand prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: activePost.content }}
                />

                {/* Tags Footer */}
                {activePost.tags && activePost.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-8 mt-8 border-t border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mr-1">
                      <Tag size={13} /> Tags:
                    </span>
                    {activePost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-muted-foreground font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Article Footer Navigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 mt-8 border-t border-border">
                  {activeIndex > 0 ? (
                    <div
                      onClick={handlePrev}
                      className="p-4 rounded-xl border border-border bg-surface hover:border-brand/40 cursor-pointer transition-all space-y-1"
                    >
                      <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                        <ChevronLeft size={12} /> Previous Article
                      </div>
                      <div className="text-xs font-semibold text-foreground line-clamp-1">
                        {posts[activeIndex - 1].title}
                      </div>
                    </div>
                  ) : <div />}

                  {activeIndex < posts.length - 1 ? (
                    <div
                      onClick={handleNext}
                      className="p-4 rounded-xl border border-border bg-surface hover:border-brand/40 cursor-pointer transition-all space-y-1 text-right sm:text-right"
                    >
                      <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center justify-end gap-1">
                        Next Article <ChevronRight size={12} />
                      </div>
                      <div className="text-xs font-semibold text-foreground line-clamp-1">
                        {posts[activeIndex + 1].title}
                      </div>
                    </div>
                  ) : <div />}
                </div>

              </div>

            </article>

            {/* ─────────────────────────────────────────────────────────
                RIGHT PANEL: Admin Configured Sponsored Partners & Ads
                ───────────────────────────────────────────────────────── */}
            <aside
              className={`${
                fullWindow ? 'hidden' : 'hidden xl:block'
              } xl:col-span-3 space-y-5 sticky top-24`}
            >
              <SponsoredSidebarCard context="blog" />
            </aside>

          </div>

        </div>
      </main>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={activePost?.title || 'MP Production Journal'}
        description={activePost?.excerpt || 'Read this article on MP Production'}
        url={typeof window !== 'undefined' ? `${window.location.origin}/blog?article=${activePost?.slug}` : undefined}
        image={activePost?.coverImageUrl}
        category={activePost?.category}
      />
    </>
  );
}

export default function Blog() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-mono text-sm">
          Loading Journal & Articles...
        </div>
      }
    >
      <BlogContent />
    </Suspense>
  );
}
