import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken } from '@/lib/jwt';

const bcrypt = eval("require('bcryptjs')");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

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
      // Automatically hash and save their password locally in PostgreSQL
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash },
      });
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
      role: user.role,
      name: fullName,
    });

    const response = NextResponse.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: fullName,
      },
    });

    // Set auth cookies for Edge middleware, SSR, and client components
    const cookieOptions = {
      path: '/',
      httpOnly: false, // Accessible to client-side scripts as well
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
    };

    response.cookies.set('token', token, cookieOptions);
    response.cookies.set('mdms_auth_token', token, cookieOptions);
    response.cookies.set('next-auth.session-token', token, cookieOptions);

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
