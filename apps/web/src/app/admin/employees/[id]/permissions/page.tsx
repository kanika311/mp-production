import { EmployeePermissionsPage } from '@/components/admin/employees/EmployeePermissionsPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeePermissionsPage userId={id} basePath="/admin" />;
}
