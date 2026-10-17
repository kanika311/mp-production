"use client";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fetchAPI } from "@/lib/api-client";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Globe,
} from "lucide-react";

export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((e.clientX - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((e.clientY - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 800 120"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className={cn("w-full h-full max-h-64 md:max-h-88 lg:max-h-112 select-none uppercase cursor-pointer", className)}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#80eeb4" />
              <stop offset="75%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1"
        className="fill-transparent stroke-neutral-200 font-[helvetica] text-5xl font-bold dark:stroke-neutral-800"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1"
        className="fill-transparent stroke-brand font-[helvetica] text-5xl font-bold 
        dark:stroke-brand"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="1"
        mask="url(#textMask)"
        className="fill-transparent font-[helvetica] text-5xl font-bold"
      >
        {text}
      </text>
    </svg>
  );
};


export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 10%, transparent 50%, color-mix(in oklab, var(--brand) 15%, transparent) 100%)",
      }}
    />
  );
};

export function HoverFooter() {
  const [footerConfig, setFooterConfig] = useState<any>({
    tagline: 'Crafting Cinematic Excellence & Digital Legacies.',
    copyright: `© ${new Date().getFullYear()} MP Production. All rights reserved.`,
    socialLinks: {
      instagram: 'https://instagram.com/mpproduction',
      linkedin: 'https://linkedin.com/company/mpproduction',
      youtube: 'https://youtube.com/mpproduction'
    }
  });

  React.useEffect(() => {
    fetchAPI('/cms/config/footer')
      .then(json => {
        if (json?.success && json?.data) {
          const val = typeof json.data === 'string'
            ? JSON.parse(json.data)
            : typeof json.data.value === 'string'
              ? JSON.parse(json.data.value)
              : json.data.value || json.data;
          setFooterConfig((prev: any) => ({ ...prev, ...val }));
        }
      })
      .catch(() => {});
  }, []);

  // Footer link data - dynamic if provided by CMS, otherwise fallback defaults
  const footerLinks = footerConfig?.sections || [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Meet the Team", href: "/team" },
        { label: "Testimonials", href: "/testimonials" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Network & Work",
      links: [
        { label: "Portfolio", href: "/portfolio" },
        { label: "Showreels", href: "/reel" },
        { label: "Pricing", href: "/pricing" },
        { label: "Talent Directory", href: "/talent/directory" },
        { label: "Join as Talent", href: "/join/talent" },
        { label: "Client Portal", href: "/client-portal" },
        { label: "Editor Portal", href: "/editor-portal" },
      ],
    },
    {
      title: "Support & Legal",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "FAQs", href: "/faq" },
        {
          label: "Live Chat",
          href: "/contact",
          pulse: true,
        },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Security & Compliance", href: "/security" },
        { label: "Help Center", href: "/help" },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-primary" />,
      text: footerConfig?.contactEmail || "hello@mpproduction.com",
      href: `mailto:${footerConfig?.contactEmail || "hello@mpproduction.com"}`,
    },
    {
      icon: <Phone size={18} className="text-primary" />,
      text: footerConfig?.contactPhone || "+91 86373 73116",
      href: `tel:${(footerConfig?.contactPhone || "+918637373116").replace(/\s+/g, '')}`,
    },
    {
      icon: <MapPin size={18} className="text-primary" />,
      text: footerConfig?.contactAddress || "Mumbai, India",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Facebook size={20} />, label: "Facebook", href: footerConfig?.socialLinks?.facebook || "https://facebook.com" },
    { icon: <Instagram size={20} />, label: "Instagram", href: footerConfig?.socialLinks?.instagram || "https://instagram.com" },
    { icon: <Twitter size={20} />, label: "Twitter", href: footerConfig?.socialLinks?.twitter || "https://twitter.com" },
    { icon: <Globe size={20} />, label: "Globe", href: footerConfig?.socialLinks?.youtube || "https://youtube.com" },
  ];

  return (
    <footer className="card-awwwards bg-(--cinematic-bg) relative h-fit rounded-3xl overflow-hidden m-4 sm:m-8 border border-(--cinematic-border) shadow-2xl">
      <div className="max-w-7xl mx-auto p-10 sm:p-16 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-8 lg:gap-12 pb-14">
          {/* Brand section */}
          <div className="flex flex-col space-y-6 lg:col-span-2">
            <div className="flex items-center space-x-3">
              <img src="/logo.webp" className="h-16 w-auto object-contain scale-110 origin-left transition-all duration-300 drop-shadow-[0_0_20px_rgba(235,61,38,0.4)]" alt={footerConfig?.companyName || "MP Production Logo"} />
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-(--cinematic-text-muted) font-light max-w-sm">
              {footerConfig?.tagline || "MP Production is an exclusive luxury creative production house for global brands and artists. Building timeless cinema, photography, and campaigns frame by frame."}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono tracking-widest text-brand uppercase font-bold">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-brand" />
              <span>Global Production Headquarters · Mumbai</span>
            </div>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section: any) => (
            <div key={section.title} className="space-y-5">
              <h4 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-brand">
                ● {section.title}
              </h4>
              <ul className="space-y-3.5">
                {section.links.map((link: any) => (
                  <li key={link.label} className="relative w-fit">
                    <a
                      href={link.href}
                      data-cursor="hover"
                      data-cursor-label="GO"
                      className="text-(--cinematic-text-muted) font-light text-sm hover:text-(--cinematic-text) hover:translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span className="absolute top-0 -right-4 w-2 h-2 rounded-full bg-brand shadow-glow animate-pulse" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-t border-(--cinematic-border)/50 my-10" />

        {/* Contact section banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 mb-10 bg-(--cinematic-bg-elevated)/60 backdrop-blur-2xl rounded-3xl p-8 border border-(--cinematic-border) shadow-xl">
          {contactInfo.map((item, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-brand/15 border border-brand/30 text-brand">{item.icon}</div>
              {item.href ? (
                <a
                  href={item.href}
                  data-cursor="hover"
                  data-cursor-label="CONTACT"
                  className="text-(--cinematic-text-muted) font-mono text-xs sm:text-sm hover:text-brand transition-colors tracking-wide break-all"
                >
                  {item.text}
                </a>
              ) : (
                <span className="text-(--cinematic-text-muted) font-mono text-xs sm:text-sm tracking-wide break-all">
                  {item.text}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-6 md:space-y-0 text-(--cinematic-text-muted)">
          {/* Social icons */}
          <div className="flex space-x-4">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                data-cursor="hover"
                data-cursor-label={label.toUpperCase()}
                className="grid h-11 w-11 place-items-center rounded-full border border-(--cinematic-border) bg-white/5 hover:border-brand hover:bg-brand hover:text-(--cinematic-text) transition-all text-(--cinematic-text-muted) shadow-lg"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left font-mono font-light tracking-widest uppercase text-[11px] text-(--cinematic-text-muted)/60">
            {footerConfig?.copyright || footerConfig?.copyrightText || `© ${new Date().getFullYear()} MP Production. All rights reserved.`}
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="flex h-72 md:h-96 lg:h-120 -mt-16 md:-mt-28 lg:-mt-40 pb-6 items-center justify-center w-full px-4 select-none">
        <TextHoverEffect text={footerConfig?.companyName || "MP Production"} className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default HoverFooter;
