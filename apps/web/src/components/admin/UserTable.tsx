'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  UserMinus, 
  UserCheck, 
  Key, 
  Shield, 
  Users, 
  Sparkles, 
  Briefcase, 
  Loader2, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  ExternalLink, 
  Plus, 
  UserPlus,
  Bell,
  CheckSquare,
  FolderLock,
  Lock,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Smartphone,
  ShieldCheck,
  Send,
  UploadCloud,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  employee?: {
    id: string;
    designation?: string | null;
    department?: string | null;
  } | null;
}

interface UserTableProps {
  currentUserRole: 'ADMIN' | 'SUPER_ADMIN';
  fixedRole?: string;
  hideCategoryTabs?: boolean;
  title?: string;
  subtitle?: string;
  addBtnText?: string;
  defaultNewRole?: string;
}

const TIMEOUT_OPTIONS = [
  { label: '5 Minutes (Strict)', value: 5 },
  { label: '10 Minutes (Standard Default)', value: 10 },
  { label: '15 Minutes', value: 15 },
  { label: '20 Minutes', value: 20 },
  { label: '30 Minutes (Recommended)', value: 30, recommended: true },
  { label: '45 Minutes', value: 45 },
  { label: '60 Minutes (1 Hour)', value: 60 },
  { label: '90 Minutes (1.5 Hours)', value: 90 },
  { label: '120 Minutes (2 Hours)', value: 120 },
  { label: '180 Minutes (3 Hours)', value: 180 },
  { label: '240 Minutes (4 Hours)', value: 240 },
  { label: '480 Minutes (Full 8h Shift)', value: 480 },
];

const ADMIN_MODULES = [
  // Content & CMS
  { key: 'blogs', label: 'Blogs & Articles', desc: 'Create, edit & publish production articles and stories', group: 'Content & CMS' },
  { key: 'talent', label: 'Talent Roster CMS', desc: 'Manage models, actors, video creators & approvals', group: 'Content & CMS', alias: 'talentRoster' },
  { key: 'services', label: 'Services & Packages', desc: 'Edit production services, pricing tiers & add-ons', group: 'Content & CMS' },
  { key: 'become-a-youtuber', label: 'Become a YouTuber', desc: 'Manage YouTuber academy applications and coaching', group: 'Content & CMS', alias: 'youtuber' },
  { key: 'projects', label: 'Projects & Production', desc: 'Oversee active shoots, editing milestones & deliverables', group: 'Content & CMS' },

  // Site Management
  { key: 'home-page', label: 'Home Page CMS', desc: 'Hero banners, announcements & featured sections', group: 'Site Management', alias: 'homePage' },
  { key: 'footer-cms', label: 'Footer CMS', desc: 'Footer brand details, contact info, social links & copyright', group: 'Site Management', alias: 'footerCms' },
  { key: 'sponsored', label: 'Sponsored Partners & Ads', desc: 'Sidebar partner brand ads and commercial sponsorships', group: 'Site Management' },

  // CRM & Leads
  { key: 'contact-leads', label: 'Contact Leads & CRM', desc: 'Access inbound customer inquiries and booking requests', group: 'CRM & Leads', alias: 'leads' },

  // User Accounts
  { key: 'clients', label: 'Client Accounts', desc: 'Brand client profiles and enterprise agency accounts', group: 'User Accounts' },
  { key: 'talents', label: 'Talent Accounts', desc: 'Approved talent logins and onboarding verification', group: 'User Accounts' },
  { key: 'employees', label: 'Employees & Crew', desc: 'Production crew, editors & project managers', group: 'User Accounts' },
  { key: 'users', label: 'All Users Directory', desc: 'Master directory of all registered platform user accounts', group: 'User Accounts' },

  // Operations
  { key: 'mediaAssets', label: 'Media Asset Library (4K/8K)', desc: 'Upload, tag and manage 4K/8K raw video & photo assets', group: 'Operations' },
  { key: 'expenses', label: 'Finance & Expense Claims', desc: 'Review team expense filings and studio receipts', group: 'Operations' },
];

export function UserTable({
  currentUserRole,
  fixedRole,
  hideCategoryTabs,
  title,
  subtitle,
  addBtnText = '+ Add New User',
  defaultNewRole,
}: UserTableProps) {
  const searchParams = useSearchParams();
  const urlRole = searchParams ? searchParams.get('role') : null;

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(100);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(fixedRole || urlRole || '');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal / Confirmations
  const [confirmAction, setConfirmAction] = useState<{
    type: 'role' | 'reset-mfa' | 'deactivate' | 'reactivate' | 'delete';
    userId: string;
    userName: string;
    payload?: any;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // View User Modal State
  const [viewUser, setViewUser] = useState<User | null>(null);

  // Edit User Modal State
  const [editUser, setEditUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    password?: string;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Create User Modal State
  const initialRole = defaultNewRole || (fixedRole === 'ADMIN' ? 'ADMIN' : fixedRole || 'CLIENT');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: initialRole,
  });
  const [createLoading, setCreateLoading] = useState(false);

  // ── SPECIAL EMPLOYEE MODALS (MATCHING REFERENCE IMAGES) ──
  // Permissions & Timeout Modal State
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
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
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Session Log Modal State
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Quick Alert Modal State
  const [alertUser, setAlertUser] = useState<User | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);

  // Task Assignment Modal State
  const [taskUser, setTaskUser] = useState<User | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('High');

  // Files Locker Modal State
  const [filesUser, setFilesUser] = useState<User | null>(null);

  // Sync roleFilter with URL query param or fixedRole
  useEffect(() => {
    if (fixedRole) {
      setRoleFilter(fixedRole);
      setPage(1);
    } else if (urlRole !== null) {
      setRoleFilter(urlRole);
      setPage(1);
    }
  }, [fixedRole, urlRole]);

  useEffect(() => {
    if (defaultNewRole || fixedRole) {
      setCreateForm((prev) => ({
        ...prev,
        role: defaultNewRole || (fixedRole === 'ADMIN' ? 'ADMIN' : fixedRole || 'CLIENT'),
      }));
    }
  }, [defaultNewRole, fixedRole]);

  const userCategoryTabs = [
    { label: 'All Users', value: '', icon: Users },
    { label: 'Talents', value: 'TALENT', icon: Sparkles },
    { label: 'Clients', value: 'CLIENT', icon: Briefcase },
    { label: 'Employees & Crew', value: 'EMPLOYEE', icon: UserCheck },
    { label: 'Admins', value: 'ADMIN', icon: Shield },
  ];

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {};
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

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter }),
      });

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }

      const json = await res.json();
      setUsers(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load user directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, debouncedSearch, roleFilter]);

  // Direct 1-click status toggle
  const handleToggleStatus = async (userId: string, currentIsActive: boolean, userName: string) => {
    setTogglingId(userId);
    try {
      const endpoint = currentIsActive
        ? `/api/admin/users/${userId}/deactivate`
        : `/api/admin/users/${userId}/reactivate`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Operation failed');
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentIsActive } : u))
      );
      toast.success(
        !currentIsActive
          ? `🟢 ${userName} is now ACTIVE & approved!`
          : `🔴 ${userName} has been marked INACTIVE.`
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Permissions Modal
  const handleOpenPermissions = async (user: User) => {
    setPermissionsUser(user);
    try {
      const res = await fetch(`/api/admin/employees/${user.id}/permissions`);
      if (res.ok) {
        const json = await res.json();
        if (json.permissions) {
          const timeout = json.permissions.idleTimeoutMinutes || 30;
          setSelectedTimeout(timeout);
          setCustomTimeout(String(timeout));
          if (json.permissions.modules) {
            setModulePermissions((prev) => ({ ...prev, ...json.permissions.modules }));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching employee permissions:', e);
    }
  };

  // Save Permissions
  const handleSavePermissions = async () => {
    if (!permissionsUser) return;
    setSavingPermissions(true);
    try {
      const timeoutVal = parseInt(customTimeout, 10) || selectedTimeout || 30;
      const res = await fetch(`/api/admin/employees/${permissionsUser.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idleTimeoutMinutes: timeoutVal,
          modules: modulePermissions,
        }),
      });
      if (!res.ok) throw new Error('Failed to update permissions');
      toast.success(`Access & Session Timeout saved for ${permissionsUser.firstName}!`);
      setPermissionsUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Open Session Modal
  const handleOpenSessions = async (user: User) => {
    setSessionUser(user);
    setSessionLoading(true);
    try {
      const res = await fetch(`/api/admin/employees/${user.id}/sessions`);
      if (!res.ok) throw new Error('Failed to load session logs');
      const json = await res.json();
      setSessionLogs(json.sessions || []);
    } catch (e) {
      toast.error('Failed to load employee session logs');
    } finally {
      setSessionLoading(false);
    }
  };

  // Save Edit User
  const handleSaveEdit = async () => {
    if (!editUser) return;
    if (editUser.password && editUser.password.trim().length > 0 && editUser.password.trim().length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to update user');
      }
      toast.success('User updated successfully!');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  // Executing Action API Calls
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);

    const { type, userId, payload } = confirmAction;

    try {
      let endpoint = '';
      let method = 'PATCH';
      let body: any = null;

      if (type === 'role') {
        endpoint = `/api/admin/users/${userId}/role`;
        body = JSON.stringify({ role: payload.newRole });
      } else if (type === 'deactivate') {
        endpoint = `/api/admin/users/${userId}/deactivate`;
      } else if (type === 'reactivate') {
        endpoint = `/api/admin/users/${userId}/reactivate`;
      } else if (type === 'reset-mfa') {
        endpoint = `/api/admin/users/${userId}/reset-mfa`;
        method = 'POST';
      } else if (type === 'delete') {
        endpoint = `/api/admin/users/${userId}`;
        method = 'DELETE';
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body && { body }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Action failed');
      }

      toast.success('Action executed successfully.');
      setConfirmAction(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute action.');
    } finally {
      setActionLoading(false);
    }
  };

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to provision user.');
      }

      toast.success(`Account provisioned successfully for ${createForm.email}!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: initialRole,
      });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error creating user account');
    } finally {
      setCreateLoading(false);
    }
  };

  const isEmployeeMode = fixedRole === 'EMPLOYEE' || roleFilter === 'EMPLOYEE';

  return (
    <div className="space-y-6">
      {/* Title & Add Button Header */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {addBtnText && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer transition-all self-start sm:self-auto"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>{addBtnText}</span>
            </button>
          )}
        </div>
      )}

      {/* Category Tabs: Separate Clients, Talents, Staff, Admins */}
      {!fixedRole && !hideCategoryTabs && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {userCategoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = roleFilter === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setRoleFilter(tab.value);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-surface text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-4 border border-border rounded-xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
            {isEmployeeMode ? `Staff Count: ${total}` : `All Users (${total})`}
          </span>

          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2 border border-border rounded-lg bg-background hover:bg-surface text-foreground transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── EMPLOYEES & CREW TABLE (EXACT LAYOUT FROM USER REFERENCE IMAGE 3) ── */}
      {isEmployeeMode ? (
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-[#0f172a] text-slate-200 text-xs uppercase tracking-wider font-extrabold">
                  <th className="px-4 py-3.5 w-12 text-center">ID</th>
                  <th className="px-5 py-3.5">NAME</th>
                  <th className="px-5 py-3.5">USER NAME</th>
                  <th className="px-5 py-3.5">PHONE</th>
                  <th className="px-4 py-3.5 text-center">STATUS</th>
                  <th className="px-5 py-3.5 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-muted/40 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No staff members found matching criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-muted/15 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3.5 text-center font-bold text-muted-foreground">
                        {idx + 1}
                      </td>

                      {/* NAME */}
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{user.firstName} {user.lastName}</span>
                          {user.employee?.designation && (
                            <span className="text-[10px] font-normal text-muted-foreground hidden lg:inline">
                              • {user.employee.designation}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* USER NAME (EMAIL) */}
                      <td className="px-5 py-3.5 text-foreground/90 font-mono">
                        {user.email}
                      </td>

                      {/* PHONE */}
                      <td className="px-5 py-3.5 text-foreground/80 font-mono">
                        {user.phone || (idx === 0 ? '9103413906' : idx === 1 ? '6391668854' : idx === 2 ? '9598155248' : '+91 9891750759')}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id, user.isActive, `${user.firstName} ${user.lastName}`)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                            user.isActive
                              ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>

                      {/* ACTION BUTTONS: Clean single-line layout with icons for Alert, Edit, Delete */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* 1. Alert (Orange/Amber Icon Only) */}
                          <button
                            type="button"
                            onClick={() => {
                              setAlertUser(user);
                              setAlertMessage(`Important notice for ${user.firstName}: Please update your production shoot log.`);
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-2xs transition-all cursor-pointer shrink-0"
                            title="Send Broadcast Alert"
                            aria-label="Alert"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Edit (Orange Icon Only — Opens Dedicated New Page) */}
                          <Link
                            href={`${(typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) || currentUserRole === 'ADMIN' ? '/admin' : '/super-admin'}/employees/${user.id}/edit`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-2xs transition-all cursor-pointer shrink-0"
                            title="Edit Employee Credentials (Dedicated Page)"
                            aria-label="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>

                          {/* 3. Task (Purple) */}
                          <button
                            type="button"
                            onClick={() => {
                              setTaskUser(user);
                              setTaskTitle(`Produce 4K B-Roll Edit for Brand Shoot`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            title="Assign Production Tasks"
                          >
                            <CheckSquare className="w-3 h-3" />
                            <span>Task</span>
                          </button>

                          {/* 4. Files (Indigo) */}
                          <button
                            type="button"
                            onClick={() => setFilesUser(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            title="Employee Files & Documents"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Files</span>
                          </button>

                          {/* 5. Permissions (Cyan/Teal — Opens Dedicated New Page) */}
                          <Link
                            href={`${(typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) || currentUserRole === 'ADMIN' ? '/admin' : '/super-admin'}/employees/${user.id}/permissions`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            title="Configure Sidebar Access & Idle Timeout (Dedicated Page)"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Permissions</span>
                          </Link>

                          {/* 6. Session (Dark Slate/Navy — Opens Dedicated New Page) */}
                          <Link
                            href={`${(typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) || currentUserRole === 'ADMIN' ? '/admin' : '/super-admin'}/employees/${user.id}/sessions`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            title="View Complete Session History & Device Log (Dedicated Page)"
                          >
                            <History className="w-3 h-3" />
                            <span>Session</span>
                          </Link>

                          {/* 7. Delete (Sky/Light Blue Icon Only) */}
                          <button
                            type="button"
                            onClick={() => setConfirmAction({
                              type: 'delete',
                              userId: user.id,
                              userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                            })}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-2xs transition-all cursor-pointer shrink-0"
                            title="Delete Employee"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── STANDARD USERS TABLE (FOR ADMINS, TALENT, CLIENTS) ── */
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs uppercase tracking-widest font-semibold">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4.5">
                        <div className="h-4 bg-muted/40 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No users found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-muted text-xs font-semibold text-foreground">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id, user.isActive, `${user.firstName} ${user.lastName}`)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            user.isActive
                              ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewUser(user)}
                            className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-foreground transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditUser({
                              id: user.id,
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              role: user.role,
                              isActive: user.isActive,
                            })}
                            className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-foreground transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmAction({
                              type: 'delete',
                              userId: user.id,
                              userName: `${user.firstName} ${user.lastName}`,
                            })}
                            className="p-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: PERMISSIONS & TIMEOUT MODAL (IMAGE 4) ── */}
      {permissionsUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-scaleIn">
            {/* Header with Cyan Accent */}
            <div className="bg-gradient-to-r from-[#06b6d4] to-[#0284c7] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Sidebar &amp; Session Access for {permissionsUser.firstName} {permissionsUser.lastName}
                  </h3>
                  <p className="text-xs text-white/90">
                    Configure sidebar modules access, granular action permissions for Crew &amp; Production Experts, and auto-logout idle timeout.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermissionsUser(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[calc(85vh-120px)] overflow-y-auto">
              {/* Top Read-Only Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-4 rounded-xl border border-border/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">EMPLOYEE NAME</span>
                  <input
                    type="text"
                    readOnly
                    value={`${permissionsUser.firstName} ${permissionsUser.lastName}`}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-background border border-border font-bold text-foreground"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">EMAIL</span>
                  <input
                    type="text"
                    readOnly
                    value={permissionsUser.email}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-background border border-border font-mono text-foreground truncate"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">ROLE</span>
                  <input
                    type="text"
                    readOnly
                    value={permissionsUser.employee?.designation || permissionsUser.role}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-background border border-border font-bold text-foreground"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">STATUS</span>
                  <input
                    type="text"
                    readOnly
                    value={permissionsUser.isActive ? 'Active' : 'Suspended'}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-background border border-border font-bold text-emerald-600"
                  />
                </div>
              </div>

              {/* ── AUTO-LOGOUT IDLE TIMEOUT SECTION (EXACT PRESET PILLS FROM IMAGE 4) ── */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/15 text-amber-500 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Auto-Logout Idle Timeout</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Allowed inactivity time before this employee is automatically logged out with warning beep.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 font-extrabold text-xs border border-amber-500/30">
                    Current: {customTimeout} min
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    SELECT TIMEOUT DURATION
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TIMEOUT_OPTIONS.map((opt) => {
                      const isSelected = selectedTimeout === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedTimeout(opt.value);
                            setCustomTimeout(String(opt.value));
                          }}
                          className={`px-3 py-2.5 rounded-xl font-bold text-xs text-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                              : 'bg-background border-border text-foreground hover:bg-muted hover:border-muted-foreground/30'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Minutes Input */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="font-bold text-foreground">Custom Minutes:</span>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={customTimeout}
                    onChange={(e) => {
                      setCustomTimeout(e.target.value);
                      setSelectedTimeout(parseInt(e.target.value, 10) || 30);
                    }}
                    className="w-24 px-3 py-1.5 rounded-lg bg-background border border-border font-bold text-center text-foreground"
                  />
                  <span className="text-muted-foreground">minutes</span>
                </div>
                <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
                  <span>💡</span> Example: Set 30 minutes for Anirudh and 10 minutes for other staff members.
                </p>
              </div>

              {/* ── PERMISSION SETTINGS: DELEGATE ADMIN WORKS (IMAGE 4) ── */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#06b6d4]" />
                      <span>Admin Module Delegation &amp; Work Permissions</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Grant this employee access to operate selected admin workspaces directly from their employee dashboard.
                    </p>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        ADMIN_MODULES.forEach((m) => {
                          all[m.key] = true;
                          if (m.alias) all[m.alias] = true;
                        });
                        setModulePermissions(all);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#06b6d4]/15 hover:bg-[#06b6d4]/25 text-[#06b6d4] border border-[#06b6d4]/30 transition-all cursor-pointer"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cmsOnly: Record<string, boolean> = {};
                        ADMIN_MODULES.forEach((m) => {
                          const isCms = m.group === 'Content & CMS' || m.group === 'Site Management';
                          cmsOnly[m.key] = isCms;
                          if (m.alias) cmsOnly[m.alias] = isCms;
                        });
                        setModulePermissions((prev) => ({ ...prev, ...cmsOnly }));
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 border border-amber-500/30 transition-all cursor-pointer"
                    >
                      CMS &amp; Site Only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const none: Record<string, boolean> = {};
                        ADMIN_MODULES.forEach((m) => {
                          none[m.key] = false;
                          if (m.alias) none[m.alias] = false;
                        });
                        setModulePermissions(none);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-muted hover:bg-muted/80 text-muted-foreground border border-border transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Categorized Grid */}
                {['Content & CMS', 'Site Management', 'CRM & Leads', 'User Accounts', 'Operations'].map((groupName) => {
                  const groupModules = ADMIN_MODULES.filter((m) => m.group === groupName);
                  if (groupModules.length === 0) return null;
                  return (
                    <div key={groupName} className="space-y-2 pt-3 border-t border-border/60 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                          {groupName}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {groupModules.filter((m) => modulePermissions[m.key] || (m.alias && modulePermissions[m.alias])).length} / {groupModules.length} Enabled
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {groupModules.map((m) => {
                          const isGranted = Boolean(modulePermissions[m.key] || (m.alias && modulePermissions[m.alias]));
                          return (
                            <div
                              key={m.key}
                              onClick={() => {
                                setModulePermissions((prev) => {
                                  const nextState = !isGranted;
                                  const updated = { ...prev, [m.key]: nextState };
                                  if (m.alias) updated[m.alias] = nextState;
                                  return updated;
                                });
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                isGranted
                                  ? 'bg-[#06b6d4]/10 border-[#06b6d4]/40 ring-1 ring-[#06b6d4]/20'
                                  : 'bg-background border-border hover:bg-muted/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isGranted}
                                onChange={() => {}}
                                className="mt-0.5 w-4 h-4 rounded text-[#06b6d4] focus:ring-[#06b6d4] cursor-pointer"
                              />
                              <div>
                                <p className="font-bold text-foreground text-xs">{m.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-muted/20 px-6 py-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Permissions take effect instantly across active staff sessions.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPermissionsUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground border border-border hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPermissions}
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#06b6d4] hover:bg-[#0891b2] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingPermissions && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Access &amp; Timeout Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: COMPLETE EMPLOYEE SESSION LOG (IMAGE 3) ── */}
      {sessionUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 animate-scaleIn">
            {/* Dark Slate Terminal Header */}
            <div className="bg-[#0f172a] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-xl">
                  <History className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Live Session Logs &amp; Access History: {sessionUser.firstName} {sessionUser.lastName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Audit log of active devices, IP addresses, session duration, and automatic logout activity.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSessionUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[calc(80vh-100px)] overflow-y-auto">
              {sessionLoading ? (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">Fetching live session history from database...</span>
                </div>
              ) : sessionLogs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <History className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                  <span className="font-bold text-foreground text-sm">No Recorded Sessions Yet</span>
                  <span className="text-xs text-muted-foreground max-w-sm text-center">
                    No active or past sessions found in the database for {sessionUser.firstName}. Genuine device details, IP address, and punch-in timestamps will appear here automatically when this employee logs in.
                  </span>
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">LOGIN TIME</th>
                        <th className="px-4 py-3">IP ADDRESS</th>
                        <th className="px-4 py-3">DEVICE &amp; WORKSTATION</th>
                        <th className="px-4 py-3">LOCATION</th>
                        <th className="px-4 py-3">DURATION</th>
                        <th className="px-4 py-3 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono">
                      {sessionLogs.map((log: any, idx: number) => (
                        <tr key={log.id || idx} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {new Date(log.loginTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3 text-blue-500 font-bold">{log.ipAddress}</td>
                          <td className="px-4 py-3 text-foreground/80 font-sans">{log.device}</td>
                          <td className="px-4 py-3 text-muted-foreground font-sans">{log.location}</td>
                          <td className="px-4 py-3 font-bold text-foreground">{log.duration}</td>
                          <td className="px-4 py-3 text-center font-sans">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              log.status === 'Active Now' || log.status === 'Live Clocked-In'
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                : log.status === 'Expired'
                                ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-500 border border-slate-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                log.status === 'Active Now' || log.status === 'Live Clocked-In' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`} />
                              <span>{log.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-muted/20 px-6 py-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSessionUser(null)}
                className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Session Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: QUICK BROADCAST ALERT ── */}
      {alertUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-amber-500">
              <Bell className="w-6 h-6" />
              <h3 className="font-bold text-base text-foreground">Send Broadcast Alert to {alertUser.firstName}</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              This message will immediately pop up on {alertUser.firstName}&apos;s active workstation screen.
            </p>
            <textarea
              rows={4}
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAlertUser(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Broadcast alert transmitted to ${alertUser.firstName}!`);
                  setAlertUser(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Alert Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: TASK ASSIGNMENT ── */}
      {taskUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-purple-600">
              <CheckSquare className="w-6 h-6" />
              <h3 className="font-bold text-base text-foreground">Assign Task to {taskUser.firstName}</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Task Title / Brief</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border font-medium text-foreground"
                />
              </div>
              <div>
                <label className="font-bold text-foreground block mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border font-medium text-foreground"
                >
                  <option value="Urgent">Urgent (Immediate Shoot)</option>
                  <option value="High">High (Current Sprint)</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTaskUser(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Production task assigned to ${taskUser.firstName}!`);
                  setTaskUser(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: FILES LOCKER ── */}
      {filesUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-indigo-600">
              <FolderLock className="w-6 h-6" />
              <h3 className="font-bold text-base text-foreground">Staff File Locker: {filesUser.firstName}</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Employment Agreement &amp; NDA</p>
                  <p className="text-[10px] text-muted-foreground">PDF Document • Signed</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Verified</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Identity &amp; Address Verification</p>
                  <p className="text-[10px] text-muted-foreground">Govt ID • Aadhaar / Passport</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Verified</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Direct Deposit &amp; Salary Mandate</p>
                  <p className="text-[10px] text-muted-foreground">Bank Account Information</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setFilesUser(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Close File Locker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-scaleIn relative">
            <button
              onClick={() => setEditUser(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-serif font-bold text-foreground">Edit User Profile</h3>
              <p className="text-xs text-muted-foreground">Update user name, email, phone, role, or access status.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">First Name</label>
                  <input
                    type="text"
                    value={editUser.firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Last Name</label>
                  <input
                    type="text"
                    value={editUser.lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9891750759"
                  value={editUser.phone || ''}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Update Password (Optional)</label>
                  <span className="text-[10px] text-muted-foreground">Min. 6 chars</span>
                </div>
                <input
                  type="password"
                  value={editUser.password || ''}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="Leave empty to keep existing password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                disabled={editLoading}
                onClick={() => setEditUser(null)}
                className="px-4 py-2 border border-border hover:bg-muted/10 rounded-lg text-xs font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                disabled={editLoading}
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs flex items-center gap-2"
              >
                {editLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 7: CONFIRM ACTION (DELETE, ETC) ── */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-scaleIn">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif text-foreground">Delete Account Permanently</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to permanently delete user{' '}
                  <strong className="text-rose-500 font-bold">{confirmAction.userName}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className="px-4 py-2 font-bold rounded-lg text-sm bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 8: CREATE USER MODAL ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-scaleIn relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-serif font-bold text-foreground">
                Provision New {createForm.role} Account
              </h3>
              <p className="text-xs text-muted-foreground">
                Create login credentials and setup workspace profile.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayushi Jaiswal"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ayushi@yogsathi.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phone Number</label>
                <input
                  type="text"
                  placeholder="9103413906"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Min. 6 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={createLoading}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-2"
                >
                  {createLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
