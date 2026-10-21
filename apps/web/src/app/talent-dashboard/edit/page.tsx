import Link from 'next/link';
import { Eye } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import FullEditProfileClient from './FullEditProfileClient';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { auth } from '@/auth';
import { serverFetchAPI } from '@/lib/server-api-client';
async function getTalentProfile(sessionUser: any) {
  try {
    const data = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
    if (data) return data.data ? data.data : data;
  } catch (error: any) {
    // If not found, attempt auto-initialization
    try {
      const metadata = sessionUser?.user_metadata || {};
      const stageName = sessionUser?.name || metadata.full_name || 'Talent Member';
      const category = metadata.category || 'actor';
      const city = metadata.city || 'Mumbai';
      const bio = metadata.bio || `Passionate ${category} based in ${city}.`;
      const experienceLevel = metadata.experienceLevel || metadata.experience || 'fresher';

      await serverFetchAPI(`/talent/submit`, {
        method: 'POST',
        body: JSON.stringify({
          stageName,
          bio,
          experienceLevel,
        }),
      });

      const freshData = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
      if (freshData) {
        return freshData.data ? freshData.data : freshData;
      }
    } catch (initErr) {
      console.warn('Auto profile initialization in edit page:', initErr);
    }
  }
  return null;
}

export default async function EditTalentProfilePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TALENT') {
    redirect('/login');
  }

  const metadata = (session.user as any)?.user_metadata || {};
  let profile = await getTalentProfile(session.user);

  // If still no profile in DB, provide a fully typed fallback so the talent can immediately enter details & save
  if (!profile) {
    profile = {
      id: session.user.id,
      userId: session.user.id,
      stageName: session.user.name || metadata.full_name || '',
      bio: metadata.bio || `Passionate ${metadata.category || 'talent'} from ${metadata.city || 'India'}.`,
      experienceLevel: metadata.experienceLevel || metadata.experience || 'fresher',
      status: 'DRAFT',
      user: {
        id: session.user.id,
        name: session.user.name || metadata.full_name || '',
        email: session.user.email,
        phone: metadata.phone || '',
      },
      userTalents: [],
      userSkills: [],
      userLanguages: [],
      socialLinks: [],
    };
  }

  return (
    <>
      <PortalNavbar role="TALENT" />
      <main className="min-h-screen bg-background pt-20 md:pt-24 pb-20">
        <Container>
          <FullEditProfileClient initialData={profile} />
        </Container>
      </main>
    </>
  );
}
