import { EmployeeEditPage } from '@/components/admin/employees/EmployeeEditPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeEditPage userId={id} basePath="/super-admin" />;
}
