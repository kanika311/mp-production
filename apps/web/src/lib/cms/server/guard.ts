import { auth } from '@/auth';
import { cookies, headers } from 'next/headers';
import { verifySessionToken } from '@/lib/jwt';

/**
 * Verify the caller has an admin-level session or valid auth token/cookie.
 * Checks NextAuth session, Bearer Authorization header, and all internal session cookies.
 * Returns { role, userId } on success, or null when unauthorized.
 */
export async function requireAdmin(): Promise<{ role: string; userId?: string } | null> {
  // 1. Check Bearer Authorization header
  try {
    const headerList = await headers();
    const authHeader = headerList.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.substring(7).trim();
      const payload = await verifySessionToken(token);
      const role = (payload?.role as string)?.toUpperCase();
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        return { role, userId: (payload?.sub || payload?.id) as string };
      }
    }
  } catch {}

  // 2. Check all possible JWT auth cookies
  try {
    const cookieStore = await cookies();

    // Direct role cookie if present
    const cookieRole = cookieStore.get('mdms_auth_role')?.value?.toUpperCase();
    if (cookieRole === 'SUPER_ADMIN' || cookieRole === 'ADMIN') {
      return { role: cookieRole };
    }

    const tokenCookie =
      cookieStore.get('token')?.value ||
      cookieStore.get('mdms_auth_token')?.value ||
      cookieStore.get('next-auth.session-token')?.value ||
      cookieStore.get('__Secure-next-auth.session-token')?.value;

    if (tokenCookie) {
      const cleanToken = decodeURIComponent(tokenCookie).trim().replace(/^"|"$/g, '');
      const payload = await verifySessionToken(cleanToken);
      const role = (payload?.role as string)?.toUpperCase();
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        return { role, userId: (payload?.sub || payload?.id) as string };
      }
    }
  } catch {}

  // 3. Check NextAuth session
  try {
    const session = await auth();
    const role = session?.user?.role;
    const upperRole = role?.toUpperCase();
    if (upperRole === 'SUPER_ADMIN' || upperRole === 'ADMIN') {
      return { role: upperRole, userId: (session.user as any)?.id };
    }
  } catch {}

  // In development/local testing, fallback to SUPER_ADMIN so CMS connects cleanly to NestJS API
  if (process.env.NODE_ENV === 'development') {
    return { role: 'SUPER_ADMIN' };
  }

  return null;
}
