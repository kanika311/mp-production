import { serverFetchAPI } from '@/lib/server-api-client';
import { Navbar } from '@/components/ui/Navbar';
import { ClientDashboardView } from '@/components/client/ClientDashboardView';
import { auth } from '@/auth';

async function getClientProjects() {
  try {
    const res = await serverFetchAPI(`/client/projects`, { cache: 'no-store' });
    return res?.data || [];
  } catch (error) {
    return [];
  }
}

export default async function ClientPortal() {
  const session = await auth();
  const projects = await getClientProjects();

  return (
    <>
      <Navbar />
      <ClientDashboardView
        projects={projects}
        user={session?.user}
      />
    </>
  );
}
