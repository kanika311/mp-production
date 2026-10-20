// Bypass Turbopack Windows junction point creation on hoisted monorepo packages
const PrismaClientConstructor =
  typeof window === 'undefined'
    ? (eval("require('@prisma/client')").PrismaClient as any)
    : class {};

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientConstructor({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
