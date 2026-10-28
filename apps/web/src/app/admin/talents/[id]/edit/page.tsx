import { TalentEditPage } from '@/components/admin/talents/TalentEditPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TalentEditPage userId={id} basePath="/admin" />;
}
