import { serverFetchAPI } from '@/lib/server-api-client';
import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

interface CastingApplication {
  id: string;
  status: string;
  talent: {
    user: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
}

interface CastingCall {
  id: string;
  title: string;
  projectType: string;
  city: string;
  deadline: string;
  status: string;
  applications: CastingApplication[];
}

async function getCastingCalls(accessToken: string): Promise<CastingCall[]> {
  try {
    
    const res = await serverFetchAPI(`/bookings/casting-calls`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 }, // casting data must be fresh
    });
    if (!res.ok) return [];
    const json = res;
    return json.data || [];
  } catch (error) {
    console.error('Error fetching casting calls:', error);
    return [];
  }
}

export default async function ClientCastingBoard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const accessToken = (session as any).accessToken;
  const calls = await getCastingCalls(accessToken);

  return (
    <>
      <Navbar />
      
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-[var(--color-border)] pb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
              <div>
                <span className="text-[var(--color-primary)] tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Client Portal
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Casting Board
                </h1>
                <p className="text-muted-foreground mt-2">Manage open casting calls and view applicant shortlists.</p>
              </div>
              <div className="mt-6 md:mt-0">
                <Button href="/client-portal/casting/new" variant="primary" size="lg">
                  + Create New Casting Call
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="space-y-8">
              {calls.length === 0 ? (
                <div className="text-center py-20 border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <p className="text-muted-foreground">No casting calls found.</p>
                </div>
              ) : (
                calls.map(call => (
                  <div key={call.id} className="border border-[var(--color-border)] bg-[var(--color-surface)]">
                    
                    {/* Call Header */}
                    <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-surface">
                      <div>
                        <h2 className="text-2xl font-serif text-foreground">{call.title}</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          {call.projectType} • {call.city || 'Global'} • Deadline:{' '}
                          {call.deadline ? new Date(call.deadline).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span className="px-4 py-1.5 border border-[var(--color-primary)] text-[var(--color-primary)] text-xs uppercase tracking-widest">
                        {call.status}
                      </span>
                    </div>

                    {/* Applicants Shortlist */}
                    <div className="p-6">
                      <h3 className="text-sm tracking-widest uppercase font-semibold text-foreground mb-6">
                        Review Applicants ({call.applications?.length || 0})
                      </h3>
                      
                      {(!call.applications || call.applications.length === 0) ? (
                        <p className="text-muted-foreground text-sm">No applications received yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {call.applications.map(app => (
                            <div key={app.id} className="border border-[var(--color-border)] flex items-center p-4 gap-4 hover:border-[var(--color-text-main)] transition-colors cursor-pointer group">
                              <div className="w-16 h-16 relative overflow-hidden rounded-full border border-[var(--color-border)]">
                                {app.talent.user.avatarUrl ? (
                                  <Image src={app.talent.user.avatarUrl} alt="Avatar" fill className="object-cover" sizes="100vw" />
                                ) : (
                                  <div className="w-full h-full bg-black flex items-center justify-center text-xl font-serif text-muted-foreground">
                                    {app.talent.user.firstName?.[0] || 'T'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {app.talent.user.firstName} {app.talent.user.lastName}
                                </h4>
                                <span className={`text-[10px] uppercase tracking-widest ${app.status === 'SHORTLISTED' ? 'text-[var(--color-primary)]' : 'text-muted-foreground'}`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                ))
              )}
            </div>
          </Reveal>

        </div>
      </main>
    </>
  );
}
