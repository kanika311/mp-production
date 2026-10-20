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
    if (!payload || !payload.sub) return null;

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role?.toString().toUpperCase(),
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
