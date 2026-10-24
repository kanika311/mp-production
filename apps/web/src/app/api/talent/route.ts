import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const talents = await prisma.talentProfile.findMany({
      where: {
        status: { in: ['ACTIVE', 'PENDING_REVIEW', 'APPROVED' as any] },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            city: true,
            state: true,
            gender: true,
            email: true,
          },
        },
        userTalents: {
          include: {
            category: true,
          },
        },
        portfolioMedia: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
        userLanguages: {
          include: {
            language: true,
          },
        },
        pricing: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: talents,
    });
  } catch (error: any) {
    console.error('Error in /api/talent GET:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
