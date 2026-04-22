"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
  label,
}: AnimatedCounterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useGSAP(
    () => {
      if (!containerRef.current || !counterRef.current || hasAnimated) return;

      const obj = { value: 0 };

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          setHasAnimated(true);
          gsap.to(obj, {
            value: target,
            duration,
            ease: "power2.out",
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = Math.round(
                  obj.value
                ).toLocaleString();
              }
            },
          });
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="text-center">
      <div className="text-5xl lg:text-6xl font-900 text-white mb-2">
        {prefix}
        <span ref={counterRef}>0</span>
        {suffix}
      </div>
      <p className="text-[#666666] text-sm font-500 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}
