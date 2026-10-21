import { auth } from '@/auth';
import { cookies } from 'next/headers';

/**
 * Verify the caller has an admin-level NextAuth session or valid auth cookie.
 * Returns the role on success, or null when unauthorized.
 */
export async function requireAdmin(): Promise<{ role: string } | null> {
  const session = await auth();
  const role = session?.user?.role;
  const upperRole = role?.toUpperCase();
  if (upperRole === 'SUPER_ADMIN' || upperRole === 'ADMIN') {
    return { role: upperRole };
  }

  try {
    const cookieStore = await cookies();
    const cookieRole = cookieStore.get('mdms_auth_role')?.value?.toUpperCase();
    if (cookieRole === 'SUPER_ADMIN' || cookieRole === 'ADMIN') {
      return { role: cookieRole };
    }
  } catch {}

  // In development/local testing, fallback to SUPER_ADMIN so CMS connects cleanly to NestJS API
  if (process.env.NODE_ENV === 'development') {
    return { role: 'SUPER_ADMIN' };
  }
  return null;
}
