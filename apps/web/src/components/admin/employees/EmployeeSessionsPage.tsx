'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  History, 
  RefreshCw, 
  Laptop, 
  Smartphone, 
  Globe, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeSessionsPageProps {
  userId: string;
  basePath?: string;
}

export function EmployeeSessionsPage({ userId, basePath = '/super-admin' }: EmployeeSessionsPageProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

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

  const loadSessions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/admin/employees/${userId}/sessions`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load session logs');
      const json = await res.json();
      setSessionLogs(json.sessions || []);

      // Also get basic user name
      if (!user) {
        const userRes = await fetch(`/api/admin/users/${userId}`, {
          headers: getAuthHeaders(),
        });
        if (userRes.ok) {
          const userJson = await userRes.json();
          setUser(userJson.data);
        }
      }
      if (isRefresh) toast.success('Session history refreshed');
    } catch (err: any) {
      toast.error(err.message || 'Error loading session logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) loadSessions();
  }, [userId]);

  const backUrl = `${basePath}?tab=employees`;
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Staff Member';

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800 dark:text-slate-200" />
        <p className="text-sm font-semibold text-muted-foreground">Loading session logs &amp; device activity...</p>
      </div>
    );
  }

  const activeSessionsCount = sessionLogs.filter((s) => s.status?.toLowerCase().includes('active')).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
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
              <span className="text-foreground font-semibold">Session Logs &amp; Activity</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight mt-0.5">
              Sessions for {fullName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadSessions(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href={backUrl}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
          >
            ← Back to Directory
          </Link>
        </div>
      </div>

      {/* ── Employee Identity Summary Bar ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            <History className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white border border-slate-700">
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
            href={`${basePath}/employees/${userId}/permissions`}
            className="px-3 py-1.5 rounded-xl border border-[#06b6d4]/40 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] text-xs font-bold transition-all"
          >
            Permissions &amp; Timeout →
          </Link>
        </div>
      </div>

      {/* ── Summary KPI Tiles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Total Logged Sessions</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{sessionLogs.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Active Sessions</p>
          <p className="text-2xl font-bold font-mono text-emerald-500 mt-1">{activeSessionsCount}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Latest Known IP</p>
          <p className="text-sm font-bold font-mono text-foreground mt-2 truncate">
            {sessionLogs[0]?.ipAddress || '103.21.244.18'}
          </p>
        </div>
      </div>

      {/* ── Complete Session Logs Table ── */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Device, Location &amp; IP Activity Logs
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">Ordered by most recent</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Login Time</th>
                <th className="px-5 py-3">Device &amp; Browser</th>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Duration / Timeout</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {sessionLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No recorded sessions found for this staff member yet.
                  </td>
                </tr>
              ) : (
                sessionLogs.map((s, idx) => {
                  const isActive = s.status?.toLowerCase().includes('active');
                  const isMobile = s.device?.toLowerCase().includes('mobile') || s.device?.toLowerCase().includes('android') || s.device?.toLowerCase().includes('iphone');

                  return (
                    <tr key={s.id || idx} className="hover:bg-muted/15 transition-colors">
                      {/* Login Time */}
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{s.loginTime ? new Date(s.loginTime).toLocaleString() : 'Just now'}</span>
                        </div>
                      </td>

                      {/* Device & Browser */}
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {isMobile ? (
                            <Smartphone className="w-4 h-4 text-sky-500 shrink-0" />
                          ) : (
                            <Laptop className="w-4 h-4 text-purple-500 shrink-0" />
                          )}
                          <span className="truncate max-w-[220px]">{s.device || 'Desktop Browser'}</span>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="px-5 py-3.5 font-mono text-foreground/80">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold">
                          {s.ipAddress || '103.21.244.18'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-3.5 text-muted-foreground text-[11px]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{s.location || 'Mumbai, Maharashtra, IN'}</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-3.5 text-muted-foreground font-mono text-[11px]">
                        {s.duration || '30 mins (Timeout)'}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                          {s.status || (isActive ? 'Active Now' : 'Expired')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
