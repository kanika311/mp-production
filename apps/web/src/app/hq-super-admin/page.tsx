'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: 'super_admin' }),
      });

      if (res.status === 404) {
        res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, loginType: 'super_admin' }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Authentication failed');

      // Ensure the user actually has SUPER_ADMIN privileges
      const role = data.user?.role || data.data?.user?.role;
      const lowerRole = typeof role === 'string' ? role.toLowerCase() : '';

      if (lowerRole !== 'super_admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('mdms_auth_token');
        throw new Error('Access Denied. Strict Super Admin Privileges Required.');
      }

      const token = data?.token || data?.accessToken || data?.data?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('mdms_auth_token', token);
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `mdms_auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `next-auth.session-token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `mdms_auth_role=super_admin; path=/; max-age=604800; SameSite=Lax`;
      }

      window.location.href = '/studio-8f2k';
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Intense Red Glow for Super Admin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E50914]/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#060608] border border-[#E50914]/20 shadow-2xl relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-[#E50914] mb-4" />
          <span className="text-xl font-serif font-bold text-white tracking-wider">
            SYSTEM CORE
          </span>
          <p className="text-sm text-[#E50914] font-medium tracking-widest mt-2 uppercase">
            Super Admin Override
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#E50914]/20 border border-[#E50914] text-white text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Root Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-[#E50914] transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Root Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-black text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-[#E50914] transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-[#E50914] hover:bg-[#ff0f1b] text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 text-sm tracking-widest uppercase"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Initialize Core</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
