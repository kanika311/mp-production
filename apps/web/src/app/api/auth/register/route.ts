import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken } from '@/lib/jwt';
import { Role } from '@mdms/types';

const bcrypt = eval("require('bcryptjs')");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role = 'CLIENT' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: 'insensitive' } },
    });

    if (existing) {
      return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Normalize role enum
    const upperRole = role.toUpperCase();
    const validRole = (Object.values(Role) as string[]).includes(upperRole)
      ? (upperRole as Role)
      : Role.CLIENT;

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        passwordHash,
        role: validRole,
        firstName,
        lastName,
        isActive: true,
      },
    });

    // Auto-create role profile if needed
    if (validRole === Role.TALENT) {
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          stageName: name.trim(),
          bio: '',
          status: 'ACTIVE',
        },
      }).catch((e) => console.warn('Could not auto-create talent profile:', e));
    } else if (validRole === Role.CLIENT) {
      await prisma.client.create({
        data: {
          userId: user.id,
          companyName: name.trim(),
        },
      }).catch((e) => console.warn('Could not auto-create client profile:', e));
    }

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    const token = await signSessionToken({
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      name: fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: fullName,
      },
      token,
    }, { status: 201 });

    const cookieOptions = {
      path: '/',
      httpOnly: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    };

    response.cookies.set('token', token, cookieOptions);
    response.cookies.set('mdms_auth_token', token, cookieOptions);
    response.cookies.set('next-auth.session-token', token, cookieOptions);

    return response;
  } catch (err: unknown) {
    console.error('Registration API error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
