'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Lock, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminLoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Authentication failed');

      // Ensure the user actually has admin privileges
      const role = data.user?.role;
      const lowerRole = typeof role === 'string' ? role.toLowerCase() : '';

      if (lowerRole !== 'admin' && lowerRole !== 'super_admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('mdms_auth_token');
        throw new Error('Access Denied. You do not have administrative privileges.');
      }

      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('mdms_auth_token', data.token);
      }

      router.push('/studio-8f2k/mgmt');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <span className="text-xl font-serif font-bold text-brand tracking-wider">
            ADMIN PORTAL
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            Secure HQ Access
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Secure Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-brand transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-background text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-brand transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-brand hover:brightness-110 text-white font-semibold py-3 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
