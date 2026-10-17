'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Eye, 
  RefreshCw, 
  Loader2, 
  UserCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Sparkles,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

interface TalentModerationClientProps {
  initialProfiles?: any[];
}

export function TalentModerationClient({ initialProfiles }: TalentModerationClientProps) {
  const pathname = usePathname();
  const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const [profiles, setProfiles] = useState<any[]>(initialProfiles || []);
  const [loading, setLoading] = useState(!initialProfiles || initialProfiles.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'ALL'>('PENDING_REVIEW');

  const fetchProfiles = async (isRefresh = false, targetStatus = statusFilter) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/talent/pending?status=${encodeURIComponent(targetStatus)}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json;
        if (Array.isArray(list)) {
          setProfiles(list);
        }
        if (isRefresh) toast.success('Moderation queue refreshed');
      } else {
        if (isRefresh) toast.error('Failed to load moderation queue');
      }
    } catch (err) {
      if (isRefresh) toast.error('Network error loading talent queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfiles(false, statusFilter);
  }, [statusFilter]);

  const handleModerate = async (profileId: string, action: 'APPROVE' | 'REJECT') => {
    const isApprove = action === 'APPROVE';
    const status = isApprove ? 'ACTIVE' : 'SUSPENDED';
    setActionLoading(prev => ({ ...prev, [profileId]: true }));

    try {
      const res = await fetch(`/api/talent/${profileId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          reviewNote: isApprove ? 'Approved by Admin' : 'Rejected during moderation review'
        }),
      });

      const json = await res.json();

      if (res.ok && (json.success || json.ok)) {
        toast.success(isApprove ? '🎉 Talent profile APPROVED & published live!' : 'Talent application REJECTED.');
        // Update profile in state so it immediately shows the new status!
        setProfiles(prev =>
          prev.map(p =>
            p.id === profileId
              ? {
                  ...p,
                  status: status,
                  reviewNote: isApprove ? 'Approved by Admin' : 'Rejected during moderation review',
                }
              : p
          )
        );
      } else {
        toast.error(json.error || json.message || `Failed to process profile.`);
      }
    } catch (err) {
      toast.error('Network error processing moderation decision.');
    } finally {
      setActionLoading(prev => ({ ...prev, [profileId]: false }));
    }
  };

  // Filter profiles on display if needed
  const displayedProfiles = profiles.filter(p => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return p.status === 'ACTIVE';
    if (statusFilter === 'SUSPENDED') return p.status === 'SUSPENDED';
    if (statusFilter === 'PENDING_REVIEW') return p.status === 'PENDING_REVIEW' || !p.status;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-1 block">
            Security & Compliance Queue
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-brand" /> Talent Moderation
          </h1>
        </div>

        <Button
          onClick={() => fetchProfiles(true, statusFilter)}
          variant="outline"
          size="sm"
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Queue ({displayedProfiles.length})
        </Button>
      </div>

      {/* Moderation Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {[
          { label: 'Pending Review', value: 'PENDING_REVIEW', count: profiles.filter(p => p.status === 'PENDING_REVIEW' || !p.status).length },
          { label: 'Approved & Live', value: 'ACTIVE', count: profiles.filter(p => p.status === 'ACTIVE').length },
          { label: 'Rejected / Suspended', value: 'SUSPENDED', count: profiles.filter(p => p.status === 'SUSPENDED').length },
          { label: 'All Registrations', value: 'ALL', count: profiles.length },
        ].map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border ${
                isActive
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'bg-surface text-muted-foreground border-border hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-white/20 text-white font-extrabold' : 'bg-muted text-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Queue Listing */}
      {loading ? (
        <div className="p-16 text-center border border-border rounded-2xl bg-card space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand" />
          <p className="text-muted-foreground font-light text-sm">Loading talent applications...</p>
        </div>
      ) : displayedProfiles.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-border bg-muted/10 space-y-4">
          <Sparkles className="w-10 h-10 mx-auto text-brand" />
          <h3 className="text-xl font-serif text-foreground font-semibold">
            {statusFilter === 'PENDING_REVIEW' ? 'Pending Queue Clear' :
             statusFilter === 'ACTIVE' ? 'No Approved Talents In This View' :
             statusFilter === 'SUSPENDED' ? 'No Suspended Talents' :
             'No Applications Found'}
          </h3>
          <p className="text-muted-foreground text-sm font-light max-w-md mx-auto">
            {statusFilter === 'PENDING_REVIEW' 
              ? 'All submitted talent applications have been reviewed. New talent registrations will appear here automatically.'
              : 'Switch tabs above to check pending applications or all registrations.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedProfiles.map((p) => {
            const isProcessing = actionLoading[p.id];
            const draft = p.draftData || {};
            const user = p.user || {};

            const rawUserFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            const isGenericAdmin = user.email?.includes('superadmin@') || user.email?.includes('admin@mpproduction');

            const name =
              p.stageName?.trim() ||
              draft.fullName?.trim() ||
              draft.stageName?.trim() ||
              (!isGenericAdmin && rawUserFullName ? rawUserFullName : '') ||
              (!isGenericAdmin && user.name ? user.name : '') ||
              rawUserFullName ||
              user.name ||
              'Talent Applicant';

            const email =
              draft.email ||
              p.email ||
              (!isGenericAdmin && user.email ? user.email : (draft.email || p.email || user.email)) ||
              'N/A';

            const phone =
              draft.phone ||
              draft.mobile ||
              p.phone ||
              user.phone ||
              'N/A';

            const city = p.city || draft.city || user.city || p.location || 'Unspecified';
            const avatar = user.avatarUrl || p.avatarUrl || draft.profilePhotoPreview || p.coverBannerUrl;
            const category = p.type || draft.category || p.categorySlug || p.userTalents?.[0]?.category?.name || 'Talent Applicant';
            const isApproved = p.status === 'ACTIVE';
            const isRejected = p.status === 'SUSPENDED';

            return (
              <Card 
                key={p.id} 
                className={`p-6 border-border transition-all bg-card shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                  isApproved ? 'border-l-4 border-l-emerald-500 hover:border-emerald-500/60' :
                  isRejected ? 'border-l-4 border-l-red-500 hover:border-red-500/60' :
                  'border-l-4 border-l-amber-500 hover:border-brand/40'
                }`}
              >
                {/* Profile info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center text-lg font-serif font-bold text-foreground">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name[0]?.toUpperCase() || 'T'
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-serif text-foreground font-bold">{name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-brand/10 text-brand border border-brand/20">
                        {category}
                      </span>
                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approved & Live
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
                          <X className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {!isApproved && !isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending Review
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-light">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand" /> {city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-brand" /> {email}
                      </span>
                      {phone !== 'N/A' && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-brand" /> {phone}
                        </span>
                      )}
                    </div>

                    {p.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pt-1 font-light leading-relaxed max-w-2xl">
                        {p.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border">
                  <Link
                    href={`${basePath}/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card hover:bg-surface text-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand" /> View Details
                  </Link>

                  {isApproved ? (
                    <>
                      <Link
                        href={`/talent/${p.slug || p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Public Profile
                      </Link>
                      <button
                        onClick={() => handleModerate(p.id, 'REJECT')}
                        disabled={isProcessing}
                        className="px-3.5 py-2 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Suspend
                      </button>
                    </>
                  ) : isRejected ? (
                    <button
                      onClick={() => handleModerate(p.id, 'APPROVE')}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Re-Approve
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleModerate(p.id, 'APPROVE')}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>

                      <button
                        onClick={() => handleModerate(p.id, 'REJECT')}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
