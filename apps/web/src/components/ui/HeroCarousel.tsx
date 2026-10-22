'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface HeroSlide {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    subtitle: 'The Standard in Production',
    title: 'Cinematic Mastery. Digital Excellence.',
    description: 'We unify premium media production and elite talent discovery within a single, seamless digital ecosystem.',
    image: '/hero/hero_cinematic_set.webp',
    primaryCta: {
      text: 'Explore Portfolio',
      href: '/portfolio',
    },
    secondaryCta: {
      text: 'Discover Talent',
      href: '/talent',
    },
  },
  {
    id: 'slide-2',
    subtitle: 'Global Representation',
    title: 'Elite Roster. World-Class Creators.',
    description: 'Connecting visionary brands with premier actors, models, influencers, and digital artists across the globe.',
    image: '/hero/hero_talent_roster.webp',
    primaryCta: {
      text: 'Browse Roster',
      href: '/talent/directory',
    },
    secondaryCta: {
      text: 'Book Talent',
      href: '/contact',
    },
  },
  {
    id: 'slide-3',
    subtitle: 'Cutting-Edge Post-Production',
    title: 'Where Vision Meets Craftsmanship.',
    description: 'From 8K color grading and immersive Dolby Atmos sound design to breathtaking VFX and precision editing.',
    image: '/hero/hero_post_production.webp',
    primaryCta: {
      text: 'Our Services',
      href: '/services',
    },
    secondaryCta: {
      text: 'Editor Portal',
      href: '/editor-portal',
    },
  },
  {
    id: 'slide-4',
    subtitle: 'Next-Gen Casting & Auditions',
    title: 'Real-Time Casting Room.',
    description: 'Experience our proprietary interactive casting portal. Review live auditions, shortlist candidates, and collaborate instantly.',
    image: '/hero/hero_casting_audition.webp',
    primaryCta: {
      text: 'Enter Casting Room',
      href: '/client-portal/casting',
    },
    secondaryCta: {
      text: 'Client Portal',
      href: '/client-portal',
    },
  },
  {
    id: 'slide-5',
    subtitle: 'Enterprise Studio Ecosystem',
    title: 'End-to-End Campaign Execution.',
    description: 'Trusted by Fortune 500 brands and global media houses to deliver high-impact commercial narratives on time and on budget.',
    image: '/hero/hero_studio_ecosystem.webp',
    primaryCta: {
      text: 'Start Your Project',
      href: '/contact',
    },
    secondaryCta: {
      text: 'View Pricing',
      href: '/pricing',
    },
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export function HeroCarousel({ slides = DEFAULT_HERO_SLIDES }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 30,
      skipSnaps: false,
    },
    [
      Autoplay({ delay: 4000, stopOnInteraction: false }),
      Fade(),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  return (
    <section
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Campaigns Carousel"
      className="relative w-full h-screen min-h-[700px] max-h-[1200px] bg-(--cinematic-bg) select-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
    >
      {/* Visual Autoplay Progress Line (4s Timer) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-(--cinematic-border) z-40 overflow-hidden">
        <motion.div
          key={selectedIndex}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
          className="h-full bg-accent shadow-[0_0_12px_var(--accent)]"
        />
      </div>

      {/* Embla Viewport */}
      <div ref={emblaRef} className="overflow-hidden h-full w-full">
        <div className="flex h-full w-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${slides.length}`}
                aria-hidden={!isActive}
                className="flex-[0_0_100%] min-w-0 relative h-full w-full"
              >
                {/* Background Image with Object-Fit Cover */}
                <div className="absolute inset-0 z-0 bg-(--cinematic-bg)">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding={index === 0 ? 'sync' : 'async'}
                    className="w-full h-full object-cover opacity-80"
                    style={{ transform: isActive ? 'scale(1)' : 'scale(1.08)', transition: 'transform 4000ms ease-out' }}
                  />
                </div>

                {/* Gradient Overlays for High Readability & Cinematic Contrast */}
                <div className="absolute inset-0 z-10 bg-linear-to-r from-(--cinematic-bg)/80 via-(--cinematic-bg)/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 z-10 bg-linear-to-t from-(--cinematic-bg)/95 via-(--cinematic-bg)/20 to-(--cinematic-bg)/30 pointer-events-none" />

                {/* Slide Typography & CTAs */}
                <div className="relative z-20 flex flex-col justify-center items-start h-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-16">
                  <div className="max-w-3xl">
                    {/* Subtitle / Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                      className="mb-4"
                    >
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-(--cinematic-text-muted)">
                        {slide.subtitle}
                      </span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="text-4xl sm:text-6xl md:text-7xl lg:text-[6rem] font-serif text-(--cinematic-text) leading-[1.05] mb-6 tracking-tight text-balance drop-shadow-2xl"
                    >
                      {slide.title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="text-base sm:text-lg md:text-xl text-(--cinematic-text-muted) font-light leading-relaxed mb-10 max-w-2xl text-balance drop-shadow-lg"
                    >
                      {slide.description}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-wrap items-center gap-4"
                    >
                      <Button
                        href={slide.primaryCta.href}
                        size="lg"
                        variant="accent"
                        className="bg-accent! hover:bg-(--accent-hover)! text-(--accent-foreground)! border-none! shadow-xl hover:scale-105 transition-all duration-300"
                      >
                        {slide.primaryCta.text}
                      </Button>
                      {slide.secondaryCta && (
                        <Button
                          href={slide.secondaryCta.href}
                          size="lg"
                          variant="ghost"
                          className="bg-(--cinematic-text)/10! hover:bg-(--cinematic-text)/20! text-(--cinematic-text)! border! border-(--cinematic-border)! backdrop-blur-md shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          {slide.secondaryCta.text}
                        </Button>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Cinematic Navigation Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 px-6 py-3 rounded-full bg-(--cinematic-bg)/40 border border-(--cinematic-border) backdrop-blur-xl shadow-2xl">
        {/* Previous Button */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous slide"
          className="text-(--cinematic-text)/70 hover:text-(--cinematic-text) transition-colors p-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div className="flex items-center gap-3" role="tablist">
          {slides.map((_, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => scrollTo(index)}
                className={`transition-all duration-500 rounded-full h-1.5 focus:outline-none ${
                  isActive
                    ? 'w-8 bg-(--cinematic-text) shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    : 'w-1.5 bg-(--cinematic-text)/30 hover:bg-(--cinematic-text)/60'
                }`}
              />
            );
          })}
        </div>

        {/* Slide Counter */}
        <div className="text-[10px] font-mono tracking-[0.2em] text-(--cinematic-text)/50 uppercase ml-2 flex items-center gap-1">
          <span className="text-(--cinematic-text) font-medium">{String(selectedIndex + 1).padStart(2, '0')}</span>
          <span>/</span>
          <span>{String(slides.length).padStart(2, '0')}</span>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next slide"
          className="text-(--cinematic-text)/70 hover:text-(--cinematic-text) transition-colors p-1"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

export default HeroCarousel;
