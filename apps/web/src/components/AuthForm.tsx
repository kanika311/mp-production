'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Lock, Mail, User, Shield } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error') || params.get('error_description');
      if (urlError) {
        setError(decodeURIComponent(urlError));
      }
    }
  }, []);

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setError('');
    window.location.href = '/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || (!isLogin && !password)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (!isLogin) {
        // 1. Internal Registration API
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email,
            password,
            role: 'client',
          }),
        });

        const registerData = await registerRes.json().catch(() => ({}));
        if (!registerRes.ok) {
          throw new Error(registerData.message || registerData.error || 'Registration failed');
        }

        if (registerData.token) {
          localStorage.setItem('token', registerData.token);
          localStorage.setItem('mdms_auth_token', registerData.token);
        }

        // After successful registration, clients land on their portal
        router.push('/client-portal');
      } else {
        // Try primary Next.js login API
        let loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, loginType: 'public' }),
        });

        // Fallback to NestJS API (/api/v1/auth/login) if reverse proxy routes /api to NestJS (giving 404)
        if (loginRes.status === 404) {
          loginRes = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, loginType: 'public' }),
          });
        }

        const loginData = await loginRes.json().catch(() => ({}));
        if (!loginRes.ok) {
          throw new Error(loginData.error || loginData.message || 'Login failed');
        }

        const userObj = loginData?.user || loginData?.data?.user;
        const token = loginData?.token || loginData?.access_token || loginData?.data?.token || loginData?.data?.access_token;
        const role = (userObj?.role || '').toString().toLowerCase().replace(/-/g, '_');

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('mdms_auth_token', token);
          // Set cookies for middleware and session guards
          document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `mdms_auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `next-auth.session-token=${token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `mdms_auth_role=${role || 'client'}; path=/; max-age=604800; SameSite=Lax`;
        }

        // Redirect user directly to their appropriate portal based on role
        if (role === 'super_admin') {
          window.location.href = '/super-admin';
        } else if (role === 'admin') {
          window.location.href = '/admin';
        } else if (role === 'employee') {
          window.location.href = '/employee-portal';
        } else if (role === 'editor') {
          window.location.href = '/editor-portal';
        } else if (role === 'project_manager') {
          window.location.href = '/project-manager';
        } else if (role === 'model' || role === 'talent') {
          window.location.href = '/talent-dashboard';
        } else {
          window.location.href = '/client-portal';
        }
        return;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-background border border-border shadow-2xl">

      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-4">
          <img src="/logo.webp" alt="MP Productions" className="h-14 w-auto object-contain mx-auto drop-shadow-[0_0_20px_rgba(235,61,38,0.25)]" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Join the Platform'}
        </h1>
        <p className="text-sm sm:text-base text-foreground/80 font-medium">
          {isLogin
            ? 'Sign in to access your production portal'
            : 'Create your account to start collaborating'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-brand/10 border border-brand/30 text-brand text-sm font-semibold text-center">
          {error}
        </div>
      )}

      {/* Social Logins */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface/80 text-foreground py-3 rounded-xl border border-slate-300 dark:border-border hover:border-brand/40 transition-all text-sm font-bold disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-foreground" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-300 dark:border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
          <span className="bg-background px-3 text-foreground/80">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Smith"
                required
                className="w-full bg-surface text-foreground font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-border focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm placeholder:text-muted-foreground placeholder:font-normal"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="username"
              required
              className="w-full bg-surface text-foreground font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-border focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm placeholder:text-muted-foreground placeholder:font-normal"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={isLogin ? undefined : 8}
              className="w-full bg-surface text-foreground font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-border focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm placeholder:text-muted-foreground placeholder:font-normal"
            />
          </div>
        </div>

        {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full bg-surface text-foreground font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-border focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm placeholder:text-muted-foreground placeholder:font-normal"
                />
              </div>
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-brand hover:brightness-110 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
            </>
          ) : (
            <>
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-300 dark:border-border text-center text-sm font-medium text-foreground/80">
        {isLogin ? (
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand font-bold hover:underline ml-1">
              Register here
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-brand font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
