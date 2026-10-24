import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/ui/Navbar';
import EmployeePortalClient from './EmployeePortalClient';

export const metadata = {
  title: 'Employee & Staff Portal | MP Productions',
  description: 'Internal workspace for production crew, staff attendance, leaves, and expenses.',
};

export default async function EmployeePortalPage() {
  const session = await auth();

  // If unauthenticated, redirect to employee login portal
  if (!session?.user?.id) {
    redirect('/employee');
  }

  const role = (session.user.role || '').toUpperCase();
  const allowedRoles = ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'EDITOR', 'PROJECT_MANAGER'];
  if (!allowedRoles.includes(role)) {
    redirect('/login');
  }

  // Fetch or auto-initialize employee record
  let employee = null;
  try {
    employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        attendance: {
          take: 20,
          orderBy: { checkInAt: 'desc' },
        },
        leaveRequests: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        expenseClaims: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          userId: session.user.id,
          designation: 'Production Staff',
          department: 'Studio Operations',
          joiningDate: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          attendance: true,
          leaveRequests: true,
          expenseClaims: true,
        },
      });
    }
  } catch (err) {
    console.error('Error loading employee in EmployeePortalPage:', err);
  }

  // Fallback data if DB was temporarily unreachable
  const fallbackEmployee = employee || {
    id: `emp-${session.user.id}`,
    userId: session.user.id,
    designation: 'Production Staff',
    department: 'Studio Operations',
    joiningDate: new Date(),
    attendance: [],
    leaveRequests: [],
    expenseClaims: [],
    user: {
      id: session.user.id,
      firstName: session.user.name?.split(' ')[0] || 'Staff',
      lastName: session.user.name?.split(' ').slice(1).join(' ') || 'Member',
      email: session.user.email,
    },
  };

  return (
    <>
      <Navbar />
      <EmployeePortalClient 
        initialEmployee={fallbackEmployee} 
        user={fallbackEmployee.user || session.user} 
      />
    </>
  );
}
