import { Role } from '@mdms/types';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Same public defaults as utils/supabase/client.ts — middleware runs on the
// Edge and will not see apps/web/.env.production in local `next dev`.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zmpeiobdilrgtuzggzuj.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcGVpb2JkaWxyZ3R1emdnenVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NTc2MTUsImV4cCI6MjA5OTEzMzYxNX0.GRniMpKh5WW65JOmQl8znK_dme06iE8o_nIaGBV7-BI';

const ROLE_ROUTES: Record<string, Role[]> = {
  // Secret admin base paths (served via next.config rewrites). The more
  // specific /mgmt (Admin) entry MUST come before the generic Super Admin one
  // because matching uses the first prefix that matches.
  '/studio-8f2k/mgmt/cms/sales':      [Role.ADMIN, Role.SUPER_ADMIN],
  '/studio-8f2k/mgmt/cms/salesLeads': [Role.ADMIN, Role.SUPER_ADMIN],
  '/studio-8f2k/mgmt/cms/salesTargets':[Role.ADMIN, Role.SUPER_ADMIN],
  '/studio-8f2k/mgmt/sales':           [Role.ADMIN, Role.SUPER_ADMIN],
  '/studio-8f2k/mgmt':[Role.ADMIN, Role.SUPER_ADMIN],
  '/studio-8f2k':     [Role.SUPER_ADMIN],
  '/super-admin/cms/sales':           [Role.ADMIN, Role.SUPER_ADMIN],
  '/super-admin/cms/salesLeads':      [Role.ADMIN, Role.SUPER_ADMIN],
  '/super-admin/cms/salesTargets':    [Role.ADMIN, Role.SUPER_ADMIN],
  '/super-admin/cms/referrals':       [Role.ADMIN, Role.SUPER_ADMIN],
  '/super-admin':     [Role.SUPER_ADMIN],
  '/admin/sales':     [Role.ADMIN, Role.SUPER_ADMIN],
  '/admin':           [Role.ADMIN, Role.SUPER_ADMIN],
  '/client-portal':   [Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN],
  '/talent-dashboard':[Role.TALENT, Role.ADMIN, Role.SUPER_ADMIN],
  '/editor-portal':   [Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN],
  '/employee-portal': [Role.EMPLOYEE, Role.ADMIN, Role.SUPER_ADMIN],
  '/project-manager': [Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
};

function normalizeRole(raw?: string | null): Role | null {
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase().replace(/-/g, '_');
  return (Object.values(Role) as string[]).includes(normalized)
    ? (normalized as Role)
    : null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect /model/dashboard to /talent-dashboard
  if (pathname.startsWith('/model/dashboard')) {
    return NextResponse.redirect(new URL('/talent-dashboard', req.url));
  }

  let response = NextResponse.next({ request: req });
  let userRole: Role | null = null;

  // 1. Try NextAuth token first
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      userRole = normalizeRole(token.role as string);
    }
  } catch {
    // NextAuth check ignored
  }

  // 2. Try Supabase session fallback if NextAuth is null
  if (!userRole) {
    try {
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userRole = normalizeRole(
          (user.user_metadata?.role as string) ||
            (user.app_metadata?.role as string),
        );
      }
    } catch {
      // Supabase fallback check ignored
    }
  }

  // Not authenticated — redirect to specific designated login portal
  const isProtected = Object.keys(ROLE_ROUTES).some(p => pathname.startsWith(p));
  if (isProtected && !userRole) {
    if (pathname.startsWith('/super-admin') || (pathname.startsWith('/studio-8f2k') && !pathname.startsWith('/studio-8f2k/mgmt'))) {
      return NextResponse.redirect(new URL('/sushant-super-admin', req.url));
    }
    if (pathname.startsWith('/admin') || pathname.startsWith('/studio-8f2k/mgmt')) {
      return NextResponse.redirect(new URL('/sushant-admin', req.url));
    }
    if (pathname.startsWith('/employee-portal') || pathname.startsWith('/editor-portal') || pathname.startsWith('/project-manager')) {
      return NextResponse.redirect(new URL('/employee', req.url));
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Authenticated — check role
  if (isProtected && userRole) {
    const matchedPrefix = Object.keys(ROLE_ROUTES).find(p => pathname.startsWith(p));
    if (matchedPrefix) {
      const allowed = ROLE_ROUTES[matchedPrefix];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL(getDashboardUrl(userRole), req.url));
      }
    }
  }

  return response;
}

function getDashboardUrl(role: Role): string {
  switch (role) {
    case Role.SUPER_ADMIN:    return '/super-admin';
    case Role.ADMIN:          return '/admin';
    case Role.CLIENT:         return '/client-portal';
    case Role.TALENT:         return '/talent-dashboard';
    case Role.EDITOR:         return '/editor-portal';
    case Role.EMPLOYEE:       return '/employee-portal';
    case Role.PROJECT_MANAGER:return '/project-manager';
    default:                  return '/';
  }
}

export const config = {
  matcher: [
    '/studio-8f2k',
    '/studio-8f2k/:path*',
    '/super-admin',
    '/super-admin/:path*',
    '/admin',
    '/admin/:path*',
    '/client-portal',
    '/client-portal/:path*',
    '/talent-dashboard',
    '/talent-dashboard/:path*',
    '/editor-portal',
    '/editor-portal/:path*',
    '/employee-portal',
    '/employee-portal/:path*',
    '/project-manager',
    '/project-manager/:path*',
    '/model/dashboard/:path*',
  ],
};
