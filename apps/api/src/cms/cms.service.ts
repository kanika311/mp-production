import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BlogPostStatus } from '@mdms/types';
import sanitizeHtml from 'sanitize-html';
import { randomUUID } from 'crypto';
import { PaginationDto } from '../common/dto/pagination.dto';

const REORDER_MODELS = [
  'portfolioItem',
  'testimonial',
  'teamMember',
  'faqItem',
  'service',
  'announcement',
] as const;

type ReorderModel = (typeof REORDER_MODELS)[number];

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private getModel(modelType: string) {
    const MODEL_MAP = {
      blog:         this.prisma.blogPost,
      blogPost:     this.prisma.blogPost,
      portfolio:    this.prisma.portfolioItem,
      portfolioItem:this.prisma.portfolioItem,
      testimonial:  this.prisma.testimonial,
      team:         this.prisma.teamMember,
      teamMember:   this.prisma.teamMember,
      faq:          this.prisma.faqItem,
      faqItem:      this.prisma.faqItem,
      service:      this.prisma.service,
      announcement: this.prisma.announcement,
      contactSubmission: this.prisma.contactSubmission,
      castingCall:  this.prisma.castingCall,
      talentProfile:this.prisma.talentProfile,
      booking:      this.prisma.booking,
      mediaAsset:   this.prisma.mediaAsset,
      featureFlag:  this.prisma.featureFlag,
      salesLead:    this.prisma.salesLead,
      salesTarget:  this.prisma.salesTarget,
      referral:     this.prisma.referral,
      course:       this.prisma.course,
      lesson:       this.prisma.lesson,
      student:      this.prisma.studentEnrollment,
      studentEnrollment: this.prisma.studentEnrollment,
    } as const;


    const model = MODEL_MAP[modelType as keyof typeof MODEL_MAP];
    if (!model) {
      throw new BadRequestException(`Unknown content type: ${modelType}`);
    }
    return model;
  }

  private async audit(params: {
    actorId: string;
    action: string;
    resource: string;
    resourceId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.auditService.log(params);
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for ${params.action} ${params.resource}`,
        err as Error,
      );
    }
  }

  // ── Portfolio ──────────────────────────────────────────────
  async getPortfolioItems(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.portfolioItem.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.portfolioItem.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.portfolioItem.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getPortfolioItem(slug: string) {
    const item = await this.prisma.portfolioItem.findFirst({
      where: { slug, deletedAt: null }
    });
    if (!item) throw new NotFoundException('Portfolio item not found');
    return item;
  }

  async upsertPortfolioItem(slug: string, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.portfolioItem.findUnique({ where: { slug } });
    const isNew = !existing;

    const result = await this.prisma.portfolioItem.upsert({
      where: { slug },
      update: { ...data, deletedAt: null },
      create: { slug, ...data }
    });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_PORTFOLIO_ITEM' : 'UPDATE_PORTFOLIO_ITEM',
      resource: 'PortfolioItem',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeletePortfolioItem(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.portfolioItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_PORTFOLIO_ITEM', resource: 'PortfolioItem', resourceId: id });
    return result;
  }

  // ── Blog ───────────────────────────────────────────────────
  async getBlogPosts(status?: BlogPostStatus, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.blogPost.findMany({
          where: {
            deletedAt: null,
            ...(status ? { status } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.blogPost.count({
          where: {
            deletedAt: null,
            ...(status ? { status } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.blogPost.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBlogPostBySlug(slug: string, token?: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, deletedAt: null }
    });
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    if (token) {
      if (post.previewToken !== token) {
        throw new ForbiddenException('Invalid preview token');
      }
      return post;
    }

    if (post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async upsertBlogPost(slug: string, data: any, authorId?: string) {
    if (!authorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    const isNew = !existing;

    const cleanContent = data.content ? sanitizeHtml(data.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'figure', 'figcaption']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height'],
        a: ['href', 'target', 'rel'],
      },
    }) : undefined;

    const previewToken = randomUUID();
    const updateData = {
      ...data,
      ...(cleanContent && { content: cleanContent }),
      previewToken,
      deletedAt: null,
    };
    const createData = {
      slug,
      authorId,
      ...data,
      ...(cleanContent && { content: cleanContent }),
      previewToken,
    };

    const result = await this.prisma.blogPost.upsert({
      where: { slug },
      update: updateData,
      create: createData
    });

    await this.audit({
      actorId: authorId,
      action: isNew ? 'CREATE_BLOG_POST' : 'UPDATE_BLOG_POST',
      resource: 'BlogPost',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteBlogPost(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_BLOG_POST', resource: 'BlogPost', resourceId: id });
    return result;
  }

  async getActiveCastingCalls() {
    return this.prisma.castingCall.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ── Testimonials ───────────────────────────────────────────
  async getTestimonials(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.testimonial.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true, isApproved: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.testimonial.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true, isApproved: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.testimonial.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true, isApproved: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createTestimonial(data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.testimonial.create({ data });
    await this.audit({ actorId, action: 'CREATE_TESTIMONIAL', resource: 'Testimonial', resourceId: result.id, after: result as any });
    return result;
  }

  async updateTestimonial(id: string, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    const result = await this.prisma.testimonial.update({ where: { id }, data });
    await this.audit({
      actorId,
      action: 'UPDATE_TESTIMONIAL',
      resource: 'Testimonial',
      resourceId: id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteTestimonial(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.testimonial.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_TESTIMONIAL', resource: 'Testimonial', resourceId: id });
    return result;
  }

  // ── Team ───────────────────────────────────────────────────
  async getTeamMembers(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.teamMember.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.teamMember.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.teamMember.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async upsertTeamMember(id: string | null, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = id ? await this.prisma.teamMember.findUnique({ where: { id } }) : null;
    const isNew = !existing;

    const result = id
      ? await this.prisma.teamMember.update({ where: { id }, data })
      : await this.prisma.teamMember.create({ data });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_TEAM_MEMBER' : 'UPDATE_TEAM_MEMBER',
      resource: 'TeamMember',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteTeamMember(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.teamMember.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_TEAM_MEMBER', resource: 'TeamMember', resourceId: id });
    return result;
  }

  // ── FAQ ────────────────────────────────────────────────────
  async getFaqItems(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.faqItem.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.faqItem.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.faqItem.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async upsertFaqItem(id: string | null, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = id ? await this.prisma.faqItem.findUnique({ where: { id } }) : null;
    const isNew = !existing;

    const result = id
      ? await this.prisma.faqItem.update({ where: { id }, data })
      : await this.prisma.faqItem.create({ data });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_FAQ_ITEM' : 'UPDATE_FAQ_ITEM',
      resource: 'FaqItem',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteFaqItem(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.faqItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_FAQ_ITEM', resource: 'FaqItem', resourceId: id });
    return result;
  }

  // ── Services ───────────────────────────────────────────────
  async getServices(activeOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.service.findMany({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.service.count({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.service.findMany({
      where: {
        deletedAt: null,
        ...(activeOnly ? { isActive: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getServiceBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, deletedAt: null }
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async upsertService(slug: string, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.service.findUnique({ where: { slug } });
    const isNew = !existing;

    const result = await this.prisma.service.upsert({
      where: { slug },
      update: { ...data, deletedAt: null },
      create: { slug, ...data }
    });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_SERVICE' : 'UPDATE_SERVICE',
      resource: 'Service',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteService(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_SERVICE', resource: 'Service', resourceId: id });
    return result;
  }

  // ── Contact Submissions ────────────────────────────────────
  async submitContactForm(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    const contact = await this.prisma.contactSubmission.create({
      data
    });

    // Auto-create a SalesLead in sales pipeline in DB so it shows up in Sales Management Hub!
    try {
      let estimatedValuePaise = 500000; // Default ₹5,000 in paise
      if (data.message) {
        const match = data.message.match(/₹\s*([\d,]+)/);
        if (match && match[1]) {
          const parsedNum = parseInt(match[1].replace(/,/g, ''), 10);
          if (!isNaN(parsedNum) && parsedNum > 0) {
            estimatedValuePaise = parsedNum * 100;
          }
        }
      }

      let source = 'WEBSITE';
      const text = `${data.subject || ''} ${data.message || ''}`.toLowerCase();
      if (text.includes('whatsapp')) {
        source = 'WHATSAPP';
      } else if (text.includes('call') || text.includes('phone')) {
        source = 'CALL';
      } else if (text.includes('instagram') || text.includes('youtube') || text.includes('social')) {
        source = 'SOCIAL_MEDIA';
      }

      await this.prisma.salesLead.create({
        data: {
          clientName: data.name.trim() || 'Website Visitor Lead',
          email: data.email ? data.email.trim() : null,
          phone: data.phone ? data.phone.trim() : null,
          source,
          stage: 'NEW',
          estimatedValue: estimatedValuePaise,
          notes: `Subject: ${data.subject || 'Website Inquiry'}\n${data.message || ''}`,
        }
      });
    } catch (err) {
      this.logger.error('Failed to auto-create SalesLead from contact form submission:', err);
    }

    return contact;
  }

  async getContactSubmissions(dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.contactSubmission.findMany({
          where: { deletedAt: null },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.contactSubmission.count({
          where: { deletedAt: null }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.contactSubmission.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markContactRead(id: string, isRead: boolean = true) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { isRead }
    });
  }

  async softDeleteContact(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.contactSubmission.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_CONTACT_SUBMISSION', resource: 'ContactSubmission', resourceId: id });
    return result;
  }

  // ── Newsletter Subscribers ─────────────────────────────────
  async subscribeNewsletter(email: string) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, deletedAt: null },
      create: { email, isActive: true }
    });
  }

  async getNewsletterSubscribers(dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.newsletterSubscriber.findMany({
          where: { deletedAt: null },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.newsletterSubscriber.count({
          where: { deletedAt: null }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.newsletterSubscriber.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteNewsletterSubscriber(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
    await this.audit({ actorId, action: 'DELETE_NEWSLETTER_SUBSCRIBER', resource: 'NewsletterSubscriber', resourceId: id });
    return result;
  }

  // ── Announcements ──────────────────────────────────────────
  async getAnnouncements(activeOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.announcement.findMany({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.announcement.count({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.announcement.findMany({
      where: {
        deletedAt: null,
        ...(activeOnly ? { isActive: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async upsertAnnouncement(id: string | null, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = id ? await this.prisma.announcement.findUnique({ where: { id } }) : null;
    const isNew = !existing;

    const result = id
      ? await this.prisma.announcement.update({ where: { id }, data })
      : await this.prisma.announcement.create({ data });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_ANNOUNCEMENT' : 'UPDATE_ANNOUNCEMENT',
      resource: 'Announcement',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteAnnouncement(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_ANNOUNCEMENT', resource: 'Announcement', resourceId: id });
    return result;
  }

  // ── System / Site Configs (Hero, Navbar, Footer, SEO) ──────
  async getConfig(key: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!config) return null;
    try {
      return JSON.parse(config.value);
    } catch {
      return config.value;
    }
  }

  async setConfig(key: string, value: any, type: string = 'json', actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const existing = await this.prisma.systemConfig.findUnique({ where: { key } });
    const result = await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value: stringValue, type },
      create: { key, value: stringValue, type }
    });
    await this.audit({
      actorId,
      action: 'SET_CONFIG',
      resource: 'SystemConfig',
      resourceId: key,
      before: existing ? { value: existing.value } : undefined,
      after: { value: stringValue }
    });
    return result;
  }

  // ── Reordering (Batch SortOrder Update) ────────────────────
  async reorderItems(model: string, items: { id: string; sortOrder: number }[], actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    if (!REORDER_MODELS.includes(model as ReorderModel)) {
      throw new BadRequestException(`Invalid model for reorder: ${model}`);
    }
    const delegate = this.prisma[model as ReorderModel] as any;
    const queries = items.map(item =>
      delegate.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    );
    const result = await this.prisma.$transaction(queries);
    await this.audit({ actorId, action: 'CMS_REORDER', resource: model });
    return result;
  }

  // ── Recycle Bin (Soft Deleted Items & Purge) ───────────────
  async getRecycleBinItems() {
    const [portfolio, blog, testimonials, team, faq, services, contact, announcements] = await Promise.all([
      this.prisma.portfolioItem.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.blogPost.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.testimonial.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.teamMember.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.faqItem.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.service.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.contactSubmission.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.announcement.findMany({ where: { deletedAt: { not: null } } })
    ]);

    return [
      ...portfolio.map(i => ({ ...i, modelType: 'portfolioItem' })),
      ...blog.map(i => ({ ...i, modelType: 'blogPost' })),
      ...testimonials.map(i => ({ ...i, modelType: 'testimonial' })),
      ...team.map(i => ({ ...i, modelType: 'teamMember' })),
      ...faq.map(i => ({ ...i, modelType: 'faqItem' })),
      ...services.map(i => ({ ...i, modelType: 'service' })),
      ...contact.map(i => ({ ...i, modelType: 'contactSubmission' })),
      ...announcements.map(i => ({ ...i, modelType: 'announcement' }))
    ];
  }

  async restoreRecycleBinItem(modelType: string, id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const model = this.getModel(modelType);
    const result = await (model as any).update({
      where: { id },
      data: { deletedAt: null }
    });
    await this.audit({ actorId, action: 'RESTORE_CMS_ITEM', resource: modelType, resourceId: id });
    return result;
  }

  async permanentDeleteRecycleBinItem(modelType: string, id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const model = this.getModel(modelType);
    const result = await (model as any).delete({
      where: { id }
    });
    await this.audit({ actorId, action: 'PERMANENT_DELETE_CMS_ITEM', resource: modelType, resourceId: id });
    return result;
  }

  // ── Casting Calls Admin ──────────────────────────────────
  async getCastingCallsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.castingCall.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.castingCall.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async upsertCastingCall(data: any, actorId?: string) {
    const id = data.id;
    let result;
    if (id) {
      result = await this.prisma.castingCall.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          projectType: data.projectType,
          city: data.city,
          location: data.location,
          compensationType: data.compensationType,
          compensationDetails: data.compensationDetails,
          slotsAvailable: data.slotsAvailable ? Number(data.slotsAvailable) : 1,
          status: data.status || 'DRAFT',
        },
      });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPDATE_CASTING_CALL', resource: 'CastingCall', resourceId: id });
    } else {
      result = await this.prisma.castingCall.create({
        data: {
          title: data.title,
          description: data.description,
          projectType: data.projectType || 'Production',
          city: data.city,
          location: data.location,
          compensationType: data.compensationType,
          compensationDetails: data.compensationDetails,
          slotsAvailable: data.slotsAvailable ? Number(data.slotsAvailable) : 1,
          status: data.status || 'DRAFT',
          createdById: actorId || 'SYSTEM',
        },
      });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'CREATE_CASTING_CALL', resource: 'CastingCall', resourceId: result.id });
    }
    return result;
  }

  async deleteCastingCall(id: string, actorId?: string) {
    const result = await this.prisma.castingCall.delete({ where: { id } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'DELETE_CASTING_CALL', resource: 'CastingCall', resourceId: id });
    return result;
  }

  // ── Talents Admin ──────────────────────────────────────────
  async getTalentsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.talentProfile.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.talentProfile.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateTalentStatus(id: string, data: any, actorId?: string) {
    const result = await this.prisma.talentProfile.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.experienceLevel && { experienceLevel: data.experienceLevel }),
        ...(data.bio && { bio: data.bio }),
        ...(data.reviewNote && { reviewNote: data.reviewNote }),
        ...(data.stageName && { stageName: data.stageName }),
      },
    });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPDATE_TALENT_PROFILE', resource: 'TalentProfile', resourceId: id });
    return result;
  }

  async deleteTalent(id: string, actorId?: string) {
    const result = await this.prisma.talentProfile.delete({ where: { id } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'DELETE_TALENT_PROFILE', resource: 'TalentProfile', resourceId: id });
    return result;
  }

  // ── Bookings Admin ────────────────────────────────────────
  async getBookingsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateBookingAdmin(id: string, data: any, actorId?: string) {
    const result = await this.prisma.booking.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.projectBrief && { projectBrief: data.projectBrief }),
        ...(data.specialRequirements && { specialRequirements: data.specialRequirements }),
        ...(data.cancellationReason && { cancellationReason: data.cancellationReason }),
      },
    });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPDATE_BOOKING', resource: 'Booking', resourceId: id });
    return result;
  }

  async deleteBookingAdmin(id: string, actorId?: string) {
    const result = await this.prisma.booking.delete({ where: { id } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'DELETE_BOOKING', resource: 'Booking', resourceId: id });
    return result;
  }

  // ── Media Assets Admin ─────────────────────────────────────
  async getMediaAssetsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mediaAsset.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async deleteMediaAsset(id: string, actorId?: string) {
    const result = await this.prisma.mediaAsset.delete({ where: { id } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'DELETE_MEDIA_ASSET', resource: 'MediaAsset', resourceId: id });
    return result;
  }

  // ── Feature Flags Admin ────────────────────────────────────
  async getFeatureFlagsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.featureFlag.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.featureFlag.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async upsertFeatureFlag(data: any, actorId?: string) {
    const id = data.id;
    let result;
    if (id) {
      result = await this.prisma.featureFlag.update({
        where: { id },
        data: {
          key: data.key,
          description: data.description,
          environment: data.environment || 'all',
          enabled: data.enabled ?? false,
        },
      });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPDATE_FEATURE_FLAG', resource: 'FeatureFlag', resourceId: id });
    } else {
      result = await this.prisma.featureFlag.upsert({
        where: { key: data.key },
        update: {
          description: data.description,
          environment: data.environment || 'all',
          enabled: data.enabled ?? false,
        },
        create: {
          key: data.key,
          description: data.description,
          environment: data.environment || 'all',
          enabled: data.enabled ?? false,
        },
      });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'CREATE_FEATURE_FLAG', resource: 'FeatureFlag', resourceId: result.id });
    }
    return result;
  }

  async deleteFeatureFlag(id: string, actorId?: string) {
    const result = await this.prisma.featureFlag.delete({ where: { id } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'DELETE_FEATURE_FLAG', resource: 'FeatureFlag', resourceId: id });
    return result;
  }

  // ── Sales Leads Admin ─────────────────────────────────────
  async getSalesLeadsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.salesLead.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesLead.count({ where: { deletedAt: null } }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async upsertSalesLead(data: any, actorId?: string) {
    const id = data.id;
    let result;
    const payload = {
      clientName: data.clientName,
      email: data.email || null,
      phone: data.phone || null,
      source: data.source || 'WEBSITE',
      stage: data.stage || 'NEW',
      estimatedValue: data.estimatedValue ? parseInt(data.estimatedValue, 10) : null,
      notes: data.notes || null,
    };

    if (id) {
      result = await this.prisma.salesLead.update({ where: { id }, data: payload });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPDATE_SALES_LEAD', resource: 'SalesLead', resourceId: id });
    } else {
      result = await this.prisma.salesLead.create({ data: payload });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'CREATE_SALES_LEAD', resource: 'SalesLead', resourceId: result.id });
    }
    return result;
  }

  async deleteSalesLead(id: string, actorId?: string) {
    const result = await this.prisma.salesLead.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'SOFT_DELETE_SALES_LEAD', resource: 'SalesLead', resourceId: id });
    return result;
  }

  // ── Sales Targets Admin ───────────────────────────────────
  async getSalesTargetsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.salesTarget.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.salesTarget.count({ where: { deletedAt: null } }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async upsertSalesTarget(data: any, actorId?: string) {
    const id = data.id;
    let result;
    const year = parseInt(data.year, 10);
    const month = parseInt(data.month, 10);
    const payload = {
      year,
      month,
      targetAmount: parseInt(data.targetAmount, 10) || 0,
      achievedAmount: data.achievedAmount ? parseInt(data.achievedAmount, 10) : 0,
      targetBookings: data.targetBookings ? parseInt(data.targetBookings, 10) : 10,
      achievedBookings: data.achievedBookings ? parseInt(data.achievedBookings, 10) : 0,
      notes: data.notes || null,
    };

    if (id) {
      result = await this.prisma.salesTarget.update({ where: { id }, data: payload });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPDATE_SALES_TARGET', resource: 'SalesTarget', resourceId: id });
    } else {
      result = await this.prisma.salesTarget.upsert({
        where: { year_month: { year, month } },
        update: payload,
        create: payload,
      });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPSERT_SALES_TARGET', resource: 'SalesTarget', resourceId: result.id });
    }
    return result;
  }

  async deleteSalesTarget(id: string, actorId?: string) {
    const result = await this.prisma.salesTarget.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'SOFT_DELETE_SALES_TARGET', resource: 'SalesTarget', resourceId: id });
    return result;
  }

  // ── Referrals Admin ────────────────────────────────────────
  async getReferralsAdmin(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.referral.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.referral.count({ where: { deletedAt: null } }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async upsertReferral(data: any, actorId?: string) {
    const id = data.id;
    let result;
    const payload = {
      referrerName: data.referrerName,
      referrerEmail: data.referrerEmail,
      referredClientName: data.referredClientName,
      referredClientPhone: data.referredClientPhone || null,
      status: data.status || 'PENDING',
      rewardAmount: data.rewardAmount ? parseInt(data.rewardAmount, 10) : null,
      referralCode: data.referralCode || null,
    };

    if (id) {
      result = await this.prisma.referral.update({ where: { id }, data: payload });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'UPDATE_REFERRAL', resource: 'Referral', resourceId: id });
    } else {
      result = await this.prisma.referral.create({ data: payload });
      await this.audit({ actorId: actorId || 'SYSTEM', action: 'CREATE_REFERRAL', resource: 'Referral', resourceId: result.id });
    }
    return result;
  }

  async deleteReferral(id: string, actorId?: string) {
    const result = await this.prisma.referral.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'SOFT_DELETE_REFERRAL', resource: 'Referral', resourceId: id });
    return result;
  }

  // ── Student Management & Creator Academy Realtime Security ──
  async blockStudent(id: string, actorId?: string) {
    const student = await this.prisma.studentEnrollment.update({
      where: { id },
      data: { isBlocked: true },
    });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'BLOCK_STUDENT', resource: 'StudentEnrollment', resourceId: id });
    return student;
  }

  async unblockStudent(id: string, actorId?: string) {
    const student = await this.prisma.studentEnrollment.update({
      where: { id },
      data: { isBlocked: false },
    });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'UNBLOCK_STUDENT', resource: 'StudentEnrollment', resourceId: id });
    return student;
  }

  async approveEnrollment(id: string, actorId?: string) {
    const student = await this.prisma.studentEnrollment.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'APPROVE_STUDENT_ENROLLMENT', resource: 'StudentEnrollment', resourceId: id });
    return student;
  }

  async submitStudentUtr(dto: { name: string; email: string; phone?: string; courseId: string; utrNumber: string }) {
    let course = await this.prisma.course.findFirst({ where: { OR: [{ id: dto.courseId }, { slug: dto.courseId }] } });
    if (!course) {
      course = await this.prisma.course.create({
        data: {
          id: dto.courseId,
          slug: dto.courseId,
          title: 'Creator Masterclass',
          categoryLabel: 'Masterclass',
          duration: '4 Hours',
          price: '₹4,999',
          numericPrice: 4999,
          originalPrice: '₹12,999',
          image: '/images/services-lighting.jpg',
          instructorName: 'Master Instructor',
        },
      });
    }

    const existing = await this.prisma.studentEnrollment.findFirst({
      where: { studentEmail: dto.email, courseId: course.id },
    });

    if (existing) {
      return this.prisma.studentEnrollment.update({
        where: { id: existing.id },
        data: {
          utrNumber: dto.utrNumber,
          status: 'PENDING_APPROVAL',
          studentPhone: dto.phone || existing.studentPhone,
        },
      });
    }

    return this.prisma.studentEnrollment.create({
      data: {
        studentName: dto.name,
        studentEmail: dto.email,
        studentPhone: dto.phone || '',
        courseId: course.id,
        utrNumber: dto.utrNumber,
        status: 'PENDING_APPROVAL',
      },
    });
  }

  async getAdminStudentsList(dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 50;
    const [data, total] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { course: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentEnrollment.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async checkStudentStatus(email: string, courseId: string) {
    if (!email) return { status: 'UNAUTHENTICATED', isBlocked: false, isUnlocked: false };

    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: { studentEmail: email },
      include: { course: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!enrollment) {
      return { status: 'NOT_ENROLLED', isBlocked: false, isUnlocked: false };
    }

    return {
      status: enrollment.status,
      isBlocked: enrollment.isBlocked,
      isUnlocked: enrollment.status === 'APPROVED' && !enrollment.isBlocked,
      studentName: enrollment.studentName,
      utrNumber: enrollment.utrNumber,
      courseTitle: enrollment.course?.title,
    };
  }

  // ── Creator Academy Courses Admin ──
  async getCoursesAdmin(publishedOnly: boolean = false, dto?: PaginationDto) {
    const page = dto?.page || 1;
    const limit = dto?.limit || 50;
    const where = {
      deletedAt: null,
      ...(publishedOnly ? { isPublished: true } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { lessons: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async upsertCourse(data: any, actorId?: string) {
    const id = typeof data.id === 'string' && data.id.length > 0 ? data.id : undefined;
    const slug =
      typeof data.slug === 'string' && data.slug.length > 0
        ? data.slug
        : undefined;

    let existing: { id: string } | null = null;
    if (id) {
      existing = await this.prisma.course.findFirst({
        where: { id, deletedAt: null },
        select: { id: true },
      });
    }
    if (!existing && slug) {
      existing = await this.prisma.course.findFirst({
        where: { slug, deletedAt: null },
        select: { id: true },
      });
    }

    // Partial patch: only write fields that were actually sent (publish toggle, etc.)
    const patch: Record<string, unknown> = {};
    if (data.slug !== undefined) patch.slug = String(data.slug);
    if (data.title !== undefined) patch.title = String(data.title);
    if (data.categoryLabel !== undefined) patch.categoryLabel = String(data.categoryLabel);
    if (data.duration !== undefined) patch.duration = String(data.duration);
    if (data.lessonsCount !== undefined) {
      patch.lessonsCount = parseInt(String(data.lessonsCount), 10) || 0;
    }
    if (data.price !== undefined) patch.price = String(data.price);
    if (data.numericPrice !== undefined) {
      patch.numericPrice = parseInt(String(data.numericPrice), 10) || 0;
    }
    if (data.originalPrice !== undefined) patch.originalPrice = String(data.originalPrice);
    if (data.image !== undefined) patch.image = String(data.image);
    if (data.instructorName !== undefined) patch.instructorName = String(data.instructorName);
    if (data.description !== undefined) patch.description = data.description || null;
    if (data.isPublished !== undefined) patch.isPublished = Boolean(data.isPublished);
    if (data.sortOrder !== undefined) {
      patch.sortOrder = parseInt(String(data.sortOrder), 10) || 0;
    }
    if (data.category !== undefined) patch.category = String(data.category);
    if (data.badgeColor !== undefined) patch.badgeColor = String(data.badgeColor);
    if (data.level !== undefined) patch.level = String(data.level);
    if (data.rating !== undefined) patch.rating = Number(data.rating);
    if (data.enrolledCount !== undefined) {
      patch.enrolledCount = parseInt(String(data.enrolledCount), 10) || 0;
    }
    if (data.trailerVideoUrl !== undefined) {
      patch.trailerVideoUrl = data.trailerVideoUrl || null;
    }
    if (data.topics !== undefined) {
      patch.topics = Array.isArray(data.topics) ? data.topics : [];
    }
    if (data.resources !== undefined) {
      patch.resources = Array.isArray(data.resources) ? data.resources : [];
    }
    if (data.modules !== undefined) patch.modules = data.modules;
    if (data.instructorRole !== undefined) {
      patch.instructorRole = data.instructorRole || null;
    }
    if (data.instructorAvatar !== undefined) {
      patch.instructorAvatar = data.instructorAvatar || null;
    }
    if (data.instructorBio !== undefined) {
      patch.instructorBio = data.instructorBio || null;
    }

    let result;
    if (existing) {
      result = await this.prisma.course.update({
        where: { id: existing.id },
        data: patch,
      });
      await this.audit({
        actorId: actorId || 'SYSTEM',
        action: 'UPDATE_COURSE',
        resource: 'Course',
        resourceId: existing.id,
      });
    } else {
      result = await this.prisma.course.create({
        data: {
          slug: slug || `course-${Date.now()}`,
          title: (data.title as string) || 'Untitled Course',
          categoryLabel: (data.categoryLabel as string) || 'Masterclass',
          duration: (data.duration as string) || '4 Hours',
          lessonsCount:
            data.lessonsCount !== undefined
              ? parseInt(String(data.lessonsCount), 10) || 0
              : 0,
          price: (data.price as string) || '₹4,999',
          numericPrice:
            data.numericPrice !== undefined
              ? parseInt(String(data.numericPrice), 10) || 4999
              : 4999,
          originalPrice: (data.originalPrice as string) || '₹12,999',
          image: (data.image as string) || '/images/services-lighting.jpg',
          instructorName: (data.instructorName as string) || 'Master Instructor',
          description: (data.description as string) || null,
          isPublished:
            data.isPublished !== undefined ? Boolean(data.isPublished) : true,
          sortOrder:
            data.sortOrder !== undefined
              ? parseInt(String(data.sortOrder), 10) || 0
              : 0,
          category: (data.category as string) || 'CREATOR',
          badgeColor: (data.badgeColor as string) || 'bg-brand text-white',
          level: (data.level as string) || 'Creator',
          rating: data.rating !== undefined ? Number(data.rating) : 5,
          enrolledCount:
            data.enrolledCount !== undefined
              ? parseInt(String(data.enrolledCount), 10) || 0
              : 0,
          trailerVideoUrl: (data.trailerVideoUrl as string) || null,
          topics: Array.isArray(data.topics) ? data.topics : [],
          resources: Array.isArray(data.resources) ? data.resources : [],
          modules: data.modules ?? undefined,
          instructorRole: (data.instructorRole as string) || null,
          instructorAvatar: (data.instructorAvatar as string) || null,
          instructorBio: (data.instructorBio as string) || null,
        },
      });
      await this.audit({
        actorId: actorId || 'SYSTEM',
        action: 'CREATE_COURSE',
        resource: 'Course',
        resourceId: result.id,
      });
    }
    return result;
  }

  async softDeleteCourse(id: string, actorId?: string) {
    const result = await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit({ actorId: actorId || 'SYSTEM', action: 'SOFT_DELETE_COURSE', resource: 'Course', resourceId: id });
    return result;
  }
}

