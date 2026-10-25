'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Save, 
  Sparkles, 
  Building, 
  FileText, 
  Youtube, 
  Briefcase, 
  Target, 
  Receipt, 
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const TIMEOUT_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 120, 240, 480, 720, 1440];

const MODULE_DEFINITIONS = [
  {
    key: 'talentRoster',
    label: 'Talent Roster CMS',
    desc: 'Review applicants, manage talent cards, portfolios, and approval status.',
    icon: Sparkles,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    key: 'services',
    label: 'Services Management',
    desc: 'Update studio service packages, pricing plans, and creative offerings.',
    icon: Building,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
  },
  {
    key: 'blogs',
    label: 'Blogs & Editorial',
    desc: 'Create, edit, draft and publish production articles and announcements.',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    key: 'youtuber',
    label: 'YouTuber Creator Studio',
    desc: 'Manage channel packages, YouTube collaborations, and creator onboarding.',
    icon: Youtube,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  {
    key: 'projects',
    label: 'Studio Projects & Tasks',
    desc: 'Monitor production timelines, assign editing milestones, and review deliverables.',
    icon: Briefcase,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    key: 'leads',
    label: 'CRM & Sales Inquiries',
    desc: 'Manage client booking inquiries, inbound lead triage, and client follow-ups.',
    icon: Target,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    key: 'expenses',
    label: 'Expense Tracker',
    desc: 'Log production expenditure, studio equipment rentals, and shoot bills.',
    icon: Receipt,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  {
    key: 'mediaAssets',
    label: 'Media Assets Vault (4K/8K)',
    desc: 'Full access to raw footage vault, sound library, and color grading assets.',
    icon: Film,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
];

interface EmployeePermissionsPageProps {
  userId: string;
  basePath?: string;
}

export function EmployeePermissionsPage({ userId, basePath = '/super-admin' }: EmployeePermissionsPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [selectedTimeout, setSelectedTimeout] = useState<number>(30);
  const [customTimeout, setCustomTimeout] = useState<string>('30');
  const [modulePermissions, setModulePermissions] = useState<Record<string, boolean>>({
    talentRoster: true,
    services: false,
    blogs: true,
    youtuber: false,
    projects: true,
    leads: false,
    expenses: false,
    mediaAssets: true,
  });

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

  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/employees/${userId}/permissions`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to load employee permissions');
        const json = await res.json();
        if (json.user) setUser(json.user);
        if (json.permissions) {
          const timeout = json.permissions.idleTimeoutMinutes || 30;
          setSelectedTimeout(timeout);
          setCustomTimeout(String(timeout));
          if (json.permissions.modules) {
            setModulePermissions((prev) => ({ ...prev, ...json.permissions.modules }));
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Error fetching permissions');
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadPermissions();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const timeoutVal = parseInt(customTimeout, 10) || selectedTimeout || 30;
      const res = await fetch(`/api/admin/employees/${userId}/permissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          idleTimeoutMinutes: timeoutVal,
          modules: modulePermissions,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to update permissions');
      }

      toast.success(`Access permissions & idle timeout saved for ${user?.firstName || 'staff'}!`);
      router.push(`${basePath}?tab=employees`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const formatTimeoutLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const backUrl = `${basePath}?tab=employees`;

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#06b6d4]" />
        <p className="text-sm font-semibold text-muted-foreground">Loading employee permissions...</p>
      </div>
    );
  }

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Staff Member';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* ── Top Bar with Back Button & Breadcrumbs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Back to Employees"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Link href={backUrl} className="hover:text-foreground transition-colors">Employees &amp; Crew</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Access Permissions &amp; Idle Timeout</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight mt-0.5">
              Permissions for {fullName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={backUrl}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
          </button>
        </div>
      </div>

      {/* ── Employee Identity Summary Bar ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30">
                {user?.role || 'EMPLOYEE'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}/employees/${userId}/edit`}
            className="px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-bold transition-all"
          >
            Edit Profile →
          </Link>
          <Link
            href={`${basePath}/employees/${userId}/sessions`}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            Session History →
          </Link>
        </div>
      </div>

      {/* ── Section 1: Auto-Logout Idle Timeout ── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-foreground">Auto-Logout Idle Timeout</h3>
              <p className="text-xs text-muted-foreground">Session automatically terminates after this period of inactivity.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            Current: {formatTimeoutLabel(parseInt(customTimeout, 10) || selectedTimeout)}
          </span>
        </div>

        {/* 12 Quick Pills */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5 pt-2">
          {TIMEOUT_OPTIONS.map((mins) => {
            const isSelected = selectedTimeout === mins && customTimeout === String(mins);
            return (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setSelectedTimeout(mins);
                  setCustomTimeout(String(mins));
                }}
                className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-105'
                    : 'bg-muted/40 border-border hover:bg-muted text-foreground'
                }`}
              >
                {formatTimeoutLabel(mins)}
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs font-medium text-muted-foreground">Custom minutes:</span>
          <input
            type="number"
            min={1}
            max={10080}
            value={customTimeout}
            onChange={(e) => {
              const val = e.target.value;
              setCustomTimeout(val);
              setSelectedTimeout(parseInt(val, 10) || 30);
            }}
            className="w-24 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-amber-500 text-center"
          />
          <span className="text-xs text-muted-foreground font-mono">
            (= {formatTimeoutLabel(parseInt(customTimeout, 10) || 30)})
          </span>
        </div>
      </div>

      {/* ── Section 2: Delegated Admin Modules ── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#06b6d4]" />
            <h3 className="font-bold text-sm text-foreground">Delegated Admin Workspaces</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enabled modules will appear inside this staff member's sidebar so they can perform specific administrative work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {MODULE_DEFINITIONS.map((mod) => {
            const isEnabled = Boolean(modulePermissions[mod.key]);
            const Icon = mod.icon;
            return (
              <div
                key={mod.key}
                onClick={() => setModulePermissions((prev) => ({ ...prev, [mod.key]: !isEnabled }))}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'border-[#06b6d4] bg-[#06b6d4]/5 shadow-xs'
                    : 'border-border bg-muted/20 hover:bg-muted/40 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${mod.bg} ${mod.color} border ${mod.border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span>{mod.label}</span>
                      {isEnabled && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#06b6d4]/15 text-[#06b6d4] text-[9px] font-extrabold uppercase">
                          Enabled
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <div className={`w-10 h-6 rounded-full p-1 transition-colors shrink-0 ${
                  isEnabled ? 'bg-[#06b6d4]' : 'bg-muted-foreground/30'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-end gap-3">
        <Link
          href={backUrl}
          className="px-5 py-2.5 rounded-xl text-xs font-bold border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving Changes...' : 'Save Permissions & Timeout'}</span>
        </button>
      </div>
    </div>
  );
}
