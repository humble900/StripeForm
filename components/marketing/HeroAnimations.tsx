"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function HeroAnimations({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
