import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/ui/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ProgressiveCounter,
  ProjectCardModalTrigger,
  HorizontalScroller,
  AccessibleFaqItem,
} from "@/components/home/HomeClientInteractions";
import { ProjectSpec } from "@/components/ui/CinematicViewerModal";
import {
  ArrowRight,
  Sparkles,
  Camera,
  Film,
  Video,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Globe,
  Sliders,
  Users,
  MapPin,
  Star,
  Quote,
} from "lucide-react";

export const revalidate = 300; // ISR cache for 5 minutes

/* ═══════════════════════════════════════════════════════════
   DEFAULT FALLBACK DATA — Never empty even on Render cold start
   ═══════════════════════════════════════════════════════════ */
const DEFAULT_HERO = {
  eyebrow: "Cinematic Studio · Est. 2018 · Mumbai",
  heading: "Stories built\nframe by frame.",
  subheading:
    "MP Production is Mumbai's premier cinematic creative house — high-fashion campaigns, commercial TVCs, automotive ad films, professional colour grading, and exclusive talent representation.",
  ctaText: "Explore Portfolio",
  ctaUrl: "/projects",
  secondaryCtaText: "Production Services",
  secondaryCtaUrl: "/services",
  mediaType: "video",
  posterUrl: "/assets/hero_cinematic_dark.webp",
  videoUrl:
    "https://res.cloudinary.com/dd29usied/video/upload/v1785067564/banners/apy8yqvmj3nbdq4gvikp.mp4",
};

const DEFAULT_STATS = [
  { n: 500, s: "+", label: "Productions Delivered" },
  { n: 1200, s: "+", label: "Verified Talent Roster" },
  { n: 40, s: "+", label: "Global Brand Partners" },
  { n: 18, s: "M+", label: "Audience Reach" },
];

const DEFAULT_SERVICES = [
  {
    id: "commercial-cinema",
    slug: "commercial-cinema",
    title: "Commercial Cinema & TVC Production",
    category: "Video",
    description:
      "Full-scale cinematic brand film and TV commercial production in Mumbai. We deploy ARRI Alexa 35 and RED V-Raptor 8K packages, anamorphic lenses, and master gaffer lighting to create television commercials with theatrical resonance.",
    features: [
      "ARRI Alexa 35 & RED 8K",
      "Cooke Anamorphic Prime Glass",
      "National & International Carnets",
    ],
    pricing: "₹5,00,000",
    imageUrl: "/assets/hero_cinematic_dark.webp",
  },
  {
    id: "pre-production",
    slug: "pre-production",
    title: "Pre-Production & Creative Direction",
    category: "Production",
    description:
      "Concept ideation, treatment writing, visual storyboards, location scouting across Mumbai and global destinations, and casting coordination for commercial films, product launches, and luxury brand lookbooks.",
    features: [
      "Visual Storyboarding & Moodboards",
      "Location Scouting Mumbai & Global",
      "Comprehensive Casting & Wardrobe",
    ],
    pricing: "₹1,50,000",
    imageUrl: "/assets/service_pre_production.webp",
  },
  {
    id: "high-fashion-lookbooks",
    slug: "high-fashion-lookbooks",
    title: "High-Fashion Lookbooks & Editorial Photography",
    category: "Photography",
    description:
      "Editorial campaigns, runway coverage, and haute couture lookbooks for designer labels and luxury fashion houses. Meticulous art direction, medium format resolution, and high-end beauty retouching.",
    features: [
      "Runway & Designer Lookbooks",
      "High-End Fashion Retouching",
      "Art Direction & Set Styling",
    ],
    pricing: "₹4,00,000",
    imageUrl: "/assets/fashion_lookbook.webp",
  },
  {
    id: "post-color-grade",
    slug: "post-color-grade",
    title: "Post-Production & Professional Colour Grading",
    category: "Post-Production",
    description:
      "Theatrical editing suites, Kodak 2383 35mm film emulation, Dolby Vision HDR mastering, and spatial sound design. Our senior colorists deliver distinct cinematic palettes for automotive ad films and brand narratives.",
    features: [
      "Dolby Vision HDR Mastering",
      "Kodak 2383 Film Emulation",
      "Theatrical 5.1 & Spatial Sound",
    ],
    pricing: "₹2,00,000",
    imageUrl: "/assets/service_post_production.webp",
  },
  {
    id: "casting-roster",
    slug: "casting-roster",
    title: "Talent Casting Agency & Representation",
    category: "Talent",
    description:
      "Direct representation and casting access to over 1,200 verified models, dramatic actors, voices, and creative technicians across India. Complete automated contracts, NDA protection, and transparent talent escrow.",
    features: [
      "1,200+ Verified Talent Roster",
      "Escrow Contract Protection",
      "Direct Casting Agency Access",
    ],
    pricing: "₹1,50,000",
    imageUrl: "/assets/service_casting.webp",
  },
  {
    id: "digital-campaigns",
    slug: "digital-campaigns",
    title: "Digital Campaigns, Product Launch Videos & Reels",
    category: "Marketing",
    description:
      "High-retention 9:16 social-first video suites, automotive ad films, product launch videos, and algorithm-tailored hooks designed to captivate audiences and maximize conversion across digital platforms.",
    features: [
      "9:16 Cinematic Social Suites",
      "High-Retention Hook Testing",
      "Omnichannel Deliverables",
    ],
    pricing: "₹2,50,000",
    imageUrl: "/assets/commercial_car_shoot.webp",
  },
];

const DEFAULT_PORTFOLIO = [
  {
    id: "vogue-campaign",
    title: "Vogue Autumn / Winter Showcase",
    category: "Fashion Film",
    client: "Vogue Italia",
    location: "Milan & Mumbai",
    coverImageUrl: "/assets/project-fashion.webp",
    description:
      "High-contrast 8K anamorphic cinematography capturing the pinnacle of luxury fashion with bespoke optical flares.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    director: "MP Production",
    camera: "ARRI Alexa 35",
    colorGrade: "Kodak 2383 Print Emulation",
  },
  {
    id: "porsche-gt3",
    title: "Velocity & Grace — GT3 Campaign",
    category: "Automotive Commercial",
    client: "Porsche Motorsport",
    location: "Stuttgart & Mumbai",
    coverImageUrl: "/assets/commercial_car_shoot.webp",
    description:
      "High-speed tracking vehicle cinematography and theatrical sound design for an automotive ad film.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    director: "MP Production",
    camera: "RED V-Raptor 8K",
    colorGrade: "Dolby Vision HDR",
  },
  {
    id: "luxe-lookbook",
    title: "Atelier Haute Couture Lookbook",
    category: "Brand Campaign",
    client: "Maison Privée",
    location: "Paris, France",
    coverImageUrl: "/assets/fashion_lookbook.webp",
    description:
      "35mm film emulation capturing ethereal fabric movement and haute couture textures for international fashion weeks.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    director: "MP Production",
    camera: "ARRI Mini LF",
    colorGrade: "Custom Film Print Stock",
  },
  {
    id: "nocturne-music",
    title: "Nocturne Symphony — Official Film",
    category: "Music Video",
    client: "Sony Music",
    location: "London & Mumbai",
    coverImageUrl: "/assets/project-music.webp",
    description:
      "Surrealistic cinematic narrative featuring atmospheric neon grading and choreographed performance.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    director: "MP Production",
    camera: "Sony FX9 Anamorphic",
    colorGrade: "Theatrical Rec.709",
  },
];

const DEFAULT_TALENT = [
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    talentType: "High Fashion Model",
    avatarUrl: "/assets/talent-model-1.webp",
    followers: "340K followers",
  },
  {
    id: "alex-vance",
    name: "Marcus Vance",
    talentType: "Director & Cinematographer",
    avatarUrl: "/assets/talent-model-2.webp",
    followers: "190K followers",
  },
  {
    id: "sophia-chen",
    name: "Sophia Chen",
    talentType: "Editorial Runway Model",
    avatarUrl: "/images/team-1.webp",
    followers: "420K followers",
  },
  {
    id: "damon-cross",
    name: "Damon Cross",
    talentType: "Lead Dramatic Actor",
    avatarUrl: "/images/team-2.webp",
    followers: "280K followers",
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    id: "test-1",
    clientName: "Vikramaditya Roy",
    clientTitle: "Head of Marketing",
    clientCompany: "Luxury Motorworks India",
    quote:
      "MP Production delivered our brand film with breathtaking precision. The anamorphic lenses, lighting, and Dolby Vision color grading elevated our vehicle launch to international theatrical standards.",
    rating: 5,
  },
  {
    id: "test-2",
    clientName: "Ananya Mehta",
    clientTitle: "Creative Director",
    clientCompany: "Atelier Haute Couture",
    quote:
      "Finding a Mumbai-based production house that understands both high-fashion aesthetics and technical execution is rare. Their team managed the entire lookbook shoot effortlessly from concept to final print.",
    rating: 5,
  },
  {
    id: "test-3",
    clientName: "Devraj Singhania",
    clientTitle: "VP Brand Communications",
    clientCompany: "OmniTech Consumer Brands",
    quote:
      "From pre-production storyboards to talent casting and multi-format delivery, MP Production handled our 8-city product launch campaign with impeccable professionalism and unmatched speed.",
    rating: 5,
  },
];

const DEFAULT_FAQS = [
  {
    question: "What film production services does MP Production offer in Mumbai?",
    answer:
      "MP Production is a full-service cinematic film production house in Mumbai. Our offerings encompass end-to-end commercial cinema (TVCs), brand films, product launch videos, high-fashion lookbooks, automotive ad films, professional colour grading (Dolby Vision and 35mm film emulation), and talent casting representation across India and internationally.",
  },
  {
    question: "What is your typical project timeline from concept to final delivery?",
    answer:
      "Commercial spots and product videos typically span 2 to 4 weeks from pre-production concepting to final color grade and sound mix. Full-scale brand film campaigns and multi-city automotive commercial shoots generally require 4 to 8 weeks depending on location permits, casting, and CGI or post-production requirements.",
  },
  {
    question: "What camera packages, lenses, and lighting equipment do you shoot on?",
    answer:
      "We shoot on industry-standard digital cinema systems including ARRI Alexa 35, ARRI Mini LF, and RED V-Raptor 8K. We pair these bodies with world-class glass such as Cooke Anamorphic, Leica Summilux, and Zeiss Supreme Primes, supported by full master gaffer lighting packages (Arri SkyPanels, Aputure Electro Storms, and Nanlux rigs).",
  },
  {
    question: "Can your production team execute international shoots outside India?",
    answer:
      "Yes. Our directors, cinematographers, and production managers hold active ATA carnet permits and international travel visas. We regularly mount shoots across Dubai, Europe, Southeast Asia, and North America while managing all international permits, local fixers, and crew logistics.",
  },
  {
    question: "How does talent casting and booking work with MP Production?",
    answer:
      "We maintain a roster of over 1,200 verified models, cinematic actors, voiceover talent, and directors. Clients can review talent portfolios, schedule auditions, and execute bookings with standardized automated contracts, NDA protection, and milestone-based escrow payments through our secure portal.",
  },
  {
    question: "Do you offer standalone post-production and color grading services?",
    answer:
      "Yes. Brands and external filmmakers can hire our post-production facilities independently for DaVinci Resolve Studio color grading (Dolby Vision certified), Kodak 2383 film print emulation, sound design (5.1 surround and spatial audio), visual effects, and high-retention 9:16 social suites.",
  },
  {
    question: "How can we get a free quote for our upcoming video or photo campaign?",
    answer:
      "You can contact our Mumbai production office directly via our contact form, email us at hello@mpproduction.com, or phone us at +91 831 053 1309. Share your creative brief, estimated schedule, and deliverable specs, and our producers will provide a comprehensive estimate within 24 hours.",
  },
  {
    question: "What deliverables are provided upon project completion?",
    answer:
      "Deliverables include master 4K/8K ProRes 4444 XQ files, broadcast-compliant Rec.709 and Dolby Vision HDR masters, web-optimized H.264/H.265 files, cutdowns (60s, 30s, 15s), and tailored 9:16 vertical reels with burned-in subtitles for social platforms.",
  },
];

/* ═══════════════════════════════════════════════════════════
   SERVER DATA FETCHING (ISR with safe fallback)
   ═══════════════════════════════════════════════════════════ */
async function fetchSafe(endpoint: string) {
  const apiBase =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "https://mp-backend-api.onrender.com";
  const url = `${apiBase}/api/v1${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // Return null so fallback data takes over gracefully
  }
}

async function getHomePageData() {
  const [
    heroRes,
    statsRes,
    servicesRes,
    portfolioRes,
    talentRes,
    testimonialsRes,
    faqRes,
  ] = await Promise.allSettled([
    fetchSafe("/cms/hero?page=home"),
    fetchSafe("/cms/stats"),
    fetchSafe("/cms/services?active=true"),
    fetchSafe("/cms/portfolio?featured=true&limit=6"),
    fetchSafe("/talent/featured"),
    fetchSafe("/cms/testimonials?published=true"),
    fetchSafe("/cms/faq?limit=8"),
  ]);

  const extractData = (result: PromiseSettledResult<any>) => {
    if (result.status === "fulfilled" && result.value) {
      return result.value.data || result.value;
    }
    return null;
  };

  const hero = extractData(heroRes) || DEFAULT_HERO;
  const stats = extractData(statsRes) || DEFAULT_STATS;
  const rawServices = extractData(servicesRes);
  const services =
    Array.isArray(rawServices) && rawServices.length > 0
      ? rawServices
      : DEFAULT_SERVICES;

  const rawPortfolio = extractData(portfolioRes);
  const portfolio =
    Array.isArray(rawPortfolio) && rawPortfolio.length > 0
      ? rawPortfolio
      : DEFAULT_PORTFOLIO;

  const rawTalent = extractData(talentRes);
  const talent =
    Array.isArray(rawTalent) && rawTalent.length > 0 ? rawTalent : DEFAULT_TALENT;

  const rawTestimonials = extractData(testimonialsRes);
  const testimonials =
    Array.isArray(rawTestimonials) && rawTestimonials.length > 0
      ? rawTestimonials
      : DEFAULT_TESTIMONIALS;

  const rawFaqs = extractData(faqRes);
  const faqs =
    Array.isArray(rawFaqs) && rawFaqs.length > 0 ? rawFaqs : DEFAULT_FAQS;

  return { hero, stats, services, portfolio, talent, testimonials, faqs };
}

/* ═══════════════════════════════════════════════════════════
   SERVER HOMEPAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default async function HomePage() {
  const { hero, stats, services, portfolio, talent, testimonials, faqs } =
    await getHomePageData();

  // Heading markup with guaranteed space
  const headingText = hero?.heading || DEFAULT_HERO.heading;
  const headingLines = headingText.split("\n");

  const formattedFaqsForSchema = faqs.map((f: any) => ({
    question: f.question || f.q || f.title || "Question",
    answer: f.answer || f.a || f.desc || f.description || "",
  }));

  const formattedServicesForSchema = services.map((s: any) => ({
    title: s.title || s.name || "Production Service",
    description: s.description || s.shortDesc || "",
    pricing: s.pricing || "Custom Quote",
    slug: s.slug || "",
  }));

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand selection:text-white overflow-x-clip font-sans transition-colors duration-300">
      {/* ── JSON-LD Structured Data in Server HTML ── */}
      <JsonLd
        faqs={formattedFaqsForSchema}
        services={formattedServicesForSchema}
      />

      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
         HERO SECTION — Single Keyword-Supportive H1 & Full Bleed Media
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden isolate pb-0 px-0 sm:px-4 lg:px-6">
        <div className="absolute inset-0 top-0 bottom-0 -z-10 bg-[#050507] overflow-hidden select-none">
          {hero.mediaType === "image" ? (
            <Image
              src={hero.posterUrl || "/assets/hero_cinematic_dark.webp"}
              alt="MP Production - Cinematic Film & Brand Production Mumbai"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={hero.posterUrl || "/assets/hero_cinematic_dark.webp"}
            >
              <source src={hero.videoUrl || DEFAULT_HERO.videoUrl} type="video/mp4" />
            </video>
          )}

          {/* Vignette Gradients for Contrast & Readability */}
          <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-1 pointer-events-none" />
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none bg-gradient-to-t from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="mx-auto max-w-7xl w-full px-6 sm:px-10 pb-16 pt-36 sm:pt-44 md:pt-48 z-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse shadow-[0_0_10px_#eb3d26]" />
              <span className="text-[11px] sm:text-xs font-mono font-medium tracking-[0.25em] uppercase text-white/90">
                {hero.eyebrow || DEFAULT_HERO.eyebrow}
              </span>
            </div>
          </div>

          {/* Single Primary H1 with Verified Space */}
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.2rem] text-white leading-[1.05] sm:leading-[0.98] tracking-tight drop-shadow-xl break-normal">
              {headingLines[0]}{" "}
              {headingLines[1] ? (
                <span className="block sm:inline">{headingLines[1]}</span>
              ) : null}
            </h1>
          </div>

          {/* Subheading with Primary SEO Keyword Support */}
          <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-xl text-white/85 leading-relaxed font-normal drop-shadow-md">
            {hero.subheading || DEFAULT_HERO.subheading}
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 z-20 relative">
            <Link
              href={hero.ctaUrl || "/projects"}
              className="group inline-flex items-center gap-3 rounded-full bg-brand hover:bg-[#d63520] px-8 py-3.5 sm:px-9 sm:py-4 text-sm sm:text-base font-bold tracking-wide text-white transition-all duration-300 shadow-[0_0_35px_rgba(235,61,38,0.45)] cursor-pointer"
            >
              <span>{hero.ctaText || "Explore Portfolio"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={hero.secondaryCtaUrl || "/services"}
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.08] hover:bg-white/[0.16] hover:border-white/30 text-white px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold tracking-wide backdrop-blur-md transition-all cursor-pointer shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-brand fill-brand" />
              <span>{hero.secondaryCtaText || "Production Services"}</span>
            </Link>

            <Link
              href="/join/talent"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white px-6 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-medium tracking-wide backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Register as Talent</span>
            </Link>
          </div>

          {/* ── Stat Strip with Raw HTML Final Numbers (Never "0+") ── */}
          <div className="mt-14 sm:mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((item: any, idx: number) => {
              const defaultItem = DEFAULT_STATS[idx] || DEFAULT_STATS[0];
              const label = item?.label || defaultItem.label;
              let numVal = defaultItem.n;
              let suffixVal = defaultItem.s;

              if (item?.n !== undefined) {
                numVal = Number(item.n) || defaultItem.n;
                suffixVal = item.s || defaultItem.s;
              } else if (typeof item?.value === "string") {
                const rawVal = item.value.trim();
                const num = parseInt(rawVal.replace(/[^0-9]/g, ""), 10);
                if (!isNaN(num) && num > 0) numVal = num;
                suffixVal = rawVal.replace(/[0-9,\s]/g, "") || "+";
              } else if (typeof item?.value === "number" && item.value > 0) {
                numVal = item.value;
              }

              return (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-l border-white/10 pl-4"
                >
                  <span className="text-2xl sm:text-4xl font-display font-bold text-white drop-shadow-sm">
                    <ProgressiveCounter n={numVal} suffix={suffixVal} />
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/70 font-mono tracking-widest uppercase">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         ABOUT / WHY US SECTION — Editorial Authority
         ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-20 lg:py-28 border-t border-border">
        <Reveal direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <span className="h-[2px] w-16 bg-brand block mb-6 shadow-[0_0_12px_#eb3d26]" />
              <h2 className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] text-foreground font-bold leading-[1.08] tracking-tight">
                About MP Production —{" "}
                <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-brand">
                  Cinematic Film & Brand Production in Mumbai.
                </span>
              </h2>
            </div>

            <div className="space-y-5 lg:pt-2">
              <p className="text-base sm:text-xl text-foreground/90 leading-relaxed font-normal">
                Founded in Mumbai, MP Production operates at the intersection of
                high-art cinematography, theatrical storytelling, and modern
                digital brand strategy. We specialize in producing luxury fashion
                lookbooks, national automotive ad films, commercial TVCs, and
                high-retention digital suites that command attention and drive
                cultural relevance.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
                With fully equipped production stages in Mumbai and active ATA
                carnets for international filming across the UK, Europe, UAE,
                and North America, we manage every facet of production from
                ideation, location scouting, and talent casting to ARRI 35
                principal photography, Dolby Vision HDR colour grading, and
                sound design.
              </p>

              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-brand">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Mumbai Studio
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Western India hub with sound stages & post suites.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-brand">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Global Carnets
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rapid international deployment across Europe & Asia.
                  </p>
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 text-brand">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      1,200+ Talent
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verified casting roster with escrow protection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         THE THREE ACTS OF VISUAL EXCELLENCE — Methodology
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background border-t border-border overflow-hidden isolate">
        <div className="max-w-7xl mx-auto space-y-14 sm:space-y-16">
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold tracking-[0.25em] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cinematic Principles</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                The Three Acts of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-rose-500 to-amber-400">
                  Visual Excellence
                </span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto font-normal">
                Our signature methodology for crafting campaigns that capture
                imagination and command culture.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                act: "ACT I",
                tag: "OPTICAL PRECISION",
                label: "The Vision",
                title: "Act I: The Vision & Visual Architecture",
                body: "We look beyond the surface, finding the exact optical composition, treatment narrative, and emotional resonance that moves the needle for luxury brands and modern cinema.",
                image: "/images/services-lighting.webp",
              },
              {
                act: "ACT II",
                tag: "THEATRICAL RIGOR",
                label: "The Craft",
                title: "Act II: The Craft & On-Set Execution",
                body: "Master lighting, anamorphic framing, and rhythm — synchronized on set with ARRI and RED systems to deliver unmatched texture, scale, and emotional intimacy.",
                image: "/images/about-bts.webp",
              },
              {
                act: "ACT III",
                tag: "TIMELESS IMPACT",
                label: "The Legacy",
                title: "Act III: The Legacy & Dolby Mastering",
                body: "Films, campaigns, and lookbooks that echo in the culture long after launch. Kodak 2383 film emulation and Dolby Vision mastering immortalize your story.",
                image: "/images/careers-meeting.webp",
              },
            ].map((item, idx) => (
              <Reveal key={idx} direction="up" delay={idx * 0.15}>
                <div className="group relative rounded-[2rem] overflow-hidden border border-border bg-card backdrop-blur-xl hover:border-brand/60 transition-all duration-700 flex flex-col justify-between min-h-[460px] sm:min-h-[500px] shadow-xl">
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.38] group-hover:brightness-[0.48]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent z-10" />
                  </div>

                  <div className="relative z-20 p-7 sm:p-8 flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] bg-brand text-white shadow-[0_0_15px_rgba(235,61,38,0.5)]">
                      {item.act}
                    </span>
                    <span className="text-xs font-mono tracking-widest text-white/60 uppercase">
                      {item.tag}
                    </span>
                  </div>

                  <div className="relative z-20 p-7 sm:p-8 pt-0 space-y-3">
                    <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-brand block">
                      {item.label}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug drop-shadow-sm group-hover:text-brand transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed font-normal">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SERVICES SECTION — 6 Rich Services with Proper H2 -> H3
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-background border-t border-border overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[2px] w-8 bg-brand" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
                  Production Capabilities
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display text-foreground font-bold tracking-tight">
                Cinematic Production Services in Mumbai
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <HorizontalScroller targetId="services-slider-container" />
              <Link
                href="/services"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-brand transition-colors ml-2"
              >
                <span>View All ({services.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div
            id="services-slider-container"
            className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory -mx-6 px-6 sm:-mx-10 sm:px-10"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {services.map((s: any, idx: number) => {
              const serviceName = s.title || s.name || `Service 0${idx + 1}`;
              const desc = s.description || s.shortDesc || "";
              const category = s.category || "Production";
              const rawTags = s.features || s.tags || [];
              const tags = Array.isArray(rawTags)
                ? rawTags
                : typeof rawTags === "string"
                ? (() => {
                    try {
                      return JSON.parse(rawTags);
                    } catch {
                      return [];
                    }
                  })()
                : [];
              const priceText = s.pricing || "Custom Quote";
              const imageSrc =
                s.imageUrl ||
                (idx === 0
                  ? "/assets/hero_cinematic_dark.webp"
                  : idx === 1
                  ? "/assets/service_pre_production.webp"
                  : idx === 2
                  ? "/assets/fashion_lookbook.webp"
                  : idx === 3
                  ? "/assets/service_post_production.webp"
                  : idx === 4
                  ? "/assets/service_casting.webp"
                  : "/assets/commercial_car_shoot.webp");

              return (
                <div
                  key={s.id || idx}
                  className="shrink-0 w-[290px] sm:w-[360px] md:w-[400px] snap-start rounded-[2rem] border border-border bg-card hover:border-brand/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                    <Image
                      src={imageSrc}
                      alt={serviceName}
                      fill
                      sizes="(max-width: 768px) 300px, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-brand text-white shadow-md">
                        {category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-brand transition-colors leading-snug">
                        {serviceName}
                      </h3>
                      {desc && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed font-normal">
                          {desc}
                        </p>
                      )}
                    </div>

                    {tags.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        {tags.slice(0, 3).map((f: string, fIdx: number) => (
                          <div
                            key={fIdx}
                            className="flex items-center gap-2 text-xs text-foreground/80"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                          Starting at
                        </span>
                        <strong className="text-sm sm:text-base font-mono font-bold text-brand">
                          {priceText}
                        </strong>
                      </div>
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:text-brand transition-colors"
                      >
                        <span>Book Brief</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         PRODUCTION PROCESS — 3 Stages (Pre, Production, Post)
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold tracking-[0.25em] uppercase">
                <Clock className="w-3.5 h-3.5" />
                <span>End-to-End Workflow</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                Our Three-Stage Production Process
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto font-normal">
                How our Mumbai studio turns high-concept brand briefs into
                flawless cinematic campaigns on schedule and within budget.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal direction="up" delay={0.1}>
              <div className="border border-border rounded-3xl p-8 bg-surface space-y-4 hover:border-brand/60 transition-all duration-300">
                <span className="text-3xl font-display font-bold text-brand">
                  01
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Pre-Production & Visual Concept
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We translate brand objectives into detailed shooting
                  treatments, frame-by-frame visual storyboards, location permits
                  across India, wardrobe styling, and curated talent auditions
                  from our 1,200+ roster.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground/80 space-y-1">
                  <div>✓ Creative Direction & Scriptwriting</div>
                  <div>✓ Location Scouting Mumbai & Pan-India</div>
                  <div>✓ Talent Casting & Wardrobe Fittings</div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.2}>
              <div className="border border-border rounded-3xl p-8 bg-surface space-y-4 hover:border-brand/60 transition-all duration-300">
                <span className="text-3xl font-display font-bold text-brand">
                  02
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Principal Photography & Set Execution
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our cinematographers, directors, and gaffers bring the script
                  to life using ARRI Alexa 35 and RED 8K camera packages,
                  precision vehicle tracking rigs, and high-speed motion control
                  for flawless takes.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground/80 space-y-1">
                  <div>✓ Master Gaffer & Lighting Design</div>
                  <div>✓ 8K Anamorphic Precision Lenses</div>
                  <div>✓ Live Client Video Village Stream</div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.3}>
              <div className="border border-border rounded-3xl p-8 bg-surface space-y-4 hover:border-brand/60 transition-all duration-300">
                <span className="text-3xl font-display font-bold text-brand">
                  03
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Post-Production & Dolby Vision Mastering
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In our Mumbai post-production suites, senior colorists and
                  sound engineers master your film with custom Kodak 35mm film
                  emulation, Dolby Vision HDR, spatial audio mixes, and multi-ratio
                  social deliverables.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground/80 space-y-1">
                  <div>✓ Theatrical Editing & VFX Finishing</div>
                  <div>✓ Dolby Vision Certified Color Grade</div>
                  <div>✓ 16:9, 1:1 & 9:16 Omnichannel Exports</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         INDUSTRIES SERVED — Broad Depth & Context
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                Industries & Sectors We Produce For
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto font-normal">
                Tailored cinematic production designed to speak the authentic
                visual language of diverse market sectors.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Luxury Fashion & Lookbooks",
                desc: "High-contrast editorial lookbooks, designer couture campaigns, and Paris/Milan fashion week films.",
              },
              {
                title: "Automotive & Electric Mobility",
                desc: "High-speed pursuit vehicle filming, tracking shots, and launch TVCs for sports and EV brands.",
              },
              {
                title: "Consumer Tech & Product Launches",
                desc: "Macro-lens optics, 3D product integration, and high-conversion launch videos for global tech brands.",
              },
              {
                title: "Music, Entertainment & OTT",
                desc: "Atmospheric narrative music videos, artist showreels, and theatrical trailers for streaming platforms.",
              },
            ].map((sector, idx) => (
              <Reveal key={idx} direction="up" delay={idx * 0.1}>
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-brand/50 transition-all duration-300 space-y-2">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {sector.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {sector.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         FEATURED PRODUCTIONS — Portfolio
         ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-24 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[2px] w-8 bg-brand" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
                Selected Work
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold leading-tight">
              Featured Cinematic Productions
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-sm font-bold text-muted-foreground hover:text-brand transition-colors flex items-center gap-2 font-mono uppercase tracking-wider"
          >
            <span>View All ({portfolio.length})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {portfolio.map((p: any, i: number) => {
            const projectSpec: ProjectSpec = {
              title: p.title || "Cinematic Project",
              category: p.category || "Commercial",
              client: p.client || "MP Production",
              year: "2026",
              description: p.description || "",
              videoUrl: p.videoUrl || DEFAULT_PORTFOLIO[0].videoUrl,
              coverImage: p.coverImageUrl || "/assets/project-fashion.webp",
              camera: p.camera || "ARRI Alexa 35",
              colorGrade: p.colorGrade || "Dolby Vision HDR",
            };

            if (i === 0) {
              return (
                <div key={p.id || i} className="md:col-span-12">
                  <ProjectCardModalTrigger project={projectSpec}>
                    <div className="group relative overflow-hidden rounded-[2rem] cursor-pointer h-[420px] sm:h-[500px] border border-border hover:border-brand/60 transition-all duration-700 shadow-2xl">
                      <Image
                        src={projectSpec.coverImage || "/assets/project-fashion.webp"}
                        alt={projectSpec.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 90vw"
                        className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] brightness-90 group-hover:brightness-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 sm:p-12 z-10 max-w-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.2em] uppercase text-brand">
                            {projectSpec.category}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                          <span className="text-xs sm:text-sm font-mono font-medium uppercase text-white/80">
                            {projectSpec.client}
                          </span>
                        </div>
                        <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-bold leading-tight group-hover:text-brand transition-colors">
                          {projectSpec.title}
                        </h3>
                        <p className="mt-4 text-sm sm:text-base text-white/80 font-medium flex items-center gap-2">
                          <span>View film details</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </p>
                      </div>
                    </div>
                  </ProjectCardModalTrigger>
                </div>
              );
            }

            return (
              <div key={p.id || i} className="md:col-span-4">
                <ProjectCardModalTrigger project={projectSpec}>
                  <div className="group relative overflow-hidden rounded-[1.75rem] cursor-pointer h-[320px] sm:h-[360px] border border-border hover:border-brand/60 transition-all duration-700 shadow-2xl">
                    <Image
                      src={projectSpec.coverImage || "/assets/fashion_lookbook.webp"}
                      alt={projectSpec.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 z-10">
                      <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-brand block mb-2">
                        {projectSpec.category}
                      </span>
                      <h3 className="font-display text-xl sm:text-2xl text-white font-bold leading-tight group-hover:text-brand transition-colors">
                        {projectSpec.title}
                      </h3>
                    </div>
                  </div>
                </ProjectCardModalTrigger>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         FEATURED TALENT ROSTER — Verified Talent
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-background border-t border-border overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[2px] w-8 bg-brand" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
                  Agency Representation
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold leading-tight">
                Featured Talent Roster
              </h2>
            </div>
            <Link
              href="/talent"
              className="text-sm font-bold text-muted-foreground hover:text-brand transition-colors flex items-center gap-2 font-mono uppercase tracking-wider"
            >
              <span>Explore Roster</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {talent.map((t: any, idx: number) => {
              const name =
                t.name ||
                (t.user
                  ? `${t.user.firstName || ""} ${t.user.lastName || ""}`.trim()
                  : "Verified Talent");
              const talentType =
                t.talentType ||
                (Array.isArray(t.talentTypes)
                  ? t.talentTypes[0]
                  : "Actor / Model");
              const avatar =
                t.avatarUrl ||
                t.user?.avatarUrl ||
                (idx === 0
                  ? "/assets/talent-model-1.webp"
                  : idx === 1
                  ? "/assets/talent-model-2.webp"
                  : idx === 2
                  ? "/images/team-1.webp"
                  : "/images/team-2.webp");
              const followers =
                t.followers ||
                (t.instagramFollowers
                  ? `${Math.round(t.instagramFollowers / 1000)}K followers`
                  : "Verified Agency Roster");

              return (
                <div
                  key={t.id || idx}
                  className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-brand/60 transition-all duration-300 shadow-md"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                    <Image
                      src={avatar}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 z-10 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-brand tracking-wider font-bold block">
                        {talentType}
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-brand transition-colors leading-tight">
                        {name}
                      </h3>
                      <p className="text-[11px] text-white/70 font-mono">
                        {followers}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CLIENT TESTIMONIALS & TRUST BADGES
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold tracking-[0.25em] uppercase">
                <Award className="w-3.5 h-3.5" />
                <span>Client Validation</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                Client Testimonials & Industry Trust
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto font-normal">
                What marketing heads, automotive leads, and fashion creative
                directors say about partnering with MP Production.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test: any, idx: number) => (
              <Reveal key={test.id || idx} direction="up" delay={idx * 0.1}>
                <div className="border border-border rounded-3xl p-8 bg-surface space-y-4 hover:border-brand/60 transition-all duration-300 shadow-md flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-brand/30" />
                    <p className="text-sm sm:text-base text-foreground/90 leading-relaxed italic">
                      &ldquo;{test.quote || test.content}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    <h3 className="font-display text-base font-bold text-foreground">
                      {test.clientName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {test.clientTitle} · {test.clientCompany}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Industry Trust Strip (Awards & Credentials with TODO Placeholders) */}
          <div className="mt-16 pt-12 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <Award className="w-6 h-6 text-brand mx-auto" />
              <div className="text-xs font-mono font-bold uppercase text-foreground">
                Cinematic Excellence
              </div>
              <p className="text-[11px] text-muted-foreground">
                ARRI Certified Crew · Mumbai
              </p>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-6 h-6 text-brand mx-auto" />
              <div className="text-xs font-mono font-bold uppercase text-foreground">
                Escrow Protected
              </div>
              <p className="text-[11px] text-muted-foreground">
                Secure Automated Contracts
              </p>
            </div>
            <div className="space-y-1">
              <Globe className="w-6 h-6 text-brand mx-auto" />
              <div className="text-xs font-mono font-bold uppercase text-foreground">
                International Permits
              </div>
              <p className="text-[11px] text-muted-foreground">
                Active ATA Carnet Fleet
              </p>
            </div>
            <div className="space-y-1">
              <Sliders className="w-6 h-6 text-brand mx-auto" />
              <div className="text-xs font-mono font-bold uppercase text-foreground">
                Dolby Vision HDR
              </div>
              <p className="text-[11px] text-muted-foreground">
                Certified Theatrical Suites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         FREQUENTLY ASKED QUESTIONS — Raw HTML H3 Questions (No skipped levels)
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-background border-t border-border">
        <div className="mx-auto max-w-4xl px-6 sm:px-10">
          <Reveal direction="up">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold tracking-[0.25em] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
                Detailed answers regarding film production timelines, camera
                packages, talent casting, and deliverables in Mumbai.
              </p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {faqs.map((f: any, idx: number) => {
              const question = f.question || f.q || f.title || "";
              const answer = f.answer || f.a || f.desc || f.description || "";
              return (
                <AccessibleFaqItem
                  key={f.id || idx}
                  question={question}
                  answer={answer}
                  defaultOpen={idx === 0}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CONTACT CTA — Full Bleed Gradient with Free Quote
         ═══════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 pt-8 bg-background">
        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] py-16 md:py-24 bg-gradient-to-br from-card via-surface to-card border border-border shadow-2xl">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/20 via-brand/5 to-transparent transform-gpu" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/15 via-brand/2 to-transparent transform-gpu" />

          <div className="relative mx-auto max-w-4xl px-6 sm:px-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-mono font-medium tracking-[0.2em] uppercase text-foreground border border-border backdrop-blur-md bg-surface">
              <span className="inline-block h-2 w-2 rounded-full bg-brand animate-pulse shadow-[0_0_8px_#eb3d26]" />
              Now Booking Q4 2026 &amp; Q1 2027 Productions
            </div>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-foreground leading-[0.98] tracking-tight">
              Got a vision to build?{" "}
              <span className="italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-brand">
                Let&apos;s roll cameras.
              </span>
            </h2>

            <p className="text-base sm:text-xl text-muted-foreground max-w-xl mx-auto font-normal">
              From commercial cinema and automotive ad films to high-fashion
              lookbooks and talent casting, get a free custom production quote
              from our Mumbai producers.
            </p>

            <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2.5 rounded-full bg-brand hover:bg-[#d63520] px-8 py-4 text-sm sm:text-base font-bold text-white transition-all duration-300 shadow-[0_0_35px_rgba(235,61,38,0.4)] cursor-pointer"
              >
                <span>Request a Free Quote</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-7 py-4 text-sm sm:text-base font-semibold text-foreground hover:border-brand/50 transition-all cursor-pointer"
              >
                <span>Production Rates</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Engine Freshness & Studio Transparency ── */}
      <div className="text-center py-6 text-xs font-mono text-muted-foreground border-t border-border">
        Last updated: October 2026 · Global Production Headquarters · Mumbai,
        India · MP Production
      </div>
    </div>
  );
}
