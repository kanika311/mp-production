/**
 * CMS resource configuration — the single source of truth for the admin GUI.
 *
 * Each resource declares its form fields, table columns, backend routing and
 * fallback sample data. Both the client components and the server-side BFF
 * routes read from this module, so adding a new content type is pure config.
 *
 * NOTE: keep this file free of React / browser-only imports — it is consumed by
 * server route handlers as well.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'tags'
  | 'image'
  | 'date'
  | 'json'
  | 'richtext';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { label: string; value: string }[];
  /** hidden fields are kept in the payload (e.g. id) but not shown in the form */
  hidden?: boolean;
  /** full-width field in the responsive form grid */
  full?: boolean;
}

export type ColumnType = 'text' | 'badge' | 'boolean' | 'image' | 'date' | 'rating';

export interface ColumnDef {
  name: string;
  label: string;
  type?: ColumnType;
  /** primary column becomes the card title on mobile */
  primary?: boolean;
}

export type UpdateMode = 'upsert' | 'patch';

export interface BackendMap {
  /** GET list path on the API (admin) */
  list: string;
  /** base path used for create + delete */
  base: string;
  /** how updates are sent: upsert=POST base, patch=PATCH base/:id */
  updateMode: UpdateMode;
  /** modelType string used by the recycle-bin endpoints */
  recycleModelType?: string;
}

export interface ResourceConfig {
  key: string;
  label: string;
  labelPlural: string;
  description: string;
  /** lucide icon name, mapped to a component in the client shell */
  icon: string;
  /** identifier field used to build update/delete URLs */
  idField: 'id' | 'slug';
  publishField?: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  sample: Record<string, unknown>[];
  backend: BackendMap;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const bool = (name: string, label: string): FieldDef => ({ name, label, type: 'boolean' });

export const RESOURCES: Record<string, ResourceConfig> = {
  portfolio: {
    key: 'portfolio',
    label: 'Portfolio Item',
    labelPlural: 'Portfolio',
    description: 'Showreels, campaigns and gallery work shown on the public site.',
    icon: 'Clapperboard',
    idField: 'id',
    publishField: 'isPublished',
    columns: [
      { name: 'title', label: 'Title', primary: true },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'mediaType', label: 'Media', type: 'badge' },
      { name: 'isPublished', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true, help: 'Unique URL segment, e.g. air-max-pulse' },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'mediaType', label: 'Media Type', type: 'select', options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
      ] },
      { name: 'mediaUrl', label: 'Media URL', type: 'image', required: true, full: true },
      { name: 'thumbnailUrl', label: 'Thumbnail URL', type: 'image', full: true },
      { name: 'videoStreamId', label: 'Video Stream ID', type: 'text' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'tags', label: 'Tags', type: 'tags', full: true },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      bool('isPublished', 'Published'),
    ],
    sample: [
      { id: 'p-1', title: 'Vogue Autumn Editorial Lookbook', slug: 'vogue-autumn-2026', category: 'Fashion', mediaType: 'video', isPublished: true },
      { id: 'p-2', title: 'Air Max Pulse Campaign', slug: 'air-max-pulse', category: 'Commercial', mediaType: 'video', isPublished: true },
      { id: 'p-3', title: 'Monochrome Studio Series', slug: 'monochrome-series', category: 'Portrait', mediaType: 'image', isPublished: false },
    ],
    backend: { list: '/cms/admin/portfolio', base: '/cms/admin/portfolio', updateMode: 'upsert', recycleModelType: 'portfolioItem' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  blog: {
    key: 'blog',
    label: 'Blog Post',
    labelPlural: 'Blog',
    description: 'Insights and articles published to the journal.',
    icon: 'Newspaper',
    idField: 'slug',
    columns: [
      { name: 'title', label: 'Title', primary: true },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'status', label: 'Status', type: 'badge' },
      { name: 'publishedAt', label: 'Published', type: 'date' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true },
      { name: 'content', label: 'Content', type: 'richtext', required: true, full: true },
      { name: 'coverImageUrl', label: 'Cover Image URL', type: 'image', full: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Scheduled', value: 'SCHEDULED' },
        { label: 'Archived', value: 'ARCHIVED' },
      ] },
      { name: 'tags', label: 'Tags', type: 'tags', full: true },
      { name: 'publishedAt', label: 'Published At', type: 'date' },
      { name: 'scheduledAt', label: 'Scheduled At', type: 'date' },
      { name: 'seoTitle', label: 'SEO Title', type: 'text', full: true },
      { name: 'seoDescription', label: 'SEO Description', type: 'textarea', full: true },
    ],
    sample: [
      { id: 'b-1', slug: 'evolution-virtual-production', title: 'The Evolution of Virtual Production', category: 'Technology', status: 'PUBLISHED', publishedAt: '2026-06-15' },
      { id: 'b-2', slug: 'casting-global-brands-2026', title: 'Casting for Global Brands', category: 'Casting', status: 'PUBLISHED', publishedAt: '2026-05-28' },
      { id: 'b-4', slug: 'color-grading-secrets', title: 'Color Grading Secrets', category: 'Post-Production', status: 'DRAFT', publishedAt: null },
    ],
    backend: { list: '/cms/admin/blog', base: '/cms/admin/blog', updateMode: 'upsert', recycleModelType: 'blogPost' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  courses: {
    key: 'courses',
    label: 'Course',
    labelPlural: 'Creator Courses',
    description: 'Add title, cover photo, price & description. Published courses appear on /become-a-youtuber.',
    icon: 'GraduationCap',
    idField: 'id',
    publishField: 'isPublished',
    columns: [
      { name: 'title', label: 'Title', primary: true },
      { name: 'categoryLabel', label: 'Category', type: 'badge' },
      { name: 'price', label: 'Price', type: 'text' },
      { name: 'isPublished', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true, help: 'Unique, e.g. course-youtuber' },
      { name: 'category', label: 'Category Key', type: 'select', options: [
        { label: 'YouTuber', value: 'YOUTUBER' },
        { label: 'Reeler', value: 'REELER' },
        { label: 'Creator', value: 'CREATOR' },
        { label: 'Influencer', value: 'INFLUENCER' },
        { label: 'Editing', value: 'EDITING' },
        { label: 'Monetization', value: 'MONETIZATION' },
      ] },
      { name: 'categoryLabel', label: 'Category Label', type: 'text' },
      { name: 'badgeColor', label: 'Badge CSS Classes', type: 'text', full: true, help: 'Tailwind classes, e.g. bg-red-600 text-white' },
      { name: 'level', label: 'Level', type: 'select', options: [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Creator', value: 'Creator' },
        { label: 'Pro Master', value: 'Pro Master' },
      ] },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'lessonsCount', label: 'Modules Count', type: 'number' },
      { name: 'rating', label: 'Rating (0-5)', type: 'number' },
      { name: 'enrolledCount', label: 'Enrolled Count', type: 'number' },
      { name: 'price', label: 'Price (display)', type: 'text', help: 'e.g. ₹4,999' },
      { name: 'numericPrice', label: 'Price (numeric)', type: 'number' },
      { name: 'originalPrice', label: 'Original Price', type: 'text' },
      { name: 'image', label: 'Cover Image', type: 'image', full: true },
      { name: 'trailerVideoUrl', label: 'Trailer Video URL', type: 'text', full: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'topics', label: 'What You Learn (topics)', type: 'tags', full: true },
      { name: 'resources', label: 'Included Resources', type: 'tags', full: true },
      { name: 'modules', label: 'Modules (JSON)', type: 'json', full: true, help: '[{ "title": "", "duration": "", "lessonsCount": 0 }]' },
      { name: 'instructorName', label: 'Instructor Name', type: 'text' },
      { name: 'instructorRole', label: 'Instructor Role', type: 'text' },
      { name: 'instructorAvatar', label: 'Instructor Avatar URL', type: 'image', full: true },
      { name: 'instructorBio', label: 'Instructor Bio', type: 'textarea', full: true },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      bool('isPublished', 'Published'),
    ],
    sample: [],
    backend: { list: '/cms/admin/courses', base: '/cms/admin/courses', updateMode: 'upsert', recycleModelType: 'course' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  testimonials: {
    key: 'testimonials',
    label: 'Testimonial',
    labelPlural: 'Testimonials',
    description: 'Client quotes and reviews, gated by approval + publish flags.',
    icon: 'Quote',
    idField: 'id',
    publishField: 'isPublished',
    columns: [
      { name: 'clientName', label: 'Client', primary: true },
      { name: 'clientCompany', label: 'Company', type: 'text' },
      { name: 'rating', label: 'Rating', type: 'rating' },
      { name: 'isApproved', label: 'Approved', type: 'boolean' },
      { name: 'isPublished', label: 'Live', type: 'boolean' },
    ],
    fields: [
      { name: 'clientName', label: 'Client Name', type: 'text', required: true },
      { name: 'clientTitle', label: 'Client Title', type: 'text' },
      { name: 'clientCompany', label: 'Client Company', type: 'text' },
      { name: 'clientPhoto', label: 'Client Photo URL', type: 'image', full: true },
      { name: 'content', label: 'Testimonial', type: 'textarea', required: true, full: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'videoUrl', label: 'Video URL', type: 'text', full: true },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      bool('isApproved', 'Approved'),
      bool('isPublished', 'Published'),
    ],
    sample: [
      { id: 't-1', clientName: 'Vikram Singhania', clientCompany: 'Vogue India', rating: 5, isApproved: true, isPublished: true },
      { id: 't-2', clientName: 'Aria Mehta', clientCompany: 'Nike APAC', rating: 5, isApproved: true, isPublished: true },
      { id: 't-3', clientName: 'Rohan Kapoor', clientCompany: 'Urban Footwear', rating: 5, isApproved: true, isPublished: false },
    ],
    backend: { list: '/cms/admin/testimonials', base: '/cms/admin/testimonials', updateMode: 'patch', recycleModelType: 'testimonial' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  team: {
    key: 'team',
    label: 'Team Member',
    labelPlural: 'Team',
    description: 'People featured on the About / Team section.',
    icon: 'Users',
    idField: 'id',
    publishField: 'isPublished',
    columns: [
      { name: 'name', label: 'Name', primary: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'isPublished', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'bio', label: 'Bio', type: 'textarea', full: true },
      { name: 'photoUrl', label: 'Photo URL', type: 'image', full: true },
      { name: 'socialLinks', label: 'Social Links (JSON)', type: 'json', full: true, help: '{ "instagram": "...", "linkedin": "..." }' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      bool('isPublished', 'Published'),
    ],
    sample: [
      { id: 'tm-1', name: 'Alok Verma', role: 'Executive Producer & Founder', isPublished: true },
      { id: 'tm-2', name: 'Siddharth Roy', role: 'Lead Creative Director', isPublished: true },
      { id: 'tm-4', name: 'Vikramaditya Bose', role: 'VFX Supervisor', isPublished: false },
    ],
    backend: { list: '/cms/admin/team', base: '/cms/admin/team', updateMode: 'upsert', recycleModelType: 'teamMember' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  faq: {
    key: 'faq',
    label: 'FAQ',
    labelPlural: 'FAQ',
    description: 'Frequently asked questions grouped by category.',
    icon: 'HelpCircle',
    idField: 'id',
    publishField: 'isPublished',
    columns: [
      { name: 'question', label: 'Question', primary: true },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'isPublished', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'question', label: 'Question', type: 'text', required: true, full: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true, full: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      bool('isPublished', 'Published'),
    ],
    sample: [
      { id: 'f-1', question: 'How do I book a studio shoot?', category: 'Booking', isPublished: true },
      { id: 'f-2', question: 'What is your revision policy?', category: 'Post-Production', isPublished: true },
    ],
    backend: { list: '/cms/admin/faq', base: '/cms/admin/faq', updateMode: 'upsert', recycleModelType: 'faqItem' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  services: {
    key: 'services',
    label: 'Service',
    labelPlural: 'Services',
    description: 'Offerings shown on the services & pricing pages.',
    icon: 'Layers',
    idField: 'id',
    publishField: 'isActive',
    columns: [
      { name: 'name', label: 'Name', primary: true },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'isActive', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'shortDesc', label: 'Short Description', type: 'text', full: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true },
      { name: 'basePrice', label: 'Base Price (paise)', type: 'number', required: true, help: 'Amount in paise (₹1 = 100)' },
      { name: 'imageUrl', label: 'Image URL', type: 'image', full: true },
      { name: 'features', label: 'Features (JSON)', type: 'json', full: true },
      { name: 'addOns', label: 'Add-ons (JSON)', type: 'json', full: true },
      { name: 'maxConcurrent', label: 'Max Concurrent / day', type: 'number' },
      { name: 'bufferMinutes', label: 'Buffer Minutes', type: 'number' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      bool('isActive', 'Active'),
    ],
    sample: [
      { id: 's-1', name: 'Commercial Production', slug: 'commercial-production', category: 'Video', isActive: true },
      { id: 's-2', name: 'Fashion Editorial', slug: 'fashion-editorial', category: 'Photography', isActive: true },
    ],
    backend: { list: '/cms/admin/services', base: '/cms/admin/services', updateMode: 'upsert', recycleModelType: 'service' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  announcements: {
    key: 'announcements',
    label: 'Announcement',
    labelPlural: 'Announcements',
    description: 'Site-wide banners and promotional notices.',
    icon: 'Megaphone',
    idField: 'id',
    publishField: 'isActive',
    columns: [
      { name: 'text', label: 'Text', primary: true },
      { name: 'type', label: 'Type', type: 'badge' },
      { name: 'isActive', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'text', label: 'Text', type: 'textarea', required: true, full: true },
      { name: 'type', label: 'Type', type: 'select', options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Promo', value: 'promo' },
      ] },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      bool('isActive', 'Active'),
    ],
    sample: [
      { id: 'a-1', text: 'Summer booking slots now open', type: 'promo', isActive: true },
    ],
    backend: { list: '/cms/admin/announcements', base: '/cms/admin/announcements', updateMode: 'upsert', recycleModelType: 'announcement' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  contacts: {
    key: 'contacts',
    label: 'Contact Submission',
    labelPlural: 'Contacts',
    description: 'Messages submitted through the public contact form.',
    icon: 'Mail',
    idField: 'id',
    columns: [
      { name: 'name', label: 'Name', primary: true },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'isRead', label: 'Read', type: 'boolean' },
      { name: 'createdAt', label: 'Received', type: 'date' },
    ],
    fields: [],
    sample: [
      { id: 'c-1', name: 'Priya Nair', email: 'priya@brand.com', subject: 'Campaign enquiry', isRead: false, createdAt: '2026-07-01' },
    ],
    backend: { list: '/cms/admin/contact', base: '/cms/admin/contact', updateMode: 'patch', recycleModelType: 'contactSubmission' },
    canCreate: false, canEdit: false, canDelete: true,
  },

  newsletter: {
    key: 'newsletter',
    label: 'Subscriber',
    labelPlural: 'Newsletter',
    description: 'Email addresses subscribed to the newsletter.',
    icon: 'AtSign',
    idField: 'id',
    columns: [
      { name: 'email', label: 'Email', primary: true },
      { name: 'isActive', label: 'Active', type: 'boolean' },
      { name: 'createdAt', label: 'Subscribed', type: 'date' },
    ],
    fields: [],
    sample: [
      { id: 'n-1', email: 'hello@studio.com', isActive: true, createdAt: '2026-06-20' },
    ],
    backend: { list: '/cms/admin/newsletter', base: '/cms/admin/newsletter', updateMode: 'patch' },
    canCreate: false, canEdit: false, canDelete: true,
  },

  castingCalls: {
    key: 'castingCalls',
    label: 'Casting Call',
    labelPlural: 'Casting Calls',
    description: 'Auditions, roles, and project opportunities for talent.',
    icon: 'Megaphone',
    idField: 'id',
    publishField: 'status',
    columns: [
      { name: 'title', label: 'Title', primary: true },
      { name: 'projectType', label: 'Type', type: 'badge' },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'compensationType', label: 'Compensation', type: 'badge' },
      { name: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'projectType', label: 'Project Type', type: 'select', required: true, options: [
        { label: 'Reel', value: 'Reel' },
        { label: 'Brand Shoot', value: 'Brand Shoot' },
        { label: 'Competition', value: 'Competition' },
        { label: 'Production', value: 'Production' },
      ] },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'location', label: 'Location / Studio', type: 'text' },
      { name: 'compensationType', label: 'Compensation Type', type: 'select', options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Unpaid', value: 'Unpaid' },
        { label: 'TBD', value: 'TBD' },
      ] },
      { name: 'compensationDetails', label: 'Compensation Details', type: 'text', full: true },
      { name: 'slotsAvailable', label: 'Slots Available', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Closed', value: 'CLOSED' },
        { label: 'Expired', value: 'EXPIRED' },
      ] },
      { name: 'description', label: 'Description & Requirements', type: 'textarea', required: true, full: true },
    ],
    sample: [
      { id: 'cc-1', title: 'Lead Model for Urban Fashion Campaign', projectType: 'Brand Shoot', city: 'Mumbai', compensationType: 'Paid', status: 'PUBLISHED' },
    ],
    backend: { list: '/cms/admin/casting-calls', base: '/cms/admin/casting-calls', updateMode: 'upsert', recycleModelType: 'castingCall' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  talents: {
    key: 'talents',
    label: 'Talent Profile',
    labelPlural: 'Talents',
    description: 'Registered actors, models, creators, and talent profiles.',
    icon: 'UserCheck',
    idField: 'id',
    publishField: 'status',
    columns: [
      { name: 'stageName', label: 'Stage Name / Name', primary: true },
      { name: 'experienceLevel', label: 'Experience', type: 'badge' },
      { name: 'status', label: 'Status', type: 'badge' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'stageName', label: 'Stage Name', type: 'text' },
      { name: 'experienceLevel', label: 'Experience Level', type: 'select', options: [
        { label: 'Fresher', value: 'Fresher' },
        { label: '1-3 Years', value: '1-3 Years' },
        { label: '3-5 Years', value: '3-5 Years' },
        { label: '5+ Years', value: '5+ Years' },
      ] },
      { name: 'status', label: 'Profile Status', type: 'select', options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Pending Review', value: 'PENDING_REVIEW' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Deactivated', value: 'DEACTIVATED' },
      ] },
      { name: 'bio', label: 'Bio / Summary', type: 'textarea', full: true },
      { name: 'reviewNote', label: 'Admin Review Note', type: 'textarea', full: true },
    ],
    sample: [
      { id: 't-101', stageName: 'Aarav Sharma', experienceLevel: '3-5 Years', status: 'ACTIVE' },
    ],
    backend: { list: '/cms/admin/talents', base: '/cms/admin/talents', updateMode: 'patch', recycleModelType: 'talentProfile' },
    canCreate: false, canEdit: true, canDelete: true,
  },

  bookings: {
    key: 'bookings',
    label: 'Booking',
    labelPlural: 'Bookings',
    description: 'Client service bookings, shoot schedules, and status tracking.',
    icon: 'Calendar',
    idField: 'id',
    publishField: 'status',
    columns: [
      { name: 'id', label: 'Booking ID', primary: true },
      { name: 'status', label: 'Status', type: 'badge' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'quoteAmount', label: 'Quote Amount (paise)', type: 'text' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'status', label: 'Status', type: 'select', options: [
        { label: 'Inquiry', value: 'INQUIRY' },
        { label: 'Quote Sent', value: 'QUOTE_SENT' },
        { label: 'Confirmed', value: 'CONFIRMED' },
        { label: 'Rescheduled', value: 'RESCHEDULED' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' },
      ] },
      { name: 'projectBrief', label: 'Project Brief', type: 'textarea', full: true },
      { name: 'specialRequirements', label: 'Special Requirements', type: 'textarea', full: true },
      { name: 'cancellationReason', label: 'Cancellation Reason', type: 'textarea', full: true },
    ],
    sample: [
      { id: 'bk-1', status: 'CONFIRMED', date: '2026-08-10', quoteAmount: '500000' },
    ],
    backend: { list: '/cms/admin/bookings', base: '/cms/admin/bookings', updateMode: 'patch' },
    canCreate: false, canEdit: true, canDelete: true,
  },

  media: {
    key: 'media',
    label: 'Media Asset',
    labelPlural: 'Media Gallery',
    description: 'Central library of uploaded images, videos, and documents.',
    icon: 'Folder',
    idField: 'id',
    columns: [
      { name: 'originalName', label: 'Filename / Title', primary: true },
      { name: 'mimeType', label: 'MIME Type', type: 'badge' },
      { name: 'size', label: 'Size (Bytes)', type: 'text' },
      { name: 'createdAt', label: 'Uploaded', type: 'date' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'originalName', label: 'Asset Title / Filename', type: 'text', required: true },
      { name: 'url', label: 'Media Asset URL', type: 'image', required: true, full: true },
      { name: 'mimeType', label: 'MIME Type', type: 'select', options: [
        { label: 'JPEG Image', value: 'image/jpeg' },
        { label: 'PNG Image', value: 'image/png' },
        { label: 'MP4 Video', value: 'video/mp4' },
        { label: 'PDF Document', value: 'application/pdf' },
      ] },
      { name: 'size', label: 'Size in Bytes (e.g. 1048576 = 1MB)', type: 'number' },
    ],
    sample: [
      { id: 'm-1', originalName: 'hero_production.jpg', mimeType: 'image/jpeg', size: 1048576, createdAt: '2026-07-01' },
    ],
    backend: { list: '/cms/admin/media', base: '/cms/admin/media', updateMode: 'upsert', recycleModelType: 'mediaAsset' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  featureFlags: {
    key: 'featureFlags',
    label: 'Feature Flag',
    labelPlural: 'Feature Flags',
    description: 'Toggle system features, maintenance mode, and experiments.',
    icon: 'Sliders',
    idField: 'id',
    publishField: 'enabled',
    columns: [
      { name: 'key', label: 'Flag Key', primary: true },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'environment', label: 'Env', type: 'badge' },
      { name: 'enabled', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'key', label: 'Flag Key', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', full: true },
      { name: 'environment', label: 'Environment', type: 'select', options: [
        { label: 'All', value: 'all' },
        { label: 'Development', value: 'development' },
        { label: 'Staging', value: 'staging' },
        { label: 'Production', value: 'production' },
      ] },
      bool('enabled', 'Enabled'),
    ],
    sample: [
      { id: 'ff-1', key: 'ENABLE_TALENT_REGISTRATION', description: 'Allow new talent registrations', environment: 'all', enabled: true },
    ],
    backend: { list: '/cms/admin/feature-flags', base: '/cms/admin/feature-flags', updateMode: 'upsert' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  salesLeads: {
    key: 'salesLeads',
    label: 'Sales Lead',
    labelPlural: 'Sales Leads & CRM',
    description: 'Track client inquiries, sales calls, social media leads, WhatsApp leads & pipeline stages.',
    icon: 'FolderKanban',
    idField: 'id',
    columns: [
      { name: 'clientName', label: 'Client Name', primary: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'source', label: 'Channel', type: 'badge' },
      { name: 'stage', label: 'Pipeline Stage', type: 'badge' },
      { name: 'estimatedValue', label: 'Value (Paise)', type: 'text' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'clientName', label: 'Client Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'source', label: 'Lead Channel', type: 'select', options: [
        { label: 'WhatsApp', value: 'WHATSAPP' },
        { label: 'Phone Call', value: 'CALL' },
        { label: 'Social Media (FB/IG)', value: 'SOCIAL_MEDIA' },
        { label: 'Client Referral', value: 'REFERRAL' },
        { label: 'Website Inquiry', value: 'WEBSITE' },
      ] },
      { name: 'stage', label: 'Pipeline Stage', type: 'select', options: [
        { label: 'New Lead', value: 'NEW' },
        { label: 'Contacted / Meeting Scheduled', value: 'CONTACTED' },
        { label: 'Requirement Gathered', value: 'REQUIREMENT_GATHERED' },
        { label: 'Proposal / Quote Sent', value: 'PROPOSAL_SENT' },
        { label: 'Negotiation', value: 'NEGOTIATION' },
        { label: 'Won / Confirmed Booking', value: 'WON' },
        { label: 'Lost', value: 'LOST' },
      ] },
      { name: 'estimatedValue', label: 'Estimated Project Value (in Paise)', type: 'number', help: 'e.g. 5000000 = ₹50,000' },
      { name: 'notes', label: 'Client Requirements & Call Notes', type: 'textarea', full: true },
    ],
    sample: [
      { id: 'sl-1', clientName: 'Ananya Sharma', phone: '+91 98765 43210', source: 'WHATSAPP', stage: 'NEW', estimatedValue: 15000000 },
      { id: 'sl-2', clientName: 'Rahul & Priya Wedding', phone: '+91 91234 56789', source: 'CALL', stage: 'PROPOSAL_SENT', estimatedValue: 35000000 },
    ],
    backend: { list: '/cms/admin/sales-leads', base: '/cms/admin/sales-leads', updateMode: 'upsert', recycleModelType: 'salesLead' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  salesTargets: {
    key: 'salesTargets',
    label: 'Sales Target',
    labelPlural: 'Sales Targets & Quotas',
    description: 'Monthly sales revenue targets and booking targets vs actual achieved.',
    icon: 'Sliders',
    idField: 'id',
    columns: [
      { name: 'year', label: 'Year', primary: true },
      { name: 'month', label: 'Month', type: 'badge' },
      { name: 'targetAmount', label: 'Target (Paise)', type: 'text' },
      { name: 'achievedAmount', label: 'Achieved (Paise)', type: 'text' },
      { name: 'targetBookings', label: 'Target Bookings', type: 'text' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'year', label: 'Year', type: 'number', required: true, help: 'e.g. 2026' },
      { name: 'month', label: 'Month Number (1-12)', type: 'number', required: true },
      { name: 'targetAmount', label: 'Target Revenue (in Paise)', type: 'number', required: true, help: 'e.g. 50000000 = ₹5,00,000' },
      { name: 'achievedAmount', label: 'Achieved Revenue (in Paise)', type: 'number' },
      { name: 'targetBookings', label: 'Target Bookings Count', type: 'number', required: true },
      { name: 'achievedBookings', label: 'Achieved Bookings Count', type: 'number' },
      { name: 'notes', label: 'Strategy / Quota Notes', type: 'textarea', full: true },
    ],
    sample: [
      { id: 'st-1', year: 2026, month: 7, targetAmount: 50000000, achievedAmount: 32000000, targetBookings: 15, achievedBookings: 10 },
    ],
    backend: { list: '/cms/admin/sales-targets', base: '/cms/admin/sales-targets', updateMode: 'upsert', recycleModelType: 'salesTarget' },
    canCreate: true, canEdit: true, canDelete: true,
  },

  referrals: {
    key: 'referrals',
    label: 'Referral',
    labelPlural: 'Referrals & Rewards',
    description: 'Track client referrals, referral codes, conversion status & rewards paid.',
    icon: 'Users',
    idField: 'id',
    columns: [
      { name: 'referrerName', label: 'Referrer Client', primary: true },
      { name: 'referredClientName', label: 'Referred Prospect', type: 'text' },
      { name: 'status', label: 'Status', type: 'badge' },
      { name: 'rewardAmount', label: 'Reward (Paise)', type: 'text' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'text', hidden: true },
      { name: 'referrerName', label: 'Referrer Name', type: 'text', required: true },
      { name: 'referrerEmail', label: 'Referrer Email', type: 'text', required: true },
      { name: 'referredClientName', label: 'Referred Client Name', type: 'text', required: true },
      { name: 'referredClientPhone', label: 'Referred Client Phone', type: 'text' },
      { name: 'status', label: 'Referral Status', type: 'select', options: [
        { label: 'Pending Inquiry', value: 'PENDING' },
        { label: 'Booking Confirmed', value: 'BOOKED' },
        { label: 'Reward Paid', value: 'REWARD_PAID' },
        { label: 'Expired', value: 'EXPIRED' },
      ] },
      { name: 'rewardAmount', label: 'Reward Amount (in Paise)', type: 'number' },
      { name: 'referralCode', label: 'Referral Code', type: 'text' },
    ],
    sample: [
      { id: 'ref-1', referrerName: 'Vikram Mehta', referrerEmail: 'vikram@example.com', referredClientName: 'Sunita Kapoor', status: 'BOOKED', rewardAmount: 200000, referralCode: 'VIKRAM2026' },
    ],
    backend: { list: '/cms/admin/referrals', base: '/cms/admin/referrals', updateMode: 'upsert', recycleModelType: 'referral' },
    canCreate: true, canEdit: true, canDelete: true,
  },
};


export const RESOURCE_KEYS = Object.keys(RESOURCES);

export function getResource(key: string): ResourceConfig | undefined {
  return RESOURCES[key];
}

/** Site-config keys editable on the settings page. */
export const CONFIG_KEYS: { key: string; label: string; description: string }[] = [
  { key: 'hero', label: 'Hero', description: 'Homepage hero heading, subheading and media.' },
  { key: 'intro', label: 'Intro', description: 'Homepage intro text and location data.' },
  { key: 'stats', label: 'Stats', description: 'Headline statistics band.' },
  { key: 'pricing', label: 'Pricing', description: 'Pricing tiers and packages.' },
  { key: 'navbar', label: 'Navbar', description: 'Primary navigation links.' },
  { key: 'footer', label: 'Footer', description: 'Footer columns, links and legal text.' },
  { key: 'seo', label: 'SEO', description: 'Default meta title, description and social image.' },
];
