import { TalentModerationClient } from '@/components/admin/TalentModerationClient';
import { backendFetch } from '@/lib/cms/server/backend';
import { serverFetchAPI } from '@/lib/server-api-client';

async function getPendingProfiles() {
  try {
    const res = await backendFetch('/talent/pending');
    if (res.ok) {
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data;
      if (Array.isArray(list)) return list;
    }
  } catch {}

  try {
    const json = await serverFetchAPI('/talent/pending', { cache: 'no-store' });
    const list = Array.isArray(json?.data) ? json.data : json?.data?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function SuperAdminModerationPage() {
  const pendingProfiles = await getPendingProfiles();

  return (
    <div className="py-6">
      <TalentModerationClient initialProfiles={pendingProfiles} />
    </div>
  );
}
