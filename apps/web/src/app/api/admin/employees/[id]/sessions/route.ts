import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/cms/server/guard';
import { prisma } from '@/lib/prisma';

function parseUserAgent(ua?: string | null): string {
  if (!ua) return 'Desktop Browser';
  let os = 'OS';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 11 / 10';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('iPhone')) os = 'iPhone iOS';
  else if (ua.includes('iPad')) os = 'iPad iOS';
  else if (ua.includes('Android')) os = 'Android Mobile';
  else if (ua.includes('Linux')) os = 'Linux';

  let browser = 'Web Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';

  return `${os} • ${browser}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;

  try {
    let user: any = null;
    let employee: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          lastLoginAt: true,
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });

      employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
          attendance: {
            orderBy: { checkInAt: 'desc' },
            take: 20,
          },
        },
      });
    } catch (dbErr) {
      console.warn('Database session fetch error:', dbErr);
    }

    const formattedSessions = [];

    // Real DB active & recorded sessions
    if (user?.sessions && user.sessions.length > 0) {
      for (const s of user.sessions) {
        const isExpired = new Date(s.expiresAt) < new Date();
        const now = Date.now();
        const sessionStart = new Date(s.createdAt).getTime();
        const elapsedMinutes = Math.max(1, Math.round((now - sessionStart) / 60000));

        let durationText = `${elapsedMinutes}m active`;
        if (elapsedMinutes >= 60) {
          const hrs = Math.floor(elapsedMinutes / 60);
          const mins = elapsedMinutes % 60;
          durationText = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
        }
        if (isExpired) {
          durationText = 'Session Expired';
        }

        const ip = s.ipAddress || '127.0.0.1';
        formattedSessions.push({
          id: s.id,
          loginTime: s.createdAt,
          ipAddress: ip,
          device: parseUserAgent(s.userAgent),
          status: isExpired ? 'Expired' : 'Active Now',
          duration: durationText,
          location: ip === '127.0.0.1' || ip === '::1' ? 'Localhost Network' : 'Web Login IP',
        });
      }
    } else if (user?.lastLoginAt) {
      // If user has recorded login timestamp in User table
      formattedSessions.push({
        id: `login-${user.id}`,
        loginTime: user.lastLoginAt,
        ipAddress: 'System Authenticated',
        device: 'Staff Portal Session',
        status: 'Recorded Login',
        duration: 'Logged In',
        location: 'Production Server',
      });
    }

    // Real verified employee attendance shifts
    if (employee?.attendance && employee.attendance.length > 0) {
      for (const att of employee.attendance) {
        const checkOut = att.checkOutAt ? new Date(att.checkOutAt) : null;
        formattedSessions.push({
          id: `att-${att.id}`,
          loginTime: att.checkInAt,
          ipAddress: att.lat && att.lng ? `GPS: ${Number(att.lat).toFixed(4)}, ${Number(att.lng).toFixed(4)}` : 'Studio Location',
          device: 'Punch Attendance Shift',
          status: checkOut ? 'Completed Shift' : 'Live Clocked-In',
          duration: att.durationMin ? `${att.durationMin} mins` : (checkOut ? 'Recorded Shift' : 'Active Now'),
          location: att.notes || 'Studio Attendance',
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: user ? `${user.firstName} ${user.lastName}`.trim() : 'Staff Member',
        email: user?.email || '',
        role: user?.role || 'EMPLOYEE',
      },
      sessions: formattedSessions,
    });
  } catch (error: any) {
    console.error('Error fetching employee sessions:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
