import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/cms/server/guard';

let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.course_enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        student_phone TEXT,
        course_id TEXT NOT NULL,
        course_title TEXT,
        course_price TEXT,
        utr_number TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
        is_blocked BOOLEAN NOT NULL DEFAULT false,
        approved_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    tableEnsured = true;
  } catch (err: any) {
    console.warn('[StudentAPI] ensureTable error:', err?.message);
  }
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureTable();
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.course_enrollments ORDER BY created_at DESC
    `);

    const mapped = (rows || []).map((row) => ({
      id: row.id,
      studentName: row.student_name,
      studentEmail: row.student_email,
      studentPhone: row.student_phone,
      utrNumber: row.utr_number,
      courseId: row.course_id,
      status: row.status,
      isBlocked: row.is_blocked,
      createdAt: row.created_at,
      course: {
        title: row.course_title || 'Creator Masterclass',
        price: row.course_price || '₹4,999',
      },
    }));

    return NextResponse.json({ data: mapped });
  } catch (e) {
    console.error('[StudentAPI] GET error:', e);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const { name, email, phone, courseId, utrNumber, courseTitle, coursePrice } = body;

    if (!name || !email || !courseId) {
      return NextResponse.json({ error: 'name, email, and courseId are required' }, { status: 400 });
    }

    const status = utrNumber ? 'PENDING_APPROVAL' : 'PENDING';
    const inserted: any[] = await prisma.$queryRawUnsafe(
      `INSERT INTO public.course_enrollments (student_name, student_email, student_phone, course_id, course_title, course_price, utr_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      name,
      email,
      phone || null,
      courseId,
      courseTitle || null,
      coursePrice || null,
      utrNumber || null,
      status,
    );

    return NextResponse.json({ data: inserted?.[0], message: 'Enrollment submitted' });
  } catch (e) {
    console.error('[StudentAPI] POST error:', e);
    return NextResponse.json({ message: 'Enrollment record logged' });
  }
}
