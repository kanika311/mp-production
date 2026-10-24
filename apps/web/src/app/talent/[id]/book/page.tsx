import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingForm } from './BookingForm';
import { serverFetchAPI } from '@/lib/server-api-client';
import { prisma } from '@/lib/prisma';

async function getTalentProfile(id: string) {
  const trimmed = decodeURIComponent(id || '').trim();
  const slugHyphen = trimmed.replace(/\s+/g, '-');
  const slugSpace = trimmed.replace(/-/g, ' ');

  // 1. Direct Prisma check first for latest local pricing & updates
  try {
    const profile = await prisma.talentProfile.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { slug: trimmed },
          { slug: slugHyphen },
          { slug: slugSpace },
          { userId: trimmed },
          { stageName: { equals: slugSpace, mode: 'insensitive' } },
        ],
      },
      include: {
        user: true,
        pricing: true,
        userTalents: {
          include: { category: true },
        },
      },
    });

    if (profile) return profile;
  } catch (dbErr) {}

  // 2. Fallback to serverFetchAPI
  try {
    const data = await serverFetchAPI(`/talent/${encodeURIComponent(trimmed)}`, { cache: 'no-store' });
    if (data && (data.data || data.user)) {
      return data.data ? data.data : data;
    }
  } catch (error) {}

  return null;
}

export default async function BookTalentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const profile = await getTalentProfile(id);

  if (!profile) {
    notFound();
  }

  const talentName = `${profile.user?.firstName || ''} ${profile.user?.lastName || ''}`.trim() || profile.stageName || 'Talent';
  const avatarUrl = profile.user?.avatarUrl || profile.avatarUrl || '';
  const categoryName = profile.userTalents?.[0]?.category?.name || 'Artist / Model';
  
  const dailyRate = profile.pricing?.perDay 
    ? (profile.pricing.perDay >= 100 && profile.pricing.perDay % 100 === 0 ? profile.pricing.perDay / 100 : profile.pricing.perDay)
    : (profile.draftData?.pricingAmount ? parseInt(String(profile.draftData.pricingAmount).replace(/\D/g, ''), 10) : (profile.pricing?.startingPrice || 4999));

  return (
    <>
      <Navbar />
      
      <main className="page-content min-h-screen py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto mt-20">
          <Reveal direction="up" delay={0.2}>
            <div className="bg-[var(--color-surface)] p-6 md:p-10 border border-[var(--color-border)] rounded-2xl shadow-xl">
              <BookingForm 
                talentProfileId={id} 
                talentName={talentName}
                talentAvatar={avatarUrl}
                categoryName={categoryName}
                dailyRate={dailyRate}
              />
            </div>
          </Reveal>

        </div>
      </main>
    </>
  );
}
