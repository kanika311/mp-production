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
      include: { employee: true, talentProfile: true, client: true },
    });

    if (existing) {
      // User with this email already exists (e.g. as TALENT or CLIENT).
      // Per system requirement: users are role-based; employee, talent, client can share the same email.
      // When provisioning from Employee section, assign the provisioned role and link profile.
      const passwordHash = await bcrypt.hash(password, 10);

      // Check if phone collides with another user
      let phoneToUpdate = existing.phone;
      if (phone && String(phone).trim()) {
        const cleanPhone = String(phone).trim();
        const phoneTaken = await prisma.user.findFirst({
          where: {
            phone: cleanPhone,
            id: { not: existing.id },
          },
        });
        if (!phoneTaken) {
          phoneToUpdate = cleanPhone;
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: role as any,
          passwordHash,
          isActive: true,
          phone: phoneToUpdate,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
        },
      });

      // Upsert profile for the provisioned role
      if (role === 'EMPLOYEE' || role === 'EDITOR' || role === 'PROJECT_MANAGER') {
        try {
          await prisma.employee.upsert({
            where: { userId: existing.id },
            update: {
              designation: role === 'EDITOR' ? 'Video Editor' : role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Production Crew',
              department: 'Production',
            },
            create: {
              userId: existing.id,
              designation: role === 'EDITOR' ? 'Video Editor' : role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Production Crew',
              department: 'Production',
            },
          });
        } catch (empErr) {
          console.warn('Could not auto-create/update employee profile:', empErr);
        }
      } else if (role === 'CLIENT') {
        try {
          await prisma.client.upsert({
            where: { userId: existing.id },
            update: {},
            create: { userId: existing.id },
          });
        } catch (clientErr) {
          console.warn('Could not upsert client profile:', clientErr);
        }
      }

      return NextResponse.json({
        ok: true,
        data: updatedUser,
        message: `Existing user account linked and updated with role ${role}.`,
      });
    }

    // Check phone uniqueness for new user
    let phoneToSet: string | null = null;
    if (phone && String(phone).trim()) {
      const cleanPhone = String(phone).trim();
      const phoneTaken = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      if (!phoneTaken) {
        phoneToSet = cleanPhone;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone: phoneToSet,
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
