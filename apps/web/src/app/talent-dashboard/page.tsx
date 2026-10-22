import { Navbar } from '@/components/ui/Navbar';
import { TalentDashboardView } from '@/components/talent/TalentDashboardView';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { serverFetchAPI } from '@/lib/server-api-client';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  Camera, 
  Video, 
  FileText, 
  Globe, 
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  User,
  Check
} from 'lucide-react';

type ProfileResult =
  | { status: 'ok'; data: any }
  | { status: 'not_found' }
  | { status: 'auth_error' }
  | { status: 'api_error'; code?: number };

async function getTalentProfile(sessionUser: any): Promise<ProfileResult> {
  try {
    const data = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
    if (!data) return { status: 'not_found' };
    return { status: 'ok', data: data.data ? data.data : data };
  } catch (error: any) {
    if (
      error.status === 404 ||
      error.statusCode === 404 ||
      (error.message && (
        error.message.includes('404') ||
        error.message.toLowerCase().includes('not found')
      ))
    ) {
      // Auto-create/seed profile from registration user_metadata if available
      try {
        const metadata = sessionUser?.user_metadata || {};
        const stageName = sessionUser?.name || metadata.full_name || 'Talent Member';
        const category = metadata.category || 'actor';
        const city = metadata.city || 'Mumbai';
        const bio = metadata.bio || `Passionate ${category} based in ${city}.`;
        const experienceLevel = metadata.experienceLevel || metadata.experience || 'fresher';

        const created = await serverFetchAPI(`/talent/submit`, {
          method: 'POST',
          body: JSON.stringify({
            stageName,
            bio,
            experienceLevel,
          }),
        });

        if (created) {
          const freshData = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
          if (freshData) {
            return { status: 'ok', data: freshData.data ? freshData.data : freshData };
          }
        }
      } catch (autoErr) {
        console.error('Auto profile initialization error:', autoErr);
      }

      return { status: 'not_found' };
    }
    console.error('Error fetching talent profile:', error);
    return { status: 'api_error' };
  }
}

export default async function TalentDashboard({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TALENT') {
    redirect('/login');
  }

  const result = await getTalentProfile(session.user);

  if (result.status === 'auth_error') {
    redirect('/login');
  }

  if (result.status === 'api_error') {
    return (
      <>
        <Navbar />
        <main className="page-content py-20 text-center">
          <Container>
            <div className="max-w-md mx-auto bg-surface border border-border rounded-3xl p-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-serif">Service Temporarily Unavailable</h2>
              <p className="text-muted-foreground text-sm">
                We&apos;re having trouble retrieving your profile from the backend. Please try again in a moment.
              </p>
              <Button href="/talent-dashboard" variant="primary">Retry</Button>
            </div>
          </Container>
        </main>
      </>
    );
  }

  const metadata = (session.user as any)?.user_metadata || {};
  const profile = result.status === 'ok' ? result.data : {
    stageName: session.user.name || metadata.full_name || 'Talent Member',
    bio: metadata.bio || `Passionate ${metadata.category || 'talent'} based in ${metadata.city || 'Mumbai'}.`,
    experienceLevel: metadata.experienceLevel || metadata.experience || 'fresher',
    status: 'PENDING_REVIEW',
    user: session.user,
    userTalents: metadata.category ? [{ category: { name: metadata.category } }] : [],
    portfolioMedia: [],
    socialLinks: [],
  };

  const status = profile.status || 'PENDING_REVIEW';
  const isApproved = status === 'ACTIVE';

  // At very first login or fresh profile without media, automatically redirect to Edit Profile!
  const queryParams = searchParams ? await searchParams : {};
  const isExplicitDashboard = queryParams.view === 'dashboard' || Boolean(queryParams.tab);
  const hasUploadedMedia = (profile.portfolioMedia && profile.portfolioMedia.length > 0) || Boolean(profile.introductionVideoUrl);
  const isFirstTimeLogin = !hasUploadedMedia && (!profile.profileViews || profile.profileViews === 0);

  if (!isExplicitDashboard && isFirstTimeLogin) {
    redirect('/talent-dashboard/edit');
  }

  const stageName = profile.stageName || session.user.name || metadata.full_name || 'Talent Member';
  const email = profile.user?.email || session.user.email;
  const phone = profile.user?.phone || metadata.phone || 'Not provided';
  const location = [metadata.city, metadata.state].filter(Boolean).join(', ') || 'Mumbai, India';
  const category = profile.userTalents?.[0]?.category?.name || metadata.category || 'Talent';
  const experience = profile.experienceLevel || metadata.experienceLevel || metadata.experience || 'Fresher';
  const photoCount = (profile.portfolioMedia?.length || 0) + (profile.user?.avatarUrl ? 1 : 0);
  const hasVideo = Boolean(profile.introductionVideoUrl);
  const socialCount = profile.socialLinks?.length || 0;

  // ─────────────────────────────────────────────────────────────
  // 1. UNAPPROVED / PENDING APPROVAL SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!isApproved) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-background pt-28 md:pt-36 pb-20 relative overflow-hidden grain">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-amber-500/10 via-brand/10 to-brand-gold/10 blur-[140px] pointer-events-none rounded-full" />

          <Container className="relative z-10 max-w-4xl">
            <Reveal direction="up">
              {/* Header Badge */}
              <div className="text-center mb-8 space-y-4">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Application Status: Pending Admin Review
                </div>

                <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
                  Welcome, {stageName}!
                </h1>

                <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Your application and portfolio details have been submitted to the MP Productions curation team. You will be notified once an administrator verifies and approves your profile.
                </p>
              </div>

              {/* Progress Milestones Stepper */}
              <div className="bg-card/70 backdrop-blur-md border border-border rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-6 text-center md:text-left">
                  Verification Milestones
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="bg-surface/60 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 1</span>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Account Created</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Basic details registered</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-surface/60 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 2</span>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Portfolio Submitted</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Media & profile data saved</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-surface/80 border-2 border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 3 • Active</span>
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-300 text-sm">Admin Curation</h4>
                      <p className="text-[11px] text-amber-200/70 mt-0.5">Review in progress (24-48h)</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-surface/30 border border-border/50 rounded-2xl p-4 flex flex-col justify-between opacity-70">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 4</span>
                      <div className="w-6 h-6 rounded-full bg-surface-elevated text-muted-foreground flex items-center justify-center text-xs">
                        🔒
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Live On Roster</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Direct client bookings</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitted Profile Summary Card */}
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl space-y-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold block mb-1">
                      Submitted Profile Details
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-foreground">
                      {stageName}
                    </h3>
                  </div>

                  <Button href="/talent-dashboard/edit" variant="primary" size="sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Edit / Update Submitted Details
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>Talent Category</span>
                    </div>
                    <span className="text-foreground font-medium capitalize">{category}</span>
                  </div>

                  <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Experience Level</span>
                    </div>
                    <span className="text-foreground font-medium capitalize">{experience}</span>
                  </div>

                  <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Base Location</span>
                    </div>
                    <span className="text-foreground font-medium">{location}</span>
                  </div>

                  <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span>Registered Email</span>
                    </div>
                    <span className="text-foreground font-medium break-all">{email}</span>
                  </div>

                  <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>Mobile / Phone</span>
                    </div>
                    <span className="text-foreground font-medium">{phone}</span>
                  </div>

                  <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      <span>Uploaded Assets</span>
                    </div>
                    <span className="text-foreground font-medium">
                      {photoCount} Photos • {hasVideo ? 'Video Attached' : 'No Video'} • {socialCount} Socials
                    </span>
                  </div>
                </div>

                {profile.bio && (
                  <div className="border-t border-border/50 pt-4">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
                      Bio / Summary
                    </span>
                    <p className="text-muted-foreground text-sm leading-relaxed italic bg-surface/30 p-4 rounded-xl border border-border/30">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Login Credentials & Instructions Banner */}
              <div className="bg-surface border border-border/80 rounded-3xl p-6 md:p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-lg font-serif font-bold text-foreground">
                    Signing In After Approval
                  </h4>
                  <p className="text-muted-foreground text-xs md:text-sm max-w-xl mx-auto mt-1 leading-relaxed">
                    Once your profile is reviewed and approved by the MP Productions admin team, you can sign in anytime using your registered email address (<strong>{email}</strong>) and password. Your live booking dashboard, casting calls, and public talent card will automatically be unlocked!
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Button href="/talent-dashboard/edit" variant="primary" size="md">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add More Photos / Showreel
                  </Button>
                  <Button href="/talent" variant="outline" size="md">
                    <Globe className="w-4 h-4 mr-2" />
                    Browse Public Talent Directory
                  </Button>
                </div>
              </div>
            </Reveal>
          </Container>
        </main>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. APPROVED / ACTIVE TALENT DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <TalentDashboardView
        profile={profile}
        user={session.user}
        isApproved={isApproved}
      />
    </>
  );
}
