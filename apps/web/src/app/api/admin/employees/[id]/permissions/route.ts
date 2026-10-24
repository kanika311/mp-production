import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/cms/server/guard';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const PERMISSIONS_FILE = path.join(process.cwd(), 'data', 'employee_permissions.json');

function ensureDataDir() {
  const dir = path.dirname(PERMISSIONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadPermissions(): Record<string, any> {
  try {
    ensureDataDir();
    if (fs.existsSync(PERMISSIONS_FILE)) {
      const content = fs.readFileSync(PERMISSIONS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading permissions:', err);
  }
  return {};
}

function savePermissions(data: Record<string, any>) {
  try {
    ensureDataDir();
    fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving permissions:', err);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolved = await params;
  const userId = resolved.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        employee: {
          select: {
            id: true,
            designation: true,
            department: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allPerms = loadPermissions();
    const userPerms = allPerms[userId] || {
      idleTimeoutMinutes: 30,
      modules: {
        talentRoster: true,
        services: false,
        blogs: true,
        youtuber: false,
        projects: true,
        leads: false,
        expenses: false,
        mediaAssets: true,
      },
    };

    return NextResponse.json({
      success: true,
      user,
      permissions: userPerms,
    });
  } catch (error: any) {
    console.error('Error fetching employee permissions:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;
  const body = await req.json().catch(() => ({}));

  try {
    const allPerms = loadPermissions();
    allPerms[userId] = {
      idleTimeoutMinutes: Number(body.idleTimeoutMinutes) || 30,
      modules: body.modules || {},
      updatedAt: new Date().toISOString(),
    };
    savePermissions(allPerms);

    // Also log in audit trail if possible
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_EMPLOYEE_PERMISSIONS',
          resource: 'EmployeePermission',
          resourceId: userId,
          after: allPerms[userId],
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Permissions & session timeout updated successfully!',
      permissions: allPerms[userId],
    });
  } catch (error: any) {
    console.error('Error saving permissions:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
