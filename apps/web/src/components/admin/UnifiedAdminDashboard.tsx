'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  Layers,
  Newspaper,
  Video,
  Clapperboard,
  Mail,
  Home,
  FileText,
  Users,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Menu,
  RefreshCw,
  Bell,
  ExternalLink,
  LogOut,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Globe,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Loader2,
  Save,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fetchAPI } from '@/lib/api-client';
import { UserTable } from './UserTable';

export type TabKey =
  | 'dashboard'
  | 'talent'
  | 'services'
  | 'blogs'
  | 'become-a-youtuber'
  | 'projects'
  | 'contact-leads'
  | 'home-page'
  | 'footer-cms'
  | 'users'
  | 'sponsored';

export type PageMode = 'list' | 'edit' | 'view' | 'create';

interface TabItem {
  id: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Key Performance Indicators' },
  { id: 'talent', label: 'Talent', icon: UserCheck, description: 'Actors, Models, Creators & Roster Management' },
  { id: 'services', label: 'Services', icon: Layers, description: 'Production Offerings & Pricing Packages' },
  { id: 'blogs', label: 'Blogs', icon: Newspaper, description: 'Articles, News & Editorial Journal' },
  { id: 'become-a-youtuber', label: 'Become a YouTuber', icon: Video, description: 'Creator Courses, Monetization & Submissions' },
  { id: 'projects', label: 'Projects', icon: Clapperboard, description: 'Cinematic Portfolio & Works Archive' },
  { id: 'contact-leads', label: 'Contact Leads', icon: Mail, description: 'Client Inquiries, Bookings & Messages' },
  { id: 'home-page', label: 'Home Page', icon: Home, description: 'Hero Banners, Announcements & Featured Sections' },
  { id: 'footer-cms', label: 'Footer CMS', icon: FileText, description: 'Footer Details, Social Links & Copyright' },
  { id: 'users', label: 'Users', icon: Users, description: 'User Accounts, Roles & Security Access' },
  { id: 'sponsored', label: 'Sponsored', icon: Sparkles, description: 'Sidebar Partner Brands & Ads' },
];

export function UnifiedAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [tabSearch, setTabSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Dedicated Page Modes: 'list' | 'edit' | 'view' | 'create' (NO cramped modal for edit/view)
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Notification Drawer State & Items
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'leads'>('all');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'lead' | 'booking' | 'system' | 'cms';
    time: string;
    isRead: boolean;
    linkTab?: TabKey;
    linkId?: string;
  }>>([
    {
      id: 'notif-1',
      title: 'New Commercial Music Video Lead',
      message: 'Simran Walia submitted an inquiry for music video shoot kit with ARRI package. Budget: ₹3,50,000.',
      type: 'lead',
      time: '12m ago',
      isRead: false,
      linkTab: 'contact-leads',
      linkId: 'led-1',
    },
    {
      id: 'notif-2',
      title: 'Talent Roster Booking Inquiry',
      message: 'Ananya Verma requested 2 editorial models for Myntra e-commerce campaign shoot. Budget: ₹80,000.',
      type: 'booking',
      time: '45m ago',
      isRead: false,
      linkTab: 'contact-leads',
      linkId: 'led-2',
    },
    {
      id: 'notif-3',
      title: 'Corporate Documentary Inquiry',
      message: 'Kunal Kapoor submitted inquiry for annual leadership documentary film with drone coverage. Budget: ₹5,00,000.',
      type: 'lead',
      time: '2h ago',
      isRead: false,
      linkTab: 'contact-leads',
      linkId: 'led-3',
    },
    {
      id: 'notif-4',
      title: 'Healthcare Editorial Series',
      message: 'Dr. Radhika Sen inquired for interview series with 6 senior surgeons. Budget: ₹1,20,000.',
      type: 'lead',
      time: '5h ago',
      isRead: false,
      linkTab: 'contact-leads',
      linkId: 'led-4',
    },
  ]);

  // In-browser WebP conversion & Upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageStats, setImageStats] = useState<{
    originalSize: number;
    webpSize: number;
    percentSaved: number;
    format: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Footer CMS Dedicated Configuration & Quick Links State
  // ─────────────────────────────────────────────────────────────
  const [footerConfig, setFooterConfig] = useState<{
    tagline: string;
    brandDescription: string;
    newsletterTitle: string;
    newsletterDesc: string;
    newsletterPlaceholder: string;
    copyrightText: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialLinks: {
      instagram: string;
      youtube: string;
      linkedin: string;
      twitter: string;
      facebook: string;
    };
    quickLinks: Array<{ id: string; label: string; href: string; group?: string }>;
  }>({
    tagline: 'Crafting Cinematic Excellence & Digital Legacies.',
    brandDescription: 'MP Production is an exclusive luxury creative production house for global brands and artists. Building timeless cinema, photography, and campaigns frame by frame.',
    newsletterTitle: 'Subscribe to Our Newsletter',
    newsletterDesc: 'Receive weekly cinematic production insights, case studies & invitations',
    newsletterPlaceholder: 'Enter your email address...',
    copyrightText: '© 2026 MP Production Atelier Ltd. All rights reserved. Powered By JCRM Technologies',
    contactEmail: 'hello@mpproduction.com',
    contactPhone: '+91 831 053 1309',
    contactAddress: 'Studio 4, Film City Complex, Goregaon East, Mumbai 400065',
    socialLinks: {
      instagram: 'https://instagram.com/mpproduction',
      youtube: 'https://youtube.com/mpproduction',
      linkedin: 'https://linkedin.com/company/mpproduction',
      twitter: 'https://twitter.com/mpproduction',
      facebook: 'https://facebook.com/mpproduction',
    },
    quickLinks: [
      { id: 'ql-1', label: 'About Us', href: '/about', group: 'Company' },
      { id: 'ql-2', label: 'Services', href: '/services', group: 'Company' },
      { id: 'ql-3', label: 'Portfolio', href: '/projects', group: 'Network & Work' },
      { id: 'ql-4', label: 'Talent Directory', href: '/talent', group: 'Network & Work' },
      { id: 'ql-5', label: 'Contact Us', href: '/contact', group: 'Support & Legal' },
      { id: 'ql-6', label: 'Privacy Policy', href: '/privacy', group: 'Support & Legal' },
    ],
  });

  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [newQuickLink, setNewQuickLink] = useState({ label: '', href: '', group: 'Company' });
  const [isAddingQuickLink, setIsAddingQuickLink] = useState(false);
  const [editingQuickLinkId, setEditingQuickLinkId] = useState<string | null>(null);
  const [editQuickLinkData, setEditQuickLinkData] = useState({ label: '', href: '', group: 'Company' });

  // ─────────────────────────────────────────────────────────────
  // Home Page CMS Dedicated Configuration & FAQs State
  // ─────────────────────────────────────────────────────────────
  const [homePageConfig, setHomePageConfig] = useState<{
    announcement: {
      enabled: boolean;
      text: string;
      badge: string;
      link: string;
    };
    hero: {
      eyebrow: string;
      heading: string;
      subheading: string;
      mediaType: 'video' | 'image';
      videoUrl: string;
      posterUrl: string;
      ctaText: string;
      ctaUrl: string;
      secondaryCtaText: string;
      secondaryCtaUrl: string;
    };
    stats: Array<{ n: number; s: string; label: string }>;
    showcase: {
      title: string;
      subtitle: string;
      badge: string;
    };
    faqs: Array<{ id: string; question: string; answer: string; category?: string }>;
  }>({
    announcement: {
      enabled: true,
      text: 'Autumn/Winter 2026 Production Slots Open — Limited commercial dates remaining.',
      badge: 'NOW BOOKING',
      link: '/contact',
    },
    hero: {
      eyebrow: 'Cinematic Studio · Est. 2018',
      heading: 'Stories built\nframe by frame.',
      subheading: 'MP Production is a full-service creative house — high-fashion campaigns, cinematic commercials, and exclusive talent representation.',
      mediaType: 'video',
      videoUrl: 'https://res.cloudinary.com/dd29usied/video/upload/v1785067564/banners/apy8yqvmj3nbdq4gvikp.mp4',
      posterUrl: '/assets/hero_cinematic_dark.webp',
      ctaText: 'Explore Portfolio',
      ctaUrl: '/projects',
      secondaryCtaText: 'Become a YouTuber',
      secondaryCtaUrl: '/become-a-youtuber',
    },
    stats: [
      { n: 500, s: '+', label: 'Productions Delivered' },
      { n: 1200, s: '+', label: 'Talent Roster' },
      { n: 40, s: '+', label: 'Brand Partners' },
      { n: 18, s: 'M+', label: 'Audience Reach' },
    ],
    showcase: {
      title: 'Master Cinematic Camera Fleet',
      subtitle: 'ARRI Alexa 35 & RED V-Raptor 8K systems paired with Cooke and Leica anamorphic primes.',
      badge: '8K RAW · Anamorphic 2.0x · 120 FPS',
    },
    faqs: [
      {
        id: 'faq-1',
        question: 'What is your typical project timeline?',
        answer: 'Production timelines vary based on scope. Commercial spots typically take 2-4 weeks from pre-production to final grade, while full campaign packages take 4-8 weeks.',
        category: 'Production',
      },
      {
        id: 'faq-2',
        question: 'How do you handle talent bookings and contracts?',
        answer: 'Our client portal allows seamless browsing and booking of talent with automated NDA generation and escrow payment protections.',
        category: 'Talent & Booking',
      },
      {
        id: 'faq-3',
        question: 'What camera packages and equipment do you use?',
        answer: 'We shoot primarily on ARRI Alexa 35 and RED V-Raptor 8K systems paired with Cooke and Leica anamorphic prime lenses.',
        category: 'Equipment',
      },
      {
        id: 'faq-4',
        question: 'Can we hire your team for international shoots?',
        answer: 'Yes, our team holds active carnet permits and international passports for rapid deployment anywhere across Europe, Asia, and North America.',
        category: 'General',
      },
    ],
  });

  const [isSavingHomePage, setIsSavingHomePage] = useState(false);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editFaqData, setEditFaqData] = useState({ question: '', answer: '', category: 'General' });
  const heroFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const heroVideoFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Force pure light White & Red theme so system dark mode does NOT tint the dashboard
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Datasets with full CRUD capability
  // ─────────────────────────────────────────────────────────────

  // 1. Talents
  const [talents, setTalents] = useState<any[]>([
    { id: 'tal-1', name: 'Kanika Aggarwal', category: 'Model', experience: '3-5 Years', rate: '₹15,000 / Day', location: 'Mumbai', shortDesc: 'High-fashion editorial and runway model with commercial campaign experience.', imageUrl: '/assets/talent-model-1.webp', isActive: true },
    { id: 'tal-2', name: 'Aarav Sharma', category: 'Actor', experience: '5+ Years', rate: '₹25,000 / Day', location: 'Delhi', shortDesc: 'Method actor trained in theatre, featured in regional cinema and brand ads.', imageUrl: '/assets/talent-model-2.webp', isActive: true },
    { id: 'tal-3', name: 'Riya Sen', category: 'Reeler', experience: '1-3 Years', rate: '₹12,000 / Day', location: 'Bengaluru', shortDesc: 'Viral lifestyle and beauty content creator with 450K+ engaged followers.', imageUrl: '/assets/talent-model-1.webp', isActive: true },
    { id: 'tal-4', name: 'Devendra Joshi', category: 'YouTuber', experience: '5+ Years', rate: '₹40,000 / Day', location: 'Mumbai', shortDesc: 'Tech & cinematography reviewer hosting weekly studio breakdowns.', imageUrl: '/assets/talent-model-2.webp', isActive: false },
    { id: 'tal-5', name: 'Pooja Hegde', category: 'Fashion Editorial', experience: '3-5 Years', rate: '₹35,000 / Day', location: 'Goa', shortDesc: 'Couture stylist and high-end commercial campaign talent.', imageUrl: '/assets/talent-model-1.webp', isActive: true },
  ]);

  // 2. Services (with real WebP images matching the live site)
  const [services, setServices] = useState<any[]>([
    { id: 'srv-1', name: 'Commercial Film Production', category: 'Video', price: '₹2,50,000', shortDesc: 'End-to-end 8K cinematic brand commercials with anamorphic lenses.', imageUrl: '/assets/service_production.webp', isActive: true },
    { id: 'srv-2', name: 'Haute Couture Editorial Shoot', category: 'Photography', price: '₹1,20,000', shortDesc: 'High-fashion editorial spread with studio lighting & art direction.', imageUrl: '/assets/fashion_lookbook.webp', isActive: true },
    { id: 'srv-3', name: 'Music Video Production', category: 'Video', price: '₹3,50,000', shortDesc: 'Stylized music videos with narrative staging & color grading.', imageUrl: '/assets/project-music.webp', isActive: true },
    { id: 'srv-4', name: 'Dolby Vision Color Grading', category: 'Post-Production', price: '₹75,000', shortDesc: 'Master finishing on calibrated Dolby Vision OLED monitors.', imageUrl: '/assets/service_post_production.webp', isActive: true },
    { id: 'srv-5', name: 'Virtual Production Volume Stage', category: 'VFX', price: '₹4,00,000', shortDesc: 'Real-time LED volume backdrop rendering with Unreal Engine.', imageUrl: '/assets/abstract_studio.webp', isActive: false },
  ]);

  // 3. Blogs
  const [blogs, setBlogs] = useState<any[]>([
    { id: 'blg-1', title: 'The Evolution of Virtual Production in 2026', category: 'Technology', author: 'Super Admin', date: '9 Oct 2026', readTime: '3 min read', shortDesc: 'Exploring how LED volume studios and real-time Unreal Engine 5 workflows are cutting post-production timelines by 60%.', isActive: true },
    { id: 'blg-2', title: 'Anamorphic Glass & The Aesthetic of Modern Luxury Commercials', category: 'Cinematography', author: 'Chief Cinematographer', date: '28 Sep 2026', readTime: '4 min read', shortDesc: 'Why modern commercial directors continue to choose vintage Cooke and Atlas Orion anamorphic glass over ultra-sharp spherical lenses.', isActive: true },
    { id: 'blg-3', title: 'The Psychology of Sound Design in Cinema Advertising', category: 'Sound Design', author: 'Lead Sound Engineer', date: '30 Aug 2026', readTime: '4 min read', shortDesc: 'How sub-bass transitions and spatial Foley mixing elevate brand recall in luxury commercial spots.', isActive: true },
    { id: 'blg-4', title: 'Casting for High-Fashion Runway & Cinema Sets', category: 'Casting', author: 'Casting Director', date: '15 Aug 2026', readTime: '5 min read', shortDesc: 'Insights into selecting talent that balances screen presence with contemporary runway aesthetics.', isActive: false },
  ]);

  // 4. Become a YouTuber
  const [youtubers, setYoutubers] = useState<any[]>([
    { id: 'yt-1', title: 'YouTube Mastery 2026: 0 to 100k Subscribers', category: 'YouTuber', price: '₹4,999', level: 'Beginner', duration: '6 Weeks', enrolled: 412, shortDesc: 'Step-by-step masterclass covering channel architecture, CTR packaging, and YouTube search algorithms.', isActive: true },
    { id: 'yt-2', title: 'Viral Reels & Short-Form Video Storytelling', category: 'Reeler', price: '₹2,999', level: 'Creator', duration: '3 Weeks', enrolled: 890, shortDesc: 'High-retention editing techniques, hook frameworks, and trending sound design for Instagram and YouTube Shorts.', isActive: true },
    { id: 'yt-3', title: 'High-Ticket Brand Sponsorships & Monetization', category: 'Influencer', price: '₹6,499', level: 'Pro Master', duration: '4 Weeks', enrolled: 230, shortDesc: 'Pitch deck frameworks, commercial rate calculation, and outbound brand outreach contracts.', isActive: true },
    { id: 'yt-4', title: 'Cinematic Video Editing with Premiere & DaVinci', category: 'Editing', price: '₹3,499', level: 'Creator', duration: '5 Weeks', enrolled: 570, shortDesc: 'Color grading, rhythm cutting, and sound mixing inside industry-standard NLE workflows.', isActive: false },
  ]);

  // 5. Projects
  const [projects, setProjects] = useState<any[]>([
    { id: 'prj-1', title: 'Neon Silk · The Metamorphosis', category: 'Fashion Film', year: '2026', client: 'Vogue & Gucci Collective', camera: 'ARRI ALEXA 35', shortDesc: 'A haute couture visual poem shot on location in Jaipur and studio sets in Mumbai.', isActive: true },
    { id: 'prj-2', title: 'Midnight Anthem · VOLT Music', category: 'Music Video', year: '2026', client: 'Universal Music Group', camera: 'ARRIFLEX 435', shortDesc: '35mm anamorphic music video featuring choreographed neon dance sequences.', isActive: true },
    { id: 'prj-3', title: "Curinel's Reserve · Timeless Heritage", category: 'Commercial', year: '2025', client: 'The Macallan Distillers', camera: 'RED V-Raptor 8K', shortDesc: 'High-speed robotic arm product cinematography showcasing amber liquid physics.', isActive: true },
    { id: 'prj-4', title: 'Skyline Suits · Executive Mastery', category: 'Brand Campaign', year: '2025', client: 'Raymond Tailored', camera: 'ARRI ALEXA Mini LF', shortDesc: 'Commercial campaign celebrating bespoke suiting and modern executive craftsmanship.', isActive: true },
    { id: 'prj-5', title: 'Echoes of Silence · Contemporary Ballet', category: 'Art & Theatre', year: '2026', client: 'Royal Opera House', camera: 'Sony Venice 2', shortDesc: 'Single-take performance film capturing physical theatre and dynamic chiaroscuro lighting.', isActive: true },
    { id: 'prj-6', title: 'Solstice · The Electric Odyssey', category: 'Commercial', year: '2025', client: 'Porsche Motorsport', camera: 'RED Komodo 6K', shortDesc: 'Tracking vehicle cinematography with gyro-stabilized arm at Buddh International Circuit.', isActive: false },
  ]);

  // 6. Contact Leads
  const [leads, setLeads] = useState<any[]>([
    { id: 'led-1', name: 'Simran Walia', email: 'simran.mgmt@sony.com', phone: '+91 98201 44321', projectType: 'Music Video', budget: '₹3,50,000', message: 'Inquiring for a single track music video shoot next month. Need full crew + ARRI kit.', date: '18 Oct 2026', isActive: true },
    { id: 'led-2', name: 'Ananya Verma', email: 'ananya@myntra.com', phone: '+91 99300 12890', projectType: 'Talent Booking', budget: '₹80,000', message: 'Want to book 2 models from talent roster for e-commerce shoot.', date: '16 Oct 2026', isActive: true },
    { id: 'led-3', name: 'Kunal Kapoor', email: 'kunal@tata.com', phone: '+91 91672 88410', projectType: 'Corporate Film', budget: '₹5,00,000', message: 'Annual corporate leadership documentary film with multi-city drone coverage.', date: '14 Oct 2026', isActive: true },
    { id: 'led-4', name: 'Dr. Radhika Sen', email: 'radhika@fortis.com', phone: '+91 98450 77123', projectType: 'Editorial Video', budget: '₹1,20,000', message: 'Interview series with 6 senior surgeons for wellness launch campaign.', date: '12 Oct 2026', isActive: false },
    { id: 'led-5', name: 'Vikramaditya Roy', email: 'vikram@dharma.com', phone: '+91 98110 55432', projectType: 'Commercial Campaign', budget: '₹8,50,000', message: '3-day brand commercial with celebrity cast in Goa.', date: '10 Oct 2026', isActive: true },
  ]);

  // 7. Home Page Items
  const [homeItems, setHomeItems] = useState<any[]>([
    { id: 'hm-1', title: 'Autumn/Winter 2026 Production Slots Open', type: 'Announcement Banner', text: 'Limited commercial production slots open for Q4. Book discovery call.', link: '/contact', isActive: true },
    { id: 'hm-2', title: 'Hero Headline: Cinematic Mastery & Digital Media', type: 'Hero Main', text: 'Crafting unforgettable films, digital campaigns, and roster casting.', link: '/projects', isActive: true },
    { id: 'hm-3', title: 'Featured Showcase: 8K RAW Cinema Cameras', type: 'Highlight Strip', text: 'ARRI Alexa 35 & RED Raptor camera packages available.', link: '/services', isActive: true },
    { id: 'hm-4', title: 'Diwali Festive Discount Banner', type: 'Announcement Banner', text: '15% early bird booking discount for festival campaigns.', link: '/pricing', isActive: false },
  ]);

  // 8. Footer CMS
  const [footerItems, setFooterItems] = useState<any[]>([
    { id: 'ft-1', section: 'Company Description', key: 'bio', value: 'MP Production is India premier cinematic production house and digital talent roster agency.', isActive: true },
    { id: 'ft-2', section: 'Headquarters Address', key: 'address', value: 'Studio 4, Film City Complex, Goregaon East, Mumbai 400065', isActive: true },
    { id: 'ft-3', section: 'Official Phone', key: 'phone', value: '+91 (22) 4890-2200', isActive: true },
    { id: 'ft-4', section: 'Official Email', key: 'email', value: 'productions@mpproduction.com', isActive: true },
    { id: 'ft-5', section: 'Social Handle: Instagram', key: 'instagram', value: 'https://instagram.com/mpproduction', isActive: true },
    { id: 'ft-6', section: 'Copyright Notice', key: 'copyright', value: '© 2026 MP Production Atelier Ltd. All rights reserved.', isActive: true },
  ]);

  // 9. Users
  const [usersList, setUsersList] = useState<any[]>([
    { id: 'usr-1', name: 'Sushant Super Admin', email: 'admin@mpproduction.com', role: 'SUPER_ADMIN', joinedDate: 'Jan 2025', isActive: true },
    { id: 'usr-2', name: 'Kabir Nair', email: 'kabir@mpproduction.com', role: 'ADMIN', joinedDate: 'Mar 2025', isActive: true },
    { id: 'usr-3', name: 'Aarav Mehta', email: 'aarav.dop@mpproduction.com', role: 'EDITOR', joinedDate: 'Jun 2025', isActive: true },
    { id: 'usr-4', name: 'Kanika Aggarwal', email: 'kanika.talent@gmail.com', role: 'TALENT', joinedDate: 'Aug 2025', isActive: true },
    { id: 'usr-5', name: 'Lakme Global Team', email: 'marketing@lakme.com', role: 'CLIENT', joinedDate: 'Sep 2025', isActive: true },
    { id: 'usr-6', name: 'Neha Saxena', email: 'neha.temp@agency.com', role: 'EMPLOYEE', joinedDate: 'Oct 2025', isActive: false },
  ]);

  // 10. Sponsored Brands
  const [sponsoredList, setSponsoredList] = useState<any[]>([
    { id: 'spn-1', brand: 'RED Digital Cinema', tagline: 'Official Camera & Sensor Sponsor', deal: 'Up to 15% VIP discount on V-Raptor packages', url: 'https://red.com', isActive: true },
    { id: 'spn-2', brand: 'DaVinci Resolve Studio', tagline: 'Master Color Grading Partner', deal: 'Complimentary Studio Dongle with Suite Hire', url: 'https://blackmagicdesign.com', isActive: true },
    { id: 'spn-3', brand: 'ARRI Rental India', tagline: 'Optics & Lighting Fleet Partner', deal: 'Signature Prime lens reservation priority', url: 'https://arri.com', isActive: true },
    { id: 'spn-4', brand: 'Nanlite India', tagline: 'Continuous Cinema Lighting Partner', deal: 'Forza 720B kit inclusions for student lab', url: 'https://nanlite.com', isActive: false },
  ]);

  // Helper to fetch list by tab key
  const getItemListByTab = (tab: TabKey): any[] => {
    switch (tab) {
      case 'talent': return talents;
      case 'services': return services;
      case 'blogs': return blogs;
      case 'become-a-youtuber': return youtubers;
      case 'projects': return projects;
      case 'contact-leads': return leads;
      case 'home-page': return homePageConfig.faqs;
      case 'footer-cms': return footerConfig.quickLinks;
      case 'users': return usersList;
      case 'sponsored': return sponsoredList;
      default: return [];
    }
  };

  // Dynamic Badge Count (Always 100% in sync with actual items count!)
  const getTabCount = (tabId: TabKey): number => {
    if (tabId === 'footer-cms') return footerConfig.quickLinks.length;
    if (tabId === 'home-page') return homePageConfig.faqs.length;
    return getItemListByTab(tabId).length;
  };

  // ─────────────────────────────────────────────────────────────
  // URL & Page State Sync (Browser Back/Forward + Direct Links)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUrlSync = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabKey;
      const modeParam = params.get('mode') as PageMode;
      const idParam = params.get('id');

      if (tabParam && TABS.some((t) => t.id === tabParam)) {
        setActiveTab(tabParam);
      }

      if (modeParam && ['edit', 'view', 'create'].includes(modeParam)) {
        setPageMode(modeParam);
        if (idParam) {
          const list = getItemListByTab(tabParam || activeTab);
          const found = list.find((i: any) => String(i.id) === String(idParam));
          if (found) {
            setSelectedItem(found);
            setFormData({ ...found });
          }
        }
      } else {
        setPageMode('list');
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, [talents, services, blogs, youtubers, projects, leads, homeItems, footerItems, usersList, sponsoredList]);

  // Page Transition Handlers (No cramped modals!)
  const openViewPage = (item: any) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setImageStats(null);
    setPageMode('view');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      url.searchParams.set('mode', 'view');
      url.searchParams.set('id', item.id);
      window.history.pushState(null, '', url.toString());
    }
  };

  const openEditPage = (item: any) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setImageStats(null);
    setPageMode('edit');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      url.searchParams.set('mode', 'edit');
      url.searchParams.set('id', item.id);
      window.history.pushState(null, '', url.toString());
    }
  };

  const openCreatePage = () => {
    setSelectedItem(null);
    setFormData({ isActive: true });
    setImageStats(null);
    setPageMode('create');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      url.searchParams.set('mode', 'create');
      url.searchParams.delete('id');
      window.history.pushState(null, '', url.toString());
    }
  };

  const returnToListPage = () => {
    setPageMode('list');
    setSelectedItem(null);
    setFormData({});
    setImageStats(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      url.searchParams.delete('mode');
      url.searchParams.delete('id');
      window.history.pushState(null, '', url.toString());
    }
  };

  // ─────────────────────────────────────────────────────────────
  // In-Browser WebP Converter & Upload Handler
  // ─────────────────────────────────────────────────────────────
  const convertImageToWebP = (
    file: File,
    quality = 0.88
  ): Promise<{ webpFile: File; dataUrl: string; originalSize: number; webpSize: number }> => {
    return new Promise((resolve, reject) => {
      const originalSize = file.size;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context not available'));
            return;
          }
          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL('image/webp', quality);
          canvas.toBlob(
            (blob) => {
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const webpFileName = `${baseName.replace(/[^a-zA-Z0-9_-]/g, '_')}.webp`;

              if (!blob) {
                // Fallback to dataUrl conversion if toBlob is unsupported
                const byteString = atob(dataUrl.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                const fallbackBlob = new Blob([ab], { type: 'image/webp' });
                const webpFile = new File([fallbackBlob], webpFileName, { type: 'image/webp' });
                resolve({
                  webpFile,
                  dataUrl,
                  originalSize,
                  webpSize: fallbackBlob.size,
                });
                return;
              }

              const webpFile = new File([blob], webpFileName, { type: 'image/webp' });
              resolve({
                webpFile,
                dataUrl,
                originalSize,
                webpSize: blob.size,
              });
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for WebP conversion'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // 1. Convert any image to WebP right in the browser
      const { webpFile, dataUrl, originalSize, webpSize } = await convertImageToWebP(file);
      const percentSaved = Math.max(0, Math.round(((originalSize - webpSize) / originalSize) * 100));
      setImageStats({
        originalSize,
        webpSize,
        percentSaved,
        format: 'image/webp',
      });

      // 2. Upload WebP file to /api/cms/media
      const fd = new FormData();
      fd.append('file', webpFile);

      let savedUrl = dataUrl;
      try {
        const res = await fetch('/api/cms/media', {
          method: 'POST',
          body: fd,
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data?.url) {
          savedUrl = json.data.url;
        }
      } catch (uploadErr) {
        // Fall back to dataUrl
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl: savedUrl,
        img: savedUrl,
        coverImage: savedUrl,
      }));

      toast.success(
        `WebP converted! ${(webpSize / 1024).toFixed(1)} KB (Saved ${percentSaved}%)`
      );
    } catch (err: any) {
      toast.error(err.message || 'Image conversion failed');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Live Fetch & Sync from API
  // ─────────────────────────────────────────────────────────────
  const fetchLiveData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Projects
      const projRes = await fetchAPI('/cms/portfolio', { cache: 'no-store' }).catch(() => null);
      if (projRes?.data && Array.isArray(projRes.data) && projRes.data.length > 0) {
        setProjects(
          projRes.data.map((item: any) => ({
            id: item.id || `prj-${Math.random()}`,
            title: item.title || 'Untitled Project',
            category: item.category || 'Commercial',
            year: item.year || '2026',
            client: item.client || 'MP Production',
            camera: item.camera || 'ARRI ALEXA',
            imageUrl: item.coverImage || item.imageUrl || (Array.isArray(item.images) ? item.images[0] : '') || '',
            shortDesc: item.description || '',
            isActive: item.isPublished !== false,
          }))
        );
      }

      // 2. Blogs
      const blogRes = await fetchAPI('/cms/blog', { cache: 'no-store' }).catch(() => null);
      if (blogRes?.data && Array.isArray(blogRes.data) && blogRes.data.length > 0) {
        setBlogs(
          blogRes.data.map((item: any) => ({
            id: item.id || item.slug,
            title: item.title,
            category: item.category || 'Editorial',
            author: item.author || 'MP Production',
            date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB') : 'Recently',
            readTime: item.readTime || '4 min read',
            imageUrl: item.coverImage || item.imageUrl || '',
            shortDesc: item.excerpt || '',
            isActive: item.status === 'PUBLISHED',
          }))
        );
      }

      // 3. Services (with full imageUrl support)
      const srvRes = await fetchAPI('/cms/services', { cache: 'no-store' }).catch(() => null);
      if (srvRes?.data && Array.isArray(srvRes.data) && srvRes.data.length > 0) {
        setServices(
          srvRes.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category || 'Production',
            price: `₹${((item.basePrice || 150000) / 100).toLocaleString('en-IN')}`,
            shortDesc: item.shortDesc || item.description || '',
            imageUrl: item.imageUrl || item.img || item.coverImage || '',
            isActive: item.isActive !== false,
          }))
        );
      }

      // 4. Sponsored
      const spnRes = await fetchAPI('/cms/config/sponsored', { cache: 'no-store' }).catch(() => null);
      if (spnRes?.data?.items && Array.isArray(spnRes.data.items)) {
        setSponsoredList(
          spnRes.data.items.map((item: any, i: number) => ({
            id: `spn-live-${i}`,
            brand: item.brand,
            tagline: item.tagline,
            deal: item.deal,
            url: item.url,
            imageUrl: item.imageUrl || item.img || '',
            isActive: item.active !== false,
          }))
        );
      }

      // 5. Footer Configuration & Quick Links
      const footerRes = await fetchAPI('/cms/config/footer', { cache: 'no-store' }).catch(() => null);
      if (footerRes?.data) {
        const val = typeof footerRes.data === 'string'
          ? (() => { try { return JSON.parse(footerRes.data); } catch { return null; } })()
          : footerRes.data?.value
            ? (typeof footerRes.data.value === 'string' ? (() => { try { return JSON.parse(footerRes.data.value); } catch { return null; } })() : footerRes.data.value)
            : footerRes.data;
        if (val) {
          setFooterConfig((prev) => ({
            ...prev,
            tagline: val.tagline || prev.tagline,
            brandDescription: val.brandDescription || val.description || prev.brandDescription,
            newsletterTitle: val.newsletterTitle || prev.newsletterTitle,
            newsletterDesc: val.newsletterDesc || prev.newsletterDesc,
            newsletterPlaceholder: val.newsletterPlaceholder || prev.newsletterPlaceholder,
            copyrightText: val.copyrightText || val.copyright || prev.copyrightText,
            contactEmail: val.contactEmail || prev.contactEmail,
            contactPhone: val.contactPhone || prev.contactPhone,
            contactAddress: val.contactAddress || prev.contactAddress,
            socialLinks: { ...prev.socialLinks, ...(val.socialLinks || {}) },
            quickLinks: Array.isArray(val.quickLinks) && val.quickLinks.length > 0 ? val.quickLinks : prev.quickLinks,
          }));
        }
      }

      // 6. Home Page Configuration & FAQs
      const homeRes = await fetchAPI('/cms/config/home-page', { cache: 'no-store' }).catch(() => null);
      if (homeRes?.data) {
        const val = typeof homeRes.data === 'string'
          ? (() => { try { return JSON.parse(homeRes.data); } catch { return null; } })()
          : homeRes.data?.value
            ? (typeof homeRes.data.value === 'string' ? (() => { try { return JSON.parse(homeRes.data.value); } catch { return null; } })() : homeRes.data.value)
            : homeRes.data;
        if (val) {
          setHomePageConfig((prev) => ({
            ...prev,
            announcement: { ...prev.announcement, ...(val.announcement || {}) },
            hero: { ...prev.hero, ...(val.hero || {}) },
            stats: Array.isArray(val.stats) && val.stats.length > 0 ? val.stats : prev.stats,
            showcase: { ...prev.showcase, ...(val.showcase || {}) },
            faqs: Array.isArray(val.faqs) && val.faqs.length > 0 ? val.faqs : prev.faqs,
          }));
        }
      }

      toast.success('Live CMS datasets synced successfully.');
    } catch (err) {
      toast.error('Failed to sync live data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Footer CMS Save & Quick Link Handlers
  // ─────────────────────────────────────────────────────────────
  const handleSaveFooter = async () => {
    setIsSavingFooter(true);
    try {
      const payload = {
        ...footerConfig,
        sections: [
          {
            title: 'Company',
            links: footerConfig.quickLinks.filter((l) => (l.group || '').toLowerCase().includes('company')),
          },
          {
            title: 'Network & Work',
            links: footerConfig.quickLinks.filter((l) => (l.group || '').toLowerCase().includes('network') || (l.group || '').toLowerCase().includes('work')),
          },
          {
            title: 'Support & Legal',
            links: footerConfig.quickLinks.filter((l) => (l.group || '').toLowerCase().includes('support') || (l.group || '').toLowerCase().includes('legal')),
          },
        ].filter((s) => s.links.length > 0),
      };

      if (!payload.sections.length && footerConfig.quickLinks.length > 0) {
        payload.sections = [{ title: 'Quick Links', links: footerConfig.quickLinks }];
      }

      // 1. Post to local Next.js BFF endpoint first
      try {
        await fetch('/api/cms/config/footer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: payload }),
        });
      } catch (e) {}

      // 2. Sync to backend
      fetchAPI('/cms/config/footer', {
        method: 'POST',
        body: JSON.stringify({ value: payload }),
      }).catch(() => null);

      if (typeof window !== 'undefined') {
        localStorage.setItem('mp_footer_config', JSON.stringify(payload));
      }

      toast.success('Footer CMS settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save footer settings');
    } finally {
      setIsSavingFooter(false);
    }
  };

  const handleAddQuickLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickLink.label.trim() || !newQuickLink.href.trim()) {
      toast.error('Please enter both Link Label and URL.');
      return;
    }
    const newId = `ql-${Date.now()}`;
    setFooterConfig((prev) => ({
      ...prev,
      quickLinks: [
        ...prev.quickLinks,
        { id: newId, label: newQuickLink.label.trim(), href: newQuickLink.href.trim(), group: newQuickLink.group || 'Company' },
      ],
    }));
    setNewQuickLink({ label: '', href: '', group: 'Company' });
    setIsAddingQuickLink(false);
    toast.success('Quick link added.');
  };

  const handleDeleteQuickLink = (id: string) => {
    setFooterConfig((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((l) => l.id !== id),
    }));
    toast.success('Quick link removed.');
  };

  const handleStartEditQuickLink = (link: { id: string; label: string; href: string; group?: string }) => {
    setEditingQuickLinkId(link.id);
    setEditQuickLinkData({ label: link.label, href: link.href, group: link.group || 'Company' });
  };

  const handleSaveEditQuickLink = (id: string) => {
    if (!editQuickLinkData.label.trim() || !editQuickLinkData.href.trim()) {
      toast.error('Label and URL cannot be empty.');
      return;
    }
    setFooterConfig((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.map((l) =>
        l.id === id ? { ...l, label: editQuickLinkData.label.trim(), href: editQuickLinkData.href.trim(), group: editQuickLinkData.group || 'Company' } : l
      ),
    }));
    setEditingQuickLinkId(null);
    toast.success('Quick link updated.');
  };

  // ─────────────────────────────────────────────────────────────
  // Home Page CMS Save & FAQ Handlers
  // ─────────────────────────────────────────────────────────────
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    try {
      setIsUploadingImage(true);
      const { dataUrl, originalSize, webpSize } = await convertImageToWebP(file, 0.88);
      const savedPct = Math.round(((originalSize - webpSize) / originalSize) * 100);

      setHomePageConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          posterUrl: dataUrl,
        },
      }));

      setImageStats({
        originalSize,
        webpSize,
        percentSaved: savedPct > 0 ? savedPct : 0,
        format: 'image/webp',
      });

      toast.success(`Hero photo converted to WebP (${savedPct > 0 ? `${savedPct}% smaller` : 'optimized'})!`);
    } catch (err: any) {
      toast.error('Failed to process image: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|ogg)$/i)) {
      toast.error('Please select a valid video file (MP4, WebM, MOV, etc.)');
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 150) {
      toast.error('Video is too large (max 150MB). Please select a compressed MP4/WebM.');
      return;
    }

    setIsUploadingVideo(true);
    const toastId = toast.loading(`Uploading video (${sizeMb.toFixed(1)} MB) from device...`);

    try {
      // 1. Try Cloudinary upload via /api/upload
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'banners');

      let savedUrl = '';
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          savedUrl = data.url;
        }
      } catch (err) {
        console.warn('Cloudinary upload attempt failed, trying local fallback:', err);
      }

      // 2. If Cloudinary failed, try /api/cms/media fallback
      if (!savedUrl) {
        const fallbackFd = new FormData();
        fallbackFd.append('file', file);
        const fallbackRes = await fetch('/api/cms/media', {
          method: 'POST',
          body: fallbackFd,
        });
        const fallbackJson = await fallbackRes.json().catch(() => null);
        if (fallbackRes.ok && (fallbackJson?.data?.url || fallbackJson?.url)) {
          savedUrl = fallbackJson?.data?.url || fallbackJson?.url;
        }
      }

      if (!savedUrl) {
        throw new Error('Upload failed. Please check network connection or try a smaller video.');
      }

      setHomePageConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          videoUrl: savedUrl,
        },
      }));

      toast.success(`Video uploaded successfully! (${sizeMb.toFixed(1)} MB)`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Video upload failed', { id: toastId });
    } finally {
      setIsUploadingVideo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveHomePage = async () => {
    setIsSavingHomePage(true);
    try {
      // 1. Save to local Next.js BFF endpoint /api/cms/config/home-page first (never CORS blocked)
      let savedLocally = false;
      try {
        const localRes = await fetch('/api/cms/config/home-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: homePageConfig }),
        });
        if (localRes.ok) savedLocally = true;
      } catch (err) {
        console.warn('Local BFF save notice:', err);
      }

      // 2. Also sync to backend via fetchAPI
      try {
        await fetchAPI('/cms/config/home-page', {
          method: 'POST',
          body: JSON.stringify({ value: homePageConfig }),
        });
        savedLocally = true;
      } catch (err) {
        console.warn('Backend sync notice:', err);
      }

      // 3. Sync hero directly so any /cms/hero endpoints stay synced
      fetch('/api/cms/config/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: {
            ...homePageConfig.hero,
            page: 'home',
          },
        }),
      }).catch(() => null);

      fetchAPI('/cms/config/hero', {
        method: 'POST',
        body: JSON.stringify({
          value: {
            ...homePageConfig.hero,
            page: 'home',
          },
        }),
      }).catch(() => null);

      // 4. Also save faqs
      fetch('/api/cms/config/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: homePageConfig.faqs }),
      }).catch(() => null);

      fetchAPI('/cms/config/faq', {
        method: 'POST',
        body: JSON.stringify({ value: homePageConfig.faqs }),
      }).catch(() => null);

      // 5. Always persist to localStorage for instant client recovery
      if (typeof window !== 'undefined') {
        localStorage.setItem('mp_home_page_config', JSON.stringify(homePageConfig));
      }

      toast.success('Home Page CMS settings saved successfully!');
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mp_home_page_config', JSON.stringify(homePageConfig));
        toast.success('Home Page settings saved to browser storage!');
      } else {
        toast.error(err.message || 'Failed to save home page settings');
      }
    } finally {
      setIsSavingHomePage(false);
    }
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error('Please enter both Question and Answer.');
      return;
    }
    const newId = `faq-${Date.now()}`;
    setHomePageConfig((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          id: newId,
          question: newFaq.question.trim(),
          answer: newFaq.answer.trim(),
          category: newFaq.category || 'General',
        },
      ],
    }));
    setNewFaq({ question: '', answer: '', category: 'General' });
    setIsAddingFaq(false);
    toast.success('New FAQ added.');
  };

  const handleDeleteFaq = (id: string) => {
    setHomePageConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
    toast.success('FAQ removed.');
  };

  const handleStartEditFaq = (faq: { id: string; question: string; answer: string; category?: string }) => {
    setEditingFaqId(faq.id);
    setEditFaqData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
    });
  };

  const handleSaveEditFaq = (id: string) => {
    if (!editFaqData.question.trim() || !editFaqData.answer.trim()) {
      toast.error('Question and Answer cannot be empty.');
      return;
    }
    setHomePageConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) =>
        f.id === id
          ? {
              ...f,
              question: editFaqData.question.trim(),
              answer: editFaqData.answer.trim(),
              category: editFaqData.category || 'General',
            }
          : f
      ),
    }));
    setEditingFaqId(null);
    toast.success('FAQ updated.');
  };

  // ─────────────────────────────────────────────────────────────
  // Notification Drawer Handlers
  // ─────────────────────────────────────────────────────────────
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'unread') return !n.isRead;
    if (notificationFilter === 'leads') return n.type === 'lead' || n.type === 'booking';
    return true;
  });

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read.');
  };

  const handleToggleNotificationRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDeleteNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification dismissed.');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast.success('All notifications cleared.');
  };

  const handleNotificationClick = (notif: any) => {
    // mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
      if (notif.linkId) {
        const list = getItemListByTab(notif.linkTab);
        const item = list.find((i: any) => i.id === notif.linkId);
        if (item) {
          openViewPage(item);
        } else {
          setPageMode('list');
        }
      } else {
        setPageMode('list');
      }
    }
    setIsNotificationDrawerOpen(false);
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Active/Inactive Toggle Handler
  // ─────────────────────────────────────────────────────────────
  const handleToggleActive = (id: string) => {
    const updater = (prev: any[]) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item));

    switch (activeTab) {
      case 'talent': setTalents(updater); break;
      case 'services': setServices(updater); break;
      case 'blogs': setBlogs(updater); break;
      case 'become-a-youtuber': setYoutubers(updater); break;
      case 'projects': setProjects(updater); break;
      case 'contact-leads': setLeads(updater); break;
      case 'home-page': setHomeItems(updater); break;
      case 'footer-cms': setFooterItems(updater); break;
      case 'users': setUsersList(updater); break;
      case 'sponsored': setSponsoredList(updater); break;
    }
    toast.success('State updated.');
  };

  // ─────────────────────────────────────────────────────────────
  // Delete Handler
  // ─────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (!selectedItem) return;
    const id = selectedItem.id;
    const filterOut = (prev: any[]) => prev.filter((item) => item.id !== id);

    switch (activeTab) {
      case 'talent': setTalents(filterOut); break;
      case 'services': setServices(filterOut); break;
      case 'blogs': setBlogs(filterOut); break;
      case 'become-a-youtuber': setYoutubers(filterOut); break;
      case 'projects': setProjects(filterOut); break;
      case 'contact-leads': setLeads(filterOut); break;
      case 'home-page': setHomeItems(filterOut); break;
      case 'footer-cms': setFooterItems(filterOut); break;
      case 'users': setUsersList(filterOut); break;
      case 'sponsored': setSponsoredList(filterOut); break;
    }

    toast.success('Record deleted.');
    setIsDeleteModalOpen(false);
    returnToListPage();
  };

  // ─────────────────────────────────────────────────────────────
  // Save Create Handler
  // ─────────────────────────────────────────────────────────────
  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `new-${Date.now()}`;
    const payload: any = { ...formData, id: newId, isActive: formData.isActive !== false };

    switch (activeTab) {
      case 'talent':
        setTalents((prev) => [
          {
            id: newId,
            name: payload.name || 'New Talent',
            category: payload.category || 'Model',
            experience: payload.experience || '1-3 Years',
            rate: payload.rate || '₹15,000 / Day',
            location: payload.location || 'Mumbai',
            shortDesc: payload.shortDesc || '',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'services':
        setServices((prev) => [
          {
            id: newId,
            name: payload.name || 'New Service',
            category: payload.category || 'Production',
            price: payload.price || '₹1,50,000',
            shortDesc: payload.shortDesc || '',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'blogs':
        setBlogs((prev) => [
          {
            id: newId,
            title: payload.title || 'New Blog Article',
            category: payload.category || 'Editorial',
            author: payload.author || 'Super Admin',
            date: 'Today',
            readTime: payload.readTime || '3 min read',
            shortDesc: payload.shortDesc || '',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'become-a-youtuber':
        setYoutubers((prev) => [
          {
            id: newId,
            title: payload.title || 'New Creator Course',
            category: payload.category || 'YouTuber',
            price: payload.price || '₹4,999',
            level: payload.level || 'Creator',
            duration: payload.duration || '4 Weeks',
            enrolled: 0,
            shortDesc: payload.shortDesc || '',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'projects':
        setProjects((prev) => [
          {
            id: newId,
            title: payload.title || 'New Project Title',
            category: payload.category || 'Commercial',
            year: payload.year || '2026',
            client: payload.client || 'Client',
            camera: payload.camera || 'ARRI ALEXA 35',
            shortDesc: payload.shortDesc || '',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'contact-leads':
        setLeads((prev) => [
          {
            id: newId,
            name: payload.name || 'New Contact Lead',
            email: payload.email || 'lead@client.com',
            phone: payload.phone || '+91 98000 00000',
            projectType: payload.projectType || 'Brand Campaign',
            budget: payload.budget || '₹5,00,000',
            message: payload.message || '',
            date: 'Just now',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'home-page':
        setHomeItems((prev) => [
          {
            id: newId,
            title: payload.title || 'New Announcement',
            type: payload.type || 'Announcement Banner',
            text: payload.text || '',
            link: payload.link || '/contact',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'footer-cms':
        setFooterItems((prev) => [
          {
            id: newId,
            section: payload.section || 'Footer Field',
            key: payload.key || 'custom',
            value: payload.value || '',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'users':
        setUsersList((prev) => [
          {
            id: newId,
            name: payload.name || 'New User',
            email: payload.email || 'user@example.com',
            role: payload.role || 'EMPLOYEE',
            joinedDate: 'Today',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
      case 'sponsored':
        setSponsoredList((prev) => [
          {
            id: newId,
            brand: payload.brand || 'New Brand Partner',
            tagline: payload.tagline || 'Partner',
            deal: payload.deal || 'VIP Discount',
            url: payload.url || 'https://brand.com',
            isActive: payload.isActive,
          },
          ...prev,
        ]);
        break;
    }

    toast.success('Record created successfully.');
    returnToListPage();
  };

  // ─────────────────────────────────────────────────────────────
  // Save Edit Handler
  // ─────────────────────────────────────────────────────────────
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const id = selectedItem.id;

    switch (activeTab) {
      case 'talent':
        setTalents((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'services':
        setServices((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'blogs':
        setBlogs((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'become-a-youtuber':
        setYoutubers((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'projects':
        setProjects((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'contact-leads':
        setLeads((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'home-page':
        setHomeItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'footer-cms':
        setFooterItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'users':
        setUsersList((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
      case 'sponsored':
        setSponsoredList((prev) => prev.map((i) => (i.id === id ? { ...i, ...formData } : i)));
        break;
    }

    toast.success('Changes saved successfully.');
    returnToListPage();
  };

  // ─────────────────────────────────────────────────────────────
  // Current tab items filtered by search & active state
  // ─────────────────────────────────────────────────────────────
  const currentTabItems = useMemo(() => {
    const list = getItemListByTab(activeTab);

    return list.filter((item) => {
      // Status filter
      if (statusFilter === 'active' && !item.isActive) return false;
      if (statusFilter === 'inactive' && item.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const str = Object.values(item).join(' ').toLowerCase();
        return str.includes(q);
      }
      return true;
    });
  }, [
    activeTab,
    statusFilter,
    searchQuery,
    talents,
    services,
    blogs,
    youtubers,
    projects,
    leads,
    homeItems,
    footerItems,
    usersList,
    sponsoredList,
  ]);

  // Overall counts for Dashboard tab
  const totalTalents = talents.length;
  const activeTalents = talents.filter((t) => t.isActive).length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.isActive).length;
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.isActive).length;
  const totalServices = services.length;
  const totalBlogs = blogs.length;

  const activeTabDef = TABS.find((t) => t.id === activeTab) || TABS[0];
  const filteredTabs = TABS.filter((t) =>
    t.label.toLowerCase().includes(tabSearch.toLowerCase())
  );

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Brand Header with Official Site Logo */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
        <Link
          href="/super-admin"
          onClick={() => isMobile && setIsMobileNavOpen(false)}
          className="flex items-center gap-2.5 group"
        >
          <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <img
              src="/logo.png"
              alt="MP Production Logo"
              className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] tracking-tight text-slate-900 group-hover:text-[#eb3d26] transition-colors">
                MP Production
              </span>
              <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#eb3d26] border border-red-200 text-xs font-mono font-bold uppercase tracking-wide">
                Root
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-tight">Super Admin Atelier</p>
          </div>
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        ) : (
          /* Notification Alert Bell */
          <button
            type="button"
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-600 hover:text-red-600 transition-all cursor-pointer group"
            title="Alerts & Notifications"
          >
            <Bell size={17} className="group-hover:rotate-12 transition-transform" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab Search Bar */}
      <div className="p-3 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={tabSearch}
            onChange={(e) => setTabSearch(e.target.value)}
            placeholder="Search tabs..."
            className="w-full pl-9 pr-7 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-sans"
          />
          {tabSearch && (
            <button
              onClick={() => setTabSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto bg-white">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPageMode('list');
                setSearchQuery('');
                setStatusFilter('all');
                if (isMobile) setIsMobileNavOpen(false);
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('tab', tab.id);
                  url.searchParams.delete('mode');
                  url.searchParams.delete('id');
                  window.history.pushState(null, '', url.toString());
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all duration-200 cursor-pointer group text-left tracking-tight",
                isActive
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-bold scale-[1.01]"
                  : "text-slate-600 hover:text-red-600 hover:bg-red-50/70 font-medium"
              )}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-red-500"
                  )}
                />
                <span className="truncate">{tab.label}</span>
              </div>

              {tab.id !== 'dashboard' && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-mono font-semibold shrink-0",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-red-700"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
        <div className="flex items-center justify-between px-2 py-1 text-slate-600">
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <Globe size={14} className="text-red-600" />
            <span className="text-slate-500">Language: EN</span>
          </span>
          <Link
            href="/"
            target="_blank"
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
          >
            <span>Live Site</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <button
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
            } catch {}
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('mdms_auth_token');
              document.cookie = 'token=; Max-Age=0; path=/;';
              document.cookie = 'mdms_auth_token=; Max-Age=0; path=/;';
            }
            toast.info('Signed out of admin dashboard.');
            router.push('/sushant-super-admin');
            router.refresh();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-600 font-semibold transition-all cursor-pointer shadow-2xs text-xs"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-scope min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-sans selection:bg-[#eb3d26] selection:text-white">
      
      {/* ═══════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (Visible on md and above)
          ═══════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex w-64 lg:w-72 fixed inset-y-0 left-0 h-screen bg-white border-r border-slate-200 flex-col z-40 shadow-sm">
        {renderSidebarContent(false)}
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE SLIDE-OVER DRAWER (HAMBURGER ACTIVATED)
          ═══════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full bg-white border-r border-slate-200 flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {renderSidebarContent(true)}
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT MAIN CONTENT AREA (Offset by sidebar width: 64 / 72 on desktop)
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:pl-64 lg:pl-72 flex-1 flex flex-col min-w-0 bg-[#f8fafc] min-h-screen">
        <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        
        {/* Top Control Header Bar */}
        <header className="px-4 sm:px-8 py-3.5 sm:py-5 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {pageMode === 'list' ? (
            <>
              <div className="flex items-start sm:items-center justify-between gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2.5">
                  {/* Mobile Hamburger Menu Button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(true)}
                    className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer shrink-0"
                    aria-label="Open Navigation Menu"
                    title="Open Tabs Menu"
                  >
                    <Menu size={20} />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-red-600 font-bold">
                        MP PRODUCTION · CMS &amp; OPERATIONS
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                        Tab: {activeTabDef.label}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5 sm:mt-1">
                      {activeTabDef.label}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                      {activeTabDef.description}
                    </p>
                  </div>
                </div>

                {/* Mobile Notification Alert Bell */}
                <button
                  type="button"
                  onClick={() => setIsNotificationDrawerOpen(true)}
                  className="md:hidden relative p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer shrink-0"
                  aria-label="Open Notifications"
                  title="Alerts & Notifications"
                >
                  <Bell size={18} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Action Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Live Refresh Button */}
                <button
                  onClick={fetchLiveData}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Fetch latest updates from database"
                >
                  <RefreshCw size={14} className={cn(isRefreshing && 'animate-spin text-red-600')} />
                  <span>{isRefreshing ? 'Syncing...' : 'Live Refresh'}</span>
                </button>

                {/* Header Action Button: Save for footer-cms / home-page or Add New for other tabs */}
                {activeTab === 'footer-cms' ? (
                  <button
                    type="button"
                    onClick={handleSaveFooter}
                    disabled={isSavingFooter}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingFooter ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Save Footer Changes</span>
                  </button>
                ) : activeTab === 'home-page' ? (
                  <button
                    type="button"
                    onClick={handleSaveHomePage}
                    disabled={isSavingHomePage}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingHomePage ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Save Home Page Changes</span>
                  </button>
                ) : activeTab !== 'dashboard' ? (
                  <button
                    onClick={openCreatePage}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/20 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Plus size={16} className="stroke-[3]" />
                    <span>+ Add New {activeTabDef.label}</span>
                  </button>
                ) : null}
              </div>
            </>
          ) : pageMode === 'edit' || pageMode === 'create' ? (
            <>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={returnToListPage}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition-all cursor-pointer"
                  title="Back to list"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-red-600 font-bold">
                      {activeTabDef.label} · {pageMode === 'create' ? 'Create Page' : 'Edit Page'}
                    </span>
                    {selectedItem?.id && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono text-slate-500 font-medium">
                          ID: {selectedItem.id}
                        </span>
                      </>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                    {pageMode === 'create'
                      ? `Create New ${activeTabDef.label}`
                      : `Edit: ${selectedItem?.name || selectedItem?.title || selectedItem?.brand || activeTabDef.label}`}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={returnToListPage}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm cursor-pointer shadow-2xs"
                >
                  Cancel &amp; Back
                </button>
                <button
                  type="button"
                  onClick={pageMode === 'create' ? handleSaveCreate : handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 cursor-pointer"
                >
                  {pageMode === 'create' ? 'Create Record' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            /* pageMode === 'view' */
            <>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={returnToListPage}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition-all cursor-pointer"
                  title="Back to list"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
                      {activeTabDef.label} · View Details
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      ID: {selectedItem?.id || 'Record'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                    {selectedItem?.name || selectedItem?.title || selectedItem?.brand || activeTabDef.label}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={returnToListPage}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs"
                >
                  Back to List
                </button>
                <button
                  type="button"
                  onClick={() => openEditPage(selectedItem)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <Edit size={14} />
                  <span>Edit this Record</span>
                </button>
              </div>
            </>
          )}
        </header>

        {/* ─────────────────────────────────────────────────────────
            MAIN BODY CONTENT SWITCHER
            ───────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-8 space-y-6">

          {/* VIEW MODE 1: DEDICATED FULL-PAGE EDIT / CREATE (NO CRAMPED POPUP!) */}
          {(pageMode === 'edit' || pageMode === 'create') && (
            <form onSubmit={pageMode === 'create' ? handleSaveCreate : handleSaveEdit} className="space-y-6 max-w-4xl">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {pageMode === 'create' ? `Add New ${activeTabDef.label}` : `Modify ${activeTabDef.label} Information`}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Fill in the required attributes below. Changes update the CMS directly.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 font-mono">Live Visibility:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: formData.isActive === false ? true : false })}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                        formData.isActive !== false ? "bg-red-600" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200",
                          formData.isActive !== false ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Title / Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                      {activeTab === 'talent' ? 'Talent Name' : activeTab === 'services' ? 'Service Name' : activeTab === 'sponsored' ? 'Brand Partner' : activeTab === 'footer-cms' ? 'Section Header' : 'Name / Title'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || formData.title || formData.brand || formData.section || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, name: val, title: val, brand: val, section: val });
                      }}
                      placeholder="Enter title or full name..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                    />
                  </div>

                  {/* Category / Role / Specialization */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                      Category / Role / Type
                    </label>
                    <input
                      type="text"
                      value={formData.category || formData.projectType || formData.role || formData.type || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, category: val, projectType: val, role: val, type: val });
                      }}
                      placeholder="e.g. Model, Commercial, Editorial, Actor..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                    />
                  </div>

                  {/* Price / Budget / Spec */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                      Pricing / Budget / Day Rate / Spec
                    </label>
                    <input
                      type="text"
                      value={formData.rate || formData.price || formData.year || formData.budget || formData.deal || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, rate: val, price: val, year: val, budget: val, deal: val });
                      }}
                      placeholder="e.g. ₹25,000 / Day, 2026, ₹1,50,000..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-red-600 font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                    />
                  </div>

                  {/* Dynamic Secondary Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                      {activeTab === 'talent' ? 'Industry Experience' : activeTab === 'blogs' ? 'Author Name' : activeTab === 'projects' ? 'Client / Brand' : activeTab === 'contact-leads' ? 'Client Email' : activeTab === 'users' ? 'Account Email' : activeTab === 'footer-cms' ? 'System Key' : 'Secondary Attribute'}
                    </label>
                    <input
                      type="text"
                      value={formData.experience || formData.author || formData.client || formData.email || formData.key || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, experience: val, author: val, client: val, email: val, key: val });
                      }}
                      placeholder="e.g. 5+ Years, Lakme, admin@agency.com..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                    />
                  </div>

                  {/* Dynamic Tertiary Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                      {activeTab === 'talent' ? 'Location / Base' : activeTab === 'blogs' ? 'Read Time' : activeTab === 'projects' ? 'Camera / Gear Package' : activeTab === 'contact-leads' ? 'Phone Number' : activeTab === 'become-a-youtuber' ? 'Course Duration' : activeTab === 'sponsored' ? 'Destination Website' : 'Additional Spec'}
                    </label>
                    <input
                      type="text"
                      value={formData.location || formData.readTime || formData.camera || formData.phone || formData.duration || formData.url || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, location: val, readTime: val, camera: val, phone: val, duration: val, url: val });
                      }}
                      placeholder="e.g. Mumbai, 4 min read, ARRI ALEXA 35, +91 98000..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                    />
                  </div>

                  {/* Description / Content / Message */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                      Full Description / Bio / Article Text / Lead Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.shortDesc || formData.message || formData.bio || formData.text || formData.value || formData.content || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, shortDesc: val, message: val, bio: val, text: val, value: val, content: val });
                      }}
                      placeholder="Enter detailed description or notes..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans resize-y leading-relaxed transition-all"
                    />
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      MEDIA / IMAGE UPLOAD & IN-BROWSER WEBP CONVERTER
                      ───────────────────────────────────────────────────────────── */}
                  <div className="md:col-span-2 pt-5 border-t border-slate-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                          <ImageIcon className="w-4 h-4 text-red-600" />
                          <span>Cover Media / Service Image (WebP Converter)</span>
                        </label>
                        <p className="text-xs text-slate-500">
                          Upload any image file (PNG, JPG, BMP, GIF, AVIF, WEBP). It will be automatically converted to optimized <b>.webp</b> format.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={13} />
                          Auto WebP Active
                        </span>
                      </div>
                    </div>

                    {/* Upload Dropzone & Live Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Left: Upload Input & Drop Area */}
                      <div className="md:col-span-2 space-y-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp"
                          className="hidden"
                        />

                        <div
                          onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                          className={cn(
                            "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                            isUploadingImage
                              ? "border-red-400 bg-red-50/50 cursor-wait"
                              : "border-slate-300 hover:border-red-500 hover:bg-red-50/30 bg-slate-50"
                          )}
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-red-700 block">Converting image to WebP format...</span>
                                <span className="text-xs text-slate-500 block">Rendering canvas, compressing buffer &amp; saving...</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-11 h-11 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-red-600">
                                <Upload size={18} />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-slate-800 block">
                                  Click or Drop an image here to upload
                                </span>
                                <span className="text-xs text-slate-500 block mt-0.5">
                                  Supports PNG, JPG, JPEG, BMP, AVIF, WEBP (Max 10MB)
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* WebP Compression Savings Stats */}
                        {imageStats && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>
                                Converted to WebP: <b>{(imageStats.webpSize / 1024).toFixed(1)} KB</b> (was {(imageStats.originalSize / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs">
                              {imageStats.percentSaved}% Saved
                            </span>
                          </div>
                        )}

                        {/* Direct Image URL input */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Or Specify Direct Image URL / Local Asset Path:
                          </label>
                          <input
                            type="text"
                            value={formData.imageUrl || formData.img || formData.coverImage || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ ...formData, imageUrl: val, img: val, coverImage: val });
                            }}
                            placeholder="e.g. /assets/service_production.webp or https://..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                          />
                        </div>

                        {/* Quick Presets for Services */}
                        {activeTab === 'services' && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-xs font-semibold text-slate-600 uppercase">Quick Demo Presets:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: '🎬 Production Film', path: '/assets/service_production.webp' },
                                { label: '🎞️ Post-Production', path: '/assets/service_post_production.webp' },
                                { label: '🎭 Casting & Talent', path: '/assets/service_casting.webp' },
                                { label: '🎥 Commercial Shoot', path: '/assets/project-commercial.webp' },
                                { label: '📸 Fashion Editorial', path: '/assets/fashion_lookbook.webp' },
                                { label: '🎵 Music Video', path: '/assets/project-music.webp' },
                              ].map((preset) => (
                                <button
                                  key={preset.path}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, imageUrl: preset.path, img: preset.path, coverImage: preset.path })}
                                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Live Image Preview Card */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                              Live Preview
                            </span>
                            {(formData.imageUrl || formData.img || formData.coverImage) && (
                              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-100 text-red-700 border border-red-200">
                                WEBP
                              </span>
                            )}
                          </div>

                          {(formData.imageUrl || formData.img || formData.coverImage) ? (
                            <div className="relative aspect-video w-full rounded-xl border border-slate-200 bg-black/5 shadow-2xs group overflow-hidden">
                              <img
                                src={formData.imageUrl || formData.img || formData.coverImage}
                                alt="Preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-200 bg-white/60 flex flex-col items-center justify-center text-slate-400 gap-1.5 text-center p-3">
                              <ImageIcon size={24} className="text-slate-300" />
                              <span className="text-sm font-semibold text-slate-700">No Image Uploaded</span>
                              <span className="text-xs text-slate-400">Select an image or click a preset</span>
                            </div>
                          )}
                        </div>

                        {(formData.imageUrl || formData.img || formData.coverImage) && (
                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200/60 mt-3">
                            <a
                              href={formData.imageUrl || formData.img || formData.coverImage}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-700 hover:text-red-600 flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink size={12} />
                              <span>Open Original</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, imageUrl: '', img: '', coverImage: '' });
                                setImageStats(null);
                              }}
                              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Trash2 size={12} />
                              <span>Clear Image</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {pageMode === 'edit' && selectedItem && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete this record permanently</span>
                    </button>
                  )}
                  <div className="flex items-center gap-2.5 ml-auto">
                    <button
                      type="button"
                      onClick={returnToListPage}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold cursor-pointer transition-all"
                    >
                      Cancel &amp; Return
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 cursor-pointer transition-all"
                    >
                      {pageMode === 'create' ? 'Create Record' : 'Save Changes'}
                    </button>
                  </div>
                </div>

              </div>
            </form>
          )}

          {/* VIEW MODE 2: DEDICATED FULL-PAGE VIEW SCREEN */}
          {pageMode === 'view' && selectedItem && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedItem.category || selectedItem.projectType || selectedItem.role || selectedItem.type || 'Record'}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase font-mono",
                        selectedItem.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}>
                        <span className={cn("w-2 h-2 rounded-full", selectedItem.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                        <span>{selectedItem.isActive ? 'Active & Published' : 'Inactive / Draft'}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {selectedItem.id}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
                      {selectedItem.name || selectedItem.title || selectedItem.brand || selectedItem.section}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => openEditPage(selectedItem)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 cursor-pointer transition-all"
                    >
                      <Edit size={15} />
                      <span>Edit Record</span>
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Featured Media / Cover Banner (WebP Optimized) */}
                {(selectedItem.imageUrl || selectedItem.img || selectedItem.coverImage) && (
                  <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs">
                    <img
                      src={selectedItem.imageUrl || selectedItem.img || selectedItem.coverImage}
                      alt={selectedItem.name || selectedItem.title || 'Media Asset'}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-md bg-red-600/90 text-white font-mono font-bold text-xs uppercase tracking-wider backdrop-blur-xs">
                          WebP Optimized Media
                        </span>
                        <a
                          href={selectedItem.imageUrl || selectedItem.img || selectedItem.coverImage}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs transition-colors"
                        >
                          <span>View Fullscreen</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Spec Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block font-semibold">Pricing / Spec</span>
                    <span className="text-base font-bold text-red-600 font-mono mt-1 block">
                      {selectedItem.rate || selectedItem.price || selectedItem.year || selectedItem.budget || selectedItem.deal || 'Standard'}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block font-semibold">Category</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {selectedItem.category || selectedItem.projectType || selectedItem.type || 'Verified'}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block font-semibold">Details / Role</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block truncate">
                      {selectedItem.experience || selectedItem.author || selectedItem.client || selectedItem.level || selectedItem.role || 'Production'}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block font-semibold">Location / Spec</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block truncate">
                      {selectedItem.location || selectedItem.camera || selectedItem.phone || selectedItem.duration || 'Studio HQ'}
                    </span>
                  </div>
                </div>

                {/* Narrative / Description Preview */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Description / Bio / Article Text / Notes
                  </h3>
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedItem.shortDesc || selectedItem.message || selectedItem.bio || selectedItem.text || selectedItem.value || selectedItem.content || 'No detailed description provided for this record.'}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={returnToListPage}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    ← Back to {activeTabDef.label} List
                  </button>

                  {selectedItem.url && (
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                    >
                      <span>Open External Link</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* VIEW MODE 3: STANDARD LIST VIEW (Dashboard Overview or Data Tables) */}
          {pageMode === 'list' && (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Quick KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-red-200 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Talent Roster</span>
                        <UserCheck className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold font-mono text-slate-900">{totalTalents}</span>
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {activeTalents} Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Verified models, actors &amp; digital creators</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-red-200 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Works Archive</span>
                        <Clapperboard className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold font-mono text-slate-900">{totalProjects}</span>
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {activeProjects} Published
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Cinematic commercial films &amp; music videos</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-red-200 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Client Leads</span>
                        <Mail className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold font-mono text-slate-900">{totalLeads}</span>
                        <span className="text-xs text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          {newLeads} Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Shoot inquiries &amp; commercial quotation requests</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-red-200 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Catalog Items</span>
                        <Layers className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold font-mono text-slate-900">{totalServices + totalBlogs}</span>
                        <span className="text-xs text-slate-500 font-mono">
                          {totalServices} Srv / {totalBlogs} Blog
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Live production packages &amp; editorial journal articles</p>
                    </div>

                  </div>

                  {/* Quick Navigation Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Recent Inquiries Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-red-600" />
                          <h3 className="text-base font-bold text-slate-900">Recent Client Inquiries</h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('contact-leads')}
                          className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span>View All Leads</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {leads.slice(0, 4).map((lead) => (
                          <div
                            key={lead.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-red-200 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 truncate">{lead.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  {lead.projectType}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{lead.message}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="block text-xs font-bold text-red-600 font-mono">{lead.budget}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{lead.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Shortcuts & System Status */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-base font-bold text-slate-900">Direct CMS Quick Jump</h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          All Systems Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {TABS.filter((t) => t.id !== 'dashboard').map((t) => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setActiveTab(t.id)}
                              className="p-3 rounded-xl bg-slate-50 hover:bg-red-50/70 border border-slate-200/80 hover:border-red-200 text-left transition-all group cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <Icon className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" />
                              </div>
                              <span className="block text-sm font-bold text-slate-900 mt-2 truncate group-hover:text-red-600">
                                {t.label}
                              </span>
                              <span className="text-xs text-slate-500 block truncate mt-0.5">
                                {t.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB: FOOTER CMS (Clean, dedicated editor matching user specification)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'footer-cms' && (
                <div className="space-y-6 max-w-5xl">

                  {/* Section 1: Brand & Newsletter */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Brand &amp; Newsletter</h2>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">Public footer brand identity, tagline, newsletter copy, and copyright.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                        Brand Identity
                      </span>
                    </div>

                    <div className="space-y-5">
                      {/* Site Tagline */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Site Tagline</label>
                        <input
                          type="text"
                          value={footerConfig.tagline}
                          onChange={(e) => setFooterConfig({ ...footerConfig, tagline: e.target.value })}
                          placeholder="e.g. Crafting Cinematic Excellence & Digital Legacies."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                        />
                      </div>

                      {/* Brand Description */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Brand Description</label>
                        <textarea
                          rows={3}
                          value={footerConfig.brandDescription}
                          onChange={(e) => setFooterConfig({ ...footerConfig, brandDescription: e.target.value })}
                          placeholder="Brief about paragraph appearing below the logo..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans resize-y leading-relaxed transition-all"
                        />
                      </div>

                      {/* Newsletter Title & Description Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Newsletter Title</label>
                          <input
                            type="text"
                            value={footerConfig.newsletterTitle}
                            onChange={(e) => setFooterConfig({ ...footerConfig, newsletterTitle: e.target.value })}
                            placeholder="e.g. Subscribe to Our Newsletter"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Newsletter Description</label>
                          <input
                            type="text"
                            value={footerConfig.newsletterDesc}
                            onChange={(e) => setFooterConfig({ ...footerConfig, newsletterDesc: e.target.value })}
                            placeholder="e.g. Receive weekly cinematic production insights..."
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                          />
                        </div>
                      </div>

                      {/* Newsletter Placeholder & Copyright */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Newsletter Placeholder</label>
                          <input
                            type="text"
                            value={footerConfig.newsletterPlaceholder}
                            onChange={(e) => setFooterConfig({ ...footerConfig, newsletterPlaceholder: e.target.value })}
                            placeholder="e.g. Enter your email"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Copyright Text</label>
                          <input
                            type="text"
                            value={footerConfig.copyrightText}
                            onChange={(e) => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
                            placeholder="e.g. Powered By JCRM Technologies"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact & Studio Info */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Contact &amp; Location Details</h2>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">Official contact email, phone hotline, and registered studio address.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                        Public Contact
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Official Email</label>
                        <input
                          type="email"
                          value={footerConfig.contactEmail}
                          onChange={(e) => setFooterConfig({ ...footerConfig, contactEmail: e.target.value })}
                          placeholder="e.g. hello@mpproduction.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Official Phone / Hotline</label>
                        <input
                          type="text"
                          value={footerConfig.contactPhone}
                          onChange={(e) => setFooterConfig({ ...footerConfig, contactPhone: e.target.value })}
                          placeholder="e.g. +91 831 053 1309"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Headquarters / Studio Address</label>
                        <input
                          type="text"
                          value={footerConfig.contactAddress}
                          onChange={(e) => setFooterConfig({ ...footerConfig, contactAddress: e.target.value })}
                          placeholder="e.g. Studio 4, Film City Complex, Goregaon East, Mumbai 400065"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 font-sans transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Social Media Channels */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Social Media Handles</h2>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">Destination links for social badges in the footer bottom bar.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                        Social Links
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Instagram Profile URL</label>
                        <input
                          type="text"
                          value={footerConfig.socialLinks.instagram}
                          onChange={(e) => setFooterConfig({ ...footerConfig, socialLinks: { ...footerConfig.socialLinks, instagram: e.target.value } })}
                          placeholder="https://instagram.com/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">YouTube Channel URL</label>
                        <input
                          type="text"
                          value={footerConfig.socialLinks.youtube}
                          onChange={(e) => setFooterConfig({ ...footerConfig, socialLinks: { ...footerConfig.socialLinks, youtube: e.target.value } })}
                          placeholder="https://youtube.com/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">LinkedIn Company URL</label>
                        <input
                          type="text"
                          value={footerConfig.socialLinks.linkedin}
                          onChange={(e) => setFooterConfig({ ...footerConfig, socialLinks: { ...footerConfig.socialLinks, linkedin: e.target.value } })}
                          placeholder="https://linkedin.com/company/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Twitter / X URL</label>
                        <input
                          type="text"
                          value={footerConfig.socialLinks.twitter}
                          onChange={(e) => setFooterConfig({ ...footerConfig, socialLinks: { ...footerConfig.socialLinks, twitter: e.target.value } })}
                          placeholder="https://twitter.com/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Facebook Page URL</label>
                        <input
                          type="text"
                          value={footerConfig.socialLinks.facebook}
                          onChange={(e) => setFooterConfig({ ...footerConfig, socialLinks: { ...footerConfig.socialLinks, facebook: e.target.value } })}
                          placeholder="https://facebook.com/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Quick Links / Footer Navigation (Add, Edit, Delete) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Footer Navigation &amp; Quick Links</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                            {footerConfig.quickLinks.length} Active Links
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">
                          Add, edit, or delete any links displayed across footer navigation columns.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddingQuickLink(!isAddingQuickLink)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer self-start sm:self-auto transition-all"
                      >
                        <Plus size={14} className="stroke-[3]" />
                        <span>{isAddingQuickLink ? 'Close Form' : '+ Add Quick Link'}</span>
                      </button>
                    </div>

                    {/* Add New Quick Link Form Drawer / Box */}
                    {isAddingQuickLink && (
                      <form onSubmit={handleAddQuickLink} className="p-4 rounded-xl bg-red-50/40 border border-red-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-red-100">
                          <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                            <Plus size={13} />
                            <span>Add New Footer Link</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingQuickLink(false)}
                            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700">Link Label *</label>
                            <input
                              type="text"
                              required
                              value={newQuickLink.label}
                              onChange={(e) => setNewQuickLink({ ...newQuickLink, label: e.target.value })}
                              placeholder="e.g. Booking Portal"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-red-500 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700">Destination URL / Route *</label>
                            <input
                              type="text"
                              required
                              value={newQuickLink.href}
                              onChange={(e) => setNewQuickLink({ ...newQuickLink, href: e.target.value })}
                              placeholder="e.g. /booking or https://..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-red-500 text-xs font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700">Column / Group</label>
                            <select
                              value={newQuickLink.group}
                              onChange={(e) => setNewQuickLink({ ...newQuickLink, group: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-red-500 text-xs"
                            >
                              <option value="Company">Company</option>
                              <option value="Network & Work">Network &amp; Work</option>
                              <option value="Support & Legal">Support &amp; Legal</option>
                              <option value="Quick Links">Quick Links</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingQuickLink(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Add Link
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Quick Links List (Simple Edit & Delete) */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {footerConfig.quickLinks.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No quick links configured yet. Click "+ Add Quick Link" above to add your first footer link.
                        </div>
                      ) : (
                        footerConfig.quickLinks.map((link) => {
                          const isEditing = editingQuickLinkId === link.id;

                          return (
                            <div
                              key={link.id}
                              className={cn(
                                "p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
                                isEditing ? "bg-red-50/30" : "bg-white hover:bg-slate-50"
                              )}
                            >
                              {isEditing ? (
                                /* Inline Edit Mode */
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  <input
                                    type="text"
                                    value={editQuickLinkData.label}
                                    onChange={(e) => setEditQuickLinkData({ ...editQuickLinkData, label: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-slate-900 text-xs font-semibold focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={editQuickLinkData.href}
                                    onChange={(e) => setEditQuickLinkData({ ...editQuickLinkData, href: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-slate-900 text-xs font-mono focus:outline-none"
                                  />
                                  <select
                                    value={editQuickLinkData.group}
                                    onChange={(e) => setEditQuickLinkData({ ...editQuickLinkData, group: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-slate-900 text-xs focus:outline-none"
                                  >
                                    <option value="Company">Company</option>
                                    <option value="Network & Work">Network &amp; Work</option>
                                    <option value="Support & Legal">Support &amp; Legal</option>
                                    <option value="Quick Links">Quick Links</option>
                                  </select>
                                </div>
                              ) : (
                                /* Standard Display Mode */
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-slate-900 truncate">{link.label}</span>
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                        {link.group || 'General'}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono block truncate mt-0.5">
                                      {link.href}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Actions (Edit / Delete) */}
                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditQuickLink(link.id)}
                                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                      title="Save Link"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuickLinkId(null)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditQuickLink(link)}
                                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 cursor-pointer transition-colors"
                                      title="Edit Link"
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuickLink(link.id)}
                                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                                      title="Delete Link"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Section 5: Save All Footer Changes Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Ready to publish footer updates?</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Changes will instantly apply across all pages on the public website.</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={fetchLiveData}
                        disabled={isRefreshing}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-sm cursor-pointer transition-all"
                      >
                        Reset to Last Saved
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveFooter}
                        disabled={isSavingFooter}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isSavingFooter ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        <span>{isSavingFooter ? 'Saving Changes...' : 'Save Footer Changes'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB: HOME PAGE CMS (Clean, dedicated editor matching Home Page)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'home-page' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Hidden input for hero image upload */}
                  <input
                    type="file"
                    ref={heroFileInputRef}
                    onChange={handleHeroImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Hidden input for hero video upload */}
                  <input
                    type="file"
                    ref={heroVideoFileInputRef}
                    onChange={handleHeroVideoUpload}
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    className="hidden"
                  />

                  {/* Section 1: Top Announcement Bar */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Top Announcement Banner</h2>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">Floating announcement strip displayed at the top of the homepage for slots, deals or offers.</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                          {homePageConfig.announcement.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setHomePageConfig({
                              ...homePageConfig,
                              announcement: {
                                ...homePageConfig.announcement,
                                enabled: !homePageConfig.announcement.enabled,
                              },
                            })
                          }
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            homePageConfig.announcement.enabled ? "bg-red-600" : "bg-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              homePageConfig.announcement.enabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Announcement Headline Text</label>
                        <input
                          type="text"
                          value={homePageConfig.announcement.text}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              announcement: { ...homePageConfig.announcement, text: e.target.value },
                            })
                          }
                          placeholder="e.g. Autumn/Winter 2026 Production Slots Open — Limited commercial dates remaining."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-sans"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Badge Label</label>
                        <input
                          type="text"
                          value={homePageConfig.announcement.badge}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              announcement: { ...homePageConfig.announcement, badge: e.target.value },
                            })
                          }
                          placeholder="e.g. NOW BOOKING"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-mono"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-3">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Banner Destination Link</label>
                        <input
                          type="text"
                          value={homePageConfig.announcement.link}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              announcement: { ...homePageConfig.announcement, link: e.target.value },
                            })
                          }
                          placeholder="e.g. /contact or /projects"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Hero Section (Main Banner, Video, Photo & Content) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Hero Section (Main Banner, Video &amp; Photo)</h2>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">Edit the top-of-fold cinematic banner, background video, cover photo, headline and CTA buttons.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wide">
                        Top of Fold
                      </span>
                    </div>

                    <div className="space-y-5">
                      {/* Eyebrow Studio Tag */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Studio Eyebrow Badge</label>
                        <input
                          type="text"
                          value={homePageConfig.hero.eyebrow}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              hero: { ...homePageConfig.hero, eyebrow: e.target.value },
                            })
                          }
                          placeholder="e.g. Cinematic Studio · Est. 2018"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-mono"
                        />
                      </div>

                      {/* Main Headline */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Hero Main Headline</label>
                          <span className="text-xs text-slate-400 font-medium">Tip: Use Enter/newline to create line break</span>
                        </div>
                        <textarea
                          rows={2}
                          value={homePageConfig.hero.heading}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              hero: { ...homePageConfig.hero, heading: e.target.value },
                            })
                          }
                          placeholder="e.g. Stories built&#10;frame by frame."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all leading-relaxed font-sans"
                        />
                      </div>

                      {/* Subheading Story */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Hero Subheading &amp; Story Description</label>
                        <textarea
                          rows={3}
                          value={homePageConfig.hero.subheading}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              hero: { ...homePageConfig.hero, subheading: e.target.value },
                            })
                          }
                          placeholder="Full narrative description below the main headline..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-sans resize-y leading-relaxed"
                        />
                      </div>

                      {/* Background Media Type Selector */}
                      <div className="space-y-2.5 pt-3 border-t border-slate-100">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Hero Background Media Mode</label>
                        <div className="grid grid-cols-2 gap-3 sm:w-96">
                          <button
                            type="button"
                            onClick={() =>
                              setHomePageConfig({
                                ...homePageConfig,
                                hero: { ...homePageConfig.hero, mediaType: 'video' },
                              })
                            }
                            className={cn(
                              "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all",
                              homePageConfig.hero.mediaType === 'video'
                                ? "bg-red-50 border-red-500 text-red-700 shadow-xs font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            <Video size={16} className={homePageConfig.hero.mediaType === 'video' ? 'text-red-600' : 'text-slate-400'} />
                            <span>Cinematic Video</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setHomePageConfig({
                                ...homePageConfig,
                                hero: { ...homePageConfig.hero, mediaType: 'image' },
                              })
                            }
                            className={cn(
                              "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all",
                              homePageConfig.hero.mediaType === 'image'
                                ? "bg-red-50 border-red-500 text-red-700 shadow-xs font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            <ImageIcon size={16} className={homePageConfig.hero.mediaType === 'image' ? 'text-red-600' : 'text-slate-400'} />
                            <span>Photo / Cover Image</span>
                          </button>
                        </div>
                      </div>

                      {/* Media URL & Uploader */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                        {homePageConfig.hero.mediaType === 'video' && (
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Background Video URL (MP4 / WebM)</label>
                            <div className="flex gap-2.5">
                              <input
                                type="text"
                                value={homePageConfig.hero.videoUrl}
                                onChange={(e) =>
                                  setHomePageConfig({
                                    ...homePageConfig,
                                    hero: { ...homePageConfig.hero, videoUrl: e.target.value },
                                  })
                                }
                                placeholder="e.g. https://.../video.mp4"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => heroVideoFileInputRef.current?.click()}
                                disabled={isUploadingVideo}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-600 text-xs font-bold cursor-pointer shrink-0 transition-all shadow-2xs disabled:opacity-50"
                              >
                                {isUploadingVideo ? (
                                  <Loader2 size={14} className="animate-spin text-red-600" />
                                ) : (
                                  <Upload size={14} />
                                )}
                                <span>{isUploadingVideo ? 'Uploading...' : 'Upload Video from Device'}</span>
                              </button>
                            </div>

                            {/* Active Video Live Preview Card */}
                            {homePageConfig.hero.videoUrl && (
                              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-bold text-slate-800">Active Background Video Preview</span>
                                  </div>
                                  <a
                                    href={homePageConfig.hero.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                                  >
                                    <ExternalLink size={12} /> Open Full Video
                                  </a>
                                </div>
                                <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-slate-200 bg-black">
                                  <video
                                    key={homePageConfig.hero.videoUrl}
                                    src={homePageConfig.hero.videoUrl}
                                    controls
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-xs text-slate-500 font-mono truncate block">
                                  {homePageConfig.hero.videoUrl}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                            {homePageConfig.hero.mediaType === 'video' ? 'Poster / Fallback Image URL' : 'Hero Photo / Image URL'}
                          </label>
                          <div className="flex gap-2.5">
                            <input
                              type="text"
                              value={homePageConfig.hero.posterUrl}
                              onChange={(e) =>
                                setHomePageConfig({
                                  ...homePageConfig,
                                  hero: { ...homePageConfig.hero, posterUrl: e.target.value },
                                })
                              }
                              placeholder="e.g. /assets/hero_cinematic_dark.webp or https://..."
                              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => heroFileInputRef.current?.click()}
                              disabled={isUploadingImage}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-600 text-xs font-bold cursor-pointer shrink-0 transition-all shadow-2xs"
                            >
                              {isUploadingImage ? <Loader2 size={14} className="animate-spin text-red-600" /> : <Upload size={14} />}
                              <span>{isUploadingImage ? 'Converting...' : 'Upload & Convert to WebP'}</span>
                            </button>
                          </div>
                          {homePageConfig.hero.posterUrl && (
                            <div className="mt-2.5 flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <img
                                src={homePageConfig.hero.posterUrl}
                                alt="Hero Media Preview"
                                className="w-20 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-800 block">Active Hero Media Preview</span>
                                <span className="text-xs text-slate-500 font-mono truncate block mt-0.5">{homePageConfig.hero.posterUrl}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Call-to-Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                        {/* Primary CTA */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-xs" />
                            <span>Primary CTA Button</span>
                          </span>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-600">Button Label</label>
                            <input
                              type="text"
                              value={homePageConfig.hero.ctaText}
                              onChange={(e) =>
                                setHomePageConfig({
                                  ...homePageConfig,
                                  hero: { ...homePageConfig.hero, ctaText: e.target.value },
                                })
                              }
                              placeholder="e.g. Explore Portfolio"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-600">Destination Link</label>
                            <input
                              type="text"
                              value={homePageConfig.hero.ctaUrl}
                              onChange={(e) =>
                                setHomePageConfig({
                                  ...homePageConfig,
                                  hero: { ...homePageConfig.hero, ctaUrl: e.target.value },
                                })
                              }
                              placeholder="e.g. /projects"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            />
                          </div>
                        </div>

                        {/* Secondary CTA */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <span>Secondary CTA Button</span>
                          </span>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-600">Button Label</label>
                            <input
                              type="text"
                              value={homePageConfig.hero.secondaryCtaText}
                              onChange={(e) =>
                                setHomePageConfig({
                                  ...homePageConfig,
                                  hero: { ...homePageConfig.hero, secondaryCtaText: e.target.value },
                                })
                              }
                              placeholder="e.g. Become a YouTuber"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-600">Destination Link</label>
                            <input
                              type="text"
                              value={homePageConfig.hero.secondaryCtaUrl}
                              onChange={(e) =>
                                setHomePageConfig({
                                  ...homePageConfig,
                                  hero: { ...homePageConfig.hero, secondaryCtaUrl: e.target.value },
                                })
                              }
                              placeholder="e.g. /become-a-youtuber"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Homepage Impact Metrics & Counters */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Homepage Impact Metrics &amp; Counter Strip</h2>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">Live milestones animated below the hero headline on page load.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                        4 Counters
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {homePageConfig.stats.map((st, sIdx) => (
                        <div key={sIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                            Stat 0{sIdx + 1}
                          </span>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Number</label>
                              <input
                                type="number"
                                value={st.n}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  const updated = [...homePageConfig.stats];
                                  updated[sIdx] = { ...updated[sIdx], n: val };
                                  setHomePageConfig({ ...homePageConfig, stats: updated });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Suffix</label>
                              <input
                                type="text"
                                value={st.s}
                                onChange={(e) => {
                                  const updated = [...homePageConfig.stats];
                                  updated[sIdx] = { ...updated[sIdx], s: e.target.value };
                                  setHomePageConfig({ ...homePageConfig, stats: updated });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:border-red-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Label</label>
                            <input
                              type="text"
                              value={st.label}
                              onChange={(e) => {
                                const updated = [...homePageConfig.stats];
                                updated[sIdx] = { ...updated[sIdx], label: e.target.value };
                                setHomePageConfig({ ...homePageConfig, stats: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Hardware Showcase Strip */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cinema Hardware Showcase Strip</h2>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">Featured cinema camera fleet and optical lens systems highlight.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                        Equipment Strip
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Showcase Title</label>
                        <input
                          type="text"
                          value={homePageConfig.showcase.title}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              showcase: { ...homePageConfig.showcase, title: e.target.value },
                            })
                          }
                          placeholder="e.g. Master Cinematic Camera Fleet"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-sans"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Hardware Spec Badge</label>
                        <input
                          type="text"
                          value={homePageConfig.showcase.badge}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              showcase: { ...homePageConfig.showcase, badge: e.target.value },
                            })
                          }
                          placeholder="e.g. 8K RAW · Anamorphic 2.0x · 120 FPS"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-mono"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Showcase Subtitle &amp; Description</label>
                        <input
                          type="text"
                          value={homePageConfig.showcase.subtitle}
                          onChange={(e) =>
                            setHomePageConfig({
                              ...homePageConfig,
                              showcase: { ...homePageConfig.showcase, subtitle: e.target.value },
                            })
                          }
                          placeholder="e.g. ARRI Alexa 35 & RED V-Raptor 8K systems paired with Cooke and Leica anamorphic primes."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Frequently Asked Questions (FAQs) Manager (Add, Edit, Delete) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Frequently Asked Questions (FAQs)</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                            {homePageConfig.faqs.length} Active FAQs
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5 leading-normal">
                          Add, edit, or delete customer accordion questions on the homepage.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddingFaq(!isAddingFaq)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer self-start sm:self-auto transition-all"
                      >
                        <Plus size={15} className="stroke-[3]" />
                        <span>{isAddingFaq ? 'Close Form' : '+ Add New FAQ'}</span>
                      </button>
                    </div>

                    {/* Add New FAQ Form Drawer */}
                    {isAddingFaq && (
                      <form onSubmit={handleAddFaq} className="p-5 rounded-2xl bg-red-50/40 border border-red-200 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-red-100">
                          <span className="text-sm font-bold text-red-900 flex items-center gap-2">
                            <Plus size={15} />
                            <span>Add New Homepage FAQ</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingFaq(false)}
                            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-800 mb-1">Question *</label>
                            <input
                              type="text"
                              required
                              value={newFaq.question}
                              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                              placeholder="e.g. What is your typical production turnaround?"
                              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-800 mb-1">Category / Topic</label>
                            <select
                              value={newFaq.category}
                              onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-red-500"
                            >
                              <option value="General">General</option>
                              <option value="Production">Production</option>
                              <option value="Talent & Booking">Talent &amp; Booking</option>
                              <option value="Equipment">Equipment</option>
                            </select>
                          </div>

                          <div className="space-y-1 sm:col-span-3">
                            <label className="block text-xs font-semibold text-slate-800 mb-1">Answer *</label>
                            <textarea
                              rows={3}
                              required
                              value={newFaq.answer}
                              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                              placeholder="Comprehensive explanation displayed when customer expands this question..."
                              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingFaq(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Add FAQ
                          </button>
                        </div>
                      </form>
                    )}

                    {/* FAQs List with In-Place Edit and Delete */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {homePageConfig.faqs.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          No FAQs configured yet. Click "+ Add New FAQ" above to add your first accordion item.
                        </div>
                      ) : (
                        homePageConfig.faqs.map((faq, idx) => {
                          const isEditing = editingFaqId === faq.id;

                          return (
                            <div
                              key={faq.id}
                              className={cn(
                                "p-4.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 transition-colors",
                                isEditing ? "bg-red-50/30" : "bg-white hover:bg-slate-50"
                              )}
                            >
                              {isEditing ? (
                                /* Inline Edit Mode */
                                <div className="flex-1 space-y-2.5">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <input
                                      type="text"
                                      value={editFaqData.question}
                                      onChange={(e) => setEditFaqData({ ...editFaqData, question: e.target.value })}
                                      placeholder="Question"
                                      className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-white border border-red-300 text-slate-900 text-sm font-semibold focus:outline-none"
                                    />
                                    <select
                                      value={editFaqData.category}
                                      onChange={(e) => setEditFaqData({ ...editFaqData, category: e.target.value })}
                                      className="px-3.5 py-2 rounded-xl bg-white border border-red-300 text-slate-900 text-sm focus:outline-none"
                                    >
                                      <option value="General">General</option>
                                      <option value="Production">Production</option>
                                      <option value="Talent & Booking">Talent &amp; Booking</option>
                                      <option value="Equipment">Equipment</option>
                                    </select>
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={editFaqData.answer}
                                    onChange={(e) => setEditFaqData({ ...editFaqData, answer: e.target.value })}
                                    placeholder="Answer"
                                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-red-300 text-slate-900 text-sm leading-relaxed focus:outline-none"
                                  />
                                </div>
                              ) : (
                                /* Standard Display Mode */
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                        {faq.category || 'General'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                                      {faq.answer}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons (Edit / Delete) */}
                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start mt-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditFaq(faq.id)}
                                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                      title="Save FAQ"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingFaqId(null)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditFaq(faq)}
                                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 cursor-pointer transition-colors"
                                      title="Edit FAQ"
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFaq(faq.id)}
                                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                                      title="Delete FAQ"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Section 6: Save All Home Page Changes Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Ready to publish Home Page updates?</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Changes will instantly apply to the live homepage banner, video, counters &amp; FAQs.</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={fetchLiveData}
                        disabled={isRefreshing}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-sm cursor-pointer transition-all"
                      >
                        Reset to Last Saved
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveHomePage}
                        disabled={isSavingHomePage}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isSavingHomePage ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        <span>{isSavingHomePage ? 'Saving Changes...' : 'Save Home Page Changes'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: USERS (Real Database User Directory & Roles) */}
              {activeTab === 'users' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">System User Directory &amp; Access Control</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Manage real database user accounts, roles, credentials, and access permissions.</p>
                    </div>
                    <Link
                      href="/super-admin/users/invite"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer transition-all self-start sm:self-auto"
                    >
                      <Plus size={14} className="stroke-[3]" />
                      <span>+ Create / Invite New Admin</span>
                    </Link>
                  </div>
                  <UserTable currentUserRole="SUPER_ADMIN" />
                </div>
              )}

              {/* ALL OTHER CMS FUNCTIONALITY TABS */}
              {activeTab !== 'dashboard' && activeTab !== 'footer-cms' && activeTab !== 'home-page' && activeTab !== 'users' && (
                <div className="space-y-4">
                  
                  {/* Filter & Search Bar for current tab */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    
                    {/* Search Box */}
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search in ${activeTabDef.label}...`}
                        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-sans"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Status Toggle Filter (All / Active / Inactive) */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-xs",
                          statusFilter === 'all'
                            ? "bg-red-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        All ({currentTabItems.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('active')}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-xs",
                          statusFilter === 'active'
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        Active Only
                      </button>
                      <button
                        onClick={() => setStatusFilter('inactive')}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-xs",
                          statusFilter === 'inactive'
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        Inactive Only
                      </button>
                    </div>

                  </div>

                  {/* DATA TABLE (Read / Update / Delete / Active-Inactive Toggle) */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    {currentTabItems.length === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                          <Filter className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">No items found</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-normal">
                          No records match your query in {activeTabDef.label}. Clear filters or add a new record.
                        </p>
                        <button
                          onClick={openCreatePage}
                          className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-red-600/20"
                        >
                          <Plus size={15} />
                          <span>Add New Record</span>
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          
                          {/* Table Header */}
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono uppercase tracking-wider text-xs">
                              <th className="py-3.5 px-4 font-bold">Item / Title</th>
                              <th className="py-3.5 px-4 font-bold">Category / Details</th>
                              <th className="py-3.5 px-4 font-bold">Pricing / Spec</th>
                              <th className="py-3.5 px-4 font-bold text-center">Status</th>
                              <th className="py-3.5 px-4 font-bold text-center">Toggle State</th>
                              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                            </tr>
                          </thead>

                          {/* Table Body */}
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {currentTabItems.map((item) => {
                              const title = item.name || item.title || item.brand || item.section || 'Record';
                              const category = item.category || item.projectType || item.role || item.type || item.key || 'General';
                              const spec = item.rate || item.price || item.year || item.budget || item.deal || item.joinedDate || item.value || 'Active';

                              return (
                                <tr key={item.id} className="hover:bg-red-50/30 transition-colors group">
                                  
                                  {/* Primary Title Column with WebP Thumbnail */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      {(item.imageUrl || item.img || item.coverImage) ? (
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs group/thumb">
                                          <img
                                            src={item.imageUrl || item.img || item.coverImage}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                                          />
                                          <span className="absolute bottom-0 right-0 bg-red-600/90 text-[8px] text-white px-1 font-mono font-bold rounded-tl">
                                            WEBP
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="w-12 h-12 rounded-xl shrink-0 border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                                          <ImageIcon size={18} />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <div className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors truncate max-w-sm">
                                          {title}
                                        </div>
                                        {item.shortDesc && (
                                          <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5 leading-normal">
                                            {item.shortDesc}
                                          </p>
                                        )}
                                        {item.message && (
                                          <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5 leading-normal">
                                            {item.message}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Category / Secondary info */}
                                  <td className="py-3.5 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                      {category}
                                    </span>
                                    {item.experience && (
                                      <span className="block text-xs text-slate-400 font-mono mt-1">
                                        Exp: {item.experience}
                                      </span>
                                    )}
                                    {item.author && (
                                      <span className="block text-xs text-slate-400 font-mono mt-1">
                                        By {item.author}
                                      </span>
                                    )}
                                  </td>

                                  {/* Spec / Price / Year info */}
                                  <td className="py-3.5 px-4 font-mono text-red-600 font-bold text-sm">
                                    {spec}
                                    {item.enrolled !== undefined && (
                                      <span className="block text-xs text-slate-400 font-mono font-normal">
                                        {item.enrolled} Enrolled
                                      </span>
                                    )}
                                  </td>

                                  {/* Status Badge */}
                                  <td className="py-3.5 px-4 text-center">
                                    <span
                                      className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono",
                                        item.isActive
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-rose-50 text-rose-700 border border-rose-200"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          item.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                                        )}
                                      />
                                      <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                                    </span>
                                  </td>

                                  {/* ACTIVE / INACTIVE TOGGLE SWITCH */}
                                  <td className="py-3.5 px-4 text-center">
                                    <button
                                      onClick={() => handleToggleActive(item.id)}
                                      className={cn(
                                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                        item.isActive ? "bg-red-600" : "bg-slate-200"
                                      )}
                                      title={`Click to set ${item.isActive ? 'Inactive' : 'Active'}`}
                                    >
                                      <span
                                        className={cn(
                                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                                          item.isActive ? "translate-x-5" : "translate-x-0"
                                        )}
                                      />
                                    </button>
                                  </td>

                                  {/* 3 ACTIONS: VIEW / EDIT / DELETE (All in dedicated pages, NO cramped modal!) */}
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* 1. VIEW ACTION (New Page) */}
                                      <a
                                        href={`/super-admin?tab=${activeTab}&mode=view&id=${item.id}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          openViewPage(item);
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                                        title="View Details (New Page)"
                                      >
                                        <Eye size={14} />
                                      </a>

                                      {/* 2. EDIT ACTION (New Page) */}
                                      <a
                                        href={`/super-admin?tab=${activeTab}&mode=edit&id=${item.id}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          openEditPage(item);
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 border border-slate-200 hover:border-amber-200 transition-all cursor-pointer"
                                        title="Edit Details (New Page)"
                                      >
                                        <Edit size={14} />
                                      </a>

                                      {/* 3. DELETE ACTION */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setIsDeleteModalOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                                        title="Delete Record"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>

                                </tr>
                              );
                            })}
                          </tbody>

                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </>
          )}

        </div>

        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL (Retained for safe user confirmation)
          ═══════════════════════════════════════════════════════════ */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Record</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-slate-900">
                "{selectedItem.name || selectedItem.title || selectedItem.brand || selectedItem.section}"
              </span>{' '}
              from {activeTabDef.label}?
            </p>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-red-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          NOTIFICATION SLIDE-OVER DRAWER
          ═══════════════════════════════════════════════════════════ */}
      {isNotificationDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <aside className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">Notifications &amp; Alerts</h3>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-red-600 text-white shadow-xs">
                          {unreadNotificationsCount} New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Live system leads, inquiries and security updates</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNotificationDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Filter Strip & Mark All Read */}
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNotificationFilter('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer",
                      notificationFilter === 'all'
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationFilter('unread')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer",
                      notificationFilter === 'unread'
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Unread ({unreadNotificationsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationFilter('leads')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer",
                      notificationFilter === 'leads'
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Leads ({notifications.filter((n) => n.type === 'lead' || n.type === 'booking').length})
                  </button>
                </div>

                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotificationsAsRead}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {filteredNotifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Bell size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">No notifications found</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {notificationFilter === 'unread'
                          ? 'You have read all available notifications.'
                          : 'You have no alerts at this time.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map((item) => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={cn(
                          "relative p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3",
                          item.isRead
                            ? "bg-white hover:bg-slate-50/80 border-slate-200"
                            : "bg-red-50/30 hover:bg-red-50/60 border-red-200 shadow-xs"
                        )}
                      >
                        {/* Icon badge */}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border",
                            item.type === 'lead'
                              ? "bg-red-50 text-red-600 border-red-200"
                              : item.type === 'booking'
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {item.type === 'lead' ? (
                            <Mail size={15} />
                          ) : item.type === 'booking' ? (
                            <UserCheck size={15} />
                          ) : (
                            <ShieldCheck size={15} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={cn(
                                "text-sm tracking-tight truncate",
                                item.isRead ? "font-medium text-slate-800" : "font-bold text-slate-900"
                              )}
                            >
                              {item.title}
                            </h4>
                            <span className="text-xs text-slate-400 font-mono shrink-0">{item.time}</span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {item.message}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase",
                                item.type === 'lead'
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : item.type === 'booking'
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              )}
                            >
                              {item.type === 'lead' ? 'Client Lead' : item.type === 'booking' ? 'Roster Booking' : 'System'}
                            </span>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => handleToggleNotificationRead(item.id, e)}
                                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                title={item.isRead ? 'Mark as Unread' : 'Mark as Read'}
                              >
                                <Check size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteNotification(item.id, e)}
                                className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Dismiss"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unread Red Dot */}
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleClearAllNotifications}
                  disabled={notifications.length === 0}
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer disabled:opacity-40 transition-colors"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('contact-leads');
                    setPageMode('list');
                    setIsNotificationDrawerOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-600 font-semibold text-xs cursor-pointer shadow-2xs transition-all"
                >
                  <span>View All Leads</span>
                  <ArrowRight size={12} />
                </button>
              </div>

            </aside>
          </div>
        </div>
      )}

    </div>
  );
}

export default UnifiedAdminDashboard;
