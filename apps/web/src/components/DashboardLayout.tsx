'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, User as UserIcon, Search, Command, ArrowRight, ShieldCheck, Sparkles, X, LayoutDashboard, Film, Users, Sliders, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';

import { Role } from '@mdms/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: Role | string;
  };
  title: string;
}

export function DashboardLayout({ children, user, title }: DashboardLayoutProps) {
  const router = useRouter();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isCmdOpen) {
        setIsCmdOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdOpen]);

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return 'bg-[#eb3d26]/15 text-[#eb3d26] border-[#eb3d26]/40 shadow-[0_0_15px_rgba(235,61,38,0.3)]';
      case 'admin':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      case 'client':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case 'talent':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return 'EXECUTIVE SUPER ADMIN';
      case 'admin':
        return 'STUDIO ADMIN';
      case 'client':
        return 'CLIENT PORTAL';
      case 'talent':
        return 'TALENT ROSTER';
      default:
        return 'PUBLIC GUEST';
    }
  };

  const quickCommands = [
    { label: 'Executive Overview & Live Stats', href: '/studio-8f2k', icon: <LayoutDashboard className="w-4 h-4 text-[#eb3d26]" /> },
    { label: 'Content Studio (CMS) & Master Archive', href: '/studio-8f2k/cms', icon: <Film className="w-4 h-4 text-amber-400" /> },
    { label: 'Visual Site Config & Tokens', href: '/studio-8f2k/cms/site-config', icon: <Sliders className="w-4 h-4 text-purple-400" /> },
    { label: 'Roster & RBAC Permissions', href: '/studio-8f2k/users', icon: <Users className="w-4 h-4 text-blue-400" /> },
    { label: 'System Audit & Security Logs', href: '/studio-8f2k/audit-logs', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { label: 'Studio Settings & API Keys', href: '/studio-8f2k/settings', icon: <Settings className="w-4 h-4 text-white/60" /> },
  ];

  const filteredCommands = quickCommands.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none">
      {/* Top Header Navbar */}
      <header className="h-20 bg-background/85 backdrop-blur-3xl border-b border-border px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center gap-6 sm:gap-10">
          <Link href="/" data-cursor="hover" data-cursor-label="HOME" className="flex items-center gap-3 group">
            <img 
              src="/logo.webp" 
              alt="MP Production Logo" 
              className="h-14 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_15px_rgba(235,61,38,0.3)]"
            />
            <div className="hidden sm:flex flex-col border-l border-border pl-3.5">
              <span className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                MP PRODUCTION OS
              </span>
            </div>
          </Link>

          {/* Command Palette Trigger Bar */}
          <button
            onClick={() => setIsCmdOpen(true)}
            data-cursor="hover"
            data-cursor-label="SEARCH"
            className="hidden md:flex items-center justify-between w-64 lg:w-80 px-4 py-2.5 rounded-full bg-surface border border-border hover:border-primary/60 hover:bg-surface/80 transition-all text-sm text-muted-foreground group shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#eb3d26] group-hover:scale-110 transition-transform" />
              <span className="font-medium tracking-wide">Search portal or commands...</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/20 border border-border text-xs font-bold text-muted-foreground">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setIsCmdOpen(true)}
            className="md:hidden p-2.5 rounded-xl bg-surface border border-border text-foreground"
            title="Search"
          >
            <Search className="w-4 h-4 text-[#eb3d26]" />
          </button>

          

          {/* User Profile Badge */}
          <div className="flex items-center gap-3.5 border-l border-border pl-4 sm:pl-6">
            <div className="w-10 h-10 rounded-full bg-[#eb3d26]/15 border border-[#eb3d26]/40 flex items-center justify-center text-[#eb3d26] font-bold text-base shrink-0 shadow-glow">
              {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-mono font-bold text-foreground truncate max-w-[160px]">
                {user.name || user.email}
              </span>
              <span
                className={cn(
                  "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border tracking-widest uppercase mt-0.5 inline-block",
                  getRoleBadgeColor(user.role)
                )}
              >
                ● {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
              } catch {}
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('mdms_auth_token');
                localStorage.removeItem('accessToken');
                document.cookie = 'token=; Max-Age=0; path=/;';
                document.cookie = 'mdms_auth_token=; Max-Age=0; path=/;';
                document.cookie = 'next-auth.session-token=; Max-Age=0; path=/;';
              }
              router.push('/login');
              router.refresh();
            }}
            data-cursor="hover"
            data-cursor-label="SIGN OUT"
            className="flex items-center gap-2 bg-surface hover:bg-primary text-muted-foreground hover:text-white border border-border hover:border-primary px-4 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest transition-all shadow-md"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex flex-1 flex-col md:flex-row">
        <Suspense fallback={<aside className="w-full md:w-64 bg-background border-r border-border shrink-0" />}>
          <div className="md:sticky md:top-20 md:h-[calc(100vh-5rem)] shrink-0 z-30">
            <Sidebar role={user.role} />
          </div>
        </Suspense>

        <main className="flex-1 p-6 sm:p-10 lg:p-14 bg-background min-w-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Interactive Command Palette Modal */}
      <AnimatePresence>
        {isCmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-2xl"
            onClick={() => setIsCmdOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-background border border-border rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border flex items-center gap-3">
                <Search className="w-5 h-5 text-[#eb3d26]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a command or search portal sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setIsCmdOpen(false)}
                  className="p-1.5 rounded-lg bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  ● Quick Jump Commands
                </div>
                {filteredCommands.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground font-mono text-xs">
                    No matching commands found.
                  </div>
                ) : (
                  filteredCommands.map((cmd) => (
                    <button
                      key={cmd.href}
                      onClick={() => {
                        setIsCmdOpen(false);
                        router.push(cmd.href);
                      }}
                      className="w-full p-3.5 rounded-2xl bg-surface hover:bg-primary text-muted-foreground hover:text-white border border-border hover:border-primary flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-background group-hover:bg-black/20 transition-colors">
                          {cmd.icon}
                        </span>
                        <span className="font-mono text-xs font-bold tracking-wider">{cmd.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))
                )}
              </div>

              <div className="p-4 bg-surface/50 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Navigation shortcuts:</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-foreground">↑↓</kbd>
                  <span>to select</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-foreground">ESC</kbd>
                  <span>to exit</span>
                </div>
                <span className="text-primary font-bold uppercase tracking-wider">MP Studio v2.6</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
