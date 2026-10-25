import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

const PERMISSIONS_FILE = path.join(process.cwd(), 'data', 'employee_permissions.json');

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    const session = await auth().catch(() => null);
    if (session?.user?.id) {
      userId = session.user.id;
    }

    if (!userId) {
      // Check Bearer token or cookies
      const rawToken =
        req.cookies.get('token')?.value ||
        req.cookies.get('mdms_auth_token')?.value ||
        req.cookies.get('next-auth.session-token')?.value ||
        req.headers.get('authorization')?.replace('Bearer ', '');

      if (rawToken) {
        try {
          const { verifySessionToken } = await import('@/lib/jwt');
          const payload = await verifySessionToken(rawToken.trim().replace(/^"|"$/g, ''));
          if (payload?.sub) userId = payload.sub;
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let permissions = {
      idleTimeoutMinutes: 30,
      modules: {
        blogs: true,
        talent: true,
        talentRoster: true,
        services: false,
        'become-a-youtuber': false,
        youtuber: false,
        projects: true,
        'home-page': false,
        homePage: false,
        'footer-cms': false,
        footerCms: false,
        sponsored: false,
        'contact-leads': false,
        leads: false,
        clients: false,
        talents: false,
        employees: false,
        users: false,
        mediaAssets: true,
        expenses: false,
      },
    };

    if (fs.existsSync(PERMISSIONS_FILE)) {
      try {
        const raw = fs.readFileSync(PERMISSIONS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed[userId]) {
          const p = parsed[userId];
          const m = p.modules || {};
          permissions = {
            idleTimeoutMinutes: p.idleTimeoutMinutes || 30,
            modules: {
              ...m,
              talent: m.talent ?? m.talentRoster ?? false,
              talentRoster: m.talentRoster ?? m.talent ?? false,
              'become-a-youtuber': m['become-a-youtuber'] ?? m.youtuber ?? false,
              youtuber: m.youtuber ?? m['become-a-youtuber'] ?? false,
              'home-page': m['home-page'] ?? m.homePage ?? false,
              homePage: m.homePage ?? m['home-page'] ?? false,
              'footer-cms': m['footer-cms'] ?? m.footerCms ?? false,
              footerCms: m.footerCms ?? m['footer-cms'] ?? false,
              'contact-leads': m['contact-leads'] ?? m.leads ?? false,
              leads: m.leads ?? m['contact-leads'] ?? false,
            },
          };
        }
      } catch (e) {
        console.error('Error reading permissions file:', e);
      }
    }

    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
