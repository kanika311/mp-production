import { redirect } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { auth } from '@/auth';
import { TalentRegistrationWizard } from '@/components/talent-registration/TalentRegistrationWizard';
import { serverFetchAPI } from '@/lib/server-api-client';

export default async function SetupTalentProfilePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TALENT') {
    redirect('/login');
  }

  // Double check if profile already exists. If yes, redirect to dashboard.
  try {
    const data = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
    if (data) {
      redirect('/talent-dashboard');
    }
  } catch (error: any) {
    // Expected to fail with 404 if profile doesn't exist
    if (
      error.status !== 404 &&
      error.statusCode !== 404 &&
      (!error.message || (!error.message.includes('404') && !error.message.toLowerCase().includes('not found')))
    ) {
      // Unhandled error
      console.error('Error checking profile existence:', error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <TalentRegistrationWizard />
      </main>
    </div>
  );
}
