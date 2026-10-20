import { Navbar } from '@/components/ui/Navbar';
import TalentDirectoryClient from './TalentDirectoryClient';
import { serverFetchAPI } from '@/lib/server-api-client';

async function getTalents() {
  try {
    const res = await serverFetchAPI('/talent', { cache: 'no-store' });
    if (!res.success) return [];
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch talents:", error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function TalentDirectory() {
  const talents = await getTalents();
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-x-clip">
        <TalentDirectoryClient initialTalents={talents} />
      </main>
    </>
  );
}
