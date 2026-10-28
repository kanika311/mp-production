import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import jwksClient from 'jwks-rsa';

/**
 * Decodes a JWT header+payload without verifying the signature.
 * Used to inspect alg/iss so we can pick the correct key.
 */
function decodeJwt(token: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
} | null {
  try {
    const [h, p] = token.split('.');
    if (!h || !p) return null;
    const header = JSON.parse(Buffer.from(h, 'base64').toString('utf8'));
    const payload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
    return { header, payload };
  } catch {
    return null;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const backendSecret = configService.get<string>('JWT_ACCESS_SECRET');
    const supabaseJwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
    const supabaseProjectId = configService.get<string>('SUPABASE_PROJECT_ID');
    const supabaseJwksUri = `https://${supabaseProjectId}.supabase.co/auth/v1/.well-known/jwks.json`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      /**
       * Route each token to the right key:
       *   - Supabase tokens (alg=ES256, aud="authenticated") → JWKS public key
       *   - Backend tokens (alg=HS256)                       → HMAC secret
       */
      secretOrKeyProvider: (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secret?: string | Buffer) => void,
      ) => {
        const decoded = decodeJwt(rawJwtToken);
        const alg = decoded?.header?.alg as string | undefined;
        const aud = decoded?.payload?.aud;
        const iss = decoded?.payload?.iss as string | undefined;

        const isSupabaseToken =
          alg === 'ES256' ||
          aud === 'authenticated' ||
          (typeof iss === 'string' && iss.includes('supabase'));

        if (isSupabaseToken) {
          // Legacy Supabase projects sign user JWTs with HS256 using the shared
          // JWT secret. Newer projects use ES256 with JWKS. Handle both.
          if (alg === 'HS256') {
            if (!supabaseJwtSecret) {
              return done(new Error('SUPABASE_JWT_SECRET is not configured'));
            }
            return done(null, supabaseJwtSecret);
          }

          // Use JWKS to get the EC public key for this token's kid
          const kid = decoded?.header?.kid as string | undefined;
          const client = jwksClient({
            jwksUri: supabaseJwksUri,
            cache: true,
            rateLimit: true,
          });

          client.getSigningKey(kid, (err: Error | null, key: jwksClient.SigningKey | undefined) => {
            if (err || !key) {
              return done(new Error(`JWKS key fetch failed: ${err?.message}`));
            }
            const publicKey = key.getPublicKey();
            return done(null, publicKey);
          });
        } else {
          // Backend-issued HS256 token
          done(null, backendSecret);
        }
      },
    });
  }

  async validate(payload: {
    sub: string;
    email?: string;
    role?: string;
    user_metadata?: { role?: string; full_name?: string };
    mfaPending?: boolean;
    aud?: string;
  }) {
    // Reject MFA-pending tokens (backend-issued interim tokens)
    if (payload.mfaPending) {
      throw new UnauthorizedException('MFA verification required');
    }

    const userId = payload.sub;

    // For Supabase tokens, auto-upsert the user so they exist in Prisma
    // even if they registered via Supabase UI without going through our API.
    const isSupabaseToken = payload.aud === 'authenticated';

    if (isSupabaseToken) {
      // Derive role from user_metadata (set during registration)
      const rawRole = payload.user_metadata?.role?.toUpperCase() ?? 'CLIENT';
      const validRoles = [
        'GUEST', 'CLIENT', 'TALENT', 'EDITOR',
        'EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN',
      ];
      const role = validRoles.includes(rawRole) ? rawRole : 'CLIENT';

      const fullName = payload.user_metadata?.full_name ?? '';
      const [firstName = 'User', ...rest] = fullName.trim().split(/\s+/);
      const lastName = rest.join(' ') || '';

      // Upsert: create if not exists, update role if it changed
      try {
        await this.prisma.user.upsert({
          where: { id: userId },
          create: {
            id: userId,
            email: payload.email ?? `${userId}@unknown.com`,
            firstName,
            lastName,
            role: role as any,
            isActive: true,
            phone: null,
          },
          update: {
            role: role as any,
            // Keep other fields as they are — don't overwrite user-set data
          },
        });
      } catch (upsertErr) {
        // If email or ID collision occurs (e.g. mock user existing with same email), update role by email
        if (payload.email) {
          await this.prisma.user.updateMany({
            where: { email: payload.email },
            data: { role: role as any },
          }).catch(() => {});
        }
      }
    }

    // Fetch the canonical user record from Prisma
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user && payload.email) {
      user = await this.prisma.user.findUnique({
        where: { email: payload.email },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return user;
  }
}

