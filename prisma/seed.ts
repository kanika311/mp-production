import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Passwords come from the environment — never hardcode secrets in source.
  const requireEnv = (key: string): string => {
    const v = process.env[key];
    if (!v) throw new Error(`Missing required env var for seed: ${key}`);
    return v;
  };
  const superAdminHash = await bcrypt.hash(requireEnv('SUPER_ADMIN_PASSWORD'), 12);
  const adminHash = await bcrypt.hash(requireEnv('ADMIN_PASSWORD'), 12);
  const clientHash = await bcrypt.hash(requireEnv('CLIENT_PASSWORD'), 12);
  const talentHash = await bcrypt.hash(requireEnv('TALENT_PASSWORD'), 12);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@mpproduction.com' },
    update: {},
    create: {
      email: 'superadmin@mpproduction.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superAdminHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      employee: {
        create: {
          department: 'Management',
          designation: 'CEO',
        },
      },
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // 1b. Create Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mpproduction.com' },
    update: {},
    create: {
      email: 'admin@mpproduction.com',
      firstName: 'Studio',
      lastName: 'Admin',
      passwordHash: adminHash,
      role: Role.ADMIN,
      isActive: true,
      employee: {
        create: {
          department: 'Operations',
          designation: 'Studio Manager',
        },
      },
    },
  });
  console.log('✅ Admin created:', adminUser.email);

  // 1c. Create Client
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      firstName: 'Demo',
      lastName: 'Client',
      passwordHash: clientHash,
      role: Role.CLIENT,
      isActive: true,
      client: {
        create: {
          companyName: 'Acme Corp',
        },
      },
    },
  });
  console.log('✅ Client created:', clientUser.email);

  // 1d. Create Talent
  const talentUser = await prisma.user.upsert({
    where: { email: 'talent@example.com' },
    update: {},
    create: {
      email: 'talent@example.com',
      firstName: 'Demo',
      lastName: 'Talent',
      passwordHash: talentHash,
      role: Role.TALENT,
      isActive: true,
      talentProfile: {
        create: {
          slug: 'demo-talent',
          stageName: 'Demo Talent',
          bio: 'A demo talent profile for testing.',
        },
      },
    },
  });
  console.log('✅ Talent created:', talentUser.email);

  // 2. Create System Configs
  await prisma.systemConfig.upsert({
    where: { key: 'navigation' },
    update: {},
    create: {
      key: 'navigation',
      type: 'json',
      value: JSON.stringify([
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Talent', href: '/talent' },
        { label: 'Portfolio', href: '/portfolio' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' }
      ])
    }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'footer' },
    update: {},
    create: {
      key: 'footer',
      type: 'json',
      value: JSON.stringify({
        tagline: 'Crafting Cinematic Excellence & Digital Legacies.',
        copyright: 'Powered By JCRM Technologies',
        socialLinks: {
          instagram: 'https://instagram.com/mpproduction',
          linkedin: 'https://linkedin.com/company/mpproduction',
          youtube: 'https://youtube.com/mpproduction'
        }
      })
    }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: {
      key: 'maintenance_mode',
      type: 'boolean',
      value: 'false'
    }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'system_notifications' },
    update: {},
    create: {
      key: 'system_notifications',
      type: 'boolean',
      value: 'true'
    }
  });

  console.log('✅ System Configs seeded.');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
