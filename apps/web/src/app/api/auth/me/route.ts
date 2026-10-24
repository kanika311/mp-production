import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    let avatarUrl = '';
    let dbUser: any = null;

    try {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: session.user.id },
            session.user.email ? { email: { equals: session.user.email, mode: 'insensitive' } } : undefined,
          ].filter(Boolean) as any,
        },
        include: {
          talentProfile: {
            select: {
              coverBannerUrl: true,
              draftData: true,
            },
          },
        },
      });

      if (dbUser) {
        const draft = dbUser.talentProfile?.draftData as any;
        avatarUrl = dbUser.avatarUrl || draft?.avatarUrl || draft?.profilePhotoPreview || '';
      }
    } catch (e) {
      console.warn('Could not query DB for auth user details:', e);
    }

    return NextResponse.json({
      ok: true,
      user: {
        ...session.user,
        name: dbUser?.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : (dbUser?.name || session.user.name),
        role: (dbUser?.role || session.user.role || 'USER').toString().toUpperCase(),
        avatarUrl: avatarUrl || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, user: null, error: error?.message }, { status: 500 });
  }
}
