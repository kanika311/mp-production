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
    const existing = allPerms[userId] || {};
    const existingModules = existing.modules || {};

    const userPerms = {
      idleTimeoutMinutes: existing.idleTimeoutMinutes || 30,
      modules: {
        // Content & CMS
        blogs: existingModules.blogs ?? true,
        talent: existingModules.talent ?? existingModules.talentRoster ?? true,
        talentRoster: existingModules.talentRoster ?? existingModules.talent ?? true,
        services: existingModules.services ?? false,
        'become-a-youtuber': existingModules['become-a-youtuber'] ?? existingModules.youtuber ?? false,
        youtuber: existingModules.youtuber ?? existingModules['become-a-youtuber'] ?? false,
        projects: existingModules.projects ?? true,

        // Site Management
        'home-page': existingModules['home-page'] ?? existingModules.homePage ?? false,
        homePage: existingModules.homePage ?? existingModules['home-page'] ?? false,
        'footer-cms': existingModules['footer-cms'] ?? existingModules.footerCms ?? false,
        footerCms: existingModules.footerCms ?? existingModules['footer-cms'] ?? false,
        sponsored: existingModules.sponsored ?? false,

        // CRM & Leads
        'contact-leads': existingModules['contact-leads'] ?? existingModules.leads ?? false,
        leads: existingModules.leads ?? existingModules['contact-leads'] ?? false,

        // User Accounts
        clients: existingModules.clients ?? false,
        talents: existingModules.talents ?? false,
        employees: existingModules.employees ?? false,
        users: existingModules.users ?? false,

        // Operations
        mediaAssets: existingModules.mediaAssets ?? true,
        expenses: existingModules.expenses ?? false,
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
    const rawModules = body.modules || {};
    // Normalize aliases so both dash and camelCase keys work seamlessly
    const normalizedModules: Record<string, boolean> = {
      ...rawModules,
      talent: rawModules.talent ?? rawModules.talentRoster ?? false,
      talentRoster: rawModules.talentRoster ?? rawModules.talent ?? false,
      'become-a-youtuber': rawModules['become-a-youtuber'] ?? rawModules.youtuber ?? false,
      youtuber: rawModules.youtuber ?? rawModules['become-a-youtuber'] ?? false,
      'home-page': rawModules['home-page'] ?? rawModules.homePage ?? false,
      homePage: rawModules.homePage ?? rawModules['home-page'] ?? false,
      'footer-cms': rawModules['footer-cms'] ?? rawModules.footerCms ?? false,
      footerCms: rawModules.footerCms ?? rawModules['footer-cms'] ?? false,
      'contact-leads': rawModules['contact-leads'] ?? rawModules.leads ?? false,
      leads: rawModules.leads ?? rawModules['contact-leads'] ?? false,
    };

    const allPerms = loadPermissions();
    allPerms[userId] = {
      idleTimeoutMinutes: Number(body.idleTimeoutMinutes) || 30,
      modules: normalizedModules,
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
