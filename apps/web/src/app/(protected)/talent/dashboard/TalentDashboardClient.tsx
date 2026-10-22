'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserCheck, Image as ImageIcon, Send, DollarSign, ArrowRight, 
  Check, X, Clock, MapPin, Film, Award, Edit3, Plus, Trash2, 
  Upload, CheckCircle2, AlertCircle, Shield, Star, Eye
} from 'lucide-react';
import { ScrollImageTunnel } from '@/components/ui/scroll-image-tunnel';
import { Role } from '@mdms/types';

interface TalentDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role | string;
  };
}

interface HireRequest {
  id: string;
  type: 'Direct Brand Inquiry' | 'Agency Casting Call';
  title: string;
  brand: string;
  shootDate: string;
  location: string;
  payout: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface PortfolioMedia {
  id: string;
  title: string;
  category: string;
  type: 'Photo' | 'Video Reel';
  url: string;
  views: number;
}

interface EarningItem {
  id: string;
  project: string;
  brand: string;
  date: string;
  amount: string;
  status: 'Available' | 'Transferred' | 'Escrow Pending';
}

export function TalentDashboardClient({ user }: TalentDashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';

  // State
  const [requests, setRequests] = useState<HireRequest[]>([
    { id: 'req-1', type: 'Direct Brand Inquiry', title: 'Vogue Autumn Lookbook & Video Reel', brand: 'Vogue India', shootDate: 'July 20-21, 2026', location: 'Mumbai Studio A', payout: '₹45,000', status: 'pending' },
    { id: 'req-2', type: 'Agency Casting Call', title: 'Energy Drink Commercial Reel', brand: 'RedBull India', shootDate: 'July 25, 2026', location: 'Delhi Outdoor Stage', payout: '₹35,000', status: 'pending' },
    { id: 'req-3', type: 'Direct Brand Inquiry', title: 'Luxury Swiss Watch Campaign', brand: 'Harper’s Bazaar', shootDate: 'Aug 05, 2026', location: 'Virtual Production Stage D', payout: '₹60,000', status: 'accepted' },
  ]);

  const [portfolio, setPortfolio] = useState<PortfolioMedia[]>([
    { id: 'pm-1', title: 'Vogue Summer Cover Shot 2026', category: 'High Fashion', type: 'Photo', url: '/assets/project-fashion.webp', views: 1420 },
    { id: 'pm-2', title: 'Nike Athletic Running Reel', category: 'Commercial Action', type: 'Video Reel', url: '/assets/project-commercial.webp', views: 3850 },
    { id: 'pm-3', title: 'Monochrome Studio Editorial', category: 'Portrait', type: 'Photo', url: '/assets/project-corporate.webp', views: 980 },
    { id: 'pm-4', title: 'Cinematic Lighting Showreel', category: 'Dramatic Film', type: 'Video Reel', url: '/assets/project-music.webp', views: 5120 },
  ]);

  const [earnings, setEarnings] = useState<EarningItem[]>([
    { id: 'ern-1', project: 'Luxury Swiss Watch Campaign', brand: 'Harper’s Bazaar', date: 'Jul 10, 2026', amount: '₹60,000', status: 'Available' },
    { id: 'ern-2', project: 'Spring Athletic Lookbook', brand: 'Nike India', date: 'Jun 22, 2026', amount: '₹40,000', status: 'Transferred' },
    { id: 'ern-3', project: 'Summer Cover Story Film', brand: 'Vogue India', date: 'Jun 05, 2026', amount: '₹55,000', status: 'Transferred' },
  ]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('High Fashion');
  const [newType, setNewType] = useState<'Photo' | 'Video Reel'>('Photo');

  const handleAction = (id: string, action: 'accepted' | 'declined') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const item: PortfolioMedia = {
      id: `pm-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      type: newType,
      url: '/assets/talent-model-1.webp',
      views: 1,
    };
    setPortfolio(prev => [item, ...prev]);
    setIsUploadModalOpen(false);
    setNewTitle('');
  };

  const handleDeleteMedia = (id: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] border border-border relative overflow-hidden shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">
                Exclusive Roster Talent &bull; Verified Creator
              </span>
              <h2 className="text-3xl font-serif font-bold text-white mb-2">
                Welcome back, {user.name || 'Artist'}
              </h2>
              <p className="text-sm text-white/70 font-light max-w-2xl">
                Manage your casting media kit, respond to brand hire requests, check call times, and track your escrow earnings.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => router.push('?tab=profile')} className="p-6 rounded-2xl bg-surface border border-border hover:border-amber-500/50 cursor-pointer transition-all group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">My Profile</span>
                <UserCheck className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                <span>View Media Kit</span>
                <ArrowRight className="w-4 h-4 text-brand group-hover:translate-x-1 transition-transform" />
              </p>
              <span className="text-xs text-emerald-400 font-semibold">&bull; Verified Roster Badge</span>
            </div>

            <div onClick={() => router.push('?tab=portfolio')} className="p-6 rounded-2xl bg-surface border border-border hover:border-amber-500/50 cursor-pointer transition-all group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Portfolio</span>
                <ImageIcon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{portfolio.length} Items</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Photos & Showreels</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=requests')} className="p-6 rounded-2xl bg-surface border border-border hover:border-amber-500/50 cursor-pointer transition-all group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Hire Requests</span>
                <Send className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{requests.filter(r => r.status === 'pending').length} New</p>
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <span>Requires your response</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=earnings')} className="p-6 rounded-2xl bg-surface border border-border hover:border-amber-500/50 cursor-pointer transition-all group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Earnings</span>
                <DollarSign className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-emerald-400 mb-1">₹60,000</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Available for immediate transfer</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </span>
            </div>
          </div>

          {/* Pending Casting Requests */}
          <div className="p-8 rounded-2xl bg-surface border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <span>Pending Casting & Hire Requests</span>
              </h3>
              <Link href="?tab=requests" className="text-xs text-amber-400 hover:underline font-semibold uppercase tracking-wider">
                View All ({requests.length}) &rarr;
              </Link>
            </div>
            <div className="space-y-4">
              {requests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="p-5 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-brand uppercase tracking-wider">{req.type}</span>
                    <h4 className="text-base font-bold text-foreground mt-0.5">{req.title} &mdash; <span className="text-foreground">{req.brand}</span></h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {req.shootDate}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-base font-bold text-emerald-400 px-3.5 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">{req.payout}</span>
                    <button
                      onClick={() => handleAction(req.id, 'accepted')}
                      className="px-4 py-2 bg-brand hover:brightness-110 text-primary-foreground text-xs font-semibold rounded-xl transition-colors shadow-glow"
                    >
                      Accept Brief
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'declined')}
                      className="px-3 py-2 bg-muted hover:bg-accent hover:text-accent-foreground text-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
              {requests.filter(r => r.status === 'pending').length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No pending casting calls at the moment.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {currentTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Public Profile Card & Media Kit</h2>
              <p className="text-xs text-muted-foreground">This is how brand producers and casting directors view your verified talent credentials.</p>
            </div>
            <Link
              href="/talent/directory"
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-background hover:bg-amber-400 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4" /> View in Directory
            </Link>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-36 h-36 rounded-2xl bg-background border-4 border-border overflow-hidden shrink-0 shadow-2xl relative group">
              <img
                src="/assets/project-fashion.webp"
                alt={user.name || 'Elena Smith'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                data-cursor-image="/assets/project-fashion.webp"
              />
            </div>
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h3 className="text-3xl font-serif font-bold text-foreground">{user.name || 'Elena Smith'}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified Roster
                  </span>
                </div>
                <p className="text-sm text-amber-400 font-medium mt-1">High Fashion Model &bull; Commercial Actor &bull; Voiceover Artist</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Professional creator with over 6 years of experience in luxury fashion campaigns, editorial print lookbooks, and high-octane commercial showreels. Based in Mumbai & Delhi. Available worldwide.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-background border border-border text-foreground">Day Rate: <strong className="text-foreground font-mono">₹45,000 / day</strong></span>
                <span className="px-3 py-1.5 rounded-xl bg-background border border-border text-foreground">Height: <strong className="text-foreground font-mono">5&apos;10&quot;</strong></span>
                <span className="px-3 py-1.5 rounded-xl bg-background border border-border text-foreground">Rating: <strong className="text-amber-400 font-bold">5.0 ★★★★★</strong></span>
              </div>
            </div>
          </div>

          {/* Featured Lookbook & Photography Highlights on Profile Tab */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">Featured Lookbook & Showreel Gallery</h3>
                <p className="text-xs text-muted-foreground">Verified editorial shots and video campaigns available for casting directors.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {portfolio.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-surface border border-border space-y-3 flex flex-col justify-between hover:border-brand/50 transition-all group shadow-lg">
                  <div className="aspect-[4/5] rounded-xl bg-background border border-border relative overflow-hidden flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      data-cursor-image={item.url}
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-foreground text-[10px] font-bold flex items-center gap-1.5">
                      {item.type === 'Video Reel' ? <Film className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-brand" />}
                      <span>{item.type}</span>
                    </div>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-foreground text-[10px] font-semibold">
                      {item.views} views
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-brand transition-colors truncate">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cinematic Scroll Reveal Image Tunnel on Profile Tab */}
          <div className="pt-8 border-t border-border space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-serif font-bold text-foreground">Lookbook Cinematic Scroll Reveal</h3>
              <p className="text-xs text-muted-foreground">Scroll down to experience your high-resolution portfolio in signature 3D tunnel format.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background relative shadow-2xl">
              <ScrollImageTunnel 
                hint="SCROLL DOWN TO REVEAL THE IMAGES"
                images={portfolio.map((item, idx) => ({
                  src: item.url,
                  alt: item.title || `Portfolio item ${idx + 1}`
                }))} 
              />
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO TAB */}
      {currentTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Portfolio & Showreel Gallery</h2>
              <p className="text-xs text-muted-foreground">Upload high-resolution photos and video showreels for casting directors.</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-brand hover:brightness-110 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Media</span>
            </button>
          </div>

          {/* Upload Modal */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-foreground">Upload Portfolio Media</h3>
                  <button onClick={() => setIsUploadModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleUpload} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Media Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vogue Summer Editorial Shot"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-[#e11d48]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Media Type</label>
                      <select
                        value={newType}
                        onChange={e => setNewType(e.target.value as any)}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-[#e11d48]"
                      >
                        <option value="Photo">High-Res Photo</option>
                        <option value="Video Reel">Video Showreel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Category</label>
                      <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-[#e11d48]"
                      >
                        <option value="High Fashion">High Fashion</option>
                        <option value="Commercial Action">Commercial Action</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Dramatic Film">Dramatic Film</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent hover:text-accent-foreground font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-brand text-primary-foreground hover:brightness-110 font-semibold">Upload & Publish</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {portfolio.map(item => (
              <div key={item.id} className="p-5 rounded-2xl bg-surface border border-border space-y-3 flex flex-col justify-between hover:border-amber-500/50 transition-all group">
                <div className="aspect-[4/5] rounded-xl bg-background border border-border relative overflow-hidden flex items-center justify-center">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    data-cursor-image={item.url}
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-foreground text-[10px] font-bold flex items-center gap-1.5">
                    {item.type === 'Video Reel' ? <Film className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-brand" />}
                    <span>{item.type}</span>
                  </div>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-foreground text-[10px] font-semibold">
                    {item.views} views
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-amber-400 transition-colors">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                </div>
                <div className="flex justify-end pt-2 border-t border-border">
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-foreground transition-colors"
                    title="Delete Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cinematic Scroll Reveal Image Tunnel */}
          <div className="pt-12 border-t border-border space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-serif font-bold text-foreground">Interactive Scroll Reveal Gallery</h3>
              <p className="text-xs text-muted-foreground">Experience your high-resolution portfolio in our signature 3D cinematic tunnel format.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background relative shadow-2xl">
              <ScrollImageTunnel 
                hint="SCROLL DOWN TO REVEAL THE IMAGES"
                images={portfolio.map((item, idx) => ({
                  src: item.url,
                  alt: item.title || `Portfolio item ${idx + 1}`
                }))} 
              />
            </div>
          </div>
        </div>
      )}

      {/* REQUESTS TAB */}
      {currentTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Casting Calls & Brand Inquiries</h2>
              <p className="text-xs text-muted-foreground">Accept or decline production briefs. Accepted briefs automatically generate studio stage bookings.</p>
            </div>
          </div>

          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-amber-500/50 transition-all">
                <div>
                  <span className="text-xs font-semibold text-brand uppercase tracking-wider">{req.type}</span>
                  <h4 className="text-lg font-bold text-foreground mt-0.5">{req.title} &mdash; <span className="text-foreground">{req.brand}</span></h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {req.shootDate}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-base font-bold text-emerald-400 px-3.5 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">{req.payout}</span>
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAction(req.id, 'accepted')}
                        className="px-4 py-2 bg-brand hover:brightness-110 text-primary-foreground text-xs font-semibold rounded-xl transition-colors shadow-glow"
                      >
                        Accept Brief
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'declined')}
                        className="px-3 py-2 bg-muted hover:bg-accent hover:text-accent-foreground text-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider ${
                      req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EARNINGS TAB */}
      {currentTab === 'earnings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Escrow Earnings & Payouts</h2>
              <p className="text-xs text-muted-foreground">All brand campaign payments are held in secure studio escrow until deliverable completion.</p>
            </div>
            <div className="flex items-center gap-4 bg-background px-5 py-3 rounded-xl border border-border">
              <span className="text-xs text-muted-foreground">Available Balance:</span>
              <strong className="text-xl font-bold text-emerald-400 font-mono">₹60,000</strong>
              <button onClick={() => alert('Initiating instant transfer to registered bank account...')} className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-foreground font-semibold text-xs transition-colors">
                Withdraw
              </button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Brand Client</th>
                  <th className="p-4">Completion Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {earnings.map(ern => (
                  <tr key={ern.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-4 font-bold text-foreground">{ern.project}</td>
                    <td className="p-4 font-semibold text-foreground">{ern.brand}</td>
                    <td className="p-4 text-muted-foreground">{ern.date}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">{ern.amount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        ern.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {ern.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
