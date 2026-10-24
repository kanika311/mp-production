import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/cms/server/guard';
import { prisma } from '@/lib/prisma';

const bcrypt = eval("require('bcryptjs')");

const ROLES = ['GUEST', 'CLIENT', 'TALENT', 'EDITOR', 'EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export async function POST(req: Request) {
  const adminAuth = await requireAdmin();
  if (!adminAuth) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const actorRole = adminAuth.role;

  const body = await req.json().catch(() => ({}));
  const { name, email, password, phone } = body;
  const role = String(body.role || '').toUpperCase();

  if (!name || !email || !password || !ROLES.includes(role)) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid fields (name, email, password, role).' }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
  }
  // Only SUPER_ADMIN may create elevated roles.
  if (actorRole !== 'SUPER_ADMIN' && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
    return NextResponse.json({ ok: false, error: 'Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN accounts.' }, { status: 403 });
  }

  const [firstName, ...rest] = String(name).trim().split(' ');
  const lastName = rest.join(' ') || '';

  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
    });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone: phone ? String(phone).trim() : null,
        role: role as any,
        isActive: true,
      },
    });

    // If role is EMPLOYEE, auto-create Employee profile
    if (role === 'EMPLOYEE' || role === 'EDITOR' || role === 'PROJECT_MANAGER') {
      try {
        await prisma.employee.create({
          data: {
            userId: user.id,
            designation: role === 'EDITOR' ? 'Video Editor' : role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Production Crew',
            department: 'Production',
          },
        });
      } catch (empErr) {
        console.warn('Could not auto-create employee profile:', empErr);
      }
    }

    return NextResponse.json({ ok: true, data: user });
  } catch (e: any) {
    console.error('Error creating user:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to create user' }, { status: 500 });
  }
}
