import { serverFetchAPI } from '@/lib/server-api-client';
import { Navbar } from '@/components/ui/Navbar';
import InstagramTalentProfile from '@/components/talent/InstagramTalentProfile';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getTalentProfile(id: string) {
  try {
    const encodedId = encodeURIComponent(id.trim());
    let res = await serverFetchAPI(`/talent/${encodedId}`, { cache: 'no-store' }).catch(() => null);
    if (!res?.data && id.includes(' ')) {
      const hyphenId = encodeURIComponent(id.trim().replace(/\s+/g, '-'));
      res = await serverFetchAPI(`/talent/${hyphenId}`, { cache: 'no-store' }).catch(() => null);
    }
    if (!res || res.status === 404 || !res.success) return null;
    return res.data;
  } catch (error) {
    console.error('Error fetching talent profile:', error);
    return null;
  }
}

export default async function TalentProfilePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const profile = await getTalentProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <InstagramTalentProfile profile={profile} />
      </main>
    </>
  );
}
