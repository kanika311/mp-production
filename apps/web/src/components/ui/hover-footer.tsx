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
  const footerLinks = React.useMemo(() => {
    if (footerConfig?.sections && Array.isArray(footerConfig.sections) && footerConfig.sections.length > 0) {
      return footerConfig.sections;
    }
    if (footerConfig?.quickLinks && Array.isArray(footerConfig.quickLinks) && footerConfig.quickLinks.length > 0) {
      const groupsMap: Record<string, any[]> = {};
      footerConfig.quickLinks.forEach((item: any) => {
        const groupName = item.group || 'Quick Links';
        if (!groupsMap[groupName]) groupsMap[groupName] = [];
        groupsMap[groupName].push({ label: item.label, href: item.href });
      });
      return Object.entries(groupsMap).map(([title, links]) => ({ title, links }));
    }
    return [
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
          { label: "Projects", href: "/projects" },
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
  }, [footerConfig?.sections, footerConfig?.quickLinks]);

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
    { icon: <Facebook size={15} />, label: "Facebook", href: footerConfig?.socialLinks?.facebook || "https://facebook.com" },
    { icon: <Instagram size={15} />, label: "Instagram", href: footerConfig?.socialLinks?.instagram || "https://instagram.com" },
    { icon: <Twitter size={15} />, label: "Twitter", href: footerConfig?.socialLinks?.twitter || "https://twitter.com" },
    { icon: <Globe size={15} />, label: "Globe", href: footerConfig?.socialLinks?.youtube || "https://youtube.com" },
  ];

  return (
    <footer className="w-full bg-background border-t border-border relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 sm:pt-10 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 pb-6 sm:pb-8">
          {/* Brand section */}
          <div className="flex flex-col space-y-3.5 lg:col-span-2">
            <a href="/" className="inline-block shrink-0">
              <img
                src="/logo.webp"
                className="h-9 md:h-10 w-auto object-contain origin-left transition-all duration-300 drop-shadow-[0_0_12px_rgba(235,61,38,0.2)]"
                alt={footerConfig?.companyName || "MP Production Logo"}
              />
            </a>

            {footerConfig?.tagline && (
              <p className="text-xs font-semibold text-foreground/90 tracking-wide">
                {footerConfig.tagline}
              </p>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground font-light max-w-sm">
              {footerConfig?.brandDescription || "MP Production is an exclusive luxury creative production house for global brands and artists. Building timeless cinema, photography, and campaigns frame by frame."}
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-mono tracking-wider text-brand uppercase font-semibold w-fit">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              <span>Global Production Headquarters · Mumbai</span>
            </div>

            {/* Direct Contact Details */}
            <div className="space-y-1.5 pt-0.5">
              <a
                href={contactInfo[0].href}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-surface border border-border text-brand flex items-center justify-center shrink-0 group-hover:border-brand/40 transition-colors">
                  <Mail size={12} />
                </div>
                <span className="font-mono text-xs">{contactInfo[0].text}</span>
              </a>

              <a
                href={contactInfo[1].href}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-surface border border-border text-brand flex items-center justify-center shrink-0 group-hover:border-brand/40 transition-colors">
                  <Phone size={12} />
                </div>
                <span className="font-mono text-xs">{contactInfo[1].text}</span>
              </a>

              <div className="flex items-center gap-2 text-xs text-muted-foreground group">
                <div className="w-6 h-6 rounded-md bg-surface border border-border text-brand flex items-center justify-center shrink-0">
                  <MapPin size={12} />
                </div>
                <span className="font-mono text-xs">{contactInfo[2].text}</span>
              </div>
            </div>

            {/* Social media icons */}
            <div className="flex items-center gap-2 pt-0.5">
              {socialLinks.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-brand hover:border-brand/50 hover:bg-brand/10 transition-all shadow-xs"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section: any, idx: number) => (
            <div key={section.title || idx} className="space-y-2.5">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand flex items-center gap-1.5">
                <span className="text-[9px]">●</span> {section.title}
              </h4>
              <ul className="space-y-1.5">
                {section.links?.map((link: any) => (
                  <li key={link.label} className="relative w-fit">
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-xs font-light hover:translate-x-0.5 transition-all inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      {link.pulse && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom bar */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] font-mono text-muted-foreground">
          <p className="text-center sm:text-left tracking-wide">
            {footerConfig?.copyright || footerConfig?.copyrightText || 'Powered By JCRM Technologies'}
          </p>

          <div className="flex items-center gap-5 text-[10px] tracking-wider uppercase">
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
