'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/ui/Navbar';
import { SponsoredSidebarCard } from '@/components/ui/sponsored-sidebar-card';
import { CinematicViewerModal, ProjectSpec } from '@/components/ui/CinematicViewerModal';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  Play,
  ArrowUpRight,
  Camera,
  Film,
  Award,
  Calendar,
  Layers,
  LayoutGrid,
  Grid,
  Check,
  X,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAPI } from '@/lib/api-client';

export interface PortfolioProject extends ProjectSpec {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  client?: string;
  mediaUrl: string;
  description: string;
  aspectRatio?: 'tall' | 'wide' | 'square';
}

const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    slug: 'neon-city',
    title: 'Neon Silk · The Metamorphosis',
    category: 'Fashion Film',
    year: '2026',
    client: 'Vogue & Gucci Collective',
    mediaUrl: '/images/portfolio-hero.jpg',
    description: 'High-fashion cinematic editorial shot across cyberpunk neon alleyways in Mumbai and nocturnal studios in London.',
    camera: 'ARRI ALEXA 35',
    lenses: 'Cooke Anamorphic /i',
    colorGrade: 'Dolby Vision HDR',
    awards: ['Awwwards Winner', 'Vimeo Staff Pick'],
    aspectRatio: 'wide'
  },
  {
    id: 'proj-2',
    slug: 'midnight-run',
    title: 'Midnight Anthem · VOLT Music',
    category: 'Music Video',
    year: '2026',
    client: 'Universal Music Group',
    mediaUrl: '/images/about-bts.jpg',
    description: 'A surrealist exploration of haute couture against brutalist architecture. Shot entirely on 35mm film stock.',
    camera: 'ARRIFLEX 435',
    lenses: 'Kowa Anamorphic',
    colorGrade: 'Kodak 5219 Emulation',
    awards: ['Best Cinematography - Berlin Commercial'],
    aspectRatio: 'square'
  },
  {
    id: 'proj-3',
    slug: 'vantage-point',
    title: "Curinel's Reserve · Timeless Heritage",
    category: 'Commercial',
    year: '2025',
    client: 'The Macallan Distillers',
    mediaUrl: '/images/careers-meeting.jpg',
    description: 'An atmospheric brand commercial across secluded coastal cliffs in South Goa and heritage Scottish distilleries.',
    camera: 'RED V-Raptor 8K',
    lenses: 'Leica Summilux-C',
    colorGrade: 'ACEScc Master',
    awards: ['Cannes Corporate Silver'],
    aspectRatio: 'tall'
  },
  {
    id: 'proj-4',
    slug: 'heritage-foundation',
    title: 'Skyline Suits · Executive Mastery',
    category: 'Brand Campaign',
    year: '2025',
    client: 'Raymond Tailored',
    mediaUrl: '/images/services-lighting.jpg',
    description: 'Dynamic editorial campaign blending 16mm film grit with hyper-polished digital intermediate finishing.',
    camera: 'ARRI ALEXA Mini LF',
    lenses: 'Zeiss Master Primes',
    colorGrade: 'Technicolor Master',
    awards: ['Clio Bronze'],
    aspectRatio: 'square'
  },
  {
    id: 'proj-5',
    slug: 'echoes-of-silence',
    title: 'Echoes of Silence · Contemporary Ballet',
    category: 'Art & Theatre',
    year: '2026',
    client: 'Royal Opera House',
    mediaUrl: '/images/bg-abstract.jpg',
    description: 'An immersive 360-degree sensory exploration of human movement and architectural acoustic spaces.',
    camera: 'Sony Venice 2',
    lenses: 'Angenieux Optimo',
    colorGrade: 'Custom Film Print LUT',
    awards: ['TIFF Official Selection'],
    aspectRatio: 'tall'
  },
  {
    id: 'proj-6',
    slug: 'solstice-chronicles',
    title: 'Solstice · The Electric Odyssey',
    category: 'Commercial',
    year: '2025',
    client: 'Porsche Motorsport',
    mediaUrl: '/images/bg-luxury.jpg',
    description: 'High-speed precision tracking shots across salt flats at dawn with custom FPV cinema drone cinematography.',
    camera: 'RED Komodo 6K',
    lenses: 'Atlas Orion Anamorphic',
    colorGrade: 'Dolby Vision HDR',
    awards: ['New York Festivals Gold'],
    aspectRatio: 'wide'
  }
];

export default function ProjectsPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProject[]>(DEFAULT_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSort, setSelectedSort] = useState<'featured' | 'newest' | 'az'>('featured');
  const [viewLayout, setViewLayout] = useState<'grid' | 'single'>('grid');

  // Cinematic Viewer State
  const [selectedProject, setSelectedProject] = useState<ProjectSpec | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    fetchAPI('/cms/portfolio', { cache: 'no-store' })
      .then((json) => {
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          const mapped = json.data.map((item: any, i: number) => ({
            ...item,
            id: item.id || `proj-${i}`,
            title: item.title || item.name || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].title,
            category: item.category || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].category,
            year: item.year || '2026',
            client: item.client || item.brand || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].client,
            coverImage: item.coverImage || item.mediaUrl || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].mediaUrl,
            mediaUrl: item.mediaUrl || item.coverImage || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].mediaUrl,
            description: item.description || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].description,
            aspectRatio: i % 3 === 0 ? 'tall' : i % 3 === 1 ? 'wide' : 'square',
            camera: item.camera || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].camera,
            lenses: item.lenses || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].lenses,
            colorGrade: item.colorGrade || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].colorGrade,
            awards: item.awards || DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].awards,
          }));
          setPortfolioItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Compute available categories with count
  const categoriesWithCount = useMemo(() => {
    const map: Record<string, number> = { All: portfolioItems.length };
    portfolioItems.forEach((p) => {
      const cat = p.category || 'Commercial';
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [portfolioItems]);

  const categoryList = useMemo(() => Object.keys(categoriesWithCount), [categoriesWithCount]);

  // Compute available years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    portfolioItems.forEach((p) => {
      if (p.year) set.add(p.year);
    });
    return ['All', ...Array.from(set).sort().reverse()];
  }, [portfolioItems]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return portfolioItems
      .filter((p) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchClient = p.client?.toLowerCase().includes(q);
          const matchCamera = p.camera?.toLowerCase().includes(q);
          const matchLenses = p.lenses?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchClient && !matchCamera && !matchLenses) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Year Filter
        if (selectedYear !== 'All' && p.year !== selectedYear) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'newest') return Number(b.year) - Number(a.year);
        if (selectedSort === 'az') return a.title.localeCompare(b.title);
        return 0; // featured (default order)
      });
  }, [portfolioItems, searchQuery, selectedCategory, selectedYear, selectedSort]);

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'All' || selectedYear !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedYear('All');
    setSelectedSort('featured');
  };

  const handleOpenViewer = (project: PortfolioProject) => {
    setSelectedProject({
      title: project.title,
      category: project.category,
      client: project.client,
      year: project.year,
      description: project.description,
      videoUrl: project.videoUrl || 'https://zmpeiobdilrgtuzggzuj.supabase.co/storage/v1/object/public/mdms/videos/reel_1.mp4',
      coverImage: project.mediaUrl,
      director: project.director || 'Kabir Nair',
      dop: project.dop || 'Aarav Mehta',
      camera: project.camera || 'ARRI ALEXA 35',
      lenses: project.lenses || 'Cooke Anamorphic /i',
      colorGrade: project.colorGrade || 'Dolby Vision HDR Grade',
      awards: project.awards || ['Awwwards Nominee', 'Staff Pick'],
    });
    setIsViewerOpen(true);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground pt-24 sm:pt-28 pb-20 relative">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-80 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ═══════════════════════════════════════════════════════════
              3-COLUMN PANEL GRID (Left: Filter | Center: Projects | Right: Sponsored)
              ═══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ─────────────────────────────────────────────────────────
                LEFT PANEL: Filters & Search (3 Columns)
                ───────────────────────────────────────────────────────── */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-24">
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs backdrop-blur-sm space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-brand" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Filter Projects
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand/10 border border-brand/20 text-brand">
                    {filteredProjects.length} Works
                  </span>
                </div>

                {/* Search Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Search Archive
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Title, client, camera..."
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
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Category
                  </label>
                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                    {categoryList.map((cat) => {
                      const isActive = selectedCategory === cat;
                      const count = categoriesWithCount[cat] || 0;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                            isActive
                              ? "bg-brand text-white font-bold shadow-xs"
                              : "bg-surface/50 hover:bg-surface text-foreground/80 hover:text-foreground border border-border/60"
                          )}
                        >
                          <span className="truncate">{cat}</span>
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Year Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Production Year
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableYears.map((year) => {
                      const isActive = selectedYear === year;
                      return (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer",
                            isActive
                              ? "bg-brand text-white shadow-xs font-bold"
                              : "bg-surface hover:bg-surface/80 text-muted-foreground hover:text-foreground border border-border"
                          )}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Sort By
                  </label>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="newest">Newest Year First</option>
                    <option value="az">Title (A-Z)</option>
                  </select>
                </div>

                {/* Reset Filters Button */}
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-border bg-surface/50 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}

              </div>
            </aside>

            {/* ─────────────────────────────────────────────────────────
                CENTER PANEL: Projects Grid & Showcase (6 Columns)
                ───────────────────────────────────────────────────────── */}
            <div className="lg:col-span-8 xl:col-span-6 space-y-4">
              
              {/* Center Controls Bar */}
              <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Showing</span>
                  <span className="font-bold text-foreground">{filteredProjects.length}</span>
                  <span>of {portfolioItems.length} projects</span>
                  {selectedCategory !== 'All' && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono bg-brand/10 text-brand font-bold border border-brand/20">
                      {selectedCategory}
                    </span>
                  )}
                </div>

                {/* Layout Mode Toggle */}
                <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg">
                  <button
                    onClick={() => setViewLayout('grid')}
                    className={cn(
                      "p-1.5 rounded-md transition-all cursor-pointer",
                      viewLayout === 'grid'
                        ? "bg-brand text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="2-Column Grid Layout"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={() => setViewLayout('single')}
                    className={cn(
                      "p-1.5 rounded-md transition-all cursor-pointer",
                      viewLayout === 'single'
                        ? "bg-brand text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Single Column Detailed Layout"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>

              {/* Projects Grid Container */}
              {filteredProjects.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground">
                    <Film className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">No Projects Found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    No cinematic works match your current search query or filter selection. Try adjusting or clearing your filters.
                  </p>
                  <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-2">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "grid gap-5",
                    viewLayout === 'grid'
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1"
                  )}
                >
                  {filteredProjects.map((project) => (
                    <article
                      key={project.id}
                      className="group bg-card border border-border hover:border-brand/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Media Image / Aspect Ratio */}
                      <div className="relative aspect-[16/10] w-full bg-neutral-950 overflow-hidden shrink-0">
                        <Image
                          src={project.mediaUrl || '/images/portfolio-hero.jpg'}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.9] group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-brand text-white shadow-md">
                            {project.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md border border-white/10">
                            {project.year}
                          </span>
                        </div>

                        {/* Center Hover Action */}
                        <div
                          onClick={() => handleOpenViewer(project)}
                          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px] cursor-pointer"
                        >
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-bold shadow-2xl hover:scale-105 transition-transform">
                            <Play size={13} className="fill-black" />
                            <span>Watch Project</span>
                          </div>
                        </div>

                        {/* Awards Badge (If present) */}
                        {project.awards && project.awards.length > 0 && (
                          <div className="absolute bottom-3 left-3 right-3 z-10">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-500/90 text-black shadow-xs">
                              <Award size={10} />
                              <span className="truncate">{project.awards[0]}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Content Details */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          {project.client && (
                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold truncate">
                              Client: {project.client}
                            </div>
                          )}

                          <h3
                            onClick={() => handleOpenViewer(project)}
                            className="text-base sm:text-lg font-bold font-serif text-foreground group-hover:text-brand transition-colors line-clamp-1 cursor-pointer"
                          >
                            {project.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-light">
                            {project.description}
                          </p>
                        </div>

                        {/* Tech Specs Strip */}
                        <div className="pt-2 border-t border-border/70 flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
                          {project.camera && (
                            <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-border truncate">
                              <Camera size={11} className="text-brand shrink-0" />
                              <span className="truncate">{project.camera}</span>
                            </span>
                          )}
                          {project.lenses && (
                            <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-border truncate">
                              <Film size={11} className="text-amber-500 shrink-0" />
                              <span className="truncate">{project.lenses}</span>
                            </span>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleOpenViewer(project)}
                            className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Full Specs</span>
                            <ArrowUpRight size={13} />
                          </button>

                          <Link
                            href={`/projects/${project.slug}`}
                            className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Project Page →
                          </Link>
                        </div>

                      </div>
                    </article>
                  ))}
                </div>
              )}

            </div>

            {/* ─────────────────────────────────────────────────────────
                RIGHT PANEL: Admin-Configured Sponsored Sidebar (3 Columns)
                ───────────────────────────────────────────────────────── */}
            <aside className="hidden xl:block xl:col-span-3 space-y-5 sticky top-24">
              <SponsoredSidebarCard context="projects" showAdvertiseLink={false} />
            </aside>

          </div>

        </div>
      </main>

      {/* Cinematic Modal Viewer */}
      <CinematicViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        project={selectedProject}
      />
    </>
  );
}
