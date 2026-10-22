'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image (Cinematic Reel Placeholder) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/hero-dark.webp" 
          alt="Cinematic Set" 
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      {/* Cinematic Gradient Overlay for Light Theme */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-background/20 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-5xl mx-auto mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <span className="text-primary tracking-[0.2em] text-sm uppercase font-medium mb-6 block">
            The Standard in Production
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-foreground leading-tight mb-6">
            Cinematic Mastery.<br />
            <span className="text-muted-foreground italic">Digital Excellence.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 text-balance font-light"
        >
          We unify premium media production and elite talent discovery within a single, seamless digital ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button href="/portfolio" size="lg" variant="primary">
            Explore Portfolio
          </Button>
          <Button href="/talent" size="lg" variant="outline">
            Discover Talent
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
