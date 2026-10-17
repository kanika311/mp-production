"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Home,
  Film,
  Briefcase,
  Layers,
  Users,
  Info,
  BookOpen,
  Mail,
  ChevronRight,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import { fetchAPI } from "@/lib/api-client";

/* ─── Default nav items (structural fallback while CMS loads) ─── */
const DEFAULT_NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Become a YouTuber", href: "/become-a-youtuber" },
  { title: "Showreels", href: "/reel" },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Services", href: "/services" },
  { title: "Talent", href: "/talent" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
];

/* Nav icons mapping */
const NAV_ITEM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/become-a-youtuber": Sparkles,
  "/reel": Film,
  "/portfolio": Briefcase,
  "/services": Layers,
  "/talent": Users,
  "/about": Info,
  "/blog": BookOpen,
  "/contact": Mail,
};

/* ─── Navbar ─── */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);
  const [studentUser, setStudentUser] = useState<{ name: string; email: string } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('mp_student_logged_in') === 'true';
      const name = sessionStorage.getItem('mp_student_name');
      const email = sessionStorage.getItem('mp_student_email');
      if (isLoggedIn && name) {
        setStudentUser({ name, email: email || '' });
      }
    }
  }, []);

  function handleSignOut() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mp_student_logged_in');
      sessionStorage.removeItem('mp_student_name');
      sessionStorage.removeItem('mp_student_email');
      sessionStorage.removeItem('mp_student_phone');
      sessionStorage.removeItem('mp_sec_token');
    }
    setStudentUser(null);
    setUserDropdownOpen(false);
    toast.success('👋 Signed out successfully!');
  }
  
  const isForcedDark = false; // Deprecated, theme variables are now light-aware
  const useLightText = resolvedTheme === "dark";

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch navigation config from CMS
  useEffect(() => {
    fetchAPI('/cms/config/navigation')
      .then((res) => {
        if (res?.success && res?.data) {
          const val = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          // Support: { links: [{ label, href }] } or direct array [{ label, href }]
          const links = Array.isArray(val) ? val : (val.links && Array.isArray(val.links)) ? val.links : null;
          if (links && links.length > 0) {
            setNavItems(links.map((item: any) => ({
              title: item.title || item.label || item.text || '',
              href: item.href || item.url || item.link || '/',
            })));
          }
        }
      })
      .catch(() => {
        // Silently keep defaults — navbar should never break
      });
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled || pathname?.startsWith('/talent')
            ? "py-2.5 dark:bg-background bg-background shadow-xs border-b border-border"
            : "py-4 bg-transparent border-b border-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between">
          {/* ── Logo ── */}
          <Link href="/" className="relative z-10 shrink-0" data-cursor="hover">
            <img
              src="/logo.webp"
              className={cn(
                "w-auto object-contain transition-all duration-500",
                scrolled || pathname?.startsWith('/talent') ? "h-10 md:h-11" : "h-12 md:h-14"
              )}
              alt="MP Production"
            />
          </Link>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/become-a-youtuber"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 bg-gradient-to-r from-amber-500 via-rose-500 to-brand text-white hover:opacity-95 shadow-md shrink-0 border border-amber-300/40"
              data-cursor="hover"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>Become a YouTuber</span>
            </Link>

            {studentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-500 text-xs font-bold shadow-sm hover:bg-emerald-500/25 transition-all cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>👤 {studentUser.name}</span>
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
                </button>

                {userDropdownOpen && (
                  <div 
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-card border border-border p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <Link
                      href="/creator-lab"
                      className="flex items-center gap-2 p-2 rounded-xl text-foreground font-bold hover:bg-muted transition-colors"
                    >
                      <svg className="w-4 h-4 text-brand fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h10M6 10h10"/></svg>
                      <span>My Student Academy</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-500 font-bold hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-rose-500 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      <span>Sign Out / Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "inline-flex items-center text-xs font-bold tracking-widest uppercase transition-all px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md hidden sm:inline-flex",
                  scrolled 
                    ? "text-foreground hover:text-brand bg-surface/80 border-border" 
                    : "text-white hover:text-brand bg-black/50 border-white/20 drop-shadow"
                )}
              >
                Sign In
              </Link>
            )}

            <Link
              href="/join/talent"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold tracking-wider uppercase rounded-full transition-all duration-300 bg-brand text-white hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(235,61,38,0.4)] shadow-md shrink-0 border border-brand/30"
              data-cursor="hover"
            >
              Talent Register
            </Link>


            <ThemeToggle />

            {/* ── Mobile Toggle ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "relative z-50 p-2.5 rounded-full transition-all backdrop-blur-md border shadow-sm",
                scrolled 
                  ? "text-foreground bg-surface/80 hover:bg-surface border-border" 
                  : "text-white bg-black/50 border-white/20 hover:bg-black/70 drop-shadow"
              )}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Slide-Out Navigation Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full sm:w-[420px] max-w-[92vw] h-full bg-background border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden"
              aria-label="Navigation Drawer"
            >
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md shrink-0">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src="/logo.webp"
                    alt="MP Production"
                    className="h-9 w-auto object-contain"
                  />
                </Link>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full border border-border bg-surface text-foreground hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5">
                <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                  Navigation Menu
                </div>

                {navItems.map((item) => {
                  const Icon = NAV_ITEM_ICONS[item.href] || Sparkles;
                  const isActive = pathname === item.href;
                  const isYoutuber = item.href === "/become-a-youtuber";

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                        isActive
                          ? "bg-brand text-white shadow-sm font-bold"
                          : "text-foreground hover:bg-muted/80"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-white/20 text-white"
                              : isYoutuber
                              ? "bg-amber-500/15 text-amber-500 group-hover:bg-amber-500/25"
                              : "bg-muted text-muted-foreground group-hover:text-brand group-hover:bg-brand/10"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{item.title}</span>

                        {isYoutuber && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                            Popular
                          </span>
                        )}
                        {item.href === "/talent" && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand/15 text-brand">
                            Casting
                          </span>
                        )}
                      </div>

                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform group-hover:translate-x-1",
                          isActive ? "text-white" : "text-muted-foreground/60"
                        )}
                      />
                    </Link>
                  );
                })}

                {/* Creator Promotion Card */}
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-brand/15 border border-amber-500/25">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" /> Creator Program
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Become a YouTuber</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Personalized mentorship, studio shoots, and viral video editing to scale your audience.
                  </p>
                  <Link
                    href="/become-a-youtuber"
                    onClick={() => setMobileOpen(false)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                  >
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Drawer Bottom Actions & User Profile */}
              <div className="p-5 border-t border-border bg-card/60 backdrop-blur-md space-y-3 shrink-0">
                {studentUser ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 font-bold flex items-center justify-center text-xs shrink-0">
                          {studentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{studentUser.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{studentUser.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      href="/creator-lab"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold bg-brand text-white shadow-sm flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors"
                    >
                      <span>My Student Academy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/become-a-youtuber"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-brand text-white shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                      <span>Become a YouTuber</span>
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="py-2.5 px-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider border border-border text-foreground hover:bg-muted flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/join/talent"
                        onClick={() => setMobileOpen(false)}
                        className="py-2.5 px-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider bg-brand text-white shadow hover:bg-brand/90 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Talent Register</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Quick Info */}
                <div className="pt-2 text-center text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/50">
                  <span>MP Production Studio</span>
                  <a
                    href="mailto:info@mpproduction.in"
                    className="hover:text-brand transition-colors"
                  >
                    info@mpproduction.in
                  </a>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Card3D stub for backward compat ─── */
export const Card3D = ({ children, className }: { children?: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={className}>{children}</div>
);

export default Navbar;
