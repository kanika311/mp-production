"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.65, 0, 0.35, 1] // Cinematic easing
      }}
    >
      {children}
    </motion.div>
  );
}
