import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken } from '@/lib/jwt';

const bcrypt = eval("require('bcryptjs')");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, loginType } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim();

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: trimmedEmail,
          mode: 'insensitive',
        },
      },
      include: {
        employee: true,
        talentProfile: true,
        client: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { ok: false, error: 'Account is deactivated. Please contact support.' },
        { status: 403 },
      );
    }

    // Password validation
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { ok: false, error: 'Invalid email or password' },
          { status: 401 },
        );
      }
    } else {
      // First-time local login for user originally created via external auth (e.g. Supabase Auth)
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash },
      });
    }

    // Determine effective role based on login portal (employee portal vs normal login)
    const isEmployeeEligible = ['EMPLOYEE', 'EDITOR', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) || !!user.employee;
    const isTalentUser = !!user.talentProfile || user.role === 'TALENT';
    const isClientUser = !!user.client || user.role === 'CLIENT';

    let effectiveRole = user.role;

    if (loginType === 'employee') {
      // Attempting to log into the Employee & Staff Portal (/employee)
      if (!isEmployeeEligible) {
        return NextResponse.json(
          { ok: false, error: 'Access Denied. This login portal is strictly reserved for internal employees & production crew.' },
          { status: 403 },
        );
      }
      // If user has employee profile or employee role, ensure role is active employee
      if (['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'PROJECT_MANAGER'].includes(user.role)) {
        effectiveRole = user.role;
      } else {
        effectiveRole = 'EMPLOYEE' as any;
      }
    } else {
      // Normal login portal (/login)
      if (isTalentUser) {
        // Log in to Talent dashboard
        effectiveRole = 'TALENT' as any;
      } else if (isClientUser) {
        // Log in to Client portal
        effectiveRole = 'CLIENT' as any;
      } else if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        effectiveRole = user.role;
      } else if (isEmployeeEligible) {
        // User is ONLY an employee with no talent or client profile
        return NextResponse.json(
          { ok: false, error: 'Employee accounts must log in via the Employee Portal at /employee.' },
          { status: 403 },
        );
      }
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0,
      },
    });

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    const token = await signSessionToken({
      sub: user.id,
      id: user.id,
      email: user.email,
      role: effectiveRole,
      name: fullName,
    });

    // Extract real client IP & device user agent
    const rawIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip')?.trim() ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent')?.trim() || 'Web Browser';

    // Record real session in PostgreSQL database
    try {
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: token,
          userAgent,
          ipAddress: rawIp,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        },
      });
    } catch (sessErr) {
      console.warn('Could not record user session:', sessErr);
    }

    const response = NextResponse.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: effectiveRole,
        name: fullName,
      },
    });

    // Set auth cookies for Edge middleware, SSR, and client components
    const cookieOptions = {
      path: '/',
      httpOnly: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
    };

    response.cookies.set('token', token, cookieOptions);
    response.cookies.set('mdms_auth_token', token, cookieOptions);
    response.cookies.set('next-auth.session-token', token, cookieOptions);
    response.cookies.set('mdms_auth_role', effectiveRole, cookieOptions);

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
