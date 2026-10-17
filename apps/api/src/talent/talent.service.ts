import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SocialPlatform, HireRequestStatus, MediaType } from '@prisma/client';
import { TalentProfileStatus } from '@mdms/types';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateHireRequestDto } from './dto/create-hire-request.dto';

@Injectable()
export class TalentService {
  private readonly logger = new Logger(TalentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService
  ) {}

  async findAllPublic(query: { search?: string; type?: string; location?: string }) {
    return this.prisma.talentProfile.findMany({
      where: {
        status: { in: [TalentProfileStatus.ACTIVE, TalentProfileStatus.PENDING_REVIEW] },
        ...(query.search && {
          OR: [
            { bio: { contains: query.search, mode: 'insensitive' } },
            { stageName: { contains: query.search, mode: 'insensitive' } },
            { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
            { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
          ],
        }),
        ...(query.location && {
          user: { city: { contains: query.location, mode: 'insensitive' } },
        }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            city: true,
            state: true,
            gender: true,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePublic(idOrSlug: string) {
    const profile = await this.prisma.talentProfile.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
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
            country: true,
            gender: true,
            phone: true,
          },
        },
        userTalents: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        userLanguages: {
          include: {
            language: true,
          },
        },
        userSkills: {
          include: {
            skill: true,
          },
        },
        portfolioMedia: true,
        pricing: true,
        availability: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Talent profile not found');
    }

    // Merge draftData if available for missing fields
    if (profile.draftData && typeof profile.draftData === 'object') {
      const draft = profile.draftData as any;
      if (!profile.bio && draft.bio) {
        profile.bio = draft.bio;
      }
      if (!profile.stageName && (draft.stageName || draft.fullName)) {
        profile.stageName = draft.stageName || draft.fullName;
      }
      if (!profile.experienceLevel && (draft.experienceLevel || draft.experience)) {
        profile.experienceLevel = draft.experienceLevel || draft.experience;
      }
      if ((!profile.coverBannerUrl || profile.coverBannerUrl.startsWith('blob:')) && draft.coverBannerPreview && !draft.coverBannerPreview.startsWith('blob:')) {
        profile.coverBannerUrl = draft.coverBannerPreview;
      }
      if (profile.user && (!profile.user.avatarUrl || profile.user.avatarUrl.startsWith('blob:')) && draft.profilePhotoPreview && !draft.profilePhotoPreview.startsWith('blob:')) {
        profile.user.avatarUrl = draft.profilePhotoPreview;
      }
      if ((!profile.userTalents || profile.userTalents.length === 0) && (draft.category || draft.primaryCategory)) {
        (profile as any).inferredCategory = draft.category || draft.primaryCategory;
      }
      if (!profile.pricing && draft.pricingAmount) {
        const rate = parseInt(String(draft.pricingAmount).replace(/\D/g, ''), 10);
        if (rate) {
          (profile as any).pricing = {
            perDay: rate * 100,
            currency: 'INR',
          };
        }
      }
    }

    return profile;
  }

  private async ensureUserExists(userId: string, data?: any) {
    const rawName = data?.fullName || data?.stageName || '';
    const [firstName = 'Talent', ...rest] = rawName ? rawName.trim().split(' ') : ['Talent'];
    const lastName = rest.join(' ') || (userId ? userId.slice(0, 6) : 'User');
    const email = data?.email || `${userId?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'talent'}@mdms.com`;

    await this.prisma.user.upsert({
      where: { id: userId },
      update: {
        ...(data?.phone && { phone: data.phone }),
        ...(data?.city && { city: data.city }),
        ...(data?.state && { state: data.state }),
        ...(data?.country && { country: data.country }),
        ...(rawName && { firstName, lastName }),
      },
      create: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'TALENT',
        phone: data?.phone || null,
        city: data?.city || null,
        state: data?.state || null,
        country: data?.country || null,
        isActive: true,
      },
    });
  }

  async saveDraft(userId: string, data: any) {
    await this.ensureUserExists(userId, data?.wizardData || data);
    const { currentStep, wizardData } = data;
    
    // UPSERT a draft profile for the user
    return this.prisma.talentProfile.upsert({
      where: { userId },
      update: {
        onboardingStep: currentStep,
        draftData: wizardData,
      },
      create: {
        userId,
        slug: `draft-${userId}-${Date.now()}`,
        status: TalentProfileStatus.DRAFT,
        onboardingStep: currentStep,
        draftData: wizardData,
      },
    });
  }

  async submitProfile(userId: string, data: any) {
    await this.ensureUserExists(userId, data);
    const { 
      primaryTalentId, secondaryTalentIds, attributes,
      bio, stageName, experienceLevel,
      profilePhotoPreview, coverBannerPreview, introductionVideoPreview,
      resumeName, compCardName, galleryImages,
      achievements, education, brandsWorkedWith,
      instagram, youtube, linkedin, portfolio, facebook, imdb, website, behance, pinterest, spotify, tiktok,
      languages, skills, pricingType, pricingAmount,
      isAvailableForTravel, isAvailableForRemote, isAvailableImmediate,
      ...rest 
    } = data;

    const existing = await this.prisma.talentProfile.findUnique({ where: { userId } });
    let finalSlug = existing?.slug;
    if (!finalSlug || finalSlug.startsWith('draft-')) {
      const namePart = (stageName || data.fullName || 'talent').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      finalSlug = `${namePart}-${Date.now().toString().slice(-4)}`;
    }

    // Sanitize image previews (never save dead blob: URLs to database)
    const sanitizedCover = (coverBannerPreview && typeof coverBannerPreview === 'string' && !coverBannerPreview.startsWith('blob:'))
      ? coverBannerPreview
      : (existing?.coverBannerUrl && !existing.coverBannerUrl.startsWith('blob:') ? existing.coverBannerUrl : null);

    const sanitizedAvatar = (profilePhotoPreview && typeof profilePhotoPreview === 'string' && !profilePhotoPreview.startsWith('blob:'))
      ? profilePhotoPreview
      : null;

    // 1. Upsert profile with all the structured data
    const profile = await this.prisma.talentProfile.upsert({
      where: { userId },
      update: {
        slug: finalSlug,
        bio,
        stageName,
        experienceLevel,
        status: TalentProfileStatus.PENDING_REVIEW,
        onboardingStep: 7,
        onboardingCompleted: true,
        ...(sanitizedCover && { coverBannerUrl: sanitizedCover }),
        introductionVideoUrl: introductionVideoPreview && !introductionVideoPreview.startsWith('blob:') ? introductionVideoPreview : null,
        resumeUrl: resumeName ? `documents/${resumeName}` : null,
        compCardUrl: compCardName ? `documents/${compCardName}` : null,
        achievements: achievements ? (achievements as any) : Prisma.DbNull,
        education: education ? (education as any) : Prisma.DbNull,
        brandsWorkedWith,
        draftData: data || Prisma.DbNull,
      },
      create: {
        userId,
        slug: finalSlug,
        bio,
        stageName,
        experienceLevel,
        status: TalentProfileStatus.PENDING_REVIEW,
        onboardingStep: 7,
        onboardingCompleted: true,
        coverBannerUrl: sanitizedCover,
        introductionVideoUrl: introductionVideoPreview && !introductionVideoPreview.startsWith('blob:') ? introductionVideoPreview : null,
        resumeUrl: resumeName ? `documents/${resumeName}` : null,
        compCardUrl: compCardName ? `documents/${compCardName}` : null,
        achievements: achievements ? (achievements as any) : Prisma.DbNull,
        education: education ? (education as any) : Prisma.DbNull,
        brandsWorkedWith,
        draftData: data || Prisma.DbNull,
      },
    });

    if (sanitizedAvatar) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: sanitizedAvatar },
      }).catch(() => {});
    }

    // 2. Set categories (primary + secondary)
    await this.prisma.userTalent.deleteMany({
      where: { talentProfileId: profile.id }
    });

    let catId = primaryTalentId;
    if (!catId && (data.category || data.primaryCategory)) {
      const catName = data.category || data.primaryCategory;
      const matchedCat = await this.prisma.talentCategory.findFirst({
        where: { name: { equals: catName, mode: 'insensitive' } },
      });
      if (matchedCat) {
        catId = matchedCat.id;
      }
    }

    const categoryInserts = [];
    if (catId) {
      categoryInserts.push({
        talentProfileId: profile.id,
        categoryId: catId,
        isPrimary: true,
        attributes: attributes || {},
      });
    }
    
    if (secondaryTalentIds && Array.isArray(secondaryTalentIds)) {
      secondaryTalentIds.forEach(id => {
        categoryInserts.push({
          talentProfileId: profile.id,
          categoryId: id,
          isPrimary: false,
          attributes: {},
        });
      });
    }

    if (categoryInserts.length > 0) {
      await this.prisma.userTalent.createMany({ data: categoryInserts });
    }

    // 3. Set Social Links
    await this.prisma.socialLink.deleteMany({
      where: { talentProfileId: profile.id }
    });
    
    const socialLinks = [];
    if (instagram) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.INSTAGRAM, url: instagram });
    if (youtube) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.YOUTUBE, url: youtube });
    if (linkedin) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.LINKEDIN, url: linkedin });
    if (facebook) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.FACEBOOK, url: facebook });
    if (imdb) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.IMDB, url: imdb });
    if (website || portfolio) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.WEBSITE, url: website || portfolio });
    if (behance) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.BEHANCE, url: behance });
    if (pinterest) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.PINTEREST, url: pinterest });
    if (spotify) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.SPOTIFY, url: spotify });
    if (tiktok) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.TIKTOK, url: tiktok });
    if (socialLinks.length > 0) {
      await this.prisma.socialLink.createMany({ data: socialLinks });
    }
    
    // 4. Save Gallery Portfolio Media (excluding dead blob: URLs)
    if (galleryImages && Array.isArray(galleryImages) && galleryImages.length > 0) {
      await this.prisma.portfolioMedia.deleteMany({
        where: { talentProfileId: profile.id },
      });
      const mediaInserts = galleryImages
        .map((img: any, idx: number) => ({
          talentProfileId: profile.id,
          url: typeof img === 'string' ? img : (img.url || img.fileUrl || ''),
          type: MediaType.PORTFOLIO_IMAGE,
          order: idx,
        }))
        .filter((m: any) => Boolean(m.url) && !m.url.startsWith('blob:'));

      if (mediaInserts.length > 0) {
        await this.prisma.portfolioMedia.createMany({ data: mediaInserts });
      }
    }

    // 5. Save Pricing
    const numericRate = pricingAmount ? parseInt(String(pricingAmount).replace(/\D/g, ''), 10) : null;
    if (numericRate) {
      const perDay = pricingType === 'per-hour' ? null : numericRate * 100;
      const perHour = pricingType === 'per-hour' ? numericRate * 100 : null;
      await this.prisma.talentPricing.upsert({
        where: { talentProfileId: profile.id },
        update: { perDay, perHour, currency: 'INR' },
        create: { talentProfileId: profile.id, perDay, perHour, currency: 'INR' },
      }).catch(() => {});
    }

    // 6. Save Availability
    await this.prisma.talentAvailability.upsert({
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

    // 7. Save Spoken Languages
    if (languages && Array.isArray(languages) && languages.length > 0) {
      await this.prisma.userLanguage.deleteMany({ where: { talentProfileId: profile.id } }).catch(() => {});
      for (const langName of languages) {
        if (!langName || typeof langName !== 'string') continue;
        let lang = await this.prisma.language.findUnique({ where: { name: langName } }).catch(() => null);
        if (!lang) {
          lang = await this.prisma.language.create({ data: { name: langName } }).catch(() => null);
        }
        if (lang) {
          await this.prisma.userLanguage.create({
            data: { talentProfileId: profile.id, languageId: lang.id, proficiency: 'Fluent' },
          }).catch(() => {});
        }
      }
    }

    // 8. Save Skills & Specializations
    if (skills && Array.isArray(skills) && skills.length > 0) {
      await this.prisma.userSkill.deleteMany({ where: { talentProfileId: profile.id } }).catch(() => {});
      for (const skillName of skills) {
        if (!skillName || typeof skillName !== 'string') continue;
        let sk = await this.prisma.skill.findUnique({ where: { name: skillName } }).catch(() => null);
        if (!sk) {
          sk = await this.prisma.skill.create({ data: { name: skillName, isApproved: true } }).catch(() => null);
        }
        if (sk) {
          await this.prisma.userSkill.create({
            data: { talentProfileId: profile.id, skillId: sk.id },
          }).catch(() => {});
        }
      }
    }

    return profile;
  }

  async getPendingProfiles(status?: string) {
    let whereClause: Prisma.TalentProfileWhereInput = { status: TalentProfileStatus.PENDING_REVIEW };
    if (status === 'ALL') {
      whereClause = {};
    } else if (status === 'ACTIVE' || status === 'APPROVED') {
      whereClause = { status: TalentProfileStatus.ACTIVE };
    } else if (status === 'SUSPENDED' || status === 'REJECTED') {
      whereClause = { status: TalentProfileStatus.SUSPENDED };
    } else if (status === 'DRAFT') {
      whereClause = { status: TalentProfileStatus.DRAFT };
    } else if (status === 'PENDING_REVIEW') {
      whereClause = { status: TalentProfileStatus.PENDING_REVIEW };
    }

    return this.prisma.talentProfile.findMany({
      where: whereClause,
      include: {
        user: true,
        userTalents: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
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
        availability: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getProfileForModeration(idOrUserIdOrSlug: string) {
    const profile = await this.prisma.talentProfile.findFirst({
      where: {
        OR: [
          { id: idOrUserIdOrSlug },
          { userId: idOrUserIdOrSlug },
          { slug: idOrUserIdOrSlug },
        ],
      },
      include: {
        user: true,
        userTalents: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
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
        availability: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Talent profile ${idOrUserIdOrSlug} not found`);
    }

    return profile;
  }

  async moderateProfile(idOrUserId: string, status: TalentProfileStatus, reviewNote?: string) {
    const existing = await this.prisma.talentProfile.findFirst({
      where: {
        OR: [
          { id: idOrUserId },
          { userId: idOrUserId },
          { slug: idOrUserId },
        ],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Talent profile ${idOrUserId} not found`);
    }

    const profile = await this.prisma.talentProfile.update({
      where: { id: existing.id },
      data: { status, reviewNote, approvedAt: status === TalentProfileStatus.ACTIVE ? new Date() : null },
      include: { user: true },
    });

    if (profile.user?.phone) {
      try {
        if (status === TalentProfileStatus.ACTIVE) {
          this.whatsappService.sendMessage(
            profile.user.phone,
            `Congratulations ${profile.user.firstName}! Your MP Production talent profile has been approved and is now live.`
          );
        } else if (status === TalentProfileStatus.DEACTIVATED || status === TalentProfileStatus.SUSPENDED) {
          this.whatsappService.sendMessage(
            profile.user.phone,
            `MP Production: Your talent profile application update. Note: ${reviewNote || 'Please contact support.'}`
          );
        }
      } catch (err) {
        this.logger.warn(`Failed to send WhatsApp notification: ${err}`);
      }
    }

    return profile;
  }

  async getMe(userId: string) {
    if (!userId) {
      throw new NotFoundException('Talent profile not found');
    }
    try {
      const profile = await this.prisma.talentProfile.findUnique({
        where: { userId },
        include: {
          user: true,
          userTalents: {
            include: {
              category: true,
            },
          },
          userLanguages: { include: { language: true } },
          userSkills: { include: { skill: true } },
          socialLinks: true,
          portfolioMedia: true,
          pricing: true,
          availability: true,
          hireRequests: true,
          castingApplications: { include: { castingCall: true } },
        },
      });
      if (!profile) throw new NotFoundException('Talent profile not found');
      return profile;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.error('Error in TalentService.getMe:', err);
      throw new NotFoundException('Talent profile not found');
    }
  }

  async updateMe(userId: string, data: any) {
    return this.submitProfile(userId, data);
  }

  async getFeatured() {
    return this.prisma.talentProfile.findMany({
      where: { status: TalentProfileStatus.ACTIVE },
      take: 12,
      orderBy: { profileViews: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  // async addPortfolioPhotos(userId: string, urls: string[]) {
  //   const profile = await this.prisma.talentProfile.findUnique({ where: { userId } });
  //   if (!profile) throw new NotFoundException('Talent profile not found');
  //   
  //   return this.prisma.talentProfile.update({
  //     where: { userId },
  //     data: {
  //       portfolioPhotos: {
  //         push: urls
  //       }
  //     }
  //   });
  // }

  // async removePortfolioPhoto(userId: string, urlToRemove: string) {
  //   const profile = await this.prisma.talentProfile.findUnique({ where: { userId } });
  //   if (!profile) throw new NotFoundException('Talent profile not found');
  //   
  //   const photos = profile.portfolioPhotos as string[];
  //   const updatedPhotos = photos.filter((url: string) => url !== urlToRemove);
  //   
  //   return this.prisma.talentProfile.update({
  //     where: { userId },
  //     data: {
  //       portfolioPhotos: updatedPhotos
  //     }
  //   });
  // }

  async createHireRequest(talentId: string, data: CreateHireRequestDto) {
    const profile = await this.prisma.talentProfile.findUnique({
      where: { id: talentId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Talent profile not found');
    }

    const request = await this.prisma.hireRequest.create({
      data: {
        talentId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        requesterPhone: data.requesterPhone,
        projectType: data.projectType,
        city: data.city,
        dateNeeded: data.dateNeeded ? new Date(data.dateNeeded) : null,
        budgetRange: data.budgetRange,
        briefDescription: data.briefDescription,
        status: HireRequestStatus.NEW,
      },
    });

    // Auto-create SalesLead for sales pipeline tracking
    try {
      let estimatedValuePaise = 1500000; // Default ₹15,000 in paise
      if (data.budgetRange) {
        const nums = data.budgetRange.replace(/\D/g, '');
        if (nums) {
          const parsed = parseInt(nums, 10);
          if (!isNaN(parsed) && parsed > 0) estimatedValuePaise = parsed * 100;
        }
      }
      await this.prisma.salesLead.create({
        data: {
          clientName: data.requesterName || 'Talent Booking Client',
          email: data.requesterEmail || null,
          phone: data.requesterPhone || null,
          source: 'WEBSITE',
          stage: 'NEW',
          estimatedValue: estimatedValuePaise,
          notes: `[Talent Hire Inquiry for ${profile.user.firstName || 'Talent'}]\nProject: ${data.projectType || 'N/A'}\nCity: ${data.city || 'N/A'}\nBudget: ${data.budgetRange || 'N/A'}\nBrief: ${data.briefDescription || 'N/A'}`,
        }
      });
    } catch (err) {
      this.logger.error('Failed to auto-create SalesLead from HireRequest:', err);
    }

    // Notify the talent (optional) or admins
    if (profile.user.phone) {
      this.whatsappService.sendMessage(
        profile.user.phone,
        `Hi ${profile.user.firstName}, you have a new booking inquiry for a ${data.projectType} project. MP Productions team will contact you shortly with details.`
      );
    }

    return request;
  }
}
