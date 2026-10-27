'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
}

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  let translateClass = '';
  if (!hasAnimated) {
    switch (direction) {
      case 'up':
        translateClass = 'sm:translate-y-4';
        break;
      case 'down':
        translateClass = 'sm:-translate-y-4';
        break;
      case 'left':
        translateClass = 'sm:translate-x-4';
        break;
      case 'right':
        translateClass = 'sm:-translate-x-4';
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all ease-out transform-gpu ${className} ${
        hasAnimated ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-100 ${translateClass}`
      }`}
      style={{
        transitionDelay: `${delay}s`,
        transitionDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}
