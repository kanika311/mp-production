'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LayoutPreloader() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('mp_preloaded') === '1') {
      return;
    }
    setIsLoading(true);

    // Cinematic progress simulation
    const duration = 2500;
    const interval = 30;
    let currentProgress = 0;
    
    const timer = setInterval(() => {
      currentProgress += (100 / (duration / interval));
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        try { sessionStorage.setItem('mp_preloaded', '1'); } catch {}
        setTimeout(() => setIsLoading(false), 500); // Wait a bit at 100%
      } else {
        setProgress(Math.floor(currentProgress));
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  if (!mounted || !isLoading) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden pointer-events-auto"
        >
          {/* Noise Overlay */}
          <div 
            className="absolute -inset-[200%] opacity-[0.06] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1620121478247-ec786b9be2fa?q=80&w=2532&auto=format&fit=crop")',
              backgroundSize: '150px',
              animation: 'noise-animation 0.3s steps(1) infinite',
            }}
          />
          
          {/* Scanlines effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10" />

          {/* Logo container */}
          <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-2xl px-6">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center mb-8 relative"
            >
              {/* Logo Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-r from-red-600/20 via-orange-500/10 to-red-600/20 blur-3xl rounded-full opacity-50 mix-blend-screen" />
              
              <img 
                src="/logo.webp" 
                alt="MP Productions" 
                className="h-32 md:h-48 object-contain drop-shadow-[0_0_15px_rgba(235,61,38,0.3)] relative z-10"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex items-center gap-4 w-full"
            >
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Progress Text */}
              <div className="flex items-end gap-1">
                <span className="text-4xl md:text-5xl font-mono text-white/90 tabular-nums tracking-tighter">
                  {progress.toString().padStart(3, '0')}
                </span>
                <span className="text-lg md:text-xl font-mono text-[#eb3d26] mb-1">%</span>
              </div>
              
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>

            {/* Loading Progress Bar Container */}
            <motion.div 
              className="w-full h-1 bg-white/5 mt-6 overflow-hidden relative"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            >
              {/* Animated Progress Bar */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-[#eb3d26] to-orange-500"
                style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
              >
                {/* Highlight gleam on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-6 text-xs md:text-sm uppercase tracking-[0.4em] text-white/40 font-mono"
            >
              Cinematic Media & Digital Management
            </motion.div>
          </div>
          
          {/* Heavy Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_80%,rgba(0,0,0,1)_100%)] z-10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
