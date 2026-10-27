"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { ProjectSpec } from "@/components/ui/CinematicViewerModal";
import { Plus, Minus, ChevronLeft, ChevronRight, Play } from "lucide-react";

// Lazy-load the heavy modal only when requested by user click
const CinematicViewerModal = dynamic(
  () =>
    import("@/components/ui/CinematicViewerModal").then(
      (mod) => mod.CinematicViewerModal
    ),
  { ssr: false }
);

/* ═══════════════════════════════════════════════════════════
   Progressive Counter — Server HTML always renders target number
   ═══════════════════════════════════════════════════════════ */
export function ProgressiveCounter({
  n,
  suffix = "",
}: {
  n: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(n);
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const start = performance.now();
            const duration = 1400;
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplayValue(Math.round(eased * n));
              if (progress < 1) requestAnimationFrame(tick);
            };
            setDisplayValue(0);
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [n]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Interactive Project Lightbox Trigger & Modal Manager
   ═══════════════════════════════════════════════════════════ */
export function ProjectCardModalTrigger({
  project,
  children,
}: {
  project: ProjectSpec;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label={`Open preview for ${project.title}`}
      >
        {children}
      </div>

      {isOpen && (
        <CinematicViewerModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          project={project}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Horizontal Scroll Controls for Cards
   ═══════════════════════════════════════════════════════════ */
export function HorizontalScroller({
  children,
  targetId,
}: {
  children: React.ReactNode;
  targetId: string;
}) {
  const scroll = (direction: "left" | "right") => {
    const el = document.getElementById(targetId);
    if (el) {
      const distance = el.offsetWidth * 0.75;
      el.scrollBy({
        left: direction === "left" ? -distance : distance,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="h-10 w-10 rounded-full border border-border bg-surface grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="h-10 w-10 rounded-full border border-border bg-surface grid place-items-center text-foreground hover:text-brand hover:border-brand transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Accessible CSS / HTML FAQ Item
   ═══════════════════════════════════════════════════════════ */
export function AccessibleFaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card hover:border-brand/60 shadow-md transition-all duration-300">
      <button
        type="button"
        className="group flex w-full items-center justify-between gap-6 text-left transition cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="font-display text-lg sm:text-xl text-foreground font-bold group-hover:text-brand transition-colors">
          {question}
        </h3>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
            isOpen
              ? "border-brand bg-brand text-white shadow-[0_0_12px_rgba(235,61,38,0.5)]"
              : "border-border text-foreground group-hover:border-brand/60"
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
          <p className="pt-5 pb-1 leading-relaxed text-muted-foreground font-normal">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
