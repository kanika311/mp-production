import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── OTP Flow (Client + Talent) ──────────────

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.verifyOtp(email, otp);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn, user: tokens.user };
  }

  // ── Password Flow (Employee, PM) ────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWithPassword(email, password);

    if ('mfaRequired' in result && result.mfaRequired) {
      return result; // Client handles MFA step
    }

    if ('refreshToken' in result) {
      this.setRefreshTokenCookie(res, result.refreshToken);
      const token = result.accessToken;

      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        path: '/',
        httpOnly: false,
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: isProd,
      };
      res.cookie('token', token, cookieOptions);
      res.cookie('mdms_auth_token', token, cookieOptions);
      res.cookie('next-auth.session-token', token, cookieOptions);

      return {
        ok: true,
        success: true,
        token,
        accessToken: token,
        expiresIn: result.expiresIn,
        user: result.user,
      };
    }
    
    return { ok: false, success: false, message: 'Unexpected response from login' };
  }

  // ── MFA Verification ───────────────────────

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(
    @Body('mfaToken') mfaToken: string,
    @Body('totpCode') totpCode: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.verifyMfa(mfaToken, totpCode);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn, user: tokens.user };
  }

  // ── MFA Setup ──────────────────────────────

  @Post('mfa/setup')
  async setupMfa(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.authService.setupMfa(user.id);
  }

  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  async enableMfa(@Req() req: Request, @Body('totpCode') totpCode: string) {
    const user = req.user as { id: string };
    return this.authService.enableMfa(user.id, totpCode);
  }

  // ── Token Refresh ──────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return { success: false, message: 'No refresh token' };
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn, user: tokens.user };
  }

  // ── Logout ─────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { id: string };
    const refreshToken = req.cookies?.refreshToken;
    res.clearCookie('refreshToken');
    return this.authService.logout(user.id, refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { id: string };
    res.clearCookie('refreshToken');
    return this.authService.logout(user.id);
  }

  // ── Client Registration ────────────────────

  @Public()
  @Post('register/client')
  async registerClient(
    @Body() body: { email: string; firstName: string; lastName: string; phone?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.registerClient(body);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn, user: tokens.user };
  }

  @Public()
  @Post('register')
  async register(
    @Body() body: { email: string; password?: string; firstName: string; lastName: string; role: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.registerUser(body);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn, user: tokens.user };
  }

  // ── Current User ───────────────────────────

  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.authService.validateUser(user.id);
  }

  // ── Helper: Set HTTP-only cookie ───────────

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days max
      path: '/api/v1/auth',
    });
  }
}
