'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Lock, Mail, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function SushantAdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState('');

  // If already authenticated as admin or super_admin, redirect into dashboard
  useEffect(() => {
    setIsCheckingSession(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide email and admin password.');
      return;
    }

    setIsLoading(true);

    try {
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 404) {
        res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Authentication failed. Please verify credentials.');
      }

      // Extract role
      const rawRole = (data.user?.role || data.data?.user?.role || '')
        .toString()
        .toLowerCase()
        .replace(/-/g, '_');

      // STRICT VALIDATION: ONLY admin or super_admin are permitted
      if (rawRole !== 'admin' && rawRole !== 'super_admin') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('mdms_auth_token');
        }
        throw new Error('Access Denied. You do not have administrator privileges to enter this portal.');
      }

      const token = data?.token || data?.accessToken || data?.data?.accessToken;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('mdms_auth_token', token);
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `mdms_auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `next-auth.session-token=${token}; path=/; max-age=604800; SameSite=Lax`;
      }

      toast.success('Administrator authenticated.');

      // Redirect to Admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#09090c] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-mono text-white/50 tracking-wider">VERIFYING ADMIN SESSION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090c] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-brand selection:text-white">
      {/* Studio Amber/Brand Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand/12 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/8 blur-[130px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#111116]/90 border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative z-10 backdrop-blur-2xl">
        
        {/* Header Strip */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>OPERATIONAL MANAGEMENT</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Sushant Admin Portal
          </h1>
          <p className="text-xs text-white/50 font-light max-w-xs mx-auto">
            Agency operations, talent moderation, casting workflows, and client campaign controls.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive-foreground text-xs leading-relaxed flex items-start gap-2.5">
            <Shield className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5 font-mono">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mpproductions.com"
                required
                autoComplete="username"
                className="w-full bg-[#181820] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-brand text-sm transition-colors placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5 font-mono">
              Password
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
                className="w-full bg-[#181820] text-white pl-10 pr-10 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-brand text-sm transition-colors placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In as Admin</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-white/40 font-mono">
            Authorized MP Production operations staff only.
          </p>
        </div>

      </div>
    </div>
  );
}
