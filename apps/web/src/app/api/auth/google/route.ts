import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google Client ID is not configured in environment variables' },
      { status: 500 }
    );
  }

  const { searchParams, origin } = new URL(req.url);
  const next = searchParams.get('next') || searchParams.get('redirect') || '';

  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';

  // In production behind reverse proxy (Nginx/Cloudflare), forwardedHost or host is the public domain (e.g. shivaste.com)
  const isTrulyLocal = (origin.includes('localhost') || origin.includes('127.0.0.1')) && !forwardedHost && (!host || host.includes('localhost') || host.includes('127.0.0.1'));
  const effectiveHost = forwardedHost || host;
  const baseUrl = isTrulyLocal ? origin : (effectiveHost ? `${forwardedProto}://${effectiveHost}` : origin);
  const redirectUri = `${baseUrl}/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: next,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(googleAuthUrl);
}
