import { notFound } from 'next/navigation';
import { TalentApplicantReviewView } from '@/components/admin/TalentApplicantReviewView';
import { backendFetch } from '@/lib/cms/server/backend';
import { serverFetchAPI } from '@/lib/server-api-client';

type Ctx = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

async function getProfile(id: string) {
  try {
    const res = await backendFetch(`/talent/${encodeURIComponent(id)}/review`);
    if (res.ok && res.data) return res.data;
  } catch {}

  try {
    const res = await backendFetch('/talent/pending');
    const list = Array.isArray(res?.data) ? res.data : res?.data?.data;
    if (Array.isArray(list)) {
      const found = list.find((p: any) => p.id === id || p.slug === id || p.userId === id);
      if (found) return found;
    }
  } catch {}

  try {
    const json = await serverFetchAPI(`/talent/${encodeURIComponent(id)}/review`, { cache: 'no-store' });
    if (json?.data) return json.data;
  } catch {}

  try {
    const json = await serverFetchAPI(`/talent/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (json?.data) return json.data;
  } catch {}

  return null;
}

export default async function SuperAdminApplicantReviewPage(ctx: Ctx) {
  const { id } = await ctx.params;
  const profile = await getProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="py-4">
      <TalentApplicantReviewView initialProfile={profile} backHref="/studio-8f2k/moderation" />
    </div>
  );
}
