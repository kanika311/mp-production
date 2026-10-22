import { serverFetchAPI } from '@/lib/server-api-client';
import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CommentBox } from './CommentBox';

async function getClientProjectDetails(projectId: string, accessToken: string) {
  try {
        const res = await serverFetchAPI(`/client/projects/${projectId}`, { 
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      cache: 'no-store' 
    });
        return res.data;
  } catch (error) {
    console.error('Error fetching client project details:', error);
    return null;
  }
}

export default async function ClientProjectWorkspace({ params }: { params: Promise<{ projectId: string }> | { projectId: string } }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const accessToken = (session as any).accessToken;
  const project = await getClientProjectDetails(resolvedParams.projectId, accessToken);

  if (!project) {
    return notFound();
  }

  return <ClientWorkspaceUI project={project} />;
}

function ClientWorkspaceUI({ project }: { project: any }) {
  const latestVersion = project.versions?.[0];

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-[var(--color-border)] pb-8 flex justify-between items-end">
              <div>
                <span className="text-[var(--color-primary)] tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Project Review
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  {project.name}
                </h1>
              </div>
              <div className="flex gap-4">
                <span className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] uppercase tracking-widest text-xs font-semibold">
                  Status: {project.status ? project.status.replace('_', ' ') : 'N/A'}
                </span>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              <Reveal direction="up" delay={0.1}>
                <section>
                  <h2 className="text-xl font-serif text-foreground mb-6">Latest Version</h2>
                  <div className="bg-black border border-[var(--color-border)] aspect-video relative flex items-center justify-center">
                    {latestVersion ? (
                      <div className="w-full h-full relative group">
                        <video 
                          src={latestVersion.fileUrl || undefined} 
                          controls 
                          className="w-full h-full object-contain"
                          poster={project.coverImage || undefined}
                        />
                        <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 text-white text-xs uppercase tracking-widest font-mono">
                          v{latestVersion.versionNumber}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No video versions have been uploaded for review yet.</p>
                    )}
                  </div>
                  
                  {/* Comment input (wired to the backend) */}
                  <CommentBox projectId={project.id} versionId={latestVersion?.id} />
                </section>
              </Reveal>
            </div>

            <div className="space-y-8">
              <Reveal direction="up" delay={0.2}>
                <section>
                  <h2 className="text-xl font-serif text-foreground mb-6">Feedback Log</h2>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
                    {project.comments && project.comments.length > 0 ? (
                      <ul className="space-y-4">
                        {project.comments.map((comment: any) => (
                          <li key={comment.id} className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-[var(--color-primary)] font-mono text-sm">{comment.timestampSec ? `@ ${comment.timestampSec}s` : 'General'}</span>
                              <span className="text-muted-foreground text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm mt-2">{comment.content}</p>
                            <p className="text-muted-foreground text-xs mt-2 italic">- {comment.author?.firstName || 'Client'}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">No comments have been posted yet.</p>
                    )}
                  </div>
                </section>
              </Reveal>

              <Reveal direction="up" delay={0.3}>
                <section>
                  <h2 className="text-xl font-serif text-foreground mb-6">Deliverables</h2>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-4 text-center">
                    {project.status === 'COMPLETED' || project.status === 'DELIVERED' ? (
                      <>
                        <p className="text-muted-foreground text-sm mb-4">Final high-resolution master files are ready for download.</p>
                        <button className="w-full py-3 bg-primary text-white uppercase tracking-widest text-xs font-semibold hover:bg-white transition-colors">
                          Download ZIP
                        </button>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        Downloads will be unlocked once final payment is processed and the project is marked as delivered.
                      </p>
                    )}
                  </div>
                </section>
              </Reveal>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
