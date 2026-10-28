import { TalentEditPage } from '@/components/admin/talents/TalentEditPage';
import { EmployeeEditPage } from '@/components/admin/employees/EmployeeEditPage';
import { prisma } from '@/lib/prisma';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeEditPage userId={id} basePath="/admin" />;
  }
  return <TalentEditPage userId={id} basePath="/admin" />;
}
