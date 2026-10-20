import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const bcrypt = eval("require('bcryptjs')");

const ROLES = ['GUEST', 'CLIENT', 'TALENT', 'EDITOR', 'EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export async function POST(req: Request) {
  const session = await auth();
  const actorRole = (session as any)?.user?.role;

  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (actorRole !== 'SUPER_ADMIN' && actorRole !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, email, password } = body;
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
        role: role as any,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true, data: user });
  } catch (e: any) {
    console.error('Error creating user:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to create user' }, { status: 500 });
  }
}
