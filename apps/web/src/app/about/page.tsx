'use client';

import { Navbar } from '@/components/ui/Navbar';

import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Sparkles, ArrowUpRight, Compass, ShieldCheck, Heart, Award, Cpu, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

export default function About() {
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/cms/hero?page=about')
      .then(json => {
        if (json?.data) setHero(json.data);
      })
      .catch(() => {
        toast.error('Failed to load about page data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110vw] h-[70vh] bg-linear-to-b from-brand/5 via-transparent to-transparent blur-[150px] pointer-events-none z-0" />

        {/* Brand Story Hero — Full Bleed Merged With Navbar */}
        <section className="relative w-full h-[75vh] sm:h-[85vh] flex items-center justify-center overflow-hidden mb-20 pt-28 sm:pt-36">
          <Image 
            src="/images/about-hero.webp" 
            alt="About MP Production" 
            fill 
            className="object-cover object-center" 
            priority sizes="100vw" />
          
          {/* Top Vignette Overlay for Navbar Integration */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-1 pointer-events-none" />
          <div className="absolute inset-0 dark:bg-black/55 bg-black/35 z-1" />
          <div className="absolute bottom-0 left-0 right-0 h-40 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent z-2" />
          
          <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto">
            {loading && !hero ? (
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-white/20 rounded w-24 mx-auto" />
                <div className="h-16 bg-white/20 rounded max-w-xl mx-auto" />
              </div>
            ) : (
              <Reveal direction="up">
                <span className="text-brand tracking-[0.25em] text-xs uppercase font-mono font-bold mb-6 block drop-shadow-md">
                  {hero?.tagline || "● THE VISION"}
                </span>
                <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-10 font-light drop-shadow-lg">
                  REDEFINING THE <br />
                  <span className="italic font-extralight text-white/80">VISUAL STANDARD.</span>
                </h1>
              </Reveal>
            )}
          </div>
        </section>

        {/* Story Section - 50/50 Split */}
        <section className="mb-32 relative z-10">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Reveal direction="up">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-serif text-foreground mb-8">Our Story</h2>
                  <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed mb-6">
                    {hero?.subheading || "Founded on the principle that absolute excellence is the only standard, MP Production was established to bridge the gap between world-class talent and top-tier cinematic production."}
                  </p>
                  <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                    We are more than an agency; we are a unified ecosystem of creators. From locking down exclusive international locations to capturing raw emotional resonance on set, we handle every detail with theatrical precision.
                  </p>
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.2}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border">
                  <Image 
                    src="/images/about-bts.webp" 
                    alt="Behind the scenes camera operator" 
                    fill 
                    className="object-cover" sizes="100vw" />
                  <div className="absolute inset-0 dark:bg-black/55 bg-black/25" />
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* Studio Tour Video */}
        <section className="mb-32 relative z-10">
          <Container>
            <Reveal direction="up" delay={0.15}>
              <div className="group relative aspect-video overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl">
                <img 
                  src="/assets/hero-dark.webp" 
                  alt="Studio Production Set" 
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-80 transition-all duration-1200 ease-out" 
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center pl-1.5 shadow-[0_0_50px_rgba(235,61,38,0.3)] group-hover:scale-110 transition-transform duration-500 cursor-pointer">
                    <Play className="w-8 h-8 fill-primary-foreground text-primary-foreground" />
                  </div>
                </div>
                
                {/* Floating Specs Bar */}
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
                    <span className="pulse-dot h-2 w-2 rounded-full bg-brand" />
                    <span className="text-[10px] font-mono tracking-widest text-white uppercase font-bold">Studio Tour Film</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">ARRI RAW · 4.6K Capture</span>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Core Values */}
        <section className="bg-muted/10 border-y border-border py-28 mb-28 relative z-10">
          <Container>
            <div className="text-center mb-20">
              <span className="text-brand font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-3">● Core Pillars</span>
              <h2 className="text-4xl sm:text-5xl font-serif text-foreground">Our Core Philosophy</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Reveal direction="up" delay={0.1}>
                <div className="p-10 rounded-[2.5rem] bg-card border border-border hover:border-brand/40 transition-all duration-300 shadow-2xl flex flex-col justify-between h-full group">
                  <div>
                    <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand mb-8 group-hover:scale-105 transition-transform">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif mb-4 text-foreground">Uncompromising Quality</h3>
                    <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed">We deliver cinema-grade assets that elevate brands. Every frame is graded, every sound mixed, and every detail perfected.</p>
                  </div>
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.2}>
                <div className="p-10 rounded-[2.5rem] bg-card border border-border hover:border-brand/40 transition-all duration-300 shadow-2xl flex flex-col justify-between h-full group">
                  <div>
                    <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand mb-8 group-hover:scale-105 transition-transform">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif mb-4 text-foreground">Elite Network</h3>
                    <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed">An exclusive, curated roster of world-class talent, from directors and colorists to models and influencers.</p>
                  </div>
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.3}>
                <div className="p-10 rounded-[2.5rem] bg-card border border-border hover:border-brand/40 transition-all duration-300 shadow-2xl flex flex-col justify-between h-full group">
                  <div>
                    <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand mb-8 group-hover:scale-105 transition-transform">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif mb-4 text-foreground">Frictionless Workflow</h3>
                    <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed">Our custom digital portal allows clients to book, track, and approve deliverables seamlessly without endless email threads.</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* Team Teaser */}
        <section className="py-12 mb-20 relative z-10">
          <Container>
            <Reveal direction="up">
              <div className="flex flex-col items-center text-center p-12 sm:p-20 rounded-[2.5rem] bg-card border border-border">
                <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-6">Meet the Visionaries</h2>
                <p className="text-muted-foreground font-light max-w-xl mb-10 text-sm leading-relaxed">Our core team comprises award-winning directors, producers, and creative technologists dedicated to pushing the boundaries of digital media.</p>
                <Link
                  href="/team"
                  className="px-8 py-3.5 rounded-full bg-brand hover:bg-foreground hover:text-background text-primary-foreground font-mono font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-glow"
                >
                  <span>View Full Roster</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
    </>
  );
}
