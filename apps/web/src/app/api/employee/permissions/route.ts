import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

const PERMISSIONS_FILE = path.join(process.cwd(), 'data', 'employee_permissions.json');

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    let permissions = {
      idleTimeoutMinutes: 30,
      modules: {
        talentRoster: true,
        services: true,
        blogs: true,
        youtuber: false,
        projects: true,
        leads: true,
        expenses: true,
        mediaAssets: true,
      },
    };

    if (fs.existsSync(PERMISSIONS_FILE)) {
      try {
        const raw = fs.readFileSync(PERMISSIONS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed[userId]) {
          permissions = parsed[userId];
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
