import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/cms/server/guard';
import { prisma } from '@/lib/prisma';

// GET: Get user details for View / Edit Modal & Page
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;

  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        talentProfile: {
          include: {
            userTalents: { include: { category: true } },
            portfolioMedia: { orderBy: { order: 'asc' } },
            socialLinks: true,
            userSkills: { include: { skill: true } },
            userLanguages: { include: { language: true } },
            pricing: true,
            availability: true,
          },
        },
        client: true,
        employee: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // If user is a TALENT but doesn't have a talentProfile record yet, auto-provision one
    if (user.role === 'TALENT' && !user.talentProfile) {
      const generatedSlug = `${user.firstName || 'talent'}-${user.lastName || ''}-${user.id.slice(-4)}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const createdProfile = await prisma.talentProfile.create({
        data: {
          userId: user.id,
          slug: generatedSlug,
          status: 'DRAFT',
        },
        include: {
          userTalents: { include: { category: true } },
          portfolioMedia: { orderBy: { order: 'asc' } },
          socialLinks: true,
          userSkills: { include: { skill: true } },
          userLanguages: { include: { language: true } },
          pricing: true,
          availability: true,
        },
      });
      user = { ...user, talentProfile: createdProfile };
    }

    return NextResponse.json({ ok: true, data: user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Failed to fetch user' }, { status: 500 });
  }
}

const bcrypt = eval("require('bcryptjs')");

// PATCH: Edit user details & full talent profile (Core info, Bio, Resume, PPT, Photos, Videos, Socials, Rates)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;
  const body = await req.json().catch(() => ({}));
  const {
    firstName,
    lastName,
    email,
    role,
    isActive,
    password,
    phone,
    dateOfBirth,
    gender,
    city,
    state,
    country,
    avatarUrl,
    designation,
    department,
    // Talent Profile fields
    stageName,
    bio,
    experienceLevel,
    talentStatus,
    resumeUrl,
    portfolioPdfUrl,
    compCardUrl,
    introductionVideoUrl,
    coverBannerUrl,
    coverBannerType,
    brandsWorkedWith,
    pricing,
    portfolioMedia,
    socialLinks,
    skills,
    languages,
    categoryIds,
  } = body;

  try {
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = String(firstName).trim();
    if (lastName !== undefined) updateData.lastName = String(lastName).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim() || null;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) updateData.gender = gender ? String(gender).trim() : null;
    if (city !== undefined) updateData.city = city ? String(city).trim() : null;
    if (state !== undefined) updateData.state = state ? String(state).trim() : null;
    if (country !== undefined) updateData.country = country ? String(country).trim() : null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? String(avatarUrl).trim() : null;
    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      const existing = await prisma.user.findFirst({
        where: {
          email: { equals: cleanEmail, mode: 'insensitive' },
          NOT: { id: userId },
        },
      });
      if (existing) {
        return NextResponse.json({ ok: false, error: 'This email is already in use by another user' }, { status: 409 });
      }
      updateData.email = cleanEmail;
    }
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password && String(password).trim().length > 0) {
      if (String(password).trim().length < 6) {
        return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(String(password).trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (designation !== undefined || department !== undefined) {
      await prisma.employee.upsert({
        where: { userId },
        create: {
          userId,
          designation: designation ? String(designation).trim() : null,
          department: department ? String(department).trim() : null,
        },
        update: {
          ...(designation !== undefined && { designation: String(designation).trim() || null }),
          ...(department !== undefined && { department: String(department).trim() || null }),
        },
      });
    }

    // ── TALENT PROFILE HANDLING ──
    const targetRole = role || updatedUser.role;
    if (targetRole === 'TALENT' || stageName !== undefined || bio !== undefined || resumeUrl !== undefined || portfolioPdfUrl !== undefined || portfolioMedia !== undefined) {
      let talentProfile = await prisma.talentProfile.findUnique({ where: { userId } });
      if (!talentProfile) {
        const generatedSlug = `${updatedUser.firstName || 'talent'}-${updatedUser.lastName || ''}-${userId.slice(-4)}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        talentProfile = await prisma.talentProfile.create({
          data: {
            userId,
            slug: generatedSlug,
            status: 'ACTIVE',
          },
        });
      }

      const talentData: any = {};
      if (stageName !== undefined) talentData.stageName = stageName ? String(stageName).trim() : null;
      if (bio !== undefined) talentData.bio = bio ? String(bio).trim() : null;
      if (experienceLevel !== undefined) talentData.experienceLevel = experienceLevel ? String(experienceLevel).trim() : null;
      if (talentStatus !== undefined) talentData.status = talentStatus;
      if (resumeUrl !== undefined) talentData.resumeUrl = resumeUrl ? String(resumeUrl).trim() : null;
      if (portfolioPdfUrl !== undefined) talentData.portfolioPdfUrl = portfolioPdfUrl ? String(portfolioPdfUrl).trim() : null;
      if (compCardUrl !== undefined) talentData.compCardUrl = compCardUrl ? String(compCardUrl).trim() : null;
      if (introductionVideoUrl !== undefined) talentData.introductionVideoUrl = introductionVideoUrl ? String(introductionVideoUrl).trim() : null;
      if (coverBannerUrl !== undefined) talentData.coverBannerUrl = coverBannerUrl ? String(coverBannerUrl).trim() : null;
      if (coverBannerType !== undefined) talentData.coverBannerType = coverBannerType ? String(coverBannerType).trim() : 'image';
      if (Array.isArray(brandsWorkedWith)) talentData.brandsWorkedWith = brandsWorkedWith.map((b: any) => String(b).trim()).filter(Boolean);

      if (Object.keys(talentData).length > 0) {
        talentProfile = await prisma.talentProfile.update({
          where: { id: talentProfile.id },
          data: talentData,
        });
      }

      // Update Pricing
      if (pricing !== undefined && typeof pricing === 'object') {
        await prisma.talentPricing.upsert({
          where: { talentProfileId: talentProfile.id },
          create: {
            talentProfileId: talentProfile.id,
            perDay: pricing.perDay ? Number(pricing.perDay) : null,
            perHour: pricing.perHour ? Number(pricing.perHour) : null,
            isNegotiable: pricing.isNegotiable !== undefined ? Boolean(pricing.isNegotiable) : true,
            currency: pricing.currency || 'INR',
          },
          update: {
            perDay: pricing.perDay !== undefined ? (pricing.perDay ? Number(pricing.perDay) : null) : undefined,
            perHour: pricing.perHour !== undefined ? (pricing.perHour ? Number(pricing.perHour) : null) : undefined,
            isNegotiable: pricing.isNegotiable !== undefined ? Boolean(pricing.isNegotiable) : undefined,
            currency: pricing.currency || undefined,
          },
        });
      }

      // Update Portfolio Media (Photos, Videos, Showreels, PDFs, etc.)
      if (Array.isArray(portfolioMedia)) {
        await prisma.portfolioMedia.deleteMany({ where: { talentProfileId: talentProfile.id } });
        if (portfolioMedia.length > 0) {
          await prisma.portfolioMedia.createMany({
            data: portfolioMedia
              .filter((m: any) => m && m.url && String(m.url).trim().length > 0)
              .map((m: any, index: number) => ({
                talentProfileId: talentProfile.id,
                type: m.type || 'PORTFOLIO_IMAGE',
                url: String(m.url).trim(),
                title: m.title ? String(m.title).trim() : null,
                category: m.category ? String(m.category).trim() : null,
                thumbnailUrl: m.thumbnailUrl ? String(m.thumbnailUrl).trim() : null,
                duration: m.duration ? Number(m.duration) : null,
                order: m.order !== undefined ? Number(m.order) : index,
              })),
          });
        }
      }

      // Update Social Links
      if (Array.isArray(socialLinks)) {
        await prisma.socialLink.deleteMany({ where: { talentProfileId: talentProfile.id } });
        const validLinks = socialLinks.filter((s: any) => s && s.url && String(s.url).trim().length > 0);
        if (validLinks.length > 0) {
          await prisma.socialLink.createMany({
            data: validLinks.map((s: any) => ({
              talentProfileId: talentProfile.id,
              platform: s.platform || 'OTHER',
              url: String(s.url).trim(),
              handle: s.handle ? String(s.handle).trim() : null,
            })),
          });
        }
      }

      // Update Skills
      if (Array.isArray(skills)) {
        await prisma.userSkill.deleteMany({ where: { talentProfileId: talentProfile.id } });
        for (const skillName of skills) {
          const trimmed = String(skillName).trim();
          if (!trimmed) continue;
          const skill = await prisma.skill.upsert({
            where: { name: trimmed },
            create: { name: trimmed, isApproved: true },
            update: {},
          });
          await prisma.userSkill.create({
            data: {
              talentProfileId: talentProfile.id,
              skillId: skill.id,
            },
          });
        }
      }

      // Update Languages
      if (Array.isArray(languages)) {
        await prisma.userLanguage.deleteMany({ where: { talentProfileId: talentProfile.id } });
        for (const langName of languages) {
          const trimmed = String(langName).trim();
          if (!trimmed) continue;
          const lang = await prisma.language.upsert({
            where: { name: trimmed },
            create: { name: trimmed },
            update: {},
          });
          await prisma.userLanguage.create({
            data: {
              talentProfileId: talentProfile.id,
              languageId: lang.id,
            },
          });
        }
      }

      // Update Categories (userTalents)
      if (Array.isArray(categoryIds)) {
        await prisma.userTalent.deleteMany({ where: { talentProfileId: talentProfile.id } });
        for (let i = 0; i < categoryIds.length; i++) {
          const catId = categoryIds[i];
          if (!catId) continue;
          await prisma.userTalent.create({
            data: {
              talentProfileId: talentProfile.id,
              categoryId: catId,
              isPrimary: i === 0,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true, data: updatedUser, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

// DELETE: Delete user & all related records
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const userId = resolved.id;

  try {
    // 1. If user has a talentProfile, delete child records first
    const talentProfile = await prisma.talentProfile.findUnique({ where: { userId } });
    if (talentProfile) {
      await prisma.userTalent.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.socialLink.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.userLanguage.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.userSkill.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.portfolioMedia.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.talentPricing.deleteMany({ where: { talentProfileId: talentProfile.id } });
      await prisma.talentProfile.delete({ where: { id: talentProfile.id } });
    }

    // 2. Delete sessions, notifications, client, employee
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.client.deleteMany({ where: { userId } });
    await prisma.employee.deleteMany({ where: { userId } });

    // 3. Delete user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true, message: 'User permanently deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
