import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { backendFetch } from '@/lib/cms/server/backend';
import { verifySessionToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    let userId = body.userId || session?.user?.id;

    if (!userId) {
      // 1. Check Bearer token from request Authorization header
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      let token = authHeader?.replace(/^Bearer\s+/i, '').trim();
      if (!token) {
        // 2. Check Cookie header directly
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/(?:token|mdms_auth_token|next-auth\.session-token)=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]).trim();
      }
      if (token) {
        const payload = await verifySessionToken(token);
        if (payload) {
          userId = payload.sub || (payload as any).id || (payload as any).userId || (payload as any).user_id;
        }
      }
    }

    // 3. Fallback: Lookup user by email if provided in body or initial profile
    if (!userId && (body.email || body.user?.email)) {
      const targetEmail = String(body.email || body.user?.email).trim();
      const u = await prisma.user.findFirst({
        where: { email: { equals: targetEmail, mode: 'insensitive' } },
        select: { id: true },
      });
      if (u) userId = u.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized: User session or ID required' }, { status: 401 });
    }

    const {
      stageName,
      bio,
      experienceLevel,
      primaryTalentId,
      secondaryTalentIds,
      profilePhotoPreview,
      avatarUrl,
      coverBannerPreview,
      coverBannerUrl,
      galleryImages,
      resumeUrl,
      compCardUrl,
      pricingType,
      pricingAmount,
      isAvailableForTravel,
      isAvailableForRemote,
      isAvailableImmediate,
      instagram,
      youtube,
      linkedin,
      facebook,
      website,
      skills,
      languages,
    } = body;

    const finalAvatar = (avatarUrl || profilePhotoPreview || '').trim();
    const finalCover = (coverBannerUrl || coverBannerPreview || '').trim();

    // Resolve target user cleanly with strict priority: explicit userId > explicit email > authenticated session
    let targetUser = null;
    if (userId) {
      targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { talentProfile: { id: userId } },
            { talentProfile: { userId } },
          ],
        },
      });
    }

    if (!targetUser && (body.email || body.user?.email)) {
      const targetEmail = String(body.email || body.user?.email).trim();
      targetUser = await prisma.user.findFirst({
        where: { email: { equals: targetEmail, mode: 'insensitive' } },
      });
    }

    if (!targetUser && session?.user) {
      targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            session.user.id ? { id: session.user.id } : undefined,
            session.user.email ? { email: session.user.email } : undefined,
          ].filter(Boolean) as any,
        },
      });
    }

    const effectiveUserId = targetUser?.id || userId;

    // 1. Update User avatar, contact, and names in PostgreSQL cleanly
    const userUpdateData: any = {};
    if (finalAvatar && !finalAvatar.startsWith('blob:')) {
      userUpdateData.avatarUrl = finalAvatar;
    }
    if (body.firstName) {
      userUpdateData.firstName = body.firstName.trim();
    }
    if (body.lastName !== undefined && body.lastName !== null) {
      userUpdateData.lastName = body.lastName.trim();
    } else if (body.fullName) {
      const parts = body.fullName.trim().split(/\s+/);
      userUpdateData.firstName = parts[0] || 'Talent';
      if (parts.length > 1) {
        userUpdateData.lastName = parts.slice(1).join(' ');
      }
    }
    if (body.phone) {
      userUpdateData.phone = body.phone.trim();
    }
    if (body.city) userUpdateData.city = body.city;
    if (body.state) userUpdateData.state = body.state;
    if (body.country) userUpdateData.country = body.country;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: effectiveUserId },
        data: userUpdateData,
      }).catch((e: any) => console.warn('User table update warning:', e.message));
    }

    // 2. Find or create TalentProfile
    const existing = await prisma.talentProfile.findFirst({
      where: {
        OR: [
          { userId: effectiveUserId },
          { id: userId },
        ],
      },
    });

    const finalSlug = existing?.slug || `${(stageName || 'talent').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const targetStatus = existing?.status === 'ACTIVE' ? 'ACTIVE' : (body.status || 'ACTIVE');

    const updateData: any = {
      slug: finalSlug,
      ...(stageName ? { stageName: stageName.trim() } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(experienceLevel ? { experienceLevel } : {}),
      status: targetStatus,
      onboardingCompleted: true,
      draftData: body,
    };

    if (finalCover && !finalCover.startsWith('blob:')) {
      updateData.coverBannerUrl = finalCover;
    }
    if (resumeUrl && !resumeUrl.startsWith('blob:')) {
      updateData.resumeUrl = resumeUrl;
    }
    if (compCardUrl && !compCardUrl.startsWith('blob:')) {
      updateData.compCardUrl = compCardUrl;
    }

    const profile = await prisma.talentProfile.upsert({
      where: { userId: effectiveUserId },
      update: updateData,
      create: {
        userId: effectiveUserId,
        slug: finalSlug,
        stageName: stageName ? stageName.trim() : 'Talent Member',
        bio: bio || '',
        experienceLevel: experienceLevel || 'fresher',
        coverBannerUrl: finalCover && !finalCover.startsWith('blob:') ? finalCover : null,
        resumeUrl: resumeUrl && !resumeUrl.startsWith('blob:') ? resumeUrl : null,
        compCardUrl: compCardUrl && !compCardUrl.startsWith('blob:') ? compCardUrl : null,
        status: targetStatus,
        onboardingStep: 7,
        onboardingCompleted: true,
        draftData: body,
      },
      include: {
        user: true,
        userTalents: { include: { category: true } },
        portfolioMedia: true,
      },
    });

    // 3. Update Categories (Primary & Secondary)
    if (primaryTalentId) {
      await prisma.userTalent.deleteMany({
        where: { talentProfileId: profile.id },
      }).catch(() => {});

      const categoryInserts = [
        {
          talentProfileId: profile.id,
          categoryId: primaryTalentId,
          isPrimary: true,
          attributes: {},
        },
      ];

      if (Array.isArray(secondaryTalentIds)) {
        secondaryTalentIds.forEach((id: string) => {
          if (id && id !== primaryTalentId) {
            categoryInserts.push({
              talentProfileId: profile.id,
              categoryId: id,
              isPrimary: false,
              attributes: {},
            });
          }
        });
      }

      await prisma.userTalent.createMany({
        data: categoryInserts,
      }).catch((e: any) => console.warn('userTalent createMany warning:', e.message));
    }

    // 4. Update Portfolio Gallery
    if (Array.isArray(galleryImages) && galleryImages.length > 0) {
      await prisma.portfolioMedia.deleteMany({
        where: { talentProfileId: profile.id },
      }).catch(() => {});

      const mediaInserts = galleryImages
        .map((img: any, idx: number) => ({
          talentProfileId: profile.id,
          url: typeof img === 'string' ? img : (img.url || ''),
          type: 'PORTFOLIO_IMAGE',
          order: idx,
        }))
        .filter((m: any) => Boolean(m.url) && !m.url.startsWith('blob:'));

      if (mediaInserts.length > 0) {
        await prisma.portfolioMedia.createMany({
          data: mediaInserts,
        }).catch((e: any) => console.warn('portfolioMedia createMany warning:', e.message));
      }
    }

    // 5. Update Pricing
    const numericRate = pricingAmount ? parseInt(String(pricingAmount).replace(/\D/g, ''), 10) : null;
    if (numericRate) {
      const perDay = pricingType === 'per-hour' ? null : numericRate * 100;
      const perHour = pricingType === 'per-hour' ? numericRate * 100 : null;
      await prisma.talentPricing.upsert({
        where: { talentProfileId: profile.id },
        update: { perDay, perHour, currency: 'INR' },
        create: { talentProfileId: profile.id, perDay, perHour, currency: 'INR' },
      }).catch(() => {});
    }

    // 6. Update Availability
    await prisma.talentAvailability.upsert({
      where: { talentProfileId: profile.id },
      update: {
        travelReady: isAvailableForTravel ?? true,
        availablePartTime: isAvailableForRemote ?? true,
        availableFullTime: isAvailableImmediate ?? true,
      },
      create: {
        talentProfileId: profile.id,
        travelReady: isAvailableForTravel ?? true,
        availablePartTime: isAvailableForRemote ?? true,
        availableFullTime: isAvailableImmediate ?? true,
      },
    }).catch(() => {});

    // 7. Update Social Links
    const socialLinks: any[] = [];
    if (instagram) socialLinks.push({ talentProfileId: profile.id, platform: 'INSTAGRAM', url: instagram });
    if (youtube) socialLinks.push({ talentProfileId: profile.id, platform: 'YOUTUBE', url: youtube });
    if (linkedin) socialLinks.push({ talentProfileId: profile.id, platform: 'LINKEDIN', url: linkedin });
    if (facebook) socialLinks.push({ talentProfileId: profile.id, platform: 'FACEBOOK', url: facebook });
    if (website) socialLinks.push({ talentProfileId: profile.id, platform: 'WEBSITE', url: website });

    if (socialLinks.length > 0) {
      await prisma.socialLink.deleteMany({ where: { talentProfileId: profile.id } }).catch(() => {});
      await prisma.socialLink.createMany({ data: socialLinks }).catch(() => {});
    }

    // Attempt backend sync in background
    backendFetch('/talent/submit', {
      method: 'POST',
      body: JSON.stringify({ ...body, userId, fullName: stageName }),
    }).catch(() => {});

    // Fetch fresh profile from DB to return complete response
    const freshProfile = await prisma.talentProfile.findUnique({
      where: { id: profile.id },
      include: {
        user: true,
        userTalents: { include: { category: true } },
        portfolioMedia: true,
        pricing: true,
        availability: true,
        socialLinks: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated and saved to database successfully',
      data: freshProfile || profile,
    });
  } catch (error: any) {
    console.error('Submit profile error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to submit profile' },
      { status: 500 }
    );
  }
}
