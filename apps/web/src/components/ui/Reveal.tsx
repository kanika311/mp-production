'use client';

import { motion } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
}

export function Reveal({ children, direction = 'up', delay = 0, duration = 0.8, className = '' }: RevealProps) {
  let x = 0;
  let y = 0;

  switch (direction) {
    case 'up': y = 50; break;
    case 'down': y = -50; break;
    case 'left': x = 50; break;
    case 'right': x = -50; break;
    case 'none': break;
  }

  return (
    <motion.div
      className={`transform-gpu ${className}`}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ 
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
    >
      {children}
    </motion.div>
  );

}
