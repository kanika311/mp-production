'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import {
  LayoutDashboard,
  Clapperboard,
  Newspaper,
  Quote,
  Users,
  HelpCircle,
  Layers,
  Megaphone,
  Mail,
  AtSign,
  Settings,
  Trash2,
  Sliders,
  Menu,
  X,
  Navigation,
  PanelBottom,
  Building2,
  Shield,
  UserCheck,
  GraduationCap,
  type LucideIcon,
  FolderKanban,
  MessageSquare,
  Bot,
  Sparkles,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Clapperboard,
  Newspaper,
  Quote,
  Users,
  HelpCircle,
  Layers,
  Megaphone,
  Mail,
  AtSign,
  Settings,
  Trash2,
  Sliders,
  Navigation,
  PanelBottom,
  Building2,
  Shield,
  UserCheck,
  GraduationCap,
  FolderKanban,
  MessageSquare,
  Bot,
  Sparkles,
  Briefcase,
  ShieldAlert,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview & Analytics',
    items: [
      { href: '/studio-8f2k', label: 'Super Admin Overview', icon: 'LayoutDashboard' },
      { href: '/studio-8f2k/cms', label: 'CMS Master Dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    section: 'Visual & Theme Config',
    items: [
      { href: '/studio-8f2k/cms/site-config?tab=navbar', label: 'Navigation & Navbar', icon: 'Navigation' },
      { href: '/studio-8f2k/cms/site-config?tab=footer', label: 'Site Footer Settings', icon: 'PanelBottom' },
      { href: '/studio-8f2k/cms/site-config?tab=hero', label: 'Hero & Landing Pages', icon: 'Sliders' },
      { href: '/studio-8f2k/cms/site-config', label: 'Full Visual Config Hub', icon: 'Sliders' },
    ],
  },
  {
    section: 'Content Modules',
    items: [
      { href: '/studio-8f2k/cms/portfolio', label: 'Portfolio Gallery', icon: 'Clapperboard' },
      { href: '/studio-8f2k/cms/blog', label: 'Blog & News', icon: 'Newspaper' },
      { href: '/studio-8f2k/cms/testimonials', label: 'Client Testimonials', icon: 'Quote' },
      { href: '/studio-8f2k/cms/team', label: 'Team Directory', icon: 'Users' },
      { href: '/studio-8f2k/cms/faq', label: 'FAQ & Help', icon: 'HelpCircle' },
      { href: '/studio-8f2k/cms/services', label: 'Services & Offerings', icon: 'Layers' },
      { href: '/studio-8f2k/cms/projects', label: 'Client Projects', icon: 'FolderKanban' },
      { href: '/studio-8f2k/cms/announcements', label: 'Announcements Banner', icon: 'Megaphone' },
    ],
  },
  {
    section: 'Inbox & Leads',
    items: [
      { href: '/studio-8f2k/cms/inboxwa', label: 'WhatsApp & InboxWA System', icon: 'MessageSquare' },
      { href: '/studio-8f2k/cms/contacts', label: 'Contact Submissions', icon: 'Mail' },
      { href: '/studio-8f2k/cms/newsletter', label: 'Newsletter Subscribers', icon: 'AtSign' },
    ],
  },
  {
    section: 'Creator Academy & Students',
    items: [
      { href: '/super-admin/cms/courses', label: 'Creator Courses & Videos', icon: 'GraduationCap' },
      { href: '/super-admin/cms/students', label: 'Student Access & UTR Approvals', icon: 'UserCheck' },
    ],
  },
  {
    section: 'Sales & CRM Pipeline',
    items: [
      { href: '/super-admin/cms/sales', label: 'Sales Manager Control Hub', icon: 'Target' },
      { href: '/super-admin/cms/salesLeads', label: 'Sales Leads & CRM', icon: 'FolderKanban' },
      { href: '/super-admin/cms/salesTargets', label: 'Sales Targets & Quotas', icon: 'Sliders' },
      { href: '/super-admin/cms/referrals', label: 'Referrals & Rewards', icon: 'Users' },
      { href: '/super-admin/cms/bookings', label: 'Bookings & Inquiries', icon: 'Layers' },
    ],
  },


  {
    section: 'Access & User Directory',
    items: [
      { href: '/studio-8f2k/users?role=TALENT', label: 'Talent Users', icon: 'Sparkles' },
      { href: '/studio-8f2k/users?role=CLIENT', label: 'Client Accounts', icon: 'Briefcase' },
      { href: '/studio-8f2k/users?role=EMPLOYEE', label: 'Employees & Staff', icon: 'Building2' },
      { href: '/studio-8f2k/users?role=ADMIN', label: 'Admins & Management', icon: 'Shield' },
      { href: '/studio-8f2k/users', label: 'All Users (RBAC)', icon: 'Users' },
    ],
  },
  {
    section: 'Super Admin Operations',
    items: [
      { href: '/studio-8f2k/moderation', label: 'Talent Moderation', icon: 'UserCheck' },
      { href: '/studio-8f2k/audit-logs', label: 'Security Audit Logs', icon: 'ShieldAlert' },
      { href: '/studio-8f2k/settings', label: 'Platform Controls & Settings', icon: 'Settings' },
      { href: '/studio-8f2k/cms/recycle-bin', label: 'Recycle Bin & Recovery', icon: 'Trash2' },
    ],
  },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const searchParams = useSearchParams();
  const currentRole = searchParams ? searchParams.get('role') : null;

  return (
    <nav className="flex flex-col gap-8 pb-36">

      {NAV.map((group) => (
        <div key={group.section} className="flex flex-col gap-2">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/85">
            {group.section}
          </p>
          <div className="flex flex-col gap-1.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard;

              const [itemPath, itemQuery] = item.href.split('?');
              const itemParams = new URLSearchParams(itemQuery || '');
              const itemRole = itemParams.get('role');

              let active = false;
              if (item.href === '/studio-8f2k') {
                active = pathname === '/studio-8f2k';
              } else if (item.href === '/studio-8f2k/cms') {
                active = pathname === '/studio-8f2k/cms';
              } else if (itemRole) {
                active = pathname === itemPath && currentRole === itemRole;
              } else if (itemPath === '/studio-8f2k/users') {
                active = pathname === '/studio-8f2k/users' && !currentRole;
              } else {
                active = pathname.startsWith(item.href);
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/15 text-primary font-semibold shadow-[0_0_15px_rgba(235,61,38,0.1)] border border-primary/20'
                      : 'text-muted-foreground hover:bg-surface/80 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop sidebar — single smooth scrollable container */}
      <aside data-lenis-prevent className="hidden md:block fixed top-0 left-0 bottom-0 w-64 h-screen overflow-y-auto border-r border-border bg-surface px-4 py-6 z-40 shadow-xl">
        <div className="px-3 py-4 mb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#eb3d26] animate-pulse" />
            <p className="text-base font-serif font-bold text-foreground tracking-wide">Command Center</p>
          </div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Super Admin & CMS Studio</p>
        </div>
        <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading navigation...</div>}>
          <NavLinks pathname={pathname} />
        </Suspense>
      </aside>



      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#eb3d26]" />
          <span className="font-serif font-bold text-foreground">Command Center</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-foreground p-1"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div data-lenis-prevent className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-surface border-r border-border px-4 py-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 px-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#eb3d26]" />
                <span className="font-serif font-bold text-foreground">Command Center</span>
              </div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <Suspense fallback={null}>
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main content with PortalNavbar */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen w-full">
        <PortalNavbar role="SUPER_ADMIN" />
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 py-6 md:py-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
export default CmsShell;
