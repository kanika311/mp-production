import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        attendance: { take: 20, orderBy: { checkInAt: 'desc' } },
        leaveRequests: { take: 20, orderBy: { createdAt: 'desc' } },
        expenseClaims: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error('Error fetching employee data:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    // Auto-create employee record if user has role EMPLOYEE but no row in Employee table
    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          userId: session.user.id,
          designation: 'Production Staff',
          department: 'Studio Operations',
          joiningDate: new Date(),
        },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'check-in') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          checkInAt: { gte: today },
          checkOutAt: null,
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'You are already checked in for today.' }, { status: 400 });
      }

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          checkInAt: new Date(),
          checkInLat: body.lat ? parseFloat(body.lat) : null,
          checkInLng: body.lng ? parseFloat(body.lng) : null,
          notes: body.notes || 'Office Check-in',
        },
      });

      return NextResponse.json({ success: true, message: 'Punched in successfully!', attendance });
    }

    if (action === 'check-out') {
      const openAttendance = await prisma.attendance.findFirst({
        where: { employeeId: employee.id, checkOutAt: null },
        orderBy: { checkInAt: 'desc' },
      });

      if (!openAttendance) {
        return NextResponse.json({ error: 'No open check-in found to punch out from.' }, { status: 400 });
      }

      const checkOutAt = new Date();
      const durationMin = Math.round((checkOutAt.getTime() - new Date(openAttendance.checkInAt).getTime()) / 60000);

      const attendance = await prisma.attendance.update({
        where: { id: openAttendance.id },
        data: {
          checkOutAt,
          checkOutLat: body.lat ? parseFloat(body.lat) : null,
          checkOutLng: body.lng ? parseFloat(body.lng) : null,
          durationMin,
          notes: body.notes || openAttendance.notes,
        },
      });

      return NextResponse.json({ success: true, message: 'Punched out successfully!', attendance });
    }

    if (action === 'leave-request') {
      const { leaveType, startDate, endDate, reason } = body;
      if (!startDate || !endDate) {
        return NextResponse.json({ error: 'Start and end date are required.' }, { status: 400 });
      }

      const leave = await prisma.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveType: leaveType || 'Casual',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason: reason || '',
          status: 'PENDING',
        },
      });

      return NextResponse.json({ success: true, message: 'Leave request submitted for manager review.', leave });
    }

    if (action === 'expense-claim') {
      const { amount, category, description } = body;
      const numAmount = parseInt(String(amount).replace(/\D/g, ''), 10);
      if (!numAmount || numAmount <= 0) {
        return NextResponse.json({ error: 'Valid expense amount is required.' }, { status: 400 });
      }

      const claim = await prisma.expenseClaim.create({
        data: {
          employeeId: employee.id,
          amount: numAmount * 100, // store in paise
          category: category || 'Production Expense',
          description: description || '',
          status: 'SUBMITTED',
        },
      });

      return NextResponse.json({ success: true, message: 'Expense claim submitted for reimbursement approval.', claim });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling employee action:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
