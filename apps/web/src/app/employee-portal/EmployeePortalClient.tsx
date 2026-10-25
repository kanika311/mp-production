'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Users, 
  Clock, 
  Calendar, 
  Receipt, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  LogOut, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  MapPin, 
  TrendingUp, 
  FileText, 
  ChevronRight, 
  Timer,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Building,
  Film,
  Camera,
  Video,
  FolderOpen,
  MessageSquare,
  Shield,
  UploadCloud,
  Check,
  X,
  Radio,
  Bell,
  SlidersHorizontal,
  Home,
  LayoutTemplate,
  UserCheck,
  Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SponsoredSidebarCard } from '@/components/ui/sponsored-sidebar-card';

interface EmployeePortalClientProps {
  initialEmployee: any;
  user: any;
}

export default function EmployeePortalClient({ initialEmployee, user }: EmployeePortalClientProps) {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(initialEmployee);
  const [activeTab, setActiveTab] = useState<string>('attendance');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Leave Form State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Expense Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Production Travel');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Delegated Admin Permissions State
  const [permissions, setPermissions] = useState<any>({
    idleTimeoutMinutes: 30,
    modules: {
      talentRoster: true,
      services: true,
      blogs: true,
      youtuber: false,
      projects: true,
      leads: true,
      expenses: true,
      mediaAssets: true,
    },
  });

  // Auto-Logout Idle Timer State
  const [idleSecondsRemaining, setIdleSecondsRemaining] = useState<number>(30 * 60);
  const totalIdleSecondsRef = useRef<number>(30 * 60);
  const lastActivityRef = useRef<number>(Date.now());

  // Fetch Employee Permissions & Idle Timeout from Admin Config
  useEffect(() => {
    async function loadPermissions() {
      try {
        const res = await fetch('/api/employee/permissions');
        if (res.ok) {
          const json = await res.json();
          if (json.permissions) {
            setPermissions(json.permissions);
            const minutes = json.permissions.idleTimeoutMinutes || 30;
            totalIdleSecondsRef.current = minutes * 60;
            setIdleSecondsRemaining(minutes * 60);
          }
        }
      } catch (err) {
        console.error('Error fetching employee permissions:', err);
      }
    }
    loadPermissions();
  }, []);

  // Idle Activity Tracker
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIdleSecondsRemaining(totalIdleSecondsRef.current);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, handleActivity));

    const interval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, totalIdleSecondsRef.current - elapsedSec);
      setIdleSecondsRemaining(remaining);

      // Warning beep when 2 minutes remaining
      if (remaining === 120) {
        toast.warning('⚠️ Idle Warning: You will be logged out in 2 minutes due to inactivity.', {
          duration: 8000,
        });
      }

      // Auto logout when 0
      if (remaining === 0) {
        clearInterval(interval);
        toast.error('Session timed out due to inactivity.');
        handleSignOut();
      }
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearInterval(interval);
    };
  }, []);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('mdms_auth_token');
      localStorage.removeItem('mdms_auth_role');
      localStorage.removeItem('mdms_auth_user');
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'mdms_auth_token=; path=/; max-age=0';
      document.cookie = 'next-auth.session-token=; path=/; max-age=0';
      toast.success('Logged out successfully');
      window.location.href = '/login';
    }
  };

  // Check if currently checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeCheckIn = employee?.attendance?.find((a: any) => {
    const checkInDate = new Date(a.checkInAt);
    return checkInDate >= today && !a.checkOutAt;
  });

  const isCheckedIn = Boolean(activeCheckIn);

  // Calculate elapsed time if checked in
  const getElapsedTime = () => {
    if (!activeCheckIn) return '0h 0m';
    const start = new Date(activeCheckIn.checkInAt).getTime();
    const now = currentTime.getTime();
    const diffMin = Math.max(0, Math.floor((now - start) / 60000));
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hours}h ${mins}m`;
  };

  const handlePunchAction = async () => {
    setIsSubmitting(true);
    const action = isCheckedIn ? 'check-out' : 'check-in';

    try {
      let lat: number | null = null;
      let lng: number | null = null;

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos: any = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          }).catch(() => null);
          if (pos?.coords) {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          }
        } catch {}
      }

      const res = await fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          lat,
          lng,
          notes: action === 'check-in' ? 'Production Shift Check-in' : 'Shift Completed',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update attendance');

      toast.success(data.message);
      // Refresh employee data
      const refreshRes = await fetch('/api/employee');
      const refreshJson = await refreshRes.json();
      if (refreshJson.employee) {
        setEmployee(refreshJson.employee);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-leave',
          leaveType,
          startDate: leaveStart,
          endDate: leaveEnd,
          reason: leaveReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit leave request');

      toast.success(data.message || 'Leave request submitted!');
      setShowLeaveModal(false);
      setLeaveReason('');
      setLeaveStart('');
      setLeaveEnd('');

      const refreshRes = await fetch('/api/employee');
      const refreshJson = await refreshRes.json();
      if (refreshJson.employee) {
        setEmployee(refreshJson.employee);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(expenseAmount);
    if (!amountVal || amountVal <= 0 || !expenseDescription) {
      toast.error('Please enter a valid amount and description');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit-expense',
          amount: amountVal,
          category: expenseCategory,
          description: expenseDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit expense claim');

      toast.success(data.message || 'Expense claim submitted!');
      setShowExpenseModal(false);
      setExpenseAmount('');
      setExpenseDescription('');

      const refreshRes = await fetch('/api/employee');
      const refreshJson = await refreshRes.json();
      if (refreshJson.employee) {
        setEmployee(refreshJson.employee);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting expense claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullName = `${employee?.user?.firstName || user?.name || 'Staff Member'} ${employee?.user?.lastName || ''}`.trim();
  const department = employee?.department || 'Production';
  const designation = employee?.designation || 'Senior Producer';
  const attendances = employee?.attendance || [];
  const leaveRequests = employee?.leaveRequests || [];
  const expenseClaims = employee?.expenseClaims || [];

  const formatIdleTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const renderSidebarContent = (isDrawer = false) => (
    <div className="space-y-3">
      {/* Staff Profile Identity Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-brand/20 via-brand-gold/15 to-amber-500/10 pointer-events-none" />

        <div className="relative flex flex-col items-center text-center pt-2">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand/40 bg-muted shadow-md flex items-center justify-center">
              {employee?.user?.avatarUrl ? (
                <img src={employee.user.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand to-rose-700 text-white font-extrabold text-2xl flex items-center justify-center">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border border-border shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-brand fill-brand/20" />
            </span>
          </div>

          <h3 className="font-serif font-bold text-base text-foreground tracking-tight">{fullName}</h3>
          <span className="text-xs font-bold text-brand dark:text-brand mt-0.5">{designation} • {department}</span>
          <span className="text-[11px] font-mono text-muted-foreground mt-0.5">{employee?.user?.email || user?.email}</span>

          {/* Status Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand/10 text-brand border border-brand/30">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              ACTIVE STAFF
            </span>
          </div>

          {/* Shift Status & Punch In/Out button */}
          <div className="w-full mt-3 p-3 rounded-xl bg-muted/40 border border-border/80 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Shift Status:</span>
              <span className={`font-bold flex items-center gap-1.5 ${isCheckedIn ? 'text-brand' : 'text-amber-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-brand animate-pulse' : 'bg-amber-500'}`} />
                {isCheckedIn ? 'Checked In' : 'Not Clocked In'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Shift Duration:</span>
              <span className="font-mono font-bold text-brand">{getElapsedTime()}</span>
            </div>
            <button
              type="button"
              onClick={handlePunchAction}
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 ${
                isCheckedIn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-800/20'
                  : 'bg-brand hover:bg-brand/90 text-white shadow-brand/20'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Timer className="w-3.5 h-3.5" />
              )}
              <span>{isCheckedIn ? 'Punch Out' : 'Punch In'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation Panel */}
      <div className="rounded-2xl border border-border bg-card p-2.5 shadow-xs space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Employee Workspace
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab('attendance');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-brand text-white shadow-sm'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Attendance &amp; Shifts</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('leaves');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-brand text-white shadow-sm'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Leave Requests</span>
          </div>
          {leaveRequests.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'leaves' ? 'bg-white text-brand' : 'bg-brand/10 text-brand'
            }`}>
              {leaveRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('expenses');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-brand text-white shadow-sm'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <span>Expense Claims</span>
          </div>
          {expenseClaims.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'expenses' ? 'bg-white text-brand' : 'bg-brand/10 text-brand'
            }`}>
              {expenseClaims.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('projects');
            if (isDrawer) setIsMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-brand text-white shadow-sm'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Studio Projects &amp; Tasks</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* ── DELEGATED ADMIN WORKSPACES ── */}
        <div className="pt-3 pb-1 border-t border-border/70">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#06b6d4] flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            <span>Permitted Admin Modules</span>
          </div>

          {(permissions?.modules?.talent || permissions?.modules?.talentRoster) && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_talent');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_talent'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Talent Roster CMS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {permissions?.modules?.blogs && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_blogs');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_blogs'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Blogs &amp; Editorial</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {permissions?.modules?.services && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_services');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_services'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-500" />
                <span>Services &amp; Packages</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {(permissions?.modules?.['become-a-youtuber'] || permissions?.modules?.youtuber) && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_youtuber');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_youtuber'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Become a YouTuber</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {permissions?.modules?.projects && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_projects');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_projects'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500" />
                <span>Projects CMS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {(permissions?.modules?.['home-page'] || permissions?.modules?.homePage) && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_home_page');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_home_page'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-indigo-500" />
                <span>Home Page CMS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {(permissions?.modules?.['footer-cms'] || permissions?.modules?.footerCms) && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_footer_cms');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_footer_cms'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-cyan-500" />
                <span>Footer CMS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {permissions?.modules?.sponsored && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_sponsored');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_sponsored'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Sponsored &amp; Ads</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {(permissions?.modules?.['contact-leads'] || permissions?.modules?.leads) && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_leads');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_leads'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>Contact Leads &amp; CRM</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {permissions?.modules?.clients && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_clients');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_clients'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span>Clients Directory</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {permissions?.modules?.employees && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_employees');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_employees'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand" />
                <span>Crew &amp; Staff</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {permissions?.modules?.mediaAssets && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin_media');
                if (isDrawer) setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin_media'
                  ? 'bg-[#06b6d4] text-white shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                <span>Media Vault (4K/8K)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-background text-foreground pt-20 sm:pt-24 pb-20">
      {/* ── Top Command Bar (Desktop Only) ── */}
      <div className="hidden lg:block w-full border-b border-border bg-card/85 backdrop-blur-md sticky top-[64px] z-30 shadow-2xs">
        <div className="w-full px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/30">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Staff Command Center
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Employee Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock & Auto-Logout Countdown */}
            <div className="flex items-center gap-3 text-xs bg-muted/40 px-3 py-1.5 rounded-full border border-border/60">
              <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {currentTime.toLocaleTimeString()}
              </span>
              <span className="w-px h-3 bg-border" />
              <span className={`font-mono text-[11px] font-bold flex items-center gap-1 ${
                idleSecondsRemaining < 120 ? 'text-rose-500 animate-pulse' : 'text-amber-500'
              }`}>
                <Timer className="w-3.5 h-3.5" />
                Idle: {formatIdleTime(idleSecondsRemaining)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all cursor-pointer"
              title="Logout from Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile View Top Bar: ONLY Filter Icon, then direct start with content ── */}
      <div className="lg:hidden w-full px-3 pt-3 pb-1 flex items-center">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-11 h-11 rounded-2xl border-2 border-brand bg-card hover:bg-brand/10 text-brand shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
          title="Open Staff Menu & Filters"
          aria-label="Open Sidebar Menu"
        >
          <SlidersHorizontal className="w-5 h-5 text-brand stroke-[2.4]" />
        </button>
      </div>

      {/* ── Mobile Floating Filter Button (Bottom-Left Quick Access, Matching Image 2) ── */}
      <div className="fixed bottom-6 left-5 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl border-2 border-brand bg-card/95 backdrop-blur-md text-brand shadow-xl shadow-brand/20 flex items-center justify-center transition-all active:scale-90 hover:scale-105 cursor-pointer ring-4 ring-brand/15"
          title="Open Staff Menu & Filters"
          aria-label="Open Sidebar Menu"
        >
          <SlidersHorizontal className="w-6 h-6 stroke-[2.4] text-brand" />
        </button>
      </div>

      {/* ── Mobile Slide-over Drawer (Opens on Filter Icon Click) ── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide Drawer Content */}
            <motion.div
              data-lenis-prevent="true"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 h-[100dvh] max-h-[100dvh] w-[88%] max-w-[340px] bg-background border-r border-border shadow-2xl z-50 flex flex-col overflow-hidden"
              style={{
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Bar (Fixed Header) */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl border-2 border-brand bg-brand/10 text-brand flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-foreground">Staff Menu</h4>
                    <p className="text-[10px] text-muted-foreground">Workspace &amp; Navigation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div 
                data-lenis-prevent="true"
                className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 space-y-4 pb-20 select-text"
                style={{
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {/* Render identical Left Panel content inside Drawer */}
                {renderSidebarContent(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main 3-Column Layout: Matching TalentDashboardView Exactly ── */}
      <div className="w-full px-3 sm:px-4 lg:px-6 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start">

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 1 (LEFT SIDEBAR): Desktop Only (Hidden on Mobile, Opens as Drawer)
              ══════════════════════════════════════════════════════════════════ */}
          <aside 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="hidden lg:block lg:col-span-3 lg:sticky lg:top-[125px] lg:h-[calc(100vh-140px)] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto overscroll-contain touch-pan-y pr-1 pb-16 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {renderSidebarContent(false)}
          </aside>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 2 (CENTER PANEL): Live Views, Shift Clock & Operations
              ══════════════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-6 space-y-4">
            {/* 4 Metric Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Attendance</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-serif font-extrabold text-foreground">{attendances.length}</span>
                  <span className="text-[10px] text-muted-foreground">days</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Leaves</span>
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-serif font-extrabold text-foreground">18</span>
                  <span className="text-[10px] text-muted-foreground">avail</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Expenses</span>
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-serif font-extrabold text-foreground">{expenseClaims.length}</span>
                  <span className="text-[10px] text-muted-foreground">filed</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Department</span>
                  <Building className="w-3.5 h-3.5 text-brand" />
                </div>
                <div className="mt-1">
                  <span className="text-xs font-bold text-foreground block truncate">{department}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">{designation}</span>
                </div>
              </div>
            </div>

            {/* ── TAB 1: ATTENDANCE & SHIFTS ── */}
            {activeTab === 'attendance' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">Production Attendance &amp; Shift Register</h3>
                    <p className="text-xs text-muted-foreground">Realtime GPS punch check-ins synced with studio operations</p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 font-bold">
                    GPS Active
                  </span>
                </div>

                {attendances.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="font-semibold text-foreground">No attendance records logged yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Use the Punch In button in the left panel to begin your work shift.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-border/70 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold">
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5">Check In</th>
                          <th className="px-4 py-2.5">Check Out</th>
                          <th className="px-4 py-2.5">Duration</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {attendances.map((att: any) => {
                          const inDate = new Date(att.checkInAt);
                          const outDate = att.checkOutAt ? new Date(att.checkOutAt) : null;
                          return (
                            <tr key={att.id} className="hover:bg-muted/15 transition-colors">
                              <td className="px-4 py-3 font-semibold text-foreground">
                                {inDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-4 py-3 font-mono text-foreground/90">
                                {inDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 font-mono text-foreground/90">
                                {outDate ? outDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-brand">
                                {att.durationMin ? `${Math.floor(att.durationMin / 60)}h ${att.durationMin % 60}m` : (outDate ? 'Completed' : 'Ongoing')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  outDate
                                    ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                    : 'bg-brand/10 text-brand border border-brand/30'
                                }`}>
                                  {outDate ? 'Completed' : 'Checked In'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: LEAVE REQUESTS ── */}
            {activeTab === 'leaves' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">Leave Requests &amp; Holidays</h3>
                    <p className="text-xs text-muted-foreground">Submit leaves for studio approval</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Request Leave</span>
                  </button>
                </div>

                {leaveRequests.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="font-semibold text-foreground">No leave applications filed</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Click &apos;Request Leave&apos; to apply for casual, sick or production off days.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {leaveRequests.map((lr: any) => (
                      <div key={lr.id} className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{lr.leaveType || 'Casual Leave'}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(lr.startDate).toLocaleDateString()} to {new Date(lr.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{lr.reason}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          lr.status === 'APPROVED' ? 'bg-brand/10 text-brand border border-brand/20' :
                          lr.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30' :
                          'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                        }`}>
                          {lr.status || 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: EXPENSE CLAIMS ── */}
            {activeTab === 'expenses' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">Production Expenses &amp; Petty Cash</h3>
                    <p className="text-xs text-muted-foreground">Claim travel, camera equipment rentals, and studio meal vouchers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit Claim</span>
                  </button>
                </div>

                {expenseClaims.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    <Receipt className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="font-semibold text-foreground">No expense claims filed yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Click &apos;Submit Claim&apos; to submit an invoice or receipt.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {expenseClaims.map((claim: any) => (
                      <div key={claim.id} className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">₹{((claim.amount || 0) / 100).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">• {claim.category}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{claim.description}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          claim.status === 'APPROVED' || claim.status === 'PAID' ? 'bg-brand/10 text-brand border border-brand/20' :
                          claim.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30' :
                          'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                        }`}>
                          {claim.status || 'SUBMITTED'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: STUDIO PROJECTS ── */}
            {activeTab === 'projects' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="border-b border-border/70 pb-3">
                  <h3 className="font-serif font-bold text-base text-foreground">Active Production Assignments</h3>
                  <p className="text-xs text-muted-foreground">Commercial line production, post-production color passes &amp; VFX</p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-600 border border-rose-500/30">
                        In Production
                      </span>
                      <span className="text-[11px] text-muted-foreground">Shoot Date: Next Monday</span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Commercial Shoot: Urban Fashion Campaign</h4>
                    <p className="text-muted-foreground text-[11px]">
                      Studio line production and cinematography setup for client brand commercial. Location: Mehboob Studio, Mumbai.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-muted-foreground border-t border-border/50">
                      <span>Department: Production</span>
                      <span className="text-brand font-bold cursor-pointer hover:underline">View Brief ↗</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand/10 text-brand border border-brand/20">
                        Post-Production
                      </span>
                      <span className="text-[11px] text-muted-foreground">Deadline: Friday</span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Documentary Color Grading &amp; Sound Mix</h4>
                    <p className="text-muted-foreground text-[11px]">
                      DaVinci Resolve Studio color pass and audio track leveling review for upcoming OTT release.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-muted-foreground border-t border-border/50">
                      <span>Role: Senior Producer</span>
                      <span className="text-brand font-bold cursor-pointer hover:underline">View Project ↗</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 5: DELEGATED ADMIN WORKSPACE (TALENT ROSTER) ── */}
            {activeTab === 'admin_talent' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Delegated Workspace: Talent Directory &amp; Roster</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to manage studio talent profiles, castings, and roster approvals.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=talents"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Full Admin View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Quick Talent Search &amp; Review</span>
                    <span className="text-[10px] text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full">Permission Granted</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search talent roster by category, name, or city..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 bg-card border border-border rounded-xl">
                      <p className="font-bold text-foreground">Actor &amp; Model Profiles</p>
                      <p className="text-[10px] text-muted-foreground">50+ approved creator profiles active</p>
                    </div>
                    <div className="p-3 bg-card border border-border rounded-xl">
                      <p className="font-bold text-foreground">Pending Submissions</p>
                      <p className="text-[10px] text-muted-foreground">4 new talent review applications</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 6: DELEGATED ADMIN WORKSPACE (BLOGS & EDITORIAL) ── */}
            {activeTab === 'admin_blogs' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Delegated Workspace: Blogs &amp; CMS Editorial</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to write, edit and schedule production news and stories.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=blogs"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Admin Blog Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Recent Blog Articles</span>
                    <span className="text-[10px] text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full">Editor Access</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">How We Shot the OTT Action Sequence in Mehboob Studio</p>
                        <p className="text-[10px] text-muted-foreground">Published • 1.2k reads</p>
                      </div>
                      <span className="text-xs text-brand font-bold">Edit Article ↗</span>
                    </div>
                    <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">Choosing the Best Lens Package for 4K Commercials</p>
                        <p className="text-[10px] text-muted-foreground">Draft • In review</p>
                      </div>
                      <span className="text-xs text-brand font-bold">Edit Draft ↗</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 7: DELEGATED ADMIN WORKSPACE (SERVICES & PACKAGES) ── */}
            {activeTab === 'admin_services' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <Building className="w-4 h-4 text-amber-500" />
                      <span>Delegated Workspace: Production Services &amp; Packages</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to adjust pricing cards and production deliverable specs.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=services"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Edit Services</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Active Studio Services</p>
                  <p className="text-muted-foreground">
                    Video Production, Sound Post-Production, DaVinci Color Grading, VFX &amp; CGI, YouTuber Studio Coaching.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB 8: DELEGATED ADMIN WORKSPACE (LEADS & CRM) ── */}
            {activeTab === 'admin_leads' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                      <span>Delegated Workspace: Inbound Leads &amp; Brand Inquiries</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to review new client production briefs and assign account managers.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=leads"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Full Leads CRM</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Recent Client Inquiries</p>
                  <p className="text-muted-foreground">
                    5 new inbound quote requests received this week for commercial production and music video shoots.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: DELEGATED WORKSPACE (BECOME A YOUTUBER) ── */}
            {activeTab === 'admin_youtuber' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>Delegated Workspace: Become a YouTuber Studio</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to manage YouTube creator coaching, course applications and studio packages.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=become-a-youtuber"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>YouTuber CMS</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">YouTuber Creator Applications</p>
                  <p className="text-muted-foreground">
                    Review incoming creator onboarding requests, video monetization packages, and 1-on-1 editing masterclasses.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: DELEGATED WORKSPACE (PROJECTS & PRODUCTION) ── */}
            {activeTab === 'admin_projects' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      <span>Delegated Workspace: Cinematic Portfolio &amp; Projects</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to oversee commercial shoots, brand music videos and project milestones.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=projects"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Projects CMS</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Active Production Pipeline</p>
                  <p className="text-muted-foreground">
                    Track production shoots, sound mix exports, and final color grade deliveries across active client projects.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: DELEGATED WORKSPACE (HOME PAGE CMS) ── */}
            {activeTab === 'admin_home_page' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <Home className="w-4 h-4 text-indigo-500" />
                      <span>Delegated Workspace: Home Page Showcase CMS</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to manage homepage banner announcements, hero showreels, and featured content.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=home-page"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Home Page CMS</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Main Website Visuals</p>
                  <p className="text-muted-foreground">
                    Update top marquee headlines, featured film showcases, and client credibility stats.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: DELEGATED WORKSPACE (FOOTER CMS) ── */}
            {activeTab === 'admin_footer_cms' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-cyan-500" />
                      <span>Delegated Workspace: Footer Details &amp; Social Links CMS</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to maintain studio contact details, office addresses, and social handles.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=footer-cms"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Footer CMS</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Footer Configuration</p>
                  <p className="text-muted-foreground">
                    Update studio contact email, Mumbai production hub address, and social channel URLs.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: DELEGATED WORKSPACE (SPONSORED & ADS) ── */}
            {activeTab === 'admin_sponsored' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <span>Delegated Workspace: Sponsored Ads &amp; Brand Partners</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to manage commercial brand sponsors, affiliate ad banners, and campaign links.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=sponsored"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Sponsored CMS</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Active Brand Partnerships</p>
                  <p className="text-muted-foreground">
                    Review and schedule sidebar partner creatives, conversion tracking, and campaign dates.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: DELEGATED WORKSPACE (CLIENTS) ── */}
            {activeTab === 'admin_clients' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <span>Delegated Workspace: Client Directory &amp; Brands</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to review brand client accounts and corporate contracts.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=clients"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Clients Directory</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Registered Brand Clients</p>
                  <p className="text-muted-foreground">
                    Manage active enterprise clients, production billing status, and project assignments.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: DELEGATED WORKSPACE (EMPLOYEES & CREW) ── */}
            {activeTab === 'admin_employees' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-brand" />
                      <span>Delegated Workspace: Employees &amp; Crew Roster</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Authorized by Admin to coordinate production crew schedules and shift rosters.
                    </p>
                  </div>
                  <Link
                    href="/super-admin?tab=employees"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline"
                  >
                    <span>Employees Roster</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-foreground">Production Operations Team</p>
                  <p className="text-muted-foreground">
                    Coordinate editing desks, audio dubbing suites, camera technicians, and field producers.
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 3 (RIGHT SIDEBAR): Shift Info, Announcements & Sponsor
              ══════════════════════════════════════════════════════════════════ */}
          <aside 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full lg:col-span-3 lg:sticky lg:top-[125px] self-start space-y-3 pb-16"
          >
            {/* Auto-Logout Idle Timeout Card */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${idleSecondsRemaining < 120 ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-amber-500/15 text-amber-500'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-foreground">Session Security</h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Limit: {permissions?.idleTimeoutMinutes || 30}m
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Auto-Logout Timer</span>
                  <span className={`font-mono font-bold ${idleSecondsRemaining < 120 ? 'text-rose-500 font-extrabold' : 'text-brand'}`}>
                    {formatIdleTime(idleSecondsRemaining)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      idleSecondsRemaining < 120 ? 'bg-rose-500' : 'bg-brand'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, (idleSecondsRemaining / totalIdleSecondsRef.current) * 100))}%`
                    }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Activity on keyboard/mouse continuously resets your session. Moving mouse resets timeout.
              </p>
            </div>

            {/* Studio Bulletin & Notice Board */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <Bell className="w-4 h-4 text-brand" />
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Studio Announcements</h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-muted/30 rounded-xl border border-border/60">
                  <p className="font-bold text-foreground text-[11px]">Studio Floor B Maintenance</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Floor B lighting grid is reserved for rigging from 8 PM tonight.
                  </p>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-xl border border-border/60">
                  <p className="font-bold text-foreground text-[11px]">New Sony FX6 Cinema Rig</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Available in equipment locker room #2 for certified camera crew.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Height Sponsored Partner Panel (Matching Talent Dashboard) */}
            <div className="min-h-[300px]">
              <SponsoredSidebarCard context="talent" showAdvertiseLink={true} className="h-full" />
            </div>
          </aside>

        </div>
      </div>

      {/* ── MODAL: REQUEST LEAVE ── */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Apply for Work Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                >
                  <option value="Casual">Casual Leave (1 day)</option>
                  <option value="Sick">Sick / Medical Leave</option>
                  <option value="Earned">Earned Vacation Leave</option>
                  <option value="CompOff">Compensatory Off (Weekend Shoot)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-foreground block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain brief reason for studio scheduling..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SUBMIT EXPENSE CLAIM ── */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">File Production Expense Claim</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1500"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                >
                  <option value="Production Travel">Production Travel (Cab / Fuel)</option>
                  <option value="Equipment Rental">Camera / Lens Equipment Rental</option>
                  <option value="Studio Food & Catering">Studio Crew Catering &amp; Meals</option>
                  <option value="Props & Wardrobe">Props, Wardrobe &amp; Makeup</option>
                  <option value="Hard Drives & Storage">Hard Drives &amp; Media Cards</option>
                  <option value="Miscellaneous">Miscellaneous Production Cost</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Description / Bill Memo</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mention shoot name, location, and invoice reference..."
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold"
                >
                  {isSubmitting ? 'Filing...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
