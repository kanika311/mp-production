"use client";

import { Navbar } from "@/components/ui/Navbar";
import { HoverFooter as Footer } from "@/components/ui/hover-footer";
import { Reveal } from "@/components/ui/Reveal";
import { CinematicViewerModal, ProjectSpec } from "@/components/ui/CinematicViewerModal";
import { CinematicTestimonial } from "@/components/ui/cinematic-testimonial";
import { MagneticButton } from "@/components/motion/MagneticButton";
import DecryptedText from "@/components/motion/DecryptedText";
import Link from "next/link";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { fetchAPI } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
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
   Main Component
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [hero, setHero] = useState<any>(null);
  const [intro, setIntro] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [talent, setTalent] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalProject, setActiveModalProject] = useState<ProjectSpec | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(1);

  useEffect(() => {
    Promise.all([
      fetchAPI("/cms/hero?page=home", { cache: "no-store" }).catch(() => null),
      fetchAPI("/cms/config/intro", { cache: "no-store" }).catch(() => null),
      fetchAPI("/cms/stats", { cache: "no-store" }).catch(() => null),
      fetchAPI("/cms/services?active=true", { cache: "no-store" }).catch(() => null),
      fetchAPI("/cms/portfolio?featured=true&limit=6", { cache: "no-store" }).catch(() => null),
      fetchAPI("/talent/featured", { cache: "no-store" }).catch(() => null),
      fetchAPI("/cms/testimonials?published=true", { cache: "no-store" }).catch(() => null),
      fetchAPI("/cms/faq?limit=8", { cache: "no-store" }).catch(() => null),
      fetchAPI("/cms/courses?limit=4", { cache: "no-store" }).catch(() => null),
    ])
      .then(([heroRes, introRes, statsRes, servRes, portRes, talentRes, testRes, faqRes, courseRes]) => {
        if (heroRes) setHero(heroRes.data || heroRes);
        if (introRes) setIntro(introRes.data || introRes);
        if (statsRes) setStats(statsRes.data || statsRes);
        if (servRes) setServices(Array.isArray(servRes) ? servRes : (servRes.data || []));
        if (portRes) setPortfolio(Array.isArray(portRes) ? portRes : (portRes.data || []));
        if (talentRes) setTalent(Array.isArray(talentRes) ? talentRes : (talentRes.data || []));
        if (testRes) setTestimonials(Array.isArray(testRes) ? testRes : (testRes.data || []));
        if (faqRes) setFaqs(Array.isArray(faqRes) ? faqRes : (faqRes.data || []));
        if (courseRes) {
          const rows = Array.isArray(courseRes)
            ? courseRes
            : Array.isArray(courseRes.data)
              ? courseRes.data
              : Array.isArray(courseRes.data?.data)
                ? courseRes.data.data
                : [];
          setCourses(rows);
        }
      })
      .catch(() => {
        toast.error("Failed to load page content");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground overflow-x-clip">
      <Navbar />
      <Hero 
        hero={hero} 
        onOpenModal={setActiveModalProject} 
      />
      <ScrollyTelling />
      <Intro intro={intro} />
      <Services services={services} loading={loading} />
      <BecomeAYouTuberSection courses={courses} />
      <FeaturedProjects portfolio={portfolio} loading={loading} onOpenModal={setActiveModalProject} />
      <FeaturedTalent talent={talent} loading={loading} />
      <Stats stats={stats} />
      <Process />
      <CinematicTestimonial />
      <Faq faqs={faqs} loading={loading} />
      <ContactCta />


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
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: "20%",
          ease: "none",
          scrollTrigger: {
            trigger: bgRef.current.parentElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const headingText = hero?.heading || "Stories built\nframe by frame.";
  const subheadingText =
    hero?.subheading ||
    "MP Production is a full-service creative house — high-fashion campaigns, cinematic commercials, and exclusive talent representation.";
  const ctaText = hero?.ctaText || "Explore Portfolio";
  const ctaUrl = hero?.ctaUrl || "/portfolio";

  const headingWords = headingText.split(/(\s+)/);

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden isolate pb-0 px-0 sm:px-4 lg:px-6">
      {/* Background layer — Full Bleed Merged With Navbar */}
      <div className="absolute inset-0 top-0 bottom-4 -z-10 bg-[#060608] overflow-hidden select-none rounded-none sm:rounded-b-[3rem] border-b border-[var(--cinematic-border)]/50">
        <div ref={bgRef} className="absolute inset-0 h-[120%] w-full -top-[10%] transform-gpu" style={{ transform: 'translateZ(0)' }}>

          <video
            className="absolute inset-0 h-full w-full object-cover object-center transform-gpu"
            autoPlay={true}
            muted={true}
            loop={true}
            playsInline={true}
            preload="none"
          >
            <source src="https://zmpeiobdilrgtuzggzuj.supabase.co/storage/v1/object/public/mdms/videos/hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Top Vignette Gradient for Navbar Contrast */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-1 pointer-events-none" />
        <div className="absolute inset-0 dark:bg-black/65 bg-black/45 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none dark:bg-gradient-to-t dark:from-black bg-gradient-to-t from-white to-transparent" />
        <div className="absolute inset-0 bg-[var(--hero-gradient-left)] pointer-events-none" />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl w-full px-6 sm:px-10 pb-20 pt-40 md:pt-48 z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="h-[2px] w-12 bg-brand" />
          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-white drop-shadow-sm">
            Production House · Est. 2018
          </span>
        </motion.div>

        {/* Heading */}
        <div className="max-w-4xl">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] text-white leading-[0.95] tracking-tight drop-shadow-md">
            {headingWords.map((word: string, i: number) => {
              if (word.match(/\s+/)) {
                if (word.includes("\n")) return <br key={i} />;
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
          className="mt-8 max-w-2xl text-lg sm:text-2xl text-white leading-relaxed font-medium drop-shadow-md"
        >
          {subheadingText}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-4 z-20 relative"
        >
          <MagneticButton strength={20}>
            <Link
              href={ctaUrl}
              className="group inline-flex items-center gap-3 rounded-full bg-brand hover:bg-white hover:text-black px-9 py-4 text-base sm:text-lg font-bold tracking-wide text-white transition-all duration-300 shadow-glow cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={20}>
            <Link
              href="/become-a-youtuber"
              className="group inline-flex items-center gap-3 rounded-full border border-border bg-surface hover:bg-surface-elevated text-foreground px-9 py-4 text-base sm:text-lg font-bold tracking-wide backdrop-blur-md transition-all cursor-pointer shadow-md hover:border-brand/60"
            >
              <Sparkles className="h-5 w-5 text-brand fill-brand" />
              <span>Become a YouTuber</span>
            </Link>
          </MagneticButton>



          <MagneticButton strength={20}>
            <Link
              href="/join/talent"
              className="group bg-white/20 hover:bg-white/35 text-white inline-flex items-center gap-3 rounded-full border border-white/30 px-9 py-4 text-base sm:text-lg font-bold tracking-wide backdrop-blur-md transition-all cursor-pointer shadow-md"
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
          className="mt-20 pt-8 border-t border-white/20 flex flex-wrap items-center gap-x-12 gap-y-6"
        >
          {[
            { n: 500, s: "+", label: "Productions" },
            { n: 1200, s: "+", label: "Talent Roster" },
            { n: 40, s: "+", label: "Brand Partners" },
            { n: 18, s: "M+", label: "Impressions" },
          ].map(({ n, s, label }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-display font-bold text-white drop-shadow-sm">
                <Counter n={n} suffix={s} />
              </span>
              <span className="text-xs sm:text-sm text-white font-bold tracking-wider uppercase drop-shadow-sm">{label}</span>
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
      image: "/images/services-lighting.jpg",
      tag: "OPTICAL PRECISION",
    },
    {
      act: "ACT II",
      label: "The Craft",
      heading: "Crafted with intent.",
      body: "Lighting, framing, and pacing — synchronized on set and in post-production to deliver theatrical quality across every screen.",
      image: "/images/about-bts.jpg",
      tag: "THEATRICAL RIGOR",
    },
    {
      act: "ACT III",
      label: "The Legacy",
      heading: "Built to last.",
      body: "Films, campaigns, and lookbooks that echo in the culture long after launch. Your story, immortalized in high definition.",
      image: "/images/careers-meeting.jpg",
      tag: "TIMELESS IMPACT",
    },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-background border-t border-border/60 overflow-hidden isolate">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[50vh] bg-brand/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <Reveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold tracking-[0.3em] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cinematic Principles</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-bold text-foreground tracking-tight">
              The Three Acts of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-rose-500 to-amber-500">Visual Excellence</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              From initial concept to final theater color grade, we orchestrate every production through three rigorous cinematic phases.
            </p>
          </div>
        </Reveal>

        {/* 3-Card Grid with Natural Scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {acts.map((act, i) => (
            <Reveal key={i} direction="up" delay={i * 0.15}>
              <div className="group relative rounded-3xl overflow-hidden border border-border/80 bg-card hover:border-brand/60 transition-all duration-500 flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-[0_20px_50px_rgba(235,61,38,0.15)]">
                {/* Background Image with Dark Gradient */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={act.image}
                    alt={act.heading}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.45] group-hover:brightness-[0.55]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
                </div>

                {/* Card Header */}
                <div className="relative z-20 p-8 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] bg-brand text-white shadow-md">
                    {act.act}
                  </span>
                  <span className="text-xs font-mono tracking-widest text-white/70 uppercase">
                    {act.tag}
                  </span>
                </div>

                {/* Card Body */}
                <div className="relative z-20 p-8 pt-0 space-y-4">
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand block">
                    {act.label}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug drop-shadow-sm">
                    {act.heading}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed font-normal">
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
  const defaultBody = "Bridging the gap between award-winning directors and verified international modeling talent. We assemble crews, lock locations, shoot RAW, and color-grade to theatrical standards.";
  const defaultLocations = ["London", "Mumbai", "Dubai"];

  const heading = intro?.heading || defaultHeading;
  const italic = intro?.italicText || defaultItalic;
  const body = intro?.body || defaultBody;
  const locations = intro?.locations || defaultLocations;
  const extraContent = intro?.extraContent; // New optional field for extra spacing/content

  return (
    <section className="mx-auto max-w-7xl px-6 sm:px-10 py-16 lg:py-24">
      <Reveal direction="up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left — Pull quote */}
          <div>
            <span className="h-[2px] w-16 bg-brand block mb-8" />
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] text-foreground font-bold leading-[1.1] tracking-tight">
              {heading}{" "}
              <span className="italic text-muted-foreground font-medium">{italic}</span>
            </h2>
          </div>

          {/* Right — Body */}
          <div className="lg:pt-4">
            <p className="text-lg sm:text-xl text-foreground leading-relaxed font-medium whitespace-pre-wrap">
              {body}
            </p>
            {extraContent && (
              <p className="mt-6 text-base text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                {extraContent}
              </p>
            )}
            <div className="mt-8 flex items-center flex-wrap gap-6 text-xs sm:text-sm tracking-[0.2em] uppercase font-bold text-foreground">
              {locations.map((loc: string, idx: number) => (
                <div key={idx} className="flex items-center gap-6">
                  <span>{loc}</span>
                  {idx < locations.length - 1 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cinematic Visual Fill */}
        <div className="mt-20 lg:mt-32 relative w-full h-[300px] sm:h-[450px] lg:h-[600px] rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-700" />
          <Image
            src={intro?.imageUrl || "/images/portfolio-equipment.jpg"}
            alt="Cinematic showcase"
            fill
            className="object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out" sizes="100vw" />
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
    imageUrl: "/images/services-lighting.jpg"
  },
  {
    id: "cinematography",
    title: "High-Fashion Cinematography",
    description: "ARRI & RED 8K camera packages with anamorphic glass, master Gaffer lighting, and elite camera operators for high-fashion campaigns.",
    tags: ["ARRI Alexa 35", "Anamorphic", "Lighting"],
    imageUrl: "/images/portfolio-equipment.jpg"
  },
  {
    id: "post-production",
    title: "Post-Production & Color Grading",
    description: "Theatrical editing, Kodak film emulation, Dolby Vision HDR color grading, motion graphics, and immersive sound design.",
    tags: ["Dolby Vision", "Kodak 2383", "Sound Design"],
    imageUrl: "/images/about-bts.jpg"
  },
  {
    id: "talent-management",
    title: "Talent Roster & Representation",
    description: "Exclusive access to international cover models, actors, dancers, and visual directors with secure escrow contract protections.",
    tags: ["Global Roster", "Escrow Contract", "Agency Access"],
    imageUrl: "/images/projects-outdoor.jpg"
  }
];

function Services({ services = [], loading }: { services?: any[]; loading?: boolean }) {
  const sourceServices = services && services.length > 0 ? services : DEFAULT_SERVICES;
  const displayServices = sourceServices.slice(0, 4);

  return (
    <section className="pt-8 pb-16 lg:pb-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Header */}
        <Reveal direction="up" className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-12 bg-brand" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-brand">Capabilities</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground font-bold leading-tight">
              <DecryptedText text="Our Creative" animateOn="view" speed={50} sequential={true} revealDirection="start" /><br />
              <DecryptedText text="Disciplines" animateOn="view" speed={50} sequential={true} revealDirection="start" />
            </h2>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card hover:bg-brand hover:text-white hover:border-brand text-foreground font-bold text-sm tracking-wide transition-all duration-300 shadow-md cursor-pointer shrink-0"
          >
            <span>View All Services</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Boxed Layout */}
        <div className="flex flex-col gap-6">
          {loading && services.length === 0 ? (
            <div className="h-64 rounded-3xl bg-muted/20 animate-pulse" />
          ) : (
            displayServices.map((s, idx) => {
              const serviceName = s.title || s.name || `Service 0${idx + 1}`;
              const desc = s.description || s.desc || "High-end production discipline designed for maximum brand impact.";
              const rawTags = s.tags || s.features || ["Cinematic", "Global", "Luxury"];
              const tags = Array.isArray(rawTags)
                ? rawTags
                : (typeof rawTags === 'string' ? (() => { try { return JSON.parse(rawTags); } catch { return ["Cinematic", "Global"]; } })() : ["Cinematic"]);
              const FALLBACK_POOL = [
                "/images/services-lighting.jpg",
                "/images/portfolio-equipment.jpg",
                "/images/about-bts.jpg",
                "/images/projects-outdoor.jpg"
              ];
              const rawImg = s.imageUrl || s.coverImage || s.img || s.image;
              const imageSrc = (rawImg && typeof rawImg === 'string' && rawImg.length > 5)
                ? rawImg
                : FALLBACK_POOL[idx % FALLBACK_POOL.length];

              return (
                <Reveal key={s.id || idx} direction="up" delay={idx * 0.05}>
                  <div className="group relative rounded-[2rem] border border-border bg-card hover:border-brand/60 transition-[border-color,box-shadow,transform] duration-300 overflow-hidden shadow-xl p-8 sm:p-12 transform-gpu">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      {/* Left: Metadata & Titles */}
                      <div className="lg:col-span-7 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm sm:text-base font-bold text-brand tracking-widest font-mono">/ 0{idx + 1}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="text-xs sm:text-sm font-bold text-muted-foreground tracking-widest uppercase">Verified Discipline</span>
                          </div>

                          <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground font-bold group-hover:text-brand transition-colors leading-tight mb-6">
                            {serviceName}
                          </h3>

                          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium mb-8 max-w-xl">
                            {desc}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2.5 pt-6 border-t border-border">
                          {tags.map((tag: string, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="px-4 py-1.5 rounded-full bg-muted text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground border border-border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Cinematic Image */}
                      <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full rounded-[1.5rem] overflow-hidden border border-border group-hover:border-brand/40 transition-colors duration-500">
                        <Image
                          src={imageSrc}
                          alt={serviceName}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out brightness-[0.8] group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
                      </div>

                    </div>
                  </div>
                </Reveal>
              );
            })
          )}
        </div>

        {/* Bottom View All CTA */}
        <Reveal direction="up" className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-brand text-white hover:bg-foreground hover:text-background font-bold text-base sm:text-lg tracking-wide transition-all duration-300 shadow-glow group cursor-pointer"
          >
            <span>View All Services & Disciplines</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
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
  const displayProjects = portfolio;

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
    <section className="mx-auto max-w-7xl px-6 sm:px-10 py-32">
      {/* Header row */}
      <Reveal direction="up" className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-12 bg-brand" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-brand">Selected Work</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground font-bold leading-tight">Featured Productions</h2>
        </div>
        <Link
          href="/portfolio"
          className="text-base font-bold text-muted-foreground hover:text-brand transition-colors flex items-center gap-2"
        >
          <span>View All</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>

      {loading && portfolio.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-12 h-[420px] rounded-2xl bg-muted/20 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="md:col-span-4 h-[320px] rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-12">
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
                    className="group relative overflow-hidden rounded-2xl cursor-pointer h-[420px] sm:h-[480px]"
                  >
                    <Image
                      src={p.coverImageUrl || p.mediaUrl || p.img || "/assets/project-fashion.jpg"}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-cover object-[center_30%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 sm:p-12 z-10 max-w-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-brand">{p.category}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        <span className="text-xs sm:text-sm font-bold uppercase text-white">{p.client || p.location}</span>
                      </div>
                      <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight group-hover:text-brand transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-4 text-base sm:text-lg text-white font-semibold group-hover:text-brand transition-colors flex items-center gap-2">
                        <span>View production details</span>
                        <ArrowRight className="w-4 h-4" />
                      </p>
                    </div>

                    <div className="absolute right-8 top-8 h-12 w-12 grid place-items-center rounded-full bg-brand text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-100 scale-75">
                      <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground ml-0.5" />
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
                  className="group relative overflow-hidden rounded-2xl cursor-pointer h-[320px] sm:h-[360px]"
                >
                  <Image
                    src={p.coverImageUrl || p.mediaUrl || p.img || "/assets/fashion_lookbook.png"}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 z-10">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand block mb-2">{p.category}</span>
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
   FEATURED TALENT — Horizontal scroll strip
   ═══════════════════════════════════════════════════════════ */
function FeaturedTalent({ talent = [], loading }: { talent?: any[]; loading?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayTalent = talent.slice(0, 12); // Featured strip — cap to keep the homepage light; full roster on /talent

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const w = scrollRef.current.offsetWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
    }
  };

  return (
    <section className="py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Header */}
        <Reveal direction="up" className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-12 bg-brand" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-brand">Exclusive Roster</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground font-bold leading-tight">Featured Talent</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll("left")} className="h-10 w-10 rounded-full border border-border grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll("right")} className="h-10 w-10 rounded-full border border-border grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link href="/talent" className="hidden sm:flex items-center gap-2 text-base font-bold text-muted-foreground hover:text-brand transition-colors ml-2">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Horizontal scroll strip */}
      {loading && talent.length === 0 ? (
        <div className="flex gap-4 px-6 sm:px-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-64 h-80 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-6 sm:px-10 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayTalent.map((t: any, i: number) => (
            <Link
              key={t.id || t.slug || i}
              href={`/talent/${t.slug || t.id}`}
              className="group shrink-0 w-[240px] sm:w-[280px] snap-start flex flex-col items-center text-center"
            >
              <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-full overflow-hidden mb-8 transition-transform duration-700 group-hover:scale-105">
                {/* Avatar placeholder / Image */}
                <div className="absolute inset-0 bg-card flex items-center justify-center">
                  {t.user?.avatarUrl ? (
                    <Image src={t.user.avatarUrl} alt={`${t.user.firstName ?? ''} ${t.user.lastName ?? ''}`.trim() || 'Talent'} fill className="object-cover" sizes="(max-width: 640px) 192px, 224px" />
                  ) : (
                    <div className="text-4xl font-display text-muted-foreground group-hover:text-brand transition-colors duration-500">
                      {t.user?.firstName?.[0] || "T"}
                      {t.user?.lastName?.[0] || "M"}
                    </div>
                  )}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 z-10" />
              </div>

              {/* Info below avatar */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand">Exclusive</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-foreground font-bold group-hover:text-brand transition-colors leading-tight mb-2">
                  {t.user?.firstName || "Talent"} {t.user?.lastName || ""}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-bold tracking-widest uppercase mb-4">
                  {t.talentTypes?.[0]?.replace(/_/g, " ") || "Artist"}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground group-hover:text-brand transition-colors">
                  <span>{t.instagramFollowers ? `${(t.instagramFollowers / 1000).toFixed(0)}K Followers` : "Verified Roster"}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
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
    <section className="border-y border-border bg-muted/10">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20">
        <Reveal direction="up">
          <div className="flex flex-wrap justify-between items-center gap-y-10">
            {items.map(({ n, s, label, icon: Icon }, i) => (
              <div key={label} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Icon className="h-6 w-6 text-brand" />
                    <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                      <Counter n={n} suffix={s} />
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground block">{label}</span>
                </div>
                {i < items.length - 1 && (
                  <div className="hidden md:block h-12 w-[1px] bg-border" />
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
    <section className="py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Pinned header */}
          <div className="lg:col-span-4">
            <Reveal direction="up" className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[2px] w-12 bg-brand" />
                <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-brand">Methodology</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-foreground font-bold leading-tight">
                Production Process
              </h2>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
                A rigorous four-phase pipeline that eliminates friction between
                creative ambition and technical execution.
              </p>
            </Reveal>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-8 lg:pl-10">
            <div className="space-y-16">
              {displayProcess.map((p, i) => (
                <Reveal key={p.step || i} direction="up" delay={0.05 * i}>
                  <div className="group flex flex-col md:flex-row md:items-start gap-6 md:gap-12 border border-border bg-card shadow-xl transition-all duration-500 hover:border-brand/60 min-h-[280px] md:min-h-[220px]">
                    {/* Number */}
                    <div className="text-brand font-mono text-xl md:text-2xl font-bold tracking-widest pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {p.step || `0${i + 1}`}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-display text-3xl md:text-4xl text-foreground font-bold group-hover:text-brand transition-colors leading-tight mb-4 h-[90px] md:h-[100px] flex items-center">
                        <DecryptedText text={p.title} animateOn="hover" speed={40} sequential={true} revealDirection="start" useOriginalCharsOnly={true} />
                      </h3>
                      <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
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
    <section className="py-32 bg-background">
      <div className="mx-auto max-w-3xl px-6 sm:px-10">
        <Reveal direction="up" className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground font-bold leading-tight">
            Frequently Asked Questions
          </h2>
        </Reveal>

        {loading && faqs.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/20 animate-pulse" />
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
                  <div key={f.id || questionText || i} className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-xl transition-all duration-300 hover:border-brand/60">
                    <button
                      className="group flex w-full items-center justify-between gap-6 text-left transition"
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="font-display text-xl md:text-2xl text-foreground font-bold group-hover:text-brand transition-colors">{questionText}</span>
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                          isOpen ? "border-brand bg-brand text-white rotate-0" : "border-border text-foreground"
                        }`}
                      >
                        {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                    <div
                      className="grid overflow-hidden text-base md:text-lg transition-all duration-300"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0">
                        <p className="pt-6 pb-2 leading-relaxed text-muted-foreground font-medium">{answerText}</p>
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
   CONTACT CTA — Full-bleed gradient (no card border)
   ═══════════════════════════════════════════════════════════ */
function ContactCta() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] py-16 md:py-24 bg-gradient-to-br from-[var(--cinematic-bg)] via-[#0e0810] to-[var(--cinematic-bg)] border border-white/20">
      {/* Ambient glow — GPU radial gradients */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/15 via-brand/5 to-transparent transform-gpu" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/10 via-brand/2 to-transparent transform-gpu" />

      <div className="relative mx-auto max-w-4xl px-6 sm:px-10 text-center">
        <Reveal direction="up">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white border border-white/20 mb-8 backdrop-blur-md">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-brand" />
            Now Booking Q4 2026 / Q1 2027
          </div>

          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white leading-[0.95] tracking-tight">
            Got a vision to build?
            <br />
            <span className="italic text-white font-bold">Let&apos;s roll cameras.</span>
          </h2>

          <p className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-white font-medium leading-relaxed drop-shadow-sm">
            Whether you are a luxury brand launching a flagship campaign or an
            international artist dropping a narrative video — we assemble the
            master crew, lock the locations, and deliver the frames.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={20}>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full bg-brand px-10 py-4 text-base sm:text-lg font-bold tracking-wide text-white hover:bg-white hover:text-black transition-all duration-300 shadow-glow"
              >
                <span>Commission Studio</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={20}>
              <Link
                href="/join/talent"
                className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/20 hover:bg-white/35 px-10 py-4 text-base sm:text-lg font-bold tracking-wide text-white backdrop-blur-md transition-all shadow-md"
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
      image: '/images/services-lighting.jpg',
      bullets: ['3-Point Studio Lighting', 'Sony/Canon Log Setup'],
      color: 'text-amber-500 dark:text-amber-400',
    },
    {
      title: 'Viral Hooks & 100K Algorithm Hacking',
      category: 'VIRAL GROWTH',
      duration: '3.2 Hours',
      rating: '5.0 ★',
      image: '/assets/project-fashion.jpg',
      bullets: ['3-Second Retention Hooks', 'High-CTR Thumbnails'],
      color: 'text-rose-500 dark:text-rose-400',
    },
    {
      title: 'DaVinci Resolve Hollywood Color Grading',
      category: 'EDITING & VFX',
      duration: '5.0 Hours',
      rating: '4.9 ★',
      image: '/images/about-bts.jpg',
      bullets: ['Node Graph Architecture', 'Skin Tone Qualifiers'],
      color: 'text-cyan-500 dark:text-cyan-400',
    },
    {
      title: '6-Figure Brand Deals & Monetization',
      category: 'MONETIZATION',
      duration: '2.8 Hours',
      rating: '4.8 ★',
      image: '/assets/service_casting.png',
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
          image: c.image || '/images/services-lighting.jpg',
          bullets: Array.isArray(c.topics) ? c.topics.slice(0, 2) : [],
          color: 'text-amber-500 dark:text-amber-400',
        }))
      : fallbackCards;

  return (
    <section className="relative py-28 px-6 sm:px-10 overflow-hidden bg-background text-foreground isolate border-t border-b border-border/50">
      {/* Ambient Radial Lights — Hardware-accelerated GPU radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[90vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/15 via-brand/5 to-transparent rounded-full pointer-events-none transform-gpu -z-10" />
      <div className="absolute bottom-0 right-0 w-[45vw] h-[45vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-amber-500/2 to-transparent rounded-full pointer-events-none transform-gpu -z-10" />

      <div className="mx-auto max-w-7xl space-y-16">
        {/* Top Header & Eyebrow */}
        <Reveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/60 pb-10">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/15 border border-brand/40 text-brand text-xs font-bold uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(229,9,20,0.25)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GenZ Creator Lab</span>
              </div>

              <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground tracking-tight leading-[0.95]">
                Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-rose-500 to-amber-500">YouTuber</span>
              </h2>

              <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                Stop guessing the algorithm. Access MP Production&apos;s battle-tested Creator Masterclasses — 4K camera setups, viral retention hooks, DaVinci color grading, and 6-figure sponsor deal playbooks.
              </p>
            </div>

            <div className="shrink-0">
              <MagneticButton strength={20}>
                <Link
                  href="/become-a-youtuber"
                  className="group inline-flex items-center gap-3 rounded-full bg-brand hover:bg-foreground hover:text-background px-9 py-4 text-base sm:text-lg font-bold tracking-wide text-white transition-all duration-300 shadow-[0_0_40px_rgba(229,9,20,0.4)] cursor-pointer"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </Reveal>

        {/* 4-Card Masterclass Showcase Grid — CMS-driven when published courses exist */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <Reveal key={idx} direction="up" delay={idx * 0.1}>
              <Link
                href="/become-a-youtuber"
                className="group border border-border rounded-3xl overflow-hidden bg-card hover:border-brand/60 transition-[border-color,box-shadow,transform] duration-300 shadow-xl flex flex-col justify-between h-full transform-gpu"
              >
                <div>
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand text-white shadow-md">
                        {card.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white z-10">
                      <span>{card.duration}</span>
                      <span className={card.color}>{card.rating}</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold font-serif text-foreground group-hover:text-brand transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <div className="space-y-1.5 pt-1">
                      {card.bullets.map((b: string, bIdx: number) => (
                        <div key={bIdx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <div className="w-full py-2.5 rounded-xl border border-border bg-muted/50 group-hover:bg-brand group-hover:border-brand group-hover:text-white text-center text-xs font-bold uppercase tracking-wider text-foreground transition-colors duration-300 flex items-center justify-center gap-2">
                    <span>Explore Blueprint</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Bottom Banner Stats Strip */}
        <Reveal direction="up">
          <div className="p-6 md:p-8 rounded-3xl border border-border bg-card/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-xl">
            <div className="space-y-1">
              <h4 className="text-xl font-bold font-serif text-foreground">Ready to scale your YouTube channel to 100K+?</h4>
              <p className="text-xs text-muted-foreground font-medium">10,000+ Creators Trained · 100% Practical & RAW Workflows · 4.9★ Average Rating</p>
            </div>
            <Link
              href="/become-a-youtuber"
              className="px-8 py-3.5 rounded-full bg-brand text-white hover:bg-foreground hover:text-background text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-xl shrink-0"
            >
              Explore All Masterclasses →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}


