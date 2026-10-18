/**
 * Completes Command Center content in Supabase: site configs (navigation,
 * footer, pricing, seo, showreels), contact submissions, newsletter subscribers,
 * staff employees, pending talent (moderation queue), and media assets.
 * Idempotent. Run: node prisma/seed-command-center.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'superadmin@mpproduction.com' }, select: { id: true } });
  if (!admin) throw new Error('Seed the superadmin account first.');

  // ── Site configs (correct shapes the site-config page expects) ──
  const configs = {
    navigation: {
      logoUrl: '/logo.png', siteTitle: 'MP Productions', sticky: true,
      links: [
        { label: 'HOME', href: '/' }, { label: 'PORTFOLIO', href: '/portfolio' },
        { label: 'SERVICES', href: '/services' }, { label: 'TALENT', href: '/talent' },
        { label: 'PROJECTS', href: '/projects' }, { label: 'BLOG', href: '/blog' },
        { label: 'CONTACT', href: '/contact' },
      ],
      ctaText: 'Apply as Talent', ctaUrl: '/join/talent',
    },
    footer: {
      companyName: 'MP Production',
      tagline: 'Crafting Cinematic Excellence & Digital Legacies.',
      copyright: 'Powered By JCRM Technologies',
      contactEmail: 'hello@mpproduction.com',
      contactPhone: '+91 86373 73116',
      contactAddress: 'Mumbai, India',
      socialLinks: { instagram: 'https://instagram.com/mpproduction', linkedin: 'https://linkedin.com/company/mpproduction', youtube: 'https://youtube.com/mpproduction' },
      sections: [
        { title: 'Company', links: [ { label: 'About Us', href: '/about' }, { label: 'Services', href: '/services' }, { label: 'Meet the Team', href: '/team' }, { label: 'Careers', href: '/careers' }, { label: 'Blog', href: '/blog' } ] },
        { title: 'Network & Work', links: [ { label: 'Portfolio', href: '/portfolio' }, { label: 'Showreels', href: '/reel' }, { label: 'Talent Directory', href: '/talent/directory' }, { label: 'Join as Talent', href: '/join/talent' }, { label: 'Client Portal', href: '/client-portal' } ] },
        { title: 'Support', links: [ { label: 'Contact Us', href: '/contact' }, { label: 'FAQs', href: '/faq' }, { label: 'Privacy Policy', href: '/privacy' } ] },
      ],
    },
    pricing: [
      { name: 'Essential', price: '₹1.5L', features: ['Half-day shoot', '1 edit', 'Basic color grade', 'Licensed music'] },
      { name: 'Signature', price: '₹5L', features: ['Full-day shoot', '3 edits', 'Dolby Vision grade', 'Sound design'] },
      { name: 'Bespoke', price: 'Custom', features: ['Multi-day production', 'Unlimited edits', 'Full post suite', 'Dedicated producer'] },
    ],
    seo: {
      siteTitle: 'MP Production — Cinematic Media House',
      metaDescription: 'High-fashion campaigns, cinematic commercials and exclusive talent representation.',
      keywords: 'production house, cinematic, fashion film, talent, mumbai',
      ogImage: '/images/portfolio-hero.jpg',
    },
    showreels: [
      { id: 'sr-1', title: 'Commercial Reel 2026', category: 'Commercial', description: 'Our latest brand film work.', videoUrl: '/videos/reel_1.mp4', coverImage: '/images/portfolio-hero.jpg', duration: '2:14', camera: 'ARRI ALEXA 35', lenses: 'Cooke Anamorphic', colorGrade: 'Dolby Vision' },
      { id: 'sr-2', title: 'Fashion Reel', category: 'Fashion', description: 'Editorial and runway highlights.', videoUrl: '/videos/reel_2.mp4', coverImage: '/images/about-bts.jpg', duration: '1:48', camera: 'RED V-Raptor', lenses: 'Panavision C-Series', colorGrade: 'Technicolor' },
    ],
  };
  for (const [key, value] of Object.entries(configs)) {
    await prisma.systemConfig.upsert({ where: { key }, update: { value: JSON.stringify(value), type: 'json' }, create: { key, value: JSON.stringify(value), type: 'json' } });
  }
  console.log(`✅ Site configs: ${Object.keys(configs).length} (navigation, footer, pricing, seo, showreels)`);

  // ── Contact submissions ────────────────────────────────────
  const contacts = [
    { id: 'seed-ct-1', name: 'Priya Nair', email: 'priya@brandco.com', phone: '+91 90000 11111', subject: 'Campaign enquiry', message: 'We need a brand film for our Q3 launch.', isRead: false },
    { id: 'seed-ct-2', name: 'James Fox', email: 'james@lumelabs.com', phone: '+1 415 555 0102', subject: 'Documentary', message: 'Interested in a 10-min corporate documentary.', isRead: false },
    { id: 'seed-ct-3', name: 'Sara Khan', email: 'sara@atelier.in', phone: '+91 90000 22222', subject: 'Lookbook shoot', message: 'Editorial lookbook for a new fashion line.', isRead: true },
    { id: 'seed-ct-4', name: 'Dev Malhotra', email: 'dev@startuphq.io', phone: '+91 90000 33333', subject: 'Product reels', message: 'Need 6 reels per month for social.', isRead: false },
  ];
  for (const c of contacts) {
    await prisma.contactSubmission.upsert({ where: { id: c.id }, update: { ...c, deletedAt: null }, create: c });
  }
  console.log(`✅ Contact submissions: ${contacts.length}`);

  // ── Newsletter subscribers ──────────────────────────────────
  const emails = ['aisha@example.com', 'rohan@example.com', 'meera@example.com', 'karan@example.com', 'zoya@example.com'];
  for (const email of emails) {
    await prisma.newsletterSubscriber.upsert({ where: { email }, update: { isActive: true, deletedAt: null }, create: { email, isActive: true } });
  }
  console.log(`✅ Newsletter subscribers: ${emails.length}`);

  // ── Staff employees (User + Employee) ──────────────────────
  const passwordHash = await bcrypt.hash('Staff@123', 12);
  const staff = [
    { email: 'siddharth@mpproduction.com', firstName: 'Siddharth', lastName: 'Roy', designation: 'Senior Producer', department: 'Production' },
    { email: 'ananya@mpproduction.com', firstName: 'Ananya', lastName: 'Iyer', designation: 'Lead Casting Director', department: 'Talent & Casting' },
    { email: 'vikram@mpproduction.com', firstName: 'Vikramaditya', lastName: 'Bose', designation: 'Head of VFX & Color', department: 'Post-Production' },
    { email: 'neelam@mpproduction.com', firstName: 'Neelam', lastName: 'Verma', designation: 'Client Accounts Manager', department: 'Client Relations' },
  ];
  for (const s of staff) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { firstName: s.firstName, lastName: s.lastName, role: 'EMPLOYEE', isActive: true },
      create: { email: s.email, firstName: s.firstName, lastName: s.lastName, passwordHash, role: 'EMPLOYEE', isActive: true },
    });
    await prisma.employee.upsert({
      where: { userId: user.id },
      update: { designation: s.designation, department: s.department },
      create: { userId: user.id, designation: s.designation, department: s.department, joiningDate: new Date('2024-01-15') },
    });
  }
  console.log(`✅ Employees: ${staff.length}`);

  // ── Pending talent (moderation queue) ──────────────────────
  const pending = [
    { email: 'kavya.pending@talent.mp', firstName: 'Kavya', lastName: 'Nair', slug: 'kavya-nair-pending', stageName: 'Kavya Nair', city: 'Mumbai', experienceLevel: '3-5 Years' },
    { email: 'sameer.pending@talent.mp', firstName: 'Sameer', lastName: 'Khanna', slug: 'sameer-khanna-pending', stageName: 'Sameer Khanna', city: 'Delhi', experienceLevel: '1-3 Years' },
    { email: 'tara.pending@talent.mp', firstName: 'Tara', lastName: 'Sethi', slug: 'tara-sethi-pending', stageName: 'Tara Sethi', city: 'Bengaluru', experienceLevel: '5+ Years' },
  ];
  for (const p of pending) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { firstName: p.firstName, lastName: p.lastName, role: 'TALENT', isActive: true, city: p.city },
      create: { email: p.email, firstName: p.firstName, lastName: p.lastName, passwordHash, role: 'TALENT', isActive: true, city: p.city },
    });
    const existing = await prisma.talentProfile.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.talentProfile.update({ where: { slug: p.slug }, data: { status: 'PENDING_REVIEW', stageName: p.stageName, experienceLevel: p.experienceLevel } });
    } else {
      await prisma.talentProfile.create({ data: { userId: user.id, slug: p.slug, stageName: p.stageName, bio: 'Applicant awaiting review.', experienceLevel: p.experienceLevel, status: 'PENDING_REVIEW' } });
    }
  }
  console.log(`✅ Pending talent (moderation): ${pending.length}`);

  // ── Media assets (Media Library) ───────────────────────────
  const media = [
    { id: 'seed-md-1', url: '/images/portfolio-hero.jpg', originalName: 'portfolio-hero.jpg' },
    { id: 'seed-md-2', url: '/images/about-bts.jpg', originalName: 'about-bts.jpg' },
    { id: 'seed-md-3', url: '/images/careers-meeting.jpg', originalName: 'careers-meeting.jpg' },
    { id: 'seed-md-4', url: '/images/services-lighting.jpg', originalName: 'services-lighting.jpg' },
    { id: 'seed-md-5', url: '/images/bg-abstract.jpg', originalName: 'bg-abstract.jpg' },
    { id: 'seed-md-6', url: '/images/bg-luxury.jpg', originalName: 'bg-luxury.jpg' },
    { id: 'seed-md-7', url: '/assets/service_production.png', originalName: 'service_production.png' },
    { id: 'seed-md-8', url: '/assets/service_casting.png', originalName: 'service_casting.png' },
  ];
  for (const m of media) {
    await prisma.mediaAsset.upsert({
      where: { id: m.id },
      update: { url: m.url, originalName: m.originalName, filename: m.originalName },
      create: { id: m.id, url: m.url, originalName: m.originalName, filename: m.originalName, mimeType: m.url.endsWith('.png') ? 'image/png' : 'image/jpeg', size: 500000, uploadedById: admin.id },
    });
  }
  console.log(`✅ Media assets: ${media.length}`);

  console.log('\n🎉 Command Center content completed in Supabase.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
