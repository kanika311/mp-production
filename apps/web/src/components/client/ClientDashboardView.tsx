'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Film, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal, 
  ExternalLink, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  MessageSquare, 
  FileText, 
  Download, 
  PlayCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { SponsoredSidebarCard } from '@/components/ui/sponsored-sidebar-card';

const STATUS_STAGES = [
  'BOOKED',
  'PRE_PRODUCTION',
  'SHOOT',
  'EDITING',
  'REVIEW',
  'REVISION',
  'DELIVERED',
  'COMPLETED'
];

interface ClientDashboardViewProps {
  projects: any[];
  user: any;
}

export function ClientDashboardView({ projects = [], user }: ClientDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'castings' | 'deliverables' | 'settings'>('projects');

  const clientName = user?.name || 'Production Partner';
  const clientEmail = user?.email || 'client@mpproductions.com';
  const activeProjectsCount = projects.filter((p) => p.status !== 'COMPLETED').length || projects.length;
  const reviewProjectsCount = projects.filter((p) => p.status === 'REVIEW').length;

  return (
    <div className="w-full min-h-screen bg-background text-foreground pt-20 pb-16">
      {/* ── Sub-header / Breadcrumb Bar (Full Width, No Empty Margins) ── */}
      <div className="border-b border-border/80 bg-surface/50 backdrop-blur-md sticky top-[60px] z-30 shadow-xs">
        <div className="w-full px-3 md:px-5 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Client Command Center
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Client Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/client-portal/casting/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-xs font-bold transition-all text-foreground"
            >
              <Film className="w-3.5 h-3.5 text-brand" />
              <span>Post Casting Call</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand text-white hover:bg-brand/90 text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project Inquiry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main 3-Column Layout: Full Window Width & Sticky Sidebars ── */}
      <div className="w-full px-2 sm:px-3 lg:px-4 mt-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start">

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 1 (LEFT SIDEBAR): Sticky Fixed, Scrollable Profile & Tabs
              ══════════════════════════════════════════════════════════════════ */}
          <aside 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="lg:col-span-3 lg:sticky lg:top-[115px] lg:h-[calc(100vh-130px)] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto overscroll-contain touch-pan-y pr-1 pb-16 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Client Identity Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-brand/20 via-primary/15 to-amber-500/10 pointer-events-none" />

              <div className="relative flex flex-col items-center text-center pt-4">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand/40 bg-gradient-to-br from-brand/80 to-brand-glow text-white shadow-md flex items-center justify-center font-serif text-2xl font-bold">
                    {clientName.charAt(0)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border border-border shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-foreground tracking-tight">{clientName}</h3>
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground mt-0.5 truncate max-w-[200px]">
                  {clientEmail}
                </span>

                {/* Status Badges */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Client
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border text-muted-foreground">
                    Production Partner
                  </span>
                </div>

                {/* Quick Info List */}
                <div className="w-full mt-4 pt-4 border-t border-border/70 space-y-2 text-xs text-left">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" /> Active Projects</span>
                    <span className="font-semibold text-foreground">{activeProjectsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5 text-brand-gold" /> Pending Review</span>
                    <span className="font-semibold text-foreground">{reviewProjectsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-primary" /> Dedicated Producer</span>
                    <span className="font-semibold text-foreground">Assigned</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="w-full mt-4 flex gap-2">
                  <Link
                    href="/contact"
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-brand text-white hover:bg-brand/90 transition-all shadow-xs"
                  >
                    + New Project
                  </Link>
                  <Link
                    href="/client-portal/settings"
                    className="py-2 px-3 rounded-xl text-center text-xs font-bold border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center"
                    title="Client Settings"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation Panel */}
            <div className="rounded-2xl border border-border bg-card p-3 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Client Workspace
              </div>

              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Production Tracker</span>
                </div>
                {projects.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'projects' ? 'bg-white text-brand' : 'bg-muted text-muted-foreground'
                  }`}>
                    {projects.length}
                  </span>
                )}
              </button>

              <Link
                href="/client-portal/casting"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4" />
                  <span>Casting Calls & Auditions</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <button
                onClick={() => setActiveTab('deliverables')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'deliverables'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PlayCircle className="w-4 h-4" />
                  <span>Deliverables Review Room</span>
                </div>
                {reviewProjectsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {reviewProjectsCount}
                  </span>
                )}
              </button>

              <Link
                href="/talent"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span>Browse Talent Directory</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <Link
                href="/client-portal/settings"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Billing & Settings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>
          </aside>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 2 (CENTER): Main Content, Kanban Tracker & Projects
              ══════════════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-6 space-y-6">
            {/* Quick Action Broadcast Box */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                  {clientName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">Production Operations Hub</p>
                  <p className="text-sm font-bold text-foreground">Welcome back, {clientName}. What are we producing next?</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                <Link
                  href="/client-portal/casting/new"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface hover:bg-muted text-xs font-bold text-foreground transition-all border border-border/70 text-center"
                >
                  <Film className="w-3.5 h-3.5 text-primary" />
                  <span>Post Casting</span>
                </Link>
                <Link
                  href="/talent"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface hover:bg-muted text-xs font-bold text-foreground transition-all border border-border/70 text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Hire Talent</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand text-white hover:bg-brand/90 text-xs font-bold transition-all shadow-xs text-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Shoot</span>
                </Link>
              </div>
            </div>

            {/* Performance Metric Counters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Active Shoots
                </span>
                <span className="font-serif font-bold text-lg sm:text-xl text-foreground">{activeProjectsCount}</span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  In Review
                </span>
                <span className={`font-serif font-bold text-lg sm:text-xl ${reviewProjectsCount > 0 ? 'text-amber-500' : 'text-foreground'}`}>
                  {reviewProjectsCount}
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Total Managed
                </span>
                <span className="font-serif font-bold text-lg sm:text-xl text-foreground">{projects.length || 0}</span>
              </div>
            </div>

            {/* Main Interactive Project Tracker */}
            {activeTab === 'projects' && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">Production Pipeline & Milestones</h4>
                    <p className="text-xs text-muted-foreground">Real-time status updates from shoot floor to final master color grade</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand">
                    {projects.length} Projects
                  </span>
                </div>

                {projects.length > 0 ? (
                  <div className="space-y-6">
                    {projects.map((project, idx) => {
                      const currentStageIdx = Math.max(0, STATUS_STAGES.indexOf(project.status));
                      const talentNames = project.bookings?.map((b: any) => `${b.talentProfile?.user?.firstName || ''} ${b.talentProfile?.user?.lastName || ''}`).join(', ') || 'Assigned Crew & Talent';

                      return (
                        <div key={idx} className="rounded-xl border border-border bg-surface/60 p-5 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h5 className="font-serif font-bold text-base text-foreground">
                                {project.title || `Project #${project.id?.slice(0, 8).toUpperCase()}`}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {talentNames} • Initiated {new Date(project.createdAt || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-brand/10 text-brand border border-brand/20 self-start sm:self-auto">
                              {project.status ? project.status.replace('_', ' ') : 'IN PROGRESS'}
                            </span>
                          </div>

                          {/* Progress Line */}
                          <div className="relative pt-2 pb-1">
                            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 via-brand to-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${((currentStageIdx + 1) / STATUS_STAGES.length) * 100}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-2">
                              <span>Booked</span>
                              <span>Pre-Prod</span>
                              <span>Shoot</span>
                              <span>Edit</span>
                              <span className="text-brand">Review</span>
                              <span>Completed</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-border/70 flex flex-wrap gap-2">
                            <Link
                              href={`/client-portal/${project.id}`}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand/90 transition-all shadow-xs"
                            >
                              {project.status === 'REVIEW' ? 'Review Deliverables' : 'Open Production Room'}
                            </Link>
                            {project.status === 'REVIEW' && (
                              <button
                                onClick={() => toast.info('Revision request dialog opening...')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                              >
                                Request Revision
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border bg-surface/30">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h5 className="font-bold text-sm text-foreground">No active productions found</h5>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
                      Book a cinematic ad shoot, corporate film, or hire verified talent to begin tracking production milestones.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/contact"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand/90 transition-all shadow-xs"
                      >
                        Start a Production
                      </Link>
                      <Link
                        href="/services"
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-muted text-foreground transition-all"
                      >
                        Explore Film Services
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Deliverables Tab Content */}
            {activeTab === 'deliverables' && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">Final Deliverables & Master Files</h4>
                    <p className="text-xs text-muted-foreground">Download color-graded 4K videos, social cuts, and project masters</p>
                  </div>
                </div>

                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-surface/30">
                  <PlayCircle className="w-10 h-10 text-brand-gold mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">All video deliverables are linked to your projects</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-4">
                    Once the editing team uploads a rough cut or final render, you can review time-coded playback right here.
                  </p>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all"
                  >
                    View Active Projects
                  </button>
                </div>
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
            <SponsoredSidebarCard context="services" showAdvertiseLink={true} className="h-full" />
          </aside>

        </div>
      </div>
    </div>
  );
}
