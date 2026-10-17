import { Controller, Get, Query, Param, Post, Req, Body, Patch } from '@nestjs/common';
import { TalentService } from './talent.service';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { Role, TalentProfileStatus } from '@mdms/types';
import { CreateHireRequestDto } from './dto/create-hire-request.dto';

@Controller('talent')
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Public()
  @Get()
  async getPublicDirectory(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
  ) {
    const profiles = await this.talentService.findAllPublic({ search, type, location });
    return {
      success: true,
      data: profiles,
    };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('pending')
  async getPendingProfiles(@Query('status') status?: string) {
    const profiles = await this.talentService.getPendingProfiles(status);
    return {
      success: true,
      data: profiles,
    };
  }

  @Roles(Role.TALENT, Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const profile = await this.talentService.getMe(userId);
    return {
      success: true,
      data: profile,
    };
  }

  @Roles(Role.TALENT, Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id || req.user?.sub;
    const profile = await this.talentService.updateMe(userId, body);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    };
  }

  // @Roles(Role.TALENT)
  // @Post('me/portfolio')
  // async addPortfolioPhotos(@Req() req: any, @Body('urls') urls: string[]) {
  //   const profile = await this.talentService.addPortfolioPhotos(req.user.id, urls);
  //   return {
  //     success: true,
  //     message: 'Portfolio updated successfully',
  //     data: profile,
  //   };
  // }

  // @Roles(Role.TALENT)
  // @Patch('me/portfolio/remove')
  // async removePortfolioPhoto(@Req() req: any, @Body('url') url: string) {
  //   const profile = await this.talentService.removePortfolioPhoto(req.user.id, url);
  //   return {
  //     success: true,
  //     message: 'Photo removed from portfolio',
  //     data: profile,
  //   };
  // }

  @Public()
  @Get('featured')
  async getFeatured() {
    const profiles = await this.talentService.getFeatured();
    return {
      success: true,
      data: profiles,
    };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get(':id/review')
  async getProfileForReview(@Param('id') id: string) {
    const profile = await this.talentService.getProfileForModeration(id);
    return {
      success: true,
      data: profile,
    };
  }

  @Public()
  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.talentService.findOnePublic(id);
    return {
      success: true,
      data: profile,
    };
  }

  @Public()
  @Post(':id/hire')
  async createHireRequest(
    @Param('id') id: string,
    @Body() dto: CreateHireRequestDto
  ) {
    const request = await this.talentService.createHireRequest(id, dto);
    return {
      success: true,
      message: 'Hire request submitted successfully',
      data: request,
    };
  }

  @Roles(Role.TALENT, Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('draft')
  async saveDraft(@Req() req: any, @Body() body: any) {
    const actorRole = req.user?.role;
    const isPrivileged = actorRole === Role.SUPER_ADMIN || actorRole === Role.ADMIN;
    const userId = (isPrivileged && body?.userId) ? body.userId : (req.user?.id || req.user?.sub);
    const profile = await this.talentService.saveDraft(userId, body);
    return {
      success: true,
      message: 'Draft saved successfully',
      data: profile,
    };
  }

  @Roles(Role.TALENT, Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('submit')
  async submitProfile(@Req() req: any, @Body() body: any) {
    const actorRole = req.user?.role;
    const isPrivileged = actorRole === Role.SUPER_ADMIN || actorRole === Role.ADMIN;
    const userId = (isPrivileged && body?.userId) ? body.userId : (req.user?.id || req.user?.sub);
    const profile = await this.talentService.submitProfile(userId, body);
    return {
      success: true,
      message: 'Profile submitted successfully',
      data: profile,
    };
  }

  // @Roles(Role.TALENT)
  // @Post('register')
  // async register(@Req() req: any, @Body() body: any) {
  //   const profile = await this.talentService.registerTalent(req.user.id, body);
  //   return {
  //     success: true,
  //     message: 'Talent profile registered successfully',
  //     data: profile,
  //   };
  // }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id/moderate')
  async moderateProfile(
    @Param('id') id: string,
    @Body('status') status: TalentProfileStatus,
    @Body('reviewNote') reviewNote?: string
  ) {
    const profile = await this.talentService.moderateProfile(id, status, reviewNote);
    return {
      success: true,
      message: `Profile marked as ${status}`,
      data: profile,
    };
  }
}
