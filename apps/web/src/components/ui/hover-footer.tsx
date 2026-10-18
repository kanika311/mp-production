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
    copyright: 'Powered By JCRM Technologies',
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
    <footer className="w-full bg-background border-t border-border relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-6 lg:col-span-2">
            <a href="/" className="inline-block shrink-0">
              <img
                src="/logo.webp"
                className="h-12 md:h-14 w-auto object-contain origin-left transition-all duration-300 drop-shadow-[0_0_15px_rgba(235,61,38,0.25)]"
                alt={footerConfig?.companyName || "MP Production Logo"}
              />
            </a>

            <p className="text-sm leading-relaxed text-muted-foreground font-light max-w-sm">
              {footerConfig?.tagline || "MP Production is an exclusive luxury creative production house for global brands and artists. Building timeless cinema, photography, and campaigns frame by frame."}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-xs font-mono tracking-wider text-brand uppercase font-semibold w-fit">
              <span className="inline-block h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span>Global Production Headquarters · Mumbai</span>
            </div>

            {/* Direct Contact Details */}
            <div className="space-y-3 pt-2">
              <a
                href={contactInfo[0].href}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-brand transition-colors group"
              >
                <div className="p-2 rounded-lg bg-surface border border-border text-brand group-hover:border-brand/40 transition-colors">
                  {contactInfo[0].icon}
                </div>
                <span className="font-mono text-xs sm:text-sm">{contactInfo[0].text}</span>
              </a>

              <a
                href={contactInfo[1].href}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-brand transition-colors group"
              >
                <div className="p-2 rounded-lg bg-surface border border-border text-brand group-hover:border-brand/40 transition-colors">
                  {contactInfo[1].icon}
                </div>
                <span className="font-mono text-xs sm:text-sm">{contactInfo[1].text}</span>
              </a>

              <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                <div className="p-2 rounded-lg bg-surface border border-border text-brand">
                  {contactInfo[2].icon}
                </div>
                <span className="font-mono text-xs sm:text-sm">{contactInfo[2].text}</span>
              </div>
            </div>

            {/* Social media icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-brand hover:border-brand/50 hover:bg-brand/10 transition-all shadow-xs"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section: any, idx: number) => (
            <div key={section.title || idx} className="space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand flex items-center gap-1.5">
                <span className="text-[10px]">●</span> {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links?.map((link: any) => (
                  <li key={link.label} className="relative w-fit">
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm font-light hover:translate-x-1 transition-all inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      {link.pulse && (
                        <span className="inline-block w-2 h-2 rounded-full bg-brand animate-pulse" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground">
          <p className="text-center sm:text-left tracking-wide">
            {footerConfig?.copyright || footerConfig?.copyrightText || 'Powered By JCRM Technologies'}
          </p>

          <div className="flex items-center gap-6 text-[11px] tracking-wider uppercase">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/security" className="hover:text-foreground transition-colors">Security</a>
            <span className="hidden md:inline-flex items-center gap-1.5 text-brand font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Studio Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HoverFooter;
