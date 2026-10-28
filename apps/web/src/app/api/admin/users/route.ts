import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  const queryParams = new URLSearchParams({ page, limit });
  if (search) queryParams.set('search', search);
  if (role) queryParams.set('role', role);

  // Primary: Direct authoritative PostgreSQL Database query via Prisma (super fast & resilient)
  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10)));
    const where: any = {};
    if (role) {
      if (role === 'ADMIN') {
        where.role = { in: ['ADMIN', 'SUPER_ADMIN'] };
      } else if (role === 'EMPLOYEE') {
        where.role = { in: ['EMPLOYEE', 'EDITOR', 'PROJECT_MANAGER'] };
      } else if (role.includes(',')) {
        where.role = { in: role.split(',').map((r: string) => r.trim()) };
      } else {
        where.role = role;
      }
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [usersList, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          employee: {
            select: {
              id: true,
              designation: true,
              department: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      data: usersList,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (dbErr: any) {
    console.warn('Direct database query warning, falling back to backendFetch:', dbErr.message);
  }

  // Fallback to remote backendFetch if local database is unreachable
  const result = await backendFetch(`/admin/users?${queryParams.toString()}`);
  if (result.ok && result.data) {
    const rawData: any = result.data;
    const usersList = Array.isArray(rawData?.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];
    const total = rawData?.total ?? usersList.length;
    const totalPages = rawData?.totalPages ?? 1;

    return NextResponse.json({
      ok: true,
      data: usersList,
      total,
      page: Number(page),
      totalPages,
    });
  }

  return NextResponse.json({ ok: false, error: result.error || 'Failed to fetch users' }, { status: result.status || 500 });
}
