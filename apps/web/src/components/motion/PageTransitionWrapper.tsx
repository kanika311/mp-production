"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex-1 flex flex-col">{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
