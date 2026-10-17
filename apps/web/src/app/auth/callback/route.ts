import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zmpeiobdilrgtuzggzuj.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcGVpb2JkaWxyZ3R1emdnenVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NTc2MTUsImV4cCI6MjA5OTEzMzYxNX0.GRniMpKh5WW65JOmQl8znK_dme06iE8o_nIaGBV7-BI';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (errorParam || errorDescription) {
    const message = encodeURIComponent(
      errorDescription || errorParam || 'Authentication failed'
    );
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const cookiesToSetOnRedirect: { name: string; value: string; options?: any }[] = [];

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookiesToSetOnRedirect.push({ name, value, options });
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignore in server context if setAll is called after headers started
            }
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session && data?.user) {
      const user = data.user;
      const role = (
        user.user_metadata?.role ||
        user.app_metadata?.role ||
        'client'
      )
        .toString()
        .toLowerCase()
        .replace(/-/g, '_');

      let targetUrl = '/client-portal';
      if (role === 'super_admin') targetUrl = '/studio-8f2k';
      else if (role === 'admin') targetUrl = '/studio-8f2k/mgmt';
      else if (role === 'model' || role === 'talent') targetUrl = '/talent-dashboard/edit';
      else if (role === 'editor') targetUrl = '/editor-portal';
      else if (role === 'employee') targetUrl = '/employee-portal';
      else if (role === 'project_manager') targetUrl = '/project-manager';

      const forwardUrl = next && next.startsWith('/') ? next : targetUrl;
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      let redirectUrl: string;
      if (isLocalEnv) {
        redirectUrl = `${origin}${forwardUrl}`;
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${forwardUrl}`;
      } else {
        redirectUrl = `${origin}${forwardUrl}`;
      }

      const response = NextResponse.redirect(redirectUrl);

      // Copy Supabase auth session cookies onto the redirect response
      cookiesToSetOnRedirect.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      // Convenience cookies for middleware & legacy checks
      response.cookies.set('mdms_auth_token', data.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      response.cookies.set('mdms_auth_role', role, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });

      return response;
    }

    if (error) {
      console.error('Supabase code exchange error:', error);
      const message = encodeURIComponent(
        error.message || 'Unable to exchange OAuth code for session'
      );
      return NextResponse.redirect(`${origin}/login?error=${message}`);
    }
  }

  // Client-side fallback if token was sent via hash fragment (#access_token=...)
  return new NextResponse(
    `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Signing in...</title>
  </head>
  <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0a0a0a; color: #fff;">
    <div style="text-align: center;">
      <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #eb3d26; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 16px; font-size: 14px; opacity: 0.8;">Completing your Google sign in...</p>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    <script>
      (function() {
        if (window.location.hash && window.location.hash.includes('access_token')) {
          var params = new URLSearchParams(window.location.hash.substring(1));
          var token = params.get('access_token');
          if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('mdms_auth_token', token);
            document.cookie = 'mdms_auth_token=' + token + '; path=/; max-age=604800; SameSite=Lax';
            window.location.href = '/client-portal';
            return;
          }
        }
        window.location.href = '/login?error=' + encodeURIComponent('Missing authorization code');
      })();
    </script>
  </body>
</html>`,
    {
      headers: { 'Content-Type': 'text/html' },
    }
  );
}
