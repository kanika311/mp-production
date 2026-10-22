import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default async function ClientPortalSettings() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const { user } = session;
  const displayName = user.name || user.email?.split('@')[0] || 'Client';

  return (
    <>
      <Navbar />

      <main className="page-content">
        <Container>
          <Reveal direction="up">
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-8">
              <div>
                <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Client Portal
                </span>
                <h1 className="text-4xl font-serif text-foreground">Settings</h1>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4 text-sm">
                <Button href="/client-portal" variant="ghost" size="sm">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="w-full max-w-2xl mx-auto space-y-6">
              <Card className="p-8 bg-surface border border-border">
                <h2 className="text-xl font-serif text-foreground mb-6">Account</h2>
                <dl className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-border/60 pb-4">
                    <dt className="text-sm text-muted-foreground uppercase tracking-wider">Name</dt>
                    <dd className="text-foreground font-medium">{displayName}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-border/60 pb-4">
                    <dt className="text-sm text-muted-foreground uppercase tracking-wider">Email</dt>
                    <dd className="text-foreground font-medium">{user.email || '—'}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm text-muted-foreground uppercase tracking-wider">Role</dt>
                    <dd className="text-foreground font-medium">{user.role || 'CLIENT'}</dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-8 bg-surface border border-border">
                <h2 className="text-xl font-serif text-foreground mb-2">Support</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Need to update your account details or have a question about a project?
                  Reach out and our team will help.
                </p>
                <Button href="/contact" variant="outline" size="sm">
                  Contact Support
                </Button>
              </Card>
            </div>
          </Reveal>
        </Container>
      </main>
    </>
  );
}
