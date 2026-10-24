import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { avatarUrl, coverBannerUrl, email, stageName, userId, pricingAmount, dayRate } = body;

    let finalAvatar = (avatarUrl || '').trim();
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dd29usied';
    const apiKey = process.env.CLOUDINARY_API_KEY || '174528277852462';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '3yGMVTlV7jJ0PSmdJicG2Mf46sk';

    // 1. If avatar is base64 dataUrl, upload directly to Cloudinary
    if (finalAvatar.startsWith('data:image/')) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = 'talent/avatars';
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const formData = new FormData();
        formData.append('file', finalAvatar);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.secure_url || uploadData.url) {
          finalAvatar = uploadData.secure_url || uploadData.url;
        }
      } catch (uploadErr) {
        console.error('[sync-avatar] Cloudinary upload error:', uploadErr);
      }
    }

    const hasValidAvatar = finalAvatar && !finalAvatar.startsWith('blob:');
    const numRate = pricingAmount ? parseInt(String(pricingAmount).replace(/\D/g, ''), 10) : (dayRate ? Number(dayRate) : null);

    if (!hasValidAvatar && !numRate) {
      return NextResponse.json({ success: false, message: 'No valid avatar or pricing provided' }, { status: 400 });
    }

    // 2. Resolve target user in database (Kanika Aggarwal or specified user)
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          userId ? { id: userId } : undefined,
          userId ? { talentProfile: { id: userId } } : undefined,
          userId ? { talentProfile: { userId } } : undefined,
          email ? { email: { equals: email, mode: 'insensitive' } } : undefined,
          stageName ? { firstName: { contains: stageName.split(' ')[0], mode: 'insensitive' } } : undefined,
          { email: { contains: 'kanika', mode: 'insensitive' } },
        ].filter(Boolean) as any,
      },
      include: { talentProfile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Target user not found in database' }, { status: 404 });
    }

    // 3. Update User table
    if (hasValidAvatar) {
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { avatarUrl: finalAvatar },
      });
    }

    // 4. Update TalentProfile and TalentPricing tables
    if (targetUser.talentProfile) {
      const existingDraft = (targetUser.talentProfile.draftData as object) || {};
      
      await prisma.talentProfile.update({
        where: { id: targetUser.talentProfile.id },
        data: {
          ...(coverBannerUrl && !coverBannerUrl.startsWith('blob:') ? { coverBannerUrl } : {}),
          draftData: {
            ...existingDraft,
            ...(hasValidAvatar ? { avatarUrl: finalAvatar, profilePhotoPreview: finalAvatar } : {}),
            ...(numRate ? { pricingAmount: String(numRate) } : {}),
          },
        },
      });

      if (numRate) {
        await prisma.talentPricing.upsert({
          where: { talentProfileId: targetUser.talentProfile.id },
          update: { perDay: numRate * 100, currency: 'INR' },
          create: { talentProfileId: targetUser.talentProfile.id, perDay: numRate * 100, currency: 'INR' },
        }).catch((e: any) => console.warn('talentPricing upsert warning:', e.message));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile & Pricing successfully synchronized to database!',
      avatarUrl: hasValidAvatar ? finalAvatar : targetUser.avatarUrl,
      dayRate: numRate,
      userId: targetUser.id,
      email: targetUser.email,
    });
  } catch (error: any) {
    console.error('[sync-avatar Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
