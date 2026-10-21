import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // Environment variables initialization with safe fallbacks
  if (!process.env.AUTH_SECRET && !process.env.JWT_ACCESS_SECRET) {
    process.env.AUTH_SECRET = 'mdms_super_secret_auth_token_key_2026';
  }
  if (!process.env.JWT_ACCESS_SECRET) {
    process.env.JWT_ACCESS_SECRET = process.env.AUTH_SECRET || 'mdms_jwt_access_secret_2026';
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = 'mdms_jwt_refresh_secret_2026';
  }
  if (!process.env.RAZORPAY_KEY_ID) {
    process.env.RAZORPAY_KEY_ID = 'rzp_live_placeholder';
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    process.env.RAZORPAY_KEY_SECRET = 'rzp_secret_placeholder';
  }
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp_webhook_placeholder';
  }

  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ WARNING: DATABASE_URL is not set in environment variables');
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : configService.get<number>('API_PORT', 4000);
  const appUrl = configService.get<string>('APP_URL', 'https://mdms-production-main.vercel.app');

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  app.use(cookieParser());

  // CORS — allow localhost + production origins
  const allowedOrigins = [
    appUrl,
    'https://shivaste.com',
    'https://www.shivaste.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://mpproductions.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /(^|\.)shivaste\.com$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'apikey'],
  });

  // Support both /api/v1 and legacy /api endpoints smoothly
  app.use((req: any, res: any, next: any) => {
    if (req.url && req.url.startsWith('/api/') && !req.url.startsWith('/api/v1/')) {
      req.url = req.url.replace('/api/', '/api/v1/');
      req.originalUrl = req.url;
      if (req._parsedUrl) {
        req._parsedUrl.pathname = req._parsedUrl.pathname.replace('/api/', '/api/v1/');
        req._parsedUrl.path = req.url;
        req._parsedUrl.href = req.url;
      }
    }
    next();
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global response interceptor (standardized API responses)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 MDMS API running on http://0.0.0.0:${port}/api/v1`);
}
bootstrap();
