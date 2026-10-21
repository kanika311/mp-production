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

// GET: Get user details for View Modal
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;
  const prisma = getPrisma();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        talentProfile: {
          include: {
            userTalents: { include: { category: true } },
            portfolioMedia: true,
          },
        },
        client: true,
        employee: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Failed to fetch user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

const bcrypt = eval("require('bcryptjs')");

// PATCH: Edit user details (Name, Email, Role, Status, Password)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;
  const body = await req.json().catch(() => ({}));
  const { firstName, lastName, email, role, isActive, password } = body;

  const prisma = getPrisma();

  try {
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = String(firstName).trim();
    if (lastName !== undefined) updateData.lastName = String(lastName).trim();
    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      const existing = await prisma.user.findFirst({
        where: {
          email: { equals: cleanEmail, mode: 'insensitive' },
          NOT: { id: userId },
        },
      });
      if (existing) {
        return NextResponse.json({ ok: false, error: 'This email is already in use by another user' }, { status: 409 });
      }
      updateData.email = cleanEmail;
    }
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password && String(password).trim().length > 0) {
      if (String(password).trim().length < 6) {
        return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(String(password).trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, data: updatedUser, message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Failed to update user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Delete user & all related records
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;
  const prisma = getPrisma();

  try {
    // 1. If user has a talentProfile, delete child records first
    const talentProfile = await prisma.talentProfile.findUnique({ where: { userId } });
    if (talentProfile) {
      await prisma.userTalent.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.socialLink.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.userLanguage.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.userSkill.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.portfolioMedia.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.talentPricing.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.talentProfile.delete({ where: { id: talentProfile.id } });
    }

    // 2. Delete sessions, notifications, client, employee
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.client.deleteMany({ where: { userId } });
    await prisma.employee.deleteMany({ where: { userId } });

    // 3. Delete user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true, message: 'User permanently deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Failed to delete user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
