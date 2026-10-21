import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/cms/server/guard';
import { PrismaClient } from '@prisma/client';

function getPrisma() {
  const poolerUrl = (process.env.DATABASE_URL || '').replace(':5432/', ':6543/') + 
    (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
  return new PrismaClient({
    datasources: {
      db: { url: poolerUrl },
    },
  });
}

const bcrypt = eval("require('bcryptjs')");

const ROLES = ['GUEST', 'CLIENT', 'TALENT', 'EDITOR', 'EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export async function POST(req: Request) {
  const adminAuth = await requireAdmin();
  if (!adminAuth) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const actorRole = adminAuth.role;

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

  const prisma = getPrisma();
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
  } finally {
    await prisma.$disconnect();
  }
}
