'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Lock, Mail, User, Shield } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === 'login';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setIsLoading(true);
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}.`);
      setIsLoading(false);
    }
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
        let registered = false;
        try {
          // 1. Try Server-Side Auth API (which bypasses SMTP verification limits)
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

          if (registerRes.ok) {
            registered = true;
          } else if (registerRes.status !== 404) {
            const registerData = await registerRes.json().catch(() => ({}));
            throw new Error(registerData.message || 'Registration failed');
          }
        } catch (bffErr: any) {
          if (!bffErr.message?.includes('Registration failed')) {
            console.warn('Server-side registration route unreachable, using direct Supabase Auth:', bffErr);
          } else {
            throw bffErr;
          }
        }

        // 2. Direct fallback to Supabase Client signUp if reverse proxy blocks /api/auth/register (404)
        if (!registered) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: 'client',
              },
            },
          });
          if (signUpError) throw signUpError;
        }

        // Auto-login the client after successful registration
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        
        // After successful registration, clients land on their portal.
        router.push('/client-portal');
      } else {
        // Login using Supabase Auth
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.session?.access_token) {
          localStorage.setItem('token', data.session.access_token);
          localStorage.setItem('mdms_auth_token', data.session.access_token);
        }

        const role = (
          data.user?.user_metadata?.role ||
          data.user?.app_metadata?.role ||
          ''
        )
          .toString()
          .toLowerCase()
          .replace(/-/g, '_');

        if (role === 'super_admin') router.push('/studio-8f2k');
        else if (role === 'admin') router.push('/studio-8f2k/mgmt');
        else if (role === 'model' || role === 'talent') router.push('/talent-dashboard');
        else if (role === 'editor') router.push('/editor-portal');
        else if (role === 'employee') router.push('/employee-portal');
        else if (role === 'project_manager') router.push('/project-manager');
        else router.push('/client-portal');
      }
      
      router.refresh();
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
          <img src="/logo.png" alt="MP Productions" className="h-14 w-auto object-contain mx-auto drop-shadow-[0_0_20px_rgba(235,61,38,0.25)]" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isLogin ? 'Welcome Back' : 'Join the Platform'}
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          {isLogin
            ? 'Sign in to access your production portal'
            : 'Create your account to start collaborating'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-brand/10 border border-brand/30 text-brand text-sm text-center">
          {error}
        </div>
      )}

      {/* Social Logins */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface/80 text-foreground py-3 rounded-xl border border-border transition-all text-sm font-medium disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialLogin('apple')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface/80 text-foreground py-3 rounded-xl border border-border transition-all text-sm font-medium disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
          </svg>
          Continue with Apple
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Smith"
                required
                className="w-full bg-surface text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-brand transition-colors text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="username"
              required
              className="w-full bg-surface text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-brand transition-colors text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={isLogin ? undefined : 8}
              className="w-full bg-surface text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-brand transition-colors text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full bg-surface text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-brand transition-colors text-sm placeholder:text-muted-foreground"
                />
              </div>
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-brand hover:brightness-110 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
            </>
          ) : (
            <>
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        {isLogin ? (
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand font-semibold hover:underline">
              Register here
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
