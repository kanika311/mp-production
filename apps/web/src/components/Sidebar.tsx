'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Users, FolderKanban, UserCheck, Briefcase, Settings, FileText, 
  Video, Calendar, Home, DollarSign, Image as ImageIcon, 
  Send, Award, LayoutDashboard, ShieldAlert, Sliders, Building2, Clapperboard, Shield, ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Role } from '@mdms/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: Role | string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  category?: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') : null;

  const getNavItems = (): NavItem[] => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return [
          { category: 'Executive Command', label: 'Overview & Stats', href: '/studio-8f2k', icon: <ShieldAlert className="w-4 h-4 text-brand" /> },
          { category: 'Executive Command', label: 'Control Center', href: '/studio-8f2k/dashboard?tab=overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { category: 'Content & Brand', label: 'Content Studio (CMS)', href: '/studio-8f2k/cms', icon: <Clapperboard className="w-4 h-4 text-brand" /> },
          { category: 'Content & Brand', label: 'Visual Site Config', href: '/studio-8f2k/cms/site-config', icon: <Sliders className="w-4 h-4 text-brand" /> },
          { category: 'Roster & Operations', label: 'Talent Directory', href: '/studio-8f2k/users?role=TALENT', icon: <Sparkles className="w-4 h-4 text-brand" /> },
          { category: 'Roster & Operations', label: 'Client Accounts', href: '/studio-8f2k/users?role=CLIENT', icon: <Briefcase className="w-4 h-4 text-blue-400" /> },
          { category: 'Roster & Operations', label: 'Employees & Staff', href: '/studio-8f2k/users?role=EMPLOYEE', icon: <Building2 className="w-4 h-4 text-amber-400" /> },
          { category: 'Roster & Operations', label: 'Admins & Management', href: '/studio-8f2k/users?role=ADMIN', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
          { category: 'Roster & Operations', label: 'All Users (RBAC)', href: '/studio-8f2k/users', icon: <Users className="w-4 h-4" /> },
          { category: 'Roster & Operations', label: 'Talent Moderation', href: '/studio-8f2k/moderation', icon: <UserCheck className="w-4 h-4 text-amber-500" /> },
          { category: 'Production Suite', label: 'Production Projects', href: '/studio-8f2k/dashboard?tab=projects', icon: <FolderKanban className="w-4 h-4" /> },
          { category: 'Production Suite', label: 'Client Management', href: '/studio-8f2k/dashboard?tab=clients', icon: <Briefcase className="w-4 h-4" /> },
          { category: 'Production Suite', label: 'Rate Cards & Pricing', href: '/studio-8f2k/dashboard?tab=pricing', icon: <DollarSign className="w-4 h-4" /> },
          { category: 'System & Governance', label: 'Audit & Security Logs', href: '/studio-8f2k/audit-logs', icon: <Shield className="w-4 h-4 text-emerald-500" /> },
          { category: 'System & Governance', label: 'System Settings', href: '/studio-8f2k/settings', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'admin':
        return [
          { category: 'Studio Management', label: 'Overview & Stats', href: '/studio-8f2k/mgmt', icon: <ShieldAlert className="w-4 h-4 text-brand" /> },
          { category: 'Studio Management', label: 'Control Center', href: '/studio-8f2k/mgmt/dashboard?tab=overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { category: 'Content & Brand', label: 'Content Studio (CMS)', href: '/studio-8f2k/mgmt/cms', icon: <Clapperboard className="w-4 h-4 text-brand" /> },
          { category: 'Content & Brand', label: 'Visual Site Config', href: '/studio-8f2k/mgmt/cms/site-config', icon: <Sliders className="w-4 h-4 text-brand" /> },
          { category: 'Roster & Operations', label: 'Talent Directory', href: '/studio-8f2k/mgmt/users?role=TALENT', icon: <Sparkles className="w-4 h-4 text-brand" /> },
          { category: 'Roster & Operations', label: 'Client Accounts', href: '/studio-8f2k/mgmt/users?role=CLIENT', icon: <Briefcase className="w-4 h-4 text-blue-400" /> },
          { category: 'Roster & Operations', label: 'Employees & Staff', href: '/studio-8f2k/mgmt/users?role=EMPLOYEE', icon: <Building2 className="w-4 h-4 text-amber-400" /> },
          { category: 'Roster & Operations', label: 'Admins & Management', href: '/studio-8f2k/mgmt/users?role=ADMIN', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
          { category: 'Roster & Operations', label: 'All Users (RBAC)', href: '/studio-8f2k/mgmt/users', icon: <Users className="w-4 h-4" /> },
          { category: 'Roster & Operations', label: 'Talent Moderation', href: '/studio-8f2k/mgmt/moderation', icon: <UserCheck className="w-4 h-4 text-amber-500" /> },
          { category: 'Production Suite', label: 'Projects', href: '/studio-8f2k/mgmt/dashboard?tab=projects', icon: <FolderKanban className="w-4 h-4" /> },
          { category: 'Production Suite', label: 'Clients', href: '/studio-8f2k/mgmt/dashboard?tab=clients', icon: <Briefcase className="w-4 h-4" /> },
          { category: 'Production Suite', label: 'Bookings', href: '/studio-8f2k/mgmt/dashboard?tab=bookings', icon: <Calendar className="w-4 h-4" /> },
          { category: 'Production Suite', label: 'Pricing', href: '/studio-8f2k/mgmt/dashboard?tab=pricing', icon: <DollarSign className="w-4 h-4" /> },
          { category: 'System & Governance', label: 'Audit Logs', href: '/studio-8f2k/mgmt/audit-logs', icon: <Shield className="w-4 h-4 text-emerald-500" /> },
          { category: 'System & Governance', label: 'Settings', href: '/studio-8f2k/mgmt/settings', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'client':
        return [
          { category: 'Client Portal', label: 'My Projects', href: '/client/dashboard?tab=projects', icon: <FolderKanban className="w-4 h-4 text-brand" /> },
          { category: 'Client Portal', label: 'Shoot Status', href: '/client/dashboard?tab=shoots', icon: <Video className="w-4 h-4 text-amber-400" /> },
          { category: 'Client Portal', label: 'Invoices & Escrow', href: '/client/dashboard?tab=invoices', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
          { category: 'Roster Access', label: 'Browse Roster', href: '/talent/directory', icon: <Users className="w-4 h-4" /> },
        ];
      case 'talent':
        return [
          { category: 'Artist Suite', label: 'My Profile & Bio', href: '/talent/dashboard?tab=profile', icon: <UserCheck className="w-4 h-4 text-brand" /> },
          { category: 'Artist Suite', label: 'Lookbook & Media', href: '/talent/dashboard?tab=portfolio', icon: <ImageIcon className="w-4 h-4 text-amber-400" /> },
          { category: 'Bookings', label: 'Casting Requests', href: '/talent/dashboard?tab=requests', icon: <Send className="w-4 h-4 text-blue-400" /> },
          { category: 'Bookings', label: 'Escrow & Earnings', href: '/talent/dashboard?tab=earnings', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
        ];
      default:
        return [
          { label: 'Studio Dashboard', href: '/login', icon: <LayoutDashboard className="w-4 h-4 text-brand" /> },
        ];
    }
  };

  const navItems = getNavItems();
  const defaultTab = navItems[0]?.href.split('tab=')[1] || '';

  // Group items by category if available
  const groupedItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col justify-between h-full md:h-[calc(100vh-73px)] overflow-y-auto shrink-0 select-none theme-transition">
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <div className="px-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                ● {category}
              </p>
            </div>
            <nav className="space-y-1">
              {items.map((item) => {
                const itemTab = item.href.split('tab=')[1];
                const isTabMatch = itemTab ? (currentTab === itemTab || (!currentTab && itemTab === defaultTab)) : false;
                const isPathMatch = !item.href.includes('?') && pathname.startsWith(item.href);
                const isActive = isTabMatch || isPathMatch;
                
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    data-cursor="hover"
                    data-cursor-label="GO"
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                      isActive
                        ? "bg-brand text-primary-foreground shadow-glow border border-brand"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "transition-transform group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-brand"
                      )}>
                        {item.icon}
                      </span>
                      <span className="tracking-wider">{item.label}</span>
                    </div>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground shadow-sm" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border px-2">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-transparent border border-border text-xs text-muted-foreground shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand">Studio Desk</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="font-semibold text-foreground text-xs mb-1">Executive Support</p>
          <p className="font-light text-[11px] mb-3 text-muted-foreground leading-relaxed">
            Direct hotline for casting clearances and VIP escrow release.
          </p>
          <Link 
            href="/contact" 
            data-cursor="hover"
            data-cursor-label="SUPPORT"
            className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wider text-brand hover:text-foreground transition-colors"
          >
            <span>Contact Desk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
