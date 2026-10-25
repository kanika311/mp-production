'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Building, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeEditPageProps {
  userId: string;
  basePath?: string; // '/super-admin' or '/admin'
}

export function EmployeeEditPage({ userId, basePath = '/super-admin' }: EmployeeEditPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    designation: '',
    department: '',
    isActive: true,
    password: '',
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
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to load employee details');
        const json = await res.json();
        const u = json.data;
        if (u) {
          setForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phone: u.phone || '',
            role: u.role || 'EMPLOYEE',
            designation: u.employee?.designation || '',
            department: u.employee?.department || '',
            isActive: u.isActive !== undefined ? u.isActive : true,
            password: '',
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Error loading employee');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) {
      toast.error('First name is required.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email address is required.');
      return;
    }
    if (form.password && form.password.trim().length > 0 && form.password.trim().length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        isActive: form.isActive,
      };

      if (form.password && form.password.trim().length >= 6) {
        payload.password = form.password.trim();
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to update employee profile');
      }

      toast.success('Employee credentials & profile updated successfully!');
      router.push(`${basePath}?tab=employees`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update employee profile');
    } finally {
      setSaving(false);
    }
  };

  const backUrl = `${basePath}?tab=employees`;

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm font-semibold text-muted-foreground">Loading employee profile...</p>
      </div>
    );
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || form.email;

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
              <span className="text-foreground font-semibold">Edit Employee Profile</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight mt-0.5">
              Edit {fullName}
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
            type="submit"
            form="edit-employee-form"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* ── Employee Identity Summary Bar ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {form.firstName ? form.firstName.charAt(0).toUpperCase() : 'E'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                form.isActive ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {form.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{form.email}</p>
          </div>
        </div>

        {/* Quick Tabs to Permissions & Session pages */}
        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}/employees/${userId}/permissions`}
            className="px-3 py-1.5 rounded-xl border border-[#06b6d4]/40 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] text-xs font-bold transition-all"
          >
            Access &amp; Permissions →
          </Link>
          <Link
            href={`${basePath}/employees/${userId}/sessions`}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            Session History →
          </Link>
        </div>
      </div>

      {/* ── Main Edit Form ── */}
      <form id="edit-employee-form" onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">General Credentials &amp; Bio</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Update staff personal details, registered email address and contact numbers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>First Name *</span>
            </label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 text-xs font-medium text-foreground outline-none transition-all"
              placeholder="e.g. Neelam"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Last Name</span>
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 text-xs font-medium text-foreground outline-none transition-all"
              placeholder="e.g. Verma"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Email Address (Login Username) *</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 text-xs font-mono text-foreground outline-none transition-all"
              placeholder="neelam@mpproduction.com"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 text-xs font-mono text-foreground outline-none transition-all"
              placeholder="+91 9103413906"
            />
          </div>

          {/* Assigned System Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span>System Role &amp; Access Group</span>
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 text-xs font-bold text-foreground outline-none transition-all cursor-pointer"
            >
              <option value="EMPLOYEE">EMPLOYEE (Standard Staff Portal)</option>
              <option value="EDITOR">EDITOR (Post-Production &amp; Media Vault)</option>
              <option value="PROJECT_MANAGER">PROJECT_MANAGER (Studio Operations)</option>
              <option value="ADMIN">ADMIN (Full Platform Management)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Owner &amp; Root Privileges)</option>
            </select>
          </div>

          {/* Account Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Account Status</span>
            </label>
            <select
              value={form.isActive ? 'active' : 'inactive'}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 text-xs font-bold text-foreground outline-none transition-all cursor-pointer"
            >
              <option value="active">Active &amp; Approved (Login Allowed)</option>
              <option value="inactive">Suspended / Deactivated (Access Blocked)</option>
            </select>
          </div>
        </div>

        {/* ── Password Reset Section ── */}
        <div className="pt-4 border-t border-border space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Change Password (Optional)</span>
            </h4>
            <p className="text-[11px] text-muted-foreground">Leave this field blank to keep the existing employee password intact.</p>
          </div>

          <div className="relative max-w-md">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pr-10 px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 text-xs text-foreground outline-none transition-all"
              placeholder="Enter at least 6 characters to set new password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Link
            href={backUrl}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            Cancel &amp; Go Back
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
