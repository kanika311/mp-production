// Bypass Turbopack Windows junction point creation on hoisted monorepo packages
const PrismaClientConstructor =
  typeof window === 'undefined'
    ? (eval("require('@prisma/client')").PrismaClient as any)
    : class {};

const globalForPrisma = globalThis as unknown as {
  prisma?: any;
  _currentDbUrl?: string;
};

function getSafeDatabaseUrl(): string {
  let url =
    process.env.DATABASE_URL ||
    'postgresql://postgres.zmpeiobdilrgtuzggzuj:mYSzT49KZbp8g0ZY@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';

  if (url.includes('pooler.supabase.com:5432')) {
    url = url.replace(':5432', ':6543');
  }
  if (url.includes('pooler.supabase.com:6543') && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
  }
  return url;
}

const safeUrl = getSafeDatabaseUrl();

if (!globalForPrisma.prisma || globalForPrisma._currentDbUrl !== safeUrl) {
  if (globalForPrisma.prisma?.$disconnect) {
    try {
      globalForPrisma.prisma.$disconnect();
    } catch {
      // ignore
    }
  }
  globalForPrisma.prisma = new PrismaClientConstructor({
    datasources: {
      db: {
        url: safeUrl,
      },
    },
  });
  globalForPrisma._currentDbUrl = safeUrl;
}

export const prisma = globalForPrisma.prisma;
