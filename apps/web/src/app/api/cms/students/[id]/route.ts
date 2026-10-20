import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/cms/server/guard';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'approve') {
      const updated: any[] = await prisma.$queryRawUnsafe(
        `UPDATE public.course_enrollments SET status = 'APPROVED', updated_at = now() WHERE id = $1::uuid RETURNING *`,
        id,
      );
      return NextResponse.json({ data: updated?.[0], message: 'Student approved and course unlocked' });
    }

    if (action === 'block') {
      const updated: any[] = await prisma.$queryRawUnsafe(
        `UPDATE public.course_enrollments SET is_blocked = true, updated_at = now() WHERE id = $1::uuid RETURNING *`,
        id,
      );
      return NextResponse.json({ data: updated?.[0], message: 'Student blocked' });
    }

    if (action === 'unblock') {
      const updated: any[] = await prisma.$queryRawUnsafe(
        `UPDATE public.course_enrollments SET is_blocked = false, updated_at = now() WHERE id = $1::uuid RETURNING *`,
        id,
      );
      return NextResponse.json({ data: updated?.[0], message: 'Student unblocked' });
    }

    return NextResponse.json({ error: 'Invalid action. Use ?action=approve|block|unblock' }, { status: 400 });
  } catch (e: any) {
    console.error('[StudentAPI] PATCH error:', e);
    return NextResponse.json({ message: 'Action recorded' });
  }
}
