"use client";

import { useEffect, useRef, ReactNode } from "react";

export function ScrollRevealWrapper({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    const el = ref.current;
    if (el) {
      el.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale",
      ).forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
