import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const next = searchParams.get('next') || state;
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (errorParam || errorDescription) {
    const message = encodeURIComponent(
      errorDescription || errorParam || 'Google Authentication cancelled or failed.'
    );
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (code && clientId && clientSecret) {
    try {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
      const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
      const baseUrl = isLocal ? origin : (forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin);
      const { pathname } = new URL(request.url);
      const redirectUri = `${baseUrl}${pathname}`;

      // 1. Exchange authorization code for Google access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('Google token exchange error:', tokenData);
        const errMsg = encodeURIComponent(
          tokenData.error_description || tokenData.error || 'Failed to exchange Google OAuth code.'
        );
        return NextResponse.redirect(`${origin}/login?error=${errMsg}`);
      }

      // 2. Fetch user profile from Google UserInfo endpoint
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        console.error('Failed to fetch Google user profile');
        return NextResponse.redirect(`${origin}/login?error=Failed+to+fetch+Google+user+profile`);
      }

      const googleUser = await userInfoRes.json();
      const email = (googleUser.email || '').toLowerCase().trim();

      if (!email) {
        return NextResponse.redirect(`${origin}/login?error=No+email+associated+with+this+Google+account`);
      }

      // 3. Upsert user in PostgreSQL database via Prisma
      let user = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
        },
      });

      const firstName = googleUser.given_name || googleUser.name?.split(' ')[0] || 'User';
      const lastName = googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '';

      if (!user) {
        // Automatically register new user with CLIENT role
        user = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            role: 'CLIENT',
            isActive: true,
            avatarUrl: googleUser.picture || null,
          },
        });
      } else {
        if (!user.isActive) {
          return NextResponse.redirect(`${origin}/login?error=Your+account+has+been+deactivated.+Please+contact+support.`);
        }

        // Update login timestamp and avatar if available
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginAttempts: 0,
            ...(!user.avatarUrl && googleUser.picture ? { avatarUrl: googleUser.picture } : {}),
          },
        });
      }

      // 4. Generate internal JWT session token
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      const role = (user.role || 'CLIENT').toString().toUpperCase();

      const sessionToken = await signSessionToken({
        sub: user.id,
        id: user.id,
        email: user.email,
        role: user.role,
        name: fullName,
      });

      // 5. Determine redirect destination based on user role
      let targetPath = '/client-portal';
      if (role === 'SUPER_ADMIN') targetPath = '/super-admin';
      else if (role === 'ADMIN') targetPath = '/admin';
      else if (role === 'TALENT') targetPath = '/talent-dashboard';
      else if (role === 'EDITOR') targetPath = '/editor-portal';
      else if (role === 'EMPLOYEE') targetPath = '/employee-portal';
      else if (role === 'PROJECT_MANAGER') targetPath = '/project-manager';

      const finalPath = next && next.startsWith('/') ? next : targetPath;
      const redirectUrl = `${origin}${finalPath}`;

      // 6. Set auth cookies
      const cookieOptions = {
        path: '/',
        httpOnly: false,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
      };

      const response = new NextResponse(
        `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Signing in...</title>
  </head>
  <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0a0a0a; color: #fff;">
    <div style="text-align: center;">
      <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #eb3d26; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 16px; font-size: 15px; font-weight: 500; opacity: 0.9;">Completing Google Sign In...</p>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    <script>
      (function() {
        var token = ${JSON.stringify(sessionToken)};
        var redirectUrl = ${JSON.stringify(redirectUrl)};
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('mdms_auth_token', token);
          document.cookie = 'token=' + token + '; path=/; max-age=604800; SameSite=Lax';
          document.cookie = 'mdms_auth_token=' + token + '; path=/; max-age=604800; SameSite=Lax';
          document.cookie = 'next-auth.session-token=' + token + '; path=/; max-age=604800; SameSite=Lax';
        }
        window.location.replace(redirectUrl);
      })();
    </script>
  </body>
</html>`,
        {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );

      response.cookies.set('token', sessionToken, cookieOptions);
      response.cookies.set('mdms_auth_token', sessionToken, cookieOptions);
      response.cookies.set('next-auth.session-token', sessionToken, cookieOptions);
      response.cookies.set('mdms_auth_role', role.toLowerCase(), cookieOptions);

      return response;
    } catch (err: any) {
      console.error('Google OAuth callback handler error:', err);
      const message = encodeURIComponent(err?.message || 'Unexpected authentication error');
      return NextResponse.redirect(`${origin}/login?error=${message}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Missing+Google+authorization+code`);
}
