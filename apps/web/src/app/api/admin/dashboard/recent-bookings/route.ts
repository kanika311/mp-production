import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';
import { prisma } from '@/lib/prisma';

/**
 * BFF proxy for the admin dashboard recent-bookings widget. Authenticates
 * server-side with the CMS service token and forwards the result.
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Try NestJS backend first
  try {
    const result = await backendFetch('/admin/dashboard/recent-bookings');
    if (result && result.ok && result.data && Array.isArray(result.data)) {
      return NextResponse.json(result, { status: 200 });
    }
  } catch (e) {}

  // 2. Direct Prisma query fallback
  try {
    const [bookings, hireRequests] = await Promise.all([
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          client: {
            include: { user: true },
          },
        },
      }),
      prisma.hireRequest.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          talent: {
            include: { user: true },
          },
        },
      }),
    ]);

    const formattedBookings = bookings.map((b) => ({ ...b, type: 'BOOKING' }));
    const formattedHireRequests = hireRequests.map((hr) => ({
      id: hr.id,
      client: {
        user: {
          firstName: hr.requesterName,
          lastName: '',
          email: hr.requesterEmail,
          phone: hr.requesterPhone,
        },
      },
      service: {
        name: hr.projectType || 'Talent Booking',
        basePrice: null,
      },
      projectBrief: hr.briefDescription,
      dateNeeded: hr.dateNeeded,
      budget: hr.budgetRange || '—',
      status: hr.status === 'NEW' ? 'INQUIRY' : hr.status === 'CONFIRMED' ? 'CONFIRMED' : 'CANCELLED',
      createdAt: hr.createdAt,
      talentName: hr.talent?.user ? `${hr.talent.user.firstName || ''} ${hr.talent.user.lastName || ''}`.trim() : 'Talent',
      type: 'HIRE_REQUEST',
    }));

    const merged = [...formattedBookings, ...formattedHireRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ ok: true, data: merged.slice(0, 20) }, { status: 200 });
  } catch (dbErr: any) {
    return NextResponse.json({ ok: false, error: dbErr.message }, { status: 500 });
  }
}

