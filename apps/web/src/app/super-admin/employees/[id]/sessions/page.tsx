import { EmployeeSessionsPage } from '@/components/admin/employees/EmployeeSessionsPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeSessionsPage userId={id} basePath="/super-admin" />;
}
