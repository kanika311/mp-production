import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const result = await backendFetch(`/admin/users/${id}/deactivate`, {
    method: 'PATCH',
  });

  if (result.ok) {
    return NextResponse.json({ ok: true, data: result.data });
  }

  // Fallback to Prisma directly
  try {
    const { PrismaClient } = eval("require('@prisma/client')");
    const poolerUrl = (process.env.DATABASE_URL || '').replace(':5432/', ':6543/') + 
      (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
    const prisma = new PrismaClient({ datasources: { db: { url: poolerUrl } } });
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, role: true, isActive: true },
    });
    await prisma.$disconnect();
    return NextResponse.json({ ok: true, data: updated });
  } catch (dbErr: any) {
    return NextResponse.json({ ok: false, error: result.error || dbErr.message }, { status: result.status || 500 });
  }
}
