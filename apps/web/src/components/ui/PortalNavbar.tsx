'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PortalNavbarProps {
  role?: string;
  title?: string;
  className?: string;
  user?: any;
  [key: string]: any;
}

export function PortalNavbar({ role, title, className, user, ...props }: PortalNavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "";
  
  const isPortalPath = pathname.startsWith('/studio-8f2k') ||
                       pathname.startsWith('/super-admin') ||
                       pathname.startsWith('/admin') ||
                       pathname.startsWith('/client-portal') ||
                       pathname.startsWith('/talent-dashboard') ||
                       pathname.startsWith('/editor-portal') ||
                       pathname.startsWith('/employee-portal') ||
                       pathname.startsWith('/project-manager');

  const isPortal = Boolean(role || isPortalPath);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      localStorage.removeItem('mdms_auth_token');
      localStorage.removeItem('mdms_auth_role');
      localStorage.removeItem('mdms_auth_user');
      document.cookie = "mdms_auth_token=; path=/; max-age=0";
      document.cookie = "mdms_auth_role=; path=/; max-age=0";
    } catch (err) {}
    window.location.href = "/";
  };

  const getPortalBadgeText = () => {
    if (title) return title;
    if (role) {
      return `${role.replace(/_/g, ' ')} COMMAND CENTER`;
    }
    if (pathname.startsWith('/studio-8f2k/mgmt')) return 'ADMIN PORTAL';
    if (pathname.startsWith('/studio-8f2k')) return 'SUPER ADMIN COMMAND CENTER';
    if (pathname.startsWith('/super-admin')) return 'SUPER ADMIN COMMAND CENTER';
    if (pathname.startsWith('/admin')) return 'ADMIN PORTAL';
    if (pathname.startsWith('/client-portal')) return 'CLIENT PORTAL';
    if (pathname.startsWith('/talent-dashboard')) return 'TALENT DASHBOARD';
    if (pathname.startsWith('/editor-portal')) return 'EDITOR PORTAL';
    if (pathname.startsWith('/employee-portal')) return 'EMPLOYEE PORTAL';
    if (pathname.startsWith('/project-manager')) return 'PROJECT MANAGER PORTAL';
    return 'PORTAL COMMAND CENTER';
  };

  return (
    <header
      className={`w-full bg-background/90 backdrop-blur-2xl text-foreground border-b border-border sticky top-0 z-50 shadow-sm transition-all duration-300 relative theme-transition ${className || ''}`}
    >
      {/* Top Multi-Color Neon Accent Edge - Refactored to theme-aware subtle brand accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/25 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center h-20">
        {/* Logo & Portal Badge */}
        <div className="flex items-center gap-6">
          <Link href={isPortal ? "#" : "/"} className="group flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="MP Productions Logo" 
              className="h-14 md:h-16 w-auto object-contain scale-110 origin-left group-hover:scale-125 transition-all duration-300 drop-shadow-[0_0_10px_rgba(235,61,38,0.15)]"
            />
          </Link>
          
          {isPortal && (
            <div className="hidden sm:flex items-center border-l border-border/80 pl-6 h-10">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider shadow-sm">
                {getPortalBadgeText()}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {isPortal ? (
            <>
              {(pathname.startsWith('/super-admin') || (pathname.startsWith('/studio-8f2k') && !pathname.startsWith('/studio-8f2k/mgmt'))) && (
                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
                  <Link href="/studio-8f2k" className={`transition-colors ${pathname === '/studio-8f2k' || pathname === '/super-admin' ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Dashboard
                  </Link>
                  <Link href="/studio-8f2k/users" className={`transition-colors ${pathname.includes('/users') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Users
                  </Link>
                  <Link href="/studio-8f2k/cms" className={`transition-colors ${pathname.includes('/cms') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    CMS Engine
                  </Link>
                  <Link href="/studio-8f2k/moderation" className={`transition-colors ${pathname.includes('/moderation') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Moderation
                  </Link>
                  <Link href="/studio-8f2k/audit-logs" className={`transition-colors ${pathname.includes('/audit-logs') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Audit Logs
                  </Link>
                </div>
              )}

              {((pathname.startsWith('/admin') && !pathname.startsWith('/super-admin')) || pathname.startsWith('/studio-8f2k/mgmt')) && (
                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
                  <Link href="/studio-8f2k/mgmt" className={`transition-colors ${pathname === '/studio-8f2k/mgmt' || pathname === '/admin' ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Dashboard
                  </Link>
                  <Link href="/studio-8f2k/mgmt/users" className={`transition-colors ${pathname.includes('/users') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Users
                  </Link>
                  <Link href="/studio-8f2k/mgmt/sales" className={`transition-colors ${pathname.includes('/sales') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Sales & Leads CRM
                  </Link>
                  <Link href="/studio-8f2k/mgmt/cms/blog" className={`transition-colors ${pathname.includes('/cms/blog') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    CMS Content
                  </Link>
                  <Link href="/studio-8f2k/mgmt/moderation" className={`transition-colors ${pathname.includes('/moderation') ? 'text-brand font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    Moderation
                  </Link>
                </div>
              )}

              <Link
                href="/"
                className="text-xs uppercase font-semibold tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-surface/80 border border-transparent hover:border-border"
              >
                <ExternalLink className="size-3.5" /> Live Site
              </Link>
              <div className="w-px h-6 bg-border/80" />
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white text-xs font-semibold tracking-wider uppercase rounded transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="size-3.5" /> SIGN OUT
              </button>
            </>
          ) : (
            <>
              <Link href="/portfolio" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                Portfolio
              </Link>
              <Link href="/services" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/talent" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                Talent
              </Link>
              <div className="w-px h-6 bg-border/80" />
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-foreground/80 hover:text-brand transition-colors"
              >
                SIGN IN
              </Link>
              <Link
                href="/join/talent"
                className="px-4 py-2 bg-brand text-white hover:bg-brand/90 text-xs font-bold tracking-wider uppercase rounded-full transition-all shadow-sm border border-brand/30"
              >
                TALENT REGISTER
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl flex flex-col items-center py-8 gap-6 shadow-2xl"
          >
            {isPortal ? (
              <>
                <div className="flex items-center mb-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
                    {getPortalBadgeText()}
                  </span>
                </div>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="size-4" /> Live Site
                </Link>
                <div className="w-16 h-px bg-border my-2" />
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2.5 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white text-sm font-semibold tracking-wider uppercase rounded transition-all flex items-center gap-2"
                >
                  <LogOut className="size-4" /> SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif text-muted-foreground hover:text-primary transition-colors">
                  Portfolio
                </Link>
                <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif text-muted-foreground hover:text-primary transition-colors">
                  Services
                </Link>
                <Link href="/talent" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif text-muted-foreground hover:text-primary transition-colors">
                  Talent
                </Link>
                <div className="w-16 h-px bg-border my-2" />
                <div className="flex items-center gap-3 w-full max-w-xs px-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 border border-border text-foreground text-xs font-semibold tracking-wider uppercase rounded-lg"
                  >
                    SIGN IN
                  </Link>
                  <Link
                    href="/join/talent"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 bg-brand text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md"
                  >
                    TALENT REGISTER
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default PortalNavbar;
