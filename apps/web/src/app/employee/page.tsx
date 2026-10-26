'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Lock, Mail, Users, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your staff email and password.');
      return;
    }

    setIsLoading(true);

    try {
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: 'employee' }),
      });

      if (res.status === 404) {
        res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, loginType: 'employee' }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Authentication failed. Please verify staff credentials.');
      }

      // Extract role
      const rawRole = (data.user?.role || data.data?.user?.role || '')
        .toString()
        .toLowerCase()
        .replace(/-/g, '_');

      // STRICT VALIDATION: Clients and Talents are NOT allowed here
      const allowedRoles = ['employee', 'editor', 'project_manager', 'admin', 'super_admin'];
      if (!allowedRoles.includes(rawRole)) {
        localStorage.removeItem('token');
        localStorage.removeItem('mdms_auth_token');
        throw new Error('Access Denied. This login portal is strictly reserved for internal employees & production crew.');
      }

      const token = data?.token || data?.accessToken || data?.data?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('mdms_auth_token', token);
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `mdms_auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `next-auth.session-token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `mdms_auth_role=${rawRole}; path=/; max-age=604800; SameSite=Lax`;
      }

      toast.success('Welcome back to the studio workspace.');

      // Role-specific workspace routing via hard navigation
      if (rawRole === 'editor') {
        window.location.href = '/editor-portal';
      } else if (rawRole === 'project_manager') {
        window.location.href = '/project-manager';
      } else if (rawRole === 'admin' || rawRole === 'super_admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/employee-portal';
      }
    } catch (err: any) {
      console.error('Employee Login Error:', err);
      setError(err.message || 'Authentication failed. Please verify employee credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-brand selection:text-white">
      {/* Studio Emerald/Cyan Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-80 h-80 bg-brand/8 blur-[130px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#12141a]/90 border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative z-10 backdrop-blur-2xl">
        
        {/* Header Strip */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>INTERNAL STAFF WORKSPACE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Employee & Crew Portal
          </h1>
          <p className="text-xs text-white/50 font-light max-w-xs mx-auto">
            Internal workspace for video editors, project managers, and production operations team.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive-foreground text-xs leading-relaxed flex items-start gap-2.5">
            <Users className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5 font-mono">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@mpproductions.com"
                required
                autoComplete="username"
                className="w-full bg-[#191b24] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500 text-sm transition-colors placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5 font-mono">
              Employee Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#191b24] text-white pl-10 pr-10 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500 text-sm transition-colors placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Staff Credentials...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Enter Staff Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-white/40 font-mono">
            For MP Production employees, editors, and project supervisors.
          </p>
        </div>

      </div>
    </div>
  );
}
