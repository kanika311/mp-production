"use client";

import React, { useRef, useEffect, useState } from "react";
import { Star, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function CinematicTestimonial() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Viewport-aware playback: only decode & play when visible on screen
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            v.play().catch(() => {});
            setIsPlaying(true);
          } else {
            v.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(v);

    return () => {
      observer.disconnect();
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const servicesList = ["Direction", "Casting", "Editing", "Color Grading", "VFX", "Delivery"];

  return (
    <div className="w-full bg-[var(--cinematic-bg)] relative">
      {/* ── Testimonial + Video ─────────────────────────────────── */}
      <section className="min-h-screen w-full flex items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Subtle bg glow — GPU radial gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent rounded-full transform-gpu" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Left — quote */}
          <Reveal direction="up">
            <div className="flex flex-col gap-8">
              {/* Stars */}
              <div className="flex gap-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-6 h-6 fill-brand text-brand" />
                ))}
              </div>

              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[var(--cinematic-text)] leading-tight">
                MP Production delivered a film we couldn&apos;t stop watching.
              </h2>

              <div>
                <p className="font-semibold text-lg text-[var(--cinematic-text)]">Priya M.</p>
                <p className="text-sm text-[var(--cinematic-text-muted)]">Marketing Lead, LUXE Global</p>
              </div>

              {/* Service tags */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--cinematic-border)]">
                {servicesList.map((s, i) => (
                  <span key={i} className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--cinematic-text-muted)] bg-[var(--cinematic-bg-elevated)] border border-[var(--cinematic-border)] px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right — video */}
          <Reveal direction="up" delay={0.15}>
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--cinematic-border)]/50 bg-black group">
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none"
                poster="/images/portfolio-hero.webp"
                className="w-full h-full object-cover object-top scale-105 group-hover:scale-100 transition-transform duration-1000"
              >
                <source src="https://zmpeiobdilrgtuzggzuj.supabase.co/storage/v1/object/public/mdms/videos/reel_1.mp4" type="video/mp4" />
              </video>

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex justify-between items-center text-white">
                <div>
                  <p className="font-semibold text-sm">Priya M.</p>
                  <p className="text-xs opacity-70">Marketing Lead, LUXE Global</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final typographic closer ────────────────────────────── */}
      <section className="w-full py-24 px-6 flex items-center justify-center bg-[var(--cinematic-bg)]">
        <Reveal direction="up">
          <h1 className="text-5xl sm:text-7xl md:text-[7rem] lg:text-[9rem] font-display font-bold text-[var(--cinematic-text)] text-center leading-[0.9] tracking-tighter">
            EVERY FRAME<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cinematic-text)] to-[var(--cinematic-text)]/40">
              EARNS ATTENTION.
            </span>
          </h1>
        </Reveal>
      </section>
    </div>
  );
}

export default CinematicTestimonial;
