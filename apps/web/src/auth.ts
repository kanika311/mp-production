import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/jwt';

export const auth = async () => {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('token')?.value ||
      cookieStore.get('mdms_auth_token')?.value ||
      cookieStore.get('next-auth.session-token')?.value ||
      cookieStore.get('__Secure-next-auth.session-token')?.value;

    if (!token) return null;

    const payload = await verifySessionToken(token);
    const resolvedId = payload?.sub || (payload as any)?.id || (payload as any)?.userId || (payload as any)?.user_id;
    if (!payload || !resolvedId) return null;

    const rawRole = payload.role || (payload as any)?.user_metadata?.role || (payload as any)?.app_metadata?.role || 'TALENT';
    const resolvedRole = rawRole.toString().toUpperCase().replace(/-/g, '_');

    return {
      user: {
        id: resolvedId,
        email: payload.email,
        name: payload.name || (payload as any)?.user_metadata?.full_name,
        role: resolvedRole,
      },
      accessToken: token,
    };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error('Error in auth() helper:', err);
    return null;
  }
};
