"use client";

import { Navbar } from "@/components/ui/Navbar";
import { HoverFooter as Footer } from "@/components/ui/hover-footer";
import { Reveal } from "@/components/ui/Reveal";
import { CinematicViewerModal, ProjectSpec } from "@/components/ui/CinematicViewerModal";
import { CinematicTestimonial } from "@/components/ui/cinematic-testimonial";
import { MagneticButton } from "@/components/motion/MagneticButton";
import DecryptedText from "@/components/motion/DecryptedText";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchAPI } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Play,
  Camera,
  Video,
  Sparkles,
  Film,
  Users,
  Megaphone,
  Star,
  Quote,
  Award,
  Zap,
  CheckCircle2,
  Sliders,
  Globe,
  Compass,
  ArrowUpRight,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════
   Counter Hook
   ═══════════════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min((t - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(eased * target));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, value };
}

function Counter({ n, suffix = "" }: { n: number; suffix?: string }) {
  const { ref, value } = useCountUp(n);
  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Icons Helper
   ═══════════════════════════════════════════════════════════ */
const ICON_MAP: Record<string, any> = {
  Video,
  Camera,
  Film,
  Sparkles,
  Megaphone,
  Users,
  Sliders,
};

function getServiceIcon(iconName?: string) {
  if (!iconName) return Sparkles;
  return ICON_MAP[iconName] || Sparkles;
}

/* ═══════════════════════════════════════════════════════════
   DEFAULT FALLBACK DATA FOR INSTANT 60FPS RENDERING
   ═══════════════════════════════════════════════════════════ */
const DEFAULT_PORTFOLIO = [
  {
    id: "vogue-campaign",
    title: "Vogue Autumn / Winter Showcase",
    category: "Fashion Film",
    client: "Vogue Italia",
    location: "Milan, Italy",
    coverImageUrl: "/assets/project-fashion.webp",
    description: "High-contrast 8K anamorphic cinematography capturing the pinnacle of Milan Fashion Week.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "porsche-gt3",
    title: "Velocity & Grace — GT3 Campaign",
    category: "Commercial",
    client: "Porsche Motorsport",
    location: "Stuttgart, Germany",
    coverImageUrl: "/assets/commercial_car_shoot.webp",
    description: "High-speed tracking vehicle cinematography and theatrical sound design.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "luxe-lookbook",
    title: "Atelier Haute Couture Lookbook",
    category: "Brand Campaign",
    client: "Maison Privée",
    location: "Paris, France",
    coverImageUrl: "/assets/fashion_lookbook.webp",
    description: "Kodak 2383 35mm film emulation capturing ethereal fabric movement and haute couture textures.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "nocturne-music",
    title: "Nocturne Symphony — Official Film",
    category: "Music Video",
    client: "Sony Music",
    location: "London, UK",
    coverImageUrl: "/assets/project-music.webp",
    description: "Surrealistic cinematic narrative featuring atmospheric neon grading and choreographed performance.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
];

const DEFAULT_TALENT = [
  {
    id: "elena-rostova",
    slug: "elena-rostova",
    user: { firstName: "Elena", lastName: "Rostova", avatarUrl: "/assets/talent-model-1.webp" },
    talentTypes: ["High Fashion Model"],
    instagramFollowers: 340000,
  },
  {
    id: "alex-vance",
    slug: "alex-vance",
    user: { firstName: "Marcus", lastName: "Vance", avatarUrl: "/assets/talent-model-2.webp" },
    talentTypes: ["Director & Cinematographer"],
    instagramFollowers: 190000,
  },
  {
    id: "sophia-chen",
    slug: "sophia-chen",
    user: { firstName: "Sophia", lastName: "Chen", avatarUrl: "/images/team-1.webp" },
    talentTypes: ["Editorial Model"],
    instagramFollowers: 420000,
  },
  {
    id: "damon-cross",
    slug: "damon-cross",
    user: { firstName: "Damon", lastName: "Cross", avatarUrl: "/images/team-2.webp" },
    talentTypes: ["Lead Actor"],
    instagramFollowers: 280000,
  },
];

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [hero, setHero] = useState<any>(null);
  const [intro, setIntro] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>(DEFAULT_PORTFOLIO);
  const [talent, setTalent] = useState<any[]>(DEFAULT_TALENT);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModalProject, setActiveModalProject] = useState<ProjectSpec | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const safeFetch = (endpoint: string) =>
      fetchAPI(endpoint, { cache: "no-store", signal: controller.signal }).catch(() => null);

    Promise.all([
      safeFetch("/cms/hero?page=home"),
      safeFetch("/cms/config/intro"),
      safeFetch("/cms/stats"),
      safeFetch("/cms/services?active=true"),
      safeFetch("/cms/portfolio?featured=true&limit=6"),
      safeFetch("/talent/featured"),
      safeFetch("/cms/testimonials?published=true"),
      safeFetch("/cms/faq?limit=8"),
      safeFetch("/cms/courses?limit=4"),
    ])
      .then(([heroRes, introRes, statsRes, servRes, portRes, talentRes, testRes, faqRes, courseRes]) => {
        if (!isMounted) return;
        if (heroRes) setHero(heroRes.data || heroRes);
        if (introRes) setIntro(introRes.data || introRes);
        if (statsRes) setStats(statsRes.data || statsRes);
        if (servRes) {
          const rows = Array.isArray(servRes) ? servRes : (servRes.data || []);
          if (rows.length > 0) setServices(rows);
        }
        if (portRes) {
          const rows = Array.isArray(portRes) ? portRes : (portRes.data || []);
          if (rows.length > 0) setPortfolio(rows);
        }
        if (talentRes) {
          const rows = Array.isArray(talentRes) ? talentRes : (talentRes.data || []);
          if (rows.length > 0) setTalent(rows);
        }
        if (testRes) setTestimonials(Array.isArray(testRes) ? testRes : (testRes.data || []));
        if (faqRes) {
          const rows = Array.isArray(faqRes) ? faqRes : (faqRes.data || []);
          if (rows.length > 0) setFaqs(rows);
        }
        if (courseRes) {
          const rows = Array.isArray(courseRes)
            ? courseRes
            : Array.isArray(courseRes.data)
              ? courseRes.data
              : Array.isArray(courseRes.data?.data)
                ? courseRes.data.data
                : [];
          if (rows.length > 0) setCourses(rows);
        }
      })
      .catch(() => {
        // Silently preserve default states without disruptive toasts
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand selection:text-white overflow-x-clip font-sans transition-colors duration-300">
      <Navbar />
      <Hero 
        hero={hero} 
        onOpenModal={setActiveModalProject} 
      />
      <Services services={services} loading={loading} />
      <BecomeAYouTuberSection courses={courses} />
      <FeaturedTalent talent={talent} loading={loading} />
      <Faq faqs={faqs} loading={loading} />


      {/* Theatrical Production Reel & Spec Sheet Lightbox Modal */}
      <CinematicViewerModal
        isOpen={!!activeModalProject}
        onClose={() => setActiveModalProject(null)}
        project={activeModalProject}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — Cinematic split layout
   ═══════════════════════════════════════════════════════════ */
function Hero({ hero, onOpenModal }: { hero?: any; onOpenModal?: (project: ProjectSpec) => void }) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const headingText = hero?.heading || "Stories built\nframe by frame.";
  const subheadingText =
    hero?.subheading ||
    "MP Production is a full-service creative house — high-fashion campaigns, cinematic commercials, and exclusive talent representation.";
  const ctaText = hero?.ctaText || "Explore Portfolio";
  const ctaUrl = hero?.ctaUrl || "/portfolio";

  const headingWords = headingText.split(/(\s+)/);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-end overflow-hidden isolate pb-0 px-0 sm:px-4 lg:px-6">
      {/* Background layer — Full Bleed Merged With Navbar */}
      <div className="absolute inset-0 top-0 bottom-0 -z-10 bg-[#050507] overflow-hidden select-none">
        <motion.div style={{ y }} className="absolute inset-0 h-[120%] w-full -top-[10%] transform-gpu">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center transform-gpu"
            autoPlay={true}
            muted={true}
            loop={true}
            playsInline={true}
            preload="auto"
            poster="/assets/hero_cinematic_dark.webp"
          >
            <source src="https://zmpeiobdilrgtuzggzuj.supabase.co/storage/v1/object/public/mdms/videos/hero.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Top Vignette Gradient for Navbar Contrast */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-1 pointer-events-none" />
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />
        {/* Seamless bottom fade into page background */}
        <div className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl w-full px-6 sm:px-10 pb-16 pt-36 sm:pt-44 md:pt-48 z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse shadow-[0_0_10px_#eb3d26]" />
            <span className="text-[11px] sm:text-xs font-mono font-medium tracking-[0.25em] uppercase text-white/90">
              Cinematic Studio · Est. 2018
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.2rem] text-white leading-[1.05] sm:leading-[0.98] tracking-tight drop-shadow-xl break-normal">
            {headingWords.map((word: string, i: number) => {
              if (word.match(/\s+/)) {
                if (word.includes("\n")) return <br key={i} className="hidden sm:inline" />;
                return <span key={i}> </span>;
              }
              return (
                <motion.span
                  key={i}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block origin-bottom"
                >
                  {word}
                </motion.span>
              );
            })}
          </h1>
        </div>

        {/* Subheading */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-xl text-white/75 leading-relaxed font-normal drop-shadow-md"
        >
          {subheadingText}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 z-20 relative"
        >
          <MagneticButton strength={20}>
            <Link
              href={ctaUrl}
              className="group inline-flex items-center gap-3 rounded-full bg-brand hover:bg-[#d63520] px-8 py-3.5 sm:px-9 sm:py-4 text-sm sm:text-base font-bold tracking-wide text-white transition-all duration-300 shadow-[0_0_35px_rgba(235,61,38,0.45)] cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={20}>
            <Link
              href="/become-a-youtuber"
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.08] hover:bg-white/[0.16] hover:border-white/30 text-white px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold tracking-wide backdrop-blur-md transition-all cursor-pointer shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-brand fill-brand" />
              <span>Become a YouTuber</span>
            </Link>
          </MagneticButton>

          <MagneticButton strength={20}>
            <Link
              href="/join/talent"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white px-6 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-medium tracking-wide backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Register as Talent</span>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* ── Counter strip ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-14 sm:mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
        >
          {[
            { n: 500, s: "+", label: "Productions Delivered" },
            { n: 1200, s: "+", label: "Talent Roster" },
            { n: 40, s: "+", label: "Brand Partners" },
            { n: 18, s: "M+", label: "Audience Reach" },
          ].map(({ n, s, label }) => (
            <div key={label} className="flex flex-col gap-1 border-l border-white/10 pl-4">
              <span className="text-2xl sm:text-4xl font-display font-bold text-white drop-shadow-sm">
                <Counter n={n} suffix={s} />
              </span>
              <span className="text-[10px] sm:text-xs text-white/60 font-mono tracking-widest uppercase">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLLYTELLING — Keep with minor refinements
   ═══════════════════════════════════════════════════════════ */
function ScrollyTelling() {
  const acts = [
    {
      act: "ACT I",
      label: "The Vision",
      heading: "Every detail matters.",
      body: "We look beyond the surface, finding the exact optical composition and emotional resonance that moves the needle for luxury brands.",
      image: "/images/services-lighting.webp",
      tag: "OPTICAL PRECISION",
    },
    {
      act: "ACT II",
      label: "The Craft",
      heading: "Crafted with intent.",
      body: "Lighting, framing, and pacing — synchronized on set and in post-production to deliver theatrical quality across every screen.",
      image: "/images/about-bts.webp",
      tag: "THEATRICAL RIGOR",
    },
    {
      act: "ACT III",
      label: "The Legacy",
      heading: "Built to last.",
      body: "Films, campaigns, and lookbooks that echo in the culture long after launch. Your story, immortalized in high definition.",
      image: "/images/careers-meeting.webp",
      tag: "TIMELESS IMPACT",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background border-t border-border overflow-hidden isolate">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[50vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/15 via-transparent to-transparent rounded-full pointer-events-none -z-10 transform-gpu" />

      <div className="max-w-7xl mx-auto space-y-14 sm:space-y-16">
        {/* Section Header */}
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
              Our signature methodology for crafting campaigns that capture imagination and command culture.
            </p>
          </div>
        </Reveal>

        {/* 3-Card Grid with Natural Scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {acts.map((act, i) => (
            <Reveal key={i} direction="up" delay={i * 0.15}>
              <div className="group relative rounded-[2rem] overflow-hidden border border-border bg-card backdrop-blur-xl hover:border-brand/60 transition-all duration-700 flex flex-col justify-between min-h-[460px] sm:min-h-[500px] shadow-xl hover:shadow-[0_20px_60px_rgba(235,61,38,0.2)]">
                {/* Background Image with Dark Gradient */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={act.image}
                    alt={act.heading}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.38] group-hover:brightness-[0.48]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent z-10" />
                </div>

                {/* Card Header */}
                <div className="relative z-20 p-7 sm:p-8 flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] bg-brand text-white shadow-[0_0_15px_rgba(235,61,38,0.5)]">
                    {act.act}
                  </span>
                  <span className="text-xs font-mono tracking-widest text-white/60 uppercase">
                    {act.tag}
                  </span>
                </div>

                {/* Card Body */}
                <div className="relative z-20 p-7 sm:p-8 pt-0 space-y-3">
                  <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-brand block">
                    {act.label}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug drop-shadow-sm group-hover:text-brand transition-colors">
                    {act.heading}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed font-normal">
                    {act.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTRO — Editorial split layout
   ═══════════════════════════════════════════════════════════ */
function Intro({ intro }: { intro?: any }) {
  const defaultHeading = "We represent the new epoch of";
  const defaultItalic = "aesthetic storytelling.";
  const defaultBody = "";
  const defaultLocations = ["London", "Mumbai", "Dubai"];

  const heading = intro?.heading || defaultHeading;
  const italic = intro?.italicText || defaultItalic;
  const body = intro?.body || defaultBody;
  const locations = intro?.locations || defaultLocations;
  const extraContent = intro?.extraContent;

  return (
    <section className="mx-auto max-w-7xl px-6 sm:px-10 py-20 lg:py-28 border-t border-border">
      <Reveal direction="up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left — Pull quote */}
          <div>
            <span className="h-[2px] w-16 bg-brand block mb-6 shadow-[0_0_12px_#eb3d26]" />
            <h2 className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] text-foreground font-bold leading-[1.08] tracking-tight">
              {heading}{" "}
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-brand">
                {italic}
              </span>
            </h2>
          </div>

          {/* Right — Body */}
          <div className="lg:pt-2">
            <p className="text-base sm:text-xl text-foreground/90 leading-relaxed font-normal whitespace-pre-wrap">
              {body || "We combine theatrical cinematography, cutting-edge post-production, and exclusive talent representation to craft stories that resonate globally across luxury, fashion, and digital culture."}
            </p>
            {extraContent && (
              <p className="mt-5 text-sm sm:text-base text-muted-foreground leading-relaxed font-normal whitespace-pre-wrap">
                {extraContent}
              </p>
            )}
            <div className="mt-8 flex items-center flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm tracking-[0.2em] uppercase font-mono font-medium text-muted-foreground">
              {locations.map((loc: string, idx: number) => (
                <div key={idx} className="flex items-center gap-4 sm:gap-6">
                  <span className="px-3.5 py-1 rounded-full bg-surface border border-border text-foreground font-semibold">
                    {loc}
                  </span>
                  {idx < locations.length - 1 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_#eb3d26]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cinematic Visual Frame with Film Aspect Markings */}
        <div className="mt-16 lg:mt-24 relative w-full h-[280px] sm:h-[450px] lg:h-[560px] rounded-3xl overflow-hidden group border border-border shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 group-hover:from-black/60 transition-colors duration-700" />
          
          {/* Authentic Film Metadata Watermark */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-widest text-white/80 uppercase">
              2.39:1 ANAMORPHIC
            </span>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-widest text-brand uppercase">
              8K MASTER GRADE
            </span>
          </div>

          <Image
            src={intro?.imageUrl || "/images/portfolio-equipment.webp"}
            alt="Cinematic showcase"
            fill
            className="object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out brightness-90 group-hover:brightness-100"
            sizes="100vw"
          />
        </div>
      </Reveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SERVICES — Bento grid (asymmetric)
   ═══════════════════════════════════════════════════════════ */
const DEFAULT_SERVICES = [
  {
    id: "pre-production",
    title: "Pre-Production & Creative Direction",
    description: "Scriptwriting, visual storyboarding, moodboarding, location scouting, and comprehensive casting for luxury lookbooks and commercial cinema.",
    tags: ["Storyboarding", "Scouting", "Casting"],
    imageUrl: "/images/services-lighting.webp"
  },
  {
    id: "cinematography",
    title: "High-Fashion Cinematography",
    description: "ARRI & RED 8K camera packages with anamorphic glass, master Gaffer lighting, and elite camera operators for high-fashion campaigns.",
    tags: ["ARRI Alexa 35", "Anamorphic", "Lighting"],
    imageUrl: "/images/portfolio-equipment.webp"
  },
  {
    id: "post-production",
    title: "Post-Production & Color Grading",
    description: "Theatrical editing, Kodak film emulation, Dolby Vision HDR color grading, motion graphics, and immersive sound design.",
    tags: ["Dolby Vision", "Kodak 2383", "Sound Design"],
    imageUrl: "/images/about-bts.webp"
  },
  {
    id: "talent-management",
    title: "Talent Roster & Representation",
    description: "Exclusive access to international cover models, actors, dancers, and visual directors with secure escrow contract protections.",
    tags: ["Global Roster", "Escrow Contract", "Agency Access"],
    imageUrl: "/images/projects-outdoor.webp"
  }
];

const SERVICE_IMAGE_MAP: Record<string, string> = {
  'premium-brand-film': '/assets/service_production.webp',
  'product-launch-video': '/assets/commercial_car_shoot.webp',
  'social-media-reels-package': '/assets/project-fashion.webp',
  'real-estate-cinematic-tour': '/assets/cinematic-16-9.webp',
  'wedding-film': '/assets/project-music.webp',
  'brand-commercial-(tvc)': '/assets/project-commercial.webp',
  'lookbook-&-e-commerce-shoot': '/assets/fashion_lookbook.webp',
  'lookbook-e-commerce-shoot': '/assets/fashion_lookbook.webp',
  'automotive-ad-film': '/assets/commercial_car_shoot.webp',
  'event-coverage-&-aftermovie': '/assets/project-music.webp',
  'event-coverage-aftermovie': '/assets/project-music.webp',
  'casting-&-roster': '/assets/service_casting.webp',
  'casting-roster': '/assets/service_casting.webp',
  'digital-campaigns': '/assets/project-corporate.webp',
  'commercial-cinema': '/assets/hero_cinematic_dark.webp',
  'corporate-documentary': '/assets/project-corporate.webp',
  'high-fashion-lookbooks': '/assets/fashion_lookbook.webp',
  'post-&-color-grade': '/assets/service_post_production.webp',
  'post-color-grade': '/assets/service_post_production.webp',
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  production: '/assets/service_production.webp',
  video: '/assets/project-commercial.webp',
  photography: '/assets/fashion_lookbook.webp',
  content: '/assets/project-fashion.webp',
  events: '/assets/project-music.webp',
  talent: '/assets/service_casting.webp',
  'post-production': '/assets/service_post_production.webp',
  marketing: '/assets/project-corporate.webp',
};

function getServiceImage(s: any): string {
  const rawImg = s.imageUrl || s.coverImage || s.img || s.image;
  if (rawImg && typeof rawImg === 'string' && rawImg.length > 5 && rawImg !== '/images/services-lighting.webp') {
    return rawImg;
  }
  const slug = String(s.slug || s.id || '').toLowerCase().replace(/_/g, '-');
  if (SERVICE_IMAGE_MAP[slug]) return SERVICE_IMAGE_MAP[slug];

  const nameSlug = String(s.title || s.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (SERVICE_IMAGE_MAP[nameSlug]) return SERVICE_IMAGE_MAP[nameSlug];

  const cat = String(s.category || '').toLowerCase();
  if (CATEGORY_IMAGE_MAP[cat]) return CATEGORY_IMAGE_MAP[cat];

  return '/assets/service_production.webp';
}

function Services({ services = [], loading }: { services?: any[]; loading?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only display section if services actually exist in CMS / DB
  if (!services || services.length === 0) {
    return null;
  }

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const w = scrollRef.current.offsetWidth * 0.75;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-background border-t border-border overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        
        {/* Header with Title and Scroll Controls */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-5xl font-display text-foreground font-bold tracking-tight">
              Our Services
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => scroll('left')}
              className="h-10 w-10 rounded-full border border-border bg-surface grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors cursor-pointer"
              title="Previous Services"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="h-10 w-10 rounded-full border border-border bg-surface grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors cursor-pointer"
              title="Next Services"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              href="/services"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-brand transition-colors ml-2"
            >
              <span>Explore All ({services.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Horizontal Scrolling Cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory -mx-6 px-6 sm:-mx-10 sm:px-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map((s, idx) => {
            const serviceName = s.title || s.name || `Service 0${idx + 1}`;
            const desc = s.description || s.shortDesc || s.desc || "";
            const category = s.category || "Production";
            const rawTags = s.features || s.tags || [];
            const tags = Array.isArray(rawTags)
              ? rawTags
              : typeof rawTags === 'string'
              ? (() => { try { return JSON.parse(rawTags); } catch { return []; } })()
              : [];
            
            const rawPrice = s.basePrice ? Number(s.basePrice) / 100 : (Number(s.price) || 0);
            const priceText = rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : (s.pricing || "Custom Quote");
            const imageSrc = getServiceImage(s);

            return (
              <div
                key={s.id || idx}
                className="shrink-0 w-[290px] sm:w-[360px] md:w-[400px] snap-start rounded-[2rem] border border-border bg-card hover:border-brand/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl flex flex-col justify-between group"
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                  <Image
                    src={imageSrc}
                    alt={serviceName}
                    fill
                    sizes="(max-width: 768px) 300px, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-brand text-white shadow-md">
                      {category}
                    </span>
                  </div>

                  {/* Index Pill */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white/80 backdrop-blur-md border border-white/10">
                      #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-brand transition-colors leading-snug">
                      {serviceName}
                    </h3>
                    {desc && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                        {desc}
                      </p>
                    )}
                  </div>

                  {/* Key Features Bullets */}
                  {tags.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border">
                      {tags.slice(0, 3).map((f: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-foreground/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Rate & Book Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground block">Rate</span>
                      <strong className="text-sm sm:text-base font-mono font-bold text-brand">
                        {priceText}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/contact?service=${encodeURIComponent(serviceName)}`}
                        className="px-3.5 py-1.5 rounded-full border border-border bg-surface text-foreground text-xs font-semibold hover:border-brand/60 transition-colors"
                      >
                        Inquire
                      </Link>
                      <Link
                        href="/login"
                        className="px-4 py-1.5 rounded-full bg-foreground text-background font-mono text-xs font-bold hover:bg-brand hover:text-white transition-all shadow-md"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURED PROJECTS — Magazine masonry
   ═══════════════════════════════════════════════════════════ */
function FeaturedProjects({
  portfolio = [],
  loading,
  onOpenModal,
}: {
  portfolio?: any[];
  loading?: boolean;
  onOpenModal?: (project: ProjectSpec) => void;
}) {
  const displayProjects = portfolio && portfolio.length > 0 ? portfolio : DEFAULT_PORTFOLIO;

  const buildModalSpec = (p: any, i: number): ProjectSpec => ({
    title: p.title,
    category: p.category,
    client: p.client || p.location || "Luxury Brand",
    year: "2026",
    description: p.description || `High-impact ${p.category?.toLowerCase()} production delivered across international locations.`,
    videoUrl: p.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    director: p.director || "Marcus Vance",
    dop: p.dop || "Elena Rostova",
    camera: p.camera || "ARRI Alexa 35 (Anamorphic)",
    lenses: p.lenses || "Cooke S7/i Full Frame Anamorphic",
    colorGrade: "Kodak 2383 Emulation / Dolby Vision HDR",
    awards: i === 0 ? ["Awwwards SOTD", "Vimeo Staff Pick"] : ["Vimeo Staff Pick"],
  });

  return (
    <section className="mx-auto max-w-7xl px-6 sm:px-10 py-24 sm:py-32 border-t border-border">
      {/* Header row */}
      <Reveal direction="up" className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-12 bg-brand shadow-[0_0_8px_#eb3d26]" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-brand">Selected Work</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold leading-tight">Featured Productions</h2>
        </div>
        <Link
          href="/portfolio"
          className="text-sm sm:text-base font-bold text-muted-foreground hover:text-brand transition-colors flex items-center gap-2 font-mono uppercase tracking-wider"
        >
          <span>View All Work</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>

      {loading && portfolio.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-12 h-[420px] rounded-3xl bg-surface/50 animate-pulse border border-border" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="md:col-span-4 h-[320px] rounded-3xl bg-surface/50 animate-pulse border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-12">
          {displayProjects.map((p, i) => {
            const handleClick = (e: React.MouseEvent) => {
              if (onOpenModal) {
                e.preventDefault();
                onOpenModal(buildModalSpec(p, i));
              }
            };

            // First item is full-width cinematic banner
            if (i === 0) {
              return (
                <Reveal key={p.id || p.title || i} direction="up" className="md:col-span-12">
                  <div
                    onClick={handleClick}
                    className="group relative overflow-hidden rounded-[2rem] cursor-pointer h-[420px] sm:h-[500px] border border-border hover:border-brand/60 transition-all duration-700 shadow-2xl"
                  >
                    <Image
                      src={p.coverImageUrl || p.mediaUrl || p.img || "/assets/project-fashion.webp"}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-cover object-[center_30%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 sm:p-12 z-10 max-w-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.2em] uppercase text-brand">{p.category}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                        <span className="text-xs sm:text-sm font-mono font-medium uppercase text-white/80">{p.client || p.location}</span>
                      </div>
                      <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-bold leading-tight group-hover:text-brand transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-4 text-sm sm:text-base text-white/80 font-medium group-hover:text-brand transition-colors flex items-center gap-2">
                        <span>View production details</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </p>
                    </div>

                    <div className="absolute right-8 top-8 h-12 w-12 grid place-items-center rounded-full bg-brand text-white opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-100 scale-75 shadow-[0_0_25px_rgba(235,61,38,0.6)]">
                      <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                </Reveal>
              );
            }

            // Remaining items in 3-col row
            return (
              <Reveal key={p.id || p.title || i} direction="up" delay={0.08 * i} className="md:col-span-4">
                <div
                  onClick={handleClick}
                  className="group relative overflow-hidden rounded-[1.75rem] cursor-pointer h-[320px] sm:h-[360px] border border-border hover:border-brand/60 transition-all duration-700 shadow-2xl"
                >
                  <Image
                    src={p.coverImageUrl || p.mediaUrl || p.img || "/assets/fashion_lookbook.webp"}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 z-10">
                    <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-brand block mb-2">{p.category}</span>
                    <h3 className="font-display text-xl sm:text-2xl text-white font-bold leading-tight group-hover:text-brand transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURED TALENT — Agency Editorial Portrait Cards
   ═══════════════════════════════════════════════════════════ */
function FeaturedTalent({ talent = [], loading }: { talent?: any[]; loading?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sourceTalent = talent && talent.length > 0 ? talent : DEFAULT_TALENT;
  const displayTalent = sourceTalent.slice(0, 12);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const w = scrollRef.current.offsetWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 sm:py-16 overflow-hidden bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Header */}
        <Reveal direction="up" className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-12 bg-brand shadow-[0_0_8px_#eb3d26]" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-brand">Exclusive Roster</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold leading-tight">Featured Talent</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll("left")} className="h-10 w-10 rounded-full border border-border bg-surface grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll("right")} className="h-10 w-10 rounded-full border border-border bg-surface grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link href="/talent" className="hidden sm:flex items-center gap-2 text-sm sm:text-base font-bold text-muted-foreground hover:text-brand transition-colors ml-2 font-mono uppercase tracking-wider">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Horizontal scroll strip with Editorial Cards */}
      {loading && talent.length === 0 ? (
        <div className="flex gap-5 px-6 sm:px-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[260px] sm:w-[300px] h-[380px] sm:h-[420px] rounded-3xl bg-surface/50 animate-pulse border border-border" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-6 sm:px-10 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayTalent.map((t: any, i: number) => (
            <Link
              key={t.id || t.slug || i}
              href={`/talent/${t.slug || t.id}`}
              className="group shrink-0 w-[260px] sm:w-[300px] h-[380px] sm:h-[420px] snap-start relative rounded-3xl overflow-hidden border border-border hover:border-brand/60 transition-all duration-500 shadow-xl flex flex-col justify-end p-6 bg-card"
            >
              {/* Full bleed portrait background */}
              <div className="absolute inset-0 z-0">
                {t.user?.avatarUrl ? (
                  <Image
                    src={t.user.avatarUrl}
                    alt={`${t.user.firstName ?? ''} ${t.user.lastName ?? ''}`.trim() || 'Talent'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                    sizes="(max-width: 640px) 260px, 300px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#151722] flex items-center justify-center">
                    <span className="text-5xl font-display text-white/30">
                      {t.user?.firstName?.[0] || "T"}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              </div>

              {/* Top badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/15 text-white/90">
                  <CheckCircle2 className="h-3 w-3 text-brand" />
                  <span>Exclusive</span>
                </span>
              </div>

              {/* Bottom Info */}
              <div className="relative z-20 space-y-1.5">
                <h3 className="font-display text-2xl sm:text-3xl text-white font-bold group-hover:text-brand transition-colors leading-tight drop-shadow-md">
                  {t.user?.firstName || "Talent"} {t.user?.lastName || ""}
                </h3>
                <p className="text-xs font-mono font-medium tracking-widest uppercase text-brand">
                  {t.talentTypes?.[0]?.replace(/_/g, " ") || "Artist"}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-white/70">
                  <span>{t.instagramFollowers ? `${(t.instagramFollowers / 1000).toFixed(0)}K Followers` : "Agency Roster"}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-brand" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATS — Single inline counter bar (no cards)
   ═══════════════════════════════════════════════════════════ */
function Stats({ stats }: { stats?: any }) {
  const items = [
    { n: stats?.totalPortfolio || 500, s: "+", label: "Productions Delivered", icon: Film },
    { n: stats?.totalTalent || 1200, s: "+", label: "Roster Members", icon: Users },
    { n: stats?.totalServices || 40, s: "+", label: "Brand Partners", icon: Award },
    { n: 18, s: "M+", label: "Audience Impressions", icon: Zap },
  ];

  return (
    <section className="border-y border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20">
        <Reveal direction="up">
          <div className="flex flex-wrap justify-between items-center gap-y-10">
            {items.map(({ n, s, label, icon: Icon }, i) => (
              <div key={label} className="flex items-center gap-8">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <Icon className="h-6 w-6 text-brand" />
                    <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                      <Counter n={n} suffix={s} />
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono tracking-[0.2em] uppercase text-muted-foreground block">{label}</span>
                </div>
                {i < items.length - 1 && (
                  <div className="hidden lg:block h-12 w-[1px] bg-border" />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROCESS — Vertical timeline stepper
   ═══════════════════════════════════════════════════════════ */
function Process({ process = [] }: { process?: any[] }) {
  const displayProcess = process;

  return (
    <section className="py-24 sm:py-32 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Pinned header */}
          <div className="lg:col-span-4">
            <Reveal direction="up" className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[2px] w-12 bg-brand shadow-[0_0_8px_#eb3d26]" />
                <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-brand">Methodology</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold leading-tight">
                Production Process
              </h2>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
                A rigorous four-phase pipeline that eliminates friction between
                creative ambition and technical execution.
              </p>
            </Reveal>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-8 lg:pl-10">
            <div className="space-y-6">
              {displayProcess.map((p, i) => (
                <Reveal key={p.step || i} direction="up" delay={0.05 * i}>
                  <div className="group flex flex-col md:flex-row md:items-start gap-6 md:gap-10 border border-border bg-card dark:bg-gradient-to-b dark:from-[#101117]/90 dark:to-[#090a0e]/95 rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-500 hover:border-brand/60">
                    {/* Number */}
                    <div className="text-brand font-mono text-xl md:text-2xl font-bold tracking-widest pt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      {p.step || `0${i + 1}`}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl text-foreground font-bold group-hover:text-brand transition-colors leading-tight mb-3">
                        <DecryptedText text={p.title} animateOn="hover" speed={40} sequential={true} revealDirection="start" useOriginalCharsOnly={true} />
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-xl">
                        {p.desc || p.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FAQ — Clean accordion (no card wrapper)
   ═══════════════════════════════════════════════════════════ */
const DEFAULT_FAQS = [
  {
    question: "What is your typical project timeline?",
    answer: "Production timelines vary based on scope. Commercial spots typically take 2-4 weeks from pre-production to final grade, while full campaign packages take 4-8 weeks."
  },
  {
    question: "How do you handle talent bookings and contracts?",
    answer: "Our client portal allows seamless browsing and booking of talent with automated NDA generation and escrow payment protections."
  },
  {
    question: "What camera packages and equipment do you use?",
    answer: "We shoot primarily on ARRI Alexa 35 and RED V-Raptor 8K systems paired with Cooke and Leica anamorphic prime lenses."
  },
  {
    question: "Can we hire your team for international shoots?",
    answer: "Yes, our team holds active carnet permits and international passports for rapid deployment anywhere across Europe, Asia, and North America."
  }
];

function Faq({ faqs = [], loading }: { faqs?: any[]; loading?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);

  const sourceFaqs = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;
  const displayFaqs = sourceFaqs;

  return (
    <section className="py-12 sm:py-16 bg-background border-t border-border">
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <Reveal direction="up" className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground font-bold tracking-tight sm:whitespace-nowrap">
            Frequently Asked Questions
          </h2>
        </Reveal>

        {loading && faqs.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface/50 animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <Reveal direction="up" delay={0.1}>
            <div className="space-y-4">
              {displayFaqs.map((f, i) => {
                const isOpen = open === i;
                const questionText = f.q || f.question || f.title;
                const answerText = f.a || f.answer || f.desc || f.description;

                return (
                  <div key={f.id || questionText || i} className="border border-border rounded-2xl p-6 md:p-8 bg-card hover:border-brand/60 shadow-md transition-all duration-300">
                    <button
                      className="group flex w-full items-center justify-between gap-6 text-left transition cursor-pointer"
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="font-display text-lg sm:text-xl text-foreground font-bold group-hover:text-brand transition-colors">{questionText}</span>
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                          isOpen ? "border-brand bg-brand text-white rotate-0 shadow-[0_0_12px_rgba(235,61,38,0.5)]" : "border-border text-foreground hover:border-brand/60"
                        }`}
                      >
                        {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                    <div
                      className="grid overflow-hidden text-sm sm:text-base transition-all duration-300"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0">
                        <p className="pt-5 pb-1 leading-relaxed text-muted-foreground font-normal">{answerText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT CTA — Full-bleed gradient
   ═══════════════════════════════════════════════════════════ */
function ContactCta() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-16 pt-8 bg-background">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] py-16 md:py-24 bg-gradient-to-br from-card via-surface to-card border border-border shadow-2xl">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/20 via-brand/5 to-transparent transform-gpu" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/15 via-brand/2 to-transparent transform-gpu" />

        <div className="relative mx-auto max-w-4xl px-6 sm:px-10 text-center">
          <Reveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-mono font-medium tracking-[0.2em] uppercase text-foreground border border-border mb-8 backdrop-blur-md bg-surface">
              <span className="inline-block h-2 w-2 rounded-full bg-brand animate-pulse shadow-[0_0_8px_#eb3d26]" />
              Now Booking Q4 2026 / Q1 2027
            </div>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-foreground leading-[0.98] tracking-tight">
              Got a vision to build?
              <br />
              <span className="italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-brand">Let&apos;s roll cameras.</span>
            </h2>

            <p className="mt-8 max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground font-normal leading-relaxed">
              Whether you are a luxury brand launching a flagship campaign or an
              international artist dropping a narrative video — we assemble the
              master crew, lock the locations, and deliver the frames.
            </p>

            <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={20}>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 rounded-full bg-brand px-9 sm:px-10 py-4 text-sm sm:text-base font-bold tracking-wide text-white hover:bg-[#d63520] transition-all duration-300 shadow-[0_0_35px_rgba(235,61,38,0.45)] cursor-pointer"
                >
                  <span>Commission Studio</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={20}>
                <Link
                  href="/join/talent"
                  className="inline-flex items-center gap-3 rounded-full border border-border bg-surface hover:bg-surface-elevated px-8 sm:px-9 py-4 text-sm sm:text-base font-semibold tracking-wide text-foreground backdrop-blur-md transition-all shadow-md cursor-pointer"
                >
                  Apply as Talent
                </Link>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BECOME A YOUTUBER — GenZ Creator Lab Spotlight Section
   ═══════════════════════════════════════════════════════════ */
function BecomeAYouTuberSection({ courses = [] }: { courses?: any[] }) {
  const fallbackCards = [
    {
      title: '4K Cinematic Vlogging Masterclass',
      category: 'CAMERA & LIGHTING',
      duration: '4.5 Hours',
      rating: '4.9 ★',
      image: '/images/services-lighting.webp',
      bullets: ['3-Point Studio Lighting', 'Sony/Canon Log Setup'],
      color: 'text-amber-500 dark:text-amber-400',
    },
    {
      title: 'Viral Hooks & 100K Algorithm Hacking',
      category: 'VIRAL GROWTH',
      duration: '3.2 Hours',
      rating: '5.0 ★',
      image: '/assets/project-fashion.webp',
      bullets: ['3-Second Retention Hooks', 'High-CTR Thumbnails'],
      color: 'text-rose-500 dark:text-rose-400',
    },
    {
      title: 'DaVinci Resolve Hollywood Color Grading',
      category: 'EDITING & VFX',
      duration: '5.0 Hours',
      rating: '4.9 ★',
      image: '/images/about-bts.webp',
      bullets: ['Node Graph Architecture', 'Skin Tone Qualifiers'],
      color: 'text-cyan-500 dark:text-cyan-400',
    },
    {
      title: '6-Figure Brand Deals & Monetization',
      category: 'MONETIZATION',
      duration: '2.8 Hours',
      rating: '4.8 ★',
      image: '/assets/service_casting.webp',
      bullets: ['Media Kit Templates', 'Brand Pitch Scripts'],
      color: 'text-emerald-500 dark:text-emerald-400',
    },
  ];

  const cards =
    courses.length > 0
      ? courses.slice(0, 4).map((c: any) => ({
          title: c.title,
          category: String(c.categoryLabel || c.category || 'MASTERCLASS').toUpperCase(),
          duration: c.duration || '',
          rating: `${Number(c.rating) || 5} ★`,
          image: c.image || '/images/services-lighting.webp',
          bullets: Array.isArray(c.topics) ? c.topics.slice(0, 2) : [],
          color: 'text-amber-500 dark:text-amber-400',
        }))
      : fallbackCards;

  return (
    <section className="relative py-12 sm:py-16 px-6 sm:px-10 overflow-hidden bg-background text-foreground isolate border-t border-border">
      <div className="mx-auto max-w-7xl">
        {/* Simple Title Only */}
        <div className="mb-6">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Become a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-rose-500 to-amber-400">
              YouTuber
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory -mx-6 px-6 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4">
          {cards.map((card, idx) => (
            <Link
              key={idx}
              href="/become-a-youtuber"
              className="shrink-0 w-[280px] sm:w-[320px] lg:w-auto snap-start border border-border rounded-3xl overflow-hidden bg-card hover:border-brand/60 transition-all duration-300 shadow-xl flex flex-col justify-between h-full transform-gpu group"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 280px, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-brand text-white shadow-md">
                      {card.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90 z-10">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">{card.duration}</span>
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 font-bold text-amber-400">{card.rating}</span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-foreground group-hover:text-brand transition-colors leading-snug">
                    {card.title}
                  </h3>
                  {card.bullets && card.bullets.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {card.bullets.map((b: string, bIdx: number) => (
                        <div key={bIdx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


